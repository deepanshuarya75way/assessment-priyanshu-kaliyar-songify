import songModel from '../models/songModel.js';
import { incrementPlayCounts, getLeaderboardData } from '../services/leaderboardService.js';

export const recordSongPlay = async (req, res) => {
  try {
    const { songId } = req.body || {};

    if (!songId) {
      return res.status(400).json({ success: false, message: 'songId is required' });
    }

    const song = await songModel.findById(songId).select('name album userId image duration');
    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    await incrementPlayCounts({
      song,
      listenerId: req.user?._id,
    });

    return res.json({ success: true, message: 'Play recorded' });
  } catch (error) {
    console.error('Error recording song play:', error);
    return res.status(500).json({ success: false, message: 'Failed to record play' });
  }
};

export const fetchLeaderboard = async (req, res) => {
  try {
    const category = (req.query.category || 'songs').toLowerCase();
    const range = (req.query.range || 'all-time').toLowerCase();
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 10));

    const items = await getLeaderboardData({ category, range, limit });

    return res.json({
      success: true,
      category,
      range,
      items,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
};


