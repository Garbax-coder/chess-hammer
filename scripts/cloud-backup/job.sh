# Eseguito dal Cloud Run Job "db-backup" (immagine postgres:17), ogni
# domenica da Cloud Scheduler: vedi scripts/cloud-backup/setup.sh e il README.
# DB_URL arriva da Secret Manager; /backups e' il bucket montato come cartella.
set -euo pipefail
stamp="$(date -u +%Y-%m-%d_%H%M%S)"
tmp="$(mktemp -d)"
pg_dump "$DB_URL" --schema=public --format=custom --no-owner --no-privileges --file "$tmp/public.dump"
pg_dump "$DB_URL" --data-only --table=auth.users --table=auth.identities --format=custom --no-owner --no-privileges --file "$tmp/auth-users.dump"
pg_restore --list "$tmp/public.dump" | grep -q "TABLE DATA public user_stats"
pg_restore --list "$tmp/auth-users.dump" | grep -q "TABLE DATA auth users"
mkdir -p "/backups/$stamp"
cp "$tmp/public.dump" "$tmp/auth-users.dump" "/backups/$stamp/"
echo "Backup completato: $stamp ($(du -sh "$tmp" | cut -f1))"
