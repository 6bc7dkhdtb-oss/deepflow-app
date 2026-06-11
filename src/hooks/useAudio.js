import { useCallback } from 'react'
import {
  playPhaseSound,
  playStepCue,
  playRoundCue,
  playEndTone,
  playTone,
} from '../audio/AudioManager'

export function useAudio() {
  const phase = useCallback((type) => playPhaseSound(type), [])
  const step = useCallback(() => playStepCue(), [])
  const round = useCallback((kind) => playRoundCue(kind), [])
  const end = useCallback(() => playEndTone(), [])
  const tone = useCallback((freq, dur, vol) => playTone(freq, dur, vol), [])
  return {
    playPhaseSound: phase,
    playStepCue: step,
    playRoundCue: round,
    playEndTone: end,
    playTone: tone,
  }
}
