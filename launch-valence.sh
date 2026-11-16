#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# If a .seb file is provided as argument, activate it
if [ -n "$1" ] && [[ "$1" == *.seb ]] && [ -f "$1" ]; then
    echo "Loading SEB configuration from: $1"
    cp -f "$1" "$SCRIPT_DIR/exam.seb"
    echo "Activated as current exam profile: $SCRIPT_DIR/exam.seb"
    shift
fi

echo "Pulling latest stealth configs from Git..."
git pull origin main
if [ $? -ne 0 ]; then
    echo "[WARNING] Git pull failed. Starting browser anyway..."
    sleep 3
fi

# Clean up stale locks for nightly profile if no process is holding them
for lockfile in ~/.config/mozilla/firefox/*nightly*/lock ~/.config/mozilla/firefox/*nightly*/.parentlock "$SCRIPT_DIR"/lock "$SCRIPT_DIR"/.parentlock; do
    if [ -e "$lockfile" ] || [ -L "$lockfile" ]; then
        if ! fuser "$lockfile" >/dev/null 2>&1; then
            rm -f "$lockfile"
        fi
    fi
done

cd "$SCRIPT_DIR"
./firefox "$@"

