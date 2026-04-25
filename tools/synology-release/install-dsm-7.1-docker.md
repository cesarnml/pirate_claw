# DSM 7.1 Docker Install

Validated baseline: Synology DS918+, DSM 7.1.1-42962 Update 9, legacy Docker package.

## Before You Start

- Confirm the DSM Docker package is installed.
- Confirm the Pirate Claw application images are available in Docker's Image view. If the images are not visible there, stop and wait for the release image publication or a DSM GUI image import source.
- Keep the default install root: `/volume1/pirate-claw`.

## Install The Package

1. Open Package Center.
2. Choose Manual Install.
3. Select `pirate-claw.spk` from this bundle.
4. Accept the third-party package confirmation if DSM shows it.
5. Finish the install.
6. Open Main Menu and confirm the Pirate Claw icon is present.

The package is a launcher and install-root artifact package. It does not create or start Docker containers from package hooks on DSM 7.1.

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

## Create The Docker Containers

Use the Docker package GUI only.

1. Open Docker.
2. In Image, confirm these images are present:
   - `pirate-claw:latest`
   - `pirate-claw-web:latest`
   - `lscr.io/linuxserver/transmission:latest`
3. Create a user-defined Docker network named `pirate-claw` if Docker asks for a network during container setup.
4. Create the Transmission container:
   - Image: `lscr.io/linuxserver/transmission:latest`
   - Container name: `transmission`
   - Network: `pirate-claw`
   - Do not publish port `9091`.
   - Map `/volume1/pirate-claw/transmission/config` to `/config`.
   - Map `/volume1/pirate-claw/downloads` to `/downloads`.
   - Map `/volume1/pirate-claw/downloads/incomplete` to `/incomplete-downloads`.
   - Map `/volume1/pirate-claw/media` to `/media`.
5. Create the Pirate Claw daemon container:
   - Image: `pirate-claw:latest`
   - Container name: `pirate-claw-daemon`
   - Network: `pirate-claw`
   - Do not publish port `5555`.
   - Map `/volume1/pirate-claw` to `/volume1/pirate-claw`.
   - Set the command to run the daemon with config path `/volume1/pirate-claw/config/pirate-claw.config.json`.
   - Set environment values through Docker's GUI fields:
     - `PIRATE_CLAW_INSTALL_ROOT` = `/volume1/pirate-claw`
     - `PIRATE_CLAW_API_HOST` = `0.0.0.0`
     - `PIRATE_CLAW_API_PORT` = `5555`
     - `PIRATE_CLAW_TRANSMISSION_URL` = `http://transmission:9091/transmission/rpc`
6. Start the daemon container and wait for it to create the generated token file under the install root.
7. Create the Pirate Claw web container:
   - Image: `pirate-claw-web:latest`
   - Container name: `pirate-claw-web`
   - Network: `pirate-claw`
   - Publish host port `8888` to container port `8888`.
   - Map `/volume1/pirate-claw` to `/volume1/pirate-claw` as read-only if Docker offers a read-only option.
   - Set environment values through Docker's GUI fields:
     - `HOST` = `0.0.0.0`
     - `PORT` = `8888`
     - `PIRATE_CLAW_API_URL` = `http://pirate-claw-daemon:5555`
     - `PIRATE_CLAW_DAEMON_TOKEN_FILE` = `/volume1/pirate-claw/config/generated/daemon-api-write-token`
8. Start the web container.

## Open Pirate Claw

1. Open the Pirate Claw icon from DSM Main Menu, or open `http://<nas-ip>:8888` in a browser.
2. On the onboarding page, review Synology install health.
3. If a check fails, follow the DSM-language remediation shown on the page, then use Re-check.
4. Continue Pirate Claw setup only after install health passes.

## Screenshot Placeholders

P27.08 fills `screenshots/dsm-7.1-docker/` with the Package Center, Docker, Main Menu, browser, and first-run health captures.
