import React, { useContext, useState, useRef, useEffect } from 'react'
import { assets } from '../assets/assets'
import { PlayerContext } from '../context/PlayerContext'

const MiniPlayer = () => {
  const {
    track,
    playStatus,
    play,
    pause,
    previous,
    next,
    time,
    isShuffle,
    isLoop,
    toggleShuffle,
    toggleLoop,
    setIsMiniPlayer,
    seekTo
  } = useContext(PlayerContext)

  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const playerRef = useRef(null)
  const progressBgRef = useRef(null)
  const [isSeeking, setIsSeeking] = useState(false)

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        })
      } else if (isSeeking) {
        handleSeek(e.clientX)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsSeeking(false)
    }

    if (isDragging || isSeeking) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, isSeeking])

  const handleMouseDown = (e) => {
    if (playerRef.current) {
      const rect = playerRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      setIsDragging(true)
    }
  }

  const handleSeek = (clientX) => {
    if (!progressBgRef.current) return
    const rect = progressBgRef.current.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    seekTo(percentage)
  }

  const handleSeekMouseDown = (e) => {
    setIsSeeking(true)
    handleSeek(e.clientX)
    e.stopPropagation()
  }

  // Constrain to viewport
  useEffect(() => {
    const constrainPosition = () => {
      setPosition(prev => ({
        x: Math.max(0, Math.min(prev.x, window.innerWidth - 300)),
        y: Math.max(0, Math.min(prev.y, window.innerHeight - 150))
      }))
    }

    constrainPosition()
    window.addEventListener('resize', constrainPosition)
    return () => window.removeEventListener('resize', constrainPosition)
  }, [])

  if (!track) return null

  const totalSeconds = (time.totalTime.minute * 60) + time.totalTime.second
  const currentSeconds = (time.currentTime.minute * 60) + time.currentTime.second
  const progress = totalSeconds > 0 ? Math.min(100, (currentSeconds / totalSeconds) * 100) : 0

  return (
    <div
      ref={playerRef}
      className='fixed bg-[#0f1418] border border-white/10 rounded-lg shadow-2xl z-50 min-w-[300px]'
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header - Draggable */}
      <div className='flex items-center justify-between p-3 border-b border-white/10 cursor-grab active:cursor-grabbing'>
        <div className='flex items-center gap-2 flex-1 min-w-0'>
          {track.image && (
            <img 
              className='w-10 h-10 rounded object-cover' 
              src={track.image} 
              alt={track.name}
            />
          )}
          <div className='flex-1 min-w-0'>
            <p className='text-white font-semibold text-sm truncate'>{track.name}</p>
            <p className='text-white/60 text-xs truncate'>{track.desc}</p>
          </div>
        </div>
        <button
          onClick={() => setIsMiniPlayer(false)}
          className='text-white/60 hover:text-white ml-2'
          title="Close"
        >
          ✕
        </button>
      </div>

      {/* Controls */}
      <div className='p-4'>
        {/* Time and Progress */}
        <div className='flex items-center gap-2 mb-3'>
          <span className='text-xs text-white/60 min-w-[35px]'>
            {String(time.currentTime.minute).padStart(2, '0')}:{String(time.currentTime.second).padStart(2, '0')}
          </span>
          <div
            ref={progressBgRef}
            className='flex-1 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer relative group'
            onMouseDown={handleSeekMouseDown}
          >
            <div 
              className='h-full bg-green-500 transition-all pointer-events-none'
              style={{ width: `${progress}%` }}
            />
            <div
              className='absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow transition-transform pointer-events-none group-hover:scale-110'
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
          <span className='text-xs text-white/60 min-w-[35px]'>
            {String(time.totalTime.minute).padStart(2, '0')}:{String(time.totalTime.second).padStart(2, '0')}
          </span>
        </div>

        {/* Control Buttons */}
        <div className='flex items-center justify-center gap-3'>
          <button
            onClick={toggleShuffle}
            className={`w-6 h-6 flex items-center justify-center transition-opacity ${
              isShuffle ? 'opacity-100' : 'opacity-50 hover:opacity-75'
            }`}
            title="Shuffle"
          >
            <img className='w-4' src={assets.shuffle_icon} alt="Shuffle" />
          </button>

          <button
            onClick={previous}
            className='w-8 h-8 flex items-center justify-center hover:opacity-80'
            title="Previous"
          >
            <img className='w-4' src={assets.prev_icon} alt="Previous" />
          </button>

          <button
            onClick={playStatus ? pause : play}
            className='w-10 h-10 flex items-center justify-center bg-green-500 rounded-full hover:bg-green-400'
            title={playStatus ? "Pause" : "Play"}
          >
            {playStatus ? (
              <img className='w-5' src={assets.pause_icon} alt="Pause" />
            ) : (
              <img className='w-5' src={assets.play_icon} alt="Play" />
            )}
          </button>

          <button
            onClick={next}
            className='w-8 h-8 flex items-center justify-center hover:opacity-80'
            title="Next"
          >
            <img className='w-4' src={assets.next_icon} alt="Next" />
          </button>

          <button
            onClick={toggleLoop}
            className={`w-6 h-6 flex items-center justify-center transition-opacity ${
              isLoop ? 'opacity-100' : 'opacity-50 hover:opacity-75'
            }`}
            title="Loop"
          >
            <img className='w-4' src={assets.loop_icon} alt="Loop" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default MiniPlayer

