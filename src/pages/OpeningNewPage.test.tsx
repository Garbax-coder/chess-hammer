import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { openingsTranslations } from '@/lib/i18n/openings'
import OpeningNewPage from './OpeningNewPage'

const o = openingsTranslations.it
const create = vi.fn()

vi.mock('@/lib/language-context', () => ({ useLanguage: () => ({ language: 'it' }) }))
vi.mock('@/hooks/use-openings', () => ({
  useCreateRepertoire: () => ({ mutate: create, isPending: false, isError: false }),
}))

describe('OpeningNewPage', () => {
  it('creates an empty repertoire and opens it to be built', () => {
    create.mockImplementation((_params, options) => options.onSuccess({ slug: 'u-new' }))
    render(
      <MemoryRouter initialEntries={['/openings/new']}>
        <Routes>
          <Route path="/openings/new" element={<OpeningNewPage />} />
          <Route path="/openings/:slug/lines" element={<p>Consulta</p>} />
        </Routes>
      </MemoryRouter>,
    )
    const button = screen.getByRole('button', { name: o.scratchCreate })
    // Senza nome non si crea.
    expect(button).toBeDisabled()

    fireEvent.change(screen.getByLabelText(o.nameLabel), {
      target: { value: '  Il mio Londra  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: o.color.b }))
    fireEvent.click(button)
    expect(create).toHaveBeenCalledWith(
      { name: 'Il mio Londra', color: 'b' },
      expect.anything(),
    )
    expect(screen.getByText('Consulta')).toBeInTheDocument()
  })
})
