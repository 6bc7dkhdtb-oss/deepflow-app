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

// Fixed exercises that are part of every structured session
export const PREP_EXERCISES = {
  zwerchfell: {
    id: 'zwerchfell',
    name: 'Zwerchfellatmung Training',
    duration: '5 Min',
    role: 'Tägliche Grundübung',
    color: 'indigo',
    description: 'Hand auf Bauch/Brust – Bauch hebt sich, Brust bleibt ruhig',
    toolboxId: 'zwerchfellatmung-training',
  },
  brustkorbdehnung: {
    id: 'brustkorbdehnung',
    name: 'Brustkorbdehnung',
    duration: '10 Min',
    role: 'Aufwärmen',
    color: 'cyan',
    description: 'Uddiyana Bandha · Seitliche Dehnung · Vordere/Hintere Dehnung',
    toolboxId: 'brustkorbdehnung',
  },
  atemmuskel: {
    id: 'atemmuskel',
    name: 'Atemmuskeltraining',
    duration: '15–20 Min',
    role: 'Kraftblock',
    color: 'purple',
    description: '3 Stufen mit Relaxator/Strohhalm – Grundspannung, Kontrolle, Belastung',
    toolboxId: 'atemmuskeltraining',
  },
}

// Weekly structure: 0 = Monday, 6 = Sunday
// type: 'CO2' | 'O2' | 'MUSKEL' | 'REST'
export const WEEKLY_STRUCTURE = [
  { dayIndex: 0, label: 'Mo', dayName: 'Montag',     type: 'CO2',   hasApnoe: true,  hasMuskel: false, isRest: false },
  { dayIndex: 1, label: 'Di', dayName: 'Dienstag',   type: 'MUSKEL',hasApnoe: false, hasMuskel: true,  isRest: false },
  { dayIndex: 2, label: 'Mi', dayName: 'Mittwoch',   type: 'O2',    hasApnoe: true,  hasMuskel: false, isRest: false },
  { dayIndex: 3, label: 'Do', dayName: 'Donnerstag', type: 'MUSKEL',hasApnoe: false, hasMuskel: true,  isRest: false },
  { dayIndex: 4, label: 'Fr', dayName: 'Freitag',    type: 'CO2',   hasApnoe: true,  hasMuskel: false, isRest: false },
  { dayIndex: 5, label: 'Sa', dayName: 'Samstag',    type: 'O2',    hasApnoe: true,  hasMuskel: false, isRest: false },
  { dayIndex: 6, label: 'So', dayName: 'Sonntag',    type: 'REST',  hasApnoe: false, hasMuskel: false, isRest: true  },
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

// Builds a full session object for a given day structure entry
export function buildSession(dayEntry, baseHoldSeconds) {
  if (dayEntry.isRest) return null

  const steps = []

  // Step 1: always Zwerchfellatmung
  steps.push({ ...PREP_EXERCISES.zwerchfell, stepType: 'prep' })

  if (dayEntry.hasMuskel) {
    // Atemmuskeltraining day
    steps.push({ ...PREP_EXERCISES.atemmuskel, stepType: 'main' })
    return {
      type: 'MUSKEL',
      label: 'Atemmuskeltraining',
      totalDuration: '~25 Min',
      steps,
    }
  }

  // Apnoe session: Brustkorbdehnung + CO₂/O₂ table
  steps.push({ ...PREP_EXERCISES.brustkorbdehnung, stepType: 'warmup' })

  const table = dayEntry.type === 'CO2'
    ? generateCO2Table(baseHoldSeconds)
    : generateO2Table(baseHoldSeconds)

  steps.push({
    id: 'table',
    name: table.name,
    duration: '~20 Min',
    role: dayEntry.type === 'CO2' ? 'CO₂-Toleranz' : 'O₂-Kapazität',
    color: dayEntry.type === 'CO2' ? 'blue' : 'teal',
    description: table.description,
    stepType: 'main',
    table,
  })

  return {
    type: dayEntry.type,
    label: dayEntry.type === 'CO2' ? 'Apnoe CO₂-Tag' : 'Apnoe O₂-Tag',
    totalDuration: '~35 Min',
    steps,
  }
}

// Full week with sessions attached
export function getWeeklyPlan(baseHoldSeconds) {
  return WEEKLY_STRUCTURE.map(day => ({
    ...day,
    session: buildSession(day, baseHoldSeconds),
  }))
}

// Next session: based on current day of week
export function getNextSession(sessions) {
  const todayIdx = getTodayIndex()
  const todayEntry = WEEKLY_STRUCTURE[todayIdx]

  // Find next non-rest day starting from today
  for (let i = 0; i < 7; i++) {
    const entry = WEEKLY_STRUCTURE[(todayIdx + i) % 7]
    if (!entry.isRest) {
      return {
        ...entry,
        isToday: i === 0,
        daysUntil: i,
      }
    }
  }
  return { ...todayEntry, isToday: true, daysUntil: 0 }
}

// Auto-adjust base hold time based on last week's sessions
export function computeAdjustedBase(sessions, currentBase) {
  if (!sessions || sessions.length < 2) return currentBase

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recentSessions = sessions
    .filter(s => new Date(s.date).getTime() > oneWeekAgo && (s.type === 'CO2' || s.type === 'O2'))

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
