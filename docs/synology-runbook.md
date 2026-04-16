# Synology Runbook

This is the canonical operator-facing Synology deployment guide for Pirate Claw.

The historical Phase 06 validation artifact still lives at
`docs/02-delivery/phase-06/synology-runbook.md`. Keep that file for the
original validated baseline and ticket rationale trail. Use this top-level
document for current operational guidance.

## Scope

This document is for the actual NAS deployment shape that Pirate Claw now
depends on in production:

- Synology `DS918+`
- DSM `7.1.1-42962 Update 9`
- DSM `Docker` package (`Docker`, not `Container Manager`)
- always-on LAN-first operation
- separate `pirate-claw`, `pirate-claw-web`, `transmission`, and `gluetun`
  containers

## Current Production Snapshot

Observed directly on the live NAS on `2026-04-16`:

- `pirate-claw`, `pirate-claw-web`, and `transmission` were running
- `pirate-claw` restart policy: `always`
- `pirate-claw-web` restart policy: `always`
- `pirate-claw` network mode: `host`
- `pirate-claw-web` network mode: `host`
- `transmission` network mode: `container:<gluetun-id>`
- daemon API reachable on `http://localhost:5555`
- web UI reachable from the separate `pirate-claw-web` container on port `3001`

## Storage Layout

Use these host paths under `/volume1`:

- `/volume1/pirate-claw/config`
- `/volume1/pirate-claw/data`
- `/volume1/transmission/config`
- `/volume1/media/downloads`

Expected durable files and directories:

- `/volume1/pirate-claw/config/pirate-claw.config.json`
- `/volume1/pirate-claw/config/.env`
- `/volume1/pirate-claw/data/pirate-claw.db`
- `/volume1/pirate-claw/data/poll-state.json`
- `/volume1/pirate-claw/data/runtime/`
- `/volume1/transmission/config/`
- `/volume1/media/downloads/`

## Container Topology

### `pirate-claw`

Purpose:
Runs the Bun daemon and owns the HTTP API.

Observed container contract:

- image: `pirate-claw:latest`
- restart policy: `always`
- network: `host`
- command: `daemon --config /config/pirate-claw.config.json`
- entrypoint: `bun run dist/cli.js`

Required mounts:

- `/volume1/pirate-claw/config -> /config`
- `/volume1/pirate-claw/data/pirate-claw.db -> /app/pirate-claw.db`
- `/volume1/pirate-claw/data/runtime -> /app/.pirate-claw/runtime`
- `/volume1/pirate-claw/data/poll-state.json -> /app/poll-state.json`

Critical rule:

- the daemon must receive the whole `/config` directory as a writable bind mount
  if Web UI config saves are enabled
- a single-file writable bind mount for `pirate-claw.config.json` is not enough
  because Pirate Claw writes a sibling temp file and then renames it atomically
- if you want stricter secret hardening, layer a separate read-only `.env` bind
  mount on top of the writable `/config` directory, but the current live NAS now
  runs with the directory mount alone

Reason:

The live daemon supports `PUT /api/config`, `PUT /api/config/feeds`,
`PUT /api/config/tv/defaults`, and `PUT /api/config/movies`. Those writes are
real file writes, not in-memory-only updates, and they use an atomic
temp-file-plus-rename flow.

### `pirate-claw-web`

Purpose:
Runs the SvelteKit UI separately from the daemon.

Observed container contract:

- image: `pirate-claw-web:latest`
- restart policy: `always`
- network: `host`
- env:
  - `HOST=0.0.0.0`
  - `PORT=3001`
  - `ORIGIN=http://100.108.117.42:3001` in the current live deployment
  - `PIRATE_CLAW_API_URL=http://localhost:5555`
  - `PIRATE_CLAW_API_WRITE_TOKEN=<same write token the daemon accepts>`

Critical rule:

- when using SvelteKit `adapter-node`, set `ORIGIN` to the actual browser-facing
  origin for the web UI
- `HOST=0.0.0.0` is only the bind address, not a valid browser origin
- without `ORIGIN`, form actions fail with `Cross-site POST form submissions are forbidden`

### `transmission`

Purpose:
Downloader runtime.

Observed container contract:

- image: `linuxserver/transmission:latest`
- restart policy: `always`
- network: `container:<gluetun-id>`

Required mounts:

- `/volume1/transmission/config -> /config`
- `/volume1/media/downloads -> /downloads`

### `gluetun`

Purpose:
Provides the shared network namespace for Transmission in the current live
deployment.

This is part of the current production profile and should be documented
explicitly anywhere the Transmission network mode is described.

## Config And Secrets Contract

Use `/volume1/pirate-claw/config/.env` for secrets that should not live in the
JSON config.

Minimum expected keys in the current deployment:

