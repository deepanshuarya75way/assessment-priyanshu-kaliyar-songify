import React, { useContext, useMemo, useState } from 'react'
import Navbar from './Navbar'
import { albumsData as fallbackAlbums } from '../assets/assets'
import { PlayerContext } from '../context/PlayerContext'
import AlbumItem from './AlbumItem'
import SongItem from './SongItem'

const DisplayMusic = () => {
  const { songs, albums } = useContext(PlayerContext)
  const [filter, setFilter] = useState('all') // 'all', 'songs', 'albums'

  // Combine backend albums with fallback albums
  const allAlbums = useMemo(() => {
    const backendAlbums = albums.map((a, index) => ({ 
      ...a, 
      id: a._id || a.id || index,
      _id: a._id || a.id || index
    }))
    const fallback = fallbackAlbums.map((a, index) => ({ 
      ...a, 
      id: a.id ?? `fallback-${index}`,
      _id: a.id ?? `fallback-${index}`
    }))
    return [...backendAlbums, ...fallback]
  }, [albums])

  // Group songs by album
  const songsByAlbum = useMemo(() => {
    const grouped = {}
    songs.forEach((song, index) => {
      const albumName = song.album || 'Unknown Album'
      if (!grouped[albumName]) {
        grouped[albumName] = []
      }
      grouped[albumName].push({ ...song, originalIndex: index })
    })
    return grouped
  }, [songs])

  const albumNames = Object.keys(songsByAlbum).sort()

  return (
    <>
      <Navbar />
      
      <div className='mt-8'>
        {/* Hero Section */}
        <div className='mb-8'>
          <h1 className='text-5xl font-bold text-white mb-4'>Music</h1>
          <p className='text-white/60 text-lg mb-6'>Explore all available music</p>
          
          {/* Filter Tabs */}
          <div className='flex gap-4 border-b border-white/10 pb-4'>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-green-500 text-black'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('songs')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'songs'
                  ? 'bg-green-500 text-black'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              Songs ({songs.length})
            </button>
            <button
              onClick={() => setFilter('albums')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'albums'
                  ? 'bg-green-500 text-black'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              Albums ({allAlbums.length})
            </button>
          </div>
        </div>

        {/* All Content */}
        {(filter === 'all' || filter === 'albums') && allAlbums.length > 0 && (
          <div className='mb-12'>
            <h2 className='my-5 font-bold text-2xl text-white'>Albums</h2>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
              {allAlbums.map((item, index) => (
                <AlbumItem 
                  key={item._id || item.id || index} 
                  name={item.name} 
                  desc={item.desc} 
                  id={item.id || index} 
                  image={item.image} 
                />
              ))}
            </div>
          </div>
        )}

        {/* All Songs */}
        {(filter === 'all' || filter === 'songs') && songs.length > 0 && (
          <div className='mb-12'>
            <h2 className='my-5 font-bold text-2xl text-white'>All Songs ({songs.length})</h2>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
              {songs.map((item, index) => (
                <SongItem 
                  key={item._id || index} 
                  name={item.name} 
                  desc={item.desc} 
                  id={index} 
                  image={item.image}
                  album={item.album}
                />
              ))}
            </div>
          </div>
        )}

        {/* Songs by Album */}
        {filter === 'all' && albumNames.length > 0 && (
          <div className='mb-12'>
            <h2 className='my-5 font-bold text-2xl text-white'>Songs by Album</h2>
            {albumNames.map((albumName) => (
              <div key={albumName} className='mb-8'>
                <h3 className='text-xl font-semibold text-white/90 mb-4'>{albumName}</h3>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
                  {songsByAlbum[albumName].map((item, index) => (
                    <SongItem 
                      key={item._id || `${albumName}-${index}`} 
                      name={item.name} 
                      desc={item.desc} 
                      id={item.originalIndex} 
                      image={item.image}
                      album={item.album}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {songs.length === 0 && allAlbums.length === 0 && (
          <div className='text-center py-20'>
            <div className='text-6xl mb-4'>🎵</div>
            <h2 className='text-3xl font-bold text-white mb-2'>No music available</h2>
            <p className='text-white/60'>Check back later for new music!</p>
          </div>
        )}
      </div>
    </>
  )
}

export default DisplayMusic

