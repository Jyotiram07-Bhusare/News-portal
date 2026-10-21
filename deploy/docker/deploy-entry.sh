#!/usr/bin/env bash
# The ONLY thing the GitHub Actions deploy key may do (authorized_keys: restrict,command="/opt/lokportal/deploy-entry.sh" ...).
# It receives a tar.gz of the backend/ folder on stdin, builds the image, adds new database tables / columns, switches the API container to
# the new image, checks that it answers and goes back to the previous version when it does not.
# Installed (root-owned, not writable by the key) by setup-server.sh.
set -euo pipefail

BASE=/opt/lokportal
COMPOSE="$BASE/docker-compose.yml"

case "${SSH_ORIGINAL_COMMAND:-deploy}" in
  deploy) ;;
  *) echo "Only 'deploy' is allowed here." >&2; exit 2 ;;
esac

# One deploy at a time; a dropped SSH connection must not stop the script half-way through the switch.
exec 9>"$BASE/releases/.lock"
flock -n 9 || { echo "Another deploy is running - try again in a few minutes." >&2; exit 4; }
trap '' HUP

# The server is shared with other projects: no build when the disk is nearly full (building an image needs about 1.5 GB).
FREE_KB="$(df -Pk /var/lib/docker | awk 'NR==2 {print $4}')"
if [ "${FREE_KB:-0}" -lt 3000000 ]; then
  echo "Less than 3 GB free on the server disk - not deploying." >&2
  exit 5
fi

# (host names of the database are not needed in the build log)
quiet() { sed -E 's/[A-Za-z0-9.-]+\.rds\.amazonaws\.com/<database>/g'; }

ID="$(date +%Y%m%d-%H%M%S)"
REL="$BASE/releases/$ID"
mkdir -p "$REL"
trap 'rm -rf "$REL"' ERR

echo "==> receiving the code"
head -c 31457280 | tar -xzf - -C "$REL" --no-same-owner --no-same-permissions       # (at most 30 MB; backend/ is about 1 MB)
[ -f "$REL/Dockerfile" ] && [ -f "$REL/app.py" ] || { echo "The upload does not look like backend/." >&2; exit 3; }

echo "==> building lokportal-api:$ID"
timeout 900 nice -n 10 docker build --quiet -t "lokportal-api:$ID" "$REL" >/dev/null

# Database: new tables / columns that the new code needs are added first (additive only, no row is touched). It runs with a dedicated MySQL user
# (lokportal_migrate: may create / alter tables of OUR database only - the web application's own user may not). When it fails the deploy stops
# here and the running version is not touched. Without /opt/lokportal/migrate.env the step is skipped.
if [ -r "$BASE/migrate.env" ]; then
  echo "==> database: new tables / columns"
  docker run --rm --env-file "$BASE/migrate.env" -v "$BASE/backend.env:/app/.env:ro" "lokportal-api:$ID" python init_db.py --schema-only 2>&1 | quiet
else
  echo "(no $BASE/migrate.env: a new table / column would have to be added by hand - init_db.py --schema-only)"
fi

if docker image inspect lokportal-api:current >/dev/null 2>&1; then
  docker tag lokportal-api:current lokportal-api:previous
fi
docker tag "lokportal-api:$ID" lokportal-api:current

# "started" = the program answers. (/api/live does not touch the database: a database that is busy for a minute must not undo a good deploy.)
healthy() {
  for _ in $(seq 1 30); do
    if docker exec lokportal-api python -c "import sys,urllib.request; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:5000/api/live', timeout=4).status == 200 else 1)" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  return 1
}

echo "==> starting it"
if docker compose -f "$COMPOSE" up -d --no-deps --force-recreate api && healthy; then
  echo "==> the API answers - deployed $ID"
else
  echo "!! the new version does not start - going back to the previous one" >&2
  docker logs --tail 40 lokportal-api 2>&1 | quiet >&2 || true
  if docker image inspect lokportal-api:previous >/dev/null 2>&1; then
    docker tag lokportal-api:previous lokportal-api:current
    if docker compose -f "$COMPOSE" up -d --no-deps --force-recreate api && healthy; then
      echo "==> the previous version is running again" >&2
    else
      echo "!! the previous version does not answer either - look at: docker logs lokportal-api" >&2
    fi
  fi
  exit 1
fi

# tidy up: the last 5 release folders and the last 4 images are kept
ls -1dt "$BASE"/releases/* 2>/dev/null | tail -n +6 | xargs -r rm -rf
docker images lokportal-api --format '{{.Tag}}' | grep -E '^[0-9]{8}-[0-9]{6}$' | sort -r | tail -n +5 | xargs -r -I{} docker rmi "lokportal-api:{}" >/dev/null 2>&1 || true
