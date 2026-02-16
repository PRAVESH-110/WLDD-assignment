import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';

// Mock Redis
jest.mock('../config/redis', () => ({
    redisClient: {
        connect: jest.fn(),
        on: jest.fn(),
        get: jest.fn().mockResolvedValue(null), // Cache miss initially
        set: jest.fn(),
        setEx: jest.fn(),
        del: jest.fn(),
        quit: jest.fn(),
        isOpen: true
    },
    connectRedis: jest.fn()
}));

let mongoServer: MongoMemoryServer;
let token: string;
let taskId: string;

beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Create user & login to get token
    await request(app).post('/api/auth/user/signup').send({
        fname: 'Task',
        lname: 'Tester',
        email: 'tasks@test.com',
        password: 'password123'
    });

    const loginRes = await request(app).post('/api/auth/user/login').send({
        email: 'tasks@test.com',
        password: 'password123'
    });
    token = loginRes.body.token; // Inspect middleware if "Bearer " is needed
});

afterAll(async () => {
    await mongoose.default.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Task Endpoints', () => {
    it('should fail if unauthenticated', async () => {
        const res = await request(app).get('/api/tasks');
        expect(res.statusCode).toBe(401); // Corrected to 401 (Unauthorized)
    });

    it('should create a new task', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`) // Helper assuming Bearer scheme
            .send({
                title: 'Integration Test Task',
                description: 'Testing via Jest',
                status: 'pending',
                dueDate: new Date().toISOString()
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.task).toHaveProperty('_id');
        expect(res.body.task.title).toBe('Integration Test Task');
        taskId = res.body.task._id;
    });

    it('should get tasks list', async () => {
        const res = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.tasks)).toBeTruthy();
        expect(res.body.tasks.length).toBeGreaterThan(0);
    });

    it('should update a task', async () => {
        const res = await request(app)
            .put(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                status: 'completed'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.task.status).toBe('completed');
    });

    it('should delete a task', async () => {
        const res = await request(app)
            .delete(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
    });

    it('should confirm task is deleted', async () => {
        // Invalidate cache implicitly via DELETE, now Fetch again from DB (mock cache miss)
        const res = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${token}`);

        // Task ID should not be present
        const tasks = res.body.tasks;
        const exists = tasks.find((t: any) => t._id === taskId);
        expect(exists).toBeUndefined();
    });
});
