import { useState, useMemo } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import {
  formatTime,
  getWeeklyPlan,
  getNextSession,
  computeAdjustedBase,
  calculateStreak,
  getProgressPercent,
  getThisWeekCount,
  isApnoeSession,
  GOAL_SECONDS,
} from '../../data/trainingPlan'
import {
  GOALS,
  getModulesByGoal,
  buildModuleSession,
  getRecommendedModule,
} from '../../data/trainingModules'
import AddSession from './AddSession'
import WeeklyPlan from './WeeklyPlan'
import ActiveSession from './ActiveSession'

const INITIAL_BASE = 90 // 1:30 min
const WEEKLY_TARGET = 4

const STEP_DOT_COLORS = {
  indigo: 'bg-indigo-400',
  cyan:   'bg-cyan-400',
  purple: 'bg-purple-400',
  blue:   'bg-blue-400',
  teal:   'bg-teal-400',
  orange: 'bg-orange-400',
  pink:   'bg-pink-400',
}

const GOAL_DOT = { apnoe: 'bg-blue-400', hrv: 'bg-teal-400', brustkorb: 'bg-cyan-400', basis: 'bg-indigo-400' }
const LEGACY_DOT = { CO2: 'bg-blue-400', O2: 'bg-teal-400', MUSKEL: 'bg-purple-400', FLEX: 'bg-slate-400' }
const LEGACY_LABEL = { CO2: 'CO₂-Tabelle', O2: 'O₂-Tabelle', MUSKEL: 'Atemmuskeltraining', FLEX: 'Freies Training' }

