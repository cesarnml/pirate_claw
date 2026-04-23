# P25.01 Restart Proof Contract and Durable Status Surface

## Goal

Define the durable restart-proof contract and expose the minimum read surface the browser needs to distinguish `requested`, `restarting`, and proven return without guessing from timing alone.

## Scope

### Durable proof model

- choose the Pirate Claw-owned durable artifact or state record that represents a restart request and its eventual satisfaction
- keep the proof inside the shipped durability boundary: writable config directory, `pirate-claw.db`, and `.pirate-claw/runtime`
- ensure the proof survives process exit and restart

### API/runtime surface

- expose the minimum read path needed for the browser to observe restart proof from the restarted daemon instance
- define the base status vocabulary used by later UI tickets
- add tests for accepted restart request, in-progress restart, and proven successful return semantics

## Out Of Scope

- broad operator-facing UX beyond the minimum needed to exercise the proof contract
- final `failed_to_return` UX/copy alignment (`P25.03`)
- Mac deployment or generic supervisor work

## Exit Condition

Pirate Claw has a durable restart-proof contract plus a read surface that a browser can use to verify restart completion without relying on process disappearance or manual refresh luck.

## Rationale

If the proof contract is vague, every later UI state is theater. This ticket makes restart truth observable before the browser starts narrating it.
