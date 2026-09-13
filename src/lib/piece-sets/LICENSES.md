# Licenze dei set di pezzi

Gli SVG in `src/assets/pieces/<set>/` (e i moduli generati in
`src/lib/piece-sets/<set>.tsx`) provengono dal repository open source di
Lichess, [lichess-org/lila](https://github.com/lichess-org/lila),
`public/piece/<set>/`. La licenza completa di ogni set e' elencata in
[COPYING.md](https://github.com/lichess-org/lila/blob/master/COPYING.md) di
quel repository; qui sotto solo i set effettivamente inclusi in questo
progetto.

| Set | Autore | Licenza |
|---|---|---|
| cburnett | Colin M.L. Burnett | GPLv2+ |
| merida | Armando Hernandez Marroquin | GPLv2+ |
| chessnut | Alexis Luengas | Apache-2.0 |
| fantasy | Maurizio Monge | MIT |
| spatial | Maurizio Monge | MIT |

I file SVG non sono modificati rispetto all'originale (solo racchiusi in un
componente React che ne inietta il markup). Rigenerare con
`node scripts/gen-piece-sets.mjs` dopo un eventuale aggiornamento dei file in
`src/assets/pieces/`.
