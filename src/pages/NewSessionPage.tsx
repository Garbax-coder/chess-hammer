import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { SessionCalendarPreview } from '@/components/session-calendar-preview'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActiveSession, useCreateTrainingSession } from '@/hooks/use-active-session'
import { useTranslations } from '@/lib/language-context'
import { daysForRound } from '@/lib/training-sessions'
import { DEFAULT_SESSION_CONFIG, type NewTrainingSessionInput } from '@/types/training'

export default function NewSessionPage() {
  const navigate = useNavigate()
  const t = useTranslations()
  const { data: activeSession, isLoading: loadingActiveSession } = useActiveSession()
  const createSession = useCreateTrainingSession()
  const [form, setForm] = useState<NewTrainingSessionInput>(DEFAULT_SESSION_CONFIG)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Vincolo: una sola sessione attiva alla volta.
  if (!loadingActiveSession && activeSession) {
    return <Navigate to="/dashboard" replace />
  }

  function updateField(field: keyof NewTrainingSessionInput, value: string) {
    const parsed = Number(value)
    setForm((prev) => ({ ...prev, [field]: Number.isNaN(parsed) ? 0 : parsed }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const values = [
      form.total_puzzles,
      form.daily_target_round1,
      form.daily_target_round2,
      form.daily_target_round3,
    ]
    if (values.some((v) => !Number.isInteger(v) || v < 1)) {
      setValidationError(t.newSession.errorInvalidValues)
      return
    }
    setValidationError(null)
    await createSession.mutateAsync(form)
    navigate('/dashboard')
  }

  const rounds: {
    field: keyof NewTrainingSessionInput
    label: string
    round: 1 | 2 | 3
  }[] = [
    { field: 'daily_target_round1', label: t.newSession.roundLabel(1), round: 1 },
    { field: 'daily_target_round2', label: t.newSession.roundLabel(2), round: 2 },
    { field: 'daily_target_round3', label: t.newSession.roundLabel(3), round: 3 },
  ]

  return (
    <main className="flex w-full flex-1 flex-col items-center gap-6 px-4 py-8 lg:flex-row lg:items-start lg:justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t.newSession.title}</CardTitle>
          <CardDescription>{t.newSession.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="total_puzzles">{t.newSession.totalPuzzles}</Label>
              <Input
                id="total_puzzles"
                type="number"
                min={1}
                value={form.total_puzzles}
                onChange={(e) => updateField('total_puzzles', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3">
              {rounds.map(({ field, label }) => (
                <div key={field} className="flex flex-col gap-1.5">
                  <Label htmlFor={field}>{label}</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id={field}
                      type="number"
                      min={1}
                      value={form[field]}
                      onChange={(e) => updateField(field, e.target.value)}
                    />
                    <span className="text-muted-foreground w-24 shrink-0 text-xs">
                      {form[field] > 0
                        ? t.newSession.daysEstimate(
                            daysForRound(form.total_puzzles, form[field]),
                          )
                        : t.newSession.daysEstimate('–')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {validationError && (
              <p className="text-destructive text-sm">{validationError}</p>
            )}

            {!validationError && createSession.isError && (
              <p className="text-destructive text-sm">
                {createSession.error instanceof Error
                  ? createSession.error.message
                  : t.newSession.errorGeneric}
              </p>
            )}

            <Button type="submit" className="w-full" loading={createSession.isPending}>
              {t.newSession.start}
            </Button>
          </form>
        </CardContent>
      </Card>

      <SessionCalendarPreview
        totalPuzzles={form.total_puzzles}
        dailyTargets={[
          form.daily_target_round1,
          form.daily_target_round2,
          form.daily_target_round3,
        ]}
      />
    </main>
  )
}
