# Import puzzle Lichess

Script one-shot per popolare la tabella `lichess_puzzles` su Supabase a partire dal dump
pubblico Lichess. Il dump completo (~6.1M puzzle, >1GB decompresso) eccede il limite di
storage del piano Free di Supabase (500MB); questo script applica un **campionamento
stratificato per rating** (reservoir sampling, max 2000 puzzle per fascia da 25 punti) per
ottenere ~200k puzzle con buona copertura su tutto il range di rating, restando entro ~80MB.

Richiede lo schema creato da `supabase/migrations/0001_lichess_puzzles.sql` e la variabile
`SUPABASE_DB_URL` (connection string diretta/pooler a Postgres, **non** l'anon key) in
`.env.local`.

## Passi

```bash
# 1. Scarica il dump (compresso, ~300MB)
curl -L -o lichess_db_puzzle.csv.zst https://database.lichess.org/lichess_db_puzzle.csv.zst

# 2. Decomprimi (richiede zstd: brew install zstd)
unzstd lichess_db_puzzle.csv.zst

# 3. Campiona e trasforma in CSV pronto per COPY (Moves/Themes/OpeningTags -> array Postgres)
python3 sample_puzzles.py
# produce sampled_puzzles.csv

# 4. Applica lo schema (se non già fatto)
set -a && source ../../.env.local && set +a
psql "$SUPABASE_DB_URL" -f ../../supabase/migrations/0001_lichess_puzzles.sql

# 5. Carica i dati
psql "$SUPABASE_DB_URL" -c "\copy lichess_puzzles (puzzle_id, fen, moves, rating, rating_deviation, popularity, nb_plays, themes, game_url, opening_tags) FROM 'sampled_puzzles.csv' WITH (FORMAT csv, HEADER true)"
```

`psql` non è incluso in macOS: `brew install libpq` e aggiungi
`/opt/homebrew/opt/libpq/bin` al PATH.

I file `*.csv` e `*.csv.zst` scaricati/generati in questa cartella sono ignorati da git
(vedi `.gitignore`) — vanno rigenerati localmente quando serve, non committati.