- `PIRATE_CLAW_API_WRITE_TOKEN`
- `PIRATE_CLAW_TRANSMISSION_USERNAME`
- `PIRATE_CLAW_TRANSMISSION_PASSWORD`

The daemon currently also supports inline Transmission credentials in
`pirate-claw.config.json`, but the recommended operator stance is:

- keep the write token and Transmission credentials in `.env`
- keep `pirate-claw.config.json` for non-secret runtime and policy settings

## Plex Media Server Integration (Phase 18)

Plex enrichment is optional. Add a `plex` block to
`/volume1/pirate-claw/config/pirate-claw.config.json` to enable it:

```json
{
  "plex": {
    "url": "http://192.168.1.10:32400",
    "token": "YOUR_PLEX_TOKEN",
    "refreshIntervalMinutes": 30
  }
}
```

- `url`: base URL of the local Plex Media Server — use the LAN IP, not
  `localhost`, so the pirate-claw container can reach it
- `token`: your Plex authentication token (see below for how to find it)
- `refreshIntervalMinutes`: how often the background refresh fires; defaults to
  `30`; set `0` to disable background refresh

The token is redacted in `GET /api/config` responses. If you prefer to keep it
out of the JSON file entirely, set `PIRATE_CLAW_PLEX_TOKEN` in
`/volume1/pirate-claw/config/.env` instead and omit the `token` field.

### How To Find Your Plex Token

1. Sign in to Plex Web at `http://<nas-ip>:32400/web`
2. Play any item, then open the developer console
3. Look for any request to the Plex API — the token appears as the
   `X-Plex-Token` query parameter
4. Alternatively: Settings → Account → `<username>` XML link; the token is in
   the `authToken` attribute

### Verification

After restarting the `pirate-claw` container with the `plex` block configured:

```sh
curl -s http://localhost:5555/api/movies | jq '.[0] | {plexStatus, watchCount, lastWatchedAt}'
```

Expected on first boot (before the first refresh sweep completes):

```json
{ "plexStatus": "unknown", "watchCount": null, "lastWatchedAt": null }
```

Expected after the first refresh sweep:

```json
{
  "plexStatus": "in_library",
  "watchCount": 3,
  "lastWatchedAt": "2026-01-15T21:00:00.000Z"
}
```

or `"missing"` for items not found in the Plex library.

If Plex is unreachable, the daemon logs a warning and continues; existing cache
entries are preserved and API responses return `"unknown"` for expired rows.

## Runtime Config Contract

The current live config uses:

- `runtime.artifactDir: ".pirate-claw/runtime"`
- `runtime.apiPort: 5555`
- `runtime.tmdbRefreshIntervalMinutes: 360`

That path is relative to the daemon working directory and maps to the mounted
host directory through:

- host: `/volume1/pirate-claw/data/runtime`
- container: `/app/.pirate-claw/runtime`

## Known Drift Reconciled On 2026-04-16

The historical Phase 06 runbook no longer matches the live NAS in several
important ways:

- the canonical runbook used to live under `docs/02-delivery/phase-06/`
- production now includes a separate `pirate-claw-web` container
- production now runs Transmission behind `gluetun`
- the daemon runtime mount uses `/app/.pirate-claw/runtime`, not `/data/runtime`
- the old runbook described the daemon config file mount as read-only, which
  breaks Web UI config writes

## Required Fix For Web UI Saves

If the daemon config file is mounted read-only, authenticated Web UI saves fail
with a `500`.

The correct deployment contract is:

1. mount `/volume1/pirate-claw/config` writable at `/config` in the
   `pirate-claw` container
2. restart `pirate-claw`
3. verify `PUT /api/config` succeeds before trusting the UI
4. optionally re-add a read-only file mount for `/config/.env` if you want
   stronger secret isolation

## Verification Commands

Run on the NAS shell:

```sh
sudo -n /usr/local/bin/docker ps --format '{{.Names}}|{{.Image}}|{{.Status}}'
sudo -n /usr/local/bin/docker inspect pirate-claw --format '{{range .Mounts}}{{.Source}}|{{.Destination}}|{{.Mode}}|RW={{.RW}}{{println}}{{end}}'
sudo -n /usr/local/bin/docker inspect pirate-claw-web --format '{{range .Config.Env}}{{println .}}{{end}}' | grep PIRATE_CLAW_API_URL
curl -si http://localhost:5555/api/config | sed -n '1,20p'
```

Expected checks:

- all required containers are `Up`
- `/config` is writable in the daemon container
- the daemon API returns `200 OK`
- a config write no longer returns `500`

## Historical Validation Trail

For the original Phase 06 ticket-by-ticket validation record, use:

- `docs/01-product/phase-06-synology-runbook.md`
- `docs/02-delivery/phase-06/implementation-plan.md`
- `docs/02-delivery/phase-06/synology-runbook.md`
