import { Chess } from 'chess.js'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AnalysisPanel } from '@/components/analysis-panel'
import { EvalBar } from '@/components/eval-bar'
import { OpeningBoard } from '@/components/opening-board'
import { OpeningCommentDialog } from '@/components/opening-comment-dialog'
import { OpeningMoveMenu, type MoveMenuTarget } from '@/components/opening-move-menu'
import { OpeningPageHeader } from '@/components/opening-page-header'
import { OpeningPageLayout } from '@/components/opening-page-layout'
import { RepertoireGate } from '@/components/repertoire-gate'
import { MoveStateLegend, OpeningTreeView } from '@/components/opening-tree-view'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useLocalToggle } from '@/hooks/use-local-toggle'
import {
  useAddOpeningMove,
  useCopyRepertoire,
  useDeleteOpeningMove,
  useOpeningNames,
  useOpeningNotes,
  useOpeningArrows,
  useSaveOpeningArrows,
  useSaveOpeningNote,
  useSetMoveAlternative,
  useSetMoveMistake,
} from '@/hooks/use-openings'
import { useStockfishAnalysis } from '@/hooks/use-stockfish-analysis'
import { useUserStats } from '@/hooks/use-user-stats'
import { evalToWhitePercent } from '@/lib/chess-format'
import { useEngineSettings } from '@/lib/engine-settings'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import { toggleArrow, type MoveArrow } from '@/lib/opening-arrows'
import { epdOf } from '@/lib/opening-catalog'
import { repertoirePgn } from '@/lib/opening-pgn'
import { MOVE_STATE_CLASSES } from '@/lib/opening-move-style'
import { useTranslations } from '@/lib/language-context'
import {
  commentOf,
  isUserMove,
  moveLabel,
  moveState,
  nameAt,
  runMastery,
  runPath,
  type OpeningName,
  type OpeningNode,
  type OpeningProgress,
  type OpeningTree,
} from '@/lib/opening-tree'
import type { RepertoireWithNodes } from '@/lib/openings'

const NO_NAMES = new Map<number, OpeningName>()
const NO_COMMENTS = new Map<number, string>()
const NO_NODES: OpeningNode[] = []
const NO_ARROWS = new Map<number, MoveArrow[]>()
const NO_MOVE_ARROWS: MoveArrow[] = []
const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

// Consultazione di un repertorio: l'albero delle varianti con la padronanza
// di ogni mossa (heatmap), la posizione della mossa selezionata e le linee,
// ognuna da allenare da sola.
export default function OpeningLinesPage() {
  const { slug } = useParams<{ slug: string }>()
  return (
    <RepertoireGate slug={slug} allowEmpty>
      {(data) => <OpeningLines key={data.repertoire.id} {...data} />}
    </RepertoireGate>
  )
}

