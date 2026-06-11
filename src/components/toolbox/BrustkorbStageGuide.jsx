import { useState, useEffect, useRef } from 'react'
import { playStepCue, playEndTone, resumeAudio } from '../../audio/AudioManager'

const STAGE_TINT = {
  cyan:   { bdr: 'border-cyan-500/30',   bg: 'bg-cyan-500/10',   txt: 'text-cyan-300',   bar: 'bg-cyan-500',   btn: 'from-cyan-500 to-cyan-600'   },
  blue:   { bdr: 'border-blue-500/30',   bg: 'bg-blue-500/10',   txt: 'text-blue-300',   bar: 'bg-blue-500',   btn: 'from-blue-500 to-blue-600'   },
  purple: { bdr: 'border-purple-500/30', bg: 'bg-purple-500/10', txt: 'text-purple-300', bar: 'bg-purple-500', btn: 'from-purple-500 to-purple-600' },
}

function fmt(s) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

function StageRunner({ stage, onExit }) {
  const c = STAGE_TINT[stage.color] || STAGE_TINT.cyan
  const steps = stage.steps
  const [stepIdx, setStepIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(steps[0]?.duration ?? 60)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const timerRef = useRef(null)

  const step = steps[stepIdx]
  const progress = step ? 1 - timeLeft / step.duration : 0

  useEffect(() => {
    if (!running) return
    timerRef.current = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) {
          clearInterval(timerRef.current)
          setRunning(false)
          playStepCue()
          return 0
        }
        return p - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [running])

  const startStep = () => {
    resumeAudio()
    if (timeLeft === 0) setTimeLeft(step.duration)
    setRunning(true)
  }

  const pauseStep = () => setRunning(false)

  const nextStep = () => {
    if (stepIdx >= steps.length - 1) {
      setDone(true)
      playEndTone()
      return
    }
    const ni = stepIdx + 1
    setStepIdx(ni)
    setTimeLeft(steps[ni].duration)
    setRunning(false)
    playStepCue()
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-teal-500/40 bg-teal-500/10 p-5 text-center space-y-3">
        <p className="text-4xl">🎉</p>
        <p className="text-teal-300 font-semibold">Stufe abgeschlossen</p>
        <p className="text-xs text-slate-400">Spüre nach – tief atmen, Wahrnehmung integrieren.</p>
        <button
          onClick={onExit}
          className="mt-2 px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors"
        >
          Zurück zur Stufenauswahl
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header: progress dots */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onExit}
          className="text-xs text-slate-500 hover:text-slate-300 underline-offset-2 hover:underline"
        >
          ← Stufe wechseln
        </button>
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${
              i < stepIdx ? `${c.bar} w-4` :
              i === stepIdx ? `${c.bar} w-6` :
              'bg-slate-700 w-4'
            }`} />
          ))}
        </div>
        <span className="text-xs text-slate-500 tabular-nums">
          {stepIdx + 1}/{steps.length}
        </span>
      </div>

      {/* Step card */}
      <div className={`rounded-2xl border ${c.bdr} ${c.bg} p-4`}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className={`text-base font-semibold ${c.txt} flex-1`}>{step.title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full border ${c.bdr} ${c.txt} flex-shrink-0`}>
            {fmt(step.duration)}
          </span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{step.text}</p>
      </div>

      {/* Timer */}
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="45" fill="none"
              stroke={c.color === 'purple' ? '#a855f7' : c.color === 'blue' ? '#3b82f6' : '#22d3ee'}
              strokeLinecap="round"
              strokeWidth="6"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - progress}
              style={{ transition: 'stroke-dashoffset 0.5s linear' }}
            />
          </svg>
          <div className="text-center">
            <p className="text-4xl font-bold text-white tabular-nums">{fmt(timeLeft)}</p>
            <p className="text-xs text-slate-500 mt-1">verbleibend</p>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={running ? pauseStep : startStep}
            className={`px-6 h-12 rounded-full bg-gradient-to-r ${c.btn} text-white font-semibold text-sm flex items-center gap-2 active:scale-95 transition-all`}
          >
            {running ? (
              <>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5">
                  <path d="M5 3l14 9-14 9V3z"/>
                </svg>
                {timeLeft === step.duration ? 'Start' : timeLeft === 0 ? 'Neu starten' : 'Fortsetzen'}
              </>
            )}
          </button>
          <button
            onClick={nextStep}
            className="px-5 h-12 rounded-full border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 transition-colors text-sm font-medium flex items-center gap-1.5"
          >
            {stepIdx >= steps.length - 1 ? 'Fertig' : 'Weiter'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BrustkorbStageGuide({ stages, initialStage = null }) {
  const [activeStageId, setActiveStageId] = useState(initialStage)

  const activeStage = stages.find(s => s.id === activeStageId)

  if (activeStage) {
    return <StageRunner stage={activeStage} onExit={() => setActiveStageId(null)} />
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 uppercase tracking-widest">Stufe wählen</p>
      <div className="grid gap-2.5">
        {stages.map(stage => {
          const c = STAGE_TINT[stage.color] || STAGE_TINT.cyan
          return (
            <button
              key={stage.id}
              onClick={() => setActiveStageId(stage.id)}
              className={`text-left rounded-xl border ${c.bdr} ${c.bg} p-4 hover:brightness-110 active:scale-[0.98] transition-all`}
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className={`text-base font-bold ${c.txt}`}>{stage.name}</h3>
                <span className="text-xs text-slate-400">{stage.duration}</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{stage.description}</p>
              <p className="text-xs text-slate-500 mt-2">{stage.steps.length} Schritte</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
