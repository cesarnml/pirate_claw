---
name: grill-me
description: Stress-test a plan or design by questioning every key assumption until the decision tree is resolved.
---

Question the plan aggressively until the key decisions, dependencies, and tradeoffs are explicit.

## When This Skill Applies

Use grill-me at two points in the development pipeline:

1. **Product ideation → concrete well-scoped phases.** The goal is a phase plan the developer is willing to commit as the delivery contract. This is the primary use case and works well in Plan Mode because the one-question-at-a-time format slows down the model's tendency to sprint to a solution.

2. **Phase → thin vertical-slice delivery tickets.** The goal is a ticket breakdown that a developer can read, approve as human-reviewable PR slices, and hand to the orchestrator. This use case is optional — run it when the phase scope is large enough that decomposition needs scrutiny.

## Mode Compatibility

This skill works in both Plan Mode and normal chat (Ask Mode). Prefer the mode the developer initiates from. Do not switch modes mid-session.

## Question Protocol

- Ask exactly one question at a time.
- After the user answers, ask the next single best question — never batch.
- Prefix each question with a rough progress indicator: `Question N of ~M` where M is your current best estimate of total questions needed. M will shift as answers open or close branches — that is expected and fine. The estimate exists so the developer does not feel like they are in question purgatory.
- Give your recommended answer with each question so the developer can agree, disagree, or refine rather than answering from scratch.
- If the codebase can answer a question, inspect it instead of asking.
- Walk the decision tree branch by branch — scope, dependencies, sequence, tradeoffs, edge cases, success criteria, in roughly that order.

## Hard Stop After Delivery Ticket Decomposition

When grill-me is used for use case 2 (phase → tickets), the output is the ticket breakdown — **not the start of implementation.**

After producing the ticket breakdown:

1. Present the full breakdown clearly.
2. Explicitly ask the developer to approve it as correctly scoped before any implementation begins.
3. Do not begin implementing, creating branches, writing code, or invoking the delivery orchestrator until the developer gives explicit approval.

This control point exists because the orchestrator requires delivery ticket docs committed to main before it begins work. Skipping developer approval and jumping to implementation bypasses that sequencing requirement and will corrupt orchestrator state.
