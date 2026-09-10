import React, { useContext, useEffect, useRef, useState } from 'react'
import {Route, Routes,useLocation, Link, useNavigate} from 'react-router-dom'
import DisplayHome from './DisplayHome'
import DisplayAlbum from './DisplayAlbum'
import DisplaySearch from './DisplaySearch'
import DisplayUploads from './DisplayUploads'
import DisplayBrowse from './DisplayBrowse'
import DisplayMusic from './DisplayMusic'
import DisplayAbout from './DisplayAbout'
import { albumsData } from '../assets/assets'
import { API_URL } from '../config/api'
import DisplayLyrics from './DisplayLyrics'
import { PlayerContext } from '../context/PlayerContext'

const emitAuthTokenChange = (tokenValue) => {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  try {
    const event = typeof window.CustomEvent === 'function'
      ? new CustomEvent('auth-token-changed', { detail: { token: tokenValue } })
      : Object.assign(new Event('auth-token-changed'), { detail: { token: tokenValue } });
    window.dispatchEvent(event);
  } catch (err) {
    console.warn('Failed to dispatch auth token change event', err);
  }
};

const Card = ({ children }) => (
  <div className='mx-auto max-w-xl w-full bg-[#0f1418]/90 border border-white/10 rounded-2xl p-8 shadow-xl'>{children}</div>
)

const useAuth = () => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const save = (t, user) => { 
    localStorage.setItem('token', t); 
    if (user?.name) localStorage.setItem('userName', user.name);
    if (user?.email) localStorage.setItem('userEmail', user.email);
    setToken(t); 
    emitAuthTokenChange(t);
  };
  const clear = () => { 
    localStorage.removeItem('token'); 
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setToken(''); 
    emitAuthTokenChange('');
  };
  return { token, save, clear };
}

const LoginPage = () => {
  const nav = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Get redirect path from URL params or location state, default to /uploads if coming from there
  const getRedirectPath = () => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    if (redirect) return redirect;
    if (location.state?.from?.pathname) return location.state.from.pathname;
    // If user was trying to access /uploads, redirect there after login
    if (document.referrer.includes('/uploads')) return '/uploads';
    return '/';
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!data.success) { setError(data.message || 'Login failed'); return; }
      auth.save(data.token, data.user);
      const redirectPath = getRedirectPath();
      nav(redirectPath);
    } catch {
      setError('Login failed');
    }
  };

  return (
  <div className='min-h-[70vh] grid place-items-center px-4'>
    <div className='w-full'>
      <Link to='/' className='text-white/70 hover:text-white text-sm'>&larr; Back to Home</Link>
      <Card>
        <div className='flex flex-col items-center gap-3 mb-6'>
          <div className='w-12 h-12 rounded-full grid place-items-center bg-green-500 text-black text-xl'>🎵</div>
          <h1 className='text-3xl font-extrabold text-white'>Log In to Songify</h1>
          <p className='text-white/60 text-sm'>Welcome back. Enter your details to continue.</p>
        </div>
        <form className='flex flex-col gap-4' onSubmit={submit}>
          <label className='text-white/80 text-sm'>Email Address
            <input value={email} onChange={e=>setEmail(e.target.value)} type='email' placeholder='Enter your email' className='mt-1 w-full bg-[#121921] border border-white/10 rounded-xl px-4 py-3 outline-none text-white placeholder:text-white/40'/>
          </label>
          <label className='text-white/80 text-sm'>Password
            <input value={password} onChange={e=>setPassword(e.target.value)} type='password' placeholder='Enter your password' className='mt-1 w-full bg-[#121921] border border-white/10 rounded-xl px-4 py-3 outline-none text-white placeholder:text-white/40'/>
          </label>
          {error && <div className='text-red-400 text-sm'>{error}</div>}
          <button type='submit' className='mt-2 w-full px-5 py-3 rounded-xl bg-green-500 text-black font-semibold hover:bg-green-400'>Log In</button>
          <p className='text-center text-white/60 text-sm'>Don't have an account? <Link to='/signup' className='text-green-400 hover:text-green-300'>Sign up</Link></p>
        </form>
      </Card>
    </div>
  </div>);
}

