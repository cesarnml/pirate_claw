# EE11 Retrospective

_Engineering Epic 11: Delivery Tooling Context Object — stacked PRs #245, #246, #248, #249, #251, and the EE11.06 docs closeout PR._

---

## Scope delivered

EE11 replaced the delivery orchestrator's mutable config singleton with an
explicit context/config boundary. The stack added `DeliveryOrchestratorContext`,
introduced `createPlatformAdapters(config)`, made formatter config explicit,
wired CLI command paths through a resolved context, deleted `_config`,
`initOrchestratorConfig`, and `getOrchestratorConfig`, migrated tests to local
config/context fixtures, and closed with updated delivery docs and issue
tracking.

## What went well

The ticket order held. Adding `context.ts` before changing consumers kept the
first PR additive, and moving platform adapters before command wiring meant the
CLI could depend on a real adapter factory instead of guessing at its eventual
shape. The formatter ticket also paid off because status rendering became a
small explicit-config migration before the broader CLI helper changes.

The context boundary stayed appropriately small. Restricting it to `config`,
`platform`, and `invocation` avoided turning the refactor into a command
framework or dependency injection container. That made the final singleton
removal mostly a call-site cleanup instead of an architectural rewrite.

The adapter factory improved testability in the right way. Tests can now create
adapters from a local `ResolvedOrchestratorConfig`, so runtime choices like
`bun` vs `node` are exercised without mutating shared module state. That is
especially important for tests that run in one process and previously depended
on cleanup calls to reset singleton state.

## Pain points

The command-helper split carried expected cost. `cli-runner.ts` owns many small
mode-specific edges, so removing the default singleton context required touching
more exported helper signatures than the earlier tickets touched. The work was
not conceptually hard, but it was broad enough that TypeScript caught required
parameter ordering and call-site drift only after the first cleanup pass.

The tests still have some historical coupling to `cli-runner` helpers. EE11
removed singleton mutation, but several tests still exercise CLI helper exports
directly rather than narrower source modules. That is acceptable for now because
the helpers are repo tooling, but future CLI work should watch for tests that
make helper signatures harder to simplify.

Running full verification in parallel exposed local web bootstrap contention:
two concurrent gates tried to link web dependencies and failed with file-exists
errors. Sequential reruns passed. This is avoidable workflow friction, not an
EE11 code issue.

## Surprises

The final cleanup ticket was where the real dependency graph became visible.
Earlier tickets deliberately preserved compatibility surfaces to keep their
diffs small; deleting the singleton showed exactly which helpers still depended
on default branch, plan root, runtime, or review policy. That confirmed the
cleanup-gate placement was correct.

The PR contract change in the adapter ticket was smaller than expected. Returning
both PR URL and number from `createPullRequest` looked like it might ripple
through PR metadata code, but the adapter boundary kept the change localized to
PR creation and state recording.

The stale delivery-orchestrator doc was more misleading than the plan doc. The
plan already described EE11's desired end state, while the durable engineering
workflow doc still named `_config` as current architecture. Future closeout
tickets should prioritize docs that future agents read for live behavior, not
only the implementation plan.

## What we'd do differently

If starting again, EE11.04 would be slightly narrower: wire the live CLI command
paths through context, but leave exported test helper signature changes entirely
to EE11.05. The original split mostly did this, but a few compatibility choices
made the final cleanup look larger than it actually was. Making that boundary
explicit in the ticket text would have reduced ambiguity.

The docs ticket would include Start Here in the declared change surface. The
ticket already required reading Start Here, and that document contained a stale
"EE11 is the approved follow-up" note. Updating it was the right closeout move,
but the ticket should have named it directly.

## Net assessment

EE11 achieved its architecture hypothesis. Delivery runtime dependencies now
flow through explicit config/context values, platform adapters are created by a
factory, formatter behavior is config-driven at the call site, command helpers
avoid hidden singleton state, and tests no longer mutate module-level runtime
config. The command split stayed plain and local; it did not turn into a command
bus, class hierarchy, or framework-style abstraction.

## Follow-up

- Keep future delivery-tooling changes on the explicit context and adapter
  factory path; do not reintroduce process-global runtime config for test
  convenience.
- If `cli-runner.ts` grows again, extract narrower command modules only around
  concrete repeated behavior. Do not add a command framework preemptively.
- Avoid running `verify:quiet` and `ci:quiet` concurrently in this repo unless
  web bootstrap linking becomes concurrency-safe.

_Created: 2026-04-27. EE11 stacked PRs open for final developer review._
