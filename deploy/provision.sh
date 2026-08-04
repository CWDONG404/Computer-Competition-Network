#!/bin/sh
set -eu

APP_ROOT="/opt/computer-competition-network"
ARCHIVE="/tmp/ccn-release.tgz"
ADMIN_HASH="${1:?缺少管理员密码哈希}"

install -d -m 700 "$APP_ROOT/app"
tar -xzf "$ARCHIVE" -C "$APP_ROOT/app"

if [ ! -f "$APP_ROOT/.env.production" ]; then
  DB_PASSWORD="$(openssl rand -hex 24)"
  SESSION_SECRET="$(openssl rand -hex 32)"
  umask 077
  {
    printf 'DATABASE_URL=postgres://ccn:%s@database:5432/ccn\n' "$DB_PASSWORD"
    printf 'ADMIN_EMAIL=admin@cwdzone.top\n'
    printf 'ADMIN_PASSWORD_HASH=%s\n' "$ADMIN_HASH"
    printf 'SESSION_SECRET=%s\n' "$SESSION_SECRET"
    printf 'NEXT_PUBLIC_SITE_URL=https://ccn.cwdzone.top\n'
    printf 'POSTGRES_DB=ccn\n'
    printf 'POSTGRES_USER=ccn\n'
    printf 'POSTGRES_PASSWORD=%s\n' "$DB_PASSWORD"
  } > "$APP_ROOT/.env.production"
fi

chmod 600 "$APP_ROOT/.env.production"
rm -f "$ARCHIVE"
printf 'PROVISION_OK\n'
