import React from 'react'
import Navbar from './Navbar'
import { useNavigate } from 'react-router-dom'

const DisplayAbout = () => {
  const navigate = useNavigate()

  return (
    <>
      <Navbar />
      
      <div className='mt-8 max-w-4xl mx-auto px-4'>
        {/* Hero Section */}
        <div className='text-center mb-12'>
          <div className='text-7xl mb-6'>🎵</div>
          <h1 className='text-5xl font-bold text-white mb-4'>Songify</h1>
          <p className='text-white/60 text-xl'>Your Personal Music Streaming Platform</p>
        </div>

        {/* About Section */}
        <div className='space-y-8 mb-12'>
          <section className='bg-[#0f1418]/50 rounded-xl p-8 border border-white/5'>
            <h2 className='text-3xl font-bold text-white mb-4'>About Us</h2>
            <p className='text-white/80 leading-relaxed mb-4'>
              Songify is a modern, full-stack music streaming platform that empowers users to discover, 
              upload, and enjoy music from around the world. Built with cutting-edge web technologies, 
              Songify provides a seamless experience for music lovers and creators alike.
            </p>
            <p className='text-white/80 leading-relaxed'>
              Whether you're an artist looking to share your creations or a listener seeking new sounds, 
              Songify offers the tools and features you need to make music a part of your daily life.
            </p>
          </section>

          {/* Features Section */}
          <section className='bg-[#0f1418]/50 rounded-xl p-8 border border-white/5'>
            <h2 className='text-3xl font-bold text-white mb-6'>Features</h2>
            <div className='grid md:grid-cols-2 gap-6'>
              <div className='flex gap-4'>
                <div className='text-3xl'>🎧</div>
                <div>
                  <h3 className='text-xl font-semibold text-white mb-2'>Stream Music</h3>
                  <p className='text-white/70'>Listen to your favorite songs with our high-quality audio player</p>
                </div>
              </div>
              <div className='flex gap-4'>
                <div className='text-3xl'>📤</div>
                <div>
                  <h3 className='text-xl font-semibold text-white mb-2'>Upload Your Music</h3>
                  <p className='text-white/70'>Share your creations with the world by uploading songs and albums</p>
                </div>
              </div>
              <div className='flex gap-4'>
                <div className='text-3xl'>🔍</div>
                <div>
                  <h3 className='text-xl font-semibold text-white mb-2'>Search & Discover</h3>
                  <p className='text-white/70'>Find new music with our powerful search functionality</p>
                </div>
              </div>
              <div className='flex gap-4'>
                <div className='text-3xl'>📚</div>
                <div>
                  <h3 className='text-xl font-semibold text-white mb-2'>Organize Playlists</h3>
                  <p className='text-white/70'>Create and manage albums to organize your music collection</p>
                </div>
              </div>
              <div className='flex gap-4'>
                <div className='text-3xl'>👤</div>
                <div>
                  <h3 className='text-xl font-semibold text-white mb-2'>User Accounts</h3>
                  <p className='text-white/70'>Create an account to save your uploads and preferences</p>
                </div>
              </div>
              <div className='flex gap-4'>
                <div className='text-3xl'>🌐</div>
                <div>
                  <h3 className='text-xl font-semibold text-white mb-2'>Browse Library</h3>
                  <p className='text-white/70'>Explore all available music from our community</p>
                </div>
              </div>
            </div>
          </section>

          {/* Technology Section */}
          <section className='bg-[#0f1418]/50 rounded-xl p-8 border border-white/5'>
            <h2 className='text-3xl font-bold text-white mb-6'>Built With</h2>
            <div className='grid md:grid-cols-3 gap-4'>
              <div className='bg-[#121921] rounded-lg p-4 border border-white/5'>
                <h4 className='font-semibold text-white mb-2'>Frontend</h4>
                <ul className='text-white/70 text-sm space-y-1'>
                  <li>• React 19</li>
                  <li>• Vite</li>
                  <li>• Tailwind CSS</li>
                  <li>• React Router</li>
                </ul>
              </div>
              <div className='bg-[#121921] rounded-lg p-4 border border-white/5'>
                <h4 className='font-semibold text-white mb-2'>Backend</h4>
                <ul className='text-white/70 text-sm space-y-1'>
                  <li>• Node.js</li>
                  <li>• Express.js</li>
                  <li>• MongoDB</li>
                  <li>• JWT Authentication</li>
                </ul>
              </div>
              <div className='bg-[#121921] rounded-lg p-4 border border-white/5'>
                <h4 className='font-semibold text-white mb-2'>Services</h4>
                <ul className='text-white/70 text-sm space-y-1'>
                  <li>• Cloudinary</li>
                  <li>• bcrypt</li>
                  <li>• Multer</li>
                  <li>• CORS</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className='bg-gradient-to-r from-green-500/20 to-purple-500/20 rounded-xl p-8 border border-white/10'>
            <h2 className='text-3xl font-bold text-white mb-6 text-center'>Platform Stats</h2>
            <div className='grid grid-cols-3 gap-6 text-center'>
              <div>
                <div className='text-4xl font-bold text-white mb-2'>10K+</div>
                <div className='text-white/70'>Active Users</div>
              </div>
              <div>
                <div className='text-4xl font-bold text-white mb-2'>50K+</div>
                <div className='text-white/70'>Songs Uploaded</div>
              </div>
              <div>
                <div className='text-4xl font-bold text-white mb-2'>1M+</div>
                <div className='text-white/70'>Streams</div>
              </div>
            </div>
          </section>

          {/* Contact/CTA Section */}
          <section className='bg-[#0f1418]/50 rounded-xl p-8 border border-white/5 text-center'>
            <h2 className='text-3xl font-bold text-white mb-4'>Get Started</h2>
            <p className='text-white/70 mb-6 max-w-2xl mx-auto'>
              Ready to start your musical journey? Create an account today and begin exploring, 
              uploading, and sharing music with our community.
            </p>
            <div className='flex gap-4 justify-center'>
              <button
                onClick={() => navigate('/signup')}
                className='px-6 py-3 rounded-full bg-green-500 text-black font-semibold hover:bg-green-400 transition-colors'
              >
                Sign Up Free
              </button>
              <button
                onClick={() => navigate('/')}
                className='px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors'
              >
                Explore Music
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className='text-center py-8 border-t border-white/10 mt-12'>
          <p className='text-white/60 text-sm'>
            © 2025 Songify. Built with ❤️ for music lovers everywhere.
          </p>
        </div>
      </div>
    </>
  )
}

export default DisplayAbout

