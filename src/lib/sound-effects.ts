// Effetti sonori sintetizzati via Web Audio API (nessun asset esterno da
// caricare/licenziare). Il contesto audio viene creato/ripreso pigramente:
// i browser bloccano l'audio finche' non c'e' stata un'interazione
// dell'utente, quindi il primo suono (es. la mossa di apertura automatica
// del puzzle) potrebbe non sentirsi finche' l'utente non ha cliccato
// qualcosa: comportamento standard, non un bug.

let audioCtx: AudioContext | null = null
let soundEnabled = true

/** Attiva/disattiva globalmente gli effetti sonori (letto dalle funzioni play* qui sotto). */
export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled
}

function getContext(): AudioContext | null {
  if (!soundEnabled) return null
  if (typeof window === 'undefined') return null
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!audioCtx) {
    audioCtx = new Ctor()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

function tone(
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  options: { type?: OscillatorType; gain?: number } = {},
) {
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()
  osc.type = options.type ?? 'sine'
  osc.frequency.value = freq
  const peak = options.gain ?? 0.2
  gainNode.gain.setValueAtTime(0, start)
  gainNode.gain.linearRampToValueAtTime(peak, start + 0.005)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gainNode)
  gainNode.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

function noiseBurst(ctx: AudioContext, start: number, duration: number, gainPeak: number) {
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration))
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const gainNode = ctx.createGain()
  gainNode.gain.setValueAtTime(gainPeak, start)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  source.connect(gainNode)
  gainNode.connect(ctx.destination)
  source.start(start)
}

interface MoveSoundOptions {
  capture: boolean
  check: boolean
  checkmate: boolean
}

/** Suono per una mossa valida: scacco matto > scacco > cattura > mossa semplice. */
export function playMoveSound({ capture, check, checkmate }: MoveSoundOptions) {
  const ctx = getContext()
  if (!ctx) return
  const t = ctx.currentTime

  if (checkmate) {
    tone(ctx, 523.25, t, 0.16, { type: 'triangle', gain: 0.22 })
    tone(ctx, 659.25, t + 0.1, 0.16, { type: 'triangle', gain: 0.22 })
    tone(ctx, 783.99, t + 0.2, 0.3, { type: 'triangle', gain: 0.24 })
    return
  }
  if (check) {
    tone(ctx, 700, t, 0.09, { type: 'square', gain: 0.14 })
    tone(ctx, 920, t + 0.09, 0.13, { type: 'square', gain: 0.14 })
    return
  }
  if (capture) {
    noiseBurst(ctx, t, 0.05, 0.18)
    tone(ctx, 260, t, 0.09, { type: 'sine', gain: 0.2 })
    return
  }
  tone(ctx, 520, t, 0.08, { type: 'sine', gain: 0.18 })
}

/** Suono per una mossa non valida (es. non corrisponde alla soluzione del puzzle). */
export function playIllegalMoveSound() {
  const ctx = getContext()
  if (!ctx) return
  const t = ctx.currentTime
  tone(ctx, 200, t, 0.13, { type: 'sawtooth', gain: 0.14 })
  tone(ctx, 189, t, 0.13, { type: 'sawtooth', gain: 0.14 })
}
