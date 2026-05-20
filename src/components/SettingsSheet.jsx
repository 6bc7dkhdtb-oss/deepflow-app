import { useState } from 'react'
import { AudioManager } from '../audio/AudioManager'

export default function SettingsSheet({ onClose }) {
  const [audioStatus, setAudioStatus] = useState(
    AudioManager.isActivated() ? 'active' : 'inactive'
  )
  const [testState, setTestState] = useState('idle') // 'idle' | 'playing'

  // SYNCHRONOUS – must be direct click handler for iOS
  const handleTestTone = () => {
    AudioManager.playTestTone()
    setTestState('playing')
    setTimeout(() => setTestState('idle'), 900)
  }

  // SYNCHRONOUS – re-activate if somehow reset
  const handleReactivate = () => {
    const ok = AudioManager.activate()
    if (ok) setAudioStatus('active')
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-auto bg-[#0a1526] rounded-t-3xl border-t border-slate-700/50 p-6 pb-10 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Einstellungen</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Audio section */}
        <div className="space-y-3">
          <p className="text-xs text-slate-500 uppercase tracking-widest">Audio</p>

          {/* Status */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 px-4 py-3.5 flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${audioStatus === 'active' ? 'bg-teal-400' : 'bg-red-400'}`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-200">Atemtöne</p>
              <p className="text-xs text-slate-500">
                {audioStatus === 'active' ? 'Aktiviert – Tonsignale sind eingeschaltet' : 'Nicht aktiviert'}
              </p>
            </div>
          </div>

          {/* Test tone button — synchronous click handler required */}
          <button
            onClick={handleTestTone}
            disabled={audioStatus !== 'active'}
            className="w-full py-3.5 rounded-xl border border-blue-700/40 bg-blue-950/30 text-blue-300 text-sm font-medium hover:bg-blue-900/30 active:bg-blue-950/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2.5"
          >
            {testState === 'playing' ? (
              <>
                <span className="flex gap-0.5">
                  {[2,4,6,4,2].map((h,i) => (
                    <span key={i} className="w-1 rounded-full bg-blue-400 animate-pulse"
                      style={{ height: `${h * 3}px` }} />
                  ))}
                </span>
                Töne spielen…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                Ton testen
              </>
            )}
          </button>

          {/* Re-activate */}
          {audioStatus !== 'active' && (
            <button
              onClick={handleReactivate}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              🔊 Ton jetzt aktivieren
            </button>
          )}
        </div>

        {/* App info */}
        <div className="space-y-2 pt-2 border-t border-slate-700/30">
          <p className="text-xs text-slate-500 uppercase tracking-widest">Info</p>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Deepflow</span>
            <span>v0.1.0 · nach Tom Sietas</span>
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>Daten</span>
            <span>Lokal gespeichert (localStorage)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
