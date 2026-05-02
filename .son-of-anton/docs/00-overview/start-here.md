# Start Here

This is the entry point for Son of Anton delivery work. Read this before touching any code.

## Immediate next action

Check your repo's roadmap for the current active phase and its status. The handoff file for the active ticket is at `.agents/delivery/<plan-key>/handoffs/<ticket-id>.md` — that is the required input for resuming in-progress work.

## Three developer control points

Son of Anton enforces three gates per phase. Nothing moves forward without explicit developer approval at each:

1. **Plan approval** — `grill-me` stress-tests the proposed plan. No tickets are written until the developer approves the decomposition.
2. **Ticket-by-ticket review** — in `gated` mode, the orchestrator stops after each `advance` and prints a canonical resume prompt. Developer reviews the PR and explicitly resumes.
3. **Phase closeout** — stacked PRs are never auto-merged. `bun run closeout-stack --plan <path>` requires explicit developer invocation.

## Starting a new phase

```
1. Run grill-me on the proposed scope
2. Get developer approval on ticket decomposition
3. Commit implementation-plan.md + all ticket-NN-*.md files to main
4. bun run deliver --plan <plan-path> start
```

Plan and ticket docs must be committed to `main` **before** the orchestrator creates any branches.

## Resuming in-progress work

```bash
bun run deliver --plan <plan-path> status        # show current state
bun run deliver --plan <plan-path> start         # resume from current ticket
```

Always read the handoff doc at `.agents/delivery/<plan-key>/handoffs/<ticket-id>.md` first.

## Standalone (non-ticketed) PRs

Small bounded changes that don't warrant a full phase (bug fixes, doc updates, cleanup):

```bash
bun run deliver ai-review [--pr <number>]
```

Self-audit is required. `codex-preflight` is optional but recommended for non-trivial changes.

## Key files

| File | Purpose |
|---|---|
| `orchestrator.config.json` | Runtime config (boundary mode, review policy, package manager) |
| `docs/01-delivery/delivery-orchestrator.md` | Full command reference — read before executing any orchestrator work |
| `docs/01-delivery/son-of-anton.md` | Doctrine: why this workflow exists |
| `docs/01-delivery/tdd-workflow.md` | Red-green-refactor contract for ticket implementation |
| `docs/01-delivery/issue-tracking.md` | Issue sizing and Fibonacci point conventions |
| `docs/01-delivery/phase-implementation-guidance.md` | Implementation plan format contract |
| `.agents/skills/son-of-anton-ethos/SKILL.md` | Agent behavioral contract for orchestrated delivery |
