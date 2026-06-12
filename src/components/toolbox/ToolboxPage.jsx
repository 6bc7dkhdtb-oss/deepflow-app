import { useState } from 'react'
import { exercises, CATEGORIES, CATEGORY_COLORS } from '../../data/exercises'
import ExerciseDetail from './ExerciseDetail'

function ExerciseCard({ exercise, onClick, showCategory = false }) {
  const colors = CATEGORY_COLORS[exercise.category]
  const catLabel = CATEGORIES.find(c => c.id === exercise.category)?.label || ''

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-slate-700/40 bg-slate-800/50 p-4 hover:border-blue-700/40 hover:bg-slate-800/80 active:scale-[0.98] transition-all"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{exercise.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-semibold text-white">{exercise.name}</h3>
          </div>
          <p className="text-xs text-slate-400 leading-snug mb-2 line-clamp-2">{exercise.shortDesc}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {showCategory && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                {catLabel}
              </span>
            )}
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {exercise.duration}
            </span>
            {exercise.hasTimer && (
              <span className="text-xs text-blue-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                Timer
              </span>
            )}
            {exercise.audioFile && (
              <span className="text-xs text-indigo-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
                Audio
              </span>
            )}
          </div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-600 flex-shrink-0 mt-1">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </button>
  )
}

function CategoryCard({ category, count, onClick }) {
  const colors = CATEGORY_COLORS[category.id]
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border ${colors.border} ${colors.bg} p-5 hover:brightness-125 active:scale-[0.98] transition-all`}
    >
      <div className="flex items-center gap-4">
        <span className="text-3xl">{category.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className={`text-base font-bold ${colors.text}`}>{category.label}</h3>
          <p className="text-xs text-slate-400 leading-snug mt-0.5">{category.desc}</p>
          <p className="text-xs text-slate-500 mt-1.5">{count} Übungen</p>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-slate-500 flex-shrink-0">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </button>
  )
}

export default function ToolboxPage() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [search, setSearch] = useState('')

  if (selectedExercise) {
    return (
      <ExerciseDetail
        exercise={selectedExercise}
        onBack={() => setSelectedExercise(null)}
      />
    )
  }

  const searching = search.trim().length > 0
  const searchResults = searching
    ? exercises.filter(ex =>
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.shortDesc.toLowerCase().includes(search.toLowerCase()))
    : []

  const activeCat = CATEGORIES.find(c => c.id === selectedCategory) || null
  const catExercises = activeCat ? exercises.filter(ex => ex.category === activeCat.id) : []

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#050e1f]/95 backdrop-blur-sm">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-3 mb-4">
            {activeCat && !searching && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-700/50 text-slate-400 hover:text-white flex-shrink-0 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white truncate">
                {activeCat && !searching ? activeCat.label : 'Übungs-Toolbox'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeCat && !searching ? activeCat.desc : 'nach Tom Sietas'}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Übung suchen…"
              className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
        </div>
        <div className="h-px bg-slate-800/60" />
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-4 space-y-3 pb-28">
        {searching ? (
          searchResults.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <p className="text-4xl mb-3">🔍</p>
              <p>Keine Übungen gefunden</p>
            </div>
          ) : (
            searchResults.map(ex => (
              <ExerciseCard key={ex.id} exercise={ex} showCategory onClick={() => setSelectedExercise(ex)} />
            ))
          )
        ) : activeCat ? (
          catExercises.map(ex => (
            <ExerciseCard key={ex.id} exercise={ex} onClick={() => setSelectedExercise(ex)} />
          ))
        ) : (
          CATEGORIES.map(cat => (
            <CategoryCard
              key={cat.id}
              category={cat}
              count={exercises.filter(ex => ex.category === cat.id).length}
              onClick={() => setSelectedCategory(cat.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
