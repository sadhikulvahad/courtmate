
import { createClient } from 'redis'

export const redisClient = createClient({
    url: `redis://${'localhost'}:${process.env.REDIS_PORT}`,
})

redisClient.on('connect', () => console.log('Redis connected'))
redisClient.on('error', (err) => console.log('Redis Error', err))

export const connectRedis = async () => {
    await redisClient.connect()
}