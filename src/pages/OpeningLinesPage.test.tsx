import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { formatScore } from '@/lib/chess-format'
import { openingsTranslations } from '@/lib/i18n/openings'
import { it as itTranslations } from '@/lib/i18n/translations'
import type { OpeningProgress } from '@/lib/opening-tree'
import type { MoveArrow } from '@/lib/opening-arrows'
import type { RepertoireWithNodes } from '@/lib/openings'
import OpeningLinesPage from './OpeningLinesPage'

const o = openingsTranslations.it

// Bianco: 1.e4 e5 2.Nf3 (Run 3) oppure 1.e4 c5 2.Nc3 (Run 5).
const repertoire: RepertoireWithNodes = {
  id: 'r1',
  slug: 'italian-game',
  name: 'Italian Game',
  eco: 'C50',
  color: 'w',
  owner_id: null,
  nodes: [
    { id: 1, parent_id: null, ply: 1, uci: 'e2e4', san: 'e4', epd: 'a', is_main: true },
    { id: 2, parent_id: 1, ply: 2, uci: 'e7e5', san: 'e5', epd: 'b', is_main: true },
    { id: 3, parent_id: 2, ply: 3, uci: 'g1f3', san: 'Nf3', epd: 'c', is_main: true },
    { id: 4, parent_id: 1, ply: 2, uci: 'c7c5', san: 'c5', epd: 'd', is_main: true },
    { id: 5, parent_id: 4, ply: 3, uci: 'b1c3', san: 'Nc3', epd: 'e', is_main: true },
  ],
}
const e4: OpeningProgress = {
  node_id: 1,
  attempts: 4,
  first_try_correct: 3,
  streak: 3,
  last_seen_at: '2026-10-24T10:00:00Z',
  due_at: '2099-01-01T00:00:00Z',
}
// Una copia personale dello stesso repertorio, modificabile, con in piu' la
// linea 1.e4 e5 2.Bc4 e la risposta 2...Nc6 dopo 2.Nc3 (ancora senza la
// mossa dell'utente).
const copy: RepertoireWithNodes = {
  ...repertoire,
  id: 'r2',
  slug: 'u-copy',
  owner_id: 'me',
  nodes: [
    ...repertoire.nodes,
    { id: 6, parent_id: 2, ply: 3, uci: 'f1c4', san: 'Bc4', epd: 'f', is_main: true },
    { id: 7, parent_id: 5, ply: 4, uci: 'b8c6', san: 'Nc6', epd: 'g', is_main: true },
  ],
}
let board: {
  fen: string
  lastMoveUci?: string
  interactive: boolean
  onMove: (uci: string) => boolean
  hintUci?: string
  savedArrows?: MoveArrow[]
  onArrowDrawn?: (arrow: MoveArrow) => void
}
const saveNote = vi.fn()
const addMove = vi.fn()
const deleteMove = vi.fn()
const setAlternative = vi.fn()
const setMistake = vi.fn()
const saveArrows = vi.fn()
let arrows = new Map<number, MoveArrow[]>()
const copyRepertoire = vi.fn()
const rename = vi.fn()
const engineCalls: ({ fen: string; moves: string[] } | null)[] = []
let notes = new Map<number, string>()

