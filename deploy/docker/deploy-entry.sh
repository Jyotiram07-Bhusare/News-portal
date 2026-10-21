#!/usr/bin/env bash
# The ONLY thing the GitHub Actions deploy key may do (authorized_keys: restrict,command="/opt/lokportal/deploy-entry.sh" ...).
# It receives a tar.gz of the backend/ folder on stdin, builds the image, switches the API container to it, checks that it
# answers and goes back to the previous version when it does not.   Installed (root-owned, not writable by the key) by setup-server.sh.
set -euo pipefail

BASE=/opt/lokportal
COMPOSE="$BASE/docker-compose.yml"

case "${SSH_ORIGINAL_COMMAND:-deploy}" in
  deploy) ;;
  *) echo "Only 'deploy' is allowed here." >&2; exit 2 ;;
esac

ID="$(date +%Y%m%d-%H%M%S)"
REL="$BASE/releases/$ID"
mkdir -p "$REL"
trap 'rm -rf "$REL"' ERR

echo "==> receiving the code"
tar -xzf - -C "$REL" --no-same-owner --no-same-permissions
[ -f "$REL/Dockerfile" ] && [ -f "$REL/app.py" ] || { echo "The upload does not look like backend/." >&2; exit 3; }

echo "==> building lokportal-api:$ID"
nice -n 10 docker build --quiet -t "lokportal-api:$ID" "$REL" >/dev/null

# Database: new tables / columns that the new code needs are added first (additive only, no row is touched). It runs with a dedicated MySQL user
# (lokportal_migrate: may create / alter tables of OUR database only - the web application's own user may not). When it fails the deploy stops
# here and the running version is not touched. Without /opt/lokportal/migrate.env the step is skipped.
if [ -r "$BASE/migrate.env" ]; then
  echo "==> database: new tables / columns"
  docker run --rm --env-file "$BASE/migrate.env" -v "$BASE/backend.env:/app/.env:ro" "lokportal-api:$ID" python init_db.py --schema-only
else
  echo "(no $BASE/migrate.env: a new table / column would have to be added by hand - init_db.py --schema-only)"
fi

if docker image inspect lokportal-api:current >/dev/null 2>&1; then
  docker tag lokportal-api:current lokportal-api:previous
fi
docker tag "lokportal-api:$ID" lokportal-api:current

healthy() {
  for _ in $(seq 1 30); do
    if docker exec lokportal-api python -c "import sys,urllib.request; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:5000/api/health', timeout=4).status == 200 else 1)" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  return 1
}

echo "==> starting it"
docker compose -f "$COMPOSE" up -d --no-deps --force-recreate api
if healthy; then
  echo "==> the API answers - deployed $ID"
else
  echo "!! the new version does not answer - going back to the previous one" >&2
  docker logs --tail 40 lokportal-api >&2 || true
  if docker image inspect lokportal-api:previous >/dev/null 2>&1; then
    docker tag lokportal-api:previous lokportal-api:current
    docker compose -f "$COMPOSE" up -d --no-deps --force-recreate api
  fi
  exit 1
fi

# tidy up: the last 5 release folders and the last 4 images are kept
ls -1dt "$BASE"/releases/* 2>/dev/null | tail -n +6 | xargs -r rm -rf
docker images lokportal-api --format '{{.Tag}}' | grep -E '^[0-9]{8}-[0-9]{6}$' | sort -r | tail -n +5 | xargs -r -I{} docker rmi "lokportal-api:{}" >/dev/null 2>&1 || true
