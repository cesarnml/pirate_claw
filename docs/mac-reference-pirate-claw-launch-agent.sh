#!/bin/sh

set -eu

PROGRAM_NAME=$(basename "$0")
DEFAULT_LABEL="dev.pirate-claw.daemon"

usage() {
  cat <<EOF
Usage:
  $PROGRAM_NAME print --install-dir <path> [--bun <path>] [--config <path>] [--label <label>]
  $PROGRAM_NAME install --install-dir <path> [--bun <path>] [--config <path>] [--label <label>] [--agent-dir <path>]
  $PROGRAM_NAME uninstall [--label <label>] [--agent-dir <path>]

Commands:
  print       Render the reference launch agent plist to stdout.
  install     Write the plist to ~/Library/LaunchAgents (or --agent-dir) and bootstrap it.
  uninstall   Boot out the launch agent and remove the plist file.

Defaults:
  --label     $DEFAULT_LABEL
  --agent-dir \$HOME/Library/LaunchAgents
  --config    <install-dir>/pirate-claw.config.json

Contract:
  - The install directory is the Pirate Claw durable boundary.
  - The daemon runs from that directory with WorkingDirectory set to it.
  - The daemon uses <install-dir>/pirate-claw.config.json by default.
  - SQLite state stays at <install-dir>/pirate-claw.db.
  - Runtime artifacts and launchd logs stay under <install-dir>/.pirate-claw/runtime/.
EOF
}

fail() {
  echo "$PROGRAM_NAME: $*" >&2
  exit 1
}

xml_escape() {
  printf '%s' "$1" | sed \
    -e 's/&/\&amp;/g' \
    -e 's/</\&lt;/g' \
    -e 's/>/\&gt;/g' \
    -e "s/'/\&#39;/g" \
    -e 's/"/\&quot;/g'
}

resolve_existing_dir() {
  target=$1
  (
    cd "$target" >/dev/null 2>&1 || exit 1
    pwd -P
  ) || fail "directory does not exist: $target"
}

resolve_path_from_parent() {
  target=$1
  parent=$(dirname "$target")
  base=$(basename "$target")
  parent_abs=$(resolve_existing_dir "$parent")
  printf '%s/%s\n' "$parent_abs" "$base"
}

resolve_bun_path() {
  if [ -n "${BUN_PATH:-}" ]; then
    printf '%s\n' "$BUN_PATH"
    return
  fi

  if command -v bun >/dev/null 2>&1; then
    command -v bun
    return
  fi

  if [ -x "${HOME}/.bun/bin/bun" ]; then
    printf '%s\n' "${HOME}/.bun/bin/bun"
    return
  fi

  fail "bun executable not found; pass --bun <absolute-path>"
}

render_plist() {
  install_dir_escaped=$(xml_escape "$INSTALL_DIR")
  config_path_escaped=$(xml_escape "$CONFIG_PATH")
  bun_path_escaped=$(xml_escape "$BUN_PATH")
  cli_path_escaped=$(xml_escape "$CLI_PATH")
  stdout_path_escaped=$(xml_escape "$STDOUT_PATH")
  stderr_path_escaped=$(xml_escape "$STDERR_PATH")
  label_escaped=$(xml_escape "$LABEL")
  user_home_escaped=$(xml_escape "$HOME")

  cat <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$label_escaped</string>
  <key>ProgramArguments</key>
  <array>
    <string>$bun_path_escaped</string>
    <string>run</string>
    <string>$cli_path_escaped</string>
    <string>daemon</string>
    <string>--config</string>
    <string>$config_path_escaped</string>
  </array>
  <key>WorkingDirectory</key>
  <string>$install_dir_escaped</string>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>ProcessType</key>
  <string>Background</string>
  <key>StandardOutPath</key>
  <string>$stdout_path_escaped</string>
  <key>StandardErrorPath</key>
  <string>$stderr_path_escaped</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>HOME</key>
    <string>$user_home_escaped</string>
  </dict>
</dict>
</plist>
EOF
}

COMMAND=${1:-}
[ -n "$COMMAND" ] || {
  usage
  exit 1
}
shift

