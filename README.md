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

### Progetto Supabase di sviluppo

`npm run dev` usa un progetto Supabase separato, **chess-hammer-dev** (stessa regione UE),
così le prove non toccano i dati reali. Le sue impostazioni stanno in
`.env.development.local` (non nel repo), che per `npm run dev` ha la precedenza su
`.env.local`:

```bash
VITE_SUPABASE_URL=https://<ref di sviluppo>.supabase.co
VITE_SUPABASE_ANON_KEY=<chiave anon del progetto di sviluppo>
VITE_TURNSTILE_SITE_KEY=          # vuota: niente CAPTCHA in sviluppo
DEV_SUPABASE_DB_URL=postgresql://postgres.<ref>:<password>@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
```

Il progetto di sviluppo ha CAPTCHA e conferma email disattivati, `site_url`
`http://localhost:5180`, tutte le migrazioni e un campione di ~17.000 puzzle Lichess
(circa 600 per fascia di rating, copiati dalla produzione). I progetti gratuiti si
mettono in pausa dopo una settimana senza uso: si riattivano dal pannello di Supabase.

## Script disponibili

- `npm run dev` — dev server
- `npm run build` — typecheck + build produzione
- `npm run typecheck` — solo typecheck
- `npm run lint` — oxlint
- `npm run format` — prettier --write

- `npm run test` — suite di test automatici (Vitest); deve passare prima di ogni rilascio
  in produzione, vedi [CLAUDE.md](CLAUDE.md)

## Migrazioni del database

Le migrazioni in `supabase/migrations/` si applicano con la
[Supabase CLI](https://supabase.com/docs/guides/cli) (`brew install supabase/tap/supabase`):

```bash
supabase login                                        # una volta, apre il browser
supabase link --project-ref <ref del progetto>         # una volta per checkout
supabase migration list                               # cosa è applicato e cosa no
supabase db push --dry-run                            # anteprima
supabase db push                                      # applica le migrazioni nuove
```

`link` e `db push` chiedono la password del database (o la leggono da
`SUPABASE_DB_PASSWORD`). Una migrazione nuova si prova prima sul progetto di
sviluppo, poi si applica alla produzione:

```bash
supabase db push --db-url "$DEV_SUPABASE_DB_URL"      # sviluppo
supabase db push                                      # produzione (progetto collegato)
``` Le migrazioni 0001–0026 sono state applicate a mano dal SQL
Editor e poi registrate con `supabase migration repair --status applied`: da qui in
poi lo storico è tenuto dalla CLI.

## Conservazione degli account

Ogni notte (4:30 UTC) un job `pg_cron` nel database esegue `run_account_retention()`
(migrazione [0027](supabase/migrations/0027_account_retention.sql)), come promesso
nell'informativa privacy:

- gli account **mai confermati** si eliminano 7 giorni dopo la registrazione;
- chi non usa l'account da **23 mesi** riceve un'email (Resend, nella sua lingua) che
  annuncia l'eliminazione **30 giorni** dopo; se nel frattempo accede o gioca, l'avviso
  si annulla;
- passati i 30 giorni, l'account si elimina con tutti i suoi dati.

"Uso" vuol dire accesso, rinnovo automatico della sessione o puzzle giocato. L'email
parte solo se in Supabase Vault c'è il segreto `resend_api_key`: senza, nessun account
inattivo viene avvisato e quindi nessuno viene eliminato (solo quelli mai confermati).
Il testo dell'email si genera con `node scripts/build-email-templates.mjs`
(`supabase/email-templates/account-deletion-warning.sql`, copiato nella migrazione
[0028](supabase/migrations/0028_account_retention_emails.sql)).

Prova sul progetto di sviluppo (transazione annullata alla fine, non lascia tracce):

```bash
psql "$DEV_SUPABASE_DB_URL" -f supabase/tests/account-retention.sql
```

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

- `public.dump`: lo schema `public` completo (tabelle, funzioni, policy RLS) e i dati,
  tranne quelli delle tabelle Lichess;
- `auth-users.dump`: solo i dati di `auth.users` e `auth.identities` (gli account).

I puzzle Lichess non cambiano tra un backup e l'altro e pesano circa 43 MB di traffico
Supabase a ogni esecuzione: ne esiste una copia unica in
`gs://chess-hammer-db-backups/archivio/`, fatta con
[scripts/cloud-backup/archive-puzzles.sh](scripts/cloud-backup/archive-puzzles.sh) e da
rifare solo dopo un nuovo import di puzzle (`lichess_puzzle_order` e
`lichess_rating_ranges` si ricostruiscono con `rebuild_lichess_puzzle_order()`):

```bash
gcloud run jobs execute db-backup --project=chess-hammer --region=europe-west1 --wait \
  --args="^@^-c@$(cat scripts/cloud-backup/archive-puzzles.sh)"
```

Il bucket cancella da solo le cartelle dei backup più vecchie di **8 settimane** (56
giorni, soft delete disattivato; la regola vale solo per le cartelle `20…`, non per
`archivio/`): è il termine dichiarato nella privacy policy, quindi cambiarlo solo insieme
al testo. Se un backup fallisce, o lo Scheduler non riesce ad avviarlo, Cloud Monitoring
manda un'email: con la cancellazione automatica, un errore ignorato per 8 settimane
lascerebbe il bucket vuoto.

Lo stesso job misura anche la dimensione del database: oltre i **400 MB** (80% dei 500 MB
del piano gratuito) scrive nei log la riga `DB_SIZE_ALERT` e arriva un'email (al massimo
una al giorno). La soglia si cambia con la variabile `DB_SIZE_ALERT_MB`; per provare
l'avviso senza aspettare la domenica:

```bash
gcloud run jobs execute db-backup --project=chess-hammer --region=europe-west1 --wait \
  --update-env-vars=DB_SIZE_ALERT_MB=1
```

**Ripristino su un progetto Supabase nuovo** (da provare sul progetto di sviluppo).
L'ordine conta: i vincoli che legano `session_puzzles` a `lichess_puzzles` si possono
creare solo dopo aver caricato i puzzle.

```bash
export PATH="/opt/homebrew/opt/libpq/bin:$PATH"   # pg_restore e psql: brew install libpq
DB="postgresql://...:5432/postgres"   # connection string del progetto di destinazione
B=gs://chess-hammer-db-backups
gcloud storage cp "$B/<data_ora>/*.dump" "$B/archivio/lichess-puzzles-<data>.dump" .
# 1. account (nessun trigger su auth.users nel progetto nuovo, quindi niente user_stats doppie)
pg_restore --data-only --no-owner -d "$DB" auth-users.dump
# 2. schema public senza vincoli e indici (l'errore "schema public already exists" è atteso)
pg_restore --section=pre-data --no-owner --no-privileges -d "$DB" public.dump
# 3. puzzle Lichess, poi i dati degli utenti
pg_restore --data-only --no-owner -d "$DB" lichess-puzzles-<data>.dump
pg_restore --section=data --no-owner --no-privileges -d "$DB" public.dump
# 4. vincoli e indici, tabelle derivate dei puzzle, trigger su auth.users
pg_restore --section=post-data --no-owner --no-privileges -d "$DB" public.dump
psql "$DB" -c "select public.rebuild_lichess_puzzle_order();"
psql "$DB" -c "create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();"
rm -f *.dump   # contengono dati personali
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
