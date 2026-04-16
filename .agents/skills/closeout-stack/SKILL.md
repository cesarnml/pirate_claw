---
name: closeout-stack
description: Merge a completed stacked PR phase onto main. Use when the developer approves closeout after a multi-ticket delivery is fully reviewed.
---

# Closeout Stack

Merge a completed stacked delivery phase onto `main` after the developer approves all PRs.

## Primary Path

```bash
git checkout main
bun run closeout-stack --plan <plan-path>
```

Processes each ticket in stack order via `git merge --squash` (3-way, robust against parent patches). For each ticket: fetch + reset local `main` to `origin/main`, squash-merge the ticket branch, commit with PR title, push to `origin/main`, close PR, delete remote branch. Produces one squash commit per ticket on `main`.

### Delivery artifact mirror (`state.json`, `reviews/`, `handoffs/`)

Closeout reads `.agents/delivery/<plan-key>/state.json` from the repo you run the command in. The orchestrator only writes delivery artifacts in the worktree where you ran `deliver`. If you delivered from a ticket worktree, **copy** that worktree's `state.json`, `reviews/`, and `handoffs/` to the same relative paths in your `main` checkout before running `closeout-stack`, or the command may use stale PR numbers and the primary checkout will lose the latest local review/handoff evidence. See `docs/03-engineering/delivery-orchestrator.md` (State file and primary checkout).

Example:

```bash
mkdir -p .agents/delivery/<plan-key>
cp /path/to/ticket-worktree/.agents/delivery/<plan-key>/state.json \
   .agents/delivery/<plan-key>/state.json
rm -rf .agents/delivery/<plan-key>/reviews .agents/delivery/<plan-key>/handoffs
cp -R /path/to/ticket-worktree/.agents/delivery/<plan-key>/reviews \
   .agents/delivery/<plan-key>/reviews
cp -R /path/to/ticket-worktree/.agents/delivery/<plan-key>/handoffs \
   .agents/delivery/<plan-key>/handoffs
```

After success, clean up:

```bash
git worktree list
git worktree remove <path>   # for each phase worktree
git remote prune origin
```

## Recovery

If closeout fails mid-flight, do not retry. Instead:

1. Check `git log --oneline origin/main` and GitHub PR state to see what merged.
2. `git checkout main && git reset --hard origin/main`
3. For each remaining ticket:
   ```bash
   git fetch origin <ticket-branch>
   git merge --squash origin/<ticket-branch>
   git commit -m "<PR title>"
   git push origin main
   gh pr close <number> --comment "Squash-merged manually" --delete-branch
   ```
4. Confirm `origin/main` has expected squash commits in ticket order.
5. Sync `state.json`, `reviews/`, and `handoffs/` from the active delivery worktree to `main` if needed.
6. Write `notes/public/<plan>-retrospective.md` if not already done.

## Key Rules

- Developer must explicitly approve closeout. Never run autonomously.
- Stop and surface merge conflicts to the developer — do not force-resolve.
- Verify the test suite passes on `main` after closeout.
