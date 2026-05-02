---
name: enter-worktree
description: Bootstrap a fresh worktree before starting work. Trigger when node_modules may be missing or a newly created worktree needs setup.
---

# Enter Worktree

## Steps

1. **Install dependencies** — if `node_modules` is absent, install them. Use whatever package manager this repo uses.

2. **Copy gitignored files from primary worktree** — these are not present in a fresh checkout:
   - `.env` — credentials and runtime config
   - `.gitignore` — keeps artifacts (`handoffs/`, `reviews/`, `state.json`) out of commits

## Guardrails

- Skip any step that's already done.
- Don't reinstall deps unless they're missing or clearly broken.
