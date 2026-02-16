import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

// Create Redis client
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    disableOfflineQueue: true, // 👈 Fail immediately if offline (stops blocking)
});

// Error handling
redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('🔄 Connecting to Redis...');
});

redisClient.on('ready', () => {
    console.log('✅ Redis connected successfully');
});

// Connect function
async function connectRedis() {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (error) {
        console.error('❌ Failed to connect to Redis:', error);
        // Don't exit process - app can run without cache
        console.log('⚠️ App will continue without Redis caching');
    }
}

export { redisClient, connectRedis };
