# Eseguito dal Cloud Run Job "db-backup" (immagine postgres:17), ogni
# domenica da Cloud Scheduler: vedi scripts/cloud-backup/setup.sh e il README.
# DB_URL arriva da Secret Manager; /backups e' il bucket montato come cartella.
# I dati delle tabelle Lichess non cambiano tra un backup e l'altro e
# pesano ~43 MB di traffico Supabase a ogni esecuzione: stanno nell'archivio
# a parte (archive-puzzles.sh); qui se ne salva solo lo schema.
set -euo pipefail
stamp="$(date -u +%Y-%m-%d_%H%M%S)"
tmp="$(mktemp -d)"
pg_dump "$DB_URL" --schema=public --format=custom --no-owner --no-privileges --exclude-table-data=public.lichess_puzzles --exclude-table-data=public.lichess_puzzle_order --exclude-table-data=public.lichess_rating_ranges --file "$tmp/public.dump"
pg_dump "$DB_URL" --data-only --table=auth.users --table=auth.identities --format=custom --no-owner --no-privileges --file "$tmp/auth-users.dump"
pg_restore --list "$tmp/public.dump" | grep -q "TABLE DATA public user_stats"
pg_restore --list "$tmp/auth-users.dump" | grep -q "TABLE DATA auth users"
mkdir -p "/backups/$stamp"
cp "$tmp/public.dump" "$tmp/auth-users.dump" "/backups/$stamp/"
echo "Backup completato: $stamp ($(du -sh "$tmp" | cut -f1))"

# Dimensione del database, rispetto ai 500 MB del piano gratuito di Supabase:
# oltre la soglia (80%, cioe' 400 MB) si scrive una riga di log WARNING
# "DB_SIZE_ALERT" che fa partire l'avviso email (vedi setup.sh). Un errore qui
# non deve far risultare fallito il backup, che a questo punto e' gia' salvato.
limit_mb="${DB_SIZE_ALERT_MB:-400}"
if size="$(psql "$DB_URL" -tAc "select pg_database_size(current_database())")"; then
  size_mb=$((size / 1024 / 1024))
  if [ "$size_mb" -ge "$limit_mb" ]; then
    echo "{\"severity\":\"WARNING\",\"message\":\"DB_SIZE_ALERT database a ${size_mb} MB, soglia ${limit_mb} MB (piano gratuito Supabase: 500 MB)\"}"
  else
    echo "Dimensione database: ${size_mb} MB (soglia di avviso ${limit_mb} MB)"
  fi
else
  echo "{\"severity\":\"WARNING\",\"message\":\"Dimensione database non misurata: psql non ha risposto\"}"
fi
