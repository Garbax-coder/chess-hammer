-- Catalogo dei repertori di apertura (branch feature/opening-training).
-- GENERATO da scripts/openings/build-catalog.mjs a partire da
-- scripts/openings/repertoires.json: non modificare a mano.

-- Italian Game (Bianco): 8 Run, 68 mosse (1 alternative)

insert into public.opening_repertoires (slug, name, eco, color, source)
values ('italian-game', 'Italian Game', 'C50', 'w', 'Curated by hand')
on conflict (slug) do update
  set name = excluded.name, eco = excluded.eco, color = excluded.color, source = excluded.source;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4', null, 1, 'e2e4', 'e4', 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'italian-game'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.e7e5', 'e2e4', 2, 'e7e5', 'e5', 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'italian-game'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.e7e5.g1f3', 'e2e4.e7e5', 3, 'g1f3', 'Nf3', 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'italian-game'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.e7e5.g1f3.b8c6', 'e2e4.e7e5.g1f3', 4, 'b8c6', 'Nc6', 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -', true),
  ('e2e4.e7e5.g1f3.d7d6', 'e2e4.e7e5.g1f3', 4, 'd7d6', 'd6', 'rnbqkbnr/ppp2ppp/3p4/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -', true),
  ('e2e4.e7e5.g1f3.g8f6', 'e2e4.e7e5.g1f3', 4, 'g8f6', 'Nf6', 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'italian-game'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.e7e5.g1f3.b8c6.f1c4', 'e2e4.e7e5.g1f3.b8c6', 5, 'f1c4', 'Bc4', 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq -', true),
  ('e2e4.e7e5.g1f3.d7d6.d2d4', 'e2e4.e7e5.g1f3.d7d6', 5, 'd2d4', 'd4', 'rnbqkbnr/ppp2ppp/3p4/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq -', true),
  ('e2e4.e7e5.g1f3.g8f6.f3e5', 'e2e4.e7e5.g1f3.g8f6', 5, 'f3e5', 'Nxe5', 'rnbqkb1r/pppp1ppp/5n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'italian-game'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5', 'e2e4.e7e5.g1f3.b8c6.f1c4', 6, 'f8c5', 'Bc5', 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8e7', 'e2e4.e7e5.g1f3.b8c6.f1c4', 6, 'f8e7', 'Be7', 'r1bqk1nr/ppppbppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.g8f6', 'e2e4.e7e5.g1f3.b8c6.f1c4', 6, 'g8f6', 'Nf6', 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq -', true),
  ('e2e4.e7e5.g1f3.d7d6.d2d4.e5d4', 'e2e4.e7e5.g1f3.d7d6.d2d4', 6, 'e5d4', 'exd4', 'rnbqkbnr/ppp2ppp/3p4/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq -', true),
  ('e2e4.e7e5.g1f3.g8f6.f3e5.d7d6', 'e2e4.e7e5.g1f3.g8f6.f3e5', 6, 'd7d6', 'd6', 'rnbqkb1r/ppp2ppp/3p1n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R w KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'italian-game'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5', 7, 'c2c3', 'c3', 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R b KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.d2d3', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5', 7, 'd2d3', 'd3', 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq -', false),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8e7.d2d4', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8e7', 7, 'd2d4', 'd4', 'r1bqk1nr/ppppbppp/2n5/4p3/2BPP3/5N2/PPP2PPP/RNBQK2R b KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3', 'e2e4.e7e5.g1f3.b8c6.f1c4.g8f6', 7, 'd2d3', 'd3', 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq -', true),
  ('e2e4.e7e5.g1f3.d7d6.d2d4.e5d4.f3d4', 'e2e4.e7e5.g1f3.d7d6.d2d4.e5d4', 7, 'f3d4', 'Nxd4', 'rnbqkbnr/ppp2ppp/3p4/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq -', true),
  ('e2e4.e7e5.g1f3.g8f6.f3e5.d7d6.e5f3', 'e2e4.e7e5.g1f3.g8f6.f3e5.d7d6', 7, 'e5f3', 'Nf3', 'rnbqkb1r/ppp2ppp/3p1n2/8/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'italian-game'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.d7d6', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3', 8, 'd7d6', 'd6', 'r1bqk1nr/ppp2ppp/2np4/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3', 8, 'g8f6', 'Nf6', 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8e7.d2d4.d7d6', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8e7.d2d4', 8, 'd7d6', 'd6', 'r1bqk1nr/ppp1bppp/2np4/4p3/2BPP3/5N2/PPP2PPP/RNBQK2R w KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8c5', 'e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3', 8, 'f8c5', 'Bc5', 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8e7', 'e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3', 8, 'f8e7', 'Be7', 'r1bqk2r/ppppbppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq -', true),
  ('e2e4.e7e5.g1f3.d7d6.d2d4.e5d4.f3d4.g8f6', 'e2e4.e7e5.g1f3.d7d6.d2d4.e5d4.f3d4', 8, 'g8f6', 'Nf6', 'rnbqkb1r/ppp2ppp/3p1n2/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq -', true),
  ('e2e4.e7e5.g1f3.g8f6.f3e5.d7d6.e5f3.f6e4', 'e2e4.e7e5.g1f3.g8f6.f3e5.d7d6.e5f3', 8, 'f6e4', 'Nxe4', 'rnbqkb1r/ppp2ppp/3p4/8/4n3/5N2/PPPP1PPP/RNBQKB1R w KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'italian-game'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.d7d6.d2d4', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.d7d6', 9, 'd2d4', 'd4', 'r1bqk1nr/ppp2ppp/2np4/2b1p3/2BPP3/2P2N2/PP3PPP/RNBQK2R b KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6', 9, 'd2d4', 'd4', 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2BPP3/2P2N2/PP3PPP/RNBQK2R b KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8e7.d2d4.d7d6.d4d5', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8e7.d2d4.d7d6', 9, 'd4d5', 'd5', 'r1bqk1nr/ppp1bppp/2np4/3Pp3/2B1P3/5N2/PPP2PPP/RNBQK2R b KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8c5.c2c3', 'e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8c5', 9, 'c2c3', 'c3', 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R b KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8e7.e1g1', 'e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8e7', 9, 'e1g1', 'O-O', 'r1bqk2r/ppppbppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 b kq -', true),
  ('e2e4.e7e5.g1f3.d7d6.d2d4.e5d4.f3d4.g8f6.b1c3', 'e2e4.e7e5.g1f3.d7d6.d2d4.e5d4.f3d4.g8f6', 9, 'b1c3', 'Nc3', 'rnbqkb1r/ppp2ppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq -', true),
  ('e2e4.e7e5.g1f3.g8f6.f3e5.d7d6.e5f3.f6e4.d2d4', 'e2e4.e7e5.g1f3.g8f6.f3e5.d7d6.e5f3.f6e4', 9, 'd2d4', 'd4', 'rnbqkb1r/ppp2ppp/3p4/8/3Pn3/5N2/PPP2PPP/RNBQKB1R b KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'italian-game'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.d7d6.d2d4.e5d4', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.d7d6.d2d4', 10, 'e5d4', 'exd4', 'r1bqk1nr/ppp2ppp/2np4/2b5/2BpP3/2P2N2/PP3PPP/RNBQK2R w KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4', 10, 'e5d4', 'exd4', 'r1bqk2r/pppp1ppp/2n2n2/2b5/2BpP3/2P2N2/PP3PPP/RNBQK2R w KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8e7.d2d4.d7d6.d4d5.c6b8', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8e7.d2d4.d7d6.d4d5', 10, 'c6b8', 'Nb8', 'rnbqk1nr/ppp1bppp/3p4/3Pp3/2B1P3/5N2/PPP2PPP/RNBQK2R w KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8c5.c2c3.d7d6', 'e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8c5.c2c3', 10, 'd7d6', 'd6', 'r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R w KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8e7.e1g1.e8g8', 'e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8e7.e1g1', 10, 'e8g8', 'O-O', 'r1bq1rk1/ppppbppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - -', true),
  ('e2e4.e7e5.g1f3.d7d6.d2d4.e5d4.f3d4.g8f6.b1c3.f8e7', 'e2e4.e7e5.g1f3.d7d6.d2d4.e5d4.f3d4.g8f6.b1c3', 10, 'f8e7', 'Be7', 'rnbqk2r/ppp1bppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq -', true),
  ('e2e4.e7e5.g1f3.g8f6.f3e5.d7d6.e5f3.f6e4.d2d4.d6d5', 'e2e4.e7e5.g1f3.g8f6.f3e5.d7d6.e5f3.f6e4.d2d4', 10, 'd6d5', 'd5', 'rnbqkb1r/ppp2ppp/8/3p4/3Pn3/5N2/PPP2PPP/RNBQKB1R w KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'italian-game'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.d7d6.d2d4.e5d4.c3d4', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.d7d6.d2d4.e5d4', 11, 'c3d4', 'cxd4', 'r1bqk1nr/ppp2ppp/2np4/2b5/2BPP3/5N2/PP3PPP/RNBQK2R b KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4', 11, 'c3d4', 'cxd4', 'r1bqk2r/pppp1ppp/2n2n2/2b5/2BPP3/5N2/PP3PPP/RNBQK2R b KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8e7.d2d4.d7d6.d4d5.c6b8.c4d3', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8e7.d2d4.d7d6.d4d5.c6b8', 11, 'c4d3', 'Bd3', 'rnbqk1nr/ppp1bppp/3p4/3Pp3/4P3/3B1N2/PPP2PPP/RNBQK2R b KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8c5.c2c3.d7d6.e1g1', 'e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8c5.c2c3.d7d6', 11, 'e1g1', 'O-O', 'r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQ1RK1 b kq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8e7.e1g1.e8g8.f1e1', 'e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8e7.e1g1.e8g8', 11, 'f1e1', 'Re1', 'r1bq1rk1/ppppbppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQR1K1 b - -', true),
  ('e2e4.e7e5.g1f3.d7d6.d2d4.e5d4.f3d4.g8f6.b1c3.f8e7.f1e2', 'e2e4.e7e5.g1f3.d7d6.d2d4.e5d4.f3d4.g8f6.b1c3.f8e7', 11, 'f1e2', 'Be2', 'rnbqk2r/ppp1bppp/3p1n2/8/3NP3/2N5/PPP1BPPP/R1BQK2R b KQkq -', true),
  ('e2e4.e7e5.g1f3.g8f6.f3e5.d7d6.e5f3.f6e4.d2d4.d6d5.f1d3', 'e2e4.e7e5.g1f3.g8f6.f3e5.d7d6.e5f3.f6e4.d2d4.d6d5', 11, 'f1d3', 'Bd3', 'rnbqkb1r/ppp2ppp/8/3p4/3Pn3/3B1N2/PPP2PPP/RNBQK2R b KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'italian-game'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.d7d6.d2d4.e5d4.c3d4.c5b6', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.d7d6.d2d4.e5d4.c3d4', 12, 'c5b6', 'Bb6', 'r1bqk1nr/ppp2ppp/1bnp4/8/2BPP3/5N2/PP3PPP/RNBQK2R w KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4', 12, 'c5b4', 'Bb4+', 'r1bqk2r/pppp1ppp/2n2n2/8/1bBPP3/5N2/PP3PPP/RNBQK2R w KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8c5.c2c3.d7d6.e1g1.e8g8', 'e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8c5.c2c3.d7d6.e1g1', 12, 'e8g8', 'O-O', 'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQ1RK1 w - -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8e7.e1g1.e8g8.f1e1.d7d6', 'e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8e7.e1g1.e8g8.f1e1', 12, 'd7d6', 'd6', 'r1bq1rk1/ppp1bppp/2np1n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQR1K1 w - -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'italian-game'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.d7d6.d2d4.e5d4.c3d4.c5b6.b1c3', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.d7d6.d2d4.e5d4.c3d4.c5b6', 13, 'b1c3', 'Nc3', 'r1bqk1nr/ppp2ppp/1bnp4/8/2BPP3/2N2N2/PP3PPP/R1BQK2R b KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4', 13, 'c1d2', 'Bd2', 'r1bqk2r/pppp1ppp/2n2n2/8/1bBPP3/5N2/PP1B1PPP/RN1QK2R b KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8c5.c2c3.d7d6.e1g1.e8g8.c4b3', 'e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8c5.c2c3.d7d6.e1g1.e8g8', 13, 'c4b3', 'Bb3', 'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/4P3/1BPP1N2/PP3PPP/RNBQ1RK1 b - -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8e7.e1g1.e8g8.f1e1.d7d6.c2c3', 'e2e4.e7e5.g1f3.b8c6.f1c4.g8f6.d2d3.f8e7.e1g1.e8g8.f1e1.d7d6', 13, 'c2c3', 'c3', 'r1bq1rk1/ppp1bppp/2np1n2/4p3/2B1P3/2PP1N2/PP3PPP/RNBQR1K1 b - -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'italian-game'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.b4d2', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2', 14, 'b4d2', 'Bxd2+', 'r1bqk2r/pppp1ppp/2n2n2/8/2BPP3/5N2/PP1b1PPP/RN1QK2R w KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.f6e4', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2', 14, 'f6e4', 'Nxe4', 'r1bqk2r/pppp1ppp/2n5/8/1bBPn3/5N2/PP1B1PPP/RN1QK2R w KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'italian-game'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.b4d2.b1d2', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.b4d2', 15, 'b1d2', 'Nbxd2', 'r1bqk2r/pppp1ppp/2n2n2/8/2BPP3/5N2/PP1N1PPP/R2QK2R b KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.f6e4.d2b4', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.f6e4', 15, 'd2b4', 'Bxb4', 'r1bqk2r/pppp1ppp/2n5/8/1BBPn3/5N2/PP3PPP/RN1QK2R b KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'italian-game'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.b4d2.b1d2.d7d5', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.b4d2.b1d2', 16, 'd7d5', 'd5', 'r1bqk2r/ppp2ppp/2n2n2/3p4/2BPP3/5N2/PP1N1PPP/R2QK2R w KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.f6e4.d2b4.c6b4', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.f6e4.d2b4', 16, 'c6b4', 'Nxb4', 'r1bqk2r/pppp1ppp/8/8/1nBPn3/5N2/PP3PPP/RN1QK2R w KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'italian-game'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.b4d2.b1d2.d7d5.e4d5', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.b4d2.b1d2.d7d5', 17, 'e4d5', 'exd5', 'r1bqk2r/ppp2ppp/2n2n2/3P4/2BP4/5N2/PP1N1PPP/R2QK2R b KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.f6e4.d2b4.c6b4.c4f7', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.f6e4.d2b4.c6b4', 17, 'c4f7', 'Bxf7+', 'r1bqk2r/pppp1Bpp/8/8/1n1Pn3/5N2/PP3PPP/RN1QK2R b KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'italian-game'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.b4d2.b1d2.d7d5.e4d5.f6d5', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.b4d2.b1d2.d7d5.e4d5', 18, 'f6d5', 'Nxd5', 'r1bqk2r/ppp2ppp/2n5/3n4/2BP4/5N2/PP1N1PPP/R2QK2R w KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.f6e4.d2b4.c6b4.c4f7.e8f7', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.f6e4.d2b4.c6b4.c4f7', 18, 'e8f7', 'Kxf7', 'r1bq3r/pppp1kpp/8/8/1n1Pn3/5N2/PP3PPP/RN1QK2R w KQ -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'italian-game'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.b4d2.b1d2.d7d5.e4d5.f6d5.d1b3', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.b4d2.b1d2.d7d5.e4d5.f6d5', 19, 'd1b3', 'Qb3', 'r1bqk2r/ppp2ppp/2n5/3n4/2BP4/1Q3N2/PP1N1PPP/R3K2R b KQkq -', true),
  ('e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.f6e4.d2b4.c6b4.c4f7.e8f7.d1b3', 'e2e4.e7e5.g1f3.b8c6.f1c4.f8c5.c2c3.g8f6.d2d4.e5d4.c3d4.c5b4.c1d2.f6e4.d2b4.c6b4.c4f7.e8f7', 19, 'd1b3', 'Qb3+', 'r1bq3r/pppp1kpp/8/8/1n1Pn3/1Q3N2/PP3PPP/RN2K2R b KQ -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'italian-game'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

-- Queen's Gambit (Bianco): 6 Run, 46 mosse (1 alternative)

insert into public.opening_repertoires (slug, name, eco, color, source)
values ('queens-gambit', 'Queen''s Gambit', 'D06', 'w', 'Curated by hand')
on conflict (slug) do update
  set name = excluded.name, eco = excluded.eco, color = excluded.color, source = excluded.source;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('d2d4', null, 1, 'd2d4', 'd4', 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'queens-gambit'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('d2d4.d7d5', 'd2d4', 2, 'd7d5', 'd5', 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'queens-gambit'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('d2d4.d7d5.c2c4', 'd2d4.d7d5', 3, 'c2c4', 'c4', 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'queens-gambit'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('d2d4.d7d5.c2c4.c7c6', 'd2d4.d7d5.c2c4', 4, 'c7c6', 'c6', 'rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -', true),
  ('d2d4.d7d5.c2c4.d5c4', 'd2d4.d7d5.c2c4', 4, 'd5c4', 'dxc4', 'rnbqkbnr/ppp1pppp/8/8/2pP4/8/PP2PPPP/RNBQKBNR w KQkq -', true),
  ('d2d4.d7d5.c2c4.e7e6', 'd2d4.d7d5.c2c4', 4, 'e7e6', 'e6', 'rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'queens-gambit'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('d2d4.d7d5.c2c4.c7c6.g1f3', 'd2d4.d7d5.c2c4.c7c6', 5, 'g1f3', 'Nf3', 'rnbqkbnr/pp2pppp/2p5/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq -', true),
  ('d2d4.d7d5.c2c4.d5c4.g1f3', 'd2d4.d7d5.c2c4.d5c4', 5, 'g1f3', 'Nf3', 'rnbqkbnr/ppp1pppp/8/8/2pP4/5N2/PP2PPPP/RNBQKB1R b KQkq -', true),
  ('d2d4.d7d5.c2c4.e7e6.b1c3', 'd2d4.d7d5.c2c4.e7e6', 5, 'b1c3', 'Nc3', 'rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'queens-gambit'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('d2d4.d7d5.c2c4.c7c6.g1f3.g8f6', 'd2d4.d7d5.c2c4.c7c6.g1f3', 6, 'g8f6', 'Nf6', 'rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq -', true),
  ('d2d4.d7d5.c2c4.d5c4.g1f3.g8f6', 'd2d4.d7d5.c2c4.d5c4.g1f3', 6, 'g8f6', 'Nf6', 'rnbqkb1r/ppp1pppp/5n2/8/2pP4/5N2/PP2PPPP/RNBQKB1R w KQkq -', true),
  ('d2d4.d7d5.c2c4.e7e6.b1c3.f8e7', 'd2d4.d7d5.c2c4.e7e6.b1c3', 6, 'f8e7', 'Be7', 'rnbqk1nr/ppp1bppp/4p3/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -', true),
  ('d2d4.d7d5.c2c4.e7e6.b1c3.g8f6', 'd2d4.d7d5.c2c4.e7e6.b1c3', 6, 'g8f6', 'Nf6', 'rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'queens-gambit'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('d2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3', 'd2d4.d7d5.c2c4.c7c6.g1f3.g8f6', 7, 'b1c3', 'Nc3', 'rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -', true),
  ('d2d4.d7d5.c2c4.d5c4.g1f3.g8f6.e2e3', 'd2d4.d7d5.c2c4.d5c4.g1f3.g8f6', 7, 'e2e3', 'e3', 'rnbqkb1r/ppp1pppp/5n2/8/2pP4/4PN2/PP3PPP/RNBQKB1R b KQkq -', true),
  ('d2d4.d7d5.c2c4.e7e6.b1c3.f8e7.g1f3', 'd2d4.d7d5.c2c4.e7e6.b1c3.f8e7', 7, 'g1f3', 'Nf3', 'rnbqk1nr/ppp1bppp/4p3/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -', true),
  ('d2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5', 'd2d4.d7d5.c2c4.e7e6.b1c3.g8f6', 7, 'c1g5', 'Bg5', 'rnbqkb1r/ppp2ppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR b KQkq -', true),
  ('d2d4.d7d5.c2c4.e7e6.b1c3.g8f6.g1f3', 'd2d4.d7d5.c2c4.e7e6.b1c3.g8f6', 7, 'g1f3', 'Nf3', 'rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq -', false)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'queens-gambit'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('d2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3.d5c4', 'd2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3', 8, 'd5c4', 'dxc4', 'rnbqkb1r/pp2pppp/2p2n2/8/2pP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -', true),
  ('d2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3.e7e6', 'd2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3', 8, 'e7e6', 'e6', 'rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -', true),
  ('d2d4.d7d5.c2c4.d5c4.g1f3.g8f6.e2e3.e7e6', 'd2d4.d7d5.c2c4.d5c4.g1f3.g8f6.e2e3', 8, 'e7e6', 'e6', 'rnbqkb1r/ppp2ppp/4pn2/8/2pP4/4PN2/PP3PPP/RNBQKB1R w KQkq -', true),
  ('d2d4.d7d5.c2c4.e7e6.b1c3.f8e7.g1f3.g8f6', 'd2d4.d7d5.c2c4.e7e6.b1c3.f8e7.g1f3', 8, 'g8f6', 'Nf6', 'rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq -', true),
  ('d2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5.b8d7', 'd2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5', 8, 'b8d7', 'Nbd7', 'r1bqkb1r/pppn1ppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR w KQkq -', true),
  ('d2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5.f8e7', 'd2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5', 8, 'f8e7', 'Be7', 'rnbqk2r/ppp1bppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR w KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'queens-gambit'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('d2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3.d5c4.a2a4', 'd2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3.d5c4', 9, 'a2a4', 'a4', 'rnbqkb1r/pp2pppp/2p2n2/8/P1pP4/2N2N2/1P2PPPP/R1BQKB1R b KQkq -', true),
  ('d2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3.e7e6.e2e3', 'd2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3.e7e6', 9, 'e2e3', 'e3', 'rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R b KQkq -', true),
  ('d2d4.d7d5.c2c4.d5c4.g1f3.g8f6.e2e3.e7e6.f1c4', 'd2d4.d7d5.c2c4.d5c4.g1f3.g8f6.e2e3.e7e6', 9, 'f1c4', 'Bxc4', 'rnbqkb1r/ppp2ppp/4pn2/8/2BP4/4PN2/PP3PPP/RNBQK2R b KQkq -', true),
  ('d2d4.d7d5.c2c4.e7e6.b1c3.f8e7.g1f3.g8f6.c1f4', 'd2d4.d7d5.c2c4.e7e6.b1c3.f8e7.g1f3.g8f6', 9, 'c1f4', 'Bf4', 'rnbqk2r/ppp1bppp/4pn2/3p4/2PP1B2/2N2N2/PP2PPPP/R2QKB1R b KQkq -', true),
  ('d2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5.b8d7.e2e3', 'd2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5.b8d7', 9, 'e2e3', 'e3', 'r1bqkb1r/pppn1ppp/4pn2/3p2B1/2PP4/2N1P3/PP3PPP/R2QKBNR b KQkq -', true),
  ('d2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5.f8e7.e2e3', 'd2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5.f8e7', 9, 'e2e3', 'e3', 'rnbqk2r/ppp1bppp/4pn2/3p2B1/2PP4/2N1P3/PP3PPP/R2QKBNR b KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'queens-gambit'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('d2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3.d5c4.a2a4.c8f5', 'd2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3.d5c4.a2a4', 10, 'c8f5', 'Bf5', 'rn1qkb1r/pp2pppp/2p2n2/5b2/P1pP4/2N2N2/1P2PPPP/R1BQKB1R w KQkq -', true),
  ('d2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3.e7e6.e2e3.b8d7', 'd2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3.e7e6.e2e3', 10, 'b8d7', 'Nbd7', 'r1bqkb1r/pp1n1ppp/2p1pn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQkq -', true),
  ('d2d4.d7d5.c2c4.d5c4.g1f3.g8f6.e2e3.e7e6.f1c4.c7c5', 'd2d4.d7d5.c2c4.d5c4.g1f3.g8f6.e2e3.e7e6.f1c4', 10, 'c7c5', 'c5', 'rnbqkb1r/pp3ppp/4pn2/2p5/2BP4/4PN2/PP3PPP/RNBQK2R w KQkq -', true),
  ('d2d4.d7d5.c2c4.e7e6.b1c3.f8e7.g1f3.g8f6.c1f4.e8g8', 'd2d4.d7d5.c2c4.e7e6.b1c3.f8e7.g1f3.g8f6.c1f4', 10, 'e8g8', 'O-O', 'rnbq1rk1/ppp1bppp/4pn2/3p4/2PP1B2/2N2N2/PP2PPPP/R2QKB1R w KQ -', true),
  ('d2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5.b8d7.e2e3.c7c6', 'd2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5.b8d7.e2e3', 10, 'c7c6', 'c6', 'r1bqkb1r/pp1n1ppp/2p1pn2/3p2B1/2PP4/2N1P3/PP3PPP/R2QKBNR w KQkq -', true),
  ('d2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5.f8e7.e2e3.e8g8', 'd2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5.f8e7.e2e3', 10, 'e8g8', 'O-O', 'rnbq1rk1/ppp1bppp/4pn2/3p2B1/2PP4/2N1P3/PP3PPP/R2QKBNR w KQ -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'queens-gambit'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('d2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3.d5c4.a2a4.c8f5.e2e3', 'd2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3.d5c4.a2a4.c8f5', 11, 'e2e3', 'e3', 'rn1qkb1r/pp2pppp/2p2n2/5b2/P1pP4/2N1PN2/1P3PPP/R1BQKB1R b KQkq -', true),
  ('d2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3.e7e6.e2e3.b8d7.d1c2', 'd2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3.e7e6.e2e3.b8d7', 11, 'd1c2', 'Qc2', 'r1bqkb1r/pp1n1ppp/2p1pn2/3p4/2PP4/2N1PN2/PPQ2PPP/R1B1KB1R b KQkq -', true),
  ('d2d4.d7d5.c2c4.d5c4.g1f3.g8f6.e2e3.e7e6.f1c4.c7c5.e1g1', 'd2d4.d7d5.c2c4.d5c4.g1f3.g8f6.e2e3.e7e6.f1c4.c7c5', 11, 'e1g1', 'O-O', 'rnbqkb1r/pp3ppp/4pn2/2p5/2BP4/4PN2/PP3PPP/RNBQ1RK1 b kq -', true),
  ('d2d4.d7d5.c2c4.e7e6.b1c3.f8e7.g1f3.g8f6.c1f4.e8g8.e2e3', 'd2d4.d7d5.c2c4.e7e6.b1c3.f8e7.g1f3.g8f6.c1f4.e8g8', 11, 'e2e3', 'e3', 'rnbq1rk1/ppp1bppp/4pn2/3p4/2PP1B2/2N1PN2/PP3PPP/R2QKB1R b KQ -', true),
  ('d2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5.b8d7.e2e3.c7c6.g1f3', 'd2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5.b8d7.e2e3.c7c6', 11, 'g1f3', 'Nf3', 'r1bqkb1r/pp1n1ppp/2p1pn2/3p2B1/2PP4/2N1PN2/PP3PPP/R2QKB1R b KQkq -', true),
  ('d2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5.f8e7.e2e3.e8g8.g1f3', 'd2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5.f8e7.e2e3.e8g8', 11, 'g1f3', 'Nf3', 'rnbq1rk1/ppp1bppp/4pn2/3p2B1/2PP4/2N1PN2/PP3PPP/R2QKB1R b KQ -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'queens-gambit'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('d2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3.d5c4.a2a4.c8f5.e2e3.e7e6', 'd2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3.d5c4.a2a4.c8f5.e2e3', 12, 'e7e6', 'e6', 'rn1qkb1r/pp3ppp/2p1pn2/5b2/P1pP4/2N1PN2/1P3PPP/R1BQKB1R w KQkq -', true),
  ('d2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5.f8e7.e2e3.e8g8.g1f3.b8d7', 'd2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5.f8e7.e2e3.e8g8.g1f3', 12, 'b8d7', 'Nbd7', 'r1bq1rk1/pppnbppp/4pn2/3p2B1/2PP4/2N1PN2/PP3PPP/R2QKB1R w KQ -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'queens-gambit'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('d2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3.d5c4.a2a4.c8f5.e2e3.e7e6.f1c4', 'd2d4.d7d5.c2c4.c7c6.g1f3.g8f6.b1c3.d5c4.a2a4.c8f5.e2e3.e7e6', 13, 'f1c4', 'Bxc4', 'rn1qkb1r/pp3ppp/2p1pn2/5b2/P1BP4/2N1PN2/1P3PPP/R1BQK2R b KQkq -', true),
  ('d2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5.f8e7.e2e3.e8g8.g1f3.b8d7.a1c1', 'd2d4.d7d5.c2c4.e7e6.b1c3.g8f6.c1g5.f8e7.e2e3.e8g8.g1f3.b8d7', 13, 'a1c1', 'Rc1', 'r1bq1rk1/pppnbppp/4pn2/3p2B1/2PP4/2N1PN2/PP3PPP/2RQKB1R b K -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'queens-gambit'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

-- Caro-Kann Defence (Nero): 8 Run, 63 mosse (1 alternative)

insert into public.opening_repertoires (slug, name, eco, color, source)
values ('caro-kann', 'Caro-Kann Defence', 'B12', 'b', 'Curated by hand')
on conflict (slug) do update
  set name = excluded.name, eco = excluded.eco, color = excluded.color, source = excluded.source;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4', null, 1, 'e2e4', 'e4', 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'caro-kann'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.c7c6', 'e2e4', 2, 'c7c6', 'c6', 'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'caro-kann'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.c7c6.b1c3', 'e2e4.c7c6', 3, 'b1c3', 'Nc3', 'rnbqkbnr/pp1ppppp/2p5/8/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq -', true),
  ('e2e4.c7c6.c2c4', 'e2e4.c7c6', 3, 'c2c4', 'c4', 'rnbqkbnr/pp1ppppp/2p5/8/2P1P3/8/PP1P1PPP/RNBQKBNR b KQkq -', true),
  ('e2e4.c7c6.d2d4', 'e2e4.c7c6', 3, 'd2d4', 'd4', 'rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'caro-kann'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.c7c6.b1c3.d7d5', 'e2e4.c7c6.b1c3', 4, 'd7d5', 'd5', 'rnbqkbnr/pp2pppp/2p5/3p4/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq -', true),
  ('e2e4.c7c6.c2c4.d7d5', 'e2e4.c7c6.c2c4', 4, 'd7d5', 'd5', 'rnbqkbnr/pp2pppp/2p5/3p4/2P1P3/8/PP1P1PPP/RNBQKBNR w KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5', 'e2e4.c7c6.d2d4', 4, 'd7d5', 'd5', 'rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'caro-kann'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.c7c6.b1c3.d7d5.g1f3', 'e2e4.c7c6.b1c3.d7d5', 5, 'g1f3', 'Nf3', 'rnbqkbnr/pp2pppp/2p5/3p4/4P3/2N2N2/PPPP1PPP/R1BQKB1R b KQkq -', true),
  ('e2e4.c7c6.c2c4.d7d5.e4d5', 'e2e4.c7c6.c2c4.d7d5', 5, 'e4d5', 'exd5', 'rnbqkbnr/pp2pppp/2p5/3P4/2P5/8/PP1P1PPP/RNBQKBNR b KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.b1c3', 'e2e4.c7c6.d2d4.d7d5', 5, 'b1c3', 'Nc3', 'rnbqkbnr/pp2pppp/2p5/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.b1d2', 'e2e4.c7c6.d2d4.d7d5', 5, 'b1d2', 'Nd2', 'rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPPN1PPP/R1BQKBNR b KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4d5', 'e2e4.c7c6.d2d4.d7d5', 5, 'e4d5', 'exd5', 'rnbqkbnr/pp2pppp/2p5/3P4/3P4/8/PPP2PPP/RNBQKBNR b KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4e5', 'e2e4.c7c6.d2d4.d7d5', 5, 'e4e5', 'e5', 'rnbqkbnr/pp2pppp/2p5/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'caro-kann'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.c7c6.b1c3.d7d5.g1f3.c8g4', 'e2e4.c7c6.b1c3.d7d5.g1f3', 6, 'c8g4', 'Bg4', 'rn1qkbnr/pp2pppp/2p5/3p4/4P1b1/2N2N2/PPPP1PPP/R1BQKB1R w KQkq -', true),
  ('e2e4.c7c6.c2c4.d7d5.e4d5.c6d5', 'e2e4.c7c6.c2c4.d7d5.e4d5', 6, 'c6d5', 'cxd5', 'rnbqkbnr/pp2pppp/8/3p4/2P5/8/PP1P1PPP/RNBQKBNR w KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.b1c3.d5e4', 'e2e4.c7c6.d2d4.d7d5.b1c3', 6, 'd5e4', 'dxe4', 'rnbqkbnr/pp2pppp/2p5/8/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.b1d2.d5e4', 'e2e4.c7c6.d2d4.d7d5.b1d2', 6, 'd5e4', 'dxe4', 'rnbqkbnr/pp2pppp/2p5/8/3Pp3/8/PPPN1PPP/R1BQKBNR w KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4d5.c6d5', 'e2e4.c7c6.d2d4.d7d5.e4d5', 6, 'c6d5', 'cxd5', 'rnbqkbnr/pp2pppp/8/3p4/3P4/8/PPP2PPP/RNBQKBNR w KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4e5.c6c5', 'e2e4.c7c6.d2d4.d7d5.e4e5', 6, 'c6c5', 'c5', 'rnbqkbnr/pp2pppp/8/2ppP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq -', false),
  ('e2e4.c7c6.d2d4.d7d5.e4e5.c8f5', 'e2e4.c7c6.d2d4.d7d5.e4e5', 6, 'c8f5', 'Bf5', 'rn1qkbnr/pp2pppp/2p5/3pPb2/3P4/8/PPP2PPP/RNBQKBNR w KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'caro-kann'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.c7c6.b1c3.d7d5.g1f3.c8g4.h2h3', 'e2e4.c7c6.b1c3.d7d5.g1f3.c8g4', 7, 'h2h3', 'h3', 'rn1qkbnr/pp2pppp/2p5/3p4/4P1b1/2N2N1P/PPPP1PP1/R1BQKB1R b KQkq -', true),
  ('e2e4.c7c6.c2c4.d7d5.e4d5.c6d5.c4d5', 'e2e4.c7c6.c2c4.d7d5.e4d5.c6d5', 7, 'c4d5', 'cxd5', 'rnbqkbnr/pp2pppp/8/3P4/8/8/PP1P1PPP/RNBQKBNR b KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.b1c3.d5e4.c3e4', 'e2e4.c7c6.d2d4.d7d5.b1c3.d5e4', 7, 'c3e4', 'Nxe4', 'rnbqkbnr/pp2pppp/2p5/8/3PN3/8/PPP2PPP/R1BQKBNR b KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.b1d2.d5e4.d2e4', 'e2e4.c7c6.d2d4.d7d5.b1d2.d5e4', 7, 'd2e4', 'Nxe4', 'rnbqkbnr/pp2pppp/2p5/8/3PN3/8/PPP2PPP/R1BQKBNR b KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.c2c4', 'e2e4.c7c6.d2d4.d7d5.e4d5.c6d5', 7, 'c2c4', 'c4', 'rnbqkbnr/pp2pppp/8/3p4/2PP4/8/PP3PPP/RNBQKBNR b KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.f1d3', 'e2e4.c7c6.d2d4.d7d5.e4d5.c6d5', 7, 'f1d3', 'Bd3', 'rnbqkbnr/pp2pppp/8/3p4/3P4/3B4/PPP2PPP/RNBQK1NR b KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4e5.c8f5.b1c3', 'e2e4.c7c6.d2d4.d7d5.e4e5.c8f5', 7, 'b1c3', 'Nc3', 'rn1qkbnr/pp2pppp/2p5/3pPb2/3P4/2N5/PPP2PPP/R1BQKBNR b KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4e5.c8f5.g1f3', 'e2e4.c7c6.d2d4.d7d5.e4e5.c8f5', 7, 'g1f3', 'Nf3', 'rn1qkbnr/pp2pppp/2p5/3pPb2/3P4/5N2/PPP2PPP/RNBQKB1R b KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'caro-kann'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.c7c6.b1c3.d7d5.g1f3.c8g4.h2h3.g4f3', 'e2e4.c7c6.b1c3.d7d5.g1f3.c8g4.h2h3', 8, 'g4f3', 'Bxf3', 'rn1qkbnr/pp2pppp/2p5/3p4/4P3/2N2b1P/PPPP1PP1/R1BQKB1R w KQkq -', true),
  ('e2e4.c7c6.c2c4.d7d5.e4d5.c6d5.c4d5.g8f6', 'e2e4.c7c6.c2c4.d7d5.e4d5.c6d5.c4d5', 8, 'g8f6', 'Nf6', 'rnbqkb1r/pp2pppp/5n2/3P4/8/8/PP1P1PPP/RNBQKBNR w KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.b1c3.d5e4.c3e4.c8f5', 'e2e4.c7c6.d2d4.d7d5.b1c3.d5e4.c3e4', 8, 'c8f5', 'Bf5', 'rn1qkbnr/pp2pppp/2p5/5b2/3PN3/8/PPP2PPP/R1BQKBNR w KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.b1d2.d5e4.d2e4.c8f5', 'e2e4.c7c6.d2d4.d7d5.b1d2.d5e4.d2e4', 8, 'c8f5', 'Bf5', 'rn1qkbnr/pp2pppp/2p5/5b2/3PN3/8/PPP2PPP/R1BQKBNR w KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.c2c4.g8f6', 'e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.c2c4', 8, 'g8f6', 'Nf6', 'rnbqkb1r/pp2pppp/5n2/3p4/2PP4/8/PP3PPP/RNBQKBNR w KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.f1d3.b8c6', 'e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.f1d3', 8, 'b8c6', 'Nc6', 'r1bqkbnr/pp2pppp/2n5/3p4/3P4/3B4/PPP2PPP/RNBQK1NR w KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4e5.c8f5.b1c3.e7e6', 'e2e4.c7c6.d2d4.d7d5.e4e5.c8f5.b1c3', 8, 'e7e6', 'e6', 'rn1qkbnr/pp3ppp/2p1p3/3pPb2/3P4/2N5/PPP2PPP/R1BQKBNR w KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4e5.c8f5.g1f3.e7e6', 'e2e4.c7c6.d2d4.d7d5.e4e5.c8f5.g1f3', 8, 'e7e6', 'e6', 'rn1qkbnr/pp3ppp/2p1p3/3pPb2/3P4/5N2/PPP2PPP/RNBQKB1R w KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'caro-kann'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.c7c6.b1c3.d7d5.g1f3.c8g4.h2h3.g4f3.d1f3', 'e2e4.c7c6.b1c3.d7d5.g1f3.c8g4.h2h3.g4f3', 9, 'd1f3', 'Qxf3', 'rn1qkbnr/pp2pppp/2p5/3p4/4P3/2N2Q1P/PPPP1PP1/R1B1KB1R b KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.b1c3.d5e4.c3e4.c8f5.e4g3', 'e2e4.c7c6.d2d4.d7d5.b1c3.d5e4.c3e4.c8f5', 9, 'e4g3', 'Ng3', 'rn1qkbnr/pp2pppp/2p5/5b2/3P4/6N1/PPP2PPP/R1BQKBNR b KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.b1d2.d5e4.d2e4.c8f5.e4g3', 'e2e4.c7c6.d2d4.d7d5.b1d2.d5e4.d2e4.c8f5', 9, 'e4g3', 'Ng3', 'rn1qkbnr/pp2pppp/2p5/5b2/3P4/6N1/PPP2PPP/R1BQKBNR b KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.c2c4.g8f6.b1c3', 'e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.c2c4.g8f6', 9, 'b1c3', 'Nc3', 'rnbqkb1r/pp2pppp/5n2/3p4/2PP4/2N5/PP3PPP/R1BQKBNR b KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.f1d3.b8c6.c2c3', 'e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.f1d3.b8c6', 9, 'c2c3', 'c3', 'r1bqkbnr/pp2pppp/2n5/3p4/3P4/2PB4/PP3PPP/RNBQK1NR b KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4e5.c8f5.b1c3.e7e6.g2g4', 'e2e4.c7c6.d2d4.d7d5.e4e5.c8f5.b1c3.e7e6', 9, 'g2g4', 'g4', 'rn1qkbnr/pp3ppp/2p1p3/3pPb2/3P2P1/2N5/PPP2P1P/R1BQKBNR b KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4e5.c8f5.g1f3.e7e6.f1e2', 'e2e4.c7c6.d2d4.d7d5.e4e5.c8f5.g1f3.e7e6', 9, 'f1e2', 'Be2', 'rn1qkbnr/pp3ppp/2p1p3/3pPb2/3P4/5N2/PPP1BPPP/RNBQK2R b KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'caro-kann'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.c7c6.b1c3.d7d5.g1f3.c8g4.h2h3.g4f3.d1f3.e7e6', 'e2e4.c7c6.b1c3.d7d5.g1f3.c8g4.h2h3.g4f3.d1f3', 10, 'e7e6', 'e6', 'rn1qkbnr/pp3ppp/2p1p3/3p4/4P3/2N2Q1P/PPPP1PP1/R1B1KB1R w KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.b1c3.d5e4.c3e4.c8f5.e4g3.f5g6', 'e2e4.c7c6.d2d4.d7d5.b1c3.d5e4.c3e4.c8f5.e4g3', 10, 'f5g6', 'Bg6', 'rn1qkbnr/pp2pppp/2p3b1/8/3P4/6N1/PPP2PPP/R1BQKBNR w KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.b1d2.d5e4.d2e4.c8f5.e4g3.f5g6', 'e2e4.c7c6.d2d4.d7d5.b1d2.d5e4.d2e4.c8f5.e4g3', 10, 'f5g6', 'Bg6', 'rn1qkbnr/pp2pppp/2p3b1/8/3P4/6N1/PPP2PPP/R1BQKBNR w KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.c2c4.g8f6.b1c3.e7e6', 'e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.c2c4.g8f6.b1c3', 10, 'e7e6', 'e6', 'rnbqkb1r/pp3ppp/4pn2/3p4/2PP4/2N5/PP3PPP/R1BQKBNR w KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.f1d3.b8c6.c2c3.g8f6', 'e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.f1d3.b8c6.c2c3', 10, 'g8f6', 'Nf6', 'r1bqkb1r/pp2pppp/2n2n2/3p4/3P4/2PB4/PP3PPP/RNBQK1NR w KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4e5.c8f5.b1c3.e7e6.g2g4.f5g6', 'e2e4.c7c6.d2d4.d7d5.e4e5.c8f5.b1c3.e7e6.g2g4', 10, 'f5g6', 'Bg6', 'rn1qkbnr/pp3ppp/2p1p1b1/3pP3/3P2P1/2N5/PPP2P1P/R1BQKBNR w KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4e5.c8f5.g1f3.e7e6.f1e2.c6c5', 'e2e4.c7c6.d2d4.d7d5.e4e5.c8f5.g1f3.e7e6.f1e2', 10, 'c6c5', 'c5', 'rn1qkbnr/pp3ppp/4p3/2ppPb2/3P4/5N2/PPP1BPPP/RNBQK2R w KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'caro-kann'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.c7c6.d2d4.d7d5.b1c3.d5e4.c3e4.c8f5.e4g3.f5g6.h2h4', 'e2e4.c7c6.d2d4.d7d5.b1c3.d5e4.c3e4.c8f5.e4g3.f5g6', 11, 'h2h4', 'h4', 'rn1qkbnr/pp2pppp/2p3b1/8/3P3P/6N1/PPP2PP1/R1BQKBNR b KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.c2c4.g8f6.b1c3.e7e6.g1f3', 'e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.c2c4.g8f6.b1c3.e7e6', 11, 'g1f3', 'Nf3', 'rnbqkb1r/pp3ppp/4pn2/3p4/2PP4/2N2N2/PP3PPP/R1BQKB1R b KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.f1d3.b8c6.c2c3.g8f6.c1f4', 'e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.f1d3.b8c6.c2c3.g8f6', 11, 'c1f4', 'Bf4', 'r1bqkb1r/pp2pppp/2n2n2/3p4/3P1B2/2PB4/PP3PPP/RN1QK1NR b KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4e5.c8f5.b1c3.e7e6.g2g4.f5g6.g1e2', 'e2e4.c7c6.d2d4.d7d5.e4e5.c8f5.b1c3.e7e6.g2g4.f5g6', 11, 'g1e2', 'Nge2', 'rn1qkbnr/pp3ppp/2p1p1b1/3pP3/3P2P1/2N5/PPP1NP1P/R1BQKB1R b KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'caro-kann'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.c7c6.d2d4.d7d5.b1c3.d5e4.c3e4.c8f5.e4g3.f5g6.h2h4.h7h6', 'e2e4.c7c6.d2d4.d7d5.b1c3.d5e4.c3e4.c8f5.e4g3.f5g6.h2h4', 12, 'h7h6', 'h6', 'rn1qkbnr/pp2ppp1/2p3bp/8/3P3P/6N1/PPP2PP1/R1BQKBNR w KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.c2c4.g8f6.b1c3.e7e6.g1f3.f8e7', 'e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.c2c4.g8f6.b1c3.e7e6.g1f3', 12, 'f8e7', 'Be7', 'rnbqk2r/pp2bppp/4pn2/3p4/2PP4/2N2N2/PP3PPP/R1BQKB1R w KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.f1d3.b8c6.c2c3.g8f6.c1f4.c8g4', 'e2e4.c7c6.d2d4.d7d5.e4d5.c6d5.f1d3.b8c6.c2c3.g8f6.c1f4', 12, 'c8g4', 'Bg4', 'r2qkb1r/pp2pppp/2n2n2/3p4/3P1Bb1/2PB4/PP3PPP/RN1QK1NR w KQkq -', true),
  ('e2e4.c7c6.d2d4.d7d5.e4e5.c8f5.b1c3.e7e6.g2g4.f5g6.g1e2.c6c5', 'e2e4.c7c6.d2d4.d7d5.e4e5.c8f5.b1c3.e7e6.g2g4.f5g6.g1e2', 12, 'c6c5', 'c5', 'rn1qkbnr/pp3ppp/4p1b1/2ppP3/3P2P1/2N5/PPP1NP1P/R1BQKB1R w KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'caro-kann'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.c7c6.d2d4.d7d5.b1c3.d5e4.c3e4.c8f5.e4g3.f5g6.h2h4.h7h6.g1f3', 'e2e4.c7c6.d2d4.d7d5.b1c3.d5e4.c3e4.c8f5.e4g3.f5g6.h2h4.h7h6', 13, 'g1f3', 'Nf3', 'rn1qkbnr/pp2ppp1/2p3bp/8/3P3P/5NN1/PPP2PP1/R1BQKB1R b KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'caro-kann'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.c7c6.d2d4.d7d5.b1c3.d5e4.c3e4.c8f5.e4g3.f5g6.h2h4.h7h6.g1f3.b8d7', 'e2e4.c7c6.d2d4.d7d5.b1c3.d5e4.c3e4.c8f5.e4g3.f5g6.h2h4.h7h6.g1f3', 14, 'b8d7', 'Nd7', 'r2qkbnr/pp1nppp1/2p3bp/8/3P3P/5NN1/PPP2PP1/R1BQKB1R w KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'caro-kann'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.c7c6.d2d4.d7d5.b1c3.d5e4.c3e4.c8f5.e4g3.f5g6.h2h4.h7h6.g1f3.b8d7.h4h5', 'e2e4.c7c6.d2d4.d7d5.b1c3.d5e4.c3e4.c8f5.e4g3.f5g6.h2h4.h7h6.g1f3.b8d7', 15, 'h4h5', 'h5', 'r2qkbnr/pp1nppp1/2p3bp/7P/3P4/5NN1/PPP2PP1/R1BQKB1R b KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'caro-kann'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;

insert into public.opening_nodes (repertoire_id, parent_id, path, ply, uci, san, epd, is_main)
select r.id, p.id, v.path::extensions.ltree, v.ply, v.uci, v.san, v.epd, v.is_main
  from (values
  ('e2e4.c7c6.d2d4.d7d5.b1c3.d5e4.c3e4.c8f5.e4g3.f5g6.h2h4.h7h6.g1f3.b8d7.h4h5.g6h7', 'e2e4.c7c6.d2d4.d7d5.b1c3.d5e4.c3e4.c8f5.e4g3.f5g6.h2h4.h7h6.g1f3.b8d7.h4h5', 16, 'g6h7', 'Bh7', 'r2qkbnr/pp1npppb/2p4p/7P/3P4/5NN1/PPP2PP1/R1BQKB1R w KQkq -', true)
  ) as v (path, parent_path, ply, uci, san, epd, is_main)
  join public.opening_repertoires r on r.slug = 'caro-kann'
  left join public.opening_nodes p
    on p.repertoire_id = r.id and p.path = v.parent_path::extensions.ltree
on conflict (repertoire_id, path) do update set is_main = excluded.is_main;
