#!/usr/bin/env bash
# Crea su Google Cloud il backup settimanale del database Supabase: gli stessi
# comandi usati per la configurazione attuale (progetto chess-hammer), da
# rieseguire solo per ricrearla da zero. Richiede `gcloud auth login` e la
# fatturazione attiva sul progetto. Vedi la sezione "Backup del database" nel README.
set -euo pipefail

PROJECT=chess-hammer
REGION=europe-west1
BUCKET=chess-hammer-db-backups
SA=db-backup@$PROJECT.iam.gserviceaccount.com
ALERT_EMAIL="${ALERT_EMAIL:?imposta ALERT_EMAIL con la email che riceve gli avvisi}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

gcloud services enable run.googleapis.com cloudscheduler.googleapis.com \
  secretmanager.googleapis.com iam.googleapis.com --project=$PROJECT

gcloud iam service-accounts create db-backup --project=$PROJECT \
  --display-name="Backup settimanale database Supabase"

# Connection string da .env.local, senza stamparla. pg_dump richiede il pooler
# in session mode (porta 5432), non in transaction mode (6543).
grep -E '^SUPABASE_DB_URL=' "$ROOT/.env.local" | head -n 1 | cut -d= -f2- | tr -d '\r"\n' |
  sed -E 's#(pooler\.supabase\.com):6543#\1:5432#' |
  gcloud secrets create supabase-db-url --project=$PROJECT \
    --replication-policy=user-managed --locations=$REGION --data-file=-
gcloud secrets add-iam-policy-binding supabase-db-url --project=$PROJECT \
  --member="serviceAccount:$SA" --role=roles/secretmanager.secretAccessor

# Niente soft delete: allungherebbe di 7 giorni la conservazione dichiarata
# nella privacy policy (8 settimane = 56 giorni).
gcloud storage buckets create gs://$BUCKET --project=$PROJECT --location=$REGION \
  --default-storage-class=STANDARD --uniform-bucket-level-access \
  --public-access-prevention --soft-delete-duration=0
lifecycle="$(mktemp)"
printf '%s\n' '{"rule":[{"action":{"type":"Delete"},"condition":{"age":56}}]}' > "$lifecycle"
gcloud storage buckets update gs://$BUCKET --lifecycle-file="$lifecycle"
rm -f "$lifecycle"
gcloud storage buckets add-iam-policy-binding gs://$BUCKET \
  --member="serviceAccount:$SA" --role=roles/storage.objectUser

# Lo script del job non contiene "@": lo si usa come separatore degli argomenti
# al posto della virgola, che compare nei commenti.
gcloud run jobs create db-backup --project=$PROJECT --region=$REGION \
  --image=docker.io/library/postgres:17 --service-account=$SA \
  --set-secrets=DB_URL=supabase-db-url:latest \
  --add-volume=name=backups,type=cloud-storage,bucket=$BUCKET \
  --add-volume-mount=volume=backups,mount-path=/backups \
  --command=bash --args="^@^-c@$(cat "$ROOT/scripts/cloud-backup/job.sh")" \
  --task-timeout=15m --max-retries=1 --cpu=1 --memory=512Mi
gcloud run jobs add-iam-policy-binding db-backup --project=$PROJECT --region=$REGION \
  --member="serviceAccount:$SA" --role=roles/run.invoker

gcloud scheduler jobs create http db-backup-weekly --project=$PROJECT --location=$REGION \
  --schedule="0 3 * * 0" --time-zone=Europe/Rome \
  --uri="https://run.googleapis.com/v2/projects/$PROJECT/locations/$REGION/jobs/db-backup:run" \
  --http-method=POST --oauth-service-account-email=$SA \
  --description="Backup settimanale del database Supabase"

# Avvisi via email: job terminato con errore, oppure Scheduler che non riesce
# ad avviarlo (in quel caso il job non parte e il primo avviso non scatta).
# Via API REST: i comandi gcloud equivalenti sono solo nel componente beta.
TOKEN="$(gcloud auth print-access-token)" EMAIL="$ALERT_EMAIL" PROJECT=$PROJECT python3 - <<'EOF'
import json, os, urllib.request

def post(path, body):
    req = urllib.request.Request(
        f"https://monitoring.googleapis.com/v3/projects/{os.environ['PROJECT']}/{path}",
        data=json.dumps(body).encode(), method="POST",
        headers={"Authorization": f"Bearer {os.environ['TOKEN']}", "Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req))

channel = post("notificationChannels", {
    "type": "email", "displayName": "Email (backup database)",
    "labels": {"email_address": os.environ["EMAIL"]}})["name"]
docs = {"mimeType": "text/markdown", "content":
    "Il backup settimanale del database Chess Hammer non e' andato a buon fine: controlla i log "
    "del Cloud Run Job db-backup e dello Scheduler db-backup-weekly (europe-west1). Le copie piu' "
    "vecchie di 8 settimane vengono cancellate in automatico."}
post("alertPolicies", {
    "displayName": "Backup database: esecuzione fallita", "combiner": "OR",
    "conditions": [{"displayName": "Il job db-backup e' terminato con errore", "conditionThreshold": {
        "filter": 'resource.type = "cloud_run_job" AND resource.labels.job_name = "db-backup" AND '
                  'metric.type = "run.googleapis.com/job/completed_execution_count" AND metric.labels.result = "failed"',
        "aggregations": [{"alignmentPeriod": "300s", "perSeriesAligner": "ALIGN_DELTA"}],
        "comparison": "COMPARISON_GT", "thresholdValue": 0, "duration": "0s", "trigger": {"count": 1}}}],
    "notificationChannels": [channel], "alertStrategy": {"autoClose": "604800s"}, "documentation": docs})
post("alertPolicies", {
    "displayName": "Backup database: avvio dallo Scheduler fallito", "combiner": "OR",
    "conditions": [{"displayName": "Errore di Cloud Scheduler su db-backup-weekly", "conditionMatchedLog": {
        "filter": 'resource.type="cloud_scheduler_job" AND resource.labels.job_id="db-backup-weekly" AND severity>=ERROR'}}],
    "notificationChannels": [channel],
    "alertStrategy": {"notificationRateLimit": {"period": "3600s"}, "autoClose": "604800s"}, "documentation": docs})
print("Avvisi creati")
EOF
