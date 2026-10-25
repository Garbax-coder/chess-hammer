# Nomi delle aperture (Lichess)

Copia dei file `a.tsv` … `e.tsv` di
[lichess-org/chess-openings](https://github.com/lichess-org/chess-openings),
commit `a6189a30dc273ccb21fc2536a9a2fefd5592a67a` (2026-10-06), licenza
**CC0-1.0** (pubblico dominio). Colonne: `eco`, `name`, `pgn`.

Li usa `scripts/openings/build-catalog.mjs` per generare la migrazione
`0102_opening_names.sql`: ogni nome si lega alla posizione raggiunta dalle sue
mosse, e una mossa del repertorio prende il nome dell'ultima posizione con
nome lungo il suo percorso. Per aggiornarli: riscaricare i cinque file,
aggiornare il commit qui sopra e rigenerare.
