import { TYPE_TRAINING } from './trainingModules'

export const GOAL_SECONDS = 180 // 3:00 min

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function parseTime(str) {
  if (!str) return 0
  const parts = str.split(':')
  if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1])
  return parseInt(str)
}

// ─── Wochenstruktur: 4 Trainings + Flex + Ruhe ──────────────────────────────
// `type`: 'GRUND' | 'CO2' | 'O2' | 'MUSKEL' | 'FLEX' | 'REST'
// FLEX = locker bewegen, Atem-/Mentalübung freier Wahl (Toolbox) – wird nicht gezählt
// REST = Erholung
const DEFAULT_PLAN = [
  { dayIndex: 0, label: 'Mo', dayName: 'Montag',     type: 'GRUND'  },
  { dayIndex: 1, label: 'Di', dayName: 'Dienstag',   type: 'FLEX'   },
  { dayIndex: 2, label: 'Mi', dayName: 'Mittwoch',   type: 'CO2'    },
  { dayIndex: 3, label: 'Do', dayName: 'Donnerstag', type: 'FLEX'   },
  { dayIndex: 4, label: 'Fr', dayName: 'Freitag',    type: 'O2'     },
  { dayIndex: 5, label: 'Sa', dayName: 'Samstag',    type: 'MUSKEL' },
  { dayIndex: 6, label: 'So', dayName: 'Sonntag',    type: 'REST'   },
]

const TYPE_META = {
  GRUND:  { hasApnoe: true,  isRest: false, isFlex: false, isTraining: true  },
  CO2:    { hasApnoe: true,  isRest: false, isFlex: false, isTraining: true  },
  O2:     { hasApnoe: true,  isRest: false, isFlex: false, isTraining: true  },
  MUSKEL: { hasApnoe: false, isRest: false, isFlex: false, isTraining: true  },
  FLEX:   { hasApnoe: false, isRest: false, isFlex: true,  isTraining: false },
  REST:   { hasApnoe: false, isRest: true,  isFlex: false, isTraining: false },
}

export function getDefaultPlan() {
  return DEFAULT_PLAN.map(d => ({ ...d, ...TYPE_META[d.type] }))
}

export const WEEKLY_STRUCTURE = getDefaultPlan()

// Alle Trainings, die der User manuell für einen Tag wählen kann
export const TRAINING_OPTIONS = [
  { type: 'GRUND',  label: 'Atemanhalten Grundlagen', description: 'Atemreiz kennenlernen & länger halten – 4 Stufen' },
  { type: 'CO2',    label: 'CO₂-Tabelle',             description: 'Feste Haltezeit, kürzere Pausen – CO₂-Toleranz'    },
  { type: 'O2',     label: 'O₂-Tabelle',              description: 'Zunehmende Haltezeiten, feste Pausen – O₂-Effizienz' },
  { type: 'MUSKEL', label: 'Atemmuskeltraining',      description: 'Relaxator/Strohhalm in 3 Stufen – Kraftblock'        },
  { type: 'FLEX',   label: 'Flex (Toolbox)',          description: 'Freie Wahl aus der Toolbox – wird nicht gezählt'     },
]

// Returns today's 0-indexed weekday (0 = Monday)
export function getTodayIndex() {
  const jsDay = new Date().getDay() // 0=Sun, 1=Mon … 6=Sat
  return jsDay === 0 ? 6 : jsDay - 1
}

// Volle Woche, samt User-Overrides (keyed by dayIndex). Jeder Tag trägt
// `trainingId` – die Anzeige/Start zieht Details aus trainingModules.
export function getWeeklyPlan(overrides = {}) {
  return WEEKLY_STRUCTURE.map(day => {
    const overrideType = overrides[day.dayIndex]
    const type = overrideType || day.type
    const meta = TYPE_META[type] || TYPE_META.REST
    return {
      ...day,
      ...meta,
      type,
      isOverride: !!overrideType,
      trainingId: TYPE_TRAINING[type] || null,
    }
  })
}

// Nächstes Training: ab heutigem Wochentag das erste Nicht-Ruhe-/Nicht-Flex.
export function getNextSession(_sessions, overrides = {}) {
  const todayIdx = getTodayIndex()
  for (let i = 0; i < 7; i++) {
    const idx = (todayIdx + i) % 7
    const day = WEEKLY_STRUCTURE[idx]
    const type = overrides[idx] || day.type
    const meta = TYPE_META[type]
    if (meta.isTraining) {
      return {
        ...day,
        ...meta,
        type,
        trainingId: TYPE_TRAINING[type] || null,
        isToday: i === 0,
        daysUntil: i,
      }
    }
  }
  return { ...WEEKLY_STRUCTURE[todayIdx], ...TYPE_META.REST, isToday: true, daysUntil: 0 }
}

// True für jede Session, die eine Atemhaltezeit trackt.
export function isApnoeSession(s) {
  return s.goal === 'apnoe' || ['GRUND', 'CO2', 'O2'].includes(s.type)
}

// Auto-Anpassung der Basis-Haltezeit anhand der letzten Woche
export function computeAdjustedBase(sessions, currentBase) {
  if (!sessions || sessions.length < 2) return currentBase

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recentSessions = sessions
    .filter(s => new Date(s.date).getTime() > oneWeekAgo && isApnoeSession(s) && s.maxHold > 0)

  if (recentSessions.length < 2) return currentBase

  const avg = recentSessions.reduce((sum, s) => sum + s.maxHold, 0) / recentSessions.length
  const newBase = Math.min(GOAL_SECONDS, Math.round(avg))
  return Math.min(newBase, currentBase + 10)
}

// Trainings-Streak (aufeinanderfolgende Tage mit Session)
export function calculateStreak(sessions) {
  if (!sessions || sessions.length === 0) return 0

  const sorted = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date))
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  let checkDate = new Date(today)

  for (const session of sorted) {
    const sessionDate = new Date(session.date)
    sessionDate.setHours(0, 0, 0, 0)
    const diff = (checkDate - sessionDate) / (1000 * 60 * 60 * 24)

    if (diff === 0) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (diff === 1 && streak === 0) {
      streak++
      checkDate = new Date(sessionDate)
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

export function getProgressPercent(bestHold, base = 90) {
  if (bestHold <= base) return 0
  return Math.min(100, Math.round(((bestHold - base) / (GOAL_SECONDS - base)) * 100))
}

// Sessions in der aktuellen ISO-Woche (Mo → So)
export function getThisWeekCount(sessions) {
  if (!sessions || sessions.length === 0) return 0
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const weekday = today.getDay() // 0=Sun … 6=Sat
  const monOffset = weekday === 0 ? 6 : weekday - 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - monOffset)
  return sessions.filter(s => {
    const d = new Date(s.date)
    return d >= monday && d <= now
  }).length
}
