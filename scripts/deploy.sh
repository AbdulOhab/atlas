#!/usr/bin/env bash
# Deploy main to the production server: pull, rebuild the image, replace the
# container. podman-compose 1.0.6 won't replace a running container on
# `up --build`, so the old one is taken down explicitly once the new image
# has built. The site is down for a few seconds while the container restarts.
#
# Usage: scripts/deploy.sh   (push to origin/main first)
#
# Server details stay out of the repository. Set them in the environment or
# in an untracked `.deploy.env` at the repo root:
#   DEPLOY_HOST=user@host  DEPLOY_KEY=~/.ssh/key  DEPLOY_DIR=path/on/server  DEPLOY_URL=https://…
set -euo pipefail

cd "$(dirname "$0")/.."
[ -f .deploy.env ] && . ./.deploy.env
: "${DEPLOY_HOST:?set DEPLOY_HOST (see .deploy.env)}"
: "${DEPLOY_KEY:?set DEPLOY_KEY}"
: "${DEPLOY_DIR:?set DEPLOY_DIR}"
: "${DEPLOY_URL:?set DEPLOY_URL}"
HOST="$DEPLOY_HOST" KEY="$DEPLOY_KEY" DIR="$DEPLOY_DIR" URL="$DEPLOY_URL"

if [ -n "$(git status --porcelain)" ] || [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
  echo "Commit and push to origin/main before deploying." >&2
  exit 1
fi

ssh -i "$KEY" -o BatchMode=yes "$HOST" bash -s -- "$DIR" <<'REMOTE'
set -euo pipefail
cd "$1"
git pull --ff-only -q
echo "server at: $(git log --oneline -1)"
podman-compose build > /tmp/atlas-deploy.log 2>&1 || { tail -30 /tmp/atlas-deploy.log; exit 1; }
podman-compose down > /dev/null 2>&1
podman-compose up -d > /dev/null 2>&1
for _ in $(seq 1 30); do
  curl -sf -o /dev/null http://127.0.0.1:24030/ && { echo "container up"; exit 0; }
  sleep 1
done
echo "container did not answer within 30s" >&2
exit 1
REMOTE

code=$(curl -s -o /dev/null -w "%{http_code}" "$URL/")
echo "$URL -> $code"
[ "$code" = 200 ]
