# Synology Runbook

This is the canonical Phase 06 operator runbook for the validated Synology baseline.

## Validated Baseline

This runbook is being validated only against:

- Synology `DS918+`
- DSM `7.1.1-42962 Update 9`
- Synology Container Manager
- always-on local-LAN-first operation

Treat any other Synology model, DSM version, or remote-access-first setup as non-validated unless the runbook explicitly says otherwise.

## Runbook Rules

- Use one canonical known-good Pirate Claw image reference throughout the runbook once that image is validated in a later ticket.
- Use fake-but-concrete example values in commands, paths, container names, and screenshots so the operator can map the pattern to their own NAS without leaking real secrets.
- Keep this document operator-facing. Put only the verification cues an operator needs here. Raw proof, screenshots collected during ticket work, and detailed validation notes belong in the ticket rationale.
- Do not widen the baseline beyond the exact validated hardware, DSM version, and Container Manager path.

## Acceptance Checklist

Later Phase 06 tickets are complete only when they preserve this baseline and leave the runbook in a state that supports all of the following:

- one canonical operator journey from Synology storage preparation through steady-state operation
- explicit durable bind-mounted paths for Pirate Claw state, Transmission state, and download or media storage
- one known-good Transmission container baseline
- one known-good Pirate Claw container baseline using the existing daemon mode
- documented env and secret injection with no hidden prerequisites
- restart expectations and operator verification steps for always-on operation
- upgrade guidance that preserves durable state
- one fresh end-to-end validation pass on a clean `DS918+ / DSM 7.1.1-42962 Update 9` environment
- a troubleshooting section tied to the validated baseline
- a final portability section that clearly separates likely-portable notes from validated claims

## Evidence Boundary

Use this runbook for operator instructions and lightweight verification cues such as:

- where to click in DSM or Container Manager
- what mount or environment field should exist
- what success state the operator should see
- what command to run for a quick check

Keep raw proof outside the runbook, in the active ticket rationale, including:

- screenshots captured while validating a step
- exact command output
- permission or mount inspection output
- logs gathered during validation
- rejected alternatives or follow-up notes

## Operator Journey

Follow the sections in order. Later tickets will replace placeholders with validated instructions.

## 1. Preflight And Assumptions

Purpose:
Confirm the exact NAS baseline, the operator prerequisites, and the image-reference rule before changing the system.

Verification cues to keep here:

- confirm the NAS model is `DS918+`
- confirm DSM reports `7.1.1-42962 Update 9`
- confirm Container Manager is installed
- confirm the operator has local-LAN access to DSM and NAS shell access if shell validation is required

## 2. Storage Layout And Shared Folder Preparation

Purpose:
Create and verify the durable Synology folder layout and bind-mount targets required by both containers.

Verification cues to keep here:

- target shared folders and subdirectories exist
- intended mount targets are writable by the runtime users the containers will use
- operator can prove the expected path layout before creating containers

## 3. Transmission Container Baseline

Purpose:
Create the known-good Transmission container baseline that uses the validated bind mounts.

Verification cues to keep here:

- image reference used
- container name and restart policy
- required ports and mount targets
- UI or log checks that show Transmission is healthy

## 4. Pirate Claw Container Baseline

Purpose:
Create the known-good Pirate Claw container baseline and run the existing daemon mode against the validated storage paths.

Verification cues to keep here:

- image reference used
- container command or entrypoint used for daemon mode
- required bind mounts and config path expectations
- log or status checks that show the daemon is running truthfully

## 5. Secrets And Environment Injection

Purpose:
Document the exact env and secret inputs needed by the validated baseline.

Verification cues to keep here:

- where env values are entered in Container Manager
- which values are examples versus operator-provided secrets
- how the operator confirms the container received the expected non-secret settings

## 6. Restart Semantics And Always-On Checks

Purpose:
Show how the validated containers behave across restart scenarios and what the operator should verify afterward.

Verification cues to keep here:

- expected restart policy settings
- what should survive container recreation or NAS reboot
- which logs, UI states, or commands confirm healthy recovery

## 7. Upgrade Path

Purpose:
Document the supported update path from one known-good image state to the next without losing durable state.

Verification cues to keep here:

- what to back up or snapshot before replacement
- what gets recreated versus what stays bind-mounted
- which post-upgrade checks prove the baseline still holds

## 8. Fresh End-To-End Validation

Purpose:
Walk a clean-environment operator through the full happy path and confirm the exit condition directly.

Verification cues to keep here:

- one explicit validation input and expected result
- exact end-state checks for both containers and durable paths
- anything the operator must verify before calling the run complete

## 9. Troubleshooting

Purpose:
Provide the shortest useful path to inspect the most likely failures on the validated baseline.

Verification cues to keep here:

- where to inspect logs
- how to verify mounts, permissions, and container state
- how to distinguish storage mistakes from app or container mistakes

## 10. Portability Notes

Purpose:
Separate validated claims from nearby but non-validated Synology variants.

Verification cues to keep here:

- label non-validated notes explicitly
- do not present portability guesses as baseline truth
