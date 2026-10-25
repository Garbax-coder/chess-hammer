import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useOpeningProgress, useRepertoires } from '@/hooks/use-openings'
import { useOpeningsTranslations } from '@/lib/i18n/openings'
import { useTranslations } from '@/lib/language-context'
import {
  buildOpeningTree,
  type OpeningProgress,
  type OpeningTree,
} from '@/lib/opening-tree'
import type { RepertoireWithNodes } from '@/lib/openings'

export interface RepertoireData {
  repertoire: RepertoireWithNodes
  tree: OpeningTree
  progress: Map<number, OpeningProgress>
}

/**
 * Carica un repertorio (per slug) con i progressi dell'utente e lo passa alla
 * pagina solo quando c'e' tutto: le pagine di allenamento, studio e
 * consultazione non devono gestire caricamento e repertorio inesistente.
 */
export function RepertoireGate({
  slug,
  allowEmpty = false,
  children,
}: {
  slug: string | undefined
  /** Anche un repertorio senza mosse (la consultazione, dove lo si modifica). */
  allowEmpty?: boolean
  children: (data: RepertoireData) => ReactNode
}) {
  const t = useTranslations()
  const o = useOpeningsTranslations()
  const { data: repertoires, isLoading } = useRepertoires()
  const { data: progress } = useOpeningProgress()
  const repertoire = repertoires?.find((r) => r.slug === slug)
  const tree = useMemo(
    () => (repertoire ? buildOpeningTree(repertoire.nodes) : undefined),
    [repertoire],
  )

  if (isLoading || !repertoires || !progress) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground text-sm">{t.common.loading}</p>
      </main>
    )
  }
  if (!repertoire || !tree || (!allowEmpty && tree.leaves.length === 0)) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground text-sm">{o.notFound}</p>
        <Link
          to="/openings"
          className="text-primary text-sm underline-offset-4 hover:underline"
        >
          {o.back}
        </Link>
      </main>
    )
  }
  return children({ repertoire, tree, progress })
}
