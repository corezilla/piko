#!/usr/bin/env python3
"""校验 Piko v0.3 Matrix/Element 评审契约与代表性正负样例。"""

from __future__ import annotations

import json
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator
from referencing import Registry, Resource


ROOT = Path(__file__).resolve().parents[2]
SCHEMA_PATH = ROOT / "interfaces/schemas/agent-runtime-matrix-v0.3.schema.json"
BASE_SCHEMA_PATH = ROOT / "interfaces/schemas/agent-runtime-v0.2.schema.json"
OPENAPI_PATH = ROOT / "interfaces/openapi/agent-runtime-matrix-openapi-v0.3.yaml"
ERROR_PATH = ROOT / "interfaces/error-codes/error-blocker-catalog-v0.3.json"
FIXTURE_PATH = ROOT / "interfaces/vectors/v0.3/collaboration-decision-fixtures.json"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def resolve_pointer(document: object, fragment: str) -> object:
    current = document
    if not fragment:
        return current
    if not fragment.startswith("/"):
        raise AssertionError(f"不支持的 JSON Pointer：#{fragment}")
    for raw_part in fragment[1:].split("/"):
        part = raw_part.replace("~1", "/").replace("~0", "~")
        current = current[int(part)] if isinstance(current, list) else current[part]
    return current


def walk_refs(node: object) -> list[str]:
    found: list[str] = []
    if isinstance(node, dict):
        if isinstance(node.get("$ref"), str):
            found.append(node["$ref"])
        for value in node.values():
            found.extend(walk_refs(value))
    elif isinstance(node, list):
        for value in node:
            found.extend(walk_refs(value))
    return found


schema = load_json(SCHEMA_PATH)
base_schema = load_json(BASE_SCHEMA_PATH)
errors = load_json(ERROR_PATH)
fixtures = load_json(FIXTURE_PATH)
openapi = yaml.safe_load(OPENAPI_PATH.read_text(encoding="utf-8"))

Draft202012Validator.check_schema(schema)
Draft202012Validator.check_schema(base_schema)
registry = (
    Registry()
    .with_resource(schema["$id"], Resource.from_contents(schema))
    .with_resource(base_schema["$id"], Resource.from_contents(base_schema))
)

for reference in walk_refs(openapi):
    target_path, separator, fragment = reference.partition("#")
    if not target_path:
        target_document = openapi
    else:
        target_document = load_json((OPENAPI_PATH.parent / target_path).resolve())
    resolve_pointer(target_document, fragment if separator else "")

schema_case_by_id = {case["id"]: case for case in fixtures["schema_cases"]}
validated = 0
for case in fixtures["schema_cases"]:
    validator = Draft202012Validator(
        {"$ref": f"{schema['$id']}#/$defs/{case['schema']}"},
        registry=registry,
    )
    failures = list(validator.iter_errors(case["value"]))
    if case["valid"] and failures:
        raise AssertionError(f"{case['id']} 应通过，但失败：{failures[0].message}")
    if not case["valid"] and not failures:
        raise AssertionError(f"{case['id']} 应失败，但通过")
    validated += 1

for case in fixtures["schema_cases"]:
    expected = case.get("expected_participant_ir_ids")
    if expected is None:
        continue
    value = case["value"]
    summary = value.get("collaboration_resolution_summary", value)
    actual = [item["participant_ir_ref"]["ir_id"] for item in summary["participant_positions"]]
    if sorted(actual) != sorted(expected):
        raise AssertionError(f"{case['id']} participant set 不匹配")

for case in fixtures["semantic_cases"]:
    if case["id"] == "resolution-participant-set-mismatch-negative":
        source = schema_case_by_id[case["schema_case_id"]]["value"]
        actual = [item["participant_ir_ref"]["ir_id"] for item in source["participant_positions"]]
        if sorted(actual) == sorted(case["expected_participant_ir_ids"]):
            raise AssertionError("负向 participant set fixture 未形成不匹配")
    elif case["id"] == "exact-room-descriptor-source-unavailable":
        if case["expected_http_status"] != 503 or case["expected_error"] != "ElementConversationSourceUnavailable":
            raise AssertionError("descriptor source unavailable fixture 未固定 typed 503")
        if not {"transcript", "iframe", "token_url", "login_proxy"}.issubset(case["fallback_forbidden"]):
            raise AssertionError("descriptor source unavailable fixture 未完整禁止降级")

multi_room_items = schema_case_by_id["multi-room-page-positive"]["value"]["items"]
session_ids = [item["collaboration_session_id"] for item in multi_room_items]
if len(session_ids) != len(set(session_ids)) or len(session_ids) < 2:
    raise AssertionError("multi-room fixture 未包含至少两个唯一 Session")
sort_keys = [(item["last_message_at"] or "", item["collaboration_session_id"]) for item in multi_room_items]
if sort_keys != sorted(sort_keys, key=lambda item: (item[0], item[1]), reverse=True):
    raise AssertionError("multi-room fixture 不符合声明的稳定顺序")

list_operation = openapi["paths"]["/projects/{project_id}/collaboration-sessions"]["get"]
parameter_refs = {item["$ref"] for item in list_operation["parameters"]}
for name in ("CollaborationSessionStatus", "FilterIrId", "FilterWorkExecutionId", "FilterAgentRunId"):
    if f"#/components/parameters/{name}" not in parameter_refs:
        raise AssertionError(f"缺少 list filter：{name}")

element_get = openapi["paths"]["/projects/{project_id}/collaboration-sessions/{collaboration_session_id}/element-view"]["get"]
if element_get["responses"]["503"]["$ref"] != "#/components/responses/ElementConversationSourceUnavailable":
    raise AssertionError("element-view 503 未绑定 typed source unavailable error")
binding_put = openapi["paths"]["/projects/{project_id}/ir-communication-bindings/{ir_id}"]["put"]
if binding_put["responses"]["503"]["$ref"] != "#/components/responses/ApiError":
    raise AssertionError("Binding 503 错误绑定了 Element descriptor 专用错误")

if openapi["x-agent-task-result-schema"]["$ref"] != "../schemas/agent-runtime-matrix-v0.3.schema.json#/$defs/AgentTaskResultV03":
    raise AssertionError("OpenAPI 未公开 AgentTaskResultV03")

summary_properties = set(schema["$defs"]["CollaborationSessionSummary"]["properties"])
for forbidden in ("stage", "planned_work", "room_attention", "participant_action_request", "matrix_message_body", "transcript"):
    if forbidden in summary_properties:
        raise AssertionError(f"Session summary 越权字段：{forbidden}")

error_codes = {item["code"] for item in errors["matrix_api_errors"]}
required_codes = {
    "InvalidCollaborationSessionCursor",
    "InvalidCollaborationSessionFilter",
    "ElementConversationSourceUnavailable",
    "CollaborationResolutionInvalid",
    "CollaborationResolutionAuthorityViolation",
}
missing_codes = required_codes - error_codes
if missing_codes:
    raise AssertionError(f"缺少 typed errors：{sorted(missing_codes)}")

print(f"OK: {validated} 个 Schema fixture、2 个语义 fixture、OpenAPI $ref/filter/typed error 与 authority 边界通过")
