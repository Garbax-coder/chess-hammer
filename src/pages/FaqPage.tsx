import { useOpeningsTranslations } from '@/lib/i18n/openings'
import { useTranslations } from '@/lib/language-context'

// Le domande sulla tattica (metodo Woodpecker), poi quelle sulle aperture.
export default function FaqPage() {
  const t = useTranslations()
  const o = useOpeningsTranslations()

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-foreground text-lg font-semibold tracking-tight">
          {t.faq.title}
        </h1>
        <p className="text-muted-foreground text-sm">{t.faq.intro}</p>
      </div>

      <FaqItems items={t.faq.items} />

      <h2
        id="openings"
        className="text-foreground scroll-mt-20 text-lg font-semibold tracking-tight"
      >
        {o.faqTitle}
      </h2>
      <FaqItems items={o.faqItems} />
    </main>
  )
}

function FaqItems({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="flex flex-col gap-6">
      {items.map((item) => (
        <div key={item.question} className="flex flex-col gap-1.5">
          <h3 className="text-foreground text-base font-medium">{item.question}</h3>
          {item.answer.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-muted-foreground text-sm whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      ))}
    </div>
  )
}
