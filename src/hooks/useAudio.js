// Thin hook wrapper around AudioManager for backward compatibility
import { useCallback } from 'react'
import { AudioManager } from '../audio/AudioManager'

export function useAudio() {
  const playPhaseSound = useCallback((type) => {
    AudioManager.playPhaseSound(type)
  }, [])

  return { playPhaseSound }
}
