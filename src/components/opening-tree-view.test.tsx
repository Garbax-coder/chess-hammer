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
  return { id, parent_id: parent, ply, uci: san, san, epd: `epd-${id}`, is_main: true }
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

  it('writes the opening name where it changes, only the new part', () => {
    render(
      <OpeningTreeView
        tree={tree}
        color="w"
        progress={new Map()}
        now={new Date('2026-10-25T12:00:00Z')}
        selectedId={null}
        onSelect={() => {}}
        names={
          new Map([
            [2, { eco: 'C20', name: "King's Pawn Game" }],
            [3, { eco: 'C40', name: "King's Pawn Game: Knight Variation" }],
            [4, { eco: 'B20', name: 'Sicilian Defense' }],
          ])
        }
      />,
    )
    expect(screen.getByText("King's Pawn Game")).toBeInTheDocument()
    expect(screen.getByText('Knight Variation')).toBeInTheDocument()
    expect(screen.getByText('Sicilian Defense')).toBeInTheDocument()
  })

  it('marks an accepted alternative apart, without mastery colours', () => {
    render(
      <OpeningTreeView
        tree={buildOpeningTree([
          node(1, null, 1, 'e4'),
          node(2, 1, 2, 'e5'),
          node(3, 2, 3, 'Nf3'),
          { ...node(4, 2, 3, 'Bc4'), is_main: false },
        ])}
        color="w"
        progress={new Map()}
        now={new Date('2026-10-25T12:00:00Z')}
        selectedId={null}
        onSelect={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: '2.Bc4' })).toHaveAttribute(
      'title',
      o.alternativeLabel,
    )
    expect(screen.getByRole('button', { name: '2.Nf3' })).toHaveAttribute(
      'title',
      o.legend.new,
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

  it('collapses and expands every branch, keeping the selected move in sight', () => {
    // 1.e4 e5 2.Nf3 Nc6 (3.Bc4 | 3.Bb5) | 2.Bc4 ; 1...c5 2.Nc3
    const deep = buildOpeningTree([
      node(1, null, 1, 'e4'),
      node(2, 1, 2, 'e5'),
      node(3, 2, 3, 'Nf3'),
      node(4, 1, 2, 'c5'),
      node(5, 4, 3, 'Nc3'),
      node(6, 3, 4, 'Nc6'),
      node(7, 6, 5, 'Bc4'),
      node(8, 6, 5, 'Bb5'),
      node(9, 2, 3, 'Bc4'),
    ])
    const view = (selectedId: number | null) => (
      <OpeningTreeView
        tree={deep}
        color="w"
        progress={new Map()}
        now={new Date('2026-10-25T12:00:00Z')}
        selectedId={selectedId}
        onSelect={vi.fn()}
      />
    )
    const { rerender } = render(view(null))
    expect(screen.getByRole('button', { name: o.expandAll })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: o.collapseAll }))
    for (const label of ['1...e5', '1...c5', '3.Bb5']) {
      expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument()
    }
    fireEvent.click(screen.getByRole('button', { name: o.expandAll }))
    expect(screen.getByRole('button', { name: '3.Bb5' })).toBeInTheDocument()

    // Con 2.Bc4 selezionata resta aperto il suo percorso; il ramo di 2...Nc6
    // si chiude.
    rerender(view(9))
    fireEvent.click(screen.getByRole('button', { name: o.collapseAll }))
    expect(screen.getByRole('button', { name: '2.Bc4' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nc6' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '3.Bb5' })).not.toBeInTheDocument()
  })

  it('opens the collapsed branches that hold the newly selected move', () => {
    // 1.e4 e5 2.Nf3 Nc6 (3.Bc4 | 3.Bb5) | 2.Bc4 ; 1...c5 2.Nc3
    const deep = buildOpeningTree([
      node(1, null, 1, 'e4'),
      node(2, 1, 2, 'e5'),
      node(3, 2, 3, 'Nf3'),
      node(4, 1, 2, 'c5'),
      node(5, 4, 3, 'Nc3'),
      node(6, 3, 4, 'Nc6'),
      node(7, 6, 5, 'Bc4'),
      node(8, 6, 5, 'Bb5'),
      node(9, 2, 3, 'Bc4'),
    ])
    const view = (selectedId: number | null) => (
      <OpeningTreeView
        tree={deep}
        color="w"
        progress={new Map()}
        now={new Date('2026-10-25T12:00:00Z')}
        selectedId={selectedId}
        onSelect={vi.fn()}
      />
    )
    const { rerender } = render(view(null))
    fireEvent.click(screen.getByRole('button', { name: o.collapseAll }))
    expect(screen.queryByRole('button', { name: '3.Bb5' })).not.toBeInTheDocument()

    // Es. con le frecce: la selezione arriva su 2.Bc4, dentro due rami chiusi
    // (quelli di 1.e4 e di 1...e5), che si riaprono.
    rerender(view(9))
    expect(screen.getByRole('button', { name: '2.Bc4' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    // Il ramo di 2...Nc6, che non la contiene, resta chiuso.
    expect(screen.queryByRole('button', { name: '3.Bb5' })).not.toBeInTheDocument()
  })
})
