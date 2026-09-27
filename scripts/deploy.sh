#!/usr/bin/env bash
set -euo pipefail

if [[ ${EUID} -ne 0 ]]; then
  echo 'Run this script as root.' >&2
  exit 1
fi

PROJECT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
DB_PASSWORD=$(openssl rand -hex 24)

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y apache2 mysql-server php libapache2-mod-php php-mysql curl
systemctl enable --now apache2 mysql

mysql < "$PROJECT_DIR/database/schema.sql"
mysql --execute="CREATE USER IF NOT EXISTS 'colors_api'@'localhost' IDENTIFIED BY '${DB_PASSWORD}'; ALTER USER 'colors_api'@'localhost' IDENTIFIED BY '${DB_PASSWORD}'; GRANT SELECT, INSERT ON COP4331.* TO 'colors_api'@'localhost'; FLUSH PRIVILEGES;"

install -d -m 0755 /var/www/html/LAMPAPI /var/www/html/js
install -m 0644 "$PROJECT_DIR/public/index.html" /var/www/html/index.html
install -m 0644 "$PROJECT_DIR/public/js/app.js" /var/www/html/js/app.js
install -m 0644 "$PROJECT_DIR/api/"*.php /var/www/html/LAMPAPI/
chown -R www-data:www-data /var/www/html

umask 077
printf '%s\n' \
  'SetEnv COLORS_DB_HOST localhost' \
  'SetEnv COLORS_DB_USER colors_api' \
  "SetEnv COLORS_DB_PASSWORD ${DB_PASSWORD}" \
  'SetEnv COLORS_DB_NAME COP4331' \
  > /etc/apache2/conf-available/colors-api.conf

chmod 0600 /etc/apache2/conf-available/colors-api.conf
a2enconf colors-api
apache2ctl configtest
systemctl reload apache2

echo 'Deployment complete.'

