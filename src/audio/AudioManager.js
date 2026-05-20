let audioCtx = null

export function initAudio() {
  if (audioCtx) return
  audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  const buf = audioCtx.createBuffer(1, 1, 22050)
  const src = audioCtx.createBufferSource()
  src.buffer = buf
  src.connect(audioCtx.destination)
  src.start(0)
  console.log('audioCtx state:', audioCtx.state)
  try { localStorage.setItem('deepflow_audio_activated', 'true') } catch {}
}

function scheduleTone(frequency, duration, volume, delay = 0) {
  if (!audioCtx) return
  try {
    const t = audioCtx.currentTime + delay
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(volume, t + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
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
  }
  if (map[type]) scheduleTone(...map[type])
}

export function playEndTone() {
  [[880, 0.4, 0.35], [660, 0.4, 0.35], [440, 0.4, 0.35]].forEach(([f, d, v], i) => {
    scheduleTone(f, d, v, i * 0.5)
  })
}

export function playTestTone() {
  [[440, 0.38, 0.28], [554, 0.38, 0.28], [659, 0.38, 0.28]].forEach(([f, d, v], i) => {
    scheduleTone(f, d, v, i * 0.22)
  })
}

export function isAudioActivated() {
  try { return localStorage.getItem('deepflow_audio_activated') === 'true' } catch { return false }
}
