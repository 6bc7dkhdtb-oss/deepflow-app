import { useState, useEffect, useRef } from 'react'
import { playStepCue, playEndTone, playPhaseSound, resumeAudio } from '../../audio/AudioManager'

const STAGE_COLORS = {
  orange: { ring: '#fb923c', glow: 'rgba(251,146,60,0.35)', label: 'text-orange-300', bg: 'bg-orange-500/15', bdr: 'border-orange-500/30', bar: 'bg-orange-500' },
  teal:   { ring: '#2dd4bf', glow: 'rgba(45,212,191,0.30)', label: 'text-teal-300',   bg: 'bg-teal-500/15',   bdr: 'border-teal-500/30',   bar: 'bg-teal-500'   },
  pink:   { ring: '#f472b6', glow: 'rgba(244,114,182,0.30)',label: 'text-pink-300',   bg: 'bg-pink-500/15',   bdr: 'border-pink-500/30',   bar: 'bg-pink-500'   },
  blue:   { ring: '#3b82f6', glow: 'rgba(59,130,246,0.30)', label: 'text-blue-300',   bg: 'bg-blue-500/15',   bdr: 'border-blue-500/30',   bar: 'bg-blue-500'   },
  amber:  { ring: '#f59e0b', glow: 'rgba(245,158,11,0.30)', label: 'text-amber-300',  bg: 'bg-amber-500/15',  bdr: 'border-amber-500/30',  bar: 'bg-amber-500'  },
  purple: { ring: '#a855f7', glow: 'rgba(168,85,247,0.30)', label: 'text-purple-300', bg: 'bg-purple-500/15', bdr: 'border-purple-500/30', bar: 'bg-purple-500' },
  cyan:   { ring: '#22d3ee', glow: 'rgba(34,211,238,0.30)', label: 'text-cyan-300',   bg: 'bg-cyan-500/15',   bdr: 'border-cyan-500/30',   bar: 'bg-cyan-500'   },
}

