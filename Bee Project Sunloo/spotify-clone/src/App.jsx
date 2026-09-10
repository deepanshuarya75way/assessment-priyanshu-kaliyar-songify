import React, { useContext, useState } from 'react'
import Player from './components/Player'
import Display from './components/Display'
import MiniPlayer from './components/MiniPlayer'
import ChatBox from './components/ChatBox'
import SongDetailView from './components/SongDetailView'
import { API_URL } from './config/api'
import { PlayerContext } from './context/PlayerContext'
import UploadSongModal from './components/UploadSongModal' // Add this import
import NowPlayingTicker from './components/NowPlayingTicker'

const App = () => {
  const {audioRef, track, isMiniPlayer} = useContext(PlayerContext);
  const [showModal, setShowModal] = useState(false);

  // Dummy upload handler, replace with your actual logic if needed
  const handleUploadSong = async (form) => {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('desc', form.desc);
      formData.append('album', form.album);
      formData.append('lyrics', form.lyrics);
      formData.append('audio', form.audio);
      formData.append('image', form.image);
  
      const response = await fetch(`${API_URL}/api/song/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
  
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Upload failed');
      }
      // Optionally, refresh uploads after successful upload
    };

  return (
    <div className='h-screen bg-black flex flex-col'>
      <div className='flex-1 flex overflow-hidden'>
        <Display/>
      </div>
      {!isMiniPlayer && <Player/>}
      {isMiniPlayer && <MiniPlayer/>}
      <ChatBox />
      <SongDetailView />
      <NowPlayingTicker />
      <audio ref={audioRef} src={track?.file} preload='auto'></audio>
      {/* Floating Upload Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-32 z-50 bg-green-500 hover:bg-green-400 text-black rounded-full shadow-lg w-12 h-12 flex pt-[2px] justify-center text-3xl transition"
        title="Upload Song"
        aria-label="Upload Song"
      >
        +
      </button>
      <UploadSongModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUpload={handleUploadSong}
      />
    </div>
  )
}

export default App
