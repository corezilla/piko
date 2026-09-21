#!/usr/bin/env python3
"""Executable static/semantic validation for Piko simplified v0.3."""

from __future__ import annotations

import copy
import json
import re
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[2]
SCHEMA_PATH = ROOT / "interfaces/schemas/agent-runtime-v0.3.schema.json"
OPENAPI_PATH = ROOT / "interfaces/openapi/agent-runtime-openapi-v0.3.yaml"
ERROR_PATH = ROOT / "interfaces/error-codes/error-blocker-catalog-v0.3.json"
FIXTURE_PATH = ROOT / "interfaces/vectors/v0.3/lightweight-runtime-finalization-fixtures.json"
CONFIG_PATH = ROOT / "interfaces/schemas/piko-runtime-config-v0.3.schema.json"
TOOL_PROFILE_PATH = ROOT / "interfaces/schemas/piko-tool-profile-v0.3.schema.json"
PATCH_MANIFEST_PATH = ROOT / "config/pi-adapter-patch-manifest.json"

schema = json.loads(SCHEMA_PATH.read_text())
openapi = yaml.safe_load(OPENAPI_PATH.read_text())
catalog = json.loads(ERROR_PATH.read_text())
fixtures = json.loads(FIXTURE_PATH.read_text())
config_schema = json.loads(CONFIG_PATH.read_text())
tool_profile_schema = json.loads(TOOL_PROFILE_PATH.read_text())
patch_manifest = json.loads(PATCH_MANIFEST_PATH.read_text())

VERSION = "0.3.0-simplified.6"
assert schema["x-contract-version"] == VERSION
assert openapi["info"]["version"] == VERSION
assert fixtures["fixture_version"] == VERSION
assert catalog["catalog_version"] == f"agent-runtime-errors/{VERSION}"
assert set(openapi["paths"]) == {
    "/runs", "/runs/{run_id}", "/runs/{run_id}:cancel", "/runs/{run_id}/result"
}

validator = Draft202012Validator(schema, format_checker=FormatChecker())
config_validator = Draft202012Validator(config_schema, format_checker=FormatChecker())
tool_profile_validator = Draft202012Validator(tool_profile_schema, format_checker=FormatChecker())
assert set(schema["$defs"]["TokenUsage"]["x-semantic-invariants"]) == {
    "usage_observed_attempts <= model_attempts",
    "Complete implies usage_observed_attempts == model_attempts",
    "total_tokens == input_tokens + output_tokens when all are known",
    "cache_read_tokens and cache_write_tokens do not exceed input_tokens when known",
    "reasoning_tokens does not exceed output_tokens when known",
}

config_example = {
    "instance_id": "piko-main", "listen": {"host": "127.0.0.1", "port": 8443},
    "api_auth": {"mode": "bearer", "principal_id": "slinky-main", "bearer_token_secret_ref": "env:PIKO_SLINKY_TOKEN"},
    "task_store": {"sqlite_path": "/var/lib/piko/tasks.db", "busy_timeout_ms": 5000},
    "pi": {"version": "0.85.1", "commit": "9767ba275f3e9a5ee0f5c5342249b629ab1b2282", "session_root": "/var/lib/piko/pi", "adapter_patch_manifest_path": "/etc/piko/pi-patches.json", "adapter_patch_sha256": "a" * 64},
    "agent": {"model": "coding-standard", "profile_ref": "agent:default"},
    "workspace": {"roots": {"approved": "/srv/piko/workspaces"}, "staging_root": "/var/lib/piko/staging"},
    "tools": {"profile_registry_path": "/etc/piko/tools.json"},
    "matrix": {"enabled": False},
    "llmtier": {"base_url": "https://llmtier.example/v1", "api_key_secret_ref": "vault:llmtier/key", "models_timeout_ms": 5000},
    "queue": {"capacity": 100}, "retention": {"minimum_query_days": 7},
    "observability": {"log_level": "info", "metrics_enabled": True},
}
config_validator.validate(config_example)
loopback_config = copy.deepcopy(config_example)
loopback_config["llmtier"]["base_url"] = "http://127.0.0.1:8180/v1/"
config_validator.validate(loopback_config)
enabled_matrix = copy.deepcopy(config_example)
enabled_matrix["matrix"] = {"enabled": True, "homeserver": "https://matrix.example", "user_id": "@piko:example", "access_token_secret_ref": "vault:matrix/token", "sync_timeout_ms": 30000, "max_media_bytes": 1048576, "allowed_mime_types": ["text/plain"]}
config_validator.validate(enabled_matrix)
for invalid_config in (
    {**config_example, "api_auth": {"mode": "bearer", "principal_id": "slinky-main", "bearer_token_secret_ref": "plaintext-secret"}},
    {key: value for key, value in config_example.items() if key != "api_auth"},
    {**config_example, "matrix": {"enabled": True}},
    {**config_example, "llmtier": {**config_example["llmtier"], "base_url": "ftp://192.168.1.8:8180/v1/"}},
):
    assert list(config_validator.iter_errors(invalid_config))

