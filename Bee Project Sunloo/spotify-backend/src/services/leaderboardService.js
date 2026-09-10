import redisClient, { connectRedis } from '../config/redisClient.js';
import songModel from '../models/songModel.js';
import albumModel from '../models/albumModel.js';
import userModel from '../models/userModel.js';

const DAY_SECONDS = 60 * 60 * 24;
const DAILY_TTL = DAY_SECONDS * 2; // keep daily stats for 48 hours

const leaderboardBases = {
  songs: 'leaderboard:songs',
  albums: 'leaderboard:albums',
  artists: 'leaderboard:artists',
  listeners: 'leaderboard:listeners',
};

const getTodayKey = (baseKey, date = new Date()) => {
  const iso = date.toISOString().slice(0, 10); // YYYY-MM-DD
  return `${baseKey}:daily:${iso}`;
};

const getRangeKey = (baseKey, range = 'all-time') => {
  if (range === 'today') {
    return getTodayKey(baseKey);
  }
  return `${baseKey}:all-time`;
};

export const incrementPlayCounts = async ({ song, listenerId }) => {
  if (!song?._id) return;

  try {
    await connectRedis();
  } catch (error) {
    console.warn('Redis unavailable. Skipping leaderboard increment.');
    return;
  }

  const songId = song._id.toString();
  const albumName = song.album?.trim();
  const artistId = song.userId ? song.userId.toString() : null;
  const listener = listenerId ? listenerId.toString() : null;

  const pipeline = redisClient.multi();

  const songDailyKey = getTodayKey(leaderboardBases.songs);
  pipeline.zIncrBy(`${leaderboardBases.songs}:all-time`, 1, songId);
  pipeline.zIncrBy(songDailyKey, 1, songId);
  pipeline.expire(songDailyKey, DAILY_TTL);

  if (albumName) {
    const albumDailyKey = getTodayKey(leaderboardBases.albums);
    pipeline.zIncrBy(`${leaderboardBases.albums}:all-time`, 1, albumName);
    pipeline.zIncrBy(albumDailyKey, 1, albumName);
    pipeline.expire(albumDailyKey, DAILY_TTL);
  }

  if (artistId) {
    const artistDailyKey = getTodayKey(leaderboardBases.artists);
    pipeline.zIncrBy(`${leaderboardBases.artists}:all-time`, 1, artistId);
    pipeline.zIncrBy(artistDailyKey, 1, artistId);
    pipeline.expire(artistDailyKey, DAILY_TTL);
  }

  if (listener) {
    const listenerDailyKey = getTodayKey(leaderboardBases.listeners);
    pipeline.zIncrBy(`${leaderboardBases.listeners}:all-time`, 1, listener);
    pipeline.zIncrBy(listenerDailyKey, 1, listener);
    pipeline.expire(listenerDailyKey, DAILY_TTL);
  }

  try {
    await pipeline.exec();
  } catch (error) {
    console.error('Failed to update leaderboard stats:', error.message);
  }
};

const parseLeaderboardEntries = (entries = []) => {
  const parsed = [];
  for (let i = 0; i < entries.length; i += 2) {
    parsed.push({
      id: entries[i],
      score: Number(entries[i + 1] || 0),
    });
  }
  return parsed;
};

const fetchSongMeta = async (ids) => {
  const songs = await songModel
    .find({ _id: { $in: ids } })
    .select('name album image duration userId');
  const map = new Map();
  songs.forEach((s) => map.set(s._id.toString(), s));
  return map;
};

const fetchAlbumMeta = async (names) => {
  const albums = await albumModel
    .find({ name: { $in: names } })
    .select('name image desc');
  const lowerMap = new Map();
  albums.forEach((album) => lowerMap.set(album.name.toLowerCase(), album));
  return lowerMap;
};

const fetchUserMeta = async (ids) => {
  const users = await userModel
    .find({ _id: { $in: ids } })
    .select('name email');
  const map = new Map();
  users.forEach((u) => map.set(u._id.toString(), u));
  return map;
};

export const getLeaderboardData = async ({
  category = 'songs',
  range = 'all-time',
  limit = 10,
} = {}) => {
  const baseKey = leaderboardBases[category];
  if (!baseKey) {
    return [];
  }

  try {
    await connectRedis();
  } catch (error) {
    console.warn('Redis unavailable. Leaderboard data cannot be fetched.');
    return [];
  }

  const key = getRangeKey(baseKey, range);
  let entries = [];
  try {
    entries = await redisClient.zRange(key, 0, limit - 1, {
      REV: true,
      WITHSCORES: true,
    });
  } catch (error) {
    console.error('Failed to read leaderboard data:', error.message);
    return [];
  }
  const parsed = parseLeaderboardEntries(entries);

  if (parsed.length === 0) {
    return [];
  }

  if (category === 'songs') {
    const meta = await fetchSongMeta(parsed.map((p) => p.id));
    return parsed.map((item) => {
      const song = meta.get(item.id);
      return {
        id: item.id,
        score: item.score,
        name: song?.name || 'Unknown Song',
        album: song?.album || 'Unknown Album',
        image: song?.image,
        duration: song?.duration,
      };
    });
  }

  if (category === 'albums') {
    const meta = await fetchAlbumMeta(parsed.map((p) => p.id.toLowerCase()));
    return parsed.map((item) => {
      const album = meta.get(item.id.toLowerCase());
      return {
        id: item.id,
        score: item.score,
        name: item.id,
        image: album?.image,
        desc: album?.desc,
      };
    });
  }

  if (category === 'artists' || category === 'listeners') {
    const meta = await fetchUserMeta(parsed.map((p) => p.id));
    return parsed.map((item) => {
      const user = meta.get(item.id);
      return {
        id: item.id,
        score: item.score,
        name: user?.name || 'Unknown User',
        email: user?.email,
      };
    });
  }

  return parsed;
};

