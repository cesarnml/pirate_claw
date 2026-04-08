# P11.03 TV shows vertical slice: TMDB show/season/episode, enrich GET /api/shows, show UI

## Goal

Enrich TV show candidates with TMDB show and season/episode metadata, serve it through the daemon API, and display it on show detail pages alongside local download state.

## Scope

- **TMDB TV:** Match shows and pull season/episode metadata into the **TV** cache table (per P11.01 schema).
- **API:** Enrich `GET /api/shows` / show breakdown payloads with TMDB fields per product doc (posters, ratings, season/episode detail as committed).
- **Web:** Show detail route: TMDB season/episode metadata **alongside** existing local candidate/download status from Phase 10; reuse poster/rating patterns from P11.02 where practical.

## Out Of Scope

- Movie-specific flows (covered in P11.02)
- Mixed candidates list enrichment (P11.04)
- Background scheduler (P11.05)

## Exit Condition

Show detail pages show TMDB-backed season/episode context when configured; graceful degrade when TMDB is off or fails.

## Rationale

TV is the heavier TMDB shape; it lands after movies so shared UI and cache patterns are already proven while keeping tickets reviewable.
