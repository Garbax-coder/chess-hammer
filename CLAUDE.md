# Chess Hammer

Woodpecker-method chess puzzle trainer. React + TypeScript + Vite, Supabase
(Postgres + Auth) as backend, deployed on Vercel at chesshammer.com
(auto-deploy on push to `main`). One Supabase project shared by dev and prod.

Requires Node 20+ (Vite/rolldown breaks on older Node).

## Before merging to `main` / releasing to production

All of these must pass locally, in this order, with no new warnings/errors
beyond the pre-existing ones already on `main`:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

**`npm run test` must be green. Do not merge to `main` or deploy to
production if any test fails.** This is a hard gate, not a suggestion.

When a feature adds or changes behavior, add or update its tests in the
same change — don't ship logic without covering it. See "Writing tests"
below for where things go and how to mock Supabase.

## Testing

- Framework: Vitest (`vitest.config.ts`) + Testing Library, jsdom
  environment. Setup file: `src/test/setup.ts`.
- Tests live next to the file they cover: `foo.ts` → `foo.test.ts`.
- `.env.test` holds dummy (non-secret) Supabase env vars so
  `src/lib/supabase.ts` can be imported in tests without throwing; it's
  committed on purpose. Real Supabase is never called in tests.
- `src/test/fixtures.ts`: builders for the core domain types
  (`makeSession`, `makeAttempt`, `makePuzzleResult`, `makeLichessPuzzle`,
  `withAttempt`). Prefer these over hand-rolled literals so fixtures stay
  valid as the types evolve (e.g. a real chess FEN, not a placeholder).
- `src/test/supabase-mock.ts`: `createSupabaseMock()` gives a fake
  `supabase` client (chainable `.from()/.select()/.eq()/...` builder +
  `.rpc()`) for unit-testing code that queries Supabase, without a real
  DB. Queue results per table/rpc with `queueFrom`/`queueRpc`; each call to
  the same table/rpc consumes the next queued result, in call order — so a
  function that reads a table twice (e.g. once before and once after
  advancing a round) can be given two different results.
- For a component that only needs `useTranslations()`, mock
  `@/lib/language-context` directly instead of wrapping it in the full
  provider tree (Auth + react-query + Language). See
  `src/components/session-puzzle-list.test.tsx`.
- What's covered: pure logic (session progress/merge/day-grouping, chess
  formatting, move tree, password policy, i18n key parity) and the core
  Woodpecker engine decision logic (`getNextPuzzle` in
  `src/lib/puzzle-engine.ts`) with Supabase mocked. What's NOT covered:
  real Supabase integration/RLS, end-to-end browser flows, visual
  regression. Those still need a manual pass in the browser (see the
  project's own verification workflow) before a release that touches them.

## Workflow

- Work on feature branches; merge and push to `main` only on explicit user
  approval ("mergia e pubblica" or equivalent) — never on your own
  initiative.
- After every commit or finished feature, share the local dev URL
  (`http://localhost:5173/`) and the test account credentials.
