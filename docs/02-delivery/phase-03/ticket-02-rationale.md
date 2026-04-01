# P3.02 Rationale

- `Red first:` CLI and repository behavior that proved Pirate Claw had no dedicated way to refresh a queued torrent's live downloader state after the initial Transmission submission.
- `Why this path:` adding a small `reconcile` CLI path plus a narrow downloader lookup boundary was the smallest acceptable way to persist post-queue lifecycle without widening `run`, `status`, or the Phase 03 completion semantics.
- `Alternative considered:` folding reconciliation into `status` was rejected because ticket scope calls for a dedicated refresh path and live network work during status would blur the local read-only inspection boundary.
- `Deferred:` explicit `completed` and `missing_from_transmission` semantics, along with richer status presentation, remain in later Phase 03 tickets.
