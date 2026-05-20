import { useState } from 'react'
import { CATEGORY_COLORS } from '../../data/exercises'
import BreathingTimer from './BreathingTimer'
import AudioPlayer from './AudioPlayer'

export default function ExerciseDetail({ exercise, onBack }) {
  const [showTimer, setShowTimer] = useState(false)
  const [openStep, setOpenStep] = useState(null)
  const colors = CATEGORY_COLORS[exercise.category]

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#050e1f]/95 backdrop-blur-sm border-b border-slate-800/60 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-white truncate">{exercise.name}</h1>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border} flex-shrink-0`}>
          {exercise.duration}
        </span>
      </div>

      <div className="flex-1 px-4 py-5 space-y-5 pb-32">
        {/* Icon + Intro */}
        <div className={`rounded-2xl p-5 border ${colors.border} ${colors.bg}`}>
          <div className="flex items-start gap-4">
            <span className="text-3xl mt-0.5">{exercise.icon}</span>
            <div>
              <p className="text-sm text-slate-300 leading-relaxed">{exercise.intro}</p>
              <p className="text-xs text-slate-500 mt-3 italic">{exercise.source}</p>
            </div>
          </div>
        </div>

        {/* Breathing Timer */}
        {exercise.hasTimer && exercise.timerPattern && (
          <div className="rounded-2xl border border-blue-900/40 bg-blue-950/20 overflow-hidden">
            <button
              onClick={() => setShowTimer(s => !s)}
              className="w-full flex items-center justify-between px-4 py-3.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-blue-400">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-300">Atemrhythmus-Timer</p>
                  <p className="text-xs text-slate-500">
                    {exercise.timerPattern.phases.map(p => `${p.name} ${p.duration}s`).join(' → ')}
                  </p>
                </div>
              </div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`w-4 h-4 text-slate-400 transition-transform ${showTimer ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {showTimer && (
              <div className="px-4 pb-4 border-t border-blue-900/30">
                <BreathingTimer
                  pattern={exercise.timerPattern}
                  onClose={() => setShowTimer(false)}
                />
              </div>
            )}
          </div>
        )}

        {/* Steps */}
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Schritt-für-Schritt Anleitung
          </h2>
          <div className="space-y-2">
            {exercise.steps.map((step, i) => (
              <button
                key={i}
                onClick={() => setOpenStep(openStep === i ? null : i)}
                className="w-full text-left rounded-xl border border-slate-700/50 bg-slate-800/40 overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${colors.bg} ${colors.text}`}>
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-200 flex-1">{step.title}</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`w-4 h-4 text-slate-500 transition-transform flex-shrink-0 ${openStep === i ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                {openStep === i && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-slate-300 leading-relaxed">{step.text}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        {exercise.tips && exercise.tips.length > 0 && (
          <div className="rounded-xl border border-amber-700/30 bg-amber-900/10 p-4">
            <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Tipps & Hinweise
            </h3>
            <ul className="space-y-2">
              {exercise.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">·</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Audio Player */}
        <AudioPlayer />
      </div>
    </div>
  )
}
