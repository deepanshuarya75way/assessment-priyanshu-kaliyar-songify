import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { PlayerContext } from '../context/PlayerContext';

const DisplayLyrics = () => {
  const { track, lyrics, lyricsStatus, setShowLyricsPane } = useContext(PlayerContext);
  const [activeLine, setActiveLine] = useState(0);
  const containerRef = useRef(null);
  const lineRefs = useRef([]);

  const lyricLines = useMemo(() => {
    if (!lyrics) return [];
    return lyrics.replace(/\r/g, '').split('\n').map(line => line.trimEnd());
  }, [lyrics]);

  useEffect(() => {
    lineRefs.current = lyricLines.map((_, i) => lineRefs.current[i] || React.createRef());
    setActiveLine(0);
  }, [lyricLines.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || lyricLines.length === 0) return;

    const updateActiveLine = () => {
      if (!container) return;
      const center = container.scrollTop + container.clientHeight / 2;
      let closestIndex = 0;
      let minDiff = Infinity;
      lineRefs.current.forEach((ref, index) => {
        const el = ref?.current;
        if (!el) return;
        const elCenter = el.offsetTop + el.clientHeight / 2;
        const diff = Math.abs(elCenter - center);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = index;
        }
      });
      setActiveLine(closestIndex);
    };

    const handler = () => window.requestAnimationFrame(updateActiveLine);
    container.addEventListener('scroll', handler);
    updateActiveLine();

    return () => container.removeEventListener('scroll', handler);
  }, [lyricLines.length]);

  return (
    <div className='w-full h-full flex flex-col bg-gradient-to-b from-[#0a0f14] via-[#101820] to-[#050608] text-white rounded-xl border border-white/5 shadow-2xl'>
      <header className='flex flex-wrap items-center justify-between gap-4 px-8 py-6 border-b border-white/5'>
        <div>
          <p className='text-sm uppercase tracking-[0.4em] text-green-300'>Lyrics</p>
          <p className='text-3xl font-black'>{track?.name || 'No song playing'}</p>
          {track?.album && <p className='text-white/60 text-base'>{track.album}</p>}
        </div>
        <button
          onClick={() => setShowLyricsPane(false)}
          className='px-4 py-2 border border-white/20 rounded-full text-white/80 hover:text-white hover:border-white/50 transition-colors text-sm'
        >
          Close ✕
        </button>
      </header>

      <div
        ref={containerRef}
        className='flex-1 overflow-y-auto px-6 sm:px-12 lg:px-24 py-8 space-y-6 text-center'
      >
        {!track && (
          <p className='text-white/70 text-lg'>Start playing a song to see its lyrics here.</p>
        )}

        {track && lyricsStatus === 'loading' && (
          <p className='text-white/70 text-lg animate-pulse'>Loading lyrics...</p>
        )}

        {track && lyricsStatus === 'error' && (
          <p className='text-red-400 text-lg'>
            Unable to load lyrics right now. Please try again later.
          </p>
        )}

        {track && lyricsStatus === 'empty' && (
          <div className='text-white/70 text-lg space-y-2 max-w-2xl mx-auto'>
            <p>Lyrics not available for this song.</p>
            <p className='text-white/50 text-base'>
              If this is your upload, add lyrics from the admin panel to show them here.
            </p>
          </div>
        )}

        {track && lyricsStatus === 'unavailable' && (
          <p className='text-white/70 text-lg'>Lyrics aren&apos;t supported for this track.</p>
        )}

        {track && lyricsStatus === 'idle' && (
          <p className='text-white/70 text-lg'>Lyrics will appear here once available.</p>
        )}

        {track && lyricsStatus === 'loaded' && lyricLines.length > 0 && (
          lyricLines.map((line, index) => {
            const distance = Math.abs(index - activeLine);
            let textClass = 'text-white/40 text-2xl';
            if (distance === 0) textClass = 'text-white text-5xl font-black';
            else if (distance === 1) textClass = 'text-white/80 text-4xl font-bold';
            else if (distance === 2) textClass = 'text-white/60 text-3xl font-semibold';

            return (
              <p
                key={`${line}-${index}`}
                ref={lineRefs.current[index]}
                className={`${textClass} transition-all duration-300 leading-snug`}
              >
                {line.trim() === '' ? '♪' : line}
              </p>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DisplayLyrics;

