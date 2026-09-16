#!/usr/bin/env python3
"""Validate the Piko V0.3 finalization candidate without claiming runtime evidence."""

from __future__ import annotations

import json
import hashlib
import struct
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator, FormatChecker


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
assert schema["x-contract-version"] == "0.3.0-finalization.8"
assert openapi["info"]["version"] == "0.3.0-finalization.8"
assert fixtures["fixture_version"] == "0.3.0-finalization.8"
assert errors["catalog_version"] == "agent-runtime-errors/v0.3-finalization.8"

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
    failures = list(Draft202012Validator(definition, format_checker=FormatChecker()).iter_errors(case["value"]))
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
    "/projects/{project_ref}/session-agent-bindings/{session_binding_ref}/contents",
    "/projects/{project_ref}/session-agent-bindings/{session_binding_ref}/messages/{sid}",
    "/projects/{project_ref}/session-agent-bindings/{session_binding_ref}/messages/{sid}/attachments/{attachment_id}",
    "/projects/{project_ref}/session-agent-bindings/{session_binding_ref}/ingress-events/{matrix_event_id}",
}
assert set(openapi["paths"]) == expected_paths

assert "410" in openapi["paths"]["/runs"]["post"]["responses"]
for path, operations in openapi["paths"].items():
    for method, operation in operations.items():
        if method == "parameters" or method not in {"get", "post", "put", "delete", "patch"}:
            continue
        responses = operation["responses"]
        assert "401" in responses, (path, method, "401")
        assert "403" in responses, (path, method, "403")
        if method == "get" and "200" in responses:
            assert "ETag" in responses["200"].get("headers", {}), (path, "ETag")

for path in (
    "/operator/matrix-transport-profile",
    "/projects/{project_ref}/agent-communication-bindings/{agent_binding_ref}",
    "/projects/{project_ref}/session-agent-bindings/{session_binding_ref}",
):
    responses = openapi["paths"][path]["put"]["responses"]
    for status in ("200", "201"):
        assert "ETag" in responses[status]["headers"], (path, status, "ETag")
    for status in ("400", "401", "403", "404", "409", "412", "428"):
        assert status in responses, (path, status)

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
    "InvalidPreconditionCombination", "PreconditionRequired",
    "ContentTooLarge", "ContentIntegrityMismatch", "ContentAlreadyBound",
    "ContentViewerNotAuthorized", "ContentRedacted", "ContentExpired",
}
missing = required_errors - error_codes
assert not missing, sorted(missing)
assert "先比较digest" in errors["rules"]["authorization_before_replay"]
assert "不产生202 receipt" in errors["rules"]["retryable_rejection"]

semantics = {case["id"]: case for case in fixtures["semantic_cases"]}
assert semantics["same-event-two-agents"]["expected"] == "two legal Runs with two explicit dispatch/task pairs"
assert semantics["same-event-same-agent-two-explicit-tasks"]["expected"] == "two legal Runs with distinct dispatch_ref and client_task_id"
assert semantics["same-dispatch-changed-event-session-or-agent"]["expected_error"] == "CommunicationTriggerMismatch"
assert semantics["same-task-new-dispatch"]["expected_error"] == "ClientTaskConflict"
assert semantics["trigger-deadline-wins"]["expected_error"] == "DeadlineExpired"
for case_id in ("same-key-changed-instruction", "same-key-changed-deadline", "same-key-changed-trigger"):
    assert semantics[case_id]["expected_error"] == "IdempotencyConflict"
    assert semantics[case_id]["original_202_returned"] is False
assert semantics["trigger-rejection-decision-expired-digest-retained"]["same_key_changed_body"] == "409 IdempotencyConflict"
assert semantics["trigger-rejection-decision-expired-digest-retained"]["digest_binding_retained_through"] == "max(request.deadline_at,decision_first_created_at)+7d"
assert semantics["trigger-rejection-decision-expired-digest-retained"]["reevaluation_advances_first_created_at"] is False
for case_id in (
    "two-keys-same-task-same-dispatch-concurrent-reevaluation",
    "two-keys-same-task-different-dispatch-concurrent-reevaluation",
):
    assert semantics[case_id]["loser_error"] == "ClientTaskConflict"
    assert semantics[case_id]["new_run_count"] == 1
    assert semantics[case_id]["new_dispatch_intent_count"] == 1
    assert semantics[case_id]["new_claim_count"] == 1
    assert "ClientTaskIndex" in semantics[case_id]["transaction_rechecks"]
    assert "TriggerDispatchIndex" in semantics[case_id]["transaction_rechecks"]
