# Phase 23: Synology Supervision and Restart Completion

**Delivery status:** Not started — product definition only; no `docs/02-delivery/phase-23/` implementation plan until tickets are approved.

Phase 23 closes the deployment loop on Synology, which is Pirate Claw's reference home. Browser-driven setup and config changes are not complete product behavior until restart-backed changes can be applied reliably under Synology supervision.

## TL;DR

**Goal:** UI-driven setup and config changes can request a daemon restart and trust Pirate Claw to come back correctly on Synology.

**Ships:** explicit supervision contract; dependable restart-on-`SIGTERM` behavior; UI status for restart requests and completion; validated Synology reference flow.

**Defers:** one-click installation packaging, non-Synology platform abstraction, and deep daemon hot-reload redesign.

## Phase Goal

Phase 23 should leave Pirate Claw in a state where:

- the Synology deployment story is a first-class product contract, not just a runbook habit
- restart-required setup/config changes can be applied from the UI without SSH
- `POST /api/daemon/restart` plus Synology supervision behave predictably enough to be trusted by operators
- Pirate Claw can be treated as a self-service NAS app rather than a browser shell over a manually tended daemon

## Committed Scope

### Supervision Contract

- formalize the reference Synology supervision model for the daemon
- define what Pirate Claw expects after `SIGTERM` and what the supervisor must guarantee
- remove ambiguity around "restart offer" versus "actual product-supported restart path"

### Restart UX Completion

- UI restart flows must surface `requested`, `restarting`, `back online`, and `failed to return` states clearly
- setup/onboarding completion may depend on restart where required, but the operator should stay inside the browser flow
- restart behavior must be validated against the documented Synology reference deployment

### Runbook/Product Alignment

- the current runbook and the product contract must say the same thing about restart behavior
- any Synology-specific requirements needed for restart reliability should be made explicit and reviewable

## Exit Condition

An operator can save restart-backed settings from the browser, request a daemon restart, and trust Pirate Claw to return under Synology supervision without opening a shell or manually babysitting the process.

## Explicit Deferrals

- full hot reload of all daemon settings without restart
- generic supervisor abstraction for every NAS or Linux distro
- marketplace installers, package feeds, or click-to-install distribution
- re-architecting the daemon away from the current process model solely to avoid restart semantics

## Rationale

Phase 16 introduced restart offers and Phase 06 documented Synology operation, but the system still relies on an operator mentally bridging those pieces. Phase 23 turns that bridge into product behavior. If setup/config changes can only be applied reliably by an operator who understands Synology task supervision and SSH fallback, Pirate Claw is still acting like an advanced tool rather than a finished local product.
