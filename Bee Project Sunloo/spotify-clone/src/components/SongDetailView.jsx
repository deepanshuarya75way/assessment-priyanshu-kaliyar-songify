import React, { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { assets } from '../assets/assets';

const SongDetailView = () => {
  const { 
    selectedSongDetail, 
    setSelectedSongDetail, 
    track, 
    playWithId, 
    playStatus, 
    play, 
    pause,
    songs,
    currentIndex,
    setShowLyricsPane
  } = useContext(PlayerContext);

  if (!selectedSongDetail) return null;

  const song = selectedSongDetail;
  // Try to find the song in the songs array
  let songIndex = songs.findIndex(s => 
    (s.name === song.name && s.album === song.album) || 
    (s._id && song._id && s._id === song._id)
  );
  
  // If not found, try using the id from the song object
  if (songIndex === -1 && song.id !== undefined) {
    songIndex = song.id;
  }
  
  const isCurrentTrack = songIndex >= 0 && songIndex === currentIndex;

  const handlePlay = () => {
    if (isCurrentTrack) {
      if (playStatus) {
        pause();
      } else {
        play();
      }
    } else {
      playWithId(songIndex >= 0 ? songIndex : 0);
    }
  };

  const handleClose = () => {
    setSelectedSongDetail(null);
  };

  return (
    <div className='fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4' onClick={handleClose}>
      <div 
        className='w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-5xl bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className='absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white/80 hover:text-white transition-colors backdrop-blur-sm text-sm sm:text-base'
        >
          ✕
        </button>

        {/* Content - Responsive Layout */}
        <div className='flex flex-col lg:flex-row h-full overflow-y-auto'>
          {/* Left Side - Large Image */}
          <div className='w-full lg:w-1/2 p-4 sm:p-6 md:p-8 lg:p-12 flex items-center justify-center bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-black relative overflow-hidden min-h-[40vh] sm:min-h-[50vh] lg:min-h-0'>
            <div className='w-full max-w-xs sm:max-w-sm md:max-w-md relative z-10'>
              <img
                src={song.image || song.albumImage || '/placeholder.jpg'}
                alt={song.name}
                className='w-full aspect-square object-cover rounded-lg sm:rounded-xl shadow-2xl'
              />
            </div>
            {/* Background blur effect */}
            <div 
              className='absolute inset-0 opacity-20 sm:opacity-30 blur-3xl'
              style={{
                backgroundImage: `url(${song.image || song.albumImage || '/placeholder.jpg'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          </div>

          {/* Right Side - Details */}
          <div className='w-full lg:w-1/2 p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-between overflow-y-auto'>
            <div>
              {/* Song Info */}
              <div className='mb-4 sm:mb-6 md:mb-8'>
                <p className='text-green-400 text-[10px] sm:text-xs uppercase tracking-wider mb-2 sm:mb-3 font-semibold'>Song</p>
                <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-2 sm:mb-3 md:mb-4 leading-tight break-words'>
                  {song.name}
                </h1>
                {song.album && (
                  <p className='text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-2 sm:mb-3 font-semibold break-words'>{song.album}</p>
                )}
                {song.desc && (
                  <p className='text-white/70 text-sm sm:text-base leading-relaxed mt-2 sm:mt-3 break-words'>{song.desc}</p>
                )}
              </div>

              {/* Song Details */}
              <div className='mb-4 sm:mb-6 md:mb-8 space-y-2 sm:space-y-3 text-xs sm:text-sm text-white/60 border-t border-white/10 pt-4 sm:pt-6'>
                {song.duration && (
                  <div className='flex items-center gap-2 sm:gap-3 flex-wrap'>
                    <span className='text-white/40'>Duration</span>
                    <span className='text-white/80 font-medium'>{song.duration}</span>
                  </div>
                )}
                {song.album && (
                  <div className='flex items-center gap-2 sm:gap-3 flex-wrap'>
                    <span className='text-white/40'>Album</span>
                    <span className='text-white/80 font-medium break-words'>{song.album}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col gap-2 sm:gap-3 mt-4 sm:mt-auto'>
              {/* Play Button */}
              <button
                onClick={handlePlay}
                className='w-full py-3 sm:py-4 px-4 sm:px-6 rounded-full bg-green-500 hover:bg-green-400 text-black font-bold text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-500/30'
              >
                {isCurrentTrack && playStatus ? (
                  <>
                    <img src={assets.pause_icon} alt="Pause" className='w-5 h-5 sm:w-6 sm:h-6' />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <img src={assets.play_icon} alt="Play" className='w-5 h-5 sm:w-6 sm:h-6' />
                    <span>Play</span>
                  </>
                )}
              </button>

              {/* Secondary Actions */}
              <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
                <button
                  onClick={() => {
                    if (songIndex >= 0) {
                      playWithId(songIndex);
                    }
                    setShowLyricsPane(true);
                    handleClose();
                  }}
                  className='flex-1 py-2.5 sm:py-3 px-4 rounded-full border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-semibold text-xs sm:text-sm transition-all active:scale-95'
                >
                  View Lyrics
                </button>
                <button
                  className='flex-1 py-2.5 sm:py-3 px-4 rounded-full border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-semibold text-xs sm:text-sm transition-all active:scale-95'
                >
                  Add to Queue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongDetailView;

