# Piko Agent Runtime Service Design Proposal

Version: v0.1
Status: Draft for Slinky Review
Date: 2026-09-06

## 1. Purpose and evidence boundary

This proposal defines Piko's external boundary and internal architecture for the
Slinky v0.3 Agent Runtime Service contract. It intentionally separates:

- contract behavior proposed for cross-project review;
- Piko-owned implementation design;
- implementation and test evidence, of which none exists yet.

The proposal does not freeze the Slinky contract. Candidate semantics are marked
`CANDIDATE` and tracked in the QA document. Piko currently has no production
runtime, Pi SDK integration, persistent store, executable service, or passing
contract test.

## 2. Reviewed inputs

| Input | Version | SHA-256 |
|---|---:|---|
| Piko Agent Runtime requirements | v0.2 | `ef732d31bcb619c16dd045c5154ca543dfbc4169da36e47d53e2c3c4b886e440` |
| Tier LLM Service contract | v0.20 | `d70832277dd793099f4a99425e8fff920dde3e68077af2f15a8e0d0b0b581db5` |
| Intelligent Resource Management | v0.30 | `a039d52672a8e34b0259e0798385c1b5bdfb7ccc8a310fe984dc937316b10d2c` |
| Knowledge, Memory and Skill | v0.19 | `c5d7f11deb8bd167541160db69899da32c6673b1b64914106105b1a103091efd` |
| PR / Environment Management | v0.22 | `ec7d9c5fbdfa82d8dbca2e951e0deed889b351ee11aadc2a729dc7a120bb34b3` |
| External Tool and Integration | v0.26 | `c936fca081782c833938ac79256b7135d7e4176a21a65a986f2580acf4aeeca6` |
| Artifact and Event Reliability | v0.12 | `815579756ff5afe924b837b9acd060eff5f672bdb28b493e6f9939d56a214845` |
| T7 Regression, System and E2E | v0.13 | `df3f8d178112aa2c58356e10a4779b3c23828ffd4e0811b64d32d6ede276259c` |

## 3. Non-negotiable boundaries

1. The only IR-backed inference chain is `Slinky Runtime -> Piko -> Tier Data Plane`.
2. Piko never calls a Provider endpoint or Tier Management API and never holds a
   Provider credential.
3. Piko does not own Slinky Plan, IR composition, Role assignment, Knowledge,
   Workspace Lease, Artifact effective version, Review acceptance, Gate, or Work
   success.
4. One active participant consumes exactly one assigned Agent Runtime Slot and
   one complete assigned IR.
5. Piko does not add participants, replace IR, change Slot, raise Tier service
   level, widen Tool scope, or follow `latest`.
6. There is one Agent Runtime API and one Pi SDK programmatic execution path. No
   Pi CLI, mlexp compatibility API, fallback endpoint, direct Tier path, or
   parallel runtime implementation is introduced.
7. Slinky-owned objects enter Piko only as exact immutable references plus the
   minimum materialized descriptors required to validate and execute the request.
8. Pi AgentSession, transcript, checkpoint, Extension and internal Tool objects
   are Piko evidence, never Slinky project truth.

## 4. Proposed architecture

```text
HTTP/SSE API
  -> Authentication and client/source scope
  -> Schema and digest validation
  -> Admission coordinator
       -> Runtime/profile readiness
       -> Durable idempotency and attempt uniqueness
       -> Slot registry and atomic claim
       -> Execution-package verifier
       -> Tier-binding verifier
       -> Tool-policy verifier
  -> Durable Run coordinator
       -> Run state store
       -> Append-only event store
       -> Append-only result store
       -> Recovery obligation ledger
  -> Execution supervisor
       -> Participant supervisor
       -> Pi SDK AgentSession adapter
       -> Tier Data Plane adapter
       -> Workspace and Tool broker
       -> Structured-result gateway
  -> Read-only operations and audit projection
```

The API layer contains no workflow fallback. The coordinator is the only writer
of AgentRun state, Slot claims, Piko events and Result versions. Participant
supervisors may report observations but cannot publish terminal Run state.

## 5. Durable model and invariants

The first implementation should use a transactional state store with these
logical records:

| Record | Key invariant |
|---|---|
| ClientRegistration | credential resolves one authorized client and source scope |
| IdempotencyRecord | `(client_id, idempotency_key)` maps to one digest and Run |
| AttemptIndex | `(client_id, work_execution_id, attempt_id)` maps to at most one Run |
| AgentRun | version is monotonic; active state never follows a non-Unknown terminal state |
| AgentSlot | stable configured identity; at most one active ParticipantRun claim |
| ParticipantRun | exact participant, IR, Slot, Tier and Knowledge bindings are immutable |
| AgentEvent | sequence is strictly increasing per Run and append-only |
| AgentTaskResult | `(agent_run_id, result_version)` is immutable |
| RecoveryObligation | unresolved process, Tool, Workspace or Tier outcome is never erased by retry |
| AuditRecord | mutation, credential resolution and policy decision are append-only |

