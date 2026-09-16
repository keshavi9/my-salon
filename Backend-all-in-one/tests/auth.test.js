const request = require('supertest');
const express = require('express');
const authRoutes = require('../src/routes/auth');
const errorHandler = require('../src/middleware/errorHandler');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

process.env.JWT_SECRET = 'testsecret';
process.env.JWT_EXPIRES_IN = '1d';

jest.mock('../src/models/User', () => {
  return {
    findOne: jest.fn()
  };
});
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock user for valid credentials
    User.findOne.mockImplementation(async ({ where }) => {
      if (where.email === 'admin@hairahmedabad.com') {
        return {
          id: 'mock-uuid',
          email: 'admin@hairahmedabad.com',
          password: await bcrypt.hash('Admin@123', 10),
          role: 'admin',
          isActive: true,
          matchPassword: async function(enteredPassword) {
            return await bcrypt.compare(enteredPassword, this.password);
          }
        };
      }
      return null;
    });
  });

  it('should reject login without credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject login with invalid credentials', async () => {
    // Current controller uses a hardcoded check for Admin@123 for now
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@hairahmedabad.com',
      password: 'wrongpassword'
    });
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });

  it('should successfully login with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@hairahmedabad.com',
      password: 'Admin@123'
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('admin');
  });
});
