import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { openingsTranslations } from '@/lib/i18n/openings'
import type { RepertoireWithNodes } from '@/lib/openings'
import { RepertoireGate } from './repertoire-gate'

const o = openingsTranslations.it
const empty: RepertoireWithNodes = {
  id: 'r1',
  slug: 'u-empty',
  name: 'Da costruire',
  eco: null,
  color: 'w',
  owner_id: 'me',
  nodes: [],
}

vi.mock('@/lib/language-context', async () => {
  const { it: italian } = await import('@/lib/i18n/translations')
  return { useTranslations: () => italian, useLanguage: () => ({ language: 'it' }) }
})
vi.mock('@/hooks/use-openings', () => ({
  useRepertoires: () => ({ data: [empty], isLoading: false }),
  useOpeningProgress: () => ({ data: new Map() }),
}))

function renderGate(allowEmpty: boolean) {
  render(
    <MemoryRouter>
      <RepertoireGate slug="u-empty" allowEmpty={allowEmpty}>
        {({ repertoire }) => <p>{repertoire.name}</p>}
      </RepertoireGate>
    </MemoryRouter>,
  )
}

describe('RepertoireGate', () => {
  it('sends an empty repertoire to the editor, outside the browse page', () => {
    renderGate(false)
    expect(screen.getByText(o.noLinesYet)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: o.addLines })).toHaveAttribute(
      'href',
      '/openings/u-empty/lines?edit=1',
    )
  })

  it('opens an empty repertoire in the browse page', () => {
    renderGate(true)
    expect(screen.getByText('Da costruire')).toBeInTheDocument()
  })
})