LABEL=$DEFAULT_LABEL
AGENT_DIR="${HOME}/Library/LaunchAgents"
INSTALL_DIR=
CONFIG_PATH=
BUN_PATH=

while [ "$#" -gt 0 ]; do
  case "$1" in
    --install-dir)
      [ "$#" -ge 2 ] || fail "missing value for --install-dir"
      INSTALL_DIR=$2
      shift 2
      ;;
    --config)
      [ "$#" -ge 2 ] || fail "missing value for --config"
      CONFIG_PATH=$2
      shift 2
      ;;
    --bun)
      [ "$#" -ge 2 ] || fail "missing value for --bun"
      BUN_PATH=$2
      shift 2
      ;;
    --label)
      [ "$#" -ge 2 ] || fail "missing value for --label"
      LABEL=$2
      shift 2
      ;;
    --agent-dir)
      [ "$#" -ge 2 ] || fail "missing value for --agent-dir"
      AGENT_DIR=$2
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      fail "unknown argument: $1"
      ;;
  esac
done

case "$COMMAND" in
  print|install)
    [ -n "$INSTALL_DIR" ] || fail "--install-dir is required for $COMMAND"
    INSTALL_DIR=$(resolve_existing_dir "$INSTALL_DIR")
    CLI_PATH="$INSTALL_DIR/src/cli.ts"
    [ -f "$CLI_PATH" ] || fail "expected CLI at $CLI_PATH"
    BUN_PATH=$(resolve_path_from_parent "$(resolve_bun_path)")
    if [ -n "$CONFIG_PATH" ]; then
      CONFIG_PATH=$(resolve_path_from_parent "$CONFIG_PATH")
    else
      CONFIG_PATH="$INSTALL_DIR/pirate-claw.config.json"
    fi
    RUNTIME_DIR="$INSTALL_DIR/.pirate-claw/runtime"
    LOG_DIR="$RUNTIME_DIR/logs"
    STDOUT_PATH="$LOG_DIR/launchd.stdout.log"
    STDERR_PATH="$LOG_DIR/launchd.stderr.log"
    ;;
  uninstall)
    ;;
  *)
    fail "unknown command: $COMMAND"
    ;;
esac

case "$COMMAND" in
  print)
    render_plist
    ;;
  install)
    AGENT_DIR=$(resolve_path_from_parent "$AGENT_DIR")
    PLIST_PATH="$AGENT_DIR/$LABEL.plist"
    DOMAIN_TARGET="gui/$(id -u)"
    mkdir -p "$AGENT_DIR" "$LOG_DIR"
    tmp_plist=$(mktemp "${TMPDIR:-/tmp}/pirate-claw-launchd.XXXXXX.plist")
    trap 'rm -f "$tmp_plist"' EXIT INT TERM HUP
    render_plist >"$tmp_plist"
    plutil -lint "$tmp_plist" >/dev/null
    if [ -f "$PLIST_PATH" ]; then
      launchctl bootout "$DOMAIN_TARGET" "$PLIST_PATH" >/dev/null 2>&1 || true
      rm -f "$PLIST_PATH"
    fi
    mv "$tmp_plist" "$PLIST_PATH"
    trap - EXIT INT TERM HUP
    launchctl bootstrap "$DOMAIN_TARGET" "$PLIST_PATH"
    launchctl enable "$DOMAIN_TARGET/$LABEL" >/dev/null 2>&1 || true
    launchctl kickstart -k "$DOMAIN_TARGET/$LABEL"
    echo "installed $PLIST_PATH"
    ;;
  uninstall)
    AGENT_DIR=$(resolve_path_from_parent "$AGENT_DIR")
    PLIST_PATH="$AGENT_DIR/$LABEL.plist"
    DOMAIN_TARGET="gui/$(id -u)"
    if [ -f "$PLIST_PATH" ]; then
      launchctl bootout "$DOMAIN_TARGET" "$PLIST_PATH" >/dev/null 2>&1 || true
      rm -f "$PLIST_PATH"
      echo "removed $PLIST_PATH"
    else
      echo "launch agent not installed at $PLIST_PATH"
    fi
    ;;
esac
