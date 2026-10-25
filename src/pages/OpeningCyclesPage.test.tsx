import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { openingsTranslations } from '@/lib/i18n/openings'
import type { OpeningNode, OpeningProgress } from '@/lib/opening-tree'
import type { OpeningCycle, RepertoireWithNodes } from '@/lib/openings'
import OpeningCyclesPage, { NEXT_LINE_DELAY_MS } from './OpeningCyclesPage'

const o = openingsTranslations.it
const record = vi.fn()
const save = vi.fn()

// Bianco: 1.e4 e5 2.Nf3 (Run 3) oppure 1.e4 c5 2.Nc3 (Run 5).
function node(id: number, parent: number | null, ply: number, san: string, uci: string) {
  return {
    id,
    parent_id: parent,
    ply,
    uci,
    san,
    epd: `epd-${id}`,
    is_main: true,
  } satisfies OpeningNode
}
const repertoire: RepertoireWithNodes = {
  id: 'r1',
  slug: 'italian-game',
  name: 'Italian Game',
  eco: 'C50',
  color: 'w',
  owner_id: null,
  nodes: [
    node(1, null, 1, 'e4', 'e2e4'),
    node(2, 1, 2, 'e5', 'e7e5'),
    node(3, 2, 3, 'Nf3', 'g1f3'),
    node(4, 1, 2, 'c5', 'c7c5'),
    node(5, 4, 3, 'Nc3', 'b1c3'),
  ],
}
const firstCycle: OpeningCycle = {
  id: 'c1',
  repertoire_id: 'r1',
  cycle: 1,
  lines: 2,
  moves: 4,
  correct: 3,
  total_ms: 60_000,
  started_at: '2026-10-24T10:00:00Z',
  completed_at: '2026-10-24T10:01:00Z',
}

vi.mock('@/lib/language-context', async () => {
  const { it: italian } = await import('@/lib/i18n/translations')
  return { useTranslations: () => italian, useLanguage: () => ({ language: 'it' }) }
})
vi.mock('@/hooks/use-openings', () => ({
  useRepertoires: () => ({ data: [repertoire], isLoading: false }),
  useOpeningProgress: () => ({ data: new Map<number, OpeningProgress>() }),
  useOpeningCycles: () => ({ data: [firstCycle] }),
  useRecordOpeningMove: () => ({ mutate: record }),
  useSaveOpeningCycle: () => ({ mutate: save, data: undefined, isError: false }),
  useRenameRepertoire: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
}))
vi.mock('@/hooks/use-user-stats', () => ({ useUserStats: () => ({ data: undefined }) }))
vi.mock('@/components/opening-board', () => ({
  OPPONENT_DELAY_MS: 500,
  OpeningBoard: ({
    interactive,
    onMove,
  }: {
    interactive: boolean
    onMove: (uci: string) => boolean
  }) => (
    <div>
      {['e2e4', 'g1f3', 'b1c3'].map((uci) => (
        <button
          key={uci}
          type="button"
          disabled={!interactive}
          onClick={() => onMove(uci)}
        >
          {uci}
        </button>
      ))}
    </div>
  ),
}))

describe('OpeningCyclesPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    record.mockReset()
    save.mockReset()
  })
  afterEach(() => vi.useRealTimers())

  it('plays every line in a row against the clock and saves the cycle', () => {
    render(
      <MemoryRouter initialEntries={['/openings/italian-game/cycles']}>
        <Routes>
          <Route path="/openings/:slug/cycles" element={<OpeningCyclesPage />} />
        </Routes>
      </MemoryRouter>,
    )
    const play = (uci: string) =>
      fireEvent.click(screen.getByRole('button', { name: uci }))
    const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms))

    // Storico e ciclo precedente.
    expect(screen.getAllByText(o.previousCycle('1:00')).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: o.startCycle(2) }))

    expect(
      screen.getByText(o.cycleProgress(2, 1, 2), { exact: false }),
    ).toBeInTheDocument()
    play('e2e4')
    wait(500)
    play('g1f3')
    expect(record).toHaveBeenCalledTimes(2)
    // Si passa da soli alla linea successiva.
    wait(NEXT_LINE_DELAY_MS)
    expect(
      screen.getByText(o.cycleProgress(2, 2, 2), { exact: false }),
    ).toBeInTheDocument()
    play('e2e4')
    wait(500)
    play('b1c3')
    wait(NEXT_LINE_DELAY_MS)

    // 500 + 700 + 500 + 700 ms di orologio.
    expect(save).toHaveBeenCalledWith({
      repertoireId: 'r1',
      cycle: 2,
      lines: 2,
      moves: 4,
      correct: 4,
      totalMs: 2400,
      startedAt: expect.any(String),
    })
    expect(save).toHaveBeenCalledTimes(1)
    expect(screen.getByText(o.cycleDone(2))).toBeInTheDocument()
    expect(screen.getByText(o.cycleResult('0:02', 4, 4))).toBeInTheDocument()
    expect(screen.getByText(o.faster('0:58'))).toBeInTheDocument()
  })
})
