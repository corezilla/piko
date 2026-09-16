#!/usr/bin/env python3
"""Validate the Piko V0.3 finalization candidate without claiming runtime evidence."""

from __future__ import annotations

import json
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parents[2]
SCHEMA_PATH = ROOT / "interfaces/schemas/agent-runtime-v0.3.schema.json"
OPENAPI_PATH = ROOT / "interfaces/openapi/agent-runtime-openapi-v0.3.yaml"
ERROR_PATH = ROOT / "interfaces/error-codes/error-blocker-catalog-v0.3.json"
FIXTURE_PATH = ROOT / "interfaces/vectors/v0.3/lightweight-runtime-finalization-fixtures.json"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def resolve_pointer(document: object, fragment: str) -> object:
    current = document
    if not fragment:
        return current
    assert fragment.startswith("/"), fragment
    for raw in fragment[1:].split("/"):
        part = raw.replace("~1", "/").replace("~0", "~")
        current = current[int(part)] if isinstance(current, list) else current[part]
    return current


def walk_refs(node: object) -> list[str]:
    refs: list[str] = []
    if isinstance(node, dict):
        if isinstance(node.get("$ref"), str):
            refs.append(node["$ref"])
        for value in node.values():
            refs.extend(walk_refs(value))
    elif isinstance(node, list):
        for value in node:
            refs.extend(walk_refs(value))
    return refs


schema = load_json(SCHEMA_PATH)
errors = load_json(ERROR_PATH)
fixtures = load_json(FIXTURE_PATH)
openapi = yaml.safe_load(OPENAPI_PATH.read_text(encoding="utf-8"))

Draft202012Validator.check_schema(schema)

for reference in walk_refs(openapi):
    target_path, separator, fragment = reference.partition("#")
    target = openapi if not target_path else load_json((OPENAPI_PATH.parent / target_path).resolve())
    resolve_pointer(target, fragment if separator else "")

validated = 0
for case in fixtures["schema_cases"]:
    definition = {
        "$schema": schema["$schema"],
        "$defs": schema["$defs"],
        "$ref": f"#/$defs/{case['schema']}",
    }
    failures = list(Draft202012Validator(definition).iter_errors(case["value"]))
    if case["valid"] and failures:
        raise AssertionError(f"{case['id']} expected valid: {failures[0].message}")
    if not case["valid"] and not failures:
        raise AssertionError(f"{case['id']} expected invalid")
    validated += 1

expected_paths = {
    "/runs", "/runs/{run_id}", "/runs/{run_id}/result", "/runs/{run_id}:cancel",
    "/operator/matrix-transport-profile", "/operator/matrix-transport-profile:probe",
    "/projects/{project_ref}/agent-communication-bindings/{agent_binding_ref}",
    "/projects/{project_ref}/session-agent-bindings/{session_binding_ref}",
    "/projects/{project_ref}/session-agent-bindings/{session_binding_ref}:revoke",
    "/projects/{project_ref}/session-agent-bindings/{session_binding_ref}/drain",
    "/projects/{project_ref}/session-agent-bindings/{session_binding_ref}/messages",
    "/projects/{project_ref}/session-agent-bindings/{session_binding_ref}/messages/{sid}",
    "/projects/{project_ref}/session-agent-bindings/{session_binding_ref}/ingress-events/{matrix_event_id}",
}
assert set(openapi["paths"]) == expected_paths

for retired in fixtures["retired_contract_assertions"]["removed_paths"]:
    assert retired not in openapi["paths"], retired

request_properties = set(schema["$defs"]["AgentTaskRequest"]["properties"])
result_properties = set(schema["$defs"]["AgentResult"]["properties"])
for retired in fixtures["retired_contract_assertions"]["removed_request_fields"]:
    assert retired not in request_properties, retired
for retired in fixtures["retired_contract_assertions"]["removed_result_fields"]:
    assert retired not in result_properties, retired

error_codes = {item["code"] for item in errors["errors"]}
required_errors = {
    "InvalidBindingCombination", "BindingNotFound", "CommunicationBindingMismatch",
    "CommunicationTriggerNotFound", "CommunicationTriggerMismatch",
    "CommunicationTriggerUnavailable", "IdempotencyConflict", "ClientTaskConflict",
    "RunNotTerminal", "ResourceVersionMismatch", "CapacityUnavailable",
    "ResultUnavailable", "Gone", "MessageIdConflict", "ReplyTopicMismatch",
    "MessageRecipientInvalid", "MessageAttachmentInvalid", "UnsupportedMessageVersion",
    "MessageNotDispatchEligible",
}
missing = required_errors - error_codes
assert not missing, sorted(missing)

semantics = {case["id"]: case for case in fixtures["semantic_cases"]}
assert semantics["same-event-two-agents"]["expected"] == "two legal Runs with two explicit dispatch/task pairs"
assert semantics["same-event-same-agent-two-explicit-tasks"]["expected"] == "two legal Runs with distinct dispatch_ref and client_task_id"
assert semantics["same-dispatch-changed-event-session-or-agent"]["expected_error"] == "CommunicationTriggerMismatch"
assert semantics["same-task-new-dispatch"]["expected_error"] == "ClientTaskConflict"
assert semantics["trigger-deadline-wins"]["expected_error"] == "DeadlineExpired"
assert semantics["cancel-receipt-not-release"]["execution_released"] is False
assert semantics["release-with-isolated-unknown-obligation"]["session_close_allowed"] is False
assert semantics["per-binding-left-human-stays"]["human_membership"] == "Joined"
assert semantics["model-request-deadline-before-task"]["new_agent_steps"] == 0
assert semantics["service-effective-deadline-before-request"]["late_success"] == "EvidenceOnly"

assert "bindings" not in request_properties
for required in ("agent_binding_ref", "session_binding_ref", "expected_session_binding_version"):
    assert required in schema["$defs"]["AgentTaskRequest"]["required"], required

contract_text = (ROOT / "docs/60_interfaces/contracts/piko-agent-runtime-contract-v0.3.md").read_text(encoding="utf-8")
field_text = (ROOT / "docs/60_interfaces/contracts/piko-v0.3-field-usage.md").read_text(encoding="utf-8")
for required in ("0.3.0-finalization.2", "communication_trigger", "execution_released", "7d"):
    assert required in contract_text or required in field_text, required

print(
    f"OK: schema cases={validated}, semantic cases={len(semantics)}, "
    f"paths={len(expected_paths)}, errors={len(error_codes)}, retired surface absent"
)
