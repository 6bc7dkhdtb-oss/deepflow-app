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

// ─── Building blocks ────────────────────────────────────────────────
// Fixed exercises that are part of structured sessions.
// `toolboxId` links to exercises.js for tooltip / cross-link.
export const PREP_EXERCISES = {
  zwerchfell: {
    id: 'zwerchfell',
    name: 'Zwerchfellatmung',
    duration: '5 Min',
    role: 'Grundübung',
    color: 'indigo',
    description: 'Hand auf Bauch/Brust – Bauch hebt sich, Brust bleibt ruhig.',
    toolboxId: 'zwerchfellatmung-training',
  },
  brustkorbdehnung: {
    id: 'brustkorbdehnung',
    name: 'Brustkorbdehnung',
    duration: '10 Min',
    role: 'Aufwärmen',
    color: 'cyan',
    description: 'Uddiyana Bandha · Seitliche Dehnung · Vordere Dehnung – wähle deine Stufe.',
    toolboxId: 'brustkorbdehnung',
    hasStages: true,
  },
  atemmuskel: {
    id: 'atemmuskel',
    name: 'Atemmuskeltraining',
    duration: '15–20 Min',
    role: 'Kraftblock',
    color: 'purple',
    description: '3 Stufen mit Relaxator/Strohhalm – Grundspannung, Kontrolle, Belastung.',
    toolboxId: 'atemmuskeltraining',
  },
  kohaerenz: {
    id: 'kohaerenz',
    name: 'Kohärenzatmung',
    duration: '5 Min',
    role: 'Vorbereitung',
    color: 'teal',
    description: '5,5 Sek ein, 5,5 Sek aus – synchronisiert Herz und Atmung.',
    toolboxId: 'kohaerenzatmung',
  },
  vollatmung: {
    id: 'vollatmung',
    name: 'Zyklische Vollatmung',
    duration: '5 Min',
    role: 'Aktivierung',
    color: 'blue',
    description: 'Aktiviert Körper und Nervensystem mit vollständigen Atemzyklen.',
    toolboxId: 'zyklische-vollatmung',
  },
}

// ─── Default weekly structure (4 trainings + flex + rest) ───────────
// `type`: 'CO2' | 'O2' | 'MUSKEL' | 'FLEX' | 'REST'
// FLEX = locker bewegen, Atemübung freier Wahl – wird nicht gezählt
// REST = Erholung
const DEFAULT_PLAN = [
  { dayIndex: 0, label: 'Mo', dayName: 'Montag',     type: 'CO2'    },
  { dayIndex: 1, label: 'Di', dayName: 'Dienstag',   type: 'FLEX'   },
  { dayIndex: 2, label: 'Mi', dayName: 'Mittwoch',   type: 'O2'     },
  { dayIndex: 3, label: 'Do', dayName: 'Donnerstag', type: 'FLEX'   },
  { dayIndex: 4, label: 'Fr', dayName: 'Freitag',    type: 'MUSKEL' },
  { dayIndex: 5, label: 'Sa', dayName: 'Samstag',    type: 'CO2'    },
  { dayIndex: 6, label: 'So', dayName: 'Sonntag',    type: 'REST'   },
]

const TYPE_META = {
  CO2:    { hasApnoe: true,  hasMuskel: false, isRest: false, isFlex: false, isTraining: true  },
  O2:     { hasApnoe: true,  hasMuskel: false, isRest: false, isFlex: false, isTraining: true  },
  MUSKEL: { hasApnoe: false, hasMuskel: true,  isRest: false, isFlex: false, isTraining: true  },
  FLEX:   { hasApnoe: false, hasMuskel: false, isRest: false, isFlex: true,  isTraining: false },
  REST:   { hasApnoe: false, hasMuskel: false, isRest: true,  isFlex: false, isTraining: false },
}

export function getDefaultPlan() {
  return DEFAULT_PLAN.map(d => ({ ...d, ...TYPE_META[d.type] }))
}

// Custom overrides stored in localStorage keyed by ISO date
// (allows user to swap any day's training without changing the recurring plan).
// Helpers below; persisted state lives in React side.

export const WEEKLY_STRUCTURE = getDefaultPlan()

// All trainings the user can manually choose
export const TRAINING_OPTIONS = [
  { type: 'CO2',    label: 'CO₂-Tabelle',         description: 'Feste Haltezeit, kürzer werdende Pausen – CO₂-Toleranz' },
  { type: 'O2',     label: 'O₂-Tabelle',          description: 'Zunehmende Haltezeiten, feste Pausen – O₂-Effizienz'    },
  { type: 'MUSKEL', label: 'Atemmuskeltraining',  description: '3 Stufen mit Relaxator/Strohhalm – Kraftblock'           },
  { type: 'FLEX',   label: 'Freies Training',     description: 'Eigene Auswahl – z. B. Zwerchfellatmung oder Meditation'  },
]

// Returns today's 0-indexed weekday (0 = Monday)
export function getTodayIndex() {
  const jsDay = new Date().getDay() // 0=Sun, 1=Mon … 6=Sat
  return jsDay === 0 ? 6 : jsDay - 1
}

