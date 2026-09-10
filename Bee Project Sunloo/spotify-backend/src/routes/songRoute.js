import { addSong,listSong, removeSong, getUserSongs, findDuplicates, getSongLyrics, updateSongLyrics } from "../controllers/songController.js";
import express from 'express'
import upload from "../middleware/multer.js";
import { optionalAuth, authenticate } from "../middleware/auth.js";

const songRouter= express.Router();

songRouter.post('/add', authenticate, upload.fields([{name:'image', maxCount:1}, {name:'audio', maxCount:1}]),addSong);
songRouter.get('/list',listSong);
songRouter.post('/remove', optionalAuth, removeSong);
songRouter.get('/my-uploads', authenticate, getUserSongs);
songRouter.get('/duplicates', authenticate, findDuplicates);
songRouter.get('/:id/lyrics', optionalAuth, getSongLyrics);
songRouter.put('/:id/lyrics', authenticate, updateSongLyrics);

export default songRouter;




