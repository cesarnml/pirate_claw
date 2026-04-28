# Pirate Claw v1: GTM, Positioning, and Privacy-Safe Telemetry

Date: 2026-04-29

## Executive stance

- Pirate Claw should not fully remove TMDB at v1.
- Preferred direction: Plex-first enrichment with TMDB as optional fallback.
- Rationale: keep operational simplicity while preserving resilience and richer metadata when Plex is thin or unavailable.

## Competitive complexity: DSM 7.1 now, DSM 7.2.1 next

### Current (Phase27 delivered, DSM 7.1 path)

- Pirate Claw remains materially simpler than a Prowlarr + Radarr + Sonarr + Overseerr stack on Synology.
- Biggest advantage is lower moving-parts count and less cross-service wiring/debugging.
- Typical first working path is significantly shorter than a full arr-stack setup.

### Near-term (Phase31, DSM 7.2.1 Container Manager preferred path)

- Expected to further reduce Synology install and maintenance friction.
- Should strengthen "single product path" positioning versus "multi-service integration project."

### Parallel advantage (Phase30 Mac GUI-only install)

- Removes CLI barrier for Mac users.
- Combined with Phase31 gives clear, simple install story:
  - Mac: GUI-first onboarding
  - Synology: Container Manager-first onboarding

## Positioning and claims

### Core positioning

- "Fewer moving parts than a traditional arr stack."
- "Faster time to first working pipeline."
- "Simpler day-2 operations for Synology and Mac operators."

### Safe public claims

- Avoid "always faster" or absolute install time promises.
- Avoid "feature parity with arr stack" claims.
- Keep explicit tradeoff:
  - arr stack = deeper knobs and flexibility
  - Pirate Claw = lower setup/ops burden

### Punchy one-liner

- "Pirate Claw trades multi-app flexibility for radically simpler setup and day-2 operations."

## Where to market after v1

Priority channels:

1. Reddit (`r/selfhosted`, `r/plex`, `r/synology`, `r/sonarr`, `r/radarr`)
2. Discord self-hosting/Plex/homelab communities
3. GitHub + Show HN launch post
4. YouTube creator demos (small/mid channels)
5. Synology/Plex forums

Message format that should convert:

- Problem-first narrative ("why this exists")
- 60-90 second demo:
  1. install
  2. Plex browser auth
  3. first successful pipeline
- Honest tradeoffs in every launch post

## Suggested launch sequence

- Week 1: small private beta (20-40 users)
- Week 2: public beta post + short demo
- Week 3: v1 launch across Reddit, Show HN, GitHub release/docs
- Week 4+: creator outreach + weekly "what got easier" changelog posts

## v1 metrics to track

- Activation: installs reaching first successful pipeline within 30 minutes
- Time-to-value: median minutes install -> first success
- Retention: day-7 active instances
- Referral/source mix: where successful installs came from

## Privacy-safe telemetry tech and policy

## Recommended tools

- Product events: self-hosted PostHog
- Error telemetry: Sentry (self-hosted or cloud, privacy-minimized config)
- Docs/marketing traffic (optional): Plausible

## Data minimization rules

- Generate local random `instance_id` once; store locally.
- Never collect:
  - usernames/emails
  - Plex tokens/API keys/feed URLs
  - torrent names/raw media titles
  - sensitive free-form strings
- Avoid storing raw IPs; anonymize or truncate where possible.
- Keep event payloads coarse: counters, durations, booleans, platform/app-version tags.

## Suggested event set

- `install_started`, `install_completed`
- `onboarding_started`, `onboarding_completed`
- `plex_connect_started`, `plex_connect_succeeded`, `plex_connect_failed` (category only)
- `first_pipeline_success`
- `readiness_flap_detected`
- `daemon_restart_requested`, `daemon_restart_recovered`

Suggested properties:

- `app_version`
- `platform` (e.g. `dsm_7_1`, `dsm_7_2_1`, `mac`)
- `install_path` (e.g. `phase27`, `phase30`, `phase31`)
- durations and success/failure booleans

## Consent and transparency

- Prefer opt-in telemetry (or "errors-only" baseline if required).
- First-run consent choices:
  - Off
  - Anonymous usage
  - Anonymous usage + crash reports
- In-product toggle + reset/delete local telemetry identifier.
- Publish `PRIVACY.md` with explicit collected event schema and retention.

## Operational safeguards

- Server-side schema validation (reject unknown fields).
- Redaction/scrubbing middleware for accidental sensitive values.
- Short retention with automated purge.
- No fingerprinting or cross-product ad identifiers.
