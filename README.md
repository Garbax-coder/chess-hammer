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
