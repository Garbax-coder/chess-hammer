# Allenamento sulle aperture — analisi

Stato: **proposta / analisi** (2026-10-24). Nessun codice o migrazione ancora
scritto. Questo documento raccoglie le fonti dati, il modello dati e le
funzionalità tipiche per una feature di allenamento sulle aperture.

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
