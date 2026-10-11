import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { it as itTranslations } from '@/lib/i18n/translations'
import { SITE_LEGAL_VERSION } from '@/lib/site-info'

let stats: { legal_version: string | null } | undefined
const mutate = vi.fn()

vi.mock('@/lib/language-context', () => ({ useTranslations: () => itTranslations }))
vi.mock('@/hooks/use-user-stats', () => ({
  useUserStats: () => ({ data: stats }),
  useAcceptLegalTerms: () => ({ mutate, isPending: false, isError: false }),
}))

const { LegalUpdateBanner } = await import('./legal-update-banner')

function renderBanner() {
  return render(
    <MemoryRouter>
      <LegalUpdateBanner />
    </MemoryRouter>,
  )
}

describe('LegalUpdateBanner', () => {
  beforeEach(() => mutate.mockClear())

  it('stays hidden when the current version is accepted, or before stats load', () => {
    stats = { legal_version: SITE_LEGAL_VERSION }
    expect(renderBanner().container).toBeEmptyDOMElement()
    stats = undefined
    expect(renderBanner().container).toBeEmptyDOMElement()
  })

  it('lists what changed for someone who accepted an older version', () => {
    stats = { legal_version: '2026-10-04' }
    renderBanner()
    expect(
      screen.getByRole('heading', { name: itTranslations.legalUpdate.updatedTitle }),
    ).toBeInTheDocument()
    for (const change of itTranslations.legalUpdate.changes) {
      expect(screen.getByText(change)).toBeInTheDocument()
    }
    fireEvent.click(
      screen.getByRole('button', { name: itTranslations.legalUpdate.acknowledge }),
    )
    expect(mutate).toHaveBeenCalledWith(SITE_LEGAL_VERSION)
  })

  it('asks for age and acceptance from someone who never accepted (e.g. Google sign-up)', () => {
    stats = { legal_version: null }
    renderBanner()
    expect(
      screen.getByRole('heading', { name: itTranslations.legalUpdate.acceptTitle }),
    ).toBeInTheDocument()
    expect(screen.getByText(/almeno 16 anni/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: itTranslations.footer.terms }),
    ).toHaveAttribute('href', '/terms')
    fireEvent.click(
      screen.getByRole('button', { name: itTranslations.legalUpdate.accept }),
    )
    expect(mutate).toHaveBeenCalledWith(SITE_LEGAL_VERSION)
  })
})
