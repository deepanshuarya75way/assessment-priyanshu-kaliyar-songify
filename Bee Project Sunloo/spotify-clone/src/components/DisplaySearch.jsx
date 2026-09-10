import React, { useContext, useMemo } from 'react'
import Navbar from './Navbar'
import { albumsData as fallbackAlbums } from '../assets/assets'
import { PlayerContext } from '../context/PlayerContext'
import AlbumItem from './AlbumItem'
import SongItem from './SongItem'

const DisplaySearch = () => {
  const { searchQuery, songs, albums } = useContext(PlayerContext)

  // Filter songs and albums based on search query
  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return []
    
    const query = searchQuery.toLowerCase().trim()
    return songs
      .map((song, index) => ({ ...song, originalIndex: index }))
      .filter(song => 
        song.name?.toLowerCase().includes(query) ||
        song.desc?.toLowerCase().includes(query) ||
        song.album?.toLowerCase().includes(query)
      )
  }, [searchQuery, songs])

  const filteredAlbums = useMemo(() => {
    if (!searchQuery.trim()) return []
    
    const query = searchQuery.toLowerCase().trim()
    const allAlbums = [...albums, ...fallbackAlbums]
    return allAlbums.filter(album => 
      album.name?.toLowerCase().includes(query) ||
      album.desc?.toLowerCase().includes(query)
    )
  }, [searchQuery, albums])

  const hasResults = filteredSongs.length > 0 || filteredAlbums.length > 0
  const isEmpty = searchQuery.trim() && !hasResults

  return (
    <>
      <Navbar />
      
      <div className='mt-8'>
        {!searchQuery.trim() ? (
          <div className='text-center py-20'>
            <div className='text-6xl mb-4'>🔍</div>
            <h2 className='text-3xl font-bold text-white mb-2'>Search for songs, albums, and more</h2>
            <p className='text-white/60'>Type in the search bar to find what you're looking for</p>
          </div>
        ) : isEmpty ? (
          <div className='text-center py-20'>
            <div className='text-6xl mb-4'>😕</div>
            <h2 className='text-3xl font-bold text-white mb-2'>No results found</h2>
            <p className='text-white/60'>Try searching for something else</p>
          </div>
        ) : (
          <>
            {filteredSongs.length > 0 && (
              <div className='mb-8'>
                <h1 className='my-5 font-bold text-2xl text-white'>Songs</h1>
                <div className='flex gap-4 overflow-x-auto pb-2'>
                  {filteredSongs.map((item, index) => (
                    <SongItem 
                      key={item.originalIndex ?? index} 
                      name={item.name} 
                      desc={item.desc} 
                      id={item.originalIndex ?? index} 
                      image={item.image}
                      album={item.album}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredAlbums.length > 0 && (
              <div className='mb-8'>
                <h1 className='my-5 font-bold text-2xl text-white'>Albums</h1>
                <div className='flex gap-4 overflow-x-auto pb-2'>
                  {filteredAlbums.map((item, index) => (
                    <AlbumItem 
                      key={index} 
                      name={item.name} 
                      desc={item.desc} 
                      id={item.id ?? index} 
                      image={item.image} 
                    />
                  ))}
                </div>
              </div>
            )}

            {hasResults && (
              <div className='text-white/60 text-sm mt-8'>
                Found {filteredSongs.length} song{filteredSongs.length !== 1 ? 's' : ''} 
                {filteredSongs.length > 0 && filteredAlbums.length > 0 ? ' and ' : ''}
                {filteredAlbums.length > 0 && `${filteredAlbums.length} album${filteredAlbums.length !== 1 ? 's' : ''}`}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default DisplaySearch

