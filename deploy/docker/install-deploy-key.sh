#!/usr/bin/env bash
# OPTIONAL, for automatic deploys from GitHub Actions: makes a user "lokdeploy" whose SSH key can do exactly ONE thing -
# run /opt/lokportal/deploy-entry.sh (receive backend/ as a tar.gz, build the image, switch the API container, roll back on failure).
# No shell, no port forwarding, no other command. Run as root:
#
#   sudo DEPLOY_PUBKEY='ssh-ed25519 AAAA... github-actions' bash install-deploy-key.sh
#
# (Remove it again:  sudo userdel -r lokdeploy)
set -euo pipefail
: "${DEPLOY_PUBKEY:?set DEPLOY_PUBKEY (the public key whose private half is the GitHub secret DEPLOY_SSH_KEY)}"
[ "$(id -u)" -eq 0 ] || { echo "Run this as root (sudo)."; exit 1; }
[ -x /opt/lokportal/deploy-entry.sh ] || { echo "Run setup-server.sh first."; exit 1; }

id lokdeploy >/dev/null 2>&1 || useradd --create-home --home-dir /home/lokdeploy --shell /bin/bash lokdeploy
usermod -aG docker lokdeploy
chown lokdeploy:lokdeploy /opt/lokportal/releases
install -d -o lokdeploy -g lokdeploy -m 700 /home/lokdeploy/.ssh
printf 'restrict,command="/opt/lokportal/deploy-entry.sh" %s\n' "$DEPLOY_PUBKEY" > /home/lokdeploy/.ssh/authorized_keys
chown lokdeploy:lokdeploy /home/lokdeploy/.ssh/authorized_keys
chmod 600 /home/lokdeploy/.ssh/authorized_keys
echo "deploy key installed for user lokdeploy"
