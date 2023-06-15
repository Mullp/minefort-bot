import {createClient} from 'redis';
import {env} from '../../utils/env';

export const redis = createClient({
  url: env.REDIS_URL,
});
redis.on('error', err => console.log('Redis Client Error', err));
redis.on('connect', () => console.log('Redis Client Ready'));

(async () => {
  await redis.connect();
})();
