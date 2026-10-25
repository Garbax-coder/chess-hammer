# Allenamento sulle aperture — analisi

Stato: **bozza funzionante** sul branch `feature/opening-training` (vedi
"Stato della bozza" in fondo). Questo documento raccoglie le fonti dati, il
modello dati e le funzionalità tipiche per una feature di allenamento sulle
aperture.

## Sviluppo

La feature si sviluppa sul branch di lunga durata `feature/opening-training`
e va in `main` solo quando è pronta. Nel frattempo la manutenzione
dell'app in produzione continua come sempre, su branch brevi da `main`.

- **Allineamento con `main`**: dopo ogni pubblicazione, `main` si porta nel
  branch con un merge (niente rebase), così i conflitti si risolvono un
  poco alla volta e non tutti alla fine.
- **Migrazioni**: la feature usa i numeri da `0100` in su
  (`0100_opening_….sql`, `0101_…`); la manutenzione continua con `0037`,
  `0038`… senza collisioni. In produzione le `01xx` arrivano solo al merge,
  dopo tutte le altre. In sviluppo invece, dopo le `01xx`, una migrazione di
  manutenzione con numero più basso va applicata con
  `supabase db push --db-url "$DEV_SUPABASE_DB_URL" --include-all`.
- **Database di sviluppo condiviso**: finché la feature non è in `main`, le
  sue migrazioni sono solo additive (tabelle, indici e funzioni nuovi); non
  modificano tabelle o funzioni che usa `main`. Se servisse, se ne discute
  prima.
- **Codice**: la feature vive in file e route nuovi; le modifiche ai file
  condivisi (navigazione, traduzioni, `App.tsx`) restano piccole, per
  limitare i conflitti con la manutenzione.
- **Prima del merge**: typecheck, lint, test unitari, build ed e2e, come per
  ogni rilascio; le tabelle nuove con GRANT espliciti e in
  `supabase/tests/table-grants.sql`.

## Concetti

- **Repertorio**: albero di mosse per un'apertura, giocato da un colore
  (bianco o nero).
- **Run**: un cammino radice → foglia dell'albero. Ogni Run corrisponde a
  una foglia, quindi *numero di Run = numero di foglie* e non serve una
  tabella `runs`: un Run si identifica con l'id della sua foglia.
- Il repertorio è **asimmetrico**: le ramificazioni stanno quasi tutte
  sulle mosse avversarie, mentre dalla parte dell'utente di solito c'è una
  sola mossa per nodo.

## 1. Fonti dati