tool_profiles = {"profile_version": "0.3", "recovery_contracts": {
    "matrix:txn-id": {"kind": "stable_deduplication", "implementation_ref": "builtin:matrix-txn"}
}, "profiles": {"tools:review": {"tools": {
    "read_file": {"effect": "read_only", "replay": "safe", "permissions": {"read_paths": ["inputs"]}},
    "publish": {"effect": "external", "replay": "safe", "recovery_contract_ref": "matrix:txn-id", "permissions": {"network_hosts": ["matrix.example:443"]}},
    "shell": {"effect": "process", "replay": "never", "permissions": {"executables": ["rg"]}}
}}}}
tool_profile_validator.validate(tool_profiles)
unsafe_safe_profile = copy.deepcopy(tool_profiles)
del unsafe_safe_profile["profiles"]["tools:review"]["tools"]["publish"]["recovery_contract_ref"]
assert list(tool_profile_validator.iter_errors(unsafe_safe_profile))


def validate_tool_registry(value: dict, implementations: set[str]) -> None:
    contracts = value["recovery_contracts"]
    assert all(contract["implementation_ref"] in implementations for contract in contracts.values())
    for profile in value["profiles"].values():
        for policy in profile["tools"].values():
            ref = policy.get("recovery_contract_ref")
            if ref is not None:
                assert ref in contracts


validate_tool_registry(tool_profiles, {"builtin:matrix-txn"})
unbound_profile = copy.deepcopy(tool_profiles)
unbound_profile["profiles"]["tools:review"]["tools"]["publish"]["recovery_contract_ref"] = "missing:contract"
try:
    validate_tool_registry(unbound_profile, {"builtin:matrix-txn"})
except AssertionError:
    pass
else:
    raise AssertionError("unbound recovery contract accepted")
by_id = {case["id"]: case["value"] for case in fixtures["positive"]}
for case in fixtures["positive"]:
    validator.evolve(schema=schema["$defs"][case["schema"]]).validate(case["value"])


def set_path(value: dict, path: str, replacement: object) -> None:
    current: object = value
    tokens = re.findall(r"[^.\[\]]+|\d+", path)
    for index, token in enumerate(tokens):
        if index == len(tokens) - 1:
            if isinstance(current, list):
                current[int(token)] = replacement
            else:
                current[token] = replacement
            return
        if isinstance(current, list):
            current = current[int(token)]
        else:
            current = current[token]
    raise AssertionError(path)


for case in fixtures["negative"]:
    mutated = copy.deepcopy(by_id[case["base"]])
    if "mutation" in case:
        mutated.update(case["mutation"])
    else:
        set_path(mutated, case["mutation_path"], case["mutation_value"])
    errors = list(validator.evolve(schema=schema["$defs"][case["schema"]]).iter_errors(mutated))
    assert errors, f"negative fixture accepted: {case['id']}"


