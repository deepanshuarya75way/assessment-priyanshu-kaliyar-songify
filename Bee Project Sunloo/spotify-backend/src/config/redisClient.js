import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = Number(process.env.REDIS_PORT || 6379);

const redisClient = createClient(
  redisUrl
    ? { url: redisUrl }
    : {
        socket: {
          host: redisHost,
          port: redisPort,
          reconnectStrategy: (retries) => {
            const delay = Math.min(retries * 50, 2000);
            return delay;
          },
        },
      }
);

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err.message);
});

let redisReadyPromise = null;

export const connectRedis = async () => {
  if (redisClient.isOpen) {
    return redisClient;
  }

  if (!redisReadyPromise) {
    redisReadyPromise = redisClient
      .connect()
      .then(() => {
        console.log('Redis connected');
        return redisClient;
      })
      .catch((err) => {
        console.error('Failed to connect to Redis:', err.message);
        redisReadyPromise = null;
        throw err;
      });
  }

  return redisReadyPromise;
};

export default redisClient;


