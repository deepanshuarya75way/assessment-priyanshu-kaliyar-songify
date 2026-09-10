import { useEffect, useState } from 'react';
import pubsub from '../utils/pubsub';

const NowPlayingTicker = () => {
  const [nowPlaying, setNowPlaying] = useState(null);

  useEffect(() => {
    const unsubscribe = pubsub.subscribe('now-playing', (payload) => {
      setNowPlaying(payload);
    });
    return unsubscribe;
  }, []);

  if (!nowPlaying) {
    return null;
  }

  return (
    <div className='fixed bottom-24 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-white/10 text-white text-sm backdrop-blur-md border border-white/20 shadow-lg'>
      <span className='font-semibold text-green-400'>Now Playing:</span>{' '}
      <span>{nowPlaying?.song || 'Unknown Song'}</span>
      <span className='text-white/60'> — {nowPlaying?.artist || 'Unknown Artist'}</span>
    </div>
  );
};

export default NowPlayingTicker;


