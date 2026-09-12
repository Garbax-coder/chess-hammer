# Chess Hammer

Web app per tracciare allenamenti di scacchi con il **Woodpecker Method**: risolvi un set
fisso di puzzle per 3 giri consecutivi, aumentando la velocità di risoluzione ad ogni giro.

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

Vedi il piano di implementazione in corso: setup progetto completato (Fase 1). Le fasi
successive (import puzzle Lichess, autenticazione, motore puzzle/ELO, dashboard, deploy)
verranno affrontate una alla volta.
