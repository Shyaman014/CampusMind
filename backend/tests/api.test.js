const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../server');
const seedDemoUsers = require('../utils/seedDemo');

jest.mock('../services/geminiService', () => ({
  generateAIAnswer: jest.fn().mockResolvedValue('Mocked AI explanation for Binary Search Tree.'),
  generateRelatedQuestions: jest.fn().mockResolvedValue(['What is preorder traversal?', 'What is postorder traversal?']),
}));

let mongoServer;

describe('CampusMind AI Backend API Test Suite', () => {
  let userToken;
  let questionId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    await seedDemoUsers();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it('GET /api/health - should return 200 OK health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('OK');
    expect(res.body.app).toEqual('CampusMind AI Backend API');
  });

  it('POST /api/auth/register - should register a new student user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alex Rivera',
        email: `alex_${Date.now()}@campus.edu`,
        password: 'Password123!',
        department: 'Computer Science',
        yearOfStudy: '3rd Year',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    userToken = res.body.data.token;
  });

  it('POST /api/questions - should post a new academic doubt', async () => {
    const res = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'What is the time complexity of QuickSort in worst case?',
        content: 'I want to understand why QuickSort degenerates to O(N^2) when the pivot choice is poor.',
        subject: 'Data Structures & Algorithms',
        tags: ['Algorithms', 'Sorting', 'DSA'],
        isAnonymous: false,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    questionId = res.body.data._id;
  });

  it('GET /api/questions - should fetch list of questions with pagination', async () => {
    const res = await request(app).get('/api/questions');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.questions)).toBe(true);
  });

  it('POST /api/ai/explain - should generate AI explanation', async () => {
    const res = await request(app)
      .post('/api/ai/explain')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Explain Binary Search Tree Inorder Traversal',
        content: 'Why does inorder traversal yield sorted order?',
        explanationLevel: 'beginner',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('explanation');
  }, 15000);

  it('GET /api/auth/google - should redirect to Google OAuth authorization URL', async () => {
    const res = await request(app).get('/api/auth/google');
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toContain('accounts.google.com');
  });

  it('GET /api/auth/facebook - should redirect to Facebook OAuth authorization URL', async () => {
    const res = await request(app).get('/api/auth/facebook');
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toContain('facebook.com');
  });

  it('POST /api/auth/refresh - should return 401 when no refresh token provided', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/logout - should log out cleanly', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/auth/resend-verification - should resend verification email for demo student', async () => {
    const res = await request(app)
      .post('/api/auth/resend-verification')
      .send({ email: 'student@campusmind.ai' });
    expect([200, 400]).toContain(res.statusCode); // 400 if already verified, 200 if sent
  });
});
