import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-foreground text-3xl font-semibold tracking-tight">
        Chess Hammer
      </h1>
      <p className="text-muted-foreground">Woodpecker method trainer — setup in corso.</p>
      <Button>Inizia allenamento</Button>
    </main>
  )
}
