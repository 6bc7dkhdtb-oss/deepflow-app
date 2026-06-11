// ─────────────────────────────────────────────────────────────────────────────
// AudioManager – single shared AudioContext + iOS unlock helpers.
//
// iOS / Safari constraints we work around:
//   • AudioContext starts suspended → needs `resume()` from a direct touchend
//     / click handler (not inside a setInterval or async callback).
//   • Silent / mute switch on iPhone silences WebAudio output unless the
//     page is treated as a media playback context. We pre-arm a silent
//     HTMLAudioElement on the same user gesture so the AudioContext follows
//     the media-volume channel afterwards.
//   • Background → foreground transitions can re-suspend the context.
//     We listen to visibility/pageshow/focus and try to resume.
// ─────────────────────────────────────────────────────────────────────────────

let audioCtx = null

function getCtx() {
  if (audioCtx) return audioCtx
  const Ctor = window.AudioContext || window.webkitAudioContext
  if (!Ctor) return null
  audioCtx = new Ctor()
  return audioCtx
}

export function getAudioCtx() {
  return audioCtx
}

// Call inside a direct user gesture (click/touchend).
// Unlocks WebAudio + arms a silent media element so future tones survive.
export function initAudio() {
  const ctx = getCtx()
  if (!ctx) return

  // Buffer-source warm-up (Safari unlock pattern)
  try {
    const buf = ctx.createBuffer(1, 1, 22050)
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.connect(ctx.destination)
    src.start(0)
  } catch {}

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }

  // Short audible "ping" inside the same user gesture proves the unlock
  // worked and primes the audio output device on iOS.
  try {
    const t = ctx.currentTime + 0.02
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 660
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.28)
  } catch {}

  try { localStorage.setItem('deepflow_audio_activated', 'true') } catch {}
}

export function resumeAudio() {
  const ctx = getCtx()
  if (!ctx) return Promise.resolve()
  if (ctx.state === 'suspended') {
    return ctx.resume().catch(() => {})
  }
  return Promise.resolve()
}

export function isAudioSuspended() {
  return !!audioCtx && audioCtx.state === 'suspended'
}

export function isAudioActivated() {
  try { return localStorage.getItem('deepflow_audio_activated') === 'true' } catch { return false }
}

function scheduleTone(frequency, duration, volume, delay = 0) {
  const ctx = getCtx()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  try {
    const t = ctx.currentTime + delay
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

export function playTone(frequency, duration, volume = 0.25) {
  scheduleTone(frequency, duration, volume)
}

export function playPhaseSound(type) {
  const map = {
    in:    [528, 0.30, 0.22],
    out:   [396, 0.38, 0.18],
    hold:  [440, 0.18, 0.14],
    pause: [330, 0.28, 0.13],
    extra: [659, 0.18, 0.18], // for zyklische Vollatmung Extra-Atemzug
  }
  if (map[type]) scheduleTone(...map[type])
}

export function playStepCue() {
  // Two-tone "next" cue used between training steps
  scheduleTone(659, 0.22, 0.28, 0)
  scheduleTone(880, 0.26, 0.28, 0.18)
}

export function playRoundCue(type = 'hold') {
  // hold → high, rest → mid
  if (type === 'hold') scheduleTone(660, 0.22, 0.3, 0)
  else if (type === 'rest') scheduleTone(440, 0.22, 0.28, 0)
  else if (type === 'done') {
    scheduleTone(880, 0.4, 0.32, 0)
    scheduleTone(880, 0.4, 0.32, 0.5)
  }
}

export function playEndTone() {
  ;[[880, 0.4, 0.35], [660, 0.4, 0.35], [440, 0.4, 0.35]].forEach(([f, d, v], i) => {
    scheduleTone(f, d, v, i * 0.5)
  })
}

export function playTestTone() {
  ;[[440, 0.38, 0.28], [554, 0.38, 0.28], [659, 0.38, 0.28]].forEach(([f, d, v], i) => {
    scheduleTone(f, d, v, i * 0.22)
  })
}

// Auto-resume when page comes back to foreground
if (typeof document !== 'undefined') {
  const tryResume = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {})
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') tryResume()
  })
  window.addEventListener('pageshow', tryResume)
  window.addEventListener('focus', tryResume)
  // Belt-and-braces: any touch resumes
  window.addEventListener('touchend', tryResume, { passive: true })
}
