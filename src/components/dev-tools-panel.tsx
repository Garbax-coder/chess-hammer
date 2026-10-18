import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useActiveSession } from '@/hooks/use-active-session'
import { useAuth } from '@/lib/auth-context'
import { applyScenario, type DebugScenario } from '@/lib/dev-scenarios'
import {
  addDoubleMateDebugPuzzle,
  addKnightPromotionDebugPuzzle,
  deleteActiveSession,
  type DebugPuzzle,
  resetSession,
  resetTodayQuota,
  skipRest,
} from '@/lib/dev-tools'
import { useTranslations } from '@/lib/language-context'

const SCENARIOS: DebugScenario[] = ['lastOfDay', 'lastOfRound1', 'lastOfSession']
const NOTICE_KEY = 'chess-hammer-dev-notice'

function storeNotice(text: string) {
  try {
    sessionStorage.setItem(NOTICE_KEY, text)
  } catch {
    // Memoria del browser non disponibile: l'avviso si perde, nient'altro.
  }
}

// Letto all'avvio e cancellato in un effetto: in StrictMode l'inizializzatore
// di useState gira due volte, e cancellarlo li' lo farebbe sparire.
function readNotice(): string | null {
  try {
    return sessionStorage.getItem(NOTICE_KEY)
  } catch {
    return null
  }
}

function clearNotice() {
  try {
    sessionStorage.removeItem(NOTICE_KEY)
  } catch {
    // Niente da cancellare.
  }
}

/**
 * Pannello visibile solo in sviluppo (`import.meta.env.DEV`, mai nella build
 * di produzione) per resettare quota/sessione durante i test, senza dover
 * aspettare il giorno dopo o chiedere un reset manuale via SQL.
 */
export function DevToolsPanel({
  onOpenPuzzle,
}: {
  // Apre un puzzle della sessione in pratica libera (vedi TrainPage).
  onOpenPuzzle?: (sessionPuzzleId: string, puzzleId: string) => void
} = {}) {
  const { user } = useAuth()
  const t = useTranslations()
  const { data: session } = useActiveSession()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [busy, setBusy] = useState<
    | 'quota'
    | 'session'
    | 'delete'
    | 'rest'
    | 'promotion'
    | 'doubleMate'
    | DebugScenario
    | null
  >(null)
  // Avviso dello scenario appena applicato, sopravvissuto alla ricarica.
  const [notice] = useState(readNotice)
  useEffect(clearNotice, [])

  if (!session || !user) return null

  async function handleResetQuota() {
    setBusy('quota')
    try {
      await resetTodayQuota(session!.id, session!.current_round)
      await queryClient.invalidateQueries()
    } finally {
      setBusy(null)
    }
  }

  async function handleResetSession() {
    setBusy('session')
    try {
      await resetSession(session!.id, user!.id)
      await queryClient.invalidateQueries()
    } finally {
      setBusy(null)
    }
  }

  async function handleDeleteActiveSession() {
    setBusy('delete')
    try {
      await deleteActiveSession(session!.id)
      await queryClient.invalidateQueries()
      navigate('/dashboard')
    } finally {
      setBusy(null)
    }
  }

  async function handleSkipRest() {
    setBusy('rest')
    try {
      await skipRest(session!.id)
      await queryClient.invalidateQueries()
    } finally {
      setBusy(null)
    }
  }

  async function handleAddKnightPromotionPuzzle() {
    setBusy('promotion')
    try {
      openIfAlreadyThere(await addKnightPromotionDebugPuzzle(session!.id))
      await queryClient.invalidateQueries()
    } finally {
      setBusy(null)
    }
  }

  // Un puzzle nuovo diventa il prossimo della sessione; uno gia' presente si
  // riapre in pratica libera invece di non fare nulla.
  function openIfAlreadyThere(puzzle: DebugPuzzle) {
    if (puzzle.alreadyInSession) onOpenPuzzle?.(puzzle.sessionPuzzleId, puzzle.puzzleId)
  }

  // Porta la sessione a un solo puzzle da un traguardo e ricarica /train,
  // dove quel puzzle e' il prossimo da risolvere. Ricarica completa, non
  // invalidateQueries: il prossimo puzzle verrebbe ricalcolato con la
  // sessione ancora in cache (giro e pausa di prima) prima che arrivi quella
  // aggiornata, e getNextPuzzle potrebbe riscrivere un cambio di giro o una
  // pausa sopra quelli appena impostati.
  async function handleScenario(scenario: DebugScenario) {
    setBusy(scenario)
    try {
      const { quotaEndsRound } = await applyScenario(scenario, session!, user!.id)
      if (quotaEndsRound) storeNotice(t.devTools.quotaEndsRound)
      window.location.assign('/train')
    } catch (error) {
      setBusy(null)
      throw error
    }
  }

  async function handleAddDoubleMatePuzzle() {
    setBusy('doubleMate')
    try {
      openIfAlreadyThere(await addDoubleMateDebugPuzzle(session!.id))
      await queryClient.invalidateQueries()
    } finally {
      setBusy(null)
    }
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-sm">{t.devTools.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy !== null}
          onClick={handleResetQuota}
        >
          {busy === 'quota' ? t.devTools.resetting : t.devTools.resetQuota}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy !== null}
          onClick={handleResetSession}
        >
          {busy === 'session' ? t.devTools.resetting : t.devTools.resetSession}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy !== null}
          onClick={handleDeleteActiveSession}
        >
          {busy === 'delete' ? t.devTools.resetting : t.devTools.deleteActiveSession}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy !== null}
          onClick={handleSkipRest}
        >
          {busy === 'rest' ? t.devTools.resetting : t.devTools.skipRest}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy !== null}
          onClick={handleAddKnightPromotionPuzzle}
        >
          {busy === 'promotion'
            ? t.devTools.resetting
            : t.devTools.addKnightPromotionPuzzle}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy !== null}
          onClick={handleAddDoubleMatePuzzle}
        >
          {busy === 'doubleMate' ? t.devTools.resetting : t.devTools.addDoubleMatePuzzle}
        </Button>
        {SCENARIOS.map((scenario) => (
          <Button
            key={scenario}
            type="button"
            variant="outline"
            size="sm"
            disabled={busy !== null}
            onClick={() => handleScenario(scenario)}
          >
            {busy === scenario ? t.devTools.resetting : t.devTools[scenario]}
          </Button>
        ))}
        {notice && <p className="text-muted-foreground w-full text-xs">{notice}</p>}
      </CardContent>
    </Card>
  )
}
