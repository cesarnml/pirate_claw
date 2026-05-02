# Son-of-Anton Skill

Manages son-of-anton installation, updates, and the full delivery lifecycle.

Shorthand: `soa` is accepted anywhere `son-of-anton` appears in arguments.

## Commands

Dispatch on the first word of `$ARGUMENTS`. Accept `soa` as an alias for `son-of-anton`.

---

### `install`
**Trigger:** `/son-of-anton install` or `/soa install`

Add son-of-anton to the current repo for the first time:

```bash
git subtree add --prefix .son-of-anton https://github.com/cesarnml/son-of-anton.git main --squash
```

If `.son-of-anton` already exists, tell the user to use `update` instead.

---

### `update`
**Trigger:** `/son-of-anton update` or `/soa update`

Pull the latest changes from son-of-anton:

```bash
git subtree pull --prefix .son-of-anton https://github.com/cesarnml/son-of-anton.git main --squash
```

Report what changed. If already up to date, say so.

---

### `ideate`
**Trigger:** `/son-of-anton ideate [topic]` or `/soa ideate [topic]`

Turn a developer feature ideation storm into one or more draft epic/phase plans.

1. Ask the developer open-ended questions to surface goals, constraints, and unknowns. Be relentless — this is the grill-me stage for ideas, not plans.
2. Synthesize the conversation into a concise draft epic/phase summary (title, goal, proposed phases or epics, open questions).
3. **Stop and seek developer approval of the summary before writing any files.**
4. Once approved, write the draft to `docs/02-templates/` or the path the developer specifies.

---

### `plan`
**Trigger:** `/son-of-anton plan [path-to-plan or inline description]` or `/soa plan`

Take an existing rough plan or the content linked in the argument and run a grill-me session to sharpen it.

1. Read the plan if a file path is given. Otherwise use the inline description.
2. Challenge every assumption — scope, sequencing, dependencies, risks, success criteria.
3. Produce a revised plan outline with open questions resolved or explicitly parked.
4. **Do not write implementation tickets.** That is `decompose`.

---

### `decompose` (alias: `decomp`, `tickets`)
**Trigger:** `/son-of-anton decompose [path]` or `/soa decomp` or `/soa tickets`

Take an approved phase/epic plan and produce a detailed `implementation-plan.md` with exact ticket decomposition.

1. Read the plan at the given path (or ask for it).
2. Run a grill-me session focused on: ticket granularity, dependency order, test strategy per ticket, acceptance criteria.
3. **Stop and seek developer approval of the ticket list** before writing files.
4. Once approved, write `implementation-plan.md` and individual ticket files per the format in `docs/02-templates/ticket.template.md`.

---

### `execute`
**Trigger:** `/son-of-anton execute <phase-XX|epic-XX>` or `/soa execute <phase-XX|epic-XX>`

Begin orchestrated delivery of the named phase or epic.

Read these files before doing anything else — they are gospel:
- `.son-of-anton/docs/00-overview/start-here.md`
- `.son-of-anton/docs/01-delivery/delivery-orchestrator.md`
- `.son-of-anton/docs/01-delivery/son-of-anton.md`
- `.son-of-anton/orchestrator.config.json`

Then:
1. Locate the `implementation-plan.md` for the named phase/epic.
2. Identify the first unstarted ticket.
3. Execute via the orchestrator path — **do not ad-hoc implement**.
4. Valid stopping points are defined in `delivery-orchestrator.md` and `orchestrator.config.json`. Respect them.
5. At each stopping point, surface the canonical resume prompt so the developer can continue with `/son-of-anton resume`.

---

### `resume`
**Trigger:** `/son-of-anton resume <phase-XX|epic-XX>` or `/soa resume <phase-XX|epic-XX>`

Resume delivery after a stopping point.

1. Read `.son-of-anton/docs/01-delivery/delivery-orchestrator.md` and `orchestrator.config.json`.
2. Check `state.json` for the last recorded position, or run `git worktree list` to identify active worktrees.
3. Read the handoff notes from the last stopping point.
4. Continue from exactly where delivery left off — do not restart, do not re-plan.
5. Stick to the orchestrator path as configured.

---

### `closeout` (alias: `closeout-stack`)
**Trigger:** `/son-of-anton closeout <stack-name-or-number>` or `/soa closeout XX`

Squash-merge a completed stacked PR set onto main.

Run the closeout script:

```bash
bun run .son-of-anton/scripts/closeout-stack.ts
```

Pass any argument (stack name or number) through to the script. Report the result. If the script is not found, tell the user to complete the setup steps in the README.
