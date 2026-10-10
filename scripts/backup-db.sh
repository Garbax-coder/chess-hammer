#!/usr/bin/env bash
# Copia di sicurezza del database Supabase (il piano gratuito non ne fa).
# Uso, ripristino e conservazione: sezione "Backup del database" nel README.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$HOME/Backups/chess-hammer}"
# Dichiarato nella privacy policy: cambiarlo solo insieme al testo.
RETENTION_DAYS="${RETENTION_DAYS:-56}"

if ! command -v pg_dump >/dev/null 2>&1; then
  for dir in /opt/homebrew/opt/libpq/bin /usr/local/opt/libpq/bin; do
    if [ -x "$dir/pg_dump" ]; then PATH="$dir:$PATH"; break; fi
  done
fi
command -v pg_dump >/dev/null 2>&1 || {
  echo "pg_dump non trovato: installalo con 'brew install libpq'." >&2
  exit 1
}

url="$(grep -E '^SUPABASE_DB_URL=' "$ROOT/.env.local" | head -n 1 | cut -d= -f2- | tr -d '\r"')"
if [ -z "$url" ]; then
  echo "SUPABASE_DB_URL mancante in .env.local." >&2
  exit 1
fi
# pg_dump non funziona col pooler in transaction mode (porta 6543): stesso
# host e credenziali, in session mode sulla 5432.
url="$(printf '%s' "$url" | sed -E 's#(pooler\.supabase\.com):6543#\1:5432#')"

umask 077
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
dest="$BACKUP_DIR/$(date +%Y-%m-%d_%H%M%S)"
tmp="$dest.partial"
mkdir "$tmp"
trap 'rm -rf "$tmp"' EXIT

echo "Backup in corso in $dest ..."
# Schema public completo (tabelle, funzioni, policy RLS, dati).
pg_dump "$url" --schema=public --format=custom --no-owner --no-privileges \
  --file "$tmp/public.dump"
# Account: senza, le righe di public che puntano a auth.users non sarebbero
# ripristinabili. Il resto di auth (sessioni, token) non serve.
pg_dump "$url" --data-only --table=auth.users --table=auth.identities \
  --format=custom --no-owner --no-privileges --file "$tmp/auth-users.dump"

pg_restore --list "$tmp/public.dump" | grep -q 'TABLE DATA public user_stats' || {
  echo "Backup non valido: manca public.user_stats." >&2
  exit 1
}
pg_restore --list "$tmp/auth-users.dump" | grep -q 'TABLE DATA auth users' || {
  echo "Backup non valido: manca auth.users." >&2
  exit 1
}

mv "$tmp" "$dest"
trap - EXIT

# Solo dopo un backup riuscito, cosi' ne resta sempre almeno uno.
find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d -name '20*' ! -name '*.partial' \
  -mtime +"$RETENTION_DAYS" -print -exec rm -rf {} +

echo "Fatto: $(du -sh "$dest" | cut -f1) in $dest"
