# DSM 7.2+ Container Manager Install

Validation status: pending external DSM 7.2+ tester verification.

This path is included for newer Synology systems that support Container Manager Projects. It uses `compose.synology.cm.yml` from this bundle.

## Before You Start

- Confirm Container Manager is installed.
- Keep the default install root: `/volume1/pirate-claw`.
- Do not place secrets in the compose file. Pirate Claw generates its daemon write token on first startup.

## Prepare The DSM Folders

1. Open File Station.
2. Create or confirm `/volume1/pirate-claw`.
3. Create or confirm these folders:
   - `config`
   - `data`
   - `downloads`
   - `downloads/incomplete`
   - `media`
   - `media/movies`
   - `media/shows`
   - `transmission/config`

Existing folders and files are kept. Do not delete an existing Pirate Claw install root during repair or reinstall.

## Import The Project

1. Open Container Manager.
2. Open Project.
3. Choose Create or Import from compose file, depending on the DSM wording.
4. Select `compose.synology.cm.yml` from this bundle.
5. Name the project `pirate-claw-synology`.
6. Confirm the project uses `/volume1/pirate-claw` as the host folder source for Pirate Claw data.
7. Create the project.
8. Start the project if Container Manager does not start it automatically.

## Open Pirate Claw

1. Open `http://<nas-ip>:8888` in a browser.
2. On the onboarding page, review Synology install health.
3. If a check fails, follow the DSM-language remediation shown on the page, then use Re-check.
4. Continue Pirate Claw setup only after install health passes.

## Screenshot Placeholders

P27.08 leaves `screenshots/dsm-7.2-container-manager/` marked pending unless an external DSM 7.2+ tester supplies validation captures.
