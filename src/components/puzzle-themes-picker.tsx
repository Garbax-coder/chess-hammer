import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslations } from '@/lib/language-context'
import { ALL_PUZZLE_THEME_IDS, PUZZLE_THEME_CATEGORIES } from '@/lib/puzzle-themes'

export function PuzzleThemesPicker({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const t = useTranslations()
  const selectedSet = new Set(selected)

  function toggle(theme: string) {
    onChange(
      selectedSet.has(theme)
        ? selected.filter((id) => id !== theme)
        : [...selected, theme],
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{t.newSession.themesTitle}</CardTitle>
          <span className="text-muted-foreground text-xs">
            {t.newSession.themesSelectedCount(
              selected.length,
              ALL_PUZZLE_THEME_IDS.length,
            )}
          </span>
        </div>
        <CardDescription>{t.newSession.themesSubtitle}</CardDescription>
        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange([...ALL_PUZZLE_THEME_IDS])}
          >
            {t.newSession.themesSelectAll}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([])}>
            {t.newSession.themesDeselectAll}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {PUZZLE_THEME_CATEGORIES.map((category) => (
          <div key={category.id} className="flex flex-col gap-2">
            <span className="text-muted-foreground text-xs font-medium">
              {t.puzzleThemes.categories[category.id]}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {category.themes.map((theme) => {
                const isSelected = selectedSet.has(theme)
                return (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => toggle(theme)}
                    aria-pressed={isSelected}
                    className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'text-muted-foreground border-input hover:bg-muted'
                    }`}
                  >
                    {t.puzzleThemes.labels[theme]}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
