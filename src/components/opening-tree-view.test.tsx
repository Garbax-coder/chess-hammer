import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { openingsTranslations } from '@/lib/i18n/openings'
import {
  buildOpeningTree,
  type OpeningNode,
  type OpeningProgress,
} from '@/lib/opening-tree'
import { OpeningTreeView } from './opening-tree-view'

const o = openingsTranslations.it

vi.mock('@/lib/language-context', () => ({ useLanguage: () => ({ language: 'it' }) }))

// Bianco: 1.e4 e5 2.Nf3 oppure 1.e4 c5 2.Nc3.
function node(id: number, parent: number | null, ply: number, san: string): OpeningNode {
  return { id, parent_id: parent, ply, uci: san, san, epd: `epd-${id}` }
}
const tree = buildOpeningTree([
  node(1, null, 1, 'e4'),
  node(2, 1, 2, 'e5'),
  node(3, 2, 3, 'Nf3'),
  node(4, 1, 2, 'c5'),
  node(5, 4, 3, 'Nc3'),
])
const mastered: OpeningProgress = {
  node_id: 1,
  attempts: 4,
  first_try_correct: 4,
  streak: 4,
  last_seen_at: '2026-10-24T10:00:00Z',
  due_at: '2099-01-01T00:00:00Z',
}

function renderTree(onSelect = vi.fn(), selectedId: number | null = null) {
  render(
    <OpeningTreeView
      tree={tree}
      color="w"
      progress={new Map([[1, mastered]])}
      now={new Date('2026-10-25T12:00:00Z')}
      selectedId={selectedId}
      onSelect={onSelect}
    />,
  )
  return onSelect
}

describe('OpeningTreeView', () => {
  it('writes the moves in notation, a branch per alternative', () => {
    renderTree()
    for (const label of ['1.e4', '1...e5', '2.Nf3', '1...c5', '2.Nc3']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('colours the user moves by mastery and leaves the opponent moves plain', () => {
    renderTree()
    expect(screen.getByRole('button', { name: '1.e4' })).toHaveAttribute(
      'title',
      o.legend.mastered,
    )
    expect(screen.getByRole('button', { name: '2.Nf3' })).toHaveAttribute(
      'title',
      o.legend.new,
    )
    expect(screen.getByRole('button', { name: '1...e5' })).toHaveAttribute(
      'title',
      o.opponentMove,
    )
  })

  it('selects a move and collapses a branch', () => {
    const onSelect = renderTree(vi.fn(), 3)
    expect(screen.getByRole('button', { name: '2.Nf3' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    fireEvent.click(screen.getByRole('button', { name: '1...c5' }))
    expect(onSelect).toHaveBeenCalledWith(4)

    fireEvent.click(screen.getByRole('button', { name: o.collapse }))
    expect(screen.queryByRole('button', { name: '1...c5' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: o.expand }))
    expect(screen.getByRole('button', { name: '1...c5' })).toBeInTheDocument()
  })
})
