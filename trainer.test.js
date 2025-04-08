const request = require('supertest');
const app = require('../src/index');
const db = require('../src/models');
const jwt = require('jsonwebtoken');

describe('Trainer API', () => {
  let clientToken, trainerToken, adminToken;
  let testTrainer, testClient;
  
  beforeAll(async () => {
    // Create test users
    const clientResult = await db.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['client@example.com', 'hashedpassword', 'Test', 'Client', 'client']
    );
    
    const trainerResult = await db.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['trainer@example.com', 'hashedpassword', 'Test', 'Trainer', 'trainer']
    );
    
    const adminResult = await db.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['admin@example.com', 'hashedpassword', 'Test', 'Admin', 'admin']
    );
    
    testClient = clientResult.rows[0];
    testTrainer = trainerResult.rows[0];
    
    // Create trainer profile
    await db.query(
      'INSERT INTO trainer_profiles (user_id, bio, specializations, years_experience, location) VALUES ($1, $2, $3, $4, $5)',
      [
        testTrainer.id, 
        'Experienced fitness trainer', 
        ['Yoga', 'HIIT', 'Strength Training'], 
        5, 
        'New York'
      ]
    );
    
    // Generate tokens
    clientToken = jwt.sign(
      { userId: testClient.id, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    trainerToken = jwt.sign(
      { userId: testTrainer.id, role: 'trainer' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    adminToken = jwt.sign(
      { userId: adminResult.rows[0].id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });
  
  afterAll(async () => {
    // Clean up test data
    await db.query('DELETE FROM trainer_profiles WHERE user_id = $1', [testTrainer.id]);
    await db.query('DELETE FROM users WHERE email IN ($1, $2, $3)', ['client@example.com', 'trainer@example.com', 'admin@example.com']);
    await db.end();
  });
  
  describe('GET /api/trainers', () => {
    it('should return a list of trainers', async () => {
      const response = await request(app)
        .get('/api/trainers')
        .expect(200);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('trainers');
      expect(Array.isArray(response.body.data.trainers)).toBe(true);
      
      // Check if our test trainer is in the list
      const foundTrainer = response.body.data.trainers.find(
        trainer => trainer.email === 'trainer@example.com'
      );
      expect(foundTrainer).toBeDefined();
    });
    
    it('should filter trainers by specialization', async () => {
      const response = await request(app)
        .get('/api/trainers?specialization=Yoga')
        .expect(200);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('trainers');
      expect(Array.isArray(response.body.data.trainers)).toBe(true);
      
      // All returned trainers should have Yoga specialization
      response.body.data.trainers.forEach(trainer => {
        expect(trainer.specializations).toContain('Yoga');
      });
    });
  });
  
  describe('GET /api/trainers/:id', () => {
    it('should return a specific trainer', async () => {
      const response = await request(app)
        .get(`/api/trainers/${testTrainer.id}`)
        .expect(200);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('trainer');
      expect(response.body.data.trainer.id).toBe(testTrainer.id);
      expect(response.body.data.trainer.email).toBe('trainer@example.com');
      expect(response.body.data.trainer.bio).toBe('Experienced fitness trainer');
    });
    
    it('should return 404 for non-existent trainer', async () => {
      const response = await request(app)
        .get('/api/trainers/999999')
        .expect(404);
      
      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('not found');
    });
  });
  
  describe('POST /api/trainers', () => {
    it('should create a trainer profile when authenticated as trainer', async () => {
      // First, create a new trainer user
      const newTrainerResult = await db.query(
        'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        ['newtrainer@example.com', 'hashedpassword', 'New', 'Trainer', 'trainer']
      );
      
      const newTrainerId = newTrainerResult.rows[0].id;
      
      // Generate token for new trainer
      const newTrainerToken = jwt.sign(
        { userId: newTrainerId, role: 'trainer' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      const profileData = {
        bio: 'New trainer with specialization in cardio',
        specializations: ['Cardio', 'Running'],
        years_experience: 3,
        location: 'Los Angeles'
      };
      
      const response = await request(app)
        .post('/api/trainers')
        .set('Authorization', `Bearer ${newTrainerToken}`)
        .send(profileData)
        .expect(201);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('trainer');
      expect(response.body.data.trainer.bio).toBe(profileData.bio);
      expect(response.body.data.trainer.specializations).toEqual(profileData.specializations);
      
      // Clean up
      await db.query('DELETE FROM trainer_profiles WHERE user_id = $1', [newTrainerId]);
      await db.query('DELETE FROM users WHERE id = $1', [newTrainerId]);
    });
    
    it('should reject profile creation for non-trainer users', async () => {
      const profileData = {
        bio: 'This should fail',
        specializations: ['Unauthorized'],
        years_experience: 1,
        location: 'Nowhere'
      };
      
      const response = await request(app)
        .post('/api/trainers')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(profileData)
        .expect(403);
      
      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('not authorized');
    });
  });
  
  describe('PUT /api/trainers/:id', () => {
    it('should update trainer profile when authenticated as the trainer', async () => {
      const updateData = {
        bio: 'Updated trainer bio',
        specializations: ['Yoga', 'Pilates', 'Meditation'],
        years_experience: 6,
        location: 'San Francisco'
      };
      
      const response = await request(app)
        .put(`/api/trainers/${testTrainer.id}`)
        .set('Authorization', `Bearer ${trainerToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('trainer');
      expect(response.body.data.trainer.bio).toBe(updateData.bio);
      expect(response.body.data.trainer.specializations).toEqual(updateData.specializations);
      expect(response.body.data.trainer.years_experience).toBe(updateData.years_experience);
    });
    
    it('should reject updates from other users', async () => {
      const updateData = {
        bio: 'This should fail',
      };
      
      const response = await request(app)
        .put(`/api/trainers/${testTrainer.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(updateData)
        .expect(403);
      
      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('not authorized');
    });
  });
});
