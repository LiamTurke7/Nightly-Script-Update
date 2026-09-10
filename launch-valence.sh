#!/bin/bash
echo "Pulling latest stealth configs from Git..."
git pull origin main
if [ $? -ne 0 ]; then
    echo "[WARNING] Git pull failed. Starting browser anyway..."
    sleep 3
fi
./firefox "$@"
