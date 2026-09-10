import express from 'express';
import { recordSongPlay, fetchLeaderboard } from '../controllers/statsController.js';
import { authenticate } from '../middleware/auth.js';

const statsRouter = express.Router();

statsRouter.post('/play', authenticate, recordSongPlay);
statsRouter.get('/leaderboard', fetchLeaderboard);

export default statsRouter;


