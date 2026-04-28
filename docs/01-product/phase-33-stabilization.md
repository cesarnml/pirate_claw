# Phase 33: Stabilization

**Delivery status:** Not started — product definition only; no `docs/02-delivery/phase-33/` implementation plan until tickets are approved.

Phase 33 is a reserved stabilization window between the Phase 28–32 implementation run and the Phase 34 polish pass. Four new install surfaces, a security layer, a VPN bridge, and an enrichment expansion across two platforms will produce real integration debt. Phase 33 exists to catch it before polish begins.

## TL;DR

**Goal:** resolve integration gaps, reliability issues, and cross-phase inconsistencies that emerged from Phases 28–32 before the Phase 34 polish pass.

**Ships:** whatever broke or regressed. Scope defined after Phase 32 lands.

**Defers:** new functionality, new install paths, new enrichment sources, UI/UX polish (Phase 34).

## Phase Goal

Phase 33 should leave Pirate Claw in a state where:

- no known reliability regressions from Phases 28–32 remain open
- the Phase 28 security layer, Phase 29 VPN bridge, Phase 30 Mac install, Phase 31 DSM 7.2.1 install, and Phase 32 enrichment chain work correctly together across both supported platforms
- Phase 34 polish begins on a stable, integrated product — not on top of unresolved cross-phase inconsistencies

## Committed Scope

_Undefined. Scope is derived from the actual state of the product after Phase 32 ships._

This phase must not be pre-loaded with speculative work. If Phases 28–32 land cleanly with no meaningful integration debt, Phase 33 may be very short or skipped. It is a buffer, not a feature.

## Explicit Deferrals

- new features or install paths
- UI/UX polish (Phase 34)
- v1 release ceremony (Phase 35)

## Exit Condition

Both the Mac and Synology install paths are stable and correct with owner security and VPN bridge enabled. Phase 34 can begin without known reliability blockers.

## Rationale

Four phases of platform, security, and enrichment work across two deployment targets creates integration surface. A named stabilization phase prevents polish from masking unfixed problems and gives the roadmap an honest buffer without naming specific defects that do not exist yet.
