import { useEffect, useState } from 'react'
import {
  stockfishEngine,
  type EngineLine,
  type EnginePosition,
} from '@/lib/stockfish-engine'

export function useStockfishAnalysis(
  position: EnginePosition | null,
  options: { multiPv: number; depth: number; enabled: boolean },
) {
  const [lines, setLines] = useState<EngineLine[]>([])
  const [analyzing, setAnalyzing] = useState(false)

  // L'analisi riparte solo quando cambia davvero la posizione (partenza o
  // mosse), non a ogni nuovo oggetto creato dal chiamante a ogni render.
  const fen = position?.fen ?? null
  const moves = position?.moves.join(' ') ?? ''

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
      { fen, moves: moves ? moves.split(' ') : [] },
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
  }, [fen, moves, options.multiPv, options.depth, options.enabled])

  return { lines, analyzing }
}
