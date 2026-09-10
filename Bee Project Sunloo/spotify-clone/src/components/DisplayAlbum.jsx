import React, { useContext, useEffect, useState } from 'react'
import Navbar from './Navbar'
import{useParams} from 'react-router-dom'
import { albumsData as fallbackAlbums, assets } from '../assets/assets';
import { PlayerContext } from '../context/PlayerContext';
import { API_URL } from '../config/api';

const DisplayAlbum = () => {

  const {id} = useParams();
  const { songs, playWithId } = useContext(PlayerContext)
  const [albums, setAlbums] = useState(fallbackAlbums)

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await fetch(`${API_URL}/api/album/list`)
        const json = await res.json()
        if (Array.isArray(json?.albums) && json.albums.length > 0) {
          // Preserve original IDs from backend (_id) or use id if available, otherwise use index
          const backendAlbums = json.albums.map((a, index) => ({ 
            ...a, 
            id: a._id || a.id || index,
            _id: a._id || a.id || index
          }))
          // Combine with fallback albums, preserving their IDs
          const fallback = fallbackAlbums.map((a, index) => ({ 
            ...a, 
            id: a.id ?? `fallback-${index}`,
            _id: a.id ?? `fallback-${index}`
          }))
          setAlbums([...backendAlbums, ...fallback])
        } else {
          // If no backend albums, use fallback with preserved IDs
          const fallback = fallbackAlbums.map((a, index) => ({ 
            ...a, 
            id: a.id ?? index,
            _id: a.id ?? index
          }))
          setAlbums(fallback)
        }
      } catch (e) {
        // On error, use fallback with preserved IDs
        const fallback = fallbackAlbums.map((a, index) => ({ 
          ...a, 
          id: a.id ?? index,
          _id: a.id ?? index
        }))
        setAlbums(fallback)
      }
    }
    fetchAlbums()
  }, [])

  // Find album by ID (could be _id, id, or index as fallback)
  const albumData = albums.find(a => {
    const albumId = a._id || a.id
    // Try to match by ID first (string or number)
    if (albumId != null && String(albumId) === String(id)) return true
    // Fallback to index matching for numeric IDs
    const albumIndex = albums.indexOf(a)
    return String(albumIndex) === String(id)
  }) || (typeof id !== 'undefined' && !isNaN(Number(id)) ? albums[Number(id)] : null)

  // Build a filtered view of songs that belong to this album by name
  const filteredSongs = albumData
    ? songs.map((s, idx) => ({ ...s, __index: idx }))
        .filter(s => (s.album ?? '').toLowerCase() === (albumData.name ?? '').toLowerCase())
    : songs.map((s, idx) => ({ ...s, __index: idx }))

  return (
    <>
      <Navbar/>
      {albumData && (
      <div className='mt-10 flex gap-8 flex-col md:flex-row md:items-end'>
        <img className='w-48 rounded ' src={albumData.image} alt="" />

        <div className='flex flex-col'>
          <p>Playlist</p>
          <h2 className='text-5xl font-bold mb-4 md:text-7xl'>{albumData.name}</h2>
          <h4>{albumData.desc}</h4>
          <p className='mt-1'>
            <img className='inline-block w-5' src={assets.spotify_logo} alt="" />
            <b>Songify</b>
            • {filteredSongs.length} songs
          </p>
        </div>
      </div>)}

      <div className='grid grid-cols-3 sm:grid-cols-4 mt-10 mb-4 pl-2 text-[#a7a7a7]'>
        <p><b className='mr-4'>#</b>Title</p>
        <p>Album</p>
        <p className='hidden sm:block'>Date Added</p>
        <img className='m-auto w-4' src={assets.clock_icon} alt="" />
      </div>

      <hr />
      {
        filteredSongs.map((item,index)=>(
          <div onClick={()=>playWithId(item.__index)} key={index} className='grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer'>
            <p className='text-white'>
              <b className='mr-4 text-[#a7a7a7]'>{index+1}</b>
              <img className='inline w-10 mr-5' src={item.image} alt="" />
              {item.name}
            </p>
            <p className='text-[15px]'>{albumData?.name ?? 'Album'}</p>
            <p className='text-[15px] hidden sm:block'>Recently</p>
            <p className='text-[15px] text-center'>{item.duration}</p>
          </div>
        ))
      }
    </>
  )
}

export default DisplayAlbum
