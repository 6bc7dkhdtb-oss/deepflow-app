// AudioContext is created synchronously in AudioActivationBanner's onClick
// and stored in window._audioCtx. AudioManager reads from there.
// iOS Safari rule: new AudioContext() in a user gesture starts as 'running' —
// no resume() needed. Don't pre-create a context outside a gesture.

const STORAGE_KEY = 'deepflow_audio_activated'

function getCtx() {
  return window._audioCtx || null
}

function tone(frequency, duration, volume = 0.25) {
  const ctx = getCtx()
  if (!ctx || ctx.state === 'closed') return
  try {
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(volume, t + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + duration + 0.02)
  } catch {}
}

export const AudioManager = {
  isActivated() {
    try { return localStorage.getItem(STORAGE_KEY) === 'true' } catch { return false }
  },

  // Called from SettingsSheet "Ton testen" button — must be a direct click handler.
  playTestTone() {
    const ctx = getCtx()
    if (!ctx || ctx.state === 'closed') return
    const t = ctx.currentTime
    const freqs = [440, 554, 659]
    freqs.forEach((f, i) => {
      try {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = f
        gain.gain.setValueAtTime(0, t + i * 0.22)
        gain.gain.linearRampToValueAtTime(0.28, t + i * 0.22 + 0.015)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.22 + 0.38)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(t + i * 0.22)
        osc.stop(t + i * 0.22 + 0.4)
      } catch {}
    })
  },

  playPhaseSound(type) {
    const map = {
      in:    [528, 0.30, 0.22],
      out:   [396, 0.38, 0.18],
      hold:  [440, 0.18, 0.14],
      pause: [330, 0.28, 0.13],
    }
    if (map[type]) tone(...map[type])
  },

  tryResume() {
    const ctx = getCtx()
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
  },
}

// Android: resume automatically when page comes back to foreground
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') AudioManager.tryResume()
  })
}
