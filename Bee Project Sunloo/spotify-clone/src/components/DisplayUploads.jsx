import React, { useEffect, useState, useContext } from 'react'
import Navbar from './Navbar'
import { PlayerContext } from '../context/PlayerContext'
import AlbumItem from './AlbumItem'
import SongItem from './SongItem'
import { API_URL } from '../config/api'
import { useNavigate } from 'react-router-dom'
import UploadSongModal from './UploadSongModal';
import { io } from 'socket.io-client';

const DisplayUploads = () => {
  const navigate = useNavigate()
  const { songs: allSongs } = useContext(PlayerContext)
  const [userSongs, setUserSongs] = useState([])
  const [userAlbums, setUserAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUserUploads = async () => {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Please log in to view your uploads')
        setLoading(false)
        // Redirect to login with return path
        setTimeout(() => {
          navigate('/login?redirect=/uploads')
        }, 2000)
        return
      }

      try {
        setLoading(true)
        setError('')

        console.log('Fetching uploads from:', API_URL)

        // Fetch user's songs
        const songsRes = await fetch(`${API_URL}/api/song/my-uploads`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        // Fetch user's albums
        const albumsRes = await fetch(`${API_URL}/api/album/my-uploads`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        console.log('Songs response status:', songsRes.status)
        console.log('Albums response status:', albumsRes.status)

        // Handle 401 errors first
        if (songsRes.status === 401 || albumsRes.status === 401) {
          setError('Session expired. Please log in again.')
          localStorage.removeItem('token')
          localStorage.removeItem('userName')
          localStorage.removeItem('userEmail')
          setTimeout(() => {
            navigate('/login?redirect=/uploads')
          }, 2000)
          return
        }

        // Helper function to safely parse JSON response
        const parseJsonResponse = async (response) => {
          try {
            const contentType = response.headers.get('content-type')
            const text = await response.text()
            
            // Check if response is empty
            if (!text || text.trim() === '') {
              return { success: false, message: 'Empty response from server' }
            }
            
            // Check content type
            if (!contentType || !contentType.includes('application/json')) {
              return { success: false, message: text || 'Invalid response format' }
            }
            
            // Try to parse as JSON
            try {
              return JSON.parse(text)
            } catch (parseError) {
              console.error('JSON parse error:', parseError, 'Response text:', text)
              return { success: false, message: 'Invalid JSON response: ' + text.substring(0, 100) }
            }
          } catch (e) {
            console.error('Error reading response:', e)
            return { success: false, message: 'Failed to read response' }
          }
        }

        // Parse responses
        const songsData = await parseJsonResponse(songsRes)
        const albumsData = await parseJsonResponse(albumsRes)

        // Set data if successful (even if one fails, show the other)
        if (songsRes.ok && songsData.success) {
          setUserSongs(songsData.songs || [])
        } else {
          console.warn('Songs API error:', { status: songsRes.status, data: songsData })
          setUserSongs([])
          // Only show error if both fail
          if (!albumsRes.ok || !albumsData.success) {
            const errorMsg = songsData.message || albumsData.message || 'Failed to load your uploads'
            setError(errorMsg)
          }
        }

        if (albumsRes.ok && albumsData.success) {
          setUserAlbums(albumsData.albums || [])
        } else {
          console.warn('Albums API error:', { status: albumsRes.status, data: albumsData })
          setUserAlbums([])
          // Only show error if both fail
          if (!songsRes.ok || !songsData.success) {
            const errorMsg = songsData.message || albumsData.message || 'Failed to load your uploads'
            setError(errorMsg)
          }
        }

        // If both succeeded, clear any previous errors
        if (songsRes.ok && albumsRes.ok && songsData.success && albumsData.success) {
          setError('')
        }
      } catch (err) {
        console.error('Error fetching user uploads:', err)
        setError('Failed to load your uploads. Please check your connection and try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchUserUploads()
  }, [navigate])
  //Added new
  useEffect(() => {
    const token = localStorage.getItem('token');
    if(!token) return;
    let currentUserId;
    try{
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentUserId = payload.id || payload._id || payload.sub;
    } catch (error) {
      console.error('Invalid token');
      return;
    }
    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });
    socket.on('connect', () => {
      console.log('Uploads socket connected:', socket.id);
    });
    socket.on('connect_error', (error) => {
      console.error('Uploads socket error:',error.message);
    });
    const handleNewSong = (song) => {
      if(!song || !song._id) return;
      const uploadedId = song.uploadedBy?.id;
      if(String(uploadedId) !== String(currentUserId)) return;
      setUserSongs((prevSongs) => {
        if(prevSongs.some(s => String(s._id) === song._id)){
          return prevSongs;
        }
        return [song, ...prevSongs];
      });
    };
    socket.on('song:new', handleNewSong);
    return () => {
      socket.off('song:new', handleNewSong);
      socket.disconnect();
    };
  []});

  // Map user songs to include original index from allSongs for playback
  const userSongsWithIndex = userSongs.map(userSong => {
    const originalIndex = allSongs.findIndex(s => s._id === userSong._id || 
      (s.name === userSong.name && s.file === userSong.file))
    return { ...userSong, originalIndex: originalIndex >= 0 ? originalIndex : null }
  })

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

    // Added Now

    const uploadedSong = data.song;
    setUserSongs((prevSongs) => {
      if(prevSongs.some(song => song.id === uploadedSong._id)){
        return prevSongs;
      }
    })
    return [uploadedSong, ...prevSongs];
    // Optionally, refresh uploads after successful upload
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4'></div>
            <p className='text-white/60'>Loading your uploads...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='text-center max-w-md mx-auto px-4'>
            <div className='text-6xl mb-4'>🔒</div>
            <h2 className='text-2xl font-bold text-white mb-2'>{error}</h2>
            <button
              onClick={() => navigate('/login?redirect=/uploads')}
              className='mt-4 px-6 py-2 rounded-full bg-green-500 text-black font-semibold hover:bg-green-400'
            >
              Log In
            </button>
          </div>
        </div>
      </>
    )
  }

  const hasUploads = userSongs.length > 0 || userAlbums.length > 0

  return (
    <>
      <Navbar />
      <UploadSongModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUpload={handleUploadSong}
      />
      
      <div className='mt-8'>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-white mb-2'>Your Uploads</h1>
          <p className='text-white/60'>Manage your songs and albums</p>
        </div>

        {!hasUploads ? (
          <div className='text-center py-20'>
            <div className='text-6xl mb-4'>📤</div>
            <h2 className='text-3xl font-bold text-white mb-2'>No uploads yet</h2>
            <p className='text-white/60 mb-6'>Start sharing your music with the world!</p>
            <div className='flex gap-4 justify-center'>
              <button
                onClick={() => setShowModal(true)}
                className='px-6 py-2 rounded-full bg-green-500 text-black font-semibold hover:bg-green-400'
              >
                Upload Now
              </button>
              <button
                onClick={() => navigate('/')}
                className='px-6 py-2 rounded-full border border-white/20 text-white hover:bg-white/10'
              >
                Browse Music
              </button>
            </div>
          </div>
        ) : (
          <>
            {userSongs.length > 0 && (
              <div className='mb-8'>
                <h2 className='my-5 font-bold text-2xl text-white'>Your Songs ({userSongs.length})</h2>
                <div className='flex gap-4 overflow-x-auto pb-2'>
                  {userSongsWithIndex.map((item, index) => (
                    <SongItem 
                      key={item._id || index} 
                      name={item.name} 
                      desc={item.desc} 
                      id={item.originalIndex !== null ? item.originalIndex : index} 
                      image={item.image}
                      album={item.album}
                    />
                  ))}
                </div>
              </div>
            )}

            {userAlbums.length > 0 && (
              <div className='mb-8'>
                <h2 className='my-5 font-bold text-2xl text-white'>Your Albums ({userAlbums.length})</h2>
                <div className='flex gap-4 overflow-x-auto pb-2'>
                  {userAlbums.map((item, index) => (
                    <AlbumItem 
                      key={item._id || index} 
                      name={item.name} 
                      desc={item.desc} 
                      id={item._id || index} 
                      image={item.image} 
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default DisplayUploads

