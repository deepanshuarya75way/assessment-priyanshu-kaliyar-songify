import express from 'express'
import { addAlbum,listAlbum,removeAlbum, getUserAlbums } from '../controllers/albumcontroller.js'
import upload from '../middleware/multer.js'
import { optionalAuth, authenticate } from '../middleware/auth.js'
import { cache } from '../middleware/cache.js';

const albumRouter= express.Router();

albumRouter.post('/add', authenticate, upload.single('image'), addAlbum);
albumRouter.get('/list', listAlbum);
albumRouter.post('/remove', removeAlbum);
albumRouter.get('/my-uploads', authenticate, getUserAlbums);
albumRouter.get(
  '/',
  cache(() => 'albums:all'),
  async (req, res, next) => {
    try {
      const albums = await getAlbums();
      // Save to cache
      if (res.locals.cacheKey) {
        await req.app.locals.redisClient.set(
          res.locals.cacheKey,
          JSON.stringify(albums),
          { EX: 3600 } // 1 hour expiry
        );
      }
      res.json(albums);
    } catch (err) {
      next(err);
    }
  }
);

export default albumRouter;