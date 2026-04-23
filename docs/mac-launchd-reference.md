# macOS Launchd Reference Contract

This document is the narrow Phase 26 reference contract for always-on Pirate
Claw on macOS. It is not the full operator runbook.

The canonical operator workflow now lives at
[`docs/mac-runbook.md`](./mac-runbook.md). Keep this document focused on the
supported `launchd` boundary and reviewed reference artifact.

The repo-owned reference artifact for this contract lives at
[`docs/mac-reference-pirate-claw-launch-agent.sh`](./mac-reference-pirate-claw-launch-agent.sh).
Treat that file as the source of truth for the reviewed `launchd` invocation.
The prose here explains the contract around it; it does not replace it.

## Supported Scope

Phase 26's supported macOS always-on path is:

- per-user `launchd` under `~/Library/LaunchAgents`
- one dedicated always-logged-in operator account
- Apple Silicon as the validated reference target for this phase
- Pirate Claw running from an operator-chosen install directory

Out of scope for this contract:

- system-wide daemons under `/Library/LaunchDaemons`
- Intel Mac validation or support claims
- native app packaging, menu bar integration, or App Store distribution
- generic cross-platform supervisor abstraction

## Durable Install Boundary

The install directory is the Pirate Claw durable boundary on macOS.

Expected files and directories inside that boundary:

- `<install-dir>/pirate-claw.config.json`
- `<install-dir>/pirate-claw.db`
- `<install-dir>/.pirate-claw/runtime/`
- `<install-dir>/.pirate-claw/runtime/logs/`

The `launchd` plist itself lives outside that boundary under
`~/Library/LaunchAgents/<label>.plist`, but it points back to the install
directory rather than relocating app state into `~/Library/Application Support`
or another second persistence model.

## Reference Invocation Contract

The reviewed launch agent runs:

- Bun by absolute path resolved at install time
- `run <install-dir>/src/cli.ts daemon --config <install-dir>/pirate-claw.config.json`
- with `WorkingDirectory` set to `<install-dir>`
- with `RunAtLoad` and `KeepAlive` enabled
- with stdout and stderr directed to
  `<install-dir>/.pirate-claw/runtime/logs/`

That contract keeps the current source-first Pirate Claw runtime honest on Mac:
the supervisor points at the same CLI surface used elsewhere in the repo rather
than inventing a second launcher path just for this platform.

## Install / Update / Remove Flow

The reference artifact exposes three flows:

1. `print` renders the plist without installing it.
2. `install` writes the plist under `~/Library/LaunchAgents`, validates it,
   bootstraps it into the current user's `launchd` domain, and starts the job.
3. `uninstall` boots the job out of the current user's `launchd` domain and
   removes the plist.

Re-run `install` to apply updates to the reference launch agent.

## Supervisor Contract

Under the reviewed macOS baseline, Pirate Claw's daemon supervision contract
for this phase is:

- the daemon runs as a per-user `launchd` agent created from the repo-owned
  reference artifact
- `launchd` is the supervisor; the browser UI is not the supervisor
- browser restart surfaces may ask the daemon process to exit, but `launchd`
  is what brings the daemon back
- config, SQLite state, and runtime artifacts remain one durability boundary
  that must survive the relaunch together
- if the daemon is started outside `launchd` with a hand-managed shell,
  restart-backed behavior is no longer covered by this supported contract

## Supported Vs Developer-Only Shortcuts

The following may still be useful for local development but are not the
first-class supported Mac contract for Phase 26:

- `bun run daemon` in a terminal tab
- `bun --watch ./src/cli.ts daemon`
- tmux or screen sessions
- Homebrew services wrapping an ad hoc command

Those shortcuts are intentionally separate from the reviewed `launchd` path so
Phase 26 can make one concrete support claim instead of many weak ones.
