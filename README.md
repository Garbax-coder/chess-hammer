# Chess Hammer

Web app per tracciare allenamenti di scacchi con il **Woodpecker Method**: risolvi un set
fisso di puzzle per 3 giri consecutivi, aumentando la velocità di risoluzione ad ogni giro.

**Live**: [chess-hammer.vercel.app](https://chess-hammer.vercel.app)

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

## Stato del progetto

Piano di implementazione completato: setup progetto, import puzzle Lichess (~210k, campionati
per rating), autenticazione (email/password + Google OAuth), configurazione sessione
Woodpecker, motore ELO e selezione puzzle, scacchiera interattiva, dashboard e storico
sessioni, rifinitura UI (dark mode, shell di navigazione), deploy su Vercel.

Prossimi sviluppi possibili: altri provider OAuth (Facebook), ottimizzazione dimensione
bundle (code splitting), metriche aggiuntive nello storico.
