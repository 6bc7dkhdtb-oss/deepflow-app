import { useState } from 'react'
import { formatTime } from '../../data/trainingPlan'

const SESSION_TYPES = [
  { id: 'CO2',   label: 'CO₂-Tabelle',       sub: 'Toleranz-Training',  color: 'blue'   },
  { id: 'O2',    label: 'O₂-Tabelle',         sub: 'Kapazitäts-Training', color: 'teal'   },
  { id: 'MUSKEL',label: 'Atemmuskeltraining', sub: 'Kraftblock',          color: 'purple' },
]

const TYPE_STYLES = {
  blue:   { active: 'bg-blue-600/30 border-blue-500 text-blue-300',   inactive: 'bg-slate-800/50 border-slate-700/50 text-slate-400' },
  teal:   { active: 'bg-teal-600/30 border-teal-500 text-teal-300',   inactive: 'bg-slate-800/50 border-slate-700/50 text-slate-400' },
  purple: { active: 'bg-purple-600/30 border-purple-500 text-purple-300', inactive: 'bg-slate-800/50 border-slate-700/50 text-slate-400' },
}

export default function AddSession({ onSave, onCancel, suggestedType }) {
  const [type, setType] = useState(suggestedType || 'CO2')
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [notes, setNotes] = useState('')
  const [rounds, setRounds] = useState([])
  const [showRounds, setShowRounds] = useState(false)
  const [roundInput, setRoundInput] = useState({ min: '', sec: '' })

  const isApnoe = type === 'CO2' || type === 'O2'
  const maxHoldSeconds = (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0)
  const canSave = isApnoe ? maxHoldSeconds >= 10 : true

  const addRound = () => {
    const sec = (parseInt(roundInput.min) || 0) * 60 + (parseInt(roundInput.sec) || 0)
    if (sec > 0) {
      setRounds(prev => [...prev, sec])
      setRoundInput({ min: '', sec: '' })
    }
  }

  const handleSave = () => {
    if (!canSave) return
    onSave({
      date: new Date().toISOString(),
      type,
      maxHold: isApnoe ? maxHoldSeconds : 0,
      rounds: isApnoe ? rounds : [],
      notes,
    })
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end">
      <div className="w-full max-w-lg mx-auto bg-[#0a1526] rounded-t-3xl border-t border-slate-700/50 p-6 pb-24 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Session eintragen</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Type selector */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Art der Session</p>
          <div className="grid grid-cols-3 gap-2">
            {SESSION_TYPES.map(t => {
              const styles = TYPE_STYLES[t.color]
              return (
                <button
                  key={t.id}
                  onClick={() => { setType(t.id); setMinutes(''); setSeconds(''); setRounds([]) }}
                  className={`py-3 px-2 rounded-xl border text-xs font-medium transition-all ${
                    type === t.id ? styles.active : styles.inactive
                  }`}
                >
                  <div className="font-bold text-sm">{t.label}</div>
                  <div className="opacity-70 mt-0.5">{t.sub}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Max hold time — only for apnoe types */}
        {isApnoe && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Maximale Haltezeit</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={minutes}
                  onChange={e => setMinutes(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-xl font-bold text-white text-center focus:outline-none focus:border-blue-500/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">Min</span>
              </div>
              <span className="text-2xl text-slate-500 font-light">:</span>
              <div className="flex-1 relative">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={e => setSeconds(e.target.value)}
                  placeholder="00"
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-xl font-bold text-white text-center focus:outline-none focus:border-blue-500/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">Sek</span>
              </div>
            </div>
            {maxHoldSeconds > 0 && (
              <p className="text-center text-sm text-blue-300 mt-2">= {formatTime(maxHoldSeconds)}</p>
            )}
          </div>
        )}

        {/* Atemmuskeltraining completion hint */}
        {!isApnoe && (
          <div className="rounded-xl border border-purple-800/30 bg-purple-900/10 p-3.5">
            <p className="text-xs text-purple-300 font-medium mb-1">Atemmuskeltraining abgeschlossen</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              3 Stufen mit Relaxator/Strohhalm: Grundspannung → Atemkontrolle → Belastung.
              Füge optional eine Notiz hinzu.
            </p>
          </div>
        )}

        {/* Individual rounds (apnoe only) */}
        {isApnoe && (
          <div>
            <button
              onClick={() => setShowRounds(s => !s)}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={`w-3.5 h-3.5 transition-transform ${showRounds ? 'rotate-90' : ''}`}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
              Einzelne Runden eintragen (optional)
            </button>
            {showRounds && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-2 items-center">
                  <input
                    type="number" placeholder="Min" value={roundInput.min}
                    onChange={e => setRoundInput(r => ({ ...r, min: e.target.value }))}
                    className="w-16 bg-slate-800/60 border border-slate-700/50 rounded-lg px-2 py-2 text-sm text-white text-center focus:outline-none"
                  />
                  <span className="text-slate-500">:</span>
                  <input
                    type="number" placeholder="Sek" value={roundInput.sec}
                    onChange={e => setRoundInput(r => ({ ...r, sec: e.target.value }))}
                    className="w-16 bg-slate-800/60 border border-slate-700/50 rounded-lg px-2 py-2 text-sm text-white text-center focus:outline-none"
                  />
                  <button
                    onClick={addRound}
                    className="flex-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg py-2 text-xs text-slate-300 transition-colors"
                  >
                    + Hinzufügen
                  </button>
                </div>
                {rounds.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {rounds.map((r, i) => (
                      <span key={i} className="flex items-center gap-1 text-xs bg-slate-700/50 border border-slate-600/40 px-2.5 py-1 rounded-full text-slate-300">
                        R{i + 1}: {formatTime(r)}
                        <button onClick={() => setRounds(prev => prev.filter((_, j) => j !== i))} className="text-slate-500 hover:text-slate-200 ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Notizen (optional)</p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Wie war die Session? Wie hast du dich gefühlt?"
            rows={2}
            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold transition-colors"
        >
          Session speichern
        </button>
      </div>
    </div>
  )
}
