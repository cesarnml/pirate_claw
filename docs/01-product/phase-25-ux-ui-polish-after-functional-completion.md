# Phase 25: UX/UI Polish After Functional Completion

**Delivery status:** Not started — product definition only; no `docs/02-delivery/phase-25/` implementation plan until tickets are approved.

Phase 25 is intentionally sequenced after Phases 21–24. Pirate Claw should finish the functional product-completion path first: bootstrap, browser-only setup, dependable Plex auth lifecycle handling, and dependable Synology restart-backed operation. Only then should the next major phase be a broad UX/UI polish pass.

## TL;DR

**Goal:** refine the interface after the product is functionally complete, without confusing visual polish for readiness.

**Ships:** targeted usability and visual polish across onboarding, config, dashboard, Movies, and TV Shows once the functional setup path is already solid.

**Defers:** any missing functional setup/bootstrap/restart work that belongs in Phases 21–24.

## Phase Goal

Phase 25 should leave Pirate Claw in a state where:

- functional setup is already complete before polish work begins
- operational surfaces are clearer, more legible, and more cohesive
- low-operational-value "collector shelf" views (Movies and TV Shows) feel intentional without stealing priority from setup and dashboard workflows
- design improvements serve trust and usability rather than masking incomplete product behavior

## Committed Scope

- onboarding flow polish after the functional setup contract is proven
- Config page UX refinement, copy cleanup, hierarchy tuning, and interaction smoothing
- dashboard readability and activity affordance polish
- Movies and TV Shows visual and interaction improvements as secondary, shelf-like views
- cross-surface consistency passes for toasts, validation copy, loading states, and empty states

## Explicit Deferrals

- new setup/bootstrap functionality that should have landed in Phases 21–24
- major backend/API expansion justified only by aesthetics
- feature-set expansion unrelated to usability and polish

## Exit Condition

Pirate Claw is already functionally complete for first-run bootstrap, browser-only setup, Plex auth lifecycle handling, and Synology restart-backed operation; Phase 25 then leaves the interface more cohesive, polished, and trustworthy without changing the core product contract.

## Rationale

Previous visual phases improved the interface while meaningful setup and deployment gaps still remained. Phase 25 deliberately inverts that priority. The product should first earn the right to be polished by being complete where it matters: zero hand-edited files, browser-only setup, dependable Plex auth lifecycle handling, and dependable restart-backed operation on Synology.
