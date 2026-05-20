// iOS Safari rule: AudioContext must be created AND resume() called
// synchronously inside a click/touchend handler. No await, no setTimeout.
// Once activated, the context stays running for the entire session.

const STORAGE_KEY = 'deepflow_audio_activated'

let ctx = null

function tone(frequency, duration, volume = 0.25) {
  try {
    if (!ctx || ctx.state !== 'running') return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(frequency, t)
    // Soft attack, exponential decay
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

  // ── MUST be called synchronously inside a click/touchend handler ──
  // Creates the AudioContext and calls resume() in the same call stack.
  // iOS Safari only honours the user-gesture unlock within this window.
  activate() {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)()

      console.log('[AudioManager] ctx.state before resume():', ctx.state)
      ctx.resume()
      console.log('[AudioManager] ctx.state after resume():', ctx.state)

      // Play confirmation tone using the exact minimal pattern.
      // Do NOT go through _ready() / state check – on iOS the state is still
      // 'suspended' here even though the gesture unlock was registered.
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 440
      gain.gain.value = 0.3
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)

      localStorage.setItem(STORAGE_KEY, 'true')
      return true
    } catch (e) {
      console.error('[AudioManager] activate() error:', e)
      return false
    }
  },

  // Called from the Ton-Testen button – also requires a synchronous gesture.
  playTestTone() {
    if (!this._ready()) return
    // Three rising tones with small delays via Web Audio's own scheduler
    const t = ctx.currentTime
    const freqs = [440, 554, 659]
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, t + i * 0.22)
      gain.gain.setValueAtTime(0, t + i * 0.22)
      gain.gain.linearRampToValueAtTime(0.28, t + i * 0.22 + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.22 + 0.38)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t + i * 0.22)
      osc.stop(t + i * 0.22 + 0.4)
    })
  },

  playPing() {
    // Single clear confirmation tone (higher pitch, short decay)
    tone(660, 0.45, 0.3)
  },

  playPhaseSound(type) {
    if (!this._ready()) return
    const map = {
      in:    [528, 0.30, 0.22],
      out:   [396, 0.38, 0.18],
      hold:  [440, 0.18, 0.14],
      pause: [330, 0.28, 0.13],
    }
    if (map[type]) tone(...map[type])
  },

  // Re-resume after page-backgrounding (works on Android; on iOS requires gesture)
  tryResume() {
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
  },

  _ready() {
    if (!ctx) return false
    if (ctx.state === 'suspended') {
      // Non-gesture path: attempt resume (works Android, silent on iOS)
      ctx.resume().catch(() => {})
    }
    // Allow 'suspended' through — on iOS the gesture unlock is registered even
    // while state still reads 'suspended', so audio scheduled now will play.
    return ctx.state !== 'closed'
  },
}

// Android: resume automatically when page comes back to foreground
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') AudioManager.tryResume()
  })
}
