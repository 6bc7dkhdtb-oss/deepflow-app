export default function Navigation({ active, onChange }) {
  const tabs = [
    {
      id: 'toolbox',
      label: 'Toolbox',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <line x1="12" y1="12" x2="12" y2="16" />
          <line x1="10" y1="14" x2="14" y2="14" />
        </svg>
      ),
    },
    {
      id: 'training',
      label: 'Training',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#080f1e]/95 backdrop-blur-md border-t border-blue-900/30 safe-bottom">
      <div className="flex max-w-lg mx-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
              active === tab.id
                ? 'text-blue-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.icon}
            <span className="text-xs font-medium tracking-wide">{tab.label}</span>
            {active === tab.id && (
              <span className="absolute bottom-0 w-10 h-0.5 bg-blue-400 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
