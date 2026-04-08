---
name: closeout-stack
description: Merge a completed stacked PR phase onto main. Use when the developer approves closeout after a multi-ticket delivery is fully reviewed.
---

# Closeout Stack

Merge a completed stacked delivery phase onto `main` after the developer has reviewed and approved all PRs in the stack.

## Primary Path

Run the closeout command from the default branch:

```bash
git checkout main     # must be on the default branch
bun run closeout-stack --plan <plan-path>
```

The command processes each ticket in stack order using forward `git merge --squash` — no rebase step. For each ticket it:

1. Fetches and resets local `main` to `origin/main`
2. Fetches the ticket branch and runs `git merge --squash` (3-way merge, robust against parent patches)
3. Commits with the PR title as the commit message
4. Pushes to `origin/main`
5. Closes the PR with a comment and deletes the remote branch

This produces one squash commit per ticket on `main`, preserving per-ticket granularity without the fragility of rebasing child branches after parent squash-merges.

After the command succeeds, delete local worktrees and prune stale remote refs:

```bash
git worktree list          # identify phase worktrees
git worktree remove <path> # for each phase worktree
git remote prune origin
```

## Recovery

If the closeout command fails mid-flight (merge conflict, GitHub API error, etc.), **do not retry the command**. Instead:

1. **Check what made it to `main`.** `git log --oneline origin/main` and GitHub PR state.

2. **Reset local to remote main.** `git checkout main && git reset --hard origin/main`

3. **Resume manually.** For each remaining un-merged ticket, run the same merge --squash locally:

   ```bash
   git fetch origin <ticket-branch>
   git merge --squash origin/<ticket-branch>
   git commit -m "<PR title>"
   git push origin main
   gh pr close <number> --comment "Squash-merged manually" --delete-branch
   ```

4. **Clean up.** Close any remaining orphaned PRs and prune stale refs.

## Key Rules

- The developer must explicitly approve closeout. Never run it autonomously.
- If a `git merge --squash` has conflicts, stop and surface the conflict to the developer rather than force-resolving.
- After closeout, verify the test suite passes on `main` before moving on.
- The command works from any checkout of the repo on the default branch — it does not require worktrees to still exist.