assert semantics["cancel-receipt-not-release"]["execution_released"] is False
assert semantics["release-with-isolated-unknown-obligation"]["session_close_allowed"] is False
assert semantics["per-binding-left-human-stays"]["human_membership"] == "Joined"
assert semantics["model-request-deadline-before-task"]["new_agent_steps"] == 0
assert semantics["service-effective-deadline-before-request"]["late_success"] == "EvidenceOnly"
assert semantics["put-precondition-missing"]["expected_status"] == 428
assert semantics["put-precondition-both"]["expected_error"] == "InvalidPreconditionCombination"
assert semantics["put-precondition-update-missing-resource"]["expected_status"] == 404
assert semantics["put-precondition-update-missing-resource"]["created"] is False
assert semantics["matrix-native-without-extension"]["dispatch_eligible"] is False
assert semantics["matrix-malformed-product-extension"]["classification_status"] == "Rejected"
assert semantics["matrix-raw-to-controlled-projection-with-unsigned"]["dispatch_eligible"] is True
assert semantics["matrix-raw-sender-mismatch"]["classification_status"] == "Rejected"
assert semantics["matrix-raw-room-mismatch"]["classification_status"] == "Rejected"
assert semantics["content-upload-integrity-mismatch"]["content_ref_created"] is False
assert semantics["content-upload-too-large"]["expected_status"] == 413
assert semantics["content-single-message-binding-race"]["loser_error"] == "ContentAlreadyBound"
assert semantics["content-read-authorized"]["browser_has_piko_credential"] is False
assert semantics["content-read-viewer-not-member"]["expected_status"] == 403
assert semantics["content-retention"]["unknown_obligation_deleted"] is False
assert semantics["content-retention"]["tombstone_clock_started"] is False
assert semantics["content-upload-conflict-precedes-integrity"]["expected_error"] == "IdempotencyConflict"
assert semantics["content-upload-conflict-precedes-integrity"]["integrity_error_returned"] is False
assert semantics["content-read-viewer-not-member"]["not_modified_returned"] is False
assert semantics["content-read-redacted-with-matching-etag"]["expected_error"] == "ContentRedacted"
assert semantics["content-read-expired-with-matching-etag"]["expected_error"] == "ContentExpired"
assert semantics["content-read-at-tombstone-boundary"]["expected_status"] == 404
assert semantics["content-read-authorized-matching-etag"]["expected_status"] == 304
assert semantics["content-retention-after-blocker-clears"]["at_boundary"]["status"] == 404

golden = semantics["content-upload-digest-golden"]
metadata_bytes = golden["canonical_metadata_utf8"].encode("utf-8")
content_bytes = bytes.fromhex(golden["content_hex"])
content_hash = hashlib.sha256(content_bytes).digest()
preimage = b"piko-content-upload-digest-v1\x00" + struct.pack(">Q", len(metadata_bytes)) + metadata_bytes + content_hash
assert len(metadata_bytes) == golden["canonical_metadata_length"]
assert content_hash.hex() == golden["actual_content_sha256_hex"]
assert preimage.hex() == golden["combined_preimage_hex"]
assert hashlib.sha256(preimage).hexdigest() == golden["logical_digest"]

assert "bindings" not in request_properties
for required in ("agent_binding_ref", "session_binding_ref", "expected_session_binding_version"):
    assert required in schema["$defs"]["AgentTaskRequest"]["required"], required

contract_text = (ROOT / "docs/60_interfaces/contracts/piko-agent-runtime-contract-v0.3.md").read_text(encoding="utf-8")
field_text = (ROOT / "docs/60_interfaces/contracts/piko-v0.3-field-usage.md").read_text(encoding="utf-8")
for required in ("0.3.0-finalization.8", "communication_trigger", "execution_released", "decision_first_created_at"):
    assert required in contract_text or required in field_text, required

print(
    f"OK: schema cases={validated}, semantic cases={len(semantics)}, "
    f"paths={len(expected_paths)}, errors={len(error_codes)}, retired surface absent"
)
