import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
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
import { daysForRound } from '@/lib/training-sessions'
import { DEFAULT_SESSION_CONFIG, type NewTrainingSessionInput } from '@/types/training'

export default function NewSessionPage() {
  const navigate = useNavigate()
  const { data: activeSession, isLoading: loadingActiveSession } = useActiveSession()
  const createSession = useCreateTrainingSession()
  const [form, setForm] = useState<NewTrainingSessionInput>(DEFAULT_SESSION_CONFIG)

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
    await createSession.mutateAsync(form)
    navigate('/dashboard')
  }

  const rounds: {
    field: keyof NewTrainingSessionInput
    label: string
    round: 1 | 2 | 3
  }[] = [
    { field: 'daily_target_round1', label: '1° giro — puzzle/giorno', round: 1 },
    { field: 'daily_target_round2', label: '2° giro — puzzle/giorno', round: 2 },
    { field: 'daily_target_round3', label: '3° giro — puzzle/giorno', round: 3 },
  ]

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Nuova sessione</CardTitle>
          <CardDescription>
            Configura il tuo allenamento Woodpecker: stesso set di puzzle ripetuto per 3
            giri, sempre più veloce.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="total_puzzles">Totale puzzle nella sessione</Label>
              <Input
                id="total_puzzles"
                type="number"
                min={1}
                required
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
                      required
                      value={form[field]}
                      onChange={(e) => updateField(field, e.target.value)}
                    />
                    <span className="text-muted-foreground w-24 shrink-0 text-xs">
                      ~
                      {form[field] > 0
                        ? daysForRound(form.total_puzzles, form[field])
                        : '–'}{' '}
                      giorni
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {createSession.isError && (
              <p className="text-destructive text-sm">
                {createSession.error instanceof Error
                  ? createSession.error.message
                  : 'Errore nella creazione della sessione'}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={createSession.isPending}>
              {createSession.isPending ? 'Avvio…' : 'Avvia sessione'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
