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

schema = json.loads(SCHEMA_PATH.read_text())
openapi = yaml.safe_load(OPENAPI_PATH.read_text())
catalog = json.loads(ERROR_PATH.read_text())
fixtures = json.loads(FIXTURE_PATH.read_text())

VERSION = "0.3.0-simplified.5"
assert schema["x-contract-version"] == VERSION
assert openapi["info"]["version"] == VERSION
assert fixtures["fixture_version"] == VERSION
assert catalog["catalog_version"] == f"agent-runtime-errors/{VERSION}"
assert set(openapi["paths"]) == {
    "/runs", "/runs/{run_id}", "/runs/{run_id}:cancel", "/runs/{run_id}/result"
}

validator = Draft202012Validator(schema, format_checker=FormatChecker())
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
assert set(request_props["discussion"]["$ref"].split("/")[-1:]) == {"DiscussionContext"}

all_machine = "\n".join((OPENAPI_PATH.read_text(), SCHEMA_PATH.read_text(), ERROR_PATH.read_text())).lower()
for forbidden in (
    "sourceinstance", "source_instance", "execution-capacity", "execution_claim",
    "session_binding_ref", "communication_trigger", "content_ref", "tier seat",
    "retryable_by_same_run", "unsupportedmodel", "capacityunavailable",
):
    assert forbidden not in all_machine, forbidden

# Verify the pinned Pi implementation evidence and the precise provider retry boundary.
sdk = (ROOT / "upstream/pi/packages/coding-agent/src/core/sdk.ts").read_text()
agent_loop = (ROOT / "upstream/pi/packages/agent/src/agent-loop.ts").read_text()
responses = (ROOT / "upstream/pi/packages/ai/src/api/openai-responses.ts").read_text()
responses_shared = (ROOT / "upstream/pi/packages/ai/src/api/openai-responses-shared.ts").read_text()
assert "setDefaultStreamFn(streamSimple)" in sdk
assert "await runLoop" in agent_loop and "agentLoopContinue" in agent_loop
retry_at = responses.index("await retryProviderRequest")
process_at = responses.index("await processResponsesStream")
assert retry_at < process_at
assert "stream: true" in responses and "store: false" in responses
for event_name in fixtures["pi_streaming_surface"]["required_events"]:
    assert event_name in responses_shared or event_name == "error", event_name
assert 'type: "function_call_output"' in responses_shared
assert fixtures["pi_streaming_surface"]["request"]["supports_explicit_prompt_cache_mode"] is False
assert "reasoning{id,encrypted_content,summary,content}" in fixtures["pi_streaming_surface"]["complete_history_items"]

oracle_ids = {item["id"] for item in fixtures["semantic_oracles"]}
assert {
    "same-agent-serialization", "post-event-stream-failure", "unknown-tool-side-effect",
    "queued-cancel-atomic", "raw-usage-before-normalization", "late-usage-after-result",
    "matrix-cursor-commit-order", "matrix-self-echo", "preflight-no-inference",
    "matrix-turn-before-session-checkpoint", "matrix-turn-after-session-checkpoint",
    "matrix-discussion-normal-completion", "usage-one-attempt-without-usage",
    "usage-fields-missing-on-different-attempts",
    "opaque-reasoning-replay", "explicit-cache-disabled", "idle-room-event",
    "result-publish-recovery",
} <= oracle_ids

print("PASS simplified.5: 4 operations, per-field usage, Matrix session recovery, Pi SSE evidence")
