import { useState, useEffect } from 'react'
import Navigation from './components/Navigation'
import ToolboxPage from './components/toolbox/ToolboxPage'
import TrainingPage from './components/training/TrainingPage'
import AudioActivationBanner from './components/AudioActivationBanner'
import SettingsSheet from './components/SettingsSheet'
import { isAudioActivated, isAudioSuspended, resumeAudio } from './audio/AudioManager'

export default function App() {
  const [activeTab, setActiveTab] = useState('toolbox')
  const [showBanner, setShowBanner] = useState(!isAudioActivated())
  const [showSettings, setShowSettings] = useState(false)
  const [audioSuspended, setAudioSuspended] = useState(false)

  useEffect(() => {
    const checkAudio = () => {
      setAudioSuspended(isAudioSuspended())
    }
    document.addEventListener('visibilitychange', checkAudio)
    window.addEventListener('pageshow', checkAudio)
    window.addEventListener('focus', checkAudio)
    return () => {
      document.removeEventListener('visibilitychange', checkAudio)
      window.removeEventListener('pageshow', checkAudio)
      window.removeEventListener('focus', checkAudio)
    }
  }, [])

  const handleResumeAudio = () => {
    resumeAudio().then(() => setAudioSuspended(false))
  }

  return (
    <div className="min-h-full max-w-lg mx-auto relative">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
        />
      </div>

      {/* Page content */}
      <div className="relative z-0">
        {activeTab === 'toolbox' && <ToolboxPage />}
        {activeTab === 'training' && <TrainingPage />}
      </div>

      <Navigation active={activeTab} onChange={setActiveTab} onSettings={() => setShowSettings(true)} />

      {/* Resume button — floats above nav when AudioContext is suspended */}
      {audioSuspended && !showBanner && (
        <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <button
            onClick={handleResumeAudio}
            onTouchStart={handleResumeAudio}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/90 backdrop-blur-sm text-white text-sm font-medium shadow-lg shadow-black/30 active:bg-amber-600 transition-colors"
          >
            🔊 Ton neu aktivieren
          </button>
        </div>
      )}

      {showBanner && <AudioActivationBanner onActivated={() => setShowBanner(false)} />}
      {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}
    </div>
  )
}