vi.mock('@/lib/language-context', () => ({
  useTranslations: () => itTranslations,
  useLanguage: () => ({ language: 'it' }),
}))
vi.mock('@/hooks/use-openings', () => ({
  useRepertoires: () => ({ data: [repertoire, copy], isLoading: false }),
  useOpeningProgress: () => ({ data: new Map([[1, e4]]) }),
  useOpeningNotes: () => ({ data: notes }),
  useSaveOpeningNote: () => ({ mutate: saveNote, isPending: false }),
  useAddOpeningMove: () => ({ mutate: addMove, isError: false }),
  useDeleteOpeningMove: () => ({ mutate: deleteMove, isPending: false, isError: false }),
  useSetMoveAlternative: () => ({
    mutate: setAlternative,
    isPending: false,
    isError: false,
  }),
  useSetMoveMistake: () => ({ mutate: setMistake, isPending: false, isError: false }),
  useOpeningArrows: () => ({ data: arrows }),
  useSaveOpeningArrows: () => ({ mutate: saveArrows }),
  useCopyRepertoire: () => ({ mutate: copyRepertoire, isPending: false, isError: false }),
  useRenameRepertoire: () => ({ mutate: rename, isPending: false, isError: false }),
  useOpeningNames: () => ({
    data: new Map([
      [3, { eco: 'C40', name: "King's Knight Opening" }],
      [4, { eco: 'B20', name: 'Sicilian Defense' }],
    ]),
  }),
}))
vi.mock('@/hooks/use-user-stats', () => ({ useUserStats: () => ({ data: undefined }) }))
vi.mock('@/hooks/use-stockfish-analysis', () => ({
  useStockfishAnalysis: (position: { fen: string; moves: string[] } | null) => {
    engineCalls.push(position)
    return {
      lines: position ? [{ pvUci: ['g8f6'], scoreCp: 50, scoreMate: null }] : [],
      analyzing: false,
    }
  },
}))
// Il pannello del motore: l'interruttore di Stockfish nell'intestazione,
// le righe solo se acceso.
vi.mock('@/components/analysis-panel', () => ({
  AnalysisPanel: ({
    enabled,
    onEnabledChange,
  }: {
    enabled: boolean
    onEnabledChange: (on: boolean) => void
  }) => (
    <div>
      <button
        type="button"
        role="switch"
        aria-label="Stockfish"
        aria-checked={enabled}
        onClick={() => onEnabledChange(!enabled)}
      />
      {enabled && 'Analisi del motore'}
    </div>
  ),
}))
vi.mock('@/components/opening-board', () => ({
  OpeningBoard: (props: typeof board) => {
    board = props
    return null
  },
}))

