import React, { useContext } from 'react'
import { PlayerContext } from '../context/PlayerContext'

const SongItem = ({name,image,desc,id,album}) => {
  const {playWithId, songs, setSelectedSongDetail} = useContext(PlayerContext)

  const handleClick = (e) => {
    e.stopPropagation();
    const song = songs[id] || { name, image, desc, album, id };
    setSelectedSongDetail({ ...song, id }); // Ensure id is included
  }

  return (
    <div onClick={handleClick} className='w-[180px] min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26] transition-colors'>
      <img className='rounded w-full h-[180px] object-cover' src={image} alt="" />
      <p className='font-bold mt-2 mb-1 text-sm truncate'>{name}</p>
      <p className='text-slate-200 text-xs truncate'>{desc}</p>
    </div>
  )
}

export default SongItem