| Fonte | Cosa contiene | Licenza | Note |
|---|---|---|---|
| [lichess-org/chess-openings](https://github.com/lichess-org/chess-openings) (TSV `a`…`e`) | ~3.865 linee con nome (`eco`, `name`, `pgn`; nella build anche `uci`, `epd`) | CC0 | Ottimo per catalogo e nomi. Ogni voce però è solo la linea che porta a quel nome: niente risposte avversarie, niente frequenze. |
| [Lichess Opening Explorer](https://lichess.org/api#tag/Opening-Explorer) (`/masters`, `/lichess`, `/player`) | Per posizione: mosse giocate, vittorie/patte/sconfitte, rating medio, nome dell'apertura | Dati del DB Lichess (CC0) | **Richiede un token OAuth**: senza token risponde 401 (verificato il 2026-10-24). Da usare solo in uno script offline, mai dal client. Ha rate limit: una richiesta alla volta, backoff sul 429. |
| [database.lichess.org](https://database.lichess.org) | Dump PGN mensili di tutte le partite | CC0 | Enormi. Servono solo per calcolarsi le statistiche in autonomia. |
| Studi Lichess / PGN dell'utente | Repertori personali con varianti | Dell'utente | È la funzione più richiesta ("importa il mio repertorio"). L'export PGN degli studi pubblici è un'API pubblica. |
| Libri Polyglot `.bin`, Chessable, Chess.com | — | Spesso non chiara o proprietaria | Da evitare, anche per compatibilità con la GPL-3.0 dell'app. |

### Ricetta per i repertori "di casa" (script offline)

1. Nome e radice dal TSV di `chess-openings`.
2. Espansione con l'Explorer:
   - **mossa dell'utente**: 1 mossa (curata a mano, o la migliore per
     punteggio nel DB masters);
   - **mossa avversaria**: tutte le risposte con frequenza ≥ X% (es. 5%);
   - **stop** a profondità N, oppure quando la probabilità di arrivare al
     nodo (prodotto delle frequenze lungo il cammino) scende sotto una
     soglia.
3. Salvare la frequenza sul nodo (`weight`): serve poi per scegliere quali
   Run proporre e per la copertura pesata.

## 2. Questioni di dominio

### Più mosse giuste in un nodo

Approcci tipici:

1. **Soft-accept** (stile Chessable): "mossa valida, ma in questo Run
   alleniamo X". Nessuna penalità, e si chiede di nuovo.
2. **Cambio di Run dinamico**: si accetta la mossa e si prosegue su un Run
   compatibile.
3. **Accetta e conta entrambe.**

Proposta: il primo come default, il secondo come opzione. Nel modello dati
basta un flag `is_main` sui figli dalla parte dell'utente (principale contro
alternativa accettata).

### Trasposizioni

La stessa posizione si raggiunge con ordini di mosse diversi. L'albero resta
per ordine di mosse (più semplice da mostrare), ma ogni nodo salva l'**EPD**
della posizione, con un indice. Così si riconoscono le trasposizioni e si
possono aggregare le statistiche per posizione, senza gestire un grafo
completo.

## 3. Modello dati

| Opzione | Pro | Contro |
|---|---|---|
| Blob JSON/PGN per apertura | Semplicissimo, si carica tutto in una chiamata | Non si collegano statistiche al singolo nodo lato DB |
| Lista di adiacenza (`parent_id`) | Classica, uguale a `src/lib/move-tree.ts` | Sottoalberi solo con CTE ricorsive |
| **Path materializzato `ltree`** (es. `e2e4.c7c5.g1f3`) | Query sui sottoalberi immediate (`path <@ 'e2e4.c7c5'`), statistiche aggregabili per prefisso. Supabase supporta l'estensione; le mosse UCI sono etichette valide | Un'estensione in più |

Proposta: **adiacenza + `ltree` insieme**. Un albero da qualche migliaio di
nodi è piccolo: si carica tutto sul client e lì si calcolano i Run, mentre il
DB tiene catalogo, progressi e storico.

Bozza (le GRANT e le policy RLS vanno aggiunte nella stessa migrazione,
secondo il pattern di `0032_explicit_table_grants.sql`, e le tabelle vanno
aggiunte a `supabase/tests/table-grants.sql`):

```sql
create extension if not exists ltree;

create table public.opening_repertoires (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, name text not null, eco text,
  color char(1) not null check (color in ('w','b')),
  source text, owner_id uuid references auth.users  -- null = repertorio di catalogo
);

create table public.opening_nodes (
  id bigint generated always as identity primary key,
  repertoire_id uuid not null references public.opening_repertoires on delete cascade,
  parent_id bigint references public.opening_nodes on delete cascade,
  path ltree not null, ply smallint not null,
  uci text not null, san text not null,
  epd text not null,                 -- posizione dopo la mossa (trasposizioni)
  is_main boolean not null default true,
  weight real,                       -- frequenza dall'Explorer
  comment text,
  unique (repertoire_id, path)
);
create index on public.opening_nodes using gist (path);
create index on public.opening_nodes (repertoire_id, epd);

-- stato aggregato per utente e nodo (solo i nodi con la mossa dell'utente)
create table public.opening_node_progress (
  user_id uuid not null references auth.users on delete cascade,
  node_id bigint not null references public.opening_nodes on delete cascade,
  attempts int not null default 0, first_try_correct int not null default 0,
  streak smallint not null default 0, last_seen_at timestamptz,
  due_at timestamptz, stability real,  -- per SRS (SM-2 / FSRS)
  primary key (user_id, node_id)
);

-- log grezzo di ogni mossa giocata, come practice_attempts
create table public.opening_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null, run_leaf_id bigint not null, node_id bigint not null,
  played_uci text not null,
  result text not null check (result in ('correct','alternative','wrong')),
  ms int, created_at timestamptz not null default now()
);
```

La tabella aggregata e il log restano separati: la prima serve per UI e
scheduling veloci, il secondo per lo storico e per ricalcolare.

## 4. Funzionalità tipiche

### Sessioni

- **Learn e Drill separati**: in Learn si mostrano mosse e commenti, in
  Drill si chiedono.
- **Avanzamento rapido del tronco**: le mosse comuni già consolidate si
  giocano da sole e la domanda parte dal primo nodo in scadenza o debole
  del Run.
- **Ripetizione dilazionata per mossa**, con scheduling a livello di Run: si
  scelgono i Run che contengono più nodi in scadenza. Chessable usa
  intervalli fissi (4h, 1g, 3g, 1 settimana…); FSRS è più moderno.
- **Errore → mostra la mossa giusta → ripeti a fine sessione.**
- **Scelta della risposta avversaria**: in base alla frequenza reale,
  uniforme, oppure "meno allenata prima".
- **Allena solo le mosse difficili**, oppure **fino alla mossa N**.
- **Cicli Woodpecker sui Run**: stesso set ripetuto in tempi sempre più
  stretti. Coerente con l'identità dell'app e distintivo.

### Statistiche e UI

- **Vista "explorer" per posizione**: tabella delle mosse con, per ognuna,
  tentativi, % di successo al primo colpo e scadenza.
- **Albero delle varianti comprimibile**, con colori/heatmap per padronanza.
- **Copertura**: % di Run padroneggiati, sia per numero sia pesata per
  `weight` ("quanto spesso sarò preparato davvero").
- **I 10 nodi più deboli**, tempo medio per mossa, streak, Run in scadenza
  oggi.
- In futuro: **confronto con le partite Lichess dell'utente**, per mostrare
  dove è uscito dal repertorio.
- Import/export PGN, con commenti e frecce (`%cal`).

## Stato della bozza

Fatto (2026-10-25):

- **Migrazioni** `0100_opening_training.sql` (tabelle, RLS, GRANT, funzione
  `record_opening_move` con ripasso a intervalli fissi: 4 ore, 1, 3, 7, 21,
  60 giorni) e `0101_opening_catalog.sql` (catalogo, generato).
- **Catalogo** scritto a mano in `scripts/openings/repertoires.json` (Partita
  Italiana e Gambetto di Donna col Bianco, Caro-Kann col Nero; 22 Run),
  trasformato in migrazione da `node scripts/openings/build-catalog.mjs`. Lo
  script e i test controllano che ogni mossa sia legale, che ogni Run finisca
  con una mossa dell'utente e che l'utente abbia una sola mossa per
  posizione; un test verifica che la migrazione sia allineata alle linee.
- **Pagine** `/openings` (repertori con copertura: mosse consolidate, linee
  padroneggiate, da ripassare, nuove) e `/openings/:slug` (Drill: un Run
  alla volta, scelto tra quelli con più mosse da fare; l'avversario risponde
  da solo; conta solo il primo tentativo; dopo un errore la freccia mostra la
  mossa del repertorio). Voce "Aperture" nel menu, testi nelle 5 lingue in
  `src/lib/i18n/openings.ts`.
- **Prove** SQL in `supabase/tests/opening-training.sql` e tabelle aggiunte
  a `supabase/tests/table-grants.sql`.
- **Consultazione** `/openings/:slug/lines` (2026-10-25): albero delle
  varianti comprimibile con la padronanza di ogni mossa dell'utente
  (heatmap: nuova, in apprendimento, da ripassare, consolidata), scacchiera
  di sola lettura sulla mossa selezionata con tentativi, % al primo colpo e
  prossimo ripasso, ed elenco delle linee nell'ordine dell'albero, ognuna da
  allenare da sola (`/openings/:slug?line=<foglia>`).
- **Nomi delle aperture** (2026-10-25): migrazione `0102_opening_names.sql`
  generata dal dataset CC0 di Lichess (copia in
  `scripts/openings/lichess-openings`, 3.865 posizioni con nome), tabella
  `opening_names` (posizione -> ECO e nome) e vista `opening_node_names` che
  li lega alle mosse dei repertori. Il nome di una linea è quello
  dell'ultima posizione con nome lungo il percorso (vale anche per le
  trasposizioni). Nella consultazione: sopra ogni linea, accanto alle mosse
  dove il nome cambia (solo la parte nuova) e sotto la scacchiera. I nomi
  sono solo in inglese, come su Lichess. Nell'albero e nell'elenco delle linee uno
  switch per card mostra o nasconde i nomi; la scelta resta nel browser
  (localStorage `openings-tree-names`, `openings-line-names`).
