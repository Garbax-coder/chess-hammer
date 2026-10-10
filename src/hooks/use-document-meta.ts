import { useEffect } from 'react'
import type { PageMeta } from '@/lib/seo'

const DEFAULT_TITLE = 'Chess Hammer — Trainer'
const MANAGED = 'data-page-meta'

// Allinea <head> alla pagina pubblica mostrata durante la navigazione nel
// browser. L'HTML pre-generato li contiene gia': qui si sostituiscono (mai
// duplicati) e all'uscita verso le pagine dell'app si tolgono.
export function useDocumentMeta(meta: PageMeta) {
  useEffect(() => {
    const head = document.head
    head
      .querySelectorAll(
        'meta[name="description"], link[rel="canonical"], link[rel="alternate"][hreflang], meta[property^="og:"], meta[name^="twitter:"], script[type="application/ld+json"]',
      )
      .forEach((el) => el.remove())

    const add = (tag: string, attrs: Record<string, string>, text?: string) => {
      const el = document.createElement(tag)
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
      el.setAttribute(MANAGED, '')
      if (text) el.textContent = text
      head.appendChild(el)
    }

    document.title = meta.title
    document.documentElement.lang = meta.lang
    add('meta', { name: 'description', content: meta.description })
    add('link', { rel: 'canonical', href: meta.canonical })
    for (const a of meta.alternates)
      add('link', { rel: 'alternate', hreflang: a.hreflang, href: a.href })
    add('meta', { property: 'og:title', content: meta.title })
    add('meta', { property: 'og:description', content: meta.description })
    add('meta', { property: 'og:url', content: meta.canonical })
    add('meta', { property: 'og:image', content: meta.ogImage })
    for (const data of meta.jsonLd) {
      add('script', { type: 'application/ld+json' }, JSON.stringify(data))
    }

    return () => {
      head.querySelectorAll(`[${MANAGED}]`).forEach((el) => el.remove())
      document.title = DEFAULT_TITLE
    }
  }, [meta])
}
