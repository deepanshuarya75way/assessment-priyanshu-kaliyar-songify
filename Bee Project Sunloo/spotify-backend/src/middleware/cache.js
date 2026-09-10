import redisClient, { connectRedis } from '../config/redisClient.js';

// Cache middleware for GET requests
export const cache = (keyBuilder) => async (req, res, next) => {
  await connectRedis();
  const key = keyBuilder(req);

  try {
    const cached = await redisClient.get(key);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    res.locals.cacheKey = key;
    next();
  } catch (err) {
    next();
  }
};