function fmt(s) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function GuidedSequenceTimer({ sequence, onClose }) {
  const stages = sequence.stages
  const totalDuration = stages.reduce((sum, s) => sum + s.duration, 0)

  const [running, setRunning]   = useState(false)
  const [stageIdx, setStageIdx] = useState(0)
  const [stageLeft, setStageLeft] = useState(stages[0].duration)
  const [totalElapsed, setTotalElapsed] = useState(0)
  const [finished, setFinished] = useState(false)

  const timerRef = useRef(null)
  const stageIdxRef = useRef(0)
  stageIdxRef.current = stageIdx

  const stage = stages[stageIdx]
  const colors = STAGE_COLORS[stage?.color] || STAGE_COLORS.blue

  useEffect(() => {
    if (!running) return
    timerRef.current = setInterval(() => {
      setStageLeft(prev => {
        if (prev <= 1) {
          // advance
          const next = stageIdxRef.current + 1
          if (next >= stages.length) {
            clearInterval(timerRef.current)
            setRunning(false)
            setFinished(true)
            playEndTone()
            return 0
          }
          setStageIdx(next)
          playStepCue()
          return stages[next].duration
        }
        return prev - 1
      })
      setTotalElapsed(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [running, stages])

  // Beat tone every ~10s as a heartbeat inside long stages
  useEffect(() => {
    if (!running || !stage) return
    const beat = setInterval(() => {
      const stageElapsed = stage.duration - stageLeft
      if (stageElapsed > 0 && stageElapsed % 30 === 0) {
        playPhaseSound('hold')
      }
    }, 1000)
    return () => clearInterval(beat)
  }, [running, stageLeft, stage])

  const start = () => {
    resumeAudio()
    if (finished) {
      setStageIdx(0)
      setStageLeft(stages[0].duration)
      setTotalElapsed(0)
      setFinished(false)
    }
    playStepCue()
    setRunning(true)
  }

  const pause = () => setRunning(false)

  const reset = () => {
    setRunning(false)
    setStageIdx(0)
    setStageLeft(stages[0].duration)
    setTotalElapsed(0)
    setFinished(false)
  }

  const skip = () => {
    const next = stageIdx + 1
    if (next >= stages.length) {
      setRunning(false)
      setFinished(true)
      playEndTone()
      return
    }
    setStageIdx(next)
    setStageLeft(stages[next].duration)
    playStepCue()
  }

  const stageProgress = stage ? 1 - stageLeft / stage.duration : 0
  const totalProgress = totalDuration > 0 ? totalElapsed / totalDuration : 0

  return (
    <div className="flex flex-col gap-5 py-4">
      {/* Total progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 uppercase tracking-widest">Gesamtfortschritt</span>
          <span className="text-slate-300 tabular-nums">{fmt(totalElapsed)} / {fmt(totalDuration)}</span>
        </div>
        <div className="h-1.5 bg-slate-700/40 rounded-full overflow-hidden flex">
          {stages.map((s, i) => {
            const isPast = i < stageIdx
            const isCurrent = i === stageIdx && running
            const widthPct = (s.duration / totalDuration) * 100
            return (
              <div
                key={i}
                className="h-full transition-colors"
                style={{
                  width: `${widthPct}%`,
                  background: isPast
                    ? STAGE_COLORS[s.color]?.ring || '#3b82f6'
                    : isCurrent
                    ? `linear-gradient(90deg, ${STAGE_COLORS[s.color]?.ring || '#3b82f6'} ${stageProgress * 100}%, rgba(51,65,85,0.3) ${stageProgress * 100}%)`
                    : 'transparent',
                  borderRight: i < stages.length - 1 ? '1px solid #0a1526' : 'none',
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Finished banner */}
      {finished && (
        <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 px-4 py-3 text-center text-teal-300 text-sm font-medium">
          🎉 DeepFlow abgeschlossen – verweile noch einen Moment.
        </div>
      )}

      {/* Current stage card */}
      {stage && !finished && (
        <div className={`rounded-2xl border ${colors.bdr} ${colors.bg} p-4`}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Stufe {stageIdx + 1} von {stages.length}
              </p>
              <h3 className={`text-lg font-bold mt-0.5 ${colors.label}`}>{stage.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{stage.short}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full border ${colors.bdr} ${colors.label} flex-shrink-0`}>
              {fmt(stage.duration)}
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mt-2">{stage.long}</p>
        </div>
      )}

      {/* Big countdown */}
      {stage && (
        <div className="relative flex items-center justify-center" style={{ height: 200 }}>
          <div
            className="absolute rounded-full transition-all duration-1000"
            style={{
              width: 180, height: 180,
              background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
              opacity: running ? 1 : 0.5,
            }}
          />
          <svg width={200} height={200} className="absolute">
            <circle cx={100} cy={100} r={80}
              fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <circle cx={100} cy={100} r={80}
              fill="none" stroke={colors.ring} strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 80}
              strokeDashoffset={2 * Math.PI * 80 * (1 - stageProgress)}
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dashoffset 0.5s linear' }}
            />
          </svg>
          <div className="rounded-full flex flex-col items-center justify-center"
            style={{ width: 130, height: 130, background: 'rgba(10,22,42,0.85)', border: `1px solid ${colors.ring}40` }}
          >
            <span className="text-4xl font-bold text-white tabular-nums">{fmt(stageLeft)}</span>
            <span className="text-xs text-slate-500 mt-1">verbleibend</span>
          </div>
        </div>
      )}

      {/* Stage chips */}
      <div className="flex flex-wrap gap-1.5">
        {stages.map((s, i) => {
          const sc = STAGE_COLORS[s.color] || STAGE_COLORS.blue
          const isDone = i < stageIdx || finished
          const isCurr = i === stageIdx && !finished
          return (
            <div
              key={i}
              className={`text-xs px-2 py-1 rounded-full border ${
                isCurr ? `${sc.bdr} ${sc.label} ${sc.bg}` :
                isDone ? 'border-teal-500/30 text-teal-300 bg-teal-500/10' :
                'border-slate-700/50 text-slate-500 bg-slate-800/30'
              }`}
            >
              {isDone ? '✓ ' : `${i + 1}. `}{s.name}
            </div>
          )
        })}
      </div>

      {/* Controls */}
      <div className="flex gap-3 items-center justify-center">
        <button
          onClick={reset}
          className="w-12 h-12 rounded-full border border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-400 transition-colors"
          aria-label="Reset"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M1 4v6h6M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
        </button>
        <button
          onClick={running ? pause : start}
          className="px-7 h-16 rounded-full text-white font-bold text-base transition-all active:scale-95 flex items-center gap-2"
          style={{ background: `linear-gradient(135deg, ${colors.ring}, ${colors.ring}99)` }}
        >
          {running ? (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              Pause
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1"><path d="M5 3l14 9-14 9V3z"/></svg>
              {finished ? 'Neu starten' : totalElapsed > 0 ? 'Fortsetzen' : 'Start'}
            </>
          )}
        </button>
        <button
          onClick={skip}
          disabled={finished}
          className="w-12 h-12 rounded-full border border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-400 disabled:opacity-30 transition-colors"
          aria-label="Stufe überspringen"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors text-center pt-1"
        >
          Sequenz schließen
        </button>
      )}
    </div>
  )
}