def validate_usage(value: dict) -> None:
    usage = value["usage"]
    primary = ("input_tokens", "output_tokens", "total_tokens")
    optional = ("cache_read_tokens", "cache_write_tokens", "reasoning_tokens")
    fields = primary + optional
    assert usage["usage_observed_attempts"] <= usage["model_attempts"]
    if usage["quality"] == "Complete":
        assert all(isinstance(usage[name], int) for name in fields)
        assert usage["usage_observed_attempts"] == usage["model_attempts"]
        assert usage["total_tokens"] == usage["input_tokens"] + usage["output_tokens"]
        assert usage["cache_read_tokens"] <= usage["input_tokens"]
        assert usage["cache_write_tokens"] <= usage["input_tokens"]
        assert usage["reasoning_tokens"] <= usage["output_tokens"]
        assert not usage["missing_fields"]
    elif usage["quality"] == "Partial":
        assert usage["usage_observed_attempts"] > 0
        assert usage["missing_fields"]
        assert any(isinstance(usage[name], int) for name in fields)
        for name in fields:
            assert (usage[name] is None) == (name in usage["missing_fields"])
        if all(isinstance(usage[name], int) for name in primary):
            assert usage["total_tokens"] == usage["input_tokens"] + usage["output_tokens"]
        if usage["cache_read_tokens"] is not None and usage["input_tokens"] is not None:
            assert usage["cache_read_tokens"] <= usage["input_tokens"]
        if usage["cache_write_tokens"] is not None and usage["input_tokens"] is not None:
            assert usage["cache_write_tokens"] <= usage["input_tokens"]
        if usage["reasoning_tokens"] is not None and usage["output_tokens"] is not None:
            assert usage["reasoning_tokens"] <= usage["output_tokens"]
    else:
        assert all(usage[name] is None for name in fields)
        assert set(fields) == set(usage["missing_fields"])


for case in fixtures["positive"]:
    if case["schema"] == "AgentResult":
        validate_usage(case["value"])

for case in fixtures["usage_semantic_negative"]:
    try:
        validate_usage({"usage": case["value"]})
    except AssertionError:
        pass
    else:
        raise AssertionError(f"semantic usage negative accepted: {case['id']}")

partial_all_unknown = copy.deepcopy(by_id["completed-unknown-usage"]["usage"])
partial_all_unknown["quality"] = "Partial"
assert list(validator.evolve(schema=schema["$defs"]["TokenUsage"]).iter_errors(partial_all_unknown))

failed_without_start = copy.deepcopy(by_id["queued-run"])
failed_without_start.update({"state": "Failed", "finished_at": "2026-09-17T10:01:00Z", "result_available": True})
assert list(validator.evolve(schema=schema["$defs"]["RunView"]).iter_errors(failed_without_start))


def aggregate_usage(attempts: list[dict]) -> dict:
    fields = ("input_tokens", "output_tokens", "total_tokens", "cache_read_tokens", "cache_write_tokens", "reasoning_tokens")
    aggregate = {
        name: sum(attempt[name] for attempt in attempts) if all(name in attempt for attempt in attempts) else None
        for name in fields
    }
    complete_count = sum(aggregate[name] is not None for name in fields)
    aggregate.update({
        "source": "PiModelResponses",
        "quality": "Complete" if complete_count == len(fields) else "Partial" if complete_count else "Unknown",
        "model_attempts": len(attempts),
        "usage_observed_attempts": sum(bool(attempt) for attempt in attempts),
        "missing_fields": [name for name in fields if aggregate[name] is None],
    })
    return aggregate


for case in fixtures["usage_aggregation_oracles"]:
    actual = aggregate_usage(case["attempts"])
    assert actual == case["expected"], (case["id"], actual)
    validate_usage({"usage": actual})

# OpenAPI response mappings are machine-equal to the error catalog.
responses = openapi["components"]["responses"]
for path_item in openapi["paths"].values():
    for operation in path_item.values():
        op_id = operation["operationId"]
        actual: dict[str, list[str]] = {}
        for status, response in operation["responses"].items():
            if int(status) < 400:
                continue
            name = response["$ref"].rsplit("/", 1)[-1]
            error_response = responses[name]
            if "$ref" in error_response:
                nested = error_response["$ref"].rsplit("/", 1)[-1]
                error_response = openapi["components"]["x-error-responses"][nested]
            actual[status] = error_response["x-error-codes"]
        assert actual == catalog["operation_status_codes"][op_id], (op_id, actual)

catalog_codes = {item["code"] for item in catalog["errors"]}
schema_codes = set(schema["$defs"]["RequestErrorCode"]["enum"])
assert catalog_codes == schema_codes

# External references point only to existing schemas in the single machine contract.
machine = OPENAPI_PATH.read_text()
for ref in re.findall(r"\.\./schemas/agent-runtime-v0\.3\.schema\.json#/\$defs/([A-Za-z0-9_]+)", machine):
    assert ref in schema["$defs"], ref

request_props = schema["$defs"]["AgentTaskRequest"]["properties"]
assert "model" not in request_props
assert "task_id" in request_props
assert "client_task_id" not in request_props
assert set(request_props["discussion"]["$ref"].split("/")[-1:]) == {"DiscussionContext"}