`POST /runs` returns `202` only after a single durable transaction has written the
idempotency record, attempt index, Run identity, initial event and atomic Slot
claims. External execution starts only after that transaction commits.

## 6. Readiness and admission (`CANDIDATE D1`)

Global status and request-specific admission are separate:

| Global state | New Run behavior |
|---|---|
| `NotReady` | `accepting_runs=false`; reject all new Runs |
| `Ready` | admit only when every requested dependency/capability is current and Ready |
| `Degraded` | admit only when `accepting_runs=true`, every requested scope is current and Ready, and no global recovery blocker applies |

The proposal adds machine-readable `degraded_scopes[]` and
`admission_blockers[]`. Human-readable messages never control admission.
Admission revalidates all inputs in this order:

1. credential, client/source scope, API and Schema version;
2. idempotency key and canonical request digest;
3. runtime profile and exact requested capability;
4. participant, complete IR, exact Slot identity/version and independence;
5. Tier credential binding existence and assigned logical service level;
6. Workspace Lease, Host Binding, manifest, root and Tool scope;
7. budget and deadline;
8. durable Run creation and atomic multi-Slot claim.

Failure before step 8 produces no Run, session, Slot claim or external side
effect. Failure of the transaction in step 8 is rolled back atomically.

## 7. Run, cancel and reconcile

The public Run states remain:

```text
Accepted -> Queued -> Preparing -> Running -> Finalizing -> terminal
Preparing | Running | Finalizing -> UnknownOutcome
Queued | Preparing | Running -> Cancelled | TimedOut
UnknownOutcome -> Succeeded | Failed | Cancelled | TimedOut (evidence-backed reconcile only)
```

Cancellation is an idempotent request, not a claim that all side effects stopped.
The supervisor first records cancellation intent, stops new mutations, attempts
bounded child/Tool/Tier cancellation, then reconciles all known obligations.
An unresolved outcome publishes `UnknownOutcome`, not a false `Cancelled` or
`Failed`.

Reconcile operates on the same Run and cannot reset budget, add a participant,
create a new Attempt, or replay a mutation. It queries existing process, Tool,
Workspace and Tier identities and appends evidence.

## 8. Strict terminal Result (`CANDIDATE D2`)

Every externally visible terminal Run has a strict, immutable Result reference.
The trusted Piko runtime, not the LLM, creates the envelope and validates all
references.

| Terminal status | Minimum conditional obligation |
|---|---|
| `Succeeded` | all requested outputs and required Evidence; no error or unresolved side effect |
| `Failed` | typed error; known-not-success outcome; any produced Evidence; no unknown side effect |
| `Cancelled` | typed reason plus cancellation/cleanup Evidence; no unknown side effect |
| `TimedOut` | typed deadline error plus cleanup Evidence; no unknown side effect |
| `UnknownOutcome` | typed error or blocker, evidence collected so far, and unresolved obligation references |

Malformed LLM output is repairable only within the Run budget. When repair is
exhausted and all side effects are known, the trusted runtime produces
`Failed + ResultContractViolation`. When any side effect remains unknown, it
produces `UnknownOutcome` with the contract violation and unresolved references.

The Result and terminal Run transition are published atomically. A storage
failure leaves the Run in `Finalizing/RecoveryRequired`; it does not expose a
terminal Run without a Result. `TerminalResultMissing` therefore signals
corruption or a violated invariant and degrades readiness.

## 9. UnknownOutcome convergence (`CANDIDATE D4`)

Results are append-only:

1. Initial uncertainty publishes immutable Result v1 with `UnknownOutcome`.
2. Evidence-backed reconcile appends Result v2 with the confirmed terminal
   status and atomically updates the Run's current `result_ref`.
3. `GET /runs/{id}/result` returns the current version.
4. `GET /runs/{id}/results/{version}` returns an immutable historical version.
5. The reconciliation response and appended event link previous and current
   Result refs. Result v1 remains queryable for audit.

Only `UnknownOutcome` may converge to another terminal status. No other terminal
Result may be replaced.

## 10. Error and blocker model (`CANDIDATE D3`)

The catalog has three non-overlapping surfaces:

- API errors: the HTTP command/query did not complete; use Error Envelope.
- execution errors: an accepted Run terminated; use `AgentTaskResult.error` and
  return the Result through HTTP 200.
