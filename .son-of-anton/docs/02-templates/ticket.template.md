# PN.NN [Ticket Title]

Size: 2 points

## Outcome

- [Bullet: what is demonstrably true when this ticket is done]
- [Each bullet should be independently verifiable]

## Red

- [Write a failing test that proves the behavior is missing]
- [Tests should be behavior-first, not implementation-first]
- [Commit the failing test before writing any implementation]

## Green

- [Implement the smallest change that makes the failing test pass]
- [Do not over-engineer — just make it green]

## Refactor

- [Extract, rename, or simplify without changing behavior]
- [Only refactor what you touched — no opportunistic cleanup]

## Review Focus

- [What a reviewer should pay attention to]
- [Public API shape, error ergonomics, edge cases]
- [What was intentionally deferred and why]

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Red first: [what test failed first]
Why this path: [why this implementation was the smallest acceptable]
Alternative considered: [one rejected alternative and why]
Deferred: [what was intentionally left out of this ticket]
