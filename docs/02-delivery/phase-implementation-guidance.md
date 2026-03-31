# Phase Implementation Guidance

This note defines the default stance for planning and delivering a phase.

Use it when:

- creating or revising a phase implementation plan
- breaking a phase into tickets
- deciding whether a ticket is small enough to implement safely

## Core Stance

- build one small real behavior at a time
- keep each ticket end to end
- test what the user can observe
- avoid side quests during implementation
- record cleanup ideas separately instead of mixing them into the ticket

## What This Means In Practice

- prefer a thin slice that works through the real system over a broad foundation pass
- keep a ticket small enough to explain clearly in one review
- let tests prove behavior through public interfaces instead of locking onto internal structure
- when a useful refactor appears during feature work, capture it as a follow-up instead of widening the current ticket unless it is required to land safely

## Pressure-Test Fuzzy Plans

If a phase or ticket still feels vague, pressure-test it before implementation.

The default tool for that is the `grill-me` skill.

Use it to force clarity on:

- the real behavior being delivered
- the smallest acceptable slice
- key tradeoffs and decision points
- what should stay deferred
