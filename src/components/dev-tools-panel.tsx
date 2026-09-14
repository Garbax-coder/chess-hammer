import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useActiveSession } from '@/hooks/use-active-session'
import { useAuth } from '@/lib/auth-context'
import {
  addKnightPromotionDebugPuzzle,
  deleteActiveSession,
  resetSession,
  resetTodayQuota,
  skipRest,
} from '@/lib/dev-tools'
import { useTranslations } from '@/lib/language-context'

/**
 * Pannello visibile solo in sviluppo (`import.meta.env.DEV`, mai nella build
 * di produzione) per resettare quota/sessione durante i test, senza dover
 * aspettare il giorno dopo o chiedere un reset manuale via SQL.
 */
export function DevToolsPanel() {
  const { user } = useAuth()
  const t = useTranslations()
  const { data: session } = useActiveSession()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [busy, setBusy] = useState<
    'quota' | 'session' | 'delete' | 'rest' | 'promotion' | null
  >(null)

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
      await addKnightPromotionDebugPuzzle(session!.id)
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
      </CardContent>
    </Card>
  )
}
