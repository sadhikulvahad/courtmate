
import { createClient } from 'redis'

export const redisClient = createClient({
    // url: process.env.REDIS_URL,
    url:`redis://${'localhost'}:${process.env.REDIS_PORT}`,
    // socket: {
    //     tls: true,
    //     rejectUnauthorized: false
    // }
})

redisClient.on('connect', () => console.log('Redis connected'))
redisClient.on('error', (err) => console.log('Redis Error', err))

export const connectRedis = async () => {
    await redisClient.connect()
}