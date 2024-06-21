import { createClient } from 'redis';
const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});
redisClient.connect()
    .then(() => {
    console.log('Connected to Redis');
})
    .catch((err) => {
    console.error('Redis Connection Error', err);
});
redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});
export default redisClient;
