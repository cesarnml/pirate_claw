# P11.06 Docs, index updates, exit verification

## Goal

Close the phase documentation loop: index the delivery plan, align overview docs with repo conventions, and verify the product exit condition is met.

## Scope

- Ensure [`docs/README.md`](../../README.md) lists `phase-11/implementation-plan.md` under `02-delivery`.
- Update [`docs/00-overview/roadmap.md`](../../00-overview/roadmap.md) planning posture if required when Phase 11 moves from “planned only” to “has approved ticket decomposition.”
- Update [`README.md`](../../../README.md) if user-visible config (`tmdb` block) or operator steps change.
- Update [`docs/00-overview/start-here.md`](../../00-overview/start-here.md) only if the “current phase” pointer or next-action for contributors changes materially.
- Manual checklist against [`docs/01-product/phase-11-tmdb-metadata-enrichment.md`](../../01-product/phase-11-tmdb-metadata-enrichment.md) **Exit Condition** and **Explicit Deferrals**.

## Out Of Scope

- Product scope expansion beyond Phase 11
- Implementation code (belongs in earlier tickets)

## Exit Condition

Documentation reflects Phase 11 delivery plan location; roadmap/start-here/README are consistent with repo policy; exit condition checklist is recorded (in this ticket’s rationale or a short note).

## Rationale

Keeps durable docs aligned with AGENTS ticket-completion expectations and avoids shipping code without discoverable plan links.
