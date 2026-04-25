# Synology SPK Spike Package

Temporary P27.01 package source used to test whether DSM 7.1 Package Center hooks can create and start a Docker container without owner SSH or Docker CLI steps.

Build the local validation artifact from the repo root:

```bash
tools/synology-spk-spike/build-spk.sh
```

The script writes the generated `.spk` under `.pirate-claw/spk-spike/`, which is intentionally ignored by git.

DSM 7 requires third-party packages to declare an explicit lower-privilege execution model. The included `conf/privilege` runs lifecycle scripts as the package user so the spike validates the owner-safe Package Center path rather than relying on a root-privileged SPK.

The package uses `scripts/start-stop-status` to create a disposable `pirate-claw-spk-spike` container from `busybox:latest` and keep it running with `sleep 1d`. The uninstall hook removes that disposable container. This package is not a production installer.

## DSM 7.1 Observation

Validated on DS918+ / DSM 7.1.1 through the DSM GUI. Package Center accepted the lower-privilege SPK after the third-party package warning, but the package immediately stopped and DSM reported `System failed to start [Pirate Claw SPK Spike]`. The Package Center repair action retried the same failing start path. Docker showed neither a `pirate-claw-spk-spike` container nor a `busybox:latest` image after install and repair.

This spike therefore does not provide a working Package Center hook pattern for Docker orchestration. Without SSH or NAS-side CLI access, DSM does not expose enough owner-visible diagnostics to distinguish Docker CLI path, package-user permission, image pull, or script-shape failure. For Phase 27 delivery purposes, the owner-safe conclusion is that the DSM 7.1 `.spk` hook path failed to create/start Docker containers from Package Center alone.
