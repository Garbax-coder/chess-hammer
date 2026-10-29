import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { it as itTranslations } from '@/lib/i18n/translations'
import { DEFAULT_ENGINE_SETTINGS } from '@/lib/engine-settings'
import type { EngineLine } from '@/lib/stockfish-engine'
import { AnalysisPanel } from './analysis-panel'

const t = itTranslations
vi.mock('@/lib/language-context', () => ({ useTranslations: () => itTranslations }))

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
const settings = { ...DEFAULT_ENGINE_SETTINGS, multiPv: 3 }

function lineCount(container: HTMLElement) {
  return container.querySelectorAll('[data-slot="engine-line"]').length
}

describe('AnalysisPanel', () => {
  it('keeps a row for every line set, also while the lines arrive', () => {
    const props = { fen: START, settings, onUpdateSettings: () => {} }
    const { container, rerender } = render(
      <AnalysisPanel {...props} lines={[]} analyzing />,
    )
    expect(lineCount(container)).toBe(3)
    expect(screen.getByText(t.analysisPanel.analyzing)).toBeInTheDocument()

    const line = { multiPv: 1, depth: 12, scoreCp: 30, scoreMate: null, pvUci: ['e2e4'] }
    rerender(<AnalysisPanel {...props} lines={[line as EngineLine]} analyzing />)
    expect(lineCount(container)).toBe(3)
    expect(screen.getByText('1.e4')).toBeInTheDocument()
  })

  it('shows only the header with the Stockfish switch while it is off', () => {
    const onEnabledChange = vi.fn()
    const { container } = render(
      <AnalysisPanel
        fen={START}
        lines={[]}
        analyzing={false}
        settings={settings}
        onUpdateSettings={() => {}}
        enabled={false}
        onEnabledChange={onEnabledChange}
      />,
    )
    expect(screen.getByText(t.analysisPanel.title)).toBeInTheDocument()
    expect(lineCount(container)).toBe(0)
    fireEvent.click(screen.getByRole('switch', { name: 'Stockfish' }))
    expect(onEnabledChange).toHaveBeenCalledWith(true)
  })
})