function formatDate(isoStr) {
  return new Date(isoStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}
function sessionTypeLabel(s) {
  return s.label || LEGACY_LABEL[s.type] || s.type
}
function sessionDot(s) {
  return GOAL_DOT[s.goal] || LEGACY_DOT[s.type] || 'bg-slate-400'
}

function StatCard({ label, value, sub, color = 'blue', icon }) {
  const colors = {
    blue:   { bg: 'bg-blue-950/40',   border: 'border-blue-800/30',   val: 'text-blue-300'   },
    teal:   { bg: 'bg-teal-950/40',   border: 'border-teal-800/30',   val: 'text-teal-300'   },
    orange: { bg: 'bg-orange-950/30', border: 'border-orange-800/30', val: 'text-orange-300' },
    purple: { bg: 'bg-purple-950/30', border: 'border-purple-800/30', val: 'text-purple-300' },
  }
  const c = colors[color]
  return (
    <div className={`rounded-xl border ${c.bg} ${c.border} p-3.5`}>
      <div className="flex items-start justify-between mb-1.5">
        <p className="text-xs text-slate-500">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={`text-xl font-bold ${c.val}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function NextSessionCard({ module, dayLabel, onStart, onManual, onPick }) {
  if (!module) return null
  const goal = GOALS[module.goal] || GOALS.basis
  const dot = STEP_DOT_COLORS[module.color] || 'bg-slate-400'

  return (
    <div className="rounded-2xl border border-blue-800/30 bg-slate-800/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/30 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-500 uppercase tracking-widest">Empfehlung für {dayLabel.toLowerCase()}</p>
          <p className="text-base font-bold mt-0.5 truncate text-blue-200">{module.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{goal.label}</p>
        </div>
        <span className="text-xs bg-blue-500/15 text-blue-300 border border-blue-500/25 px-2.5 py-1 rounded-full flex-shrink-0">
          {dayLabel} · {module.durationLabel}
        </span>
      </div>

      <div className="px-4 py-3 space-y-2">
        {module.steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
            <p className="text-sm text-slate-200 flex-1 min-w-0">{step.title}</p>
          </div>
        ))}
      </div>

      <div className="px-4 pb-3 space-y-2">
        <button
          onClick={onStart}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M5 3l14 9-14 9V3z"/>
          </svg>
          Training starten
        </button>
        <div className="flex gap-2">
          <button
            onClick={onPick}
            className="flex-1 py-2 rounded-xl border border-slate-700/60 text-slate-300 text-xs hover:bg-slate-700/40 transition-colors"
          >
            Anderes Training wählen
          </button>
          <button
            onClick={onManual}
            className="flex-1 py-2 rounded-xl text-slate-500 hover:text-slate-300 text-xs transition-colors"
          >
            Manuell eintragen
          </button>
        </div>
      </div>
    </div>
  )
}

const GOAL_ORDER = ['apnoe', 'brustkorb', 'hrv', 'basis']
const GOAL_ICON = { apnoe: '🫁', brustkorb: '❋', hrv: '♡', basis: '◈' }

function LibraryModal({ onStart, onClose }) {
  const byGoal = useMemo(() => getModulesByGoal(), [])
  const [openGoal, setOpenGoal] = useState('apnoe')

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-lg mx-auto bg-[#0a1526] rounded-t-3xl border-t border-slate-700/50 p-6 pb-10 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1 sticky top-0 -mt-1 pt-1 bg-[#0a1526]">
          <h2 className="text-lg font-semibold text-white">Trainingsbibliothek</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-4">Jedes Training jederzeit startbar – unabhängig vom Wochenplan.</p>

        <div className="space-y-3">
          {GOAL_ORDER.map(gid => {
            const g = GOALS[gid]
            const mods = byGoal[gid] || []
            const open = openGoal === gid
            return (
              <div key={gid} className="rounded-xl border border-slate-700/40 overflow-hidden">
                <button
                  onClick={() => setOpenGoal(open ? null : gid)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/40"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-lg">{GOAL_ICON[gid]}</span>
                    <span className="text-left">
                      <span className="block text-sm font-semibold text-white">{g.label}</span>
                      <span className="block text-xs text-slate-500">{g.sub} · {mods.length} Übungen</span>
                    </span>
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {open && (
                  <div className="divide-y divide-slate-700/30">
                    {mods.map(m => (
                      <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200">{m.name}</p>
                          <p className="text-xs text-slate-500 leading-snug">{m.shortDesc}</p>
                          <p className="text-[10px] text-slate-600 mt-0.5">{m.durationLabel}</p>
                        </div>
                        <button
                          onClick={() => { onStart(m.id); onClose() }}
                          className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M5 3l14 9-14 9V3z"/></svg>
                          Start
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function TrainingPage() {
  const [sessions, setSessions] = useLocalStorage('deepflow_sessions', [])
  const [baseHold, setBaseHold] = useLocalStorage('deepflow_base', INITIAL_BASE)
  // overrides keyed by dayIndex (0-6). Stored as object.
  const [overrides, setOverrides] = useLocalStorage('deepflow_plan_overrides', {})
  const [showAdd, setShowAdd] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [activeSession, setActiveSession] = useState(null)

  const streak = useMemo(() => calculateStreak(sessions), [sessions])
  const weekCount = useMemo(() => getThisWeekCount(sessions), [sessions])
  const bestHold = useMemo(() =>
    sessions
      .filter(isApnoeSession)
      .reduce((max, s) => Math.max(max, s.maxHold || 0), baseHold),
    [sessions, baseHold]
  )
  const apnoeCount = useMemo(() => sessions.filter(isApnoeSession).length, [sessions])
  const brustkorbCount = useMemo(() => sessions.filter(s => s.goal === 'brustkorb').length, [sessions])
  const nextInfo = useMemo(() => getNextSession(sessions, overrides), [sessions, overrides])
  const adjustedBase = useMemo(() => computeAdjustedBase(sessions, baseHold), [sessions, baseHold])
  const progress = useMemo(() => getProgressPercent(bestHold, INITIAL_BASE), [bestHold])
  const weekPlan = useMemo(() => getWeeklyPlan(adjustedBase, overrides), [adjustedBase, overrides])

  const recentSessions = useMemo(
    () => [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10),
    [sessions]
  )

  const handleSave = (session) => {
    const updated = [...sessions, session]
    setSessions(updated)
    if (isApnoeSession(session)) {
      const newBase = computeAdjustedBase(updated, baseHold)
      if (newBase > baseHold) setBaseHold(newBase)
    }
    setShowAdd(false)
  }

  const startModule = (moduleId) => {
    const session = buildModuleSession(moduleId)
    if (session) setActiveSession(session)
  }

  const handleStartTraining = () => {
    if (nextModule) startModule(nextModule.id)
  }

  const handleSwapDay = (dayIndex, newType) => {
    setOverrides(prev => {
      const next = { ...prev }
      if (newType === null) delete next[dayIndex]
      else next[dayIndex] = newType
      return next
    })
  }

  const handleActiveComplete = (sessionData) => {
    const updated = [...sessions, sessionData]
    setSessions(updated)
    if (sessionData.goal === 'apnoe' && sessionData.maxHold > 0) {
      const newBase = computeAdjustedBase(updated, baseHold)
      if (newBase > baseHold) setBaseHold(newBase)
    }
    setActiveSession(null)
    setActiveTab('dashboard')
  }

  const deleteSession = (index) => {
    const target = recentSessions[index]
    setSessions(prev => prev.filter(s => s !== target))
  }

  // Tagesempfehlung als Modul
  const nextModule = useMemo(
    () => (nextInfo && !nextInfo.isRest ? getRecommendedModule(nextInfo.type) : null),
    [nextInfo]
  )
  const dayLabel = nextInfo?.isToday ? 'Heute' : nextInfo?.daysUntil === 1 ? 'Morgen' : `In ${nextInfo?.daysUntil} Tagen`

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#050e1f]/95 backdrop-blur-sm border-b border-slate-800/60">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-white">Apnoe-Training</h1>
              <p className="text-xs text-slate-500 mt-0.5">Ziel: {formatTime(GOAL_SECONDS)} Minuten</p>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Session
            </button>
          </div>

          <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'plan', label: 'Wochenplan' },
              { id: 'history', label: 'Verlauf' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 pb-28">

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Weekly target indicator */}
            <div className="rounded-2xl border border-blue-800/30 bg-gradient-to-br from-blue-950/40 to-slate-900/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">Diese Woche</p>
                  <p className="text-2xl font-bold text-white mt-0.5">
                    {weekCount} <span className="text-base text-slate-500">/ {WEEKLY_TARGET} Trainings</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Ziel</p>
                  <p className="text-sm text-blue-300 font-semibold">{WEEKLY_TARGET}×/Woche</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">flexibel mehr/weniger</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: Math.max(WEEKLY_TARGET, weekCount) }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      i < weekCount ? 'bg-blue-500' : 'bg-slate-700/50'
                    }`}
                  />
                ))}
              </div>
              {weekCount >= WEEKLY_TARGET && (
                <p className="text-xs text-teal-400 mt-3 text-center">🎯 Wochenziel erreicht!</p>
              )}
            </div>

            {/* Progress to goal */}
            <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-400 uppercase tracking-widest">Fortschritt zum Ziel</p>
                <span className="text-xs text-blue-400 font-medium">{progress}%</span>
              </div>
              <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden mb-3">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-white tabular-nums">{formatTime(bestHold)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Beste Zeit</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-400 tabular-nums">{formatTime(GOAL_SECONDS)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Ziel</p>
                </div>
              </div>
              {bestHold < GOAL_SECONDS && (
                <p className="text-xs text-slate-500 mt-3 text-center">
                  Noch {formatTime(GOAL_SECONDS - bestHold)} bis zum Ziel
                </p>
              )}
              {bestHold >= GOAL_SECONDS && (
                <p className="text-xs text-teal-400 mt-3 text-center font-medium">
                  🎉 Ziel erreicht! Neues Ziel setzen?
                </p>
              )}
            </div>

            {/* Tagesempfehlung */}
            <NextSessionCard
              module={nextModule}
              dayLabel={dayLabel}
              onStart={handleStartTraining}
              onManual={() => setShowAdd(true)}
              onPick={() => setShowPicker(true)}
            />

            {/* Trainingsbibliothek öffnen */}
            <button
              onClick={() => setShowPicker(true)}
              className="w-full py-3 rounded-xl border border-slate-700/50 bg-slate-800/30 text-slate-300 text-sm font-medium hover:border-slate-500 transition-colors flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              Trainingsbibliothek öffnen
            </button>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Streak"
                value={streak === 0 ? 'Kein' : `${streak} ${streak === 1 ? 'Tag' : 'Tage'}`}
                sub={streak === 0 ? 'Heute starten' : 'Trainings in Folge'}
                color="orange"
                icon="🔥"
              />
              <StatCard
                label="Basis Haltezeit"
                value={formatTime(adjustedBase)}
                sub="Wöchentlich angepasst"
                color="teal"
                icon="📈"
              />
              <StatCard
                label="Apnoe Sessions"
                value={apnoeCount}
                sub="Atemanhalten gesamt"
                color="blue"
                icon="🫁"
              />
              <StatCard
                label="Brustkorb"
                value={brustkorbCount}
                sub="Dehnung & Faszien"
                color="purple"
                icon="❋"
              />
            </div>

            {/* Last sessions */}
            {recentSessions.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Letzte Sessions</p>
                <div className="space-y-2">
                  {recentSessions.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-700/40 bg-slate-800/40 px-4 py-3">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sessionDot(s)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 font-medium truncate">{sessionTypeLabel(s)}</p>
                        {s.notes && <p className="text-xs text-slate-500 truncate">{s.notes}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        {s.maxHold > 0 && (
                          <p className="text-sm font-bold text-white tabular-nums">{formatTime(s.maxHold)}</p>
                        )}
                        <p className="text-xs text-slate-500">{formatDate(s.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sessions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-700/50 p-8 text-center">
                <p className="text-4xl mb-3">🤿</p>
                <p className="text-slate-300 font-medium mb-1">Noch keine Sessions</p>
                <p className="text-sm text-slate-500 mb-4">
                  Starte mit der ersten Trainingseinheit und verfolge deinen Fortschritt Richtung 3 Minuten.
                </p>
                {nextInfo && !nextInfo.isRest && nextInfo.isToday ? (
                  <button
                    onClick={handleStartTraining}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 mx-auto"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M5 3l14 9-14 9V3z"/>
                    </svg>
                    Training starten
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAdd(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                  >
                    Erste Session eintragen
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* PLAN TAB */}
        {activeTab === 'plan' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-4">
              <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest">Aktuelle Basis</p>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-white">{formatTime(adjustedBase)}</p>
                <div className="flex-1">
                  <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${getProgressPercent(adjustedBase, INITIAL_BASE)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Startwert: {formatTime(INITIAL_BASE)} · Ziel: {formatTime(GOAL_SECONDS)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-800/20 bg-amber-900/10 p-3.5">
              <p className="text-xs text-amber-400 font-medium mb-1.5 flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                4 Trainings pro Woche · flexibel anpassbar
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mo · Mi · Fr · Sa sind als Trainingstage geplant. Di, Do und So sind Flex- bzw. Ruhetage. Tippe einen Tag an und wechsle das Training, wenn du einen Tag verpasst.
              </p>
            </div>

            <WeeklyPlan weekPlan={weekPlan} onSwap={handleSwapDay} />
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {recentSessions.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <p className="text-4xl mb-3">📭</p>
                <p>Noch keine Sessions eingetragen</p>
              </div>
            ) : (
              recentSessions.map((s, i) => (
                <div key={i} className="rounded-xl border border-slate-700/40 bg-slate-800/40 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-500/20">
                      <span className={`w-2.5 h-2.5 rounded-full ${sessionDot(s)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{sessionTypeLabel(s)}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(s.date).toLocaleDateString('de-DE', {
                          weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {s.maxHold > 0 ? (
                        <>
                          <p className="text-lg font-bold text-white tabular-nums">{formatTime(s.maxHold)}</p>
                          <p className="text-xs text-slate-500">Max. Haltezeit</p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-400 bg-slate-500/10 border border-slate-500/20 px-2 py-1 rounded-lg">
                          Absolviert
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteSession(i)}
                      className="text-slate-600 hover:text-red-400 transition-colors ml-1"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                      </svg>
                    </button>
                  </div>

                  {(s.rounds?.length > 0 || s.notes) && (
                    <div className="border-t border-slate-700/30 px-4 py-2.5 space-y-2">
                      {s.rounds?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {s.rounds.map((r, ri) => (
                            <span key={ri} className="text-xs bg-slate-700/50 border border-slate-600/30 px-2 py-0.5 rounded-full text-slate-400">
                              R{ri + 1}: {formatTime(r)}
                            </span>
                          ))}
                        </div>
                      )}
                      {s.notes && <p className="text-xs text-slate-400 italic">{s.notes}</p>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showAdd && (
        <AddSession
          suggestedType={['CO2','O2','MUSKEL'].includes(nextInfo?.type) ? nextInfo.type : 'CO2'}
          onSave={handleSave}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {showPicker && (
        <LibraryModal
          onStart={startModule}
          onClose={() => setShowPicker(false)}
        />
      )}

      {activeSession && (
        <ActiveSession
          session={activeSession}
          onComplete={handleActiveComplete}
          onCancel={() => setActiveSession(null)}
        />
      )}
    </div>
  )
}
