# `P3.01` Rationale

- Red first: a queued candidate could not be reconciled later because Pirate Claw discarded the Transmission identity returned at submission time.
- Smallest acceptable path: keep the existing queue flow and extend `candidate_state` with sticky Transmission identifiers captured only on successful queueing.
- Rejected alternative: introducing a separate lifecycle table in ticket 01 would widen scope before any reconciliation behavior exists.
- Deferred: live Transmission lookup, richer post-queue state, and status output changes remain in later Phase 03 tickets.
