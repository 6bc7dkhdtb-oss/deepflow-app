import { useRef, useCallback } from 'react'

export function useAudio() {
  const ctxRef = useRef(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const playTone = useCallback((frequency, duration, type = 'sine', volume = 0.3) => {
    try {
      const ctx = getCtx()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02)
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration + 0.05)
    } catch {
      // Audio not available
    }
  }, [getCtx])

  const playInhaleCue = useCallback(() => {
    playTone(528, 0.25, 'sine', 0.25)
  }, [playTone])

  const playExhaleCue = useCallback(() => {
    playTone(396, 0.35, 'sine', 0.2)
  }, [playTone])

  const playHoldCue = useCallback(() => {
    playTone(440, 0.15, 'sine', 0.15)
  }, [playTone])

  const playPauseCue = useCallback(() => {
    playTone(330, 0.3, 'sine', 0.15)
  }, [playTone])

  const playPhaseSound = useCallback((phaseType) => {
    switch (phaseType) {
      case 'in': playInhaleCue(); break
      case 'out': playExhaleCue(); break
      case 'hold': playHoldCue(); break
      case 'pause': playPauseCue(); break
    }
  }, [playInhaleCue, playExhaleCue, playHoldCue, playPauseCue])

  return { playPhaseSound, playTone }
}
