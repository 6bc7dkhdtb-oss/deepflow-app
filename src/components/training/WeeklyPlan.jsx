import { useState } from 'react'
import { formatTime, getTodayIndex, TRAINING_OPTIONS } from '../../data/trainingPlan'

const STEP_COLORS = {
  indigo: { bg: 'bg-indigo-500/15', border: 'border-indigo-500/30', text: 'text-indigo-300', dot: 'bg-indigo-400', badge: 'bg-indigo-500/20 text-indigo-300' },
  cyan:   { bg: 'bg-cyan-500/15',   border: 'border-cyan-500/30',   text: 'text-cyan-300',   dot: 'bg-cyan-400',   badge: 'bg-cyan-500/20 text-cyan-300'   },
  purple: { bg: 'bg-purple-500/15', border: 'border-purple-500/30', text: 'text-purple-300', dot: 'bg-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
  blue:   { bg: 'bg-blue-500/15',   border: 'border-blue-500/30',   text: 'text-blue-300',   dot: 'bg-blue-400',   badge: 'bg-blue-500/20 text-blue-300'   },
  teal:   { bg: 'bg-teal-500/15',   border: 'border-teal-500/30',   text: 'text-teal-300',   dot: 'bg-teal-400',   badge: 'bg-teal-500/20 text-teal-300'   },
}

function TableRows({ table }) {
  return (
    <div className="mt-2 rounded-lg overflow-hidden border border-slate-700/40">
      {table.rounds.map((round, i) => (
        <div key={i} className={`flex items-center gap-3 px-3 py-2 ${i < table.rounds.length - 1 ? 'border-b border-slate-700/30' : ''}`}>
          <span className="w-5 h-5 rounded-full bg-slate-700/70 flex items-center justify-center text-xs text-slate-400 flex-shrink-0">
            {round.round}
          </span>
          <div className="flex-1 flex items-center gap-3 text-xs">
            <span className="text-white font-semibold tabular-nums">{formatTime(round.hold)}</span>
            <span className="text-slate-600">halten</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 text-slate-600">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <span className="text-slate-400 tabular-nums">{formatTime(round.rest)}</span>
            <span className="text-slate-600">Pause</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function SessionStep({ step, index, isLast }) {
  const [tableOpen, setTableOpen] = useState(false)
  const c = STEP_COLORS[step.color] || STEP_COLORS.blue

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${c.bg} ${c.text} border ${c.border}`}>
          {index + 1}
        </div>
        {!isLast && <div className="w-px flex-1 mt-1.5 mb-0.5 bg-slate-700/50" />}
      </div>

      <div className={`flex-1 min-w-0 pb-${isLast ? '0' : '3'}`}>
        <div className={`rounded-xl border ${c.border} ${c.bg} p-3`}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-sm font-semibold ${c.text}`}>{step.name}</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">{step.description}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>
                {step.duration}
              </span>
              <span className="text-xs text-slate-500">{step.role}</span>
            </div>
          </div>

          {step.table && (
            <button
              onClick={() => setTableOpen(o => !o)}
              className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={`w-3.5 h-3.5 transition-transform ${tableOpen ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
              {tableOpen ? 'Tabelle ausblenden' : `${step.table.rounds.length} Runden anzeigen`}
            </button>
          )}
          {step.table && tableOpen && <TableRows table={step.table} />}
        </div>
        {!isLast && <div className="h-1.5" />}
      </div>
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

function DayCard({ dayEntry, isToday, defaultOpen, onSwap }) {
  const [open, setOpen] = useState(defaultOpen)
  const [showSwap, setShowSwap] = useState(false)
  const { session, label, dayName, type, isOverride } = dayEntry

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
          <SwapPicker
            currentType={type}
            onPick={onSwap}
            onClose={() => setShowSwap(false)}
          />
        )}
      </div>
    )
  }

  if (dayEntry.isFlex && !session) {
    return (
      <div className={`rounded-xl border ${isToday ? 'border-blue-600/50' : 'border-slate-700/30 bg-slate-800/20'} px-4 py-3 space-y-2`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-700/40 flex items-center justify-center">
            <span className="text-sm font-bold text-slate-300">{label}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-300 font-medium">Flex-Tag</p>
            <p className="text-xs text-slate-500">{dayName} · freie Wahl</p>
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
    CO2:   { header: 'bg-blue-600',   dot: 'bg-blue-400',   label: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    O2:    { header: 'bg-teal-600',   dot: 'bg-teal-400',   label: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
    MUSKEL:{ header: 'bg-purple-700', dot: 'bg-purple-400', label: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    FLEX:  { header: 'bg-slate-600',  dot: 'bg-slate-400',  label: 'bg-slate-600/30 text-slate-300 border-slate-500/30' },
  }
  const tc = typeColors[type] || typeColors.CO2

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
            <p className="text-sm font-semibold text-white">{session.label}</p>
            {isToday && (
              <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded-full">Heute</span>
            )}
            {isOverride && (
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-full">Geändert</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{dayName} · {session.totalDuration}</p>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`w-4 h-4 text-slate-500 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-slate-700/30 pt-3 space-y-3">
          {session.steps.map((step, i) => (
            <SessionStep
              key={step.id}
              step={step}
              index={i}
              isLast={i === session.steps.length - 1}
            />
          ))}
          <button
            onClick={() => setShowSwap(s => !s)}
            className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-2 border border-dashed border-slate-700/50 rounded-lg hover:border-slate-600"
          >
            {showSwap ? 'Auswahl abbrechen' : 'Anderes Training für diesen Tag'}
          </button>
          {showSwap && (
            <SwapPicker
              currentType={type}
              onPick={onSwap}
              onClose={() => setShowSwap(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default function WeeklyPlan({ weekPlan, onSwap }) {
  const todayIdx = getTodayIndex()

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-2 pb-1">
        {[
          { color: 'indigo', label: 'Zwerchfell' },
          { color: 'cyan',   label: 'Brustkorbdehnung' },
          { color: 'purple', label: 'Atemmuskel' },
          { color: 'blue',   label: 'CO₂' },
          { color: 'teal',   label: 'O₂' },
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
        />
      ))}
    </div>
  )
}