- planning blockers: Slinky must change Plan, IR or Attempt; use
  `AgentTaskResult.blocker`.

`ResourceVersionMismatch` is the sole version mismatch code; a structured
`resource_type` identifies Slot, Run, manifest or another resource.
`RunDeadlineExceeded` belongs to a `TimedOut` Result. HTTP 504 describes only the
synchronous API operation and never guesses the outcome of an accepted Run.
The authoritative proposal is
`docs/contracts/error-blocker-catalog-v0.1.json`.

## 11. Digest and reference rules (`CANDIDATE D5`)

- JSON digests use RFC 8785 JCS serialized as UTF-8, then SHA-256.
- `request_digest`, `manifest_digest` and `result_digest` exclude only their own
  digest field. All other included fields are defined by the applicable Schema.
- Workspace entry digests are over exact raw file bytes.
- A duplicated header/body identity must match exactly or fail closed.
- The Idempotency-Key header participates in idempotency lookup but not in the
  request-body digest; the body `idempotency_key` must equal the header.
- Client/source body fields participate in the digest and must match canonical
  authenticated identity.
- Opaque Slinky references are never dereferenced through a hidden API. A field
  that Piko must inspect must have a versioned descriptor materialized in the
  Execution Package and covered by the manifest digest.

## 12. Tier Data Plane integration

Piko resolves `credential_binding_ref` in its controlled secret boundary and
creates a Tier client for the assigned canonical client/source/instance. It uses
only the supplied Data Plane base URL and exact `service_level_id` as `model`.

Minimum planned Pi-facing surface:

- primary: `POST /v1/responses`;
- model discovery/compatibility validation: `GET /v1/models` and Tier Observation
  compatibility/profile APIs during readiness, never per prompt as fallback;
- optional Chat Completions only if the pinned Pi SDK requires it and the frozen
  compatibility manifest authorizes it;
- no direct Provider, Account, Backend Pool or Tier Management access.

Piko captures `x-tier-invocation-id`, canonical source headers, logical service
level, usage and request ID. Lost responses or streams are reconciled through the
client-scoped Tier Invocation query; Piko does not blindly resubmit. Tier queue
pressure is a short dependency wait bounded by the Run deadline, not a Piko
project queue.

## 13. Workspace, Tool and Knowledge boundary

Piko receives a currently Active Workspace Lease and verifies exact Host Binding,
root mapping, base revision, manifest, expiry and write scope before Running.
It does not activate, transfer or release the Slinky-owned Lease. It reports Tool
and Workspace observations so Slinky Runtime/PR authority can release or recover
the Lease.

Every Tool call passes through the Tool broker with immutable correlation:
Run, ParticipantRun, Attempt, Lease, capability binding, operation, roots,
deadline and approval reference. File traversal, symlink escape, undeclared
process commands, network egress and secret inheritance fail closed. A finite
Tool seat remains a PR Reservation/Lease; Piko does not invent a hold protocol.

Piko consumes the exact immutable Skill Plan, Experience refs and Context Bundle
already selected and materialized by Slinky. It never selects another Skill,
scans another registry, follows latest or substitutes an unavailable capability.
If the materialized exact content increases capability, Tool, permission,
participant or Tier demand, Piko returns `PlanRefinementRequired` or
`CapabilityEscalationRequired`.

## 14. Team execution and independence

Single execution is a Team with one participant. The Run creates exactly one Pi
AgentSession per requested participant. Actual concurrent sessions cannot exceed
the atomically claimed Slot set.

Each participant receives only its own exact IR, Role contract, Tool scope,
Workspace scope, Tier binding and Knowledge binding. An independent Reviewer does
not inherit the Author's private session memory. Shared information is exchanged
only through declared materialized artifacts, structured handoff, or an audited
collaboration reference. Review transcript never substitutes for Finding,
Coverage, ChangeSet or Validation Evidence.

## 15. SSE and event retention (`CANDIDATE D5`)

Sequence is strictly increasing per Run and persists across process restart.
Reconnect with Last-Event-ID resumes at the next sequence while retained.
If the requested event precedes the retention floor, the HTTP request returns
`410 EventHistoryExpired` before opening the stream, including current Run ref,
retention floor and recovery action. The client then reads current Run/Result and
reconciles if required.

Piko event history is execution evidence, separate from Slinky's domain authority
event store. Piko does not write directly into Slinky Outbox/Inbox or claim a
global Project event sequence.

## 16. Security and client isolation

- authenticated credential is the authority for client identity;
- headers may narrow, never widen, the authorized source scope;
- Run, Result, Event and Evidence queries are client-scoped before lookup results
  are disclosed;
- Slot aggregate capacity may be shared, while claim ownership is opaque to
  unauthorized clients;
