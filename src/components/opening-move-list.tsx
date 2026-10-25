import type { OpeningNode } from '@/lib/opening-tree'

/** Le mosse gia' giocate del Run, numerate; quelle dell'utente col loro esito. */
export function MoveList({
  nodes,
  results = [],
}: {
  nodes: OpeningNode[]
  /** Esito del primo tentativo delle mosse dell'utente (allenamento). */
  results?: { nodeId: number; ok: boolean }[]
}) {
  if (nodes.length === 0) return <p className="text-muted-foreground text-xs">—</p>
  return (
    <ol className="flex flex-wrap gap-x-1.5 gap-y-1 text-xs tabular-nums">
      {nodes.map((node) => {
        const result = results.find((r) => r.nodeId === node.id)
        return (
          <li key={node.id} className="flex items-baseline gap-1">
            {node.ply % 2 === 1 && (
              <span className="text-muted-foreground">{(node.ply + 1) / 2}.</span>
            )}
            <span
              className={
                result
                  ? result.ok
                    ? 'font-medium text-emerald-600 dark:text-emerald-400'
                    : 'text-destructive font-medium'
                  : 'text-foreground'
              }
            >
              {node.san}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
