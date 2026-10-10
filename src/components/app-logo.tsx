import { useId } from 'react'
import { appStyleById, type AppStyleId } from '@/lib/app-styles'

// Stessa geometria e stessi colori delle favicon in public/favicon-<stile>.svg:
// se cambiano qui, vanno aggiornate anche quelle.
export function AppLogo({
  styleId,
  className,
  title,
}: {
  styleId: AppStyleId
  className?: string
  title?: string
}) {
  const { lightSquare, darkSquare, hammer } = appStyleById(styleId).logo
  const clipId = useId()

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <clipPath id={clipId}>
        <rect width="120" height="120" rx="26" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width="60" height="60" fill={lightSquare} />
        <rect x="60" y="0" width="60" height="60" fill={darkSquare} />
        <rect x="0" y="60" width="60" height="60" fill={darkSquare} />
        <rect x="60" y="60" width="60" height="60" fill={lightSquare} />
      </g>
      <g
        transform="translate(9.28 5.07) rotate(-30 60 60)"
        fill={hammer}
        stroke={hammer}
        strokeWidth="1"
        strokeLinejoin="round"
      >
        <path d="M32 50 L32 17 L43.33 17 L43.33 28 L54.33 28 L54.33 17 L65.67 17 L65.67 28 L76.67 28 L76.67 17 L88 17 L88 50 Z" />
        <rect x="54" y="48" width="12" height="56" rx="4" />
      </g>
    </svg>
  )
}
