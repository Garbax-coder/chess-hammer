import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { puzzlePgn } from '@/lib/chess-format'
import { useTranslations } from '@/lib/language-context'

/**
 * Temi del puzzle e copia di FEN/PGN: nella scheda "Info" di una riga della
 * lista e, a puzzle concluso, accanto alla scacchiera. Contiene la soluzione
 * (PGN) e i temi, che la suggeriscono: va mostrato solo dopo un tentativo.
 */
export function PuzzleInfoContent({
  fen,
  moves,
  themes,
  className = '',
  size = 'sm',
}: {
  fen: string
  moves: string[]
  themes: string[]
  className?: string
  size?: 'sm' | 'md'
}) {
  const t = useTranslations()
  const text = size === 'md' ? 'text-xs' : 'text-[0.6rem]'
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex flex-wrap gap-1">
        {themes.length === 0 && (
          <span className={`text-muted-foreground ${text}`}>
            {t.sessionPuzzleList.themesEmpty}
          </span>
        )}
        {themes.map((theme) => (
          <span
            key={theme}
            className={`bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 ${text}`}
          >
            {t.puzzleThemes.labels[theme] ?? theme}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <CopyButton
          getText={() => fen}
          label={t.sessionPuzzleList.copyFen}
          copiedLabel={t.sessionPuzzleList.fenCopied}
          textClass={text}
        />
        <CopyButton
          getText={() => puzzlePgn(fen, moves)}
          label={t.sessionPuzzleList.copyPgn}
          copiedLabel={t.sessionPuzzleList.fenCopied}
          textClass={text}
        />
      </div>
    </div>
  )
}

function CopyButton({
  getText,
  label,
  copiedLabel,
  textClass,
}: {
  getText: () => string
  label: string
  copiedLabel: string
  textClass: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getText())
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API non disponibile o permesso negato: nessun feedback
      // di errore, l'utente puo' comunque riprovare.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1 transition-colors ${textClass}`}
    >
      {copied ? (
        <Check className="size-3 shrink-0" />
      ) : (
        <Copy className="size-3 shrink-0" />
      )}
      {copied ? copiedLabel : label}
    </button>
  )
}