// CO2 Table: Fixed hold time, decreasing rest intervals
export function generateCO2Table(baseHoldSeconds) {
  const hold = Math.round(baseHoldSeconds * 0.5)
  const restTimes = [150, 120, 90, 60, 45, 30, 20, 15]
  return {
    type: 'CO2',
    name: 'CO₂-Tabelle',
    description: 'Feste Haltezeit, abnehmende Erholungspausen – trainiert CO₂-Toleranz',
    holdSeconds: hold,
    rounds: restTimes.map((rest, i) => ({ round: i + 1, hold, rest })),
  }
}

// O2 Table: Increasing hold times, fixed rest interval
export function generateO2Table(baseHoldSeconds) {
  const base = Math.round(baseHoldSeconds * 0.5)
  const step = Math.max(5, Math.round(baseHoldSeconds * 0.05))
  const rest = 120
  const holdTimes = [
    base, base + step, base + step * 2, base + step * 3,
    base + step * 2, base + step, base + step * 2, base + step * 3,
  ]
  return {
    type: 'O2',
    name: 'O₂-Tabelle',
    description: 'Zunehmende Haltezeiten, feste Erholungspausen – trainiert Sauerstoff-Effizienz',
    restSeconds: rest,
    rounds: holdTimes.map((hold, i) => ({ round: i + 1, hold, rest })),
  }
}

// Builds a session by training type. Used both for the recurring plan
// and for user-chosen swaps.
export function buildSessionByType(type, baseHoldSeconds) {
  if (type === 'REST') return null

  const steps = []
  steps.push({ ...PREP_EXERCISES.zwerchfell, stepType: 'prep' })

  if (type === 'MUSKEL') {
    steps.push({ ...PREP_EXERCISES.atemmuskel, stepType: 'main' })
    return {
      type: 'MUSKEL',
      label: 'Atemmuskeltraining',
      totalDuration: '~25 Min',
      steps,
    }
  }

  if (type === 'FLEX') {
    steps.push({ ...PREP_EXERCISES.vollatmung, stepType: 'main' })
    steps.push({ ...PREP_EXERCISES.kohaerenz, stepType: 'main' })
    return {
      type: 'FLEX',
      label: 'Freies Training',
      totalDuration: '~15 Min',
      steps,
    }
  }

  // Apnoe session
  steps.push({ ...PREP_EXERCISES.brustkorbdehnung, stepType: 'warmup' })

  const table = type === 'CO2'
    ? generateCO2Table(baseHoldSeconds)
    : generateO2Table(baseHoldSeconds)

  steps.push({
    id: 'table',
    name: table.name,
    duration: '~20 Min',
    role: type === 'CO2' ? 'CO₂-Toleranz' : 'O₂-Kapazität',
    color: type === 'CO2' ? 'blue' : 'teal',
    description: table.description,
    stepType: 'main',
    table,
  })

  return {
    type,
    label: type === 'CO2' ? 'Apnoe CO₂-Tag' : 'Apnoe O₂-Tag',
    totalDuration: '~35 Min',
    steps,
  }
}

// Backwards-compatible: build session for a `dayEntry`
export function buildSession(dayEntry, baseHoldSeconds) {
  if (!dayEntry || dayEntry.isRest) return null
  return buildSessionByType(dayEntry.type, baseHoldSeconds)
}

// Full week with sessions attached, applying any user overrides (keyed by dayIndex)
export function getWeeklyPlan(baseHoldSeconds, overrides = {}) {
  return WEEKLY_STRUCTURE.map(day => {
    const overrideType = overrides[day.dayIndex]
    const type = overrideType || day.type
    const meta = TYPE_META[type] || TYPE_META.REST
    return {
      ...day,
      ...meta,
      type,
      isOverride: !!overrideType,
      session: buildSessionByType(type, baseHoldSeconds),
    }
  })
}

// Next session: based on current day of week
export function getNextSession(_sessions, overrides = {}) {
  const todayIdx = getTodayIndex()
  for (let i = 0; i < 7; i++) {
    const idx = (todayIdx + i) % 7
    const day = WEEKLY_STRUCTURE[idx]
    const type = overrides[idx] || day.type
    const meta = TYPE_META[type]
    if (!meta.isRest) {
      return {
        ...day,
        ...meta,
        type,
        isToday: i === 0,
        daysUntil: i,
      }
    }
  }
  return { ...WEEKLY_STRUCTURE[todayIdx], ...TYPE_META.REST, isToday: true, daysUntil: 0 }
}

// True for any session that tracks a breath-hold time (new module records carry
// goal='apnoe'; legacy manual records carry type 'CO2'/'O2').
export function isApnoeSession(s) {
  return s.goal === 'apnoe' || s.type === 'CO2' || s.type === 'O2'
}

// Auto-adjust base hold time based on last week's sessions
export function computeAdjustedBase(sessions, currentBase) {
  if (!sessions || sessions.length < 2) return currentBase

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recentSessions = sessions
    .filter(s => new Date(s.date).getTime() > oneWeekAgo && isApnoeSession(s))

  if (recentSessions.length < 2) return currentBase

  const avg = recentSessions.reduce((sum, s) => sum + s.maxHold, 0) / recentSessions.length
  const newBase = Math.min(GOAL_SECONDS, Math.round(avg))
  return Math.min(newBase, currentBase + 10)
}

// Calculate training streak (consecutive days with any session)
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

// Sessions completed in current ISO week (Mon → Sun)
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
