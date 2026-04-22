# Phase 23 Implementation Plan

**Status:** Not started — ticket decomposition proposed; awaiting developer approval.

Phase 23 replaces manual Plex token entry with browser-managed Plex auth, persists the device identity needed for renewal, and adds best-effort silent credential renewal plus explicit reconnect-required UI states when renewal fails.

## Epic

- `Phase 23 Plex Browser Auth and Credential Lifecycle`

Follow the shared guidance in [`docs/02-delivery/phase-implementation-guidance.md`](../phase-implementation-guidance.md) when shaping or revising tickets for this phase.

## Product contract

- [`docs/01-product/phase-23-plex-browser-auth-and-credential-lifecycle.md`](../../01-product/phase-23-plex-browser-auth-and-credential-lifecycle.md)

## Grill-Me decisions locked for this phase (2026-04-22)

- `plex.url` remains an explicit operator-managed PMS URL; Phase 23 does **not** own server discovery or selection
- Phase 23 uses Plex's current recommended browser-oriented auth flow, not a nicer wrapper around manual token extraction
- the current usable Plex credential continues to live in `plex.token`; no new JWT-specific config shape is introduced
- Phase 23 scope is expanded beyond first-run connect to include persisted device identity plus best-effort silent renewal
- renewal failures surface as reconnect-required UI state rather than a silent broken integration
- device identity / key material is durable product state and should not require operator-authored JSON editing
- onboarding and `/config` share the same Plex auth primitives; no wizard-only Plex flow
- PMS reachability/version compatibility remains a separate concern from account auth state and should not be collapsed into a single "Plex OK" flag

## Stack

- Bun + TypeScript daemon/API in `src/`
- SvelteKit 2 + Svelte 5 + TypeScript in `web/`
- Existing config validation and write path in [`src/config.ts`](../../../src/config.ts) and [`src/api.ts`](../../../src/api.ts)
- Existing Plex enrichment client in [`src/plex/client.ts`](../../../src/plex/client.ts)
- Existing onboarding and `/config` surfaces in `web/src/routes/`

## Ticket Order

1. `P23.01 Plex Auth Session Foundation and Stored Identity Contract`
2. `P23.02 Browser Redirect/Return Flow and Config Persistence`
3. `P23.03 Onboarding and Config Plex Connection UX`
4. `P23.04 Best-Effort Silent Renewal and Reconnect-Required States`
5. `P23.05 Docs, Operator Guidance, and Phase Closeout`

## Ticket Files

- `ticket-01-auth-session-foundation.md`
- `ticket-02-browser-flow-and-config-persistence.md`
- `ticket-03-plex-connection-ux.md`
- `ticket-04-silent-renewal-and-state-model.md`
- `ticket-05-docs-exit-and-retrospective.md`

## Exit Condition

A browser user can connect Plex without manual token extraction, Pirate Claw stores enough device identity to renew credentials on a best-effort basis, and the UI makes reconnect-needed states explicit without regressing the rest of the Phase 22 setup flow.

## Phase Closeout

- **Retrospective:** `required`
- **Why:** Phase 23 introduces a durable external auth boundary, a new persisted identity model, and an operator-facing lifecycle contract that later phases, especially Phase 24, depend on.
- **Trigger:** `product-impact`
- **Artifact:** `notes/public/phase-23-retrospective.md`
- **Scope:** retrospective writing is in scope for `P23.05`

## Review Rules

Review and merge in ticket order.

Do not start the next ticket until:

- tests/checks for the current ticket are green
- ticket rationale is updated for behavior/tradeoff changes
- no ticket widens into Plex server discovery or account-management scope

## Explicit Deferrals

- Plex server discovery or selection UX
- automatic PMS URL inference from the Plex account
- multi-account account switching flows
- guaranteed invisible renewal across every failure mode
- deep auth-debug operator tooling
- Synology restart-backed auth durability work beyond the browser/runtime contract in this phase

## Stop Conditions

Pause for review if:

- Plex's current recommended auth flow requires a broader secret-storage or key-management boundary than this plan assumes
- storing renewal identity cannot be implemented without introducing a second operator-managed settings surface
- the browser flow depends on exposing renewal-sensitive material to client-side JavaScript
- onboarding and `/config` start to diverge in Plex auth behavior or state vocabulary

## Developer approval gate

**Do not begin implementation** until this implementation plan and all Phase 23 ticket docs are merged to `main` and explicitly approved for delivery.
