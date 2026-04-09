# P13.07 Docs, Env Example, and Phase Exit

## Goal

Close the Phase 13 operator and delivery documentation loop after runtime-settings write flow lands.

## Scope

- Update `.env.example` with `PIRATE_CLAW_API_WRITE_TOKEN` (if not already completed in earlier ticket work) and clear pairing guidance with daemon/dashboard deployment.
- Update `README.md` with:
  - write token opt-in behavior
  - restart-required expectation after successful save
  - conflict-safe edit semantics at a high level
- Update overview docs for delivered scope/status:
  - [`docs/00-overview/start-here.md`](../../00-overview/start-here.md)
  - [`docs/00-overview/roadmap.md`](../../00-overview/roadmap.md)
- Ensure all Phase 13 ticket docs include non-empty `## Rationale` sections reflecting actual implementation choices.

## Out Of Scope

- New product-surface features.
- Any additional API or UI mutation capability beyond approved runtime subset.

## Exit Condition

Operator-facing and phase-status docs accurately reflect shipped Phase 13 behavior, `.env.example` is updated, and Phase 13 tickets are documentation-complete for closeout.

## Rationale

To be completed during implementation with behavior/tradeoff notes.