- **Modalità Learn** `/openings/:slug/learn` (2026-10-25): propone la prima
  linea, nell'ordine dell'albero, con mosse mai viste (o quella scelta con
  `?line=`); l'avversario risponde da solo, le mosse dell'utente si giocano
  seguendo la freccia (o con "Gioca la mossa"). Una mossa studiata diventa
  "in apprendimento" con il primo ripasso fra 4 ore (migrazione
  `0103_opening_learn.sql`, funzione `learn_opening_move`), senza tentativi:
  non era a memoria. "Studia" compare nell'elenco dei repertori e sulle
  linee con mosse nuove; poi si allena.
- **Alternative accettate** (2026-10-25): una linea del catalogo può
  dichiarare un'alternativa (`alternatives` in `repertoires.json`, nodo con
  `is_main = false`). Nel Drill è valida ("buona mossa, ma in questa linea
  alleniamo…"), conta come primo tentativo giusto e poi si chiede la mossa
  principale; non è mai un Run e nell'albero è tratteggiata.
- **Avanzamento rapido del tronco**: le mosse note in testa alla linea
  (consolidate nel Drill, già studiate in Learn) si giocano da sole; switch
  "Salta le mosse già note" (localStorage `openings-fast-forward`).
- **Sessioni del Drill con ripetizione degli errori**: 5 linee, poi di nuovo
  quelle con almeno un errore, poi il riepilogo.
- **Cicli Woodpecker** `/openings/:slug/cycles` (migrazione
  `0104_opening_cycles.sql`): tutte le linee di fila, senza avanzamento
  rapido, a tempo; il ciclo completato si salva e si confronta col
  precedente.
- **Import PGN** `/openings/import` (migrazione `0105_opening_import.sql`):
  varianti e capitoli diventano linee; in anteprima si vedono le linee, le
  mosse dell'avversario tolte in fondo, le seconde mosse dell'utente tenute
  come alternative (senza seguito) e le partite che non partono dalla
  posizione iniziale. Repertori personali (al massimo 20, 3000 mosse
  ciascuno), cancellabili con i loro progressi.

- **Layout a scacchiera fissa** (2026-10-25): Studio, Allenamento, Consulta e
  Cicli usano `OpeningPageLayout`. Su desktop la pagina è alta quanto lo
  schermo sotto l'intestazione e non scorre (niente piè di pagina su queste
  pagine): la scacchiera al centro prende tutta l'altezza disponibile,
  informazioni a sinistra, stato e comandi a destra, e le due colonne
  scorrono per conto loro. Su mobile: scacchiera, comandi, informazioni.

Nota: `0101_opening_catalog.sql` è stata rigenerata dopo essere stata
applicata in sviluppo (alternative). È idempotente: in sviluppo si riapplica
eseguendo il file; in produzione arriva una volta sola, al merge.

Da fare prima del merge:

- **Esportazione dei dati** (profilo): includere `opening_node_progress`,
  `opening_attempts`, `opening_cycles` e i repertori personali.
- **Informativa privacy**: verificare se i tentativi sulle aperture vanno
  citati tra i dati di allenamento, aggiungere alle preferenze salvate nel
  browser la visualizzazione dei nomi delle varianti, e aggiornare la
  versione legale.
- **Anteprima Vercel**: controllare che le variabili "Preview" puntino al
  progetto Supabase di sviluppo.
- Un test e2e del Drill.
- Citare `lichess-org/chess-openings` nella pagina Crediti (CC0 non lo
  richiede, ma è corretto).

Idee per i passi successivi: pesi dall'Opening Explorer (serve un token)
per scegliere le risposte dell'avversario; import diretto da uno studio
Lichess (URL); varianti dell'utente come linee a sé invece che come
alternative, a scelta, nell'import.

