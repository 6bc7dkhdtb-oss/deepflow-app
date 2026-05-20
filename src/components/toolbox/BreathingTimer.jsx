import { useState, useEffect, useRef, useCallback } from 'react'
import { useAudio } from '../../hooks/useAudio'

const PHASE_COLORS = {
  in: { ring: '#3b82f6', glow: 'rgba(59,130,246,0.35)', label: 'text-blue-300' },
  out: { ring: '#6366f1', glow: 'rgba(99,102,241,0.3)', label: 'text-indigo-300' },
  hold: { ring: '#06b6d4', glow: 'rgba(6,182,212,0.3)', label: 'text-cyan-300' },
  pause: { ring: '#8b5cf6', glow: 'rgba(139,92,246,0.3)', label: 'text-purple-300' },
}

export default function BreathingTimer({ pattern, onClose }) {
  const [running, setRunning] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const intervalRef = useRef(null)
  const { playPhaseSound } = useAudio()

  const phases = pattern.phases
  const currentPhase = phases[phaseIndex]
  const phaseDuration = currentPhase.duration
  const progress = elapsed / phaseDuration
  const remaining = Math.ceil(phaseDuration - elapsed)
  const colors = PHASE_COLORS[currentPhase.type]

  const nextPhase = useCallback(() => {
    setElapsed(0)
    setPhaseIndex(prev => {
      const next = (prev + 1) % phases.length
      if (next === 0) setCycleCount(c => c + 1)
      playPhaseSound(phases[next].type)
      return next
    })
  }, [phases, playPhaseSound])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 0.1
        if (next >= phaseDuration) {
          nextPhase()
          return 0
        }
        return next
      })
    }, 100)
    return () => clearInterval(intervalRef.current)
  }, [running, phaseDuration, nextPhase])

  const toggle = () => {
    if (!running) {
      playPhaseSound(currentPhase.type)
    }
    setRunning(r => !r)
  }

  const reset = () => {
    setRunning(false)
    setPhaseIndex(0)
    setElapsed(0)
    setCycleCount(0)
  }

  // Circle animation values
  const circleSize = 200
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const strokeDash = circumference * (1 - progress)

  // Scale animation
  const isExpanding = currentPhase.type === 'in'
  const isHolding = currentPhase.type === 'hold' || currentPhase.type === 'pause'
  const scale = isExpanding
    ? 0.75 + 0.25 * progress
    : isHolding
    ? currentPhase.type === 'hold' ? 1 : 0.75
    : 1 - 0.25 * progress

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Phase name */}
      <div className="text-center">
        <p className={`text-lg font-semibold ${colors.label}`}>
          {currentPhase.name}
        </p>
        <p className="text-sm text-slate-400 mt-1">{currentPhase.instruction}</p>
      </div>

      {/* SVG Circle */}
      <div className="relative flex items-center justify-center" style={{ width: circleSize, height: circleSize }}>
        {/* Glow */}
        <div
          className="absolute rounded-full transition-all duration-500"
          style={{
            width: circleSize * 0.9,
            height: circleSize * 0.9,
            background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
            transform: `scale(${scale})`,
          }}
        />
        {/* SVG ring */}
        <svg width={circleSize} height={circleSize} className="absolute">
          {/* Background track */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="6"
          />
          {/* Progress ring */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke={colors.ring}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDash}
            transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
            style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.5s ease' }}
          />
        </svg>
        {/* Inner circle */}
        <div
          className="rounded-full flex items-center justify-center transition-transform duration-200"
          style={{
            width: radius * 1.4,
            height: radius * 1.4,
            background: 'rgba(10,22,42,0.9)',
            border: `1px solid ${colors.ring}30`,
            transform: `scale(${scale})`,
          }}
        >
          <span className="text-4xl font-light text-white tabular-nums">{remaining}</span>
        </div>
      </div>

      {/* Cycle counter */}
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <span>Runde {cycleCount + 1}</span>
        <span className="text-slate-600">•</span>
        <span className="flex gap-1">
          {phases.map((p, i) => (
            <span
              key={i}
              className={`inline-block w-1.5 h-1.5 rounded-full transition-colors ${
                i === phaseIndex ? 'bg-blue-400' : 'bg-slate-600'
              }`}
            />
          ))}
        </span>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mt-2">
        <button
          onClick={reset}
          className="w-12 h-12 rounded-full border border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-400 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M1 4v6h6M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
        </button>

        <button
          onClick={toggle}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-all"
          style={{ background: `linear-gradient(135deg, ${colors.ring}, ${colors.ring}99)` }}
        >
          {running ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 ml-1">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          )}
        </button>

        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full border border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-400 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Phase overview */}
      <div className="w-full grid grid-cols-4 gap-2 mt-2">
        {phases.map((p, i) => (
          <div
            key={i}
            className={`rounded-lg p-2 text-center text-xs border transition-all ${
              i === phaseIndex
                ? 'border-blue-500/50 bg-blue-500/10'
                : 'border-slate-700/50 bg-slate-800/30'
            }`}
          >
            <div className="text-slate-300 font-medium">{p.name}</div>
            <div className="text-slate-500 mt-0.5">{p.duration}s</div>
          </div>
        ))}
      </div>
    </div>
  )
}
