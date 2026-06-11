import { useState, useEffect, useRef, useMemo } from 'react'
import { formatTime } from '../../data/trainingPlan'
import {
  playPhaseSound, playStepCue, playRoundCue, playEndTone, resumeAudio,
} from '../../audio/AudioManager'
import BrustkorbStageGuide from '../toolbox/BrustkorbStageGuide'

// ─── Farbthemen pro Modul/Schritt ────────────────────────────────────────────
const C = {
  indigo: { bdr: 'border-indigo-500/40', bg: 'bg-indigo-950/30', txt: 'text-indigo-300', bar: 'bg-indigo-500', ring: '#6366f1' },
  cyan:   { bdr: 'border-cyan-500/40',   bg: 'bg-cyan-950/30',   txt: 'text-cyan-300',   bar: 'bg-cyan-500',   ring: '#22d3ee' },
  purple: { bdr: 'border-purple-500/40', bg: 'bg-purple-950/30', txt: 'text-purple-300', bar: 'bg-purple-500', ring: '#a855f7' },
  blue:   { bdr: 'border-blue-500/40',   bg: 'bg-blue-950/30',   txt: 'text-blue-300',   bar: 'bg-blue-500',   ring: '#3b82f6' },
  teal:   { bdr: 'border-teal-500/40',   bg: 'bg-teal-950/30',   txt: 'text-teal-300',   bar: 'bg-teal-500',   ring: '#2dd4bf' },
  orange: { bdr: 'border-orange-500/40', bg: 'bg-orange-950/30', txt: 'text-orange-300', bar: 'bg-orange-500', ring: '#fb923c' },
  pink:   { bdr: 'border-pink-500/40',   bg: 'bg-pink-950/30',   txt: 'text-pink-300',   bar: 'bg-pink-500',   ring: '#f472b6' },
}
const tint = (c) => C[c] || C.blue

const PHASE_LABEL = { in: 'Einatmen', out: 'Ausatmen', hold: 'Halten', pause: 'Atempause', extra: 'Extra-Atemzug' }