all_machine = "\n".join((OPENAPI_PATH.read_text(), SCHEMA_PATH.read_text(), ERROR_PATH.read_text(), CONFIG_PATH.read_text(), TOOL_PROFILE_PATH.read_text())).lower()
for forbidden in (
    "sourceinstance", "source_instance", "execution-capacity", "execution_claim",
    "session_binding_ref", "communication_trigger", "content_ref", "tier seat",
    "retryable_by_same_run", "unsupportedmodel", "capacityunavailable",
    "idempotency-key", "idempotencyconflict", "clienttaskconflict", "client_task_id",
    "runtime_activation",
):
    assert forbidden not in all_machine, forbidden

# Verify the pinned Pi AgentHarness implementation evidence and streaming surface.
harness = (ROOT / "upstream/pi/packages/agent/src/harness/agent-harness.ts").read_text()
generation = (ROOT / "upstream/pi/packages/agent/src/harness/runtime/drive/generation.ts").read_text()
tools_drive = (ROOT / "upstream/pi/packages/agent/src/harness/runtime/drive/tools.ts").read_text()
agent_types = (ROOT / "upstream/pi/packages/agent/src/types.ts").read_text()
responses = (ROOT / "upstream/pi/packages/ai/src/api/openai-responses.ts").read_text()
responses_shared = (ROOT / "upstream/pi/packages/ai/src/api/openai-responses-shared.ts").read_text()
piko_runtime = (ROOT / "src/pi-runtime.ts").read_text()
assert "export interface AgentHarness" in harness and "export const AgentHarness" in harness and "operationId" in harness
assert generation.index("await publishGenerationIntent") < generation.index("await performGeneration")
assert "lane.models.streamSimple" in generation and 'at: "assistant.effect_pending"' in generation
assert tools_drive.index("await publishToolIntent") < tools_drive.index("performToolInvocation", tools_drive.index("await publishToolIntent"))
assert 'replay?: "never" | "safe"' in agent_types
assert 'tool?.replay === "safe"' in tools_drive
assert "stream: true" in responses and "store: false" in responses
for event_name in fixtures["pi_streaming_surface"]["required_events"]:
    assert event_name in responses_shared or event_name == "error", event_name
assert 'type: "function_call_output"' in responses_shared
assert fixtures["pi_streaming_surface"]["request"]["supports_explicit_prompt_cache_mode"] is False
assert 'cacheRetention:"none"' in piko_runtime
assert "options?.onRawUsage?.(response.usage)" in responses_shared
simple_options = (ROOT / "upstream/pi/packages/ai/src/api/simple-options.ts").read_text()
assert "onRawUsage: options?.onRawUsage" in simple_options
assert "normalizeRawUsage(usage)" in piko_runtime
assert {item["id"] for item in patch_manifest["additive_changes"]} >= {"PK-PI-STEP-ID", "PK-PI-RAW-USAGE"}
assert "${workspace}" not in piko_runtime
assert "reasoning{id,encrypted_content,summary,content}" in fixtures["pi_streaming_surface"]["complete_history_items"]

oracle_ids = {item["id"] for item in fixtures["semantic_oracles"]}
assert {
    "same-agent-serialization", "post-event-stream-failure", "unknown-tool-side-effect",
    "queued-cancel-atomic", "raw-usage-before-normalization", "late-usage-after-result",
    "matrix-cursor-commit-order", "matrix-self-echo", "preflight-no-inference",
    "matrix-turn-before-harness-enqueue", "matrix-turn-after-harness-enqueue",
    "matrix-discussion-normal-completion", "usage-one-attempt-without-usage",
    "usage-fields-missing-on-different-attempts",
    "opaque-reasoning-replay", "explicit-cache-disabled", "idle-room-event",
    "result-publish-recovery",
    "task-identity-repeated-submission", "task-identity-definition-conflict",
    "task-identity-existing-before-dynamic-checks", "task-identity-tombstone",
    "single-bearer-principal", "tool-native-replay-policy", "harness-operation-recovery",
    "typed-prompt-no-expansion", "pi-adapter-patch-boundary",
    "discussion-trigger-single-ingestion", "discussion-close-ingest-race",
    "tool-budget-logical-call", "tool-recovery-contract-binding",
} <= oracle_ids

print("PASS simplified.6: static contracts, task identity, auth/tool config, per-field usage, Matrix invariants, Pi AgentHarness evidence")
