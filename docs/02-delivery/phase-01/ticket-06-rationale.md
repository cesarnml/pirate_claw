# P1.06 Rationale

- `Red first:` repository tests proving a queued candidate blocks later duplicates while a failed candidate remains retryable.
- `Why this path:` a single `candidate_state` row per identity with persistent `queued_at` gives later tickets one small place to check dedupe state without losing the latest outcome.
- `Alternative considered:` a latest-status-only row was rejected because writing `skipped_duplicate` after a prior `queued` outcome would erase the fact that the candidate had already been queued successfully.
- `Deferred:` submission-attempt history, CLI wiring, status rendering, and retry command orchestration remain in tickets 08-10.
