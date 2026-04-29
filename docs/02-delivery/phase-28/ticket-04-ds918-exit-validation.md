# P28.04 DS918+ Exit Validation

## Goal

Validate the complete P28 auth flow on the DS918+ DSM 7.1 baseline.

## Scope

Manual validation checklist on DS918+ / DSM 7.1.1:

- [ ] First visit with no owner → setup screen shown; no app shell, no diagnostics, no torrent state visible
- [ ] Owner account creation → session issued; redirected to onboarding/dashboard
- [ ] Logout → session cleared; redirected to `/login`
- [ ] Login with correct credentials → session issued; app shell accessible
- [ ] Login with wrong credentials → error shown; no session issued
- [ ] Expired session → silent redirect to `/login` (no alarming error)
- [ ] Unauthenticated GET to app shell route → redirected to `/login`
- [ ] Unauthenticated mutating request to web API → 401 returned
- [ ] Destructive actions (torrent pause, config write, daemon restart) blocked when logged out
- [ ] Destructive actions succeed after login
- [ ] LAN origin access works without trust banner (auto-persisted during setup)
- [ ] Tailscale access from a new origin → trust banner shown; one click trusts origin; banner gone on next load
- [ ] Direct-mode acknowledgement banner appears in Config on first authenticated visit; disappears after any acknowledgement action
- [ ] Daemon restart preserves `session-secret` (existing JWT cookies remain valid)
- [ ] Fresh install (no `session-secret`) → daemon generates one on startup

Record findings in the ticket rationale. If any item fails, open a follow-up before closing this ticket.

## Out Of Scope

- New feature work
- Performance or load testing

## Exit Condition

All checklist items pass on DS918+ DSM 7.1. Findings documented in rationale.

## Rationale

_To be completed during validation._
