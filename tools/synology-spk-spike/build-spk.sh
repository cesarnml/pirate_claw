#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SOURCE_DIR="$ROOT_DIR/tools/synology-spk-spike"
BUILD_DIR="$ROOT_DIR/.pirate-claw/spk-spike/build"
OUTPUT_DIR="$ROOT_DIR/.pirate-claw/spk-spike"
PACKAGE_DIR="$BUILD_DIR/package"
SPK_PATH="$OUTPUT_DIR/pirate-claw-spk-spike.spk"

rm -rf "$BUILD_DIR"
mkdir -p "$PACKAGE_DIR/scripts" "$PACKAGE_DIR/conf" "$OUTPUT_DIR"

cp "$SOURCE_DIR/INFO" "$PACKAGE_DIR/INFO"
cp "$SOURCE_DIR/scripts/"* "$PACKAGE_DIR/scripts/"
cp "$SOURCE_DIR/conf/"* "$PACKAGE_DIR/conf/"
chmod 755 "$PACKAGE_DIR/scripts/"*

tar -C "$BUILD_DIR" -czf "$PACKAGE_DIR/package.tgz" --files-from /dev/null
tar -C "$PACKAGE_DIR" -cf "$SPK_PATH" INFO package.tgz scripts conf

echo "$SPK_PATH"
