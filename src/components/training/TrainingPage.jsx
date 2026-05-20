import { useState, useMemo } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import {
  formatTime,
  getWeeklyPlan,
  getNextSession,
  computeAdjustedBase,
  calculateStreak,
  getProgressPercent,
  GOAL_SECONDS,
  buildSession,
  PREP_EXERCISES,
} from '../../data/trainingPlan'
import AddSession from './AddSession'
import WeeklyPlan from './WeeklyPlan'

const INITIAL_BASE = 90 // 1:30 min

const STEP_DOT_COLORS = {
  indigo: 'bg-indigo-400',
  cyan:   'bg-cyan-400',
  purple: 'bg-purple-400',
  blue:   'bg-blue-400',
  teal:   'bg-teal-400',
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

function NextSessionCard({ nextInfo, adjustedBase, onStart }) {
  if (!nextInfo || nextInfo.isRest) return null
  const session = buildSession(nextInfo, adjustedBase)
  if (!session) return null

  const typeLabel = {
    CO2: 'CO₂-Tabelle',
    O2: 'O₂-Tabelle',
    MUSKEL: 'Atemmuskeltraining',
  }[session.type] || session.type

  const typeColor = {
    CO2: 'text-blue-300',
    O2: 'text-teal-300',
    MUSKEL: 'text-purple-300',
  }[session.type] || 'text-blue-300'

  const dayLabel = nextInfo.isToday
    ? 'Heute'
    : nextInfo.daysUntil === 1
    ? 'Morgen'
    : `In ${nextInfo.daysUntil} Tagen`

  return (
    <div className="rounded-2xl border border-blue-800/30 bg-slate-800/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/30 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Nächste Session</p>
          <p className={`text-base font-bold mt-0.5 ${typeColor}`}>{typeLabel}</p>
        </div>
        <div className="text-right">
          <span className="text-xs bg-blue-500/15 text-blue-300 border border-blue-500/25 px-2.5 py-1 rounded-full">
            {dayLabel} · {session.totalDuration}
          </span>
        </div>
      </div>

      {/* Session sequence */}
      <div className="px-4 py-3 space-y-2">
        {session.steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-3">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STEP_DOT_COLORS[step.color] || 'bg-slate-400'}`} />
            <div className="flex-1 flex items-center justify-between min-w-0">
              <p className="text-sm text-slate-200">{step.name}</p>
              <span className="text-xs text-slate-500 flex-shrink-0 ml-2">{step.duration}</span>
            </div>
          </div>
        ))}
      </div>

      {nextInfo.isToday && (
        <div className="px-4 pb-3">
          <button
            onClick={onStart}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            Session eintragen
          </button>
        </div>
      )}
    </div>
  )
}

export default function TrainingPage() {
  const [sessions, setSessions] = useLocalStorage('deepflow_sessions', [])
  const [baseHold, setBaseHold] = useLocalStorage('deepflow_base', INITIAL_BASE)
  const [showAdd, setShowAdd] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const streak = useMemo(() => calculateStreak(sessions), [sessions])
  const bestHold = useMemo(() =>
    sessions
      .filter(s => s.type === 'CO2' || s.type === 'O2')
      .reduce((max, s) => Math.max(max, s.maxHold), baseHold),
    [sessions, baseHold]
  )
  const nextInfo = useMemo(() => getNextSession(sessions), [sessions])
  const adjustedBase = useMemo(() => computeAdjustedBase(sessions, baseHold), [sessions, baseHold])
  const progress = getProgressPercent(bestHold, INITIAL_BASE)
  const weekPlan = useMemo(() => getWeeklyPlan(adjustedBase), [adjustedBase])

  const recentSessions = useMemo(
    () => [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10),
    [sessions]
  )

  const handleSave = (session) => {
    const updated = [...sessions, session]
    setSessions(updated)
    if (session.type === 'CO2' || session.type === 'O2') {
      const newBase = computeAdjustedBase(updated, baseHold)
      if (newBase > baseHold) setBaseHold(newBase)
    }
    setShowAdd(false)
  }

  const deleteSession = (index) => {
    const target = recentSessions[index]
    setSessions(prev => prev.filter(s => s !== target))
  }

  const formatDate = (isoStr) => {
    const d = new Date(isoStr)
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
  }

  const sessionTypeLabel = (type) => {
    return { CO2: 'CO₂-Tabelle', O2: 'O₂-Tabelle', MUSKEL: 'Atemmuskeltraining' }[type] ?? type
  }

  const sessionTypeDot = (type) => {
    return { CO2: 'bg-blue-400', O2: 'bg-teal-400', MUSKEL: 'bg-purple-400' }[type] ?? 'bg-slate-400'
  }

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
            {/* Progress to goal */}
            <div className="rounded-2xl border border-blue-800/30 bg-gradient-to-br from-blue-950/40 to-slate-900/60 p-5">
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

            {/* Next session card */}
            <NextSessionCard
              nextInfo={nextInfo}
              adjustedBase={adjustedBase}
              onStart={() => setShowAdd(true)}
            />

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
                value={sessions.filter(s => s.type === 'CO2' || s.type === 'O2').length}
                sub="CO₂ + O₂ gesamt"
                color="blue"
                icon="🤿"
              />
              <StatCard
                label="Muskel Sessions"
                value={sessions.filter(s => s.type === 'MUSKEL').length}
                sub="Atemmuskeltraining"
                color="purple"
                icon="💪"
              />
            </div>

            {/* Last sessions */}
            {recentSessions.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Letzte Sessions</p>
                <div className="space-y-2">
                  {recentSessions.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-700/40 bg-slate-800/40 px-4 py-3">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sessionTypeDot(s.type)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 font-medium">{sessionTypeLabel(s.type)}</p>
                        {s.notes && <p className="text-xs text-slate-500 truncate">{s.notes}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        {(s.type === 'CO2' || s.type === 'O2') && (
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
                <button
                  onClick={() => setShowAdd(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                >
                  Erste Session eintragen
                </button>
              </div>
            )}
          </div>
        )}

        {/* PLAN TAB */}
        {activeTab === 'plan' && (
          <div className="space-y-4">
            {/* Basis */}
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

            {/* Auto-adjust note */}
            <div className="rounded-xl border border-amber-800/20 bg-amber-900/10 p-3.5">
              <p className="text-xs text-amber-400 font-medium mb-1.5 flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Automatische Anpassung
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                CO₂/O₂-Tabellen passen sich wöchentlich an deine eingetragenen Haltezeiten an.
                Zwerchfellatmung, Brustkorbdehnung und Atemmuskeltraining bleiben als feste Struktur erhalten.
              </p>
            </div>

            <WeeklyPlan weekPlan={weekPlan} />
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
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      s.type === 'CO2' ? 'bg-blue-500/20' :
                      s.type === 'O2'  ? 'bg-teal-500/20' :
                                         'bg-purple-500/20'
                    }`}>
                      <span className={`text-xs font-bold ${
                        s.type === 'CO2' ? 'text-blue-300' :
                        s.type === 'O2'  ? 'text-teal-300' :
                                           'text-purple-300'
                      }`}>
                        {s.type}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200">{sessionTypeLabel(s.type)}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(s.date).toLocaleDateString('de-DE', {
                          weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {(s.type === 'CO2' || s.type === 'O2') ? (
                        <>
                          <p className="text-lg font-bold text-white tabular-nums">{formatTime(s.maxHold)}</p>
                          <p className="text-xs text-slate-500">Max. Haltezeit</p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-lg">
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
          suggestedType={nextInfo?.type ?? 'CO2'}
          onSave={handleSave}
          onCancel={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}
