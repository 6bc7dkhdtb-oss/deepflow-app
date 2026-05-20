import { useCallback } from 'react'

// Module-level singleton: survives component remounts, gets unlocked once per session
let _ctx = null
let _unlocked = false

function getCtx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return _ctx
}

// Must be called directly inside a click/touchstart handler.
// iOS Safari only allows resume() inside a synchronous user gesture.
// Returns a Promise that resolves once the context is running.
export async function unlockAudioContext() {
  const ctx = getCtx()

  if (ctx.state === 'running') {
    _unlocked = true
    return
  }

  // Call resume() — iOS processes this synchronously within the gesture,
  // even though the returned Promise resolves asynchronously.
  await ctx.resume()

  // iOS Safari quirk: play a silent 1ms tone immediately after resume()
  // to fully activate the audio graph before real sounds are scheduled.
  if (!_unlocked) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.001)
    _unlocked = true
  }
}

export function useAudio() {
  const playTone = useCallback((frequency, duration, type = 'sine', volume = 0.3) => {
    try {
      const ctx = getCtx()

      // If context got suspended (e.g. app backgrounded), try a silent resume.
      // This won't produce sound if there's no gesture, but prevents errors.
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
        return
      }

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02)
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration + 0.05)
    } catch {
      // Audio unavailable (e.g. SSR, sandboxed iframe)
    }
  }, [])

  const playPhaseSound = useCallback((phaseType) => {
    switch (phaseType) {
      case 'in':    playTone(528, 0.25, 'sine', 0.25); break
      case 'out':   playTone(396, 0.35, 'sine', 0.2);  break
      case 'hold':  playTone(440, 0.15, 'sine', 0.15); break
      case 'pause': playTone(330, 0.3,  'sine', 0.15); break
    }
  }, [playTone])

  return { playPhaseSound, playTone }
}
