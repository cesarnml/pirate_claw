# Son of Anton

A delivery orchestrator for AI-assisted TypeScript development. Son of Anton keeps the developer in the loop at every meaningful decision point — it does not vibe-code; it develops with AI as a team member.

## Philosophy

Three developer control points per phase:

1. **Ideation** — `grill-me` stress-tests the plan before any tickets are written
2. **Slice approval** — developer reviews and approves ticket decomposition before implementation starts
3. **Final review** — developer approves merge of completed stacked PRs

Everything between those control points is owned by the orchestrator and its agent.

## What this repo provides

- **`tools/delivery/`** — the CLI orchestrator (TypeScript, runs via Bun or Node)
- **`.agents/skills/`** — the behavioral layer that wires Claude Code to the CLI
- **`docs/`** — delivery doctrine, ticket format, TDD workflow, issue sizing
- **`scripts/`** — `deliver.ts` and `closeout-stack.ts` entry points

## Quick start for a new project

### 1. Install the Claude Code skill (one-time, global)

```bash
mkdir -p ~/.claude/skills/son-of-anton
curl -fsSL https://raw.githubusercontent.com/cesarnml/son-of-anton/main/.claude/skills/son-of-anton/SKILL.md \
  -o ~/.claude/skills/son-of-anton/SKILL.md
```

This gives you `/son-of-anton install` and `/son-of-anton update` as slash commands in every repo on your machine. You only do this once.

### 2. Add to a repo

Open Claude Code in the target repo and run:

```
/son-of-anton install
```

That's it. Son-of-anton is now embedded as a git subtree at `.son-of-anton/`.

### 3. Finish setup

```bash
ln -s .son-of-anton/.agents .agents
cp .son-of-anton/orchestrator.config.json .
cp -r .son-of-anton/scripts ./scripts
cp .son-of-anton/AGENTS.md .
```

Add to `package.json`:

```json
{
  "scripts": {
    "deliver": "bun run ./scripts/deliver.ts",
    "closeout-stack": "bun run ./scripts/closeout-stack.ts"
  }
}
```

Edit `AGENTS.md` to reflect your repo's lint, format, verify, and test commands.

### 4. Write a plan and start

```
/son-of-anton execute phase-01
```

See `docs/00-overview/start-here.md` for the full onboarding flow.

<details>
<summary>Manual install (no Claude Code)</summary>

```bash
git subtree add --prefix .son-of-anton https://github.com/cesarnml/son-of-anton.git main --squash
```

Then complete step 3 above manually.

</details>

## Ticket boundary modes

| Mode | Behavior |
|---|---|
| `cook` | Orchestrator advances immediately to the next ticket after each merge |
| `gated` | Orchestrator stops after each advance and prints a canonical resume prompt |
| `glide` | Falls back to `gated` |

Start with `gated` on a new project until you trust the agent's output.

## Agent compatibility

Son of Anton is agent-agnostic. Skills live in `.agents/skills/` — a convention respected by most AI agents as the repo-level source of truth for behavioral instructions. No agent-specific config is required to use them.

**Claude Code adapter:** `scripts/sync-skills.sh` creates `soa-`-prefixed symlinks from `.claude/skills/` into `.agents/skills/`, which is how Claude Code discovers repo skills. This is a Claude-specific on-ramp — it does not affect how other agents consume `.agents/skills/` directly.

```
.agents/skills/grill-me          ← canonical, agent-agnostic
.claude/skills/soa-grill-me      ← symlink, Claude Code adapter only
```

Run `sync-skills.sh` once after install (or after `update`) to wire the Claude Code adapter:

```bash
bash .son-of-anton/scripts/sync-skills.sh
```

`/soa update` runs this automatically.

## Skills reference

| Skill | Trigger |
|---|---|
| `son-of-anton-ethos` | "execute / implement / start / continue / deliver / resume" — drives the per-ticket loop |
| `grill-me` | Plan pressure-testing before any implementation |
| `ai-code-review` | Triage CodeRabbit, Qodo, Greptile, SonarQube review comments |
| `enter-worktree` | Bootstrap a fresh git worktree with deps and `.env` |
| `closeout-stack` | Squash-merge completed stacked PRs onto main |
| `write-retrospective` | Write phase/epic retrospective to `notes/public/` |

## Requirements

- TypeScript project (Bun or Node runtime)
- GitHub repo (uses `gh` CLI for PR operations)
- Claude Code with skills support

## Updating son-of-anton in a consuming repo

```
/son-of-anton update
```

<details>
<summary>Manual</summary>

```bash
git subtree pull --prefix .son-of-anton https://github.com/cesarnml/son-of-anton.git main --squash
```

</details>
