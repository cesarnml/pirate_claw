# P13.02 Config Read Revision Metadata

## Goal

Expose a config resource revision (`ETag` or equivalent) on config read responses so write paths can use optimistic concurrency without changing the existing read payload contract.

## Scope

- Add revision metadata on config resource reads in [`src/api.ts`](../../../src/api.ts).
- Ensure `/api/config` payload shape remains backward compatible (metadata via headers preferred).
- Add API tests asserting revision metadata presence and stable behavior across unchanged reads.

## Out Of Scope

- Mutating writes or bearer auth checks.
- If-Match enforcement and conflict response behavior.
- Web Settings save UI/action flow.

## Exit Condition

Config read responses expose revision metadata suitable for optimistic concurrency, with tests covering expected header/revision behavior.

## Rationale

To be completed during implementation with behavior/tradeoff notes.