function OpeningLines({
  repertoire,
  tree,
  progress,
}: {
  repertoire: RepertoireWithNodes
  tree: OpeningTree
  progress: Map<number, OpeningProgress>
}) {
  const t = useTranslations()
  const o = useOpeningsTranslations()
  const { data: stats } = useUserStats()
  // I nomi arrivano a parte: finche' non ci sono la pagina funziona senza.
  const { data: names = NO_NAMES } = useOpeningNames()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // ?move=<id>: si apre su quella mossa (es. dalle statistiche).
  const [selection, setSelectedId] = useState<number | null>(
    () => Number(searchParams.get('move')) || null,
  )
  // Una mossa appena eliminata (o inesistente) non e' nell'albero: si torna
  // all'inizio.
  const selectedId = selection !== null && tree.byId.has(selection) ? selection : null
  // Modifica delle linee: solo per i repertori personali (?edit=1 dopo una copia).
  const [editMode, setEditMode] = useState(
    () => !!repertoire.owner_id && searchParams.get('edit') === '1',
  )
  const [editMessage, setEditMessage] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  // La mossa appena giocata in modifica, mostrata subito mentre si salva:
  // senza, la scacchiera tornerebbe indietro fino alla risposta del server e
  // rifarebbe la mossa.
  const [pendingMove, setPendingMove] = useState<{
    parentId: number | null
    uci: string
    fen: string
  } | null>(null)
  const addMove = useAddOpeningMove()
  const deleteMove = useDeleteOpeningMove()
  const setAlternative = useSetMoveAlternative()
  const setMistake = useSetMoveMistake()
  // Le frecce dell'utente sulla posizione selezionata (tasto destro).
  const { data: arrows = NO_ARROWS } = useOpeningArrows()
  const saveArrows = useSaveOpeningArrows()
  const copyRepertoire = useCopyRepertoire()
  // Stockfish sulla posizione mostrata.
  const [engineOn, setEngineOn] = useLocalToggle('openings-stockfish', false)
  const { settings: engineSettings, update: updateEngineSettings } = useEngineSettings()
  // Nomi delle varianti, da mostrare o no in ciascuna delle due card, e
  // commenti nell'albero.
  const [treeNames, setTreeNames] = useLocalToggle('openings-tree-names', true)
  const [lineNames, setLineNames] = useLocalToggle('openings-line-names', true)
  const [treeComments, setTreeComments] = useLocalToggle('openings-tree-comments', true)
  // Commenti: quelli personali hanno la precedenza su quelli del PGN.
  const { data: notes = NO_COMMENTS } = useOpeningNotes()
  const saveNote = useSaveOpeningNote()
  const [commentNode, setCommentNode] = useState<OpeningNode | null>(null)
  const comments = useMemo(() => {
    const map = new Map<number, string>()
    for (const node of tree.byId.values()) {
      const text = commentOf(node, notes)
      if (text) map.set(node.id, text)
    }
    return map
  }, [tree, notes])

  function saveComment(text: string) {
    if (!commentNode) return
    // Vuoto: si toglie la nota; se la mossa ha un commento del PGN, una nota
    // vuota lo nasconde.
    const note = text === '' ? (commentNode.comment ? '' : null) : text
    saveNote.mutate(
      { nodeId: commentNode.id, note },
      { onSuccess: () => setCommentNode(null) },
    )
  }
  const now = new Date()
  const color = repertoire.color
  const selected = selectedId === null ? undefined : tree.byId.get(selectedId)

  const pathToSelected = useMemo(
    () => (selectedId === null ? [] : runPath(tree, selectedId)),
    [tree, selectedId],
  )
  const fen = useMemo(() => {
    const chess = new Chess()
    for (const node of pathToSelected) chess.move(node.san)
    return chess.fen()
  }, [pathToSelected])
  // Per la barra di valutazione: chi muove e se la posizione e' matto
  // (Stockfish allora non da' righe).
  const evaluation = useMemo(() => {
    const chess = new Chess(fen)
    return { turn: chess.turn(), checkmate: chess.isCheckmate() }
  }, [fen])
  const engine = useStockfishAnalysis(
    engineOn ? { fen: START_FEN, moves: pathToSelected.map((n) => n.uci) } : null,
    { multiPv: engineSettings.multiPv, depth: engineSettings.depth, enabled: engineOn },
  )
  const bestMove =
    engineOn && engineSettings.showBestMoveArrow ? engine.lines[0]?.pvUci[0] : undefined

  const firstChild = (tree.children.get(selectedId) ?? [])[0]
  const siblings = tree.children.get(selected?.parent_id ?? null) ?? NO_NODES

  // Frecce della tastiera: indietro e avanti lungo la linea, su e giu' tra
  // le varianti della stessa mossa. Non mentre si scrive o con una finestra
  // aperta.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target
      if (
        commentNode ||
        (target instanceof Element &&
          target.closest(
            'input, textarea, select, [contenteditable="true"], [role="dialog"]',
          ))
      ) {
        return
      }
      const index = selected ? siblings.findIndex((n) => n.id === selected.id) : -1
      let next: number | null | undefined
      if (event.key === 'ArrowLeft') next = selected ? selected.parent_id : undefined
      else if (event.key === 'ArrowRight') next = firstChild?.id
      else if (event.key === 'ArrowUp' && index > 0) next = siblings[index - 1].id
      else if (event.key === 'ArrowDown' && index >= 0 && index < siblings.length - 1)
        next = siblings[index + 1].id
      else return
      event.preventDefault()
      if (next !== undefined) setSelectedId(next)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [commentNode, selected, siblings, firstChild])

  // In modifica: una mossa giocata sulla scacchiera si aggiunge dopo quella
  // selezionata (o si seleziona, se c'e' gia').
  function handleEditMove(uci: string): boolean {
    setEditMessage(null)
    setConfirmingDelete(false)
    const existing = (tree.children.get(selectedId) ?? []).find((n) => n.uci === uci)
    if (existing) {
      setSelectedId(existing.id)
      return true
    }
    if (selected && !selected.is_main) {
      setEditMessage(o.alternativeNoContinuation)
      return false
    }
    const chess = new Chess(fen)
    const move = chess.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci[4],
    })
    setPendingMove({ parentId: selectedId, uci, fen: chess.fen() })
    addMove.mutate(
      {
        repertoireId: repertoire.id,
        parentId: selectedId,
        uci,
        san: move.san,
        epd: epdOf(chess.fen()),
      },
      {
        onSuccess: (node) => setSelectedId(node.id),
        onSettled: () => setPendingMove(null),
      },
    )
    return true
  }

  // La mossa selezionata, se e' dell'utente: alternativa accettata (senza
  // seguito, accanto a un'altra sua mossa principale) o linea.
  const selectedIsUser = !!selected && isUserMove(selected, color)
  const inMistake = !!selected && tree.mistakes.has(selected.id)
  const canMakeAlternative =
    selectedIsUser &&
    selected.is_main &&
    !inMistake &&
    !firstChild &&
    siblings.some((n) => n.id !== selected.id && n.is_main && !n.is_mistake)
  // Una linea sbagliata puo' finire con la confutazione dell'avversario.
  const endsWithOpponent = !!selected && !selectedIsUser && !firstChild && !inMistake
  // Si segna come errore la prima mossa di una linea sbagliata, non il suo
  // seguito.
  const canToggleMistake = !!selected && (selected.is_mistake || !inMistake)
  const selectedArrows = (selectedId !== null && arrows.get(selectedId)) || NO_MOVE_ARROWS

  function drawArrow(arrow: MoveArrow) {
    if (selectedId === null) return
    saveArrows.mutate({ nodeId: selectedId, arrows: toggleArrow(selectedArrows, arrow) })
  }

  function exportPgn() {
    const pgn = repertoirePgn({
      name: o.names[repertoire.slug] ?? repertoire.name,
      eco: repertoire.eco,
      color,
      tree,
      comments,
      arrows,
    })
    const url = URL.createObjectURL(new Blob([pgn], { type: 'application/x-chess-pgn' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${repertoire.slug}.pgn`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  // Solo finche' resta selezionata la mossa da cui e' stata giocata.
  const shownMove = pendingMove?.parentId === selectedId ? pendingMove : null

  // Il menu di una mossa dell'albero (tasto destro o tocco lungo).
  const [menuTarget, setMenuTarget] = useState<MoveMenuTarget | null>(null)

  function deleteFromMenu(node: OpeningNode) {
    deleteMove.mutate(node.id, {
      onSuccess: () => {
        setMenuTarget(null)
        // Se la mossa selezionata era nel seguito eliminato, si torna alla
        // mossa precedente a quella eliminata.
        for (
          let id = selectedId;
          id !== null;
          id = tree.byId.get(id)?.parent_id ?? null
        ) {
          if (id === node.id) {
            setSelectedId(node.parent_id)
            break
          }
        }
      },
    })
  }

  function handleDelete() {
    if (!selected) return
    deleteMove.mutate(selected.id, {
      onSuccess: () => {
        setConfirmingDelete(false)
        setSelectedId(selected.parent_id)
      },
    })
  }

  function copyAndEdit() {
    copyRepertoire.mutate(
      {
        repertoireId: repertoire.id,
        name: o.copyName(o.names[repertoire.slug] ?? repertoire.name),
      },
      { onSuccess: ({ slug }) => navigate(`/openings/${slug}/lines?edit=1`) },
    )
  }

  return (
    <>
      <OpeningMoveMenu
        target={menuTarget}
        editable={!!repertoire.owner_id}
        canToggleMistake={
          !!menuTarget &&
          (!!menuTarget.node.is_mistake || !tree.mistakes.has(menuTarget.node.id))
        }
        deleting={deleteMove.isPending}
        onComment={(node) => {
          setMenuTarget(null)
          setCommentNode(node)
        }}
        onDelete={deleteFromMenu}
        onToggleMistake={(node) => {
          setMenuTarget(null)
          setMistake.mutate({ nodeId: node.id, mistake: !node.is_mistake })
        }}
        onClose={() => setMenuTarget(null)}
      />
      <OpeningCommentDialog
        moveLabel={commentNode ? moveLabel(commentNode, true) : null}
        initial={commentNode ? (comments.get(commentNode.id) ?? '') : ''}
        saving={saveNote.isPending}
        onSave={saveComment}
        onDelete={() => saveComment('')}
        onClose={() => setCommentNode(null)}
      />
      <OpeningPageLayout
        variant="browse"
        evalBar={
          engineOn
            ? (orientation) => (
                <EvalBar
                  orientation={orientation}
                  flipped={color === 'b'}
                  whitePercent={evalToWhitePercent(
                    engine.lines[0]?.scoreCp ?? null,
                    engine.lines[0]?.scoreMate ?? null,
                    evaluation.turn,
                    evaluation.checkmate,
                  )}
                  scoreCp={engine.lines[0]?.scoreCp ?? null}
                  scoreMate={engine.lines[0]?.scoreMate ?? null}
                  sideToMove={evaluation.turn}
                  isCheckmate={evaluation.checkmate}
                />
              )
            : undefined
        }
        left={
          <>
            <OpeningPageHeader
              repertoire={repertoire}
              mode="lines"
              subtitle={`${o.color[color]} · ${o.runs(tree.leaves.length)}`}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label={t.puzzleBoard.prevMove}
                disabled={!selected}
                onClick={() => setSelectedId(selected?.parent_id ?? null)}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label={t.puzzleBoard.nextMove}
                disabled={!firstChild}
                onClick={() => firstChild && setSelectedId(firstChild.id)}
              >
                <ChevronRight />
              </Button>
            </div>
            <SelectedMove
              node={selected}
              comment={selected ? comments.get(selected.id) : undefined}
              tree={tree}
              names={names}
              color={color}
              progress={progress}
              now={now}
            />
            {inMistake && <p className="text-destructive text-xs">{o.inMistakeLine}</p>}
            {selected && (
              <div className="flex flex-col gap-1">
                <p className="text-muted-foreground text-xs">{o.arrowsHint}</p>
                {selectedArrows.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit"
                    onClick={() => saveArrows.mutate({ nodeId: selected.id, arrows: [] })}
                  >
                    {o.clearArrows}
                  </Button>
                )}
              </div>
            )}
            <Button variant="outline" size="sm" className="w-fit" onClick={exportPgn}>
              {o.exportPgn}
            </Button>
            {repertoire.owner_id ? (
              <div className="flex flex-col gap-2">
                <Button
                  variant={editMode ? 'default' : 'outline'}
                  size="sm"
                  className="w-fit"
                  onClick={() => {
                    setEditMode((on) => !on)
                    setEditMessage(null)
                    setConfirmingDelete(false)
                  }}
                >
                  {editMode ? o.doneEditing : o.editLines}
                </Button>
                {editMode && (
                  <>
                    <p className="text-muted-foreground text-xs">{o.editHint}</p>
                    {selected &&
                      (confirmingDelete ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-fit"
                          loading={deleteMove.isPending}
                          onClick={handleDelete}
                        >
                          {o.confirmDeleteMove}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-fit"
                          onClick={() => setConfirmingDelete(true)}
                        >
                          {o.deleteMove}
                        </Button>
                      ))}
                    {selected && (canMakeAlternative || !selected.is_main) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-fit"
                        loading={setAlternative.isPending}
                        onClick={() =>
                          setAlternative.mutate({
                            nodeId: selected.id,
                            alternative: selected.is_main,
                          })
                        }
                      >
                        {selected.is_main ? o.makeAlternative : o.makeLine}
                      </Button>
                    )}
                    {canToggleMistake && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-fit"
                        loading={setMistake.isPending}
                        onClick={() =>
                          setMistake.mutate({
                            nodeId: selected.id,
                            mistake: !selected.is_mistake,
                          })
                        }
                      >
                        {selected.is_mistake ? o.unmarkMistake : o.markMistake}
                      </Button>
                    )}
                    {endsWithOpponent && (
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        {o.endsWithOpponent}
                      </p>
                    )}
                    {editMessage && (
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        {editMessage}
                      </p>
                    )}
                    {(addMove.isError ||
                      deleteMove.isError ||
                      setAlternative.isError ||
                      setMistake.isError) && (
                      <p className="text-destructive text-xs">{o.editError}</p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                loading={copyRepertoire.isPending}
                onClick={copyAndEdit}
              >
                {o.copyToEdit}
              </Button>
            )}
            {copyRepertoire.isError && (
              <p className="text-destructive text-xs">{o.editError}</p>
            )}
          </>
        }
        board={
          <OpeningBoard
            fen={shownMove?.fen ?? fen}
            orientation={color === 'w' ? 'white' : 'black'}
            interactive={editMode}
            onMove={editMode ? handleEditMove : () => false}
            hintUci={bestMove}
            lastMoveUci={shownMove?.uci ?? selected?.uci}
            savedArrows={shownMove ? undefined : selectedArrows}
            onArrowDrawn={selected ? drawArrow : undefined}
            boardTheme={stats?.board_theme}
            pieceSet={stats?.piece_set}
          />
        }
        right={
          <>
            <AnalysisPanel
              fen={fen}
              lines={engine.lines}
              analyzing={engine.analyzing}
              settings={engineSettings}
              onUpdateSettings={updateEngineSettings}
              className="w-full"
              enabled={engineOn}
              onEnabledChange={setEngineOn}
            />
            <Card>
              <CardHeader className="gap-2">
                <CardTitle>{o.treeTitle}</CardTitle>
                <CardAction className="flex flex-col items-end gap-1.5">
                  <LabeledSwitch
                    id="tree-names"
                    label={o.showNames}
                    checked={treeNames}
                    onChange={setTreeNames}
                  />
                  <LabeledSwitch
                    id="tree-comments"
                    label={o.showComments}
                    checked={treeComments}
                    onChange={setTreeComments}
                  />
                </CardAction>
                <MoveStateLegend />
                <p className="text-muted-foreground text-xs">{o.commentHint}</p>
              </CardHeader>
              <CardContent>
                <OpeningTreeView
                  tree={tree}
                  color={color}
                  progress={progress}
                  now={now}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  names={treeNames ? names : NO_NAMES}
                  comments={treeComments ? comments : NO_COMMENTS}
                  onMoveContextMenu={(node, point) => setMenuTarget({ node, ...point })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{o.linesTitle}</CardTitle>
                <CardAction>
                  <LabeledSwitch
                    id="line-names"
                    label={o.showNames}
                    checked={lineNames}
                    onChange={setLineNames}
                  />
                </CardAction>
              </CardHeader>
              <CardContent>
                <ol className="flex flex-col divide-y">
                  {tree.leaves.map((leaf) => (
                    <LineRow
                      key={leaf.id}
                      slug={repertoire.slug}
                      tree={tree}
                      names={lineNames ? names : NO_NAMES}
                      leaf={leaf}
                      color={color}
                      progress={progress}
                      now={now}
                      selected={leaf.id === selectedId}
                      onSelect={() => setSelectedId(leaf.id)}
                    />
                  ))}
                </ol>
              </CardContent>
            </Card>
          </>
        }
      />
    </>
  )
}

function LabeledSwitch({
  id,
  label,
  checked,
  onChange,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="text-muted-foreground text-xs font-normal">
        {label}
      </Label>
    </div>
  )
}

/**
 * La mossa selezionata: il nome dell'apertura a quel punto e, se la mossa e'
 * dell'utente, i suoi dati di allenamento.
 */
function SelectedMove({
  node,
  comment,
  tree,
  names,
  color,
  progress,
  now,
}: {
  node: OpeningNode | undefined
  comment: string | undefined
  tree: OpeningTree
  names: Map<number, OpeningName>
  color: 'w' | 'b'
  progress: Map<number, OpeningProgress>
  now: Date
}) {
  const t = useTranslations()
  const o = useOpeningsTranslations()
  if (!node) {
    return <p className="text-muted-foreground text-xs">{o.startPosition}</p>
  }
  const label = moveLabel(node, true)
  const name = nameAt(tree, node.id, names)
  const row = progress.get(node.id)
  const state =
    node.is_main && !tree.mistakes.has(node.id) && isUserMove(node, color)
      ? moveState(row, now)
      : null
  return (
    <div className="flex min-w-0 flex-col text-xs">
      {name && (
        <p className="text-foreground truncate font-medium" title={name.name}>
          {name.eco} · {name.name}
        </p>
      )}
      <p className="text-muted-foreground flex items-center gap-1.5">
        <span className="text-foreground font-mono font-medium">{label}</span>
        {state ? (
          <span className={`rounded px-1.5 py-0.5 ${MOVE_STATE_CLASSES[state]}`}>
            {o.legend[state]}
          </span>
        ) : (
          <span>· {node.is_main ? o.opponentMove : o.alternativeLabel}</span>
        )}
      </p>
      {state && (
        <p className="text-muted-foreground">
          {row
            ? o.moveStats(
                row.attempts,
                Math.round((row.first_try_correct / row.attempts) * 100),
              )
            : o.neverPlayed}
        </p>
      )}
      {state && row?.due_at && (
        <p className="text-muted-foreground">
          {state === 'due'
            ? o.dueNow
            : o.nextReview(new Date(row.due_at).toLocaleDateString(t.meta.locale))}
        </p>
      )}
      {comment && <p className="mt-1 text-sky-700 dark:text-sky-300">{comment}</p>}
    </div>
  )
}

function LineRow({
  slug,
  tree,
  names,
  leaf,
  color,
  progress,
  now,
  selected,
  onSelect,
}: {
  slug: string
  tree: OpeningTree
  names: Map<number, OpeningName>
  leaf: OpeningNode
  color: 'w' | 'b'
  progress: Map<number, OpeningProgress>
  now: Date
  selected: boolean
  onSelect: () => void
}) {
  const o = useOpeningsTranslations()
  const path = runPath(tree, leaf.id)
  const name = nameAt(tree, leaf.id, names)
  const mastery = runMastery(tree, leaf.id, progress, color, now)
  return (
    <li className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
      {name && (
        <p className="text-foreground text-sm font-medium">
          <span className="text-muted-foreground font-mono text-xs">{name.eco}</span>{' '}
          {name.name}
        </p>
      )}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          aria-current={selected ? 'true' : undefined}
          onClick={onSelect}
          className={`min-w-0 flex-1 rounded-md px-1 text-left font-mono text-xs leading-relaxed ${
            selected ? 'bg-primary/10' : 'hover:bg-muted'
          }`}
        >
          {path.map((node, index) => moveLabel(node, index === 0)).join(' ')}
        </button>
        <div className="flex items-center justify-between gap-3">
          <div className="flex w-28 flex-col gap-1">
            <div className="bg-muted h-1.5 overflow-hidden rounded-full">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${(mastery.mastered / mastery.total) * 100}%` }}
              />
            </div>
            <span className="text-muted-foreground text-[0.65rem] tabular-nums">
              {o.mastered(mastery.mastered, mastery.total)}
            </span>
          </div>
          {/* Studio e allenamento sempre; in evidenza lo studio finche' la
              linea ha mosse mai viste, poi l'allenamento. */}
          <div className="flex flex-wrap justify-end gap-1.5">
            <Button asChild size="sm" variant={mastery.new > 0 ? 'default' : 'outline'}>
              <Link to={`/openings/${slug}/learn?line=${leaf.id}`}>{o.learnLine}</Link>
            </Button>
            <Button asChild size="sm" variant={mastery.new > 0 ? 'outline' : 'default'}>
              <Link to={`/openings/${slug}?line=${leaf.id}`}>{o.trainLine}</Link>
            </Button>
          </div>
        </div>
      </div>
    </li>
  )
}
