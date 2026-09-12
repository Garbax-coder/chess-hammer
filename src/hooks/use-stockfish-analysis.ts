import { useEffect, useState } from 'react'
import { stockfishEngine, type EngineLine } from '@/lib/stockfish-engine'

export function useStockfishAnalysis(
  fen: string | null,
  options: { multiPv: number; depth: number; enabled: boolean },
) {
  const [lines, setLines] = useState<EngineLine[]>([])
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    if (!fen || !options.enabled) {
      setLines([])
      setAnalyzing(false)
      return
    }

    let cancelled = false
    setLines([])
    setAnalyzing(true)

    stockfishEngine.analyze(
      fen,
      { multiPv: options.multiPv, depth: options.depth },
      (nextLines, done) => {
        if (cancelled) return
        setLines(nextLines)
        if (done) setAnalyzing(false)
      },
    )

    return () => {
      cancelled = true
      stockfishEngine.stopListening()
    }
  }, [fen, options.multiPv, options.depth, options.enabled])

  return { lines, analyzing }
}