const SignupPage = () => {
  const nav = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Get redirect path from URL params or location state
  const getRedirectPath = () => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    if (redirect) return redirect;
    if (location.state?.from?.pathname) return location.state.from.pathname;
    return '/';
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
      const data = await res.json();
      if (!data.success) { setError(data.message || 'Registration failed'); return; }
      auth.save(data.token, data.user);
      const redirectPath = getRedirectPath();
      nav(redirectPath);
    } catch {
      setError('Registration failed');
    }
  };

  return (
  <div className='min-h-[70vh] grid place-items-center px-4'>
    <div className='w-full'>
      <Link to='/' className='text-white/70 hover:text-white text-sm'>&larr; Back to Home</Link>
      <Card>
        <div className='flex flex-col items-center gap-3 mb-6'>
          <div className='w-12 h-12 rounded-full grid place-items-center bg-green-500 text-black text-xl'>🎵</div>
          <h1 className='text-3xl font-extrabold text-white'>Sign Up to Songify</h1>
          <p className='text-white/60 text-sm'>Create your account and start listening.</p>
        </div>
        <form className='flex flex-col gap-4' onSubmit={submit}>
          <label className='text-white/80 text-sm'>Name
            <input value={name} onChange={e=>setName(e.target.value)} type='text' placeholder='Enter your name' className='mt-1 w-full bg-[#121921] border border-white/10 rounded-xl px-4 py-3 outline-none text-white placeholder:text-white/40'/>
          </label>
          <label className='text-white/80 text-sm'>Email Address
            <input value={email} onChange={e=>setEmail(e.target.value)} type='email' placeholder='Enter your email' className='mt-1 w-full bg-[#121921] border border-white/10 rounded-xl px-4 py-3 outline-none text-white placeholder:text-white/40'/>
          </label>
          <label className='text-white/80 text-sm'>Password
            <input value={password} onChange={e=>setPassword(e.target.value)} type='password' placeholder='Enter your password' className='mt-1 w-full bg-[#121921] border border-white/10 rounded-xl px-4 py-3 outline-none text-white placeholder:text-white/40'/>
          </label>
          {error && <div className='text-red-400 text-sm'>{error}</div>}
          <button type='submit' className='mt-2 w-full px-5 py-3 rounded-xl bg-green-500 text-black font-semibold hover:bg-green-400'>Create Account</button>
          <p className='text-center text-white/60 text-sm'>Already have an account? <Link to='/login' className='text-green-400 hover:text-green-300'>Log in</Link></p>
        </form>
      </Card>
    </div>
  </div>);
}

const Display = () => {

  const displayRef=useRef();
  const location=  useLocation();
  const isAlbum =location.pathname.includes("album");
  const albumId= isAlbum ? location.pathname.slice(-1) : "";
  const bgColor= isAlbum && albumsData[Number(albumId)] ? albumsData[Number(albumId)].bgColor : "#121212";
  const { showLyricsPane } = useContext(PlayerContext);

  useEffect(()=>{
    if(isAlbum){
      displayRef.current.style.background=`linear-gradient(${bgColor}, #121212)`
    }
    else{
      displayRef.current.style.background=`#121212`
    }
  })

  
  return (
    <div ref={displayRef} className='w-full m-0 px-6 pt-4 rounded bg-[#121212] text-white overflow-y-auto'>
      {showLyricsPane ? (
        <DisplayLyrics />
      ) : (
      <Routes>
        <Route path='/' element={<DisplayHome/>}/>
        <Route path='/music' element={<DisplayMusic/>}/>
        <Route path='/search' element={<DisplaySearch/>}/>
        <Route path='/album/:id' element={<DisplayAlbum/>}/>
        <Route path='/uploads' element={<DisplayUploads/>}/>
        <Route path='/browse' element={<DisplayBrowse/>}/>
        <Route path='/about' element={<DisplayAbout/>}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/signup' element={<SignupPage/>}/>
      </Routes>
      )}
    </div>
  )
}

export default Display

