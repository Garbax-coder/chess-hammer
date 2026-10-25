import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { openingsTranslations } from '@/lib/i18n/openings'
import { parseEcoTsv } from '@/lib/opening-eco'
import OpeningEcoPage from './OpeningEcoPage'

const o = openingsTranslations.it
const importMutate = vi.fn()
const ecoLines = parseEcoTsv(`eco\tname\tpgn
C50\tItalian Game\t1. e4 e5 2. Nf3 Nc6 3. Bc4
C51\tItalian Game: Evans Gambit\t1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4
C53\tItalian Game: Classical Variation\t1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3
C53\tItalian Game: Classical Variation, Center Attack\t1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4
`)

vi.mock('@/lib/language-context', () => ({ useLanguage: () => ({ language: 'it' }) }))
vi.mock('@/hooks/use-openings', () => ({
  useEcoLines: () => ({ data: ecoLines, isLoading: false }),
  useImportRepertoire: () => ({
    mutate: importMutate,
    isPending: false,
    isError: false,
    error: null,
  }),
}))

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/openings/eco']}>
      <Routes>
        <Route path="/openings/eco" element={<OpeningEcoPage />} />
        <Route path="/openings/:slug/lines" element={<p>Consulta</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('OpeningEcoPage', () => {
  beforeEach(() => {
    importMutate.mockReset()
  })

  it('creates a repertoire with every variation of the chosen opening as a line', () => {
    importMutate.mockImplementation((_params, options) =>
      options.onSuccess({ slug: 'u-new' }),
    )
    renderPage()
    fireEvent.change(screen.getByLabelText(o.ecoSearchLabel), {
      target: { value: 'italian' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^Italian Game\s*C50–C53/ }))

    // Col Bianco: dopo 3...Bc5, 4.b4 e 4.c3 aprono due linee (4.b4 e 4.c3
    // Nf6 5.d4), 10 mosse in tutto.
    expect(screen.getByText(o.previewLines(2, 10))).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: o.ecoCreate }))
    expect(importMutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Italian Game', color: 'w' }),
      expect.anything(),
    )
    const nodes = importMutate.mock.calls[0][0].nodes as {
      san: string
      isMain: boolean
    }[]
    expect(
      nodes.filter((n) => n.san === 'b4' || n.san === 'c3').map((n) => n.isMain),
    ).toEqual([true, true])
    expect(screen.getByText('Consulta')).toBeInTheDocument()
  })

  it('keeps one move per position when asked, with the others as alternatives', () => {
    renderPage()
    fireEvent.change(screen.getByLabelText(o.ecoSearchLabel), { target: { value: 'C5' } })
    expect(screen.getAllByRole('button').map((b) => b.textContent?.slice(0, 3))).toEqual([
      'C50',
      'C51',
      'C53',
    ])
    fireEvent.change(screen.getByLabelText(o.ecoSearchLabel), {
      target: { value: 'Italian Game' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^Italian Game\s*C50–C53/ }))
    fireEvent.click(screen.getByRole('switch', { name: o.ecoBranches }))
    // 4.c3 ha piu' varianti: resta la linea, 4.b4 diventa alternativa.
    expect(screen.getByText(o.previewLines(1, 10))).toBeInTheDocument()
    expect(screen.getByText(o.previewAlternatives(1))).toBeInTheDocument()

    // Col Nero e un nome scelto.
    fireEvent.click(screen.getByRole('button', { name: o.color.b }))
    fireEvent.change(screen.getByLabelText(o.nameLabel), {
      target: { value: 'Italiana' },
    })
    fireEvent.click(screen.getByRole('button', { name: o.ecoCreate }))
    expect(importMutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Italiana', color: 'b' }),
      expect.anything(),
    )

    // Si puo' cambiare apertura.
    fireEvent.click(screen.getByRole('button', { name: o.ecoChange }))
    expect(screen.getByLabelText(o.ecoSearchLabel)).toBeInTheDocument()
  })

  it('keeps the variations named after an opponent move, to be completed', () => {
    renderPage()
    fireEvent.change(screen.getByLabelText(o.ecoSearchLabel), {
      target: { value: 'C53' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^C53/ }))
    // Col Nero 4.c3 e 5.d4 sono del Bianco: senza l'opzione si tolgono.
    fireEvent.click(screen.getByRole('button', { name: o.color.b }))
    expect(screen.getByText(o.previewLines(1, 8))).toBeInTheDocument()
    expect(screen.getByText(o.previewTrimmed(2))).toBeInTheDocument()

    fireEvent.click(screen.getByRole('switch', { name: o.ecoOpponentEnds }))
    expect(screen.getByText(o.previewLines(1, 9))).toBeInTheDocument()
    expect(screen.getByText(o.previewOpenEnds(1))).toBeInTheDocument()
  })

  it('says when nothing matches', () => {
    renderPage()
    fireEvent.change(screen.getByLabelText(o.ecoSearchLabel), {
      target: { value: 'zzz' },
    })
    expect(screen.getByText(o.ecoNoResults)).toBeInTheDocument()
  })
})
