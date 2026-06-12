import { useState } from 'react'
import { getTodayIndex, TRAINING_OPTIONS } from '../../data/trainingPlan'
import { getTraining } from '../../data/trainingModules'

const STEP_COLORS = {
  indigo: { dot: 'bg-indigo-400' },
  cyan:   { dot: 'bg-cyan-400' },
  purple: { dot: 'bg-purple-400' },
  blue:   { dot: 'bg-blue-400' },
  teal:   { dot: 'bg-teal-400' },
}

function TrainingDetail({ training, onStart }) {
  if (!training) return null
  const dot = STEP_COLORS[training.color]?.dot || 'bg-slate-400'
  return (
    <div className="space-y-2.5">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-indigo-400" />
          <p className="text-xs text-slate-300">Aufwärmen · Zwerchfellatmung</p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-cyan-400" />
          <p className="text-xs text-slate-300">Aufwärmen · Brustkorbdehnung <span className="text-slate-500">(Stufe wählbar)</span></p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
          <p className="text-xs text-slate-200 font-medium">{training.name}</p>
        </div>
      </div>

      {training.levels && (
        <div className="flex flex-wrap gap-1.5 pl-4">
          {training.levels.map(l => (
            <span key={l.id} className="text-[10px] bg-slate-700/50 border border-slate-600/30 px-2 py-0.5 rounded-full text-slate-400">
              {l.name.replace(/ – .*/, '')}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={() => onStart?.(training.id)}
        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M5 3l14 9-14 9V3z"/></svg>
        Training starten
      </button>
    </div>
  )
}

function SwapPicker({ currentType, onPick, onClose }) {
  return (
    <div className="rounded-xl border border-slate-600/50 bg-slate-900/60 p-3 space-y-2">
      <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Anderes Training wählen</p>
      <div className="grid gap-1.5">
        {TRAINING_OPTIONS.map(opt => {
          const active = opt.type === currentType
          return (
            <button
              key={opt.type}
              onClick={() => { onPick(opt.type); onClose() }}
              className={`text-left p-2.5 rounded-lg border transition-all ${
                active
                  ? 'border-blue-500/60 bg-blue-500/15 text-blue-200'
                  : 'border-slate-700/40 bg-slate-800/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{opt.label}</span>
                {active && <span className="text-xs text-blue-400">✓ aktuell</span>}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{opt.description}</p>
            </button>
          )
        })}
        <button
          onClick={() => { onPick(null); onClose() }}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors py-1.5"
        >
          Standard wiederherstellen
        </button>
      </div>
    </div>
  )
}

function DayCard({ dayEntry, isToday, defaultOpen, onSwap, onStart }) {
  const [open, setOpen] = useState(defaultOpen)
  const [showSwap, setShowSwap] = useState(false)
  const { label, dayName, type, isOverride, trainingId } = dayEntry
  const training = trainingId ? getTraining(trainingId) : null

  if (dayEntry.isRest) {
    return (
      <div className={`rounded-xl border ${isToday ? 'border-slate-500/50 bg-slate-700/20' : 'border-slate-700/30 bg-slate-800/20'} px-4 py-3 space-y-2`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isToday ? 'bg-slate-600/40' : 'bg-slate-700/30'}`}>
            <span className="text-sm font-bold text-slate-400">{label}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-400 font-medium">Ruhetag</p>
            <p className="text-xs text-slate-600">{dayName} · Erholung</p>
          </div>
          {isToday && <span className="text-xs bg-slate-600/40 text-slate-300 px-2 py-0.5 rounded-full">Heute</span>}
        </div>
        <button
          onClick={() => setShowSwap(s => !s)}
          className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-1.5 border border-dashed border-slate-700/40 rounded-lg hover:border-slate-600"
        >
          + Training für diesen Tag hinzufügen
        </button>
        {showSwap && (
          <SwapPicker currentType={type} onPick={onSwap} onClose={() => setShowSwap(false)} />
        )}
      </div>
    )
  }

  if (dayEntry.isFlex) {
    return (
      <div className={`rounded-xl border ${isToday ? 'border-blue-600/50' : 'border-slate-700/30 bg-slate-800/20'} px-4 py-3 space-y-2`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-700/40 flex items-center justify-center">
            <span className="text-sm font-bold text-slate-300">{label}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-300 font-medium">Flex-Tag</p>
            <p className="text-xs text-slate-500">{dayName} · freie Wahl (Toolbox)</p>
          </div>
          {isToday && <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">Heute</span>}
        </div>
        <button
          onClick={() => setShowSwap(s => !s)}
          className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-1.5 border border-dashed border-slate-700/40 rounded-lg hover:border-slate-600"
        >
          Training wählen
        </button>
        {showSwap && (
          <SwapPicker currentType={type} onPick={onSwap} onClose={() => setShowSwap(false)} />
        )}
      </div>
    )
  }

  const typeColors = {
    GRUND: { header: 'bg-blue-600',   },
    CO2:   { header: 'bg-blue-600',   },
    O2:    { header: 'bg-teal-600',   },
    MUSKEL:{ header: 'bg-purple-700', },
  }
  const tc = typeColors[type] || typeColors.GRUND

  const borderClass = isToday
    ? 'border-blue-600/50'
    : isOverride
    ? 'border-amber-500/40'
    : 'border-slate-700/40'

  return (
    <div className={`rounded-xl border ${borderClass} bg-slate-800/40 overflow-hidden`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3"
      >
        <div className={`w-9 h-9 rounded-lg ${tc.header} flex items-center justify-center flex-shrink-0`}>
          <span className="text-xs font-bold text-white">{label}</span>
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-white">{training?.name || type}</p>
            {isToday && (
              <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded-full">Heute</span>
            )}
            {isOverride && (
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-full">Geändert</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{dayName} · {training?.durationLabel || ''}</p>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`w-4 h-4 text-slate-500 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-slate-700/30 pt-3 space-y-3">
          <TrainingDetail training={training} onStart={onStart} />
          <button
            onClick={() => setShowSwap(s => !s)}
            className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-2 border border-dashed border-slate-700/50 rounded-lg hover:border-slate-600"
          >
            {showSwap ? 'Auswahl abbrechen' : 'Anderes Training für diesen Tag'}
          </button>
          {showSwap && (
            <SwapPicker currentType={type} onPick={onSwap} onClose={() => setShowSwap(false)} />
          )}
        </div>
      )}
    </div>
  )
}

export default function WeeklyPlan({ weekPlan, onSwap, onStart }) {
  const todayIdx = getTodayIndex()

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-2 pb-1">
        {[
          { color: 'indigo', label: 'Zwerchfell' },
          { color: 'cyan',   label: 'Brustkorbdehnung' },
          { color: 'blue',   label: 'Grundlagen / CO₂' },
          { color: 'teal',   label: 'O₂' },
          { color: 'purple', label: 'Atemmuskel' },
        ].map(item => (
          <span key={item.label} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className={`w-2 h-2 rounded-full ${STEP_COLORS[item.color].dot}`} />
            {item.label}
          </span>
        ))}
      </div>

      {weekPlan.map((day) => (
        <DayCard
          key={day.dayIndex}
          dayEntry={day}
          isToday={day.dayIndex === todayIdx}
          defaultOpen={day.dayIndex === todayIdx}
          onSwap={(newType) => onSwap?.(day.dayIndex, newType)}
          onStart={onStart}
        />
      ))}
    </div>
  )
}
