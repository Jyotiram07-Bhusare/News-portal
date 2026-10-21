#!/usr/bin/env bash
# One-time preparation of the SHARED EC2 server for the news portal API. Run as root (sudo). Safe to run again.
#
#   sudo ORIGIN_SECRET='<the secret CloudFront sends>' bash setup-server.sh
#
# It only ADDS things of its own: the folder /opt/lokportal (compose file, nginx config, the deploy script, the settings file).
# It does not touch the other projects, their containers, nginx / Caddy, users, SSH keys, or any port (8445 is published later by docker compose).
set -euo pipefail

: "${ORIGIN_SECRET:?set ORIGIN_SECRET (the X-Origin-Verify value CloudFront sends)}"
SRC="$(cd "$(dirname "$0")" && pwd)"
BASE=/opt/lokportal

[ "$(id -u)" -eq 0 ] || { echo "Run this as root (sudo)."; exit 1; }
command -v docker >/dev/null || { echo "docker is needed."; exit 1; }

install -d -o root -g root -m 755 "$BASE" "$BASE/releases"
install -m 644 "$SRC/docker-compose.yml" "$BASE/docker-compose.yml"
sed "s/__ORIGIN_SECRET__/$ORIGIN_SECRET/g" "$SRC/nginx.conf" > "$BASE/nginx.conf"; chmod 640 "$BASE/nginx.conf"
install -m 755 "$SRC/deploy-entry.sh" "$BASE/deploy-entry.sh"
# secrets: filled in by the administrator (never in git). The container's user (uid 10001) is the only one that may read it.
[ -f "$BASE/backend.env" ] || install -m 600 -o 10001 -g 10001 /dev/null "$BASE/backend.env"
echo "ready: $BASE"
ls -la "$BASE"
