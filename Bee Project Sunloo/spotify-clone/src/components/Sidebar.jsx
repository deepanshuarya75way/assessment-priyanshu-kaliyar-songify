import React from 'react'
import {assets} from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Sidebar = () => {

  const navigate= useNavigate();
  return (
    
    <div className='w-[25%] h-full p-3 flex flex-col gap-3 text-gray-300'>
      <div className='bg-[#0f1418] rounded-xl p-4 flex flex-col gap-4 border border-white/5 shadow-sm'>
        <div onClick={()=> navigate('/')} className='flex items-center gap-3 cursor-pointer hover:text-white transition-colors'>
          <img 
            src={assets.home_icon} 
            alt="Home Icon" 
            className="w-6 h-6 object-contain opacity-80 group-hover:opacity-100" 
          />
          <p className='font-semibold'>Home</p>
        </div>

        <div onClick={()=> navigate('/search')} className='flex items-center gap-3 cursor-pointer hover:text-white transition-colors'>
          <img 
            src={assets.search_icon} 
            alt="Search Icon" 
            className="w-6 h-6 object-contain opacity-80 group-hover:opacity-100" 
          />
          <p className='font-semibold'>Search</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
