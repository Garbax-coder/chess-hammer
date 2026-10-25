import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { openingsTranslations } from '@/lib/i18n/openings'
import { previewImport } from '@/lib/opening-import'
import OpeningImportPage from './OpeningImportPage'

const o = openingsTranslations.it
const importMutate = vi.fn()

vi.mock('@/lib/language-context', () => ({ useLanguage: () => ({ language: 'it' }) }))
vi.mock('@/hooks/use-openings', () => ({
  useImportRepertoire: () => ({
    mutate: importMutate,
    isPending: false,
    isError: false,
    error: null,
  }),
}))

const PGN = `[Event "Study: My Italian"]
[Opening "Italian Game"]

1. e4 e5 2. Nf3 Nc6 (2... d6 3. d4) 3. Bc4 (3. Bb5 a6) Bc5 *`

describe('previewImport', () => {
  it('counts the lines and reports what it adjusted', () => {
    const preview = previewImport(PGN, 'w')
    // 3.Bb5 e' una seconda mossa del Bianco: alternativa (senza 3...a6);
    // 3...Bc5 e 3...a6 in fondo alle linee si tolgono.
    expect(preview.lines).toBe(2)
    expect(preview.report?.alternatives).toBe(1)
    expect(preview.report?.trimmed).toBe(2)
    expect(preview.suggestedName).toBe('Italian Game')
  })

  it('reports an illegal move', () => {
    expect(previewImport('1. e4 e5 2. Ke3 *', 'w').illegal).toEqual({
      line: 1,
      move: '2.Ke3',
    })
  })
})

describe('OpeningImportPage', () => {
  beforeEach(() => {
    importMutate.mockReset()
  })

  function renderImport() {
    render(
      <MemoryRouter initialEntries={['/openings/import']}>
        <Routes>
          <Route path="/openings/import" element={<OpeningImportPage />} />
          <Route path="/openings/:slug/learn" element={<p>studio</p>} />
        </Routes>
      </MemoryRouter>,
    )
  }

  it('previews the PGN and imports it, then opens Learn on the new repertoire', () => {
    importMutate.mockImplementation((_params, options) =>
      options.onSuccess({ slug: 'u-abc' }),
    )
    renderImport()
    expect(screen.getByRole('button', { name: o.importButton })).toBeDisabled()

    fireEvent.change(screen.getByLabelText(o.pgnLabel), { target: { value: PGN } })
    expect(screen.getByText(o.previewLines(2, 8))).toBeInTheDocument()
    expect(screen.getByText(o.previewAlternatives(1))).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: o.importButton }))
    expect(importMutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Italian Game', color: 'w' }),
      expect.anything(),
    )
    expect(importMutate.mock.calls[0][0].nodes).toHaveLength(8)
    expect(screen.getByText('studio')).toBeInTheDocument()
  })

  it('imports as Black with the chosen name', () => {
    renderImport()
    fireEvent.change(screen.getByLabelText(o.pgnLabel), {
      target: { value: '1. e4 c6 2. d4 d5 (2... e6 3. Nc3 d5) *' },
    })
    fireEvent.click(screen.getByRole('button', { name: o.color.b }))
    fireEvent.change(screen.getByLabelText(o.nameLabel), {
      target: { value: 'Caro-Kann mia' },
    })
    fireEvent.click(screen.getByRole('button', { name: o.importButton }))
    expect(importMutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Caro-Kann mia', color: 'b' }),
      expect.anything(),
    )
  })
})
