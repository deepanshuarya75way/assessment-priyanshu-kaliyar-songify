import React, { useContext, useMemo } from 'react'
import Navbar from './Navbar'
import { albumsData as fallbackAlbums } from '../assets/assets'
import { PlayerContext } from '../context/PlayerContext'
import AlbumItem from './AlbumItem'
import SongItem from './SongItem'

const DisplayBrowse = () => {
  const { songs, albums } = useContext(PlayerContext)

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

  // Group songs by album for better organization
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

  // Get unique album names
  const albumNames = Object.keys(songsByAlbum).sort()

  return (
    <>
      <Navbar />
      
      <div className='mt-8'>
        {/* Hero Section */}
        <div className='mb-12'>
          <h1 className='text-5xl font-bold text-white mb-4'>Browse</h1>
          <p className='text-white/60 text-lg'>Discover new music and explore all available content</p>
        </div>

        {/* Albums Section */}
        {allAlbums.length > 0 && (
          <div className='mb-12'>
            <h2 className='my-5 font-bold text-2xl text-white'>All Albums</h2>
            <div className='flex gap-4 overflow-x-auto pb-2'>
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

        {/* All Songs Section */}
        {songs.length > 0 && (
          <div className='mb-12'>
            <h2 className='my-5 font-bold text-2xl text-white'>All Songs ({songs.length})</h2>
            <div className='flex gap-4 overflow-x-auto pb-2'>
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

        {/* Songs by Album Section */}
        {albumNames.length > 0 && (
          <div className='mb-12'>
            <h2 className='my-5 font-bold text-2xl text-white'>Songs by Album</h2>
            {albumNames.map((albumName) => (
              <div key={albumName} className='mb-8'>
                <h3 className='text-xl font-semibold text-white/90 mb-4'>{albumName}</h3>
                <div className='flex gap-4 overflow-x-auto pb-2'>
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
            <h2 className='text-3xl font-bold text-white mb-2'>No content available</h2>
            <p className='text-white/60'>Check back later for new music!</p>
          </div>
        )}

        {/* Stats Section */}
        {(songs.length > 0 || allAlbums.length > 0) && (
          <div className='mt-12 pt-8 border-t border-white/10'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='text-center p-6 bg-[#0f1418]/50 rounded-xl border border-white/5'>
                <div className='text-3xl font-bold text-white mb-2'>{songs.length}</div>
                <div className='text-white/60'>Total Songs</div>
              </div>
              <div className='text-center p-6 bg-[#0f1418]/50 rounded-xl border border-white/5'>
                <div className='text-3xl font-bold text-white mb-2'>{allAlbums.length}</div>
                <div className='text-white/60'>Total Albums</div>
              </div>
              <div className='text-center p-6 bg-[#0f1418]/50 rounded-xl border border-white/5'>
                <div className='text-3xl font-bold text-white mb-2'>{albumNames.length}</div>
                <div className='text-white/60'>Unique Albums</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default DisplayBrowse

