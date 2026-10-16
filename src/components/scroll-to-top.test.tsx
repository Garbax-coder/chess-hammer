import { fireEvent, render, screen } from '@testing-library/react'
import { Link, MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ScrollToTopOnNavigate } from './scroll-to-top'

function Back() {
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate(-1)}>
      indietro
    </button>
  )
}

function renderApp() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <ScrollToTopOnNavigate />
      <Routes>
        <Route path="/dashboard" element={<Link to="/train">allenamento</Link>} />
        <Route path="/train" element={<Back />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ScrollToTopOnNavigate', () => {
  afterEach(() => vi.restoreAllMocks())

  it('starts a newly opened page from the top', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    renderApp()
    expect(scrollTo).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText('allenamento'))
    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('leaves the position alone on browser back, which restores it', () => {
    renderApp()
    fireEvent.click(screen.getByText('allenamento'))
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    fireEvent.click(screen.getByText('indietro'))
    expect(scrollTo).not.toHaveBeenCalled()
  })
})
