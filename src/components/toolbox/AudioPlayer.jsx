import { useState, useRef, useEffect } from 'react'

export default function AudioPlayer() {
  const [file, setFile] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const audioRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => setCurrentTime(audio.currentTime)
    const onLoaded = () => setDuration(audio.duration)
    const onEnded = () => setPlaying(false)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('ended', onEnded)
    }
  }, [file])

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    setFile({ name: f.name, url })
    setPlaying(false)
    setCurrentTime(0)
    if (audioRef.current) {
      audioRef.current.src = url
      audioRef.current.load()
    }
  }

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio || !file) return
    if (playing) {
      audio.pause()
    } else {
      audio.play()
    }
    setPlaying(!playing)
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = parseFloat(e.target.value)
  }

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
    if (audioRef.current) audioRef.current.volume = v
  }

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-blue-400">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        <span className="text-sm font-medium text-slate-300">Audio Player</span>
      </div>

      <audio ref={audioRef} />

      {!file ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-4 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 text-sm hover:border-blue-500/50 hover:text-blue-300 transition-colors flex flex-col items-center gap-2"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Audiodatei laden
          <span className="text-xs text-slate-500">MP3, WAV, M4A</span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0 hover:bg-blue-500 transition-colors"
            >
              {playing ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
              )}
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-200 truncate">{file.name}</p>
              <p className="text-xs text-slate-500">
                {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </button>
          </div>

          {/* Seek bar */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 rounded-full appearance-none bg-slate-600 accent-blue-500"
          />

          {/* Volume */}
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-slate-500 flex-shrink-0">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolume}
              className="flex-1 h-1.5 rounded-full appearance-none bg-slate-600 accent-blue-500"
            />
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
    </div>
  )
}
