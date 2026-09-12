import { useMemo, type CSSProperties } from 'react'

const PARTICLE_COUNT = 14
// Palette contenuta, non un arcobaleno da libreria confetti: qualche
// tonalità calda + l'accento primario, coerente con il resto della UI.
const COLORS = ['#f59e0b', '#f97316', '#ef4444', '#eab308', '#22c55e', '#3b82f6']

interface Particle {
  angle: number
  distance: number
  color: string
  delay: number
  size: number
}

/** Piccolo burst di particelle che si dissolve, mostrato quando un puzzle viene risolto. */
export function SolvedFireworks() {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      angle: (360 / PARTICLE_COUNT) * i + (Math.random() * 16 - 8),
      distance: 70 + Math.random() * 50,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 0.12,
      size: 5 + Math.random() * 3,
    }))
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute top-1/2 left-1/2 rounded-full"
          style={
            {
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              '--angle': `${p.angle}deg`,
              '--distance': `${p.distance}px`,
              animation: `firework-particle 900ms ease-out ${p.delay}s forwards`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