function renderLines(path = '/openings/italian-game/lines') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/openings/:slug/lines" element={<OpeningLinesPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('OpeningLinesPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    for (const mock of [
      addMove,
      deleteMove,
      setAlternative,
      setMistake,
      saveArrows,
      copyRepertoire,
      rename,
    ])
      mock.mockReset()
  })

  it('shows the selected move on the board, with its training data', () => {
    renderLines()
    expect(screen.getByText(o.startPosition)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '1.e4' }))
    expect(board.fen.startsWith('rnbqkbnr/pppppppp/8/8/4P3/')).toBe(true)
    expect(board.lastMoveUci).toBe('e2e4')
    expect(screen.getByText(o.moveStats(4, 75))).toBeInTheDocument()

    // Sotto la scacchiera, il nome dell'apertura a quel punto.
    fireEvent.click(screen.getByRole('button', { name: '1...c5' }))
    expect(screen.getByText('B20 · Sicilian Defense')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '1.e4' }))

    // Avanti segue il primo ramo; indietro torna alla mossa precedente.
    fireEvent.click(
      screen.getByRole('button', { name: itTranslations.puzzleBoard.nextMove }),
    )
    expect(board.lastMoveUci).toBe('e7e5')
    expect(screen.getByText(o.opponentMove, { exact: false })).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: itTranslations.puzzleBoard.prevMove }),
    )
    expect(board.lastMoveUci).toBe('e2e4')
  })

  it('lists the lines, each to be learned or trained on its own', () => {
    renderLines()
    // Entrambe le linee hanno una mossa mai vista (2.Nf3, 2.Nc3): si studiano.
    const links = screen.getAllByRole('link', { name: o.learnLine })
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/openings/italian-game/learn?line=3',
      '/openings/italian-game/learn?line=5',
    ])
    // L'allenamento resta sempre disponibile accanto.
    expect(
      screen
        .getAllByRole('link', { name: o.trainLine })
        .map((a) => a.getAttribute('href')),
    ).toEqual(['/openings/italian-game?line=3', '/openings/italian-game?line=5'])
    expect(screen.getByRole('button', { name: '1.e4 e5 2.Nf3' })).toBeInTheDocument()
    // Il nome di ogni linea, con il codice ECO.
    expect(screen.getAllByText("King's Knight Opening").length).toBeGreaterThan(0)
    expect(screen.getByText('C40')).toBeInTheDocument()
    expect(screen.getByText('B20')).toBeInTheDocument()
    expect(screen.getAllByText(o.mastered(1, 2))).toHaveLength(2)
  })

  it('hides the variation names in the tree and in the lines, each on its own', () => {
    renderLines()
    // Il nome compare nell'albero (accanto a 2.Nf3) e sopra la linea.
    expect(screen.getAllByText("King's Knight Opening")).toHaveLength(2)
    const [treeSwitch, linesSwitch] = screen.getAllByRole('switch', { name: o.showNames })

    fireEvent.click(treeSwitch)
    expect(screen.getAllByText("King's Knight Opening")).toHaveLength(1)
    expect(screen.getByText('C40')).toBeInTheDocument()

    fireEvent.click(linesSwitch)
    expect(screen.queryByText("King's Knight Opening")).not.toBeInTheDocument()
    expect(screen.queryByText('C40')).not.toBeInTheDocument()

    // La scelta resta per la prossima visita.
    expect(window.localStorage.getItem('openings-tree-names')).toBe('false')
    expect(window.localStorage.getItem('openings-line-names')).toBe('false')
  })

  it('comments a move with a right-click, and hides the comments with the switch', () => {
    notes = new Map([[3, 'Il cavallo, prima dell’alfiere']])
    // Salvataggio riuscito: la finestra si chiude.
    saveNote.mockImplementation((_params, options) => options.onSuccess())
    renderLines()
    expect(screen.getByText('Il cavallo, prima dell’alfiere')).toBeInTheDocument()

    // Tasto destro: il menu della mossa, poi "Commenta la mossa".
    fireEvent.contextMenu(screen.getByRole('button', { name: '2.Nc3' }))
    const menu = screen.getByRole('menu', { name: o.moveMenu('2.Nc3') })
    // Repertorio del catalogo: niente modifiche, si suggerisce una copia.
    expect(within(menu).getByRole('menuitem', { name: o.deleteMove })).toBeDisabled()
    expect(within(menu).getByRole('menuitem', { name: o.markMistake })).toBeDisabled()
    expect(within(menu).getByText(o.menuCopyHint)).toBeInTheDocument()
    fireEvent.click(within(menu).getByRole('menuitem', { name: o.commentMove }))
    const box = screen.getByRole('textbox', { name: o.commentTitle('2.Nc3') })
    fireEvent.change(box, { target: { value: ' Contro la Siciliana ' } })
    fireEvent.click(screen.getByRole('button', { name: o.saveComment }))
    expect(saveNote).toHaveBeenCalledWith(
      { nodeId: 5, note: 'Contro la Siciliana' },
      expect.anything(),
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('switch', { name: o.showComments }))
    expect(screen.queryByText('Il cavallo, prima dell’alfiere')).not.toBeInTheDocument()
    notes = new Map()
  })

  it('opens on the move given in the address (from the statistics)', () => {
    renderLines('/openings/italian-game/lines?move=5')
    expect(board.lastMoveUci).toBe('b1c3')
  })

  it('moves through the tree with the arrow keys', () => {
    renderLines()
    const key = (k: string) => fireEvent.keyDown(window, { key: k })
    key('ArrowRight')
    expect(board.lastMoveUci).toBe('e2e4')
    key('ArrowRight')
    expect(board.lastMoveUci).toBe('e7e5')
    // Giu' e su: le risposte alternative alla stessa mossa.
    key('ArrowDown')
    expect(board.lastMoveUci).toBe('c7c5')
    key('ArrowDown')
    expect(board.lastMoveUci).toBe('c7c5')
    key('ArrowUp')
    expect(board.lastMoveUci).toBe('e7e5')
    key('ArrowLeft')
    key('ArrowLeft')
    expect(board.lastMoveUci).toBeUndefined()
    expect(screen.getByText(o.startPosition)).toBeInTheDocument()
  })

  it('turns Stockfish on for the position shown, with the best move on the board', () => {
    renderLines()
    expect(engineCalls.at(-1)).toBeNull()
    expect(screen.queryByText('Analisi del motore')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('switch', { name: 'Stockfish' }))
    fireEvent.click(screen.getByRole('button', { name: '1.e4' }))
    expect(screen.getByText('Analisi del motore')).toBeInTheDocument()
    // Al motore la partenza con le mosse giocate (conta le ripetizioni).
    expect(engineCalls.at(-1)).toEqual({
      fen: expect.stringMatching(/^rnbqkbnr\/pppppppp\/8\/8\/8/),
      moves: ['e2e4'],
    })
    expect(board.hintUci).toBe('g8f6')
    // La barra di valutazione: accanto alla scacchiera (desktop) e sotto
    // (mobile), dal punto di vista del Bianco dopo 1.e4.
    expect(screen.getAllByText(formatScore(50, null, 'b'))).toHaveLength(2)
    expect(window.localStorage.getItem('openings-stockfish')).toBe('true')
  })

  it('copies a catalog repertoire to edit it, then opens the copy in edit mode', () => {
    copyRepertoire.mockImplementation((_params, options) =>
      options.onSuccess({ slug: 'u-copy' }),
    )
    renderLines()
    expect(board.interactive).toBe(false)
    expect(screen.queryByRole('button', { name: o.editLines })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: o.copyToEdit }))
    expect(copyRepertoire).toHaveBeenCalledWith(
      { repertoireId: 'r1', name: o.copyName('Partita Italiana') },
      expect.anything(),
    )
    expect(board.interactive).toBe(true)
    expect(screen.getByRole('button', { name: o.doneEditing })).toBeInTheDocument()
  })

  it('adds and deletes moves of a personal repertoire', () => {
    addMove.mockImplementation((_params, options) => options.onSuccess({ id: 9 }))
    renderLines('/openings/u-copy/lines')
    fireEvent.click(screen.getByRole('button', { name: o.editLines }))
    expect(board.interactive).toBe(true)

    // Una mossa gia' presente si seleziona soltanto.
    fireEvent.click(screen.getByRole('button', { name: '1.e4' }))
    let accepted = false
    act(() => {
      accepted = board.onMove('e7e5')
    })
    expect(accepted).toBe(true)
    expect(board.lastMoveUci).toBe('e7e5')
    expect(addMove).not.toHaveBeenCalled()

    // Una nuova risposta dell'avversario si aggiunge dopo 1.e4. Mentre si
    // salva la scacchiera mostra gia' la mossa (non torna indietro).
    let save: { onSuccess: (node: { id: number }) => void; onSettled: () => void }
    addMove.mockImplementation((_params, options) => {
      save = options
    })
    fireEvent.click(screen.getByRole('button', { name: '1.e4' }))
    act(() => {
      accepted = board.onMove('d7d5')
    })
    expect(accepted).toBe(true)
    expect(addMove).toHaveBeenCalledWith(
      {
        repertoireId: 'r2',
        parentId: 1,
        uci: 'd7d5',
        san: 'd5',
        epd: 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -',
      },
      expect.anything(),
    )
    expect(board.fen.startsWith('rnbqkbnr/ppp1pppp/8/3p4/4P3/')).toBe(true)
    expect(board.lastMoveUci).toBe('d7d5')
    // Salvata: si seleziona la mossa nuova (qui 1...e5, gia' nell'albero).
    act(() => {
      save.onSuccess({ id: 2 })
      save.onSettled()
    })
    expect(board.lastMoveUci).toBe('e7e5')

    // Eliminazione in due passaggi, poi si torna alla mossa precedente.
    deleteMove.mockImplementation((_id, options) => options.onSuccess())
    fireEvent.click(screen.getByRole('button', { name: '2.Nc3' }))
    fireEvent.click(screen.getByRole('button', { name: o.deleteMove }))
    expect(deleteMove).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: o.confirmDeleteMove }))
    expect(deleteMove).toHaveBeenCalledWith(5, expect.anything())
    expect(board.lastMoveUci).toBe('c7c5')
  })

  it('builds new lines with moves of both sides, and marks accepted alternatives', () => {
    renderLines('/openings/u-copy/lines')
    fireEvent.click(screen.getByRole('button', { name: o.editLines }))

    // Una linea che finisce con la mossa dell'avversario chiede la risposta.
    fireEvent.click(screen.getByRole('button', { name: 'Nc6' }))
    expect(screen.getByText(o.endsWithOpponent)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: o.makeAlternative }),
    ).not.toBeInTheDocument()

    // 2.Nf3 e 2.Bc4 aprono due linee: una delle due puo' diventare
    // un'alternativa accettata.
    fireEvent.click(screen.getByRole('button', { name: '2.Bc4' }))
    expect(screen.queryByText(o.endsWithOpponent)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: o.makeAlternative }))
    expect(setAlternative).toHaveBeenCalledWith({ nodeId: 6, alternative: true })

    // 2.Nc3 ha un seguito ed e' l'unica mossa in quella posizione.
    fireEvent.click(screen.getByRole('button', { name: '2.Nc3' }))
    expect(
      screen.queryByRole('button', { name: o.makeAlternative }),
    ).not.toBeInTheDocument()
  })

  it('renames a personal repertoire from the header', () => {
    renderLines('/openings/u-copy/lines')
    fireEvent.click(screen.getByRole('button', { name: o.rename }))
    fireEvent.change(screen.getByRole('textbox', { name: o.rename }), {
      target: { value: '  Italiana 2  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: o.renameSave }))
    expect(rename).toHaveBeenCalledWith(
      { repertoireId: 'r2', name: 'Italiana 2' },
      expect.anything(),
    )
  })

  it('marks a move as the start of a wrong line, and shows a wrong line as such', () => {
    renderLines('/openings/u-copy/lines')
    fireEvent.click(screen.getByRole('button', { name: o.editLines }))
    fireEvent.click(screen.getByRole('button', { name: '2.Nc3' }))
    fireEvent.click(screen.getByRole('button', { name: o.markMistake }))
    expect(setMistake).toHaveBeenCalledWith({ nodeId: 5, mistake: true })
    cleanup()

    // 2.Bc4 segnata: in rosso con "?", fuori dalle linee da allenare.
    const bc4 = copy.nodes.find((n) => n.id === 6)!
    bc4.is_mistake = true
    renderLines('/openings/u-copy/lines')
    expect(
      screen.queryByRole('button', { name: '1.e4 e5 2.Bc4' }),
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '2.Bc4?' }))
    expect(screen.getByText(o.inMistakeLine)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: o.editLines }))
    fireEvent.click(screen.getByRole('button', { name: o.unmarkMistake }))
    expect(setMistake).toHaveBeenCalledWith({ nodeId: 6, mistake: false })
    expect(
      screen.queryByRole('button', { name: o.makeAlternative }),
    ).not.toBeInTheDocument()
    bc4.is_mistake = false
  })

  it('draws arrows on the selected position and removes one drawn again', () => {
    arrows = new Map([[1, [{ from: 'g1', to: 'f3', color: 'G' }]]])
    renderLines()
    // Sulla posizione iniziale non si disegna.
    expect(board.onArrowDrawn).toBeUndefined()
    fireEvent.click(screen.getByRole('button', { name: '1.e4' }))
    expect(board.savedArrows).toEqual([{ from: 'g1', to: 'f3', color: 'G' }])

    act(() => board.onArrowDrawn!({ from: 'f1', to: 'c4', color: 'R' }))
    expect(saveArrows).toHaveBeenLastCalledWith({
      nodeId: 1,
      arrows: [
        { from: 'g1', to: 'f3', color: 'G' },
        { from: 'f1', to: 'c4', color: 'R' },
      ],
    })
    act(() => board.onArrowDrawn!({ from: 'g1', to: 'f3', color: 'G' }))
    expect(saveArrows).toHaveBeenLastCalledWith({ nodeId: 1, arrows: [] })

    fireEvent.click(screen.getByRole('button', { name: o.clearArrows }))
    expect(saveArrows).toHaveBeenLastCalledWith({ nodeId: 1, arrows: [] })
    arrows = new Map()
  })

  it('deletes a move and marks mistakes from the move menu of a personal repertoire', () => {
    deleteMove.mockImplementation((_id, options) => options.onSuccess())
    renderLines('/openings/u-copy/lines?move=7')
    expect(board.lastMoveUci).toBe('b8c6')

    // Eliminazione con conferma; la mossa selezionata era nel seguito.
    fireEvent.contextMenu(screen.getByRole('button', { name: '2.Nc3' }))
    fireEvent.click(screen.getByRole('menuitem', { name: o.deleteMove }))
    expect(deleteMove).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('menuitem', { name: o.confirmDeleteMove }))
    expect(deleteMove).toHaveBeenCalledWith(5, expect.anything())
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(board.lastMoveUci).toBe('c7c5')

    fireEvent.contextMenu(screen.getByRole('button', { name: '2.Bc4' }))
    fireEvent.click(screen.getByRole('menuitem', { name: o.markMistake }))
    expect(setMistake).toHaveBeenCalledWith({ nodeId: 6, mistake: true })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('exports the repertoire as PGN', async () => {
    let blob: Blob | undefined
    const createObjectURL = vi.fn((b: Blob) => {
      blob = b
      return 'blob:pgn'
    })
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() })
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    renderLines()
    fireEvent.click(screen.getByRole('button', { name: o.exportPgn }))
    expect(click).toHaveBeenCalled()
    const pgn = await blob!.text()
    expect(pgn).toContain('[Event "Partita Italiana"]')
    expect(pgn).toContain('1. e4 e5 (1... c5 2. Nc3) 2. Nf3 *')
    click.mockRestore()
  })
})
