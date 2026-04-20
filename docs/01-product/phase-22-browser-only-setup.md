# Phase 22: Browser-Only Setup and Installer Flow

**Delivery status:** Not started — product definition only; no `docs/02-delivery/phase-22/` implementation plan until tickets are approved.

Phase 22 turns the Phase 21 bootstrap contract into a complete browser-only setup flow. The operator should be able to move from a valid starter state to a working daemon configuration entirely through the web UI.

## TL;DR

**Goal:** go from fresh install to working ingestion setup with no SSH and no hand-edited files.

**Ships:** onboarding and config flow rewritten around the new starter-state contract; dependency-ordered setup sequence; shared setup primitives between onboarding and `/config`; explicit readiness and restart-needed state.

**Defers:** advanced target authoring, collector-shelf polish on Movies/Shows, and broader UX refinement beyond the minimum working setup.

## Phase Goal

Phase 22 should leave Pirate Claw in a state where:

- a non-technical operator can finish first-run setup entirely from the browser
- onboarding no longer depends on a copied template or hidden installer knowledge
- the Config page and onboarding share the same underlying writable setup primitives
- Pirate Claw is truly ingestion-ready when onboarding says it is done

## Required Setup Sequence

Phase 22 should present setup in the order that actually matters operationally:

1. connectivity basics
2. auth/secrets
3. media target directories
4. first feed
5. first matching target rule
6. completion summary and handoff

The flow may combine adjacent steps if the ticket breakdown finds a cleaner boundary, but it must preserve this dependency order.

## Committed Scope

### Onboarding

- replace the old Phase 17 "add one feed and one target" wizard assumptions with a flow grounded in the Phase 21 starter contract
- onboarding must handle both `starter` and `partially_configured` installs cleanly
- each step saves incrementally through the same write path the normal Config page uses
- "Done" means Pirate Claw is actually capable of performing ingestion on its next run, not merely that some UI steps were completed

### Config and Secrets UX

- required first-run fields must be enterable in the browser
- no first-run requirement may remain ".env-only" if it blocks the operator from reaching a working setup
- the write-access key must be part of the browser-manageable setup story
- setup state and validation must be explicit enough that the operator can tell what is still blocking readiness

### Readiness Model

- the UI should show one of: `not_ready`, `ready_pending_restart`, or `ready`
- onboarding should hand off to the normal UI only when the system reaches a true working state
- resumed onboarding and normal config editing must converge on the same readiness logic

## Exit Condition

A fresh Pirate Claw install can be opened in the browser, configured end-to-end through onboarding/config flows, and left in an ingestion-ready state without the operator using SSH, `vim`, or manual file editing at any point.

## Explicit Deferrals

- advanced feed/rule bulk management
- search-to-add flows powered by TMDB or Plex
- non-essential dashboard/UI polish on Movies/Shows
- multi-user or delegated-operator setup flows
- one-click installer packaging

## Rationale

Phase 17 proved that guided setup and empty-state guidance are useful, but it stopped short of eliminating installer knowledge and manual file concerns. Phase 22 is the real product-completion setup phase: it closes the gap between "starter state exists" and "the operator can actually make Pirate Claw work without leaving the browser."
