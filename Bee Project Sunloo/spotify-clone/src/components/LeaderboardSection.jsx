import React, { useEffect, useMemo, useState } from 'react';
import { API_URL } from '../config/api';

const leaderboardConfig = [
  {
    key: 'topSongs',
    title: 'Top Played Songs',
    description: 'All-time favorites across the platform',
    category: 'songs',
    range: 'all-time',
    limit: 5,
  },
  {
    key: 'trendingSongs',
    title: 'Trending Today',
    description: 'What listeners can’t stop replaying right now',
    category: 'songs',
    range: 'today',
    limit: 5,
  },
  {
    key: 'topArtists',
    title: 'Top Artists',
    description: 'Creators with the most streamed catalog',
    category: 'artists',
    range: 'all-time',
    limit: 5,
  },
  {
    key: 'activeListeners',
    title: 'Most Active Listeners',
    description: 'Fans spinning tracks the most',
    category: 'listeners',
    range: 'all-time',
    limit: 5,
  },
];

const LeaderboardRow = ({ rank, title, subtitle, score, image }) => (
  <div className='flex items-center gap-3 py-2 border-b border-white/5 last:border-transparent'>
    <div className='w-8 text-center text-white/60 font-semibold'>{rank}</div>
    {image ? (
      <img src={image} alt={title} className='w-10 h-10 rounded object-cover' />
    ) : (
      <div className='w-10 h-10 rounded bg-white/5 grid place-items-center text-white/40 text-sm'>
        ♫
      </div>
    )}
    <div className='flex-1 min-w-0'>
      <p className='text-white font-semibold truncate'>{title}</p>
      {subtitle && <p className='text-white/60 text-xs truncate'>{subtitle}</p>}
    </div>
    <div className='text-white/60 text-sm font-semibold'>{score} plays</div>
  </div>
);

const LeaderboardCard = ({ title, description, state }) => {
  const { loading, error, items } = state;

  return (
    <div className='bg-[#0b141b]/80 rounded-2xl border border-white/5 p-5 flex flex-col'>
      <div className='mb-4'>
        <p className='text-sm uppercase tracking-[0.4em] text-green-400 mb-1'>Stats</p>
        <h3 className='text-white text-xl font-bold'>{title}</h3>
        <p className='text-white/60 text-sm'>{description}</p>
      </div>

      {loading && (
        <div className='flex-1 flex items-center justify-center text-white/60 text-sm'>
          Loading...
        </div>
      )}

      {!loading && error && (
        <div className='flex-1 flex items-center justify-center text-red-400 text-sm text-center'>
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className='flex-1 flex items-center justify-center text-white/60 text-sm text-center'>
          No data yet. Start playing songs to populate this leaderboard.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div>
          {items.map((item, index) => (
            <LeaderboardRow
              key={`${title}-${item.id}-${index}`}
              rank={index + 1}
              title={item.name || item.id}
              subtitle={item.album || item.desc || item.email}
              score={item.score}
              image={item.image}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const LeaderboardSection = () => {
  const initialState = useMemo(() => {
    return leaderboardConfig.reduce((acc, cfg) => {
      acc[cfg.key] = { loading: true, error: null, items: [] };
      return acc;
    }, {});
  }, []);

  const [leaderboards, setLeaderboards] = useState(initialState);

  useEffect(() => {
    const controller = new AbortController();

    const fetchLeaderboards = async () => {
      const requests = await Promise.all(
        leaderboardConfig.map(async (cfg) => {
          const url = `${API_URL}/api/stats/leaderboard?category=${cfg.category}&range=${cfg.range}&limit=${cfg.limit}`;
          try {
            const res = await fetch(url, { signal: controller.signal });
            if (!res.ok) {
              throw new Error('Unable to load stats');
            }
            const data = await res.json();
            return { key: cfg.key, items: data?.items || [] };
          } catch (error) {
            if (error.name === 'AbortError') throw error;
            return { key: cfg.key, error: error.message || 'Failed to load stats' };
          }
        })
      );

      setLeaderboards((prev) => {
        const next = { ...prev };
        requests.forEach((result) => {
          next[result.key] = {
            loading: false,
            error: result.error || null,
            items: result.items || [],
          };
        });
        return next;
      });
    };

    fetchLeaderboards().catch((error) => {
      if (error.name === 'AbortError') return;
      setLeaderboards((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          next[key] = { loading: false, error: 'Failed to load stats', items: [] };
        });
        return next;
      });
    });

    return () => controller.abort();
  }, [initialState]);

  return (
    <section className='mb-8'>
      <div className='flex flex-col gap-2 mb-6'>
        <p className='text-green-400 font-semibold text-xs'>LEADERBOARD</p>
        <h2 className='text-3xl font-extrabold text-white'>Live Stats & Trends</h2>
        <p className='text-white/70 text-sm max-w-2xl'>
          Powered by Redis for real-time ranking. See what songs, artists, and listeners are
          dominating the charts right now.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
        {leaderboardConfig.map((cfg) => {
          const state =
            leaderboards[cfg.key] || { loading: true, error: null, items: [] };
          return (
            <LeaderboardCard
              key={cfg.key}
              title={cfg.title}
              description={cfg.description}
              state={state}
            />
          );
        })}
      </div>
    </section>
  );
};

export default LeaderboardSection;

