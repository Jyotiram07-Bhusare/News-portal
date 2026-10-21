#!/usr/bin/env bash
# Put a new version of the backend on the server (after `git push`):   sudo bash /opt/lokmangal/app/deploy/ec2/update.sh
# It pulls the code, installs new libraries, restarts the API and checks that it answers. If it does not, the old commit is restored.
set -euo pipefail

APP_USER=lokmangal
APP_DIR=/opt/lokmangal/app
VENV=/opt/lokmangal/venv

[ "$(id -u)" -eq 0 ] || { echo "Run this as root (sudo)."; exit 1; }

as_app() { sudo -u "$APP_USER" -H "$@"; }

OLD="$(as_app git -C "$APP_DIR" rev-parse HEAD)"
echo "==> current version: ${OLD:0:8}"
as_app git -C "$APP_DIR" fetch --quiet origin
as_app git -C "$APP_DIR" merge --ff-only '@{u}'
NEW="$(as_app git -C "$APP_DIR" rev-parse HEAD)"
if [ "$OLD" = "$NEW" ]; then echo "==> nothing new"; else echo "==> new version: ${NEW:0:8}"; fi

as_app "$VENV/bin/pip" install --quiet -r "$APP_DIR/backend/requirements.txt"

# the unit file / nginx files may have changed too
install -m 644 "$APP_DIR/deploy/ec2/lokmangal-api.service" /etc/systemd/system/lokmangal-api.service
systemctl daemon-reload

echo "==> settings check"
if ! (cd "$APP_DIR/backend" && as_app "$VENV/bin/python" manage.py check); then
  echo "!! manage.py check failed - restoring ${OLD:0:8}"
  as_app git -C "$APP_DIR" reset --hard "$OLD"
  exit 1
fi

echo "==> restart"
systemctl restart lokmangal-api
for i in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:5000/api/health >/dev/null 2>&1; then
    echo "==> API answers. Done."
    exit 0
  fi
  sleep 1
done
echo "!! the API does not answer - restoring ${OLD:0:8}"
as_app git -C "$APP_DIR" reset --hard "$OLD"
as_app "$VENV/bin/pip" install --quiet -r "$APP_DIR/backend/requirements.txt"
systemctl restart lokmangal-api
journalctl -u lokmangal-api -n 30 --no-pager || true
exit 1
