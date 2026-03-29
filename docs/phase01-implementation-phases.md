# Phase 01 Implementation Phases

This breakdown is intentionally small. Each ticket should fit a 1-3 hour review and follow one red-green-refactor loop around a single behavior.

## Ticket 01: CLI Skeleton And Config Loading

Size: 2 points

Outcome:

- add a runnable CLI entrypoint
- load a JSON config file from a predictable path or `--config`
- fail fast with a readable error when config is missing or malformed

Red:

- write an integration-style CLI test proving `media-sync run --config test-config.json` loads config
- write a failing test for invalid JSON or missing required sections

Green:

- implement the smallest config loader and CLI dispatch needed to pass

Refactor:

- extract config validation into a dedicated module

Review focus:

- public CLI shape
- config error ergonomics

## Ticket 02: RSS Fetch And Parse

Size: 2 points

Outcome:

- fetch a configured RSS feed
- parse item entries into a raw feed-item structure

Red:

- write an integration-style test using a local HTTP server that returns RSS XML
- prove multiple items are parsed with guid, link, title, and publish date

Green:

- implement RSS fetch + minimal parser

Refactor:

- isolate parsing from network fetch logic

Review focus:

- parser resilience without overengineering
- clean system boundary for HTTP

## Ticket 03: Title Normalization

Size: 2 points

Outcome:

- normalize raw titles into metadata needed by matching
- extract season/episode, year, resolution, and codec

Red:

- write table-driven tests against representative noisy titles
- prove both TV and movie shapes are extracted correctly

Green:

- implement the smallest normalization rules to pass the examples

Refactor:

- centralize regex helpers and normalization utilities

Review focus:

- correctness of extracted metadata
- behavior on partially missing metadata

## Ticket 04: TV Rule Matching

Size: 2 points

Outcome:

- match normalized TV items against regex-based rules
- enforce codec and resolution filters

Red:

- write tests that prove intended titles match and near-misses do not
- prove case-insensitive regex behavior

Green:

- implement the TV matcher

Refactor:

- make scoring and rule evaluation readable

Review focus:

- fuzzy matching without unsafe overmatch

## Ticket 05: Movie Rule Matching

Size: 2 points

Outcome:

- match movie items by year and optional regex pattern
- enforce codec and resolution filters

Red:

- write tests for year-only matching
- write tests for year + pattern matching

Green:

- implement the movie matcher

Refactor:

- share filter logic with TV matching where it stays behavior-safe

Review focus:

- clear difference between TV and movie rule semantics

## Ticket 06: SQLite Dedupe And Run History

Size: 3 points

Outcome:

- create the schema for runs, feed items, and candidate state
- mark already-queued items as duplicates on later runs

Red:

- write tests that run the pipeline twice and prove the second run skips duplicates
- write a test that failed items remain retryable

Green:

- implement minimal SQLite persistence

Refactor:

- separate schema bootstrapping from repository operations

Review focus:

- dedupe identity correctness
- safe retry behavior

## Ticket 07: Transmission Adapter

Size: 2 points

Outcome:

- submit a candidate to Transmission over RPC
- handle session-id negotiation
- surface success or failure in a structured way

Red:

- write tests against a fake local Transmission-like server
- prove both handshake and error recording behavior

Green:

- implement the adapter

Refactor:

- keep the adapter behind a narrow downloader interface

Review focus:

- boundary design
- failure handling

## Ticket 08: End-To-End `run` Pipeline

Size: 3 points

Outcome:

- wire config, feed fetch, normalization, matching, dedupe, and Transmission together
- choose one best candidate per identity and submit it

Red:

- write an end-to-end test using local feed fixtures and a fake Transmission server
- prove `queued`, `skipped_duplicate`, `skipped_no_match`, and `failed` outcomes

Green:

- implement the orchestration code

Refactor:

- remove duplicated decision logic and improve run summaries

Review focus:

- pipeline readability
- one-behavior-per-stage structure

## Ticket 09: `status` Command

Size: 2 points

Outcome:

- display recent run summaries and current item states from SQLite

Red:

- write a CLI-level test proving useful output after seeded runs

Green:

- implement the read-only status command

Refactor:

- extract rendering helpers without hiding behavior

Review focus:

- operator usefulness
- no accidental write behavior

## Ticket 10: `retry-failed` Command

Size: 2 points

Outcome:

- retry only previously failed candidates that still have enough stored data for submission

Red:

- write tests proving failed items are retried and queued items are not retried

Green:

- implement retry logic using stored candidate data

Refactor:

- share submission-path code with `run` where behavior remains explicit

Review focus:

- retry boundaries
- no duplicate queueing

## Recommended Review Order

Review and merge in ticket order.

Do not start the next ticket until:

- the previous tests are green
- the public interface is acceptable
- open design questions are resolved

## Stop Conditions

Pause for review after every ticket if:

- a regex rule is too loose to explain clearly
- dedupe identity becomes ambiguous
- Transmission response handling requires a broader interface than planned
- a test needs to mock internal modules instead of a true system boundary
