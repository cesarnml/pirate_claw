# Start Here

This repo is currently documentation-first. There is no implementation yet.

If you are a new Codex thread, get your bearings in this order:

1. Read `docs/README.md`.
2. Read `docs/phase01-mvp-design.md`.
3. Read `docs/phase01-implementation-phases.md`.
4. Read `docs/tdd-workflow.md`.

## What This Project Is

A local CLI that:

- reads configured RSS feeds
- normalizes titles into media metadata
- matches items against JSON rules for TV and movies
- deduplicates with SQLite
- submits approved candidates to Transmission
- records outcomes for review and retry

Phase 01 ends at successful queueing in Transmission.

## What This Project Is Not Yet

Do not build these in the first implementation slice:

- web UI
- scheduling
- download completion polling
- renaming
- Synology archiving
- source-specific hardcoding

## How To Work

Follow red-green-refactor.

- one ticket at a time
- one failing test at a time
- one review stop after each ticket

Do not implement all of phase 01 in one go.

## First Ticket To Implement

Start with `Ticket 01: CLI Skeleton And Config Loading` from `docs/phase01-implementation-phases.md`.

The first slice should decide only what is necessary to support that ticket:

- package manager
- test runner
- minimal file layout
- runnable CLI entrypoint
- config loading and validation behavior

Do not pre-build modules for later tickets unless the first failing test requires them.

## Expectations For The Next Thread

The next Codex thread should:

1. confirm the docs-driven plan
2. implement only Ticket 01
3. explain the first failing test before writing code
4. stop after Ticket 01 for review

## If Something Feels Ambiguous

Default to the smallest implementation that preserves these constraints:

- Node.js + TypeScript
- SQLite for persistence
- Transmission as the first downloader adapter
- source-agnostic core
- behavior-focused tests through public interfaces
