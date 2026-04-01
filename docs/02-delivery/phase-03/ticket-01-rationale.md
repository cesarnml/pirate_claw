# P3.01 Rationale

- `Red first:` repository and pipeline behavior that proved a successfully queued candidate did not retain the Transmission identifiers needed for later reconciliation.
- `Why this path:` extending the existing `candidate_state` row with sticky Transmission fields was the smallest acceptable way to preserve queue identity without adding a new history table or changing the CLI surface.
- `Alternative considered:` storing downloader identity only in `feed_item_outcomes` was rejected because reconciliation needs one durable per-identity record rather than searching run-local outcome history.
- `Deferred:` active reconciliation, lifecycle transitions after queueing, and status presentation changes remain in later Phase 03 tickets.
