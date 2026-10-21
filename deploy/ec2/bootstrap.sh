#!/usr/bin/env bash
# One-time set-up of a DEDICATED API server (EC2: Amazon Linux 2023 or Ubuntu 22.04 / 24.04). Run as root.
# (An EC2 that already hosts other projects: use deploy/SHARED-SERVER.md instead - this script installs nginx on 80/443.)
#
#   sudo REPO_URL=https://github.com/<you>/<repo>.git API_DOMAIN=api.lokmangal.in bash bootstrap.sh
#
#   REPO_URL     the git repository (a private repository: use the SSH address and add a deploy key - see DEPLOY.md)
#   API_DOMAIN   the address of the API (an A record must point to this server's Elastic IP before the certificate step)
#   BRANCH       default: main
#
# It is safe to run again: nothing that exists is overwritten (the .env file is never touched).
set -euo pipefail

: "${REPO_URL:?set REPO_URL}"
: "${API_DOMAIN:?set API_DOMAIN}"
BRANCH="${BRANCH:-main}"
APP_USER=lokmangal
APP_HOME=/opt/lokmangal
APP_DIR="$APP_HOME/app"
VENV="$APP_HOME/venv"
DATA_DIR=/var/lib/lokmangal

[ "$(id -u)" -eq 0 ] || { echo "Run this as root (sudo)."; exit 1; }

echo "==> 1/8 packages"
if command -v dnf >/dev/null 2>&1; then
  dnf install -y git nginx python3.11 python3.11-pip mariadb105 curl
  PYTHON=python3.11
elif command -v apt-get >/dev/null 2>&1; then
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y git nginx python3 python3-venv python3-pip mysql-client curl
  PYTHON=python3
else
  echo "Unsupported system: needs dnf (Amazon Linux) or apt-get (Ubuntu)."; exit 1
fi

echo "==> 2/8 user and folders"
id "$APP_USER" >/dev/null 2>&1 || useradd --system --create-home --home-dir "$APP_HOME" --shell /usr/sbin/nologin "$APP_USER"
install -d -o "$APP_USER" -g "$APP_USER" -m 750 "$DATA_DIR" "$DATA_DIR/tmp"

echo "==> 3/8 code"
if [ ! -d "$APP_DIR/.git" ]; then
  sudo -u "$APP_USER" -H git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
else
  echo "    already cloned"
fi

echo "==> 4/8 python environment"
[ -x "$VENV/bin/python" ] || sudo -u "$APP_USER" -H "$PYTHON" -m venv "$VENV"
sudo -u "$APP_USER" -H "$VENV/bin/pip" install --quiet --upgrade pip
sudo -u "$APP_USER" -H "$VENV/bin/pip" install --quiet -r "$APP_DIR/backend/requirements.txt"

echo "==> 5/8 settings file (backend/.env)"
ENV_FILE="$APP_DIR/backend/.env"
if [ ! -f "$ENV_FILE" ]; then
  SECRET="$("$VENV/bin/python" -c 'import secrets; print(secrets.token_urlsafe(48))')"
  cat > "$ENV_FILE" <<EOF
APP_ENV=production
HOST=127.0.0.1
PORT=5000
SERVE_FRONTEND=false
TRUSTED_PROXIES=1
SECRET_KEY=$SECRET
ADMIN_USERNAME=admin
TOKEN_TTL_HOURS=12

# ---- fill in (DEPLOY.md, step 5) ----
CORS_ORIGINS=https://www.example.com
DB_HOST=your-database.xxxxxxxx.ap-south-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=lokmangal_app
DB_PASSWORD=change-me
DB_NAME=lokmangal_news_portal
DB_SSL_CA=/etc/ssl/certs/rds-global-bundle.pem

STORAGE_BACKEND=s3
S3_BUCKET=your-media-bucket
S3_REGION=ap-south-1
MEDIA_BASE_URL=https://dxxxxxxxxxxxx.cloudfront.net
UPLOAD_TMP_DIR=$DATA_DIR/tmp
EOF
  chown "$APP_USER:$APP_USER" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo "    created $ENV_FILE (a SECRET_KEY was generated) - EDIT IT before starting the service"
else
  echo "    $ENV_FILE exists - left as it is"
fi

echo "==> 6/8 RDS certificate bundle"
curl -fsSL -o /etc/ssl/certs/rds-global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
chmod 644 /etc/ssl/certs/rds-global-bundle.pem

echo "==> 7/8 service and nginx"
install -m 644 "$APP_DIR/deploy/ec2/lokmangal-api.service" /etc/systemd/system/lokmangal-api.service
install -m 644 "$APP_DIR/deploy/ec2/nginx-limits.conf" /etc/nginx/conf.d/lokmangal-limits.conf
sed "s/__API_DOMAIN__/$API_DOMAIN/g" "$APP_DIR/deploy/ec2/nginx-api.conf" > /etc/nginx/conf.d/lokmangal-api.conf
# (a dedicated server only: this script is NOT for a server that already runs other projects - see deploy/SHARED-SERVER.md)
systemctl daemon-reload
systemctl enable lokmangal-api nginx >/dev/null
nginx -t
systemctl restart nginx

echo "==> 8/8 HTTPS certificate tool (certbot) and its automatic renewal"
if [ ! -x /opt/certbot/bin/certbot ]; then
  "$PYTHON" -m venv /opt/certbot
  /opt/certbot/bin/pip install --quiet --upgrade pip
  /opt/certbot/bin/pip install --quiet certbot certbot-nginx
fi
ln -sf /opt/certbot/bin/certbot /usr/local/bin/certbot
cat > /etc/systemd/system/certbot-renew.service <<'EOF'
[Unit]
Description=Renew Let's Encrypt certificates
[Service]
Type=oneshot
ExecStart=/opt/certbot/bin/certbot renew --quiet --deploy-hook "systemctl reload nginx"
EOF
cat > /etc/systemd/system/certbot-renew.timer <<'EOF'
[Unit]
Description=Twice a day: renew Let's Encrypt certificates when they are due
[Timer]
OnCalendar=*-*-* 03,15:17:00
RandomizedDelaySec=1800
Persistent=true
[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
systemctl enable --now certbot-renew.timer >/dev/null

cat <<EOF

Done. Next (DEPLOY.md, steps 5-8):
  1. edit        $ENV_FILE
  2. database    sudo -u $APP_USER -H bash -c 'cd $APP_DIR/backend && $VENV/bin/python init_db.py --seed'   (as the MySQL master user, see DEPLOY.md)
  3. password    sudo -u $APP_USER -H bash -c 'cd $APP_DIR/backend && $VENV/bin/python manage.py set-admin-password'
  4. check       sudo -u $APP_USER -H bash -c 'cd $APP_DIR/backend && $VENV/bin/python manage.py check'
  5. start       systemctl start lokmangal-api && curl -s http://127.0.0.1:5000/api/health
  6. certificate (after the DNS record of $API_DOMAIN points here)   certbot --nginx -d $API_DOMAIN --redirect -m you@example.com --agree-tos
EOF
