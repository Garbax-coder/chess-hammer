# Chess Hammer

Web app per tracciare allenamenti di scacchi con il metodo del picchio: risolvi un set
fisso di puzzle per 3 giri consecutivi, aumentando la velocità di risoluzione ad ogni giro.

**Live**: [chesshammer.com](https://chesshammer.com)

## Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui (Radix, preset Nova)
- Supabase (Postgres + Auth)
- TanStack Query, React Router
- chess.js + react-chessboard

## Setup locale

```bash
npm install
cp .env.example .env.local   # compila VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm run dev
```

## Script disponibili

- `npm run dev` — dev server
- `npm run build` — typecheck + build produzione
- `npm run typecheck` — solo typecheck
- `npm run lint` — oxlint
- `npm run format` — prettier --write

- `npm run test` — suite di test automatici (Vitest); deve passare prima di ogni rilascio
  in produzione, vedi [CLAUDE.md](CLAUDE.md)

## Backup del database

Il piano gratuito di Supabase non fa backup. Ne fa uno **ogni domenica alle 3:00** un
Cloud Run Job su Google Cloud (progetto `chess-hammer`, regione `europe-west1`), avviato
da Cloud Scheduler: esegue [scripts/cloud-backup/job.sh](scripts/cloud-backup/job.sh)
nell'immagine ufficiale `postgres:17` e salva il risultato nel bucket privato
`gs://chess-hammer-db-backups/<data_ora>/`. La connection string sta in Secret Manager
(`supabase-db-url`, porta 5432: `pg_dump` non funziona col pooler in transaction mode).
Tutta la configurazione si ricrea con
[scripts/cloud-backup/setup.sh](scripts/cloud-backup/setup.sh).

Ogni backup contiene:

- `public.dump`: lo schema `public` completo (tabelle, funzioni, policy RLS, dati);
- `auth-users.dump`: solo i dati di `auth.users` e `auth.identities` (gli account).

Il bucket cancella da solo le copie più vecchie di **8 settimane** (56 giorni, soft delete
disattivato): è il termine dichiarato nella privacy policy, quindi cambiarlo solo insieme
al testo. Se un backup fallisce, o lo Scheduler non riesce ad avviarlo, Cloud Monitoring
manda un'email: con la cancellazione automatica, un errore ignorato per 8 settimane
lascerebbe il bucket vuoto.

**Ripristino su un progetto Supabase nuovo** (da provare sul progetto di sviluppo):

```bash
export PATH="/opt/homebrew/opt/libpq/bin:$PATH"   # pg_restore e psql: brew install libpq
DB="postgresql://...:5432/postgres"   # connection string del progetto di destinazione
B=gs://chess-hammer-db-backups/<data_ora>
# 1. account (nessun trigger su auth.users nel progetto nuovo, quindi niente user_stats doppie)
gcloud storage cat "$B/auth-users.dump" | pg_restore --data-only --no-owner -d "$DB"
# 2. schema public e dati (l'errore "schema public already exists" è atteso)
gcloud storage cat "$B/public.dump" | pg_restore --no-owner --no-privileges -d "$DB"
# 3. trigger su auth.users, che sta fuori dallo schema public
psql "$DB" -c "create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();"
```

Dopo il ripristino vanno riapplicati i permessi di `anon`/`authenticated` sullo schema
`public` (il backup è fatto con `--no-privileges`): sono quelli predefiniti di un progetto
Supabase nuovo, ma vanno verificati al primo ripristino di prova.

## Stato del progetto

Piano di implementazione completato: setup progetto, import puzzle Lichess (~210k, campionati
per rating), autenticazione (email/password + Google OAuth), configurazione sessione di
allenamento a giri ripetuti, motore ELO e selezione puzzle, scacchiera interattiva con
analisi motore, dashboard e storico sessioni, esportazione/cancellazione dati, rifinitura UI
(dark mode, shell di navigazione), deploy su Vercel.

Prossimi sviluppi possibili: altri provider OAuth (Facebook), ottimizzazione dimensione
bundle (code splitting), metriche aggiuntive nello storico.

## Licenza

GNU General Public License v3.0 o successiva — vedi [LICENSE](LICENSE). Il codice sorgente
di questo repository, nella versione esattamente in esecuzione su chesshammer.com, è quindi
sempre disponibile qui.

Crediti e licenze di terze parti (motore Stockfish, dataset puzzle Lichess, set di pezzi,
librerie): vedi la pagina [Crediti](https://chesshammer.com/credits) nell'app.
