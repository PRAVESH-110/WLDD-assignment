import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';

// Mock Redis to prevent real connection attempts
jest.mock('../config/redis', () => ({
    redisClient: {
        connect: jest.fn(),
        on: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
        setEx: jest.fn(),
        del: jest.fn(),
        quit: jest.fn(),
        isOpen: true
    },
    connectRedis: jest.fn()
}));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    // Cleanup
    await mongoose.default.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Auth Endpoints', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/user/signup')
            .send({
                fname: 'Test',
                lname: 'User',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.email).toBe('test@example.com');
    });

    it('should NOT register duplicate user', async () => {
        const res = await request(app)
            .post('/api/auth/user/signup')
            .send({
                fname: 'Test',
                lname: 'User',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(400); // Or whatever error code for duplicate
    });

    it('should login an existing user', async () => {
        const res = await request(app)
            .post('/api/auth/user/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should reject invalid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/user/login')
            .send({
                email: 'test@example.com',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(401);
    });
});
