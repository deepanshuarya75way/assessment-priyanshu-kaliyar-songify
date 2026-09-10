import React ,{useContext, useRef, useState} from 'react'
import {assets} from '../assets/assets'
import { PlayerContext } from '../context/PlayerContext'

const Player = () => {
  const volumeBgRef = useRef();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const {
    track, seekBar, seekBg, playStatus, play, pause, time, previous, next, seekSong,
    isShuffle, isLoop, volume, showQueue, songs, currentIndex, isMiniPlayer, setIsMiniPlayer,
    toggleShuffle, toggleLoop, setVolumeLevel, toggleMute, toggleQueue, playWithId,
    showLyricsPane, setShowLyricsPane
  } = useContext(PlayerContext);

  return (
    <div className='h-[10%] bg-black flex justify-between items-center text-white px-4'>
      <div className='hidden lg:flex items-center gap-4'>
        {track && <img className='w-12' src={track?.image} alt="" />}
        <div>
          <p>{track?.name ?? ''}</p>
          <p>{(track?.desc ?? '').slice(0,12)}</p>
        </div>
      </div>      
      <div className='flex flex-col items-center gap-1 m-auto'>
        <div className='flex gap-4 '>
          <img 
            onClick={toggleShuffle} 
            className={`w-4 cursor-pointer transition-opacity ${isShuffle ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`} 
            src={assets.shuffle_icon} 
            alt="Shuffle" 
            title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
          />
          <img onClick={previous} className='w-4 cursor-pointer hover:opacity-80' src={assets.prev_icon} alt="Previous" />

          {playStatus
          ? <img onClick={pause} className='w-4 cursor-pointer hover:opacity-80' src={assets.pause_icon} alt="Pause" />
          :<img onClick={play} className='w-4 cursor-pointer hover:opacity-80' src={assets.play_icon} alt="Play" />
          }
          
          <img onClick={next} className='w-4 cursor-pointer hover:opacity-80' src={assets.next_icon} alt="Next" />
          <img 
            onClick={toggleLoop} 
            className={`w-4 cursor-pointer transition-opacity ${isLoop ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`} 
            src={assets.loop_icon} 
            alt="Loop" 
            title={isLoop ? 'Loop On' : 'Loop Off'}
          />
        </div>

        <div className='flex items-center gap-5'>
          <p className='text-xs min-w-[40px]'>{String(time.currentTime.minute).padStart(2, '0')}:{String(time.currentTime.second).padStart(2, '0')}</p>

          <div ref={seekBg} onClick={seekSong} className='w-[60vw] max-w-[500px] bg-gray-300 rounded-full cursor-pointer'>
            <hr ref={seekBar} className='h-1 border-none w-0 bg-green-800 rounded-full'/>
          </div>
          <p className='text-xs min-w-[40px]'>{String(time.totalTime.minute).padStart(2, '0')}:{String(time.totalTime.second).padStart(2, '0')}</p>

        </div>
      </div>

      <div className='hidden lg:flex items-center gap-2 opacity-75 relative'>
        {/* Queue Button */}
        <div className='relative'>
          <img 
            onClick={toggleQueue} 
            className={`w-4 cursor-pointer hover:opacity-100 transition-opacity ${showQueue ? 'opacity-100' : ''}`} 
            src={assets.queue_icon} 
            alt="Queue" 
            title="Queue"
          />
          {showQueue && (
            <div className='absolute bottom-full right-0 mb-2 w-64 bg-[#0f1418] border border-white/10 rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto z-50'>
              <h3 className='text-white font-semibold mb-3'>Queue</h3>
              <div className='space-y-2'>
                {songs.map((song, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded cursor-pointer hover:bg-white/10 ${
                      index === currentIndex ? 'bg-green-500/20 border border-green-500/50' : ''
                    }`}
                    onClick={() => {
                      if (index !== currentIndex) {
                        playWithId(index);
                      }
                    }}
                  >
                    <p className={`text-sm ${index === currentIndex ? 'text-green-400 font-semibold' : 'text-white/80'}`}>
                      {song.name}
                    </p>
                    <p className='text-xs text-white/50'>{song.album}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lyrics Button */}
        <div className='relative'>
          <button
            onClick={() => setShowLyricsPane(v => !v)}
            className={`text-xs uppercase tracking-wide px-3 py-1.5 rounded-full border transition-colors ${
              showLyricsPane ? 'border-green-400 text-green-300' : 'border-white/20 text-white/70 hover:border-white/40 hover:text-white'
            }`}
          >
            Lyrics
          </button>
        </div>

        {/* Volume Controls */}
        <div 
          className='flex items-center gap-2 relative'
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <img 
            onClick={toggleMute} 
            className='w-4 cursor-pointer hover:opacity-100' 
            src={volume > 0 ? assets.volume_icon : assets.speaker_icon} 
            alt={volume > 0 ? "Volume" : "Muted"} 
            title={volume > 0 ? "Mute" : "Unmute"}
          />
          
          {showVolumeSlider && (
            <div 
              ref={volumeBgRef}
              onClick={(e) => {
                if (volumeBgRef.current) {
                  const rect = volumeBgRef.current.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const percentage = Math.max(0, Math.min(1, clickX / rect.width));
                  setVolumeLevel(percentage);
                }
              }}
              className='w-20 bg-slate-50 h-1 rounded cursor-pointer relative'
            >
              <div 
                className='absolute h-full bg-green-500 rounded'
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Mini Player Toggle */}
        <img 
          className={`w-4 cursor-pointer hover:opacity-100 transition-opacity ${isMiniPlayer ? 'opacity-100' : ''}`}
          src={assets.mini_player_icon} 
          alt="Mini Player" 
          title={isMiniPlayer ? "Close Mini Player" : "Open Mini Player"}
          onClick={() => setIsMiniPlayer(!isMiniPlayer)}
        />
        
        {/* Fullscreen */}
        <img 
          className='w-4 cursor-pointer hover:opacity-100' 
          src={assets.zoom_icon} 
          alt="Fullscreen" 
          title="Fullscreen"
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(err => {
                console.log('Fullscreen not supported');
              });
            } else {
              document.exitFullscreen();
            }
          }}
        />
      </div>

    </div>
  )
}

export default Player
