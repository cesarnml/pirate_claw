---
name: closeout-stack
description: Merge a completed stacked PR phase onto main. Use when the developer approves closeout after a multi-ticket delivery is fully reviewed.
---

# Closeout Stack

Merge a completed stacked delivery phase onto `main` after the developer has reviewed and approved all PRs in the stack.

## Primary Path

Run the closeout command:

```bash
bun run closeout-stack --plan <plan-path>
```

The command squash-merges each PR in ticket order, rebases the next child branch onto the new `main`, force-pushes, retargets or replaces the surviving child PR, and deletes the merged parent branch.

If the command succeeds cleanly, the phase is done. Delete local worktrees and prune stale remote refs:

```bash
git worktree list          # identify phase worktrees
git worktree remove <path> # for each phase worktree
git remote prune origin
```

## Cherry-Pick Recovery

If the closeout command fails mid-flight (rebase conflict, GitHub API error, etc.), **do not retry the command**. The partial state is unrecoverable by re-running.

Instead, follow this deterministic recovery:

1. **Identify what made it to `main`.** Check `git log --oneline origin/main` and the GitHub PR state (merged vs still open).

2. **Reset local to remote main.**

   ```bash
   git checkout main && git reset --hard origin/main
   ```

3. **Cherry-pick the remaining commits.** For each un-merged ticket branch, cherry-pick its implementation and patch commits (skip merge commits):

   ```bash
   git cherry-pick <commit-sha-1> <commit-sha-2> --no-commit
   # repeat for each remaining ticket's commits in stack order
   git commit -m "feat: <summary of remaining tickets>"
   ```

4. **Push and clean up.**

   ```bash
   git push origin main
   ```

   Then close any orphaned PRs and delete stale branches:

   ```bash
   gh pr close <number> --delete-branch  # for each orphaned PR
   git remote prune origin
   ```

## Key Rules

- The developer must explicitly approve closeout. Never run it autonomously.
- If the cherry-pick recovery itself has conflicts, stop and surface the conflict to the developer rather than force-resolving.
- After closeout, verify the test suite passes on `main` before moving on.
