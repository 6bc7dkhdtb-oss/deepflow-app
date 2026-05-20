import { useCallback } from 'react'
import { playPhaseSound } from '../audio/AudioManager'

export function useAudio() {
  const play = useCallback((type) => {
    playPhaseSound(type)
  }, [])
  return { playPhaseSound: play }
}
