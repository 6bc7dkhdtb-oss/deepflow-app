import { useState } from 'react'
import Navigation from './components/Navigation'
import ToolboxPage from './components/toolbox/ToolboxPage'
import TrainingPage from './components/training/TrainingPage'
import AudioActivationBanner from './components/AudioActivationBanner'
import SettingsSheet from './components/SettingsSheet'
import { isAudioActivated } from './audio/AudioManager'

export default function App() {
  const [activeTab, setActiveTab] = useState('toolbox')
  const [showBanner, setShowBanner] = useState(!isAudioActivated())
  const [showSettings, setShowSettings] = useState(false)

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

      {showBanner && <AudioActivationBanner onActivated={() => setShowBanner(false)} />}
      {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}
    </div>
  )
}
