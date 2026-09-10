import React, { useEffect, useState, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PlayerContext } from '../context/PlayerContext'

const Navbar = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery, setSearchQuery } = useContext(PlayerContext);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '')
  const [isOpen, setIsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onStorage = () => setUserName(localStorage.getItem('userName') || '')
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setUserName('');
    setIsOpen(false);
    navigate('/')
  }

  const initial = userName ? userName.trim().charAt(0).toUpperCase() : ''

  return (
    <div className='w-full sticky top-0 z-20 bg-[#0b0f12]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0b0f12]/60 border-b border-white/5'>
      <div className='mx-auto max-w-7xl px-2 sm:px-4 py-2 sm:py-3'>
        {/* Top Row - Brand, Search, Menu */}
        <div className='flex items-center gap-2 sm:gap-4'>
        {/* Brand */}
          <div className='flex items-center gap-1.5 sm:gap-2 cursor-pointer flex-shrink-0' onClick={() => navigate('/') }>
            <span className='text-xl sm:text-2xl leading-none'>🎵</span>
            <span className='text-white font-extrabold text-lg sm:text-xl tracking-tight'>Songify</span>
        </div>

          {/* Search - Hidden on very small screens, visible on sm+ */}
          <div className='flex-1 px-2 sm:px-4 min-w-0'>
            <div className='w-full max-w-2xl mx-auto flex items-center gap-2 sm:gap-3 bg-[#121921] text-white/80 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 shadow-inner'>
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className='w-4 h-4 sm:w-5 sm:h-5 opacity-70 flex-shrink-0'>
              <path fillRule='evenodd' d='M10.5 3.75a6.75 6.75 0 1 0 4.2 12.02l4.74 4.74a.75.75 0 1 0 1.06-1.06l-4.74-4.74A6.75 6.75 0 0 0 10.5 3.75Zm-5.25 6.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Z' clipRule='evenodd'/>
            </svg>
            <input 
                className='flex-1 bg-transparent outline-none placeholder:text-white/40 text-sm sm:text-base min-w-0' 
              placeholder='What do you want to listen to?' 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim() && location.pathname !== '/search') {
                  navigate('/search');
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim() && location.pathname !== '/search') {
                  navigate('/search');
                }
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  navigate('/');
                }}
                  className='text-white/60 hover:text-white/80 flex-shrink-0 text-sm sm:text-base'
              >
                ✕
              </button>
            )}
          </div>
        </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='md:hidden w-8 h-8 flex items-center justify-center text-white/80 hover:text-white'
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>

          {/* Desktop Links */}
          <div className='hidden md:flex items-center gap-4 lg:gap-6 text-white/80'>
            <button className='hover:text-white transition-colors text-sm lg:text-base' onClick={() => navigate('/music')}>Music</button>
            <button className='hover:text-white transition-colors text-sm lg:text-base' onClick={() => navigate('/uploads')}>Your Uploads</button>
            <button className='hover:text-white transition-colors text-sm lg:text-base' onClick={() => navigate('/browse')}>Browse</button>
            <button className='hover:text-white transition-colors text-sm lg:text-base' onClick={() => navigate('/about')}>About Us</button>
        </div>

        {/* Auth or User */}
          <div className='hidden sm:flex items-center gap-2 sm:gap-3 relative flex-shrink-0'>
          {!initial ? (
            <>
                <button className='px-2 sm:px-3 py-1 sm:py-1.5 text-white/80 hover:text-white text-xs sm:text-sm' onClick={() => navigate('/login')}>Login</button>
                <button className='px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white text-black font-semibold hover:bg-white/90 text-xs sm:text-sm' onClick={() => navigate('/signup')}>Sign Up</button>
            </>
          ) : (
            <div>
                <button onClick={() => setIsOpen(v=>!v)} className='w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-black font-bold grid place-items-center text-sm sm:text-base'>{initial}</button>
              {isOpen && (
                  <div className='absolute right-0 mt-2 w-40 rounded-lg border border-white/10 bg-[#0f1418] text-white shadow-lg z-30'>
                  <div className='px-4 py-2 text-white/80 text-sm'>{userName}</div>
                  <button onClick={logout} className='w-full text-left px-4 py-2 hover:bg-white/10'>Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className='md:hidden mt-3 pt-3 border-t border-white/10'>
            <div className='flex flex-col gap-2'>
              <button className='text-left px-2 py-2 text-white/80 hover:text-white transition-colors text-sm' onClick={() => { navigate('/music'); setIsMobileMenuOpen(false); }}>Music</button>
              <button className='text-left px-2 py-2 text-white/80 hover:text-white transition-colors text-sm' onClick={() => { navigate('/uploads'); setIsMobileMenuOpen(false); }}>Your Uploads</button>
              <button className='text-left px-2 py-2 text-white/80 hover:text-white transition-colors text-sm' onClick={() => { navigate('/browse'); setIsMobileMenuOpen(false); }}>Browse</button>
              <button className='text-left px-2 py-2 text-white/80 hover:text-white transition-colors text-sm' onClick={() => { navigate('/about'); setIsMobileMenuOpen(false); }}>About Us</button>
              {!initial ? (
                <div className='flex gap-2 pt-2 border-t border-white/10 mt-2'>
                  <button className='flex-1 px-3 py-2 text-white/80 hover:text-white text-sm' onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>Login</button>
                  <button className='flex-1 px-3 py-2 rounded-full bg-white text-black font-semibold hover:bg-white/90 text-sm' onClick={() => { navigate('/signup'); setIsMobileMenuOpen(false); }}>Sign Up</button>
                </div>
              ) : (
                <div className='pt-2 border-t border-white/10 mt-2'>
                  <div className='px-2 py-2 text-white/80 text-sm'>{userName}</div>
                  <button className='w-full text-left px-2 py-2 hover:bg-white/10 text-sm' onClick={() => { logout(); setIsMobileMenuOpen(false); }}>Logout</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar
