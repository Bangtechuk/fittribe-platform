const request = require('supertest');
const app = require('../src/index');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../src/models');

describe('Authentication API', () => {
  let testUser;
  
  beforeAll(async () => {
    // Create a test user
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    testUser = {
      email: 'test@example.com',
      password: hashedPassword,
      first_name: 'Test',
      last_name: 'User',
      role: 'client'
    };
    
    // Clear test data and insert test user
    await db.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    await db.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [testUser.email, testUser.password, testUser.first_name, testUser.last_name, testUser.role]
    );
  });
  
  afterAll(async () => {
    // Clean up test data
    await db.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    await db.end();
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User',
        role: 'client'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(newUser.email);
      expect(response.body.data.user.first_name).toBe(newUser.first_name);
      expect(response.body.data.user.last_name).toBe(newUser.last_name);
      expect(response.body.data.user.role).toBe(newUser.role);
      expect(response.body.data).toHaveProperty('token');
      
      // Clean up
      await db.query('DELETE FROM users WHERE email = $1', [newUser.email]);
    });
    
    it('should return error for existing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email,
          password: 'password123',
          first_name: 'Existing',
          last_name: 'User',
          role: 'client'
        })
        .expect(400);
      
      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('already exists');
    });
    
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'incomplete@example.com',
          password: 'password123'
          // Missing first_name, last_name, role
        })
        .expect(400);
      
      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('required');
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'testpassword123'
        })
        .expect(200);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data).toHaveProperty('token');
      
      // Verify token
      const decoded = jwt.verify(response.body.data.token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('role');
      expect(decoded.role).toBe(testUser.role);
    });
    
    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);
      
      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('Invalid credentials');
    });
    
    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);
      
      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('Invalid credentials');
    });
  });
  
  describe('GET /api/auth/me', () => {
    let authToken;
    
    beforeAll(async () => {
      // Login to get token
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'testpassword123'
        });
      
      authToken = response.body.data.token;
    });
    
    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.first_name).toBe(testUser.first_name);
      expect(response.body.data.user.last_name).toBe(testUser.last_name);
    });
    
    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);
      
      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('token');
    });
    
    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);
      
      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('Invalid token');
    });
  });
});
