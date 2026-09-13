import { useTranslations } from '@/lib/language-context'

export default function FaqPage() {
  const t = useTranslations()

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-foreground text-lg font-semibold tracking-tight">
          {t.faq.title}
        </h1>
        <p className="text-muted-foreground text-sm">{t.faq.intro}</p>
      </div>

      <div className="flex flex-col gap-6">
        {t.faq.items.map((item) => (
          <div key={item.question} className="flex flex-col gap-1.5">
            <h2 className="text-foreground text-base font-medium">{item.question}</h2>
            {item.answer.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-muted-foreground text-sm whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </div>
    </main>
  )
}