- runtime, credential and policy roots are never writable by Agent tools;
- secrets are removed from process environments and redacted from request,
  workspace, transcript, Result, Event, logs and fixtures;
- all mutation permission is intersected across WorkExecution authorization,
  participant permission, Tool binding and workspace roots;
- cancel, timeout and crash preserve orphan and unresolved-side-effect records.

Pi SDK is treated as an execution library, not a sandbox.

## 17. API proposal

The reviewable endpoint and DTO proposal is in
`docs/contracts/agent-runtime-openapi-v0.1.yaml`; JSON Schema is in
`docs/contracts/schemas/agent-runtime-v0.1.schema.json`.

The OpenAPI file is descriptive, not generated implementation evidence. Before
freezing it, Slinky and Piko must agree on:

- exact reference descriptor schemas;
- error/blocker mapping;
- historical Result query;
- event retention behavior;
- pagination and ETag details;
- Pi SDK and Tier compatibility surface.

The v0.1 OpenAPI provisionally leaves only liveness unauthenticated. All other
operations require bearer authentication and canonical client/source scope.
This remains QA-015 because the requirements' general header rule and liveness
example do not explicitly resolve whether liveness is public.

## 18. Verification strategy

Tests will be built in this order:

1. Schema examples and negative fixtures, including digest vectors.
2. State-machine and transaction property tests.
3. Authentication, client isolation, ETag, pagination and idempotency Module tests.
4. Fake Tier, fake Pi session and fake Tool/Workspace Contract tests.
5. Process-kill and restart recovery at Accepted, Queued, Preparing, Running,
   Finalizing and UnknownOutcome.
6. Path traversal, symlink, command, egress, secret and untrusted Extension tests.
7. Real-service/fake-backend controlled-mount and browser tests.
8. Small real Tier confirmations and measured SLO/capacity tests.
9. Slinky black-box cases 1-28 and V03-E2E-085 through 092.

No SLO or security claim is made until current evidence identifies source commit,
schema version, environment topology/execution profile, fingerprint and run ID.

## 19. Dependency-gap classification

### Answered by reviewed design documents

- one Piko-to-Tier inference path and exact logical service level;
- canonical Tier source identity and invocation outcome query;
- composite IR and exact backing Seat semantics;
- Knowledge selection/materialization authority;
- Workspace Lease, controlled-mount and lane-local write principles;
- Tool scope, credential and partial-side-effect principles;
- immutable Artifact/CodeChangeSet and authority event principles;
- required Piko E2E and recovery coverage.

### Still requires Slinky descriptors or fixtures

- minimum materialized descriptors for IR, RoleAssignment, Knowledge profile,
  Skill Plan, Context Bundle, Workspace Lease and Host Binding;
- ArtifactCandidate, CodeChangeSet, Finding, Coverage and ValidationEvidence;
- independence, shared-write serialization and approval reference;
- black-box positive/negative fixtures and digest vectors;
- authenticated Client/Source registration fixtures;
- target controlled-mount and Browser execution profiles;
- actual Tier credential binding and sanitized response fixtures.

### Requires cross-project/user decision

- D1-D5 candidate semantics;
- final Pi SDK package/version and required endpoint surface;
- retention periods, cursor expiry and result-history lifetime;
- SLO workload/environment and deployment capacity;
- concrete persistence/deployment/HA topology after contract semantics close.

## 20. Delivery stages

1. Cross-project review and contract closure.
2. TypeScript/Pi SDK build baseline and generated Schema types.
3. Durable control plane and Slot/Run/Event/Result invariants.
4. Workspace, Tool, Tier and Pi execution boundary.
5. Single/Team structured Result and recovery.
6. Contract, recovery, security and performance evidence.
7. Release artifacts, runbooks, known limitations and exact digest.

## 21. Review checklist for Slinky

- Confirm or revise D1-D5.
- Verify this proposal preserves every Slinky authority boundary.
- Identify any reference Piko must validate that lacks a materialized descriptor.
- Confirm no endpoint creates a second inference, workspace or recovery path.
- Confirm the Result conditional obligations and UnknownOutcome audit chain.
- Confirm whether `/results/{result_version}` and `410 EventHistoryExpired` enter
  the next contract version.
- Supply or assign ownership for the missing fixtures in section 19.

## 22. Non-goals

- production implementation or release claim;
- Slinky Project, Plan, IR, PR, Artifact, Knowledge or Acceptance authority;
- mlexp migration or compatibility;
- direct Provider/Tier Management integration;
- public Internet multi-tenant Agent cloud;
- Agent-selected fallback, participant expansion or Tier escalation;
- a second config, selector, runtime, Tool, Knowledge or recovery mechanism.