// ─────────────────────────────────────────────────────────────────────────────
// Ring-Countdown (SVG-Kreis)
// ─────────────────────────────────────────────────────────────────────────────
function Ring({ progress, color, children, size = 200 }) {
  const r = 80
  const circ = 2 * Math.PI * r
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.25s linear' }}
        />
      </svg>
      <div className="flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Einfacher Countdown (feste Dauer)
// ─────────────────────────────────────────────────────────────────────────────
function CountdownTimer({ duration, color }) {
  const c = tint(color)
  const [left, setLeft] = useState(duration)
  const [running, setRunning] = useState(true)

  useEffect(() => { setLeft(duration); setRunning(true) }, [duration])
  useEffect(() => {
    if (!running || left <= 0) return
    const t = setInterval(() => setLeft(p => {
      if (p <= 1) { playRoundCue('rest'); return 0 }
      return p - 1
    }), 1000)
    return () => clearInterval(t)
  }, [running, left])

  const progress = duration > 0 ? (duration - left) / duration : 0
  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <Ring progress={progress} color={left === 0 ? '#2dd4bf' : c.ring}>
        <span className={`text-4xl font-bold tabular-nums ${left === 0 ? 'text-teal-300' : 'text-white'}`}>{formatTime(left)}</span>
        <span className="text-xs text-slate-500 mt-1">{left === 0 ? 'fertig' : 'verbleibend'}</span>
      </Ring>
      <button
        onClick={() => setRunning(r => !r)}
        className="px-5 py-2 rounded-full border border-slate-600 text-slate-300 text-sm hover:border-slate-400 transition-colors"
      >
        {running ? 'Pause' : left === 0 ? 'Neu starten' : 'Fortsetzen'}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Atemführung (Phasen-Loop) – optional danach Maximalrunde (`then`)
// ─────────────────────────────────────────────────────────────────────────────
function BreathingTimer({ timer, color, onMaxHold }) {
  const c = tint(color)
  const phases = timer.phases
  const period = useMemo(() => phases.reduce((s, p) => s + p.duration, 0), [phases])
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(true)

  const finished = timer.totalSec ? elapsed >= timer.totalSec : false

  // Aktuelle Phase + Restzeit aus elapsed ableiten
  const { idx, cur, phaseLeft, phaseProgress } = useMemo(() => {
    const tInCycle = elapsed % period
    let acc = 0, i = 0, tInPhase = 0
    for (; i < phases.length; i++) {
      if (tInCycle < acc + phases[i].duration) { tInPhase = tInCycle - acc; break }
      acc += phases[i].duration
    }
    if (i >= phases.length) i = phases.length - 1
    const c = phases[i]
    return { idx: i, cur: c, phaseLeft: Math.ceil(c.duration - tInPhase), phaseProgress: c.duration > 0 ? tInPhase / c.duration : 0 }
  }, [elapsed, period, phases])

  const prevPhaseRef = useRef(-1)
  useEffect(() => {
    if (idx !== prevPhaseRef.current) {
      prevPhaseRef.current = idx
      playPhaseSound(cur.type)
    }
  }, [idx, cur.type])

  useEffect(() => {
    if (!running || finished) return
    const t = setInterval(() => setElapsed(e => e + 0.1), 100)
    return () => clearInterval(t)
  }, [running, finished])

  // Nach Atemphase eine Maximalrunde anhängen (TB5-5)
  if (finished && timer.then === 'hold-max') {
    return <HoldMaxTimer note="Jetzt tief einatmen und so lange halten wie möglich." color={color} onMaxHold={onMaxHold} />
  }

  const isExpand = cur.type === 'in' || cur.type === 'extra'
  const isContract = cur.type === 'out'
  const ballSize = isExpand ? 140 : isContract ? 80 : 110

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <div className="relative flex items-center justify-center" style={{ height: 180 }}>
        <div
          className="rounded-full flex items-center justify-center transition-all ease-in-out"
          style={{
            width: ballSize, height: ballSize,
            transitionDuration: `${Math.min(cur.duration, 1.2)}s`,
            background: `${c.ring}22`, border: `2px solid ${c.ring}`,
          }}
        >
          <span className="text-lg font-semibold text-white">{PHASE_LABEL[cur.type]}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span className="text-3xl font-bold text-white tabular-nums">{phaseLeft}s</span>
        <span className="text-slate-600">·</span>
        <span>{cur.instruction}</span>
      </div>

      {/* Phasen-Fortschritt */}
      <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${phaseProgress * 100}%`, background: c.ring, transition: 'width 0.1s linear' }} />
      </div>

      {timer.totalSec && (
        <p className="text-xs text-slate-500">
          {finished ? '✓ Geschafft – weiter, wenn du bereit bist' : `Gesamt: ${formatTime(Math.floor(elapsed))} / ${formatTime(timer.totalSec)}`}
        </p>
      )}

      <button
        onClick={() => setRunning(r => !r)}
        className="px-5 py-2 rounded-full border border-slate-600 text-slate-300 text-sm hover:border-slate-400 transition-colors"
      >
        {running ? 'Pause' : 'Fortsetzen'}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Halte-Tabelle (O₂ / CO₂) – feste Hold-/Rest-Werte
// ─────────────────────────────────────────────────────────────────────────────
function HoldTableTimer({ timer, color, onMaxHold }) {
  const c = tint(color)
  const rounds = timer.rounds
  const [roundIdx, setRoundIdx] = useState(0)
  const [phase, setPhase] = useState('idle') // idle | hold | rest | done
  const [left, setLeft] = useState(0)
  const [holdAdjust, setHoldAdjust] = useState(0) // CO₂: globale Anpassung der Haltezeit

  const holdFor = (i) => Math.max(5, rounds[i].hold + holdAdjust)

  const start = () => { resumeAudio(); setRoundIdx(0); setPhase('hold'); setLeft(holdFor(0)); playRoundCue('hold') }

  useEffect(() => {
    if (phase !== 'hold' && phase !== 'rest') return
    if (left <= 0) { advance(); return }
    const t = setInterval(() => setLeft(p => Math.max(0, p - 1)), 1000)
    return () => clearInterval(t)
  }, [phase, left]) // eslint-disable-line

  function advance() {
    if (phase === 'hold') {
      onMaxHold?.(holdFor(roundIdx))
      const rest = rounds[roundIdx].rest
      if (rest > 0) { setPhase('rest'); setLeft(rest); playRoundCue('rest') }
      else nextRound()
    } else if (phase === 'rest') {
      nextRound()
    }
  }
  function nextRound() {
    const next = roundIdx + 1
    if (next < rounds.length) { setRoundIdx(next); setPhase('hold'); setLeft(holdFor(next)); playRoundCue('hold') }
    else { setPhase('done'); playRoundCue('done') }
  }

  const active = phase === 'hold' || phase === 'rest'

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border ${c.bdr} ${c.bg} p-5 text-center`}>
        {phase === 'idle' ? (
          <>
            {timer.holdEditable && (
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-2">Haltezeit pro Runde anpassen</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => setHoldAdjust(a => a - 5)} className="w-9 h-9 rounded-full border border-slate-600 text-slate-300 text-lg">−</button>
                  <span className="text-2xl font-bold text-white tabular-nums w-20">{formatTime(holdFor(0))}</span>
                  <button onClick={() => setHoldAdjust(a => a + 5)} className="w-9 h-9 rounded-full border border-slate-600 text-slate-300 text-lg">+</button>
                </div>
              </div>
            )}
            <button onClick={start} className={`px-7 py-3 rounded-full text-white font-bold ${c.bar} active:scale-95 transition-transform`}>
              Tabelle starten
            </button>
          </>
        ) : phase === 'done' ? (
          <>
            <p className="text-teal-300 font-bold text-xl mb-1">✓ Alle Runden geschafft!</p>
            <p className="text-sm text-slate-400">Drücke Weiter, um fortzufahren.</p>
          </>
        ) : (
          <>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Runde {roundIdx + 1} von {rounds.length}</p>
            <p className={`text-base font-semibold mb-3 ${phase === 'hold' ? c.txt : 'text-teal-300'}`}>
              {phase === 'hold' ? '🫁  Atem anhalten' : '💨  Erholen & atmen'}
            </p>
            <div className="text-6xl font-bold text-white tabular-nums mb-4">{formatTime(left)}</div>
            <button onClick={advance} className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2">Phase überspringen</button>
          </>
        )}
      </div>

      {/* Rundenübersicht */}
      <div className="rounded-xl border border-slate-700/40 overflow-hidden">
        <div className="px-4 py-2 bg-slate-800/30 border-b border-slate-700/30">
          <p className="text-xs text-slate-500 uppercase tracking-widest">Rundenübersicht</p>
        </div>
        {rounds.map((round, i) => {
          const done = phase === 'done' || i < roundIdx
          const isActive = i === roundIdx && active
          return (
            <div key={i} className={`flex items-center gap-3 px-4 py-2.5 ${i < rounds.length - 1 ? 'border-b border-slate-700/30' : ''} ${isActive ? 'bg-blue-950/40' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${done ? 'bg-teal-500/30 text-teal-300' : isActive ? 'bg-blue-500/40 text-blue-200' : 'bg-slate-700/50 text-slate-500'}`}>
                {done ? '✓' : i + 1}
              </span>
              <div className="flex-1 flex items-center gap-3 text-xs">
                <span className={`font-semibold tabular-nums ${done || isActive ? 'text-white' : 'text-slate-500'}`}>{formatTime(holdFor(i))}</span>
                <span className="text-slate-600">halten</span>
                {round.rest > 0 && <>
                  <span className="text-slate-700">·</span>
                  <span className={`tabular-nums ${done || isActive ? 'text-slate-400' : 'text-slate-600'}`}>{formatTime(round.rest)}</span>
                  <span className="text-slate-600">Pause</span>
                </>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Walk & Hold – X Schritte halten + Pause
// ─────────────────────────────────────────────────────────────────────────────
function WalkHoldTimer({ timer, color }) {
  const c = tint(color)
  const rounds = timer.rounds
  const [roundIdx, setRoundIdx] = useState(0)
  const [phase, setPhase] = useState('idle') // idle | hold | rest | done
  const [left, setLeft] = useState(0)

  useEffect(() => {
    if (phase !== 'rest') return
    if (left <= 0) { nextRound(); return }
    const t = setInterval(() => setLeft(p => Math.max(0, p - 1)), 1000)
    return () => clearInterval(t)
  }, [phase, left]) // eslint-disable-line

  const startHold = () => { resumeAudio(); setPhase('hold'); playRoundCue('hold') }
  const stepsDone = () => {
    const rest = rounds[roundIdx].rest
    setPhase('rest'); setLeft(rest); playRoundCue('rest')
  }
  function nextRound() {
    const next = roundIdx + 1
    if (next < rounds.length) { setRoundIdx(next); setPhase('hold'); playRoundCue('hold') }
    else { setPhase('done'); playRoundCue('done') }
  }

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border ${c.bdr} ${c.bg} p-5 text-center`}>
        {phase === 'idle' ? (
          <button onClick={startHold} className={`px-7 py-3 rounded-full text-white font-bold ${c.bar} active:scale-95 transition-transform`}>Runde 1 starten</button>
        ) : phase === 'done' ? (
          <>
            <p className="text-teal-300 font-bold text-xl mb-1">✓ Alle Runden geschafft!</p>
            <p className="text-sm text-slate-400">Drücke Weiter, um fortzufahren.</p>
          </>
        ) : phase === 'hold' ? (
          <>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Runde {roundIdx + 1} von {rounds.length}</p>
            <p className={`text-base font-semibold mb-3 ${c.txt}`}>🚶  Ausatmen, halten & gehen</p>
            <p className="text-5xl font-bold text-white tabular-nums mb-1">{rounds[roundIdx].steps}</p>
            <p className="text-sm text-slate-400 mb-4">Schritte mit angehaltenem Atem</p>
            <button onClick={stepsDone} className={`px-6 py-2.5 rounded-full text-white font-semibold ${c.bar} active:scale-95 transition-transform`}>Schritte erledigt → einatmen</button>
          </>
        ) : (
          <>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Runde {roundIdx + 1} von {rounds.length}</p>
            <p className="text-base font-semibold mb-3 text-teal-300">💨  Pause (gehend, ruhig atmen)</p>
            <div className="text-6xl font-bold text-white tabular-nums mb-4">{formatTime(left)}</div>
            <button onClick={nextRound} className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2">Pause überspringen</button>
          </>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Halten bis Atemreiz (+ extra Sek), mehrere Runden mit Pausen
// ─────────────────────────────────────────────────────────────────────────────
function HoldReflexTimer({ timer, color, onMaxHold }) {
  const c = tint(color)
  const rounds = timer.rounds
  const [roundIdx, setRoundIdx] = useState(0)
  const [phase, setPhase] = useState('idle') // idle | hold | extra | rest | done
  const [elapsed, setElapsed] = useState(0)   // Stoppuhr während hold/extra
  const [extraLeft, setExtraLeft] = useState(0)
  const [restLeft, setRestLeft] = useState(0)

  // Stoppuhr (hold/extra zählt hoch)
  useEffect(() => {
    if (phase !== 'hold' && phase !== 'extra') return
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [phase])

  // Extra-Countdown
  useEffect(() => {
    if (phase !== 'extra') return
    if (extraLeft <= 0) { finishHold(); return }
    const t = setInterval(() => setExtraLeft(p => Math.max(0, p - 1)), 1000)
    return () => clearInterval(t)
  }, [phase, extraLeft]) // eslint-disable-line

  // Rest-Countdown
  useEffect(() => {
    if (phase !== 'rest') return
    if (restLeft <= 0) { nextRound(); return }
    const t = setInterval(() => setRestLeft(p => Math.max(0, p - 1)), 1000)
    return () => clearInterval(t)
  }, [phase, restLeft]) // eslint-disable-line

  const startHold = () => { resumeAudio(); setElapsed(0); setPhase('hold'); playRoundCue('hold') }
  const reizSpuert = () => {
    const extra = rounds[roundIdx].extra || 0
    if (extra > 0) { setExtraLeft(extra); setPhase('extra') }
    else finishHold()
  }
  function finishHold() {
    onMaxHold?.(elapsed)
    playRoundCue('rest')
    const rest = rounds[roundIdx].rest
    if (rest > 0) { setRestLeft(rest); setPhase('rest') }
    else nextRound()
  }
  function nextRound() {
    const next = roundIdx + 1
    if (next < rounds.length) { setRoundIdx(next); setElapsed(0); setPhase('idle') }
    else { setPhase('done'); playRoundCue('done') }
  }

  const multi = rounds.length > 1
  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border ${c.bdr} ${c.bg} p-6 text-center`}>
        {multi && phase !== 'done' && (
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Runde {roundIdx + 1} von {rounds.length}</p>
        )}
        {phase === 'idle' ? (
          <button onClick={startHold} className={`px-7 py-3 rounded-full text-white font-bold ${c.bar} active:scale-95 transition-transform`}>
            {roundIdx === 0 ? 'Einatmen & halten' : `Runde ${roundIdx + 1} – halten`}
          </button>
        ) : phase === 'done' ? (
          <>
            <p className="text-teal-300 font-bold text-xl mb-1">✓ Geschafft!</p>
            <p className="text-sm text-slate-400">Drücke Weiter, um fortzufahren.</p>
          </>
        ) : phase === 'rest' ? (
          <>
            <p className="text-base font-semibold mb-3 text-teal-300">💨  Erholen</p>
            <div className="text-6xl font-bold text-white tabular-nums mb-3">{formatTime(restLeft)}</div>
            <button onClick={nextRound} className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2">Pause überspringen</button>
          </>
        ) : (
          <>
            <p className={`text-base font-semibold mb-2 ${phase === 'extra' ? 'text-amber-300' : c.txt}`}>
              {phase === 'extra' ? '🔥  Im Reiz bleiben' : '🫁  Luft anhalten'}
            </p>
            <div className="text-6xl font-bold text-white tabular-nums mb-2">{formatTime(elapsed)}</div>
            {phase === 'extra' ? (
              <p className="text-amber-300 text-sm mb-4">noch {extraLeft}s · Nacken & Schultern locker</p>
            ) : (
              <p className="text-xs text-slate-500 mb-4">Stoppuhr läuft</p>
            )}
            {phase === 'hold' && (
              <button onClick={reizSpuert} className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-white font-bold active:scale-95 transition-transform">
                Atemreiz gespürt
              </button>
            )}
          </>
        )}
      </div>
      {timer.note && phase !== 'done' && <p className="text-xs text-slate-500 text-center px-4">{timer.note}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Maximalrunde – Stoppuhr bis „Beenden"
// ─────────────────────────────────────────────────────────────────────────────
function HoldMaxTimer({ note, color, onMaxHold }) {
  const c = tint(color)
  const [elapsed, setElapsed] = useState(0)
  const [phase, setPhase] = useState('idle') // idle | running | done

  useEffect(() => {
    if (phase !== 'running') return
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [phase])

  const start = () => { resumeAudio(); setElapsed(0); setPhase('running') }
  const stop = () => { onMaxHold?.(elapsed); playRoundCue('done'); setPhase('done') }

  return (
    <div className={`rounded-2xl border ${c.bdr} ${c.bg} p-6 text-center space-y-3`}>
      {phase === 'idle' ? (
        <button onClick={start} className={`px-7 py-3 rounded-full text-white font-bold ${c.bar} active:scale-95 transition-transform`}>Einatmen & halten</button>
      ) : (
        <>
          <p className={`text-base font-semibold ${phase === 'done' ? 'text-teal-300' : c.txt}`}>{phase === 'done' ? '✓ Gehalten' : '🫁  Maximalrunde'}</p>
          <div className="text-6xl font-bold text-white tabular-nums">{formatTime(elapsed)}</div>
          {phase === 'running'
            ? <button onClick={stop} className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold active:scale-95 transition-transform">Beenden & ausatmen</button>
            : <p className="text-sm text-slate-400">Drücke Weiter, um fortzufahren.</p>}
        </>
      )}
      {note && phase !== 'done' && <p className="text-xs text-slate-500">{note}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Dispatcher: rendert den passenden Timer für einen Schritt
// ─────────────────────────────────────────────────────────────────────────────
function StepTimer({ step, onMaxHold }) {
  const t = step.timer
  if (!t || t.kind === 'manual') return null
  if (t.kind === 'countdown')   return <CountdownTimer duration={t.duration} color={step.color} />
  if (t.kind === 'breathing')   return <BreathingTimer timer={t} color={step.color} onMaxHold={onMaxHold} />
  if (t.kind === 'hold-table')  return <HoldTableTimer timer={t} color={step.color} onMaxHold={onMaxHold} />
  if (t.kind === 'walk-hold')   return <WalkHoldTimer timer={t} color={step.color} />
  if (t.kind === 'hold-reflex') return <HoldReflexTimer timer={t} color={step.color} onMaxHold={onMaxHold} />
  if (t.kind === 'hold-max')    return <HoldMaxTimer note={t.note} color={step.color} onMaxHold={onMaxHold} />
  if (t.kind === 'stages')      return <BrustkorbStageGuide stages={t.stages} />
  return null
}

// ═════════════════════════════════════════════════════════════════════════════
// ActiveSession – Controller
// ═════════════════════════════════════════════════════════════════════════════
export default function ActiveSession({ session, onComplete, onCancel }) {
  const steps = session.steps
  const isApnoe = session.goal === 'apnoe'

  const [stepIdx, setStepIdx] = useState(0)
  const [screen, setScreen] = useState('step') // 'step' | 'complete'
  const [showSafety, setShowSafety] = useState(!!session.safety)
  const maxHoldRef = useRef(0)

  const [holdMin, setHoldMin] = useState('')
  const [holdSec, setHoldSec] = useState('')

  const step = steps[stepIdx]
  const c = tint(step?.color)

  const recordHold = (sec) => { if (sec > maxHoldRef.current) maxHoldRef.current = sec }

  function handleWeiter() {
    if (stepIdx >= steps.length - 1) {
      // Haltezeit vorbefüllen
      if (isApnoe && maxHoldRef.current > 0) {
        setHoldMin(String(Math.floor(maxHoldRef.current / 60)))
        setHoldSec(String(maxHoldRef.current % 60))
      }
      playEndTone()
      setScreen('complete')
    } else {
      playStepCue()
      setStepIdx(i => i + 1)
    }
  }

  function handleComplete() {
    const maxHold = isApnoe ? (parseInt(holdMin) || 0) * 60 + (parseInt(holdSec) || 0) : 0
    onComplete({
      date: new Date().toISOString(),
      type: session.type,
      moduleId: session.moduleId,
      goal: session.goal,
      label: session.label,
      maxHold,
      rounds: [],
      notes: '',
    })
  }

  // ── COMPLETE ───────────────────────────────────────────────────────────────
  if (screen === 'complete') {
    const maxHoldSec = (parseInt(holdMin) || 0) * 60 + (parseInt(holdSec) || 0)
    return (
      <div className="fixed inset-0 z-[80] bg-[#050e1f] flex flex-col items-center justify-center px-6">
        <p className="text-6xl mb-5">{isApnoe ? '🫁' : '✨'}</p>
        <h2 className="text-2xl font-bold text-white mb-2 text-center">{session.label} geschafft!</h2>
        <p className="text-slate-400 text-center mb-8 text-sm leading-relaxed max-w-xs">
          {isApnoe ? 'Trage deine beste Luftanhaltezeit ein, um deinen Fortschritt Richtung 3 Minuten zu verfolgen.' : 'Stark – nimm dir noch einen Moment zum Nachspüren.'}
        </p>

        {isApnoe && (
          <div className="w-full max-w-xs mb-6">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 text-center">Beste Luftanhaltezeit heute (MM:SS)</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input type="number" min="0" max="10" value={holdMin} onChange={e => setHoldMin(e.target.value)} placeholder="0"
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-4 text-2xl font-bold text-white text-center focus:outline-none focus:border-blue-500/50" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">Min</span>
              </div>
              <span className="text-3xl text-slate-500 font-light">:</span>
              <div className="flex-1 relative">
                <input type="number" min="0" max="59" value={holdSec} onChange={e => setHoldSec(e.target.value)} placeholder="00"
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-4 text-2xl font-bold text-white text-center focus:outline-none focus:border-blue-500/50" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">Sek</span>
              </div>
            </div>
            {maxHoldSec > 0 && <p className="text-center text-sm text-blue-300 mt-2">{formatTime(maxHoldSec)}</p>}
          </div>
        )}

        <button
          onClick={handleComplete}
          disabled={isApnoe && maxHoldSec < 5}
          className="w-full max-w-xs py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-lg transition-colors active:scale-95"
        >
          Training abschließen
        </button>
      </div>
    )
  }

  // ── STEP ─────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[80] bg-[#050e1f] flex flex-col">
      {/* Kopf: Fortschritt */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-800/60 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-700/50 text-slate-400 hover:text-white flex-shrink-0 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-slate-300">Schritt {stepIdx + 1} von {steps.length}</span>
              <span className="text-xs text-slate-500 truncate ml-2">{session.label}</span>
            </div>
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < stepIdx ? 'bg-blue-500' : i === stepIdx ? 'bg-blue-400' : 'bg-slate-700'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inhalt */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {/* Sicherheitshinweis (einmalig, einklappbar) */}
        {showSafety && session.safety && (
          <div className="rounded-2xl border border-amber-600/40 bg-amber-900/15 p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-semibold text-amber-300 flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
                Sicherheit zuerst
              </p>
              <button onClick={() => setShowSafety(false)} className="text-xs text-amber-300/70 hover:text-amber-200">Verstanden</button>
            </div>
            <ul className="space-y-1.5">
              {session.safety.map((s, i) => (
                <li key={i} className="text-xs text-amber-100/80 flex items-start gap-2"><span className="text-amber-500 mt-0.5">·</span>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Schritt-Info mit vollem Wortlaut */}
        <div className={`rounded-2xl border ${c.bdr} ${c.bg} p-5`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              {step.role && <span className={`text-xs font-semibold uppercase tracking-widest ${c.txt}`}>{step.role}</span>}
              <h2 className="text-2xl font-bold text-white mt-0.5 leading-tight">{step.name}</h2>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{step.text}</p>
        </div>

        {/* Timer */}
        <StepTimer key={step.id} step={step} onMaxHold={recordHold} />
      </div>

      {/* Fußzeile: Weiter */}
      <div className="px-4 pt-3 pb-6 safe-bottom border-t border-slate-800/60 flex-shrink-0 bg-[#050e1f]">
        <button onClick={handleWeiter} className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2">
          {stepIdx < steps.length - 1 ? 'Weiter' : 'Abschluss'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  )
}
