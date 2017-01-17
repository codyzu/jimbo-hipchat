#!/usr/bin/env sh

set -e

export JIMBO_PUBLIC_URL=$(node poll-ngrok.js)
echo PUBLIC URL $JIMBO_PUBLIC_URL
node index.js
