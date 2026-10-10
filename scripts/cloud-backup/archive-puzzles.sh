# Copia d'archivio dei puzzle Lichess importati, esclusi dal backup
# settimanale (job.sh): si esegue una volta con il job "db-backup" e di nuovo
# solo dopo un nuovo import di puzzle. Va nella cartella archivio/ del
# bucket, che la regola di cancellazione dopo 8 settimane non tocca (sono
# dati pubblici, non dati degli utenti). Le tabelle derivate si ricreano con
# select public.rebuild_lichess_puzzle_order().
set -euo pipefail
tmp="$(mktemp -d)"
pg_dump "$DB_URL" --data-only --table=public.lichess_puzzles --format=custom --no-owner --no-privileges --file "$tmp/lichess-puzzles.dump"
pg_restore --list "$tmp/lichess-puzzles.dump" | grep -q "TABLE DATA public lichess_puzzles"
mkdir -p /backups/archivio
cp "$tmp/lichess-puzzles.dump" "/backups/archivio/lichess-puzzles-$(date -u +%Y-%m-%d).dump"
echo "Archivio puzzle completato ($(du -sh "$tmp" | cut -f1))"
