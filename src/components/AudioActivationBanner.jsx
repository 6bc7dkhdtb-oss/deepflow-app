import { useState, useRef, useEffect } from 'react'

export default function AudioActivationBanner({ onActivated }) {
  const [state, setState] = useState('idle') // 'idle' | 'success'
  const btnRef = useRef(null)
  const activatedRef = useRef(false)

  useEffect(() => {
    const btn = btnRef.current
    if (!btn) return

    const handler = () => {
      if (activatedRef.current) return
      activatedRef.current = true

      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      console.log('state after creation:', ctx.state)

      // iOS Safari hack: play a silent 1-sample buffer immediately.
      // This unlocks the context more reliably than resume() alone.
      const buf = ctx.createBuffer(1, 1, 22050)
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.connect(ctx.destination)
      src.start(0)
      console.log('state after silent buffer play:', ctx.state)

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      gain.gain.value = 0.3
      osc.frequency.value = 440
      osc.start()
      osc.stop(ctx.currentTime + 0.5)
      window._audioCtx = ctx

      try { localStorage.setItem('deepflow_audio_activated', 'true') } catch {}
      setState('success')
      setTimeout(onActivated, 900)
    }

    btn.addEventListener('touchstart', handler)
    return () => btn.removeEventListener('touchstart', handler)
  }, [onActivated])

  const handleSkip = () => {
    try { localStorage.setItem('deepflow_audio_activated', 'false') } catch {}
    onActivated()
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-5"
      style={{ background: 'rgba(2, 8, 24, 0.92)', backdropFilter: 'blur(12px)' }}>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-sm text-center space-y-7">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="w-10 h-10 text-blue-400">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Atemtöne aktivieren</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Der Atemrhythmus-Timer gibt Tonsignale für jede Phase.
            Tippe einmal auf den Button – iOS Safari benötigt eine
            direkte Berührung zum Aktivieren.
          </p>
        </div>

        {/* Mute switch warning */}
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300 leading-snug">
          📢 <span className="font-semibold">Stummschalter ausschalten</span> für Töne
        </div>

        {/* Activate button — ref required for native touchend listener */}
        {state === 'idle' ? (
          <button
            ref={btnRef}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-lg font-semibold transition-colors flex items-center justify-center gap-3"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-6 h-6">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            Ton aktivieren
          </button>
        ) : (
          <div className="w-full py-4 rounded-2xl bg-teal-600/30 border border-teal-500/50 text-teal-300 text-lg font-semibold flex items-center justify-center gap-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className="w-6 h-6">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Ton aktiv ✓
          </div>
        )}

        {/* Wave indicator */}
        {state === 'success' && (
          <div className="flex justify-center gap-1.5 animate-pulse">
            {[3, 5, 8, 5, 3].map((h, i) => (
              <div key={i} className="w-1.5 rounded-full bg-blue-400"
                style={{ height: `${h * 3}px` }} />
            ))}
          </div>
        )}

        {/* Skip */}
        {state === 'idle' && (
          <button
            onClick={handleSkip}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors py-1"
          >
            Ohne Ton fortfahren
          </button>
        )}
      </div>
    </div>
  )
}
