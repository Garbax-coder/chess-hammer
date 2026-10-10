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
- `npm run backup:db` — copia di sicurezza del database, vedi sotto

## Backup del database

Il piano gratuito di Supabase non fa backup: `npm run backup:db` ne crea uno in
`~/Backups/chess-hammer/<data_ora>/` (cartella leggibile solo dal proprio utente).
Richiede `pg_dump` (`brew install libpq`) e `SUPABASE_DB_URL` in `.env.local`; la porta
6543 del pooler viene sostituita in automatico con la 5432, l'unica che `pg_dump` accetta.

Ogni backup contiene:

- `public.dump`: lo schema `public` completo (tabelle, funzioni, policy RLS, dati);
- `auth-users.dump`: solo i dati di `auth.users` e `auth.identities` (gli account).

Dopo ogni backup riuscito vengono cancellati quelli più vecchi di **8 settimane**
(`RETENTION_DAYS`): è il termine dichiarato nella privacy policy, quindi cambiarlo solo
insieme al testo. Con Time Machine attiva, escludi la cartella dal backup di sistema
(`tmutil addexclusion ~/Backups/chess-hammer`), altrimenti le copie restano oltre quel
termine.

**Ripristino su un progetto Supabase nuovo** (da provare sul progetto di sviluppo):

```bash
export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
DB="postgresql://...:5432/postgres"   # connection string del progetto di destinazione
B=~/Backups/chess-hammer/<data_ora>
# 1. account (nessun trigger su auth.users nel progetto nuovo, quindi niente user_stats doppie)
pg_restore --data-only --no-owner -d "$DB" "$B/auth-users.dump"
# 2. schema public e dati (l'errore "schema public already exists" è atteso)
pg_restore --no-owner --no-privileges -d "$DB" "$B/public.dump"
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
