  import React, { useEffect, useState, useContext } from 'react'
import Navbar from './Navbar'
import {albumsData as fallbackAlbums} from '../assets/assets'
import { API_URL } from '../config/api'
import AlbumItem from './AlbumItem'
import SongItem from './SongItem'
import LeaderboardSection from './LeaderboardSection'
import { PlayerContext } from '../context/PlayerContext'
  
  const DisplayHome = () => {
    const [albums, setAlbums] = useState(fallbackAlbums)
    const { songs } = useContext(PlayerContext)

    useEffect(() => {
      const fetchData = async () => {
        try {
          const albumsRes = await fetch(`${API_URL}/api/album/list`)
          const albumsJson = await albumsRes.json()
          if (Array.isArray(albumsJson?.albums) && albumsJson.albums.length > 0) {
            // Preserve original IDs from backend (_id) or use id if available
            const backendAlbums = albumsJson.albums.map((a, index) => ({ 
              ...a, 
              id: a._id || a.id || index,
              _id: a._id || a.id || index
            }))
            // Preserve fallback album IDs
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
      fetchData()
    }, [])

    return (
      <>
        <Navbar/>

        {/* Hero */}
        <section className='relative overflow-hidden rounded-xl bg-gradient-to-b from-[#0b1620] via-[#0b1620] to-[#121212] p-4 sm:p-6 md:p-8 lg:p-12 mb-6 sm:mb-8'>
          <div className='max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 items-center'>
            <div className='order-2 lg:order-1'>
              <div className='text-green-400 font-bold mb-2 sm:mb-3 text-xs sm:text-sm'>SUNLOO</div>
              <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight break-words'>Your Personal Music Stage</h1>
              <p className='text-white/70 mt-3 sm:mt-4 max-w-xl text-sm sm:text-base leading-relaxed'>Upload tracks, build playlists, and explore what others are creating — all in one powerful, free platform made for creators.</p>
              <div className='mt-4 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4'>
                <button className='px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-green-500 text-black font-semibold hover:bg-green-400 text-sm sm:text-base transition-all active:scale-95'>Get Started Free</button>
                <button className='px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/20 text-white hover:bg-white/10 text-sm sm:text-base transition-all active:scale-95'>Watch Demo</button>
              </div>
              <div className='mt-6 sm:mt-8 flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 text-white/60'>
                <div>
                  <div className='text-xl sm:text-2xl font-bold text-white'>10K+</div>
                  <div className='text-[10px] sm:text-xs'>Creators</div>
                </div>
                <div>
                  <div className='text-xl sm:text-2xl font-bold text-white'>50K+</div>
                  <div className='text-[10px] sm:text-xs'>Uploads</div>
                </div>
                <div>
                  <div className='text-xl sm:text-2xl font-bold text-white'>1M+</div>
                  <div className='text-[10px] sm:text-xs'>Streams</div>
                </div>
              </div>
            </div>
            <div className='relative order-1 lg:order-2 w-full lg:w-auto'>
              <div className='absolute -right-5 sm:-right-10 -top-5 sm:-top-10 w-48 sm:w-64 lg:w-72 h-48 sm:h-64 lg:h-72 rounded-full bg-green-500/20 blur-3xl'></div>
              <div className='absolute -left-5 sm:-left-10 bottom-0 w-48 sm:w-64 lg:w-72 h-48 sm:h-64 lg:h-72 rounded-full bg-purple-500/20 blur-3xl'></div>
              <div className='relative aspect-video rounded-xl sm:rounded-2xl bg-[url(https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1932&auto=format&fit=crop)] bg-cover bg-center shadow-2xl border border-white/10'></div>
            </div>
          </div>
        </section>

        <LeaderboardSection />

        <div className='mb-4 sm:mb-6'>
          <h1 className='my-3 sm:my-5 font-bold text-xl sm:text-2xl text-white px-2 sm:px-0'>Featured Charts</h1>
          <div className='flex gap-3 sm:gap-4 overflow-x-auto pb-2 px-2 sm:px-0'>
            {albums.map((item, index)=>(<AlbumItem key={index} name={item.name} desc={item.desc} id={item.id ?? index} image={item.image} />))}
          </div>
        </div>

         <div className='mb-4 sm:mb-6'>
          <h1 className='my-3 sm:my-5 font-bold text-xl sm:text-2xl text-white px-2 sm:px-0'>Today's Biggest Hits</h1>
          <div className='flex gap-3 sm:gap-4 overflow-x-auto pb-2 px-2 sm:px-0'>
            {songs.map((item,index)=>(<SongItem key={index} name={item.name} desc={item.desc} id={index} image={item.image} album={item.album}/>))}
          </div>
        </div>
      </>
    )
  }
  
  export default DisplayHome
  