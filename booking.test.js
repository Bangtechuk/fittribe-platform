const request = require('supertest');
const app = require('../src/index');
const db = require('../src/models');
const jwt = require('jsonwebtoken');

describe('Booking API', () => {
  let clientToken, trainerToken, adminToken;
  let testClient, testTrainer, testService, testBooking;
  
  beforeAll(async () => {
    // Create test users
    const clientResult = await db.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['bookingclient@example.com', 'hashedpassword', 'Booking', 'Client', 'client']
    );
    
    const trainerResult = await db.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['bookingtrainer@example.com', 'hashedpassword', 'Booking', 'Trainer', 'trainer']
    );
    
    const adminResult = await db.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['bookingadmin@example.com', 'hashedpassword', 'Booking', 'Admin', 'admin']
    );
    
    testClient = clientResult.rows[0];
    testTrainer = trainerResult.rows[0];
    
    // Create trainer profile
    const trainerProfileResult = await db.query(
      'INSERT INTO trainer_profiles (user_id, bio, specializations, years_experience, location) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [
        testTrainer.id, 
        'Booking test trainer', 
        ['Yoga', 'HIIT'], 
        3, 
        'Chicago'
      ]
    );
    
    // Create trainer service
    const serviceResult = await db.query(
      'INSERT INTO trainer_services (trainer_id, name, description, duration, price, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [
        trainerProfileResult.rows[0].id,
        'Test Yoga Session',
        'A test yoga session for booking',
        60,
        50.00,
        true
      ]
    );
    
    testService = serviceResult.rows[0];
    
    // Create a test booking
    const now = new Date();
    const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later
    
    const bookingResult = await db.query(
      'INSERT INTO bookings (client_id, trainer_id, service_id, start_time, end_time, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [
        testClient.id,
        testTrainer.id,
        testService.id,
        startTime,
        endTime,
        'pending',
        'Test booking notes'
      ]
    );
    
    testBooking = bookingResult.rows[0];
    
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
    await db.query('DELETE FROM bookings WHERE id = $1', [testBooking.id]);
    await db.query('DELETE FROM trainer_services WHERE id = $1', [testService.id]);
    await db.query('DELETE FROM trainer_profiles WHERE user_id = $1', [testTrainer.id]);
    await db.query('DELETE FROM users WHERE email IN ($1, $2, $3)', [
      'bookingclient@example.com', 
      'bookingtrainer@example.com', 
      'bookingadmin@example.com'
    ]);
    await db.end();
  });
  
  describe('GET /api/bookings', () => {
    it('should return client bookings when authenticated as client', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('bookings');
      expect(Array.isArray(response.body.data.bookings)).toBe(true);
      
      // Check if our test booking is in the list
      const foundBooking = response.body.data.bookings.find(
        booking => booking.id === testBooking.id
      );
      expect(foundBooking).toBeDefined();
      expect(foundBooking.status).toBe('pending');
    });
    
    it('should return trainer bookings when authenticated as trainer', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${trainerToken}`)
        .expect(200);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('bookings');
      expect(Array.isArray(response.body.data.bookings)).toBe(true);
      
      // Check if our test booking is in the list
      const foundBooking = response.body.data.bookings.find(
        booking => booking.id === testBooking.id
      );
      expect(foundBooking).toBeDefined();
    });
    
    it('should filter bookings by status', async () => {
      const response = await request(app)
        .get('/api/bookings?status=pending')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('bookings');
      
      // All returned bookings should have pending status
      response.body.data.bookings.forEach(booking => {
        expect(booking.status).toBe('pending');
      });
    });
  });
  
  describe('GET /api/bookings/:id', () => {
    it('should return a specific booking when authenticated as the client', async () => {
      const response = await request(app)
        .get(`/api/bookings/${testBooking.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('booking');
      expect(response.body.data.booking.id).toBe(testBooking.id);
      expect(response.body.data.booking.status).toBe('pending');
      expect(response.body.data.booking.notes).toBe('Test booking notes');
    });
    
    it('should return a specific booking when authenticated as the trainer', async () => {
      const response = await request(app)
        .get(`/api/bookings/${testBooking.id}`)
        .set('Authorization', `Bearer ${trainerToken}`)
        .expect(200);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('booking');
      expect(response.body.data.booking.id).toBe(testBooking.id);
    });
    
    it('should return 404 for non-existent booking', async () => {
      const response = await request(app)
        .get('/api/bookings/999999')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
      
      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('not found');
    });
  });
  
  describe('POST /api/bookings', () => {
    it('should create a new booking when authenticated as client', async () => {
      const now = new Date();
      const startTime = new Date(now.getTime() + 48 * 60 * 60 * 1000); // Day after tomorrow
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later
      
      const bookingData = {
        trainerId: testTrainer.id,
        serviceId: testService.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        notes: 'New test booking'
      };
      
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(bookingData)
        .expect(201);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('booking');
      expect(response.body.data.booking.status).toBe('pending');
      expect(response.body.data.booking.notes).toBe(bookingData.notes);
      
      // Clean up
      await db.query('DELETE FROM bookings WHERE id = $1', [response.body.data.booking.id]);
    });
    
    it('should reject booking creation without authentication', async () => {
      const bookingData = {
        trainerId: testTrainer.id,
        serviceId: testService.id,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        notes: 'This should fail'
      };
      
      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(401);
      
      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('token');
    });
  });
  
  describe('PATCH /api/bookings/:id/confirm', () => {
    it('should confirm a booking when authenticated as the trainer', async () => {
      const response = await request(app)
        .patch(`/api/bookings/${testBooking.id}/confirm`)
        .set('Authorization', `Bearer ${trainerToken}`)
        .expect(200);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('booking');
      expect(response.body.data.booking.status).toBe('confirmed');
      
      // Verify in database
      const dbResult = await db.query('SELECT status FROM bookings WHERE id = $1', [testBooking.id]);
      expect(dbResult.rows[0].status).toBe('confirmed');
    });
    
    it('should reject confirmation from client', async () => {
      // First reset the booking status
      await db.query('UPDATE bookings SET status = $1 WHERE id = $2', ['pending', testBooking.id]);
      
      const response = await request(app)
        .patch(`/api/bookings/${testBooking.id}/confirm`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
      
      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('not authorized');
    });
  });
  
  describe('DELETE /api/bookings/:id', () => {
    it('should cancel a booking when authenticated as the client', async () => {
      const response = await request(app)
        .delete(`/api/bookings/${testBooking.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ cancellationReason: 'Test cancellation' })
        .expect(200);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('booking');
      expect(response.body.data.booking.status).toBe('cancelled');
      
      // Verify in database
      const dbResult = await db.query('SELECT status, cancellation_reason FROM bookings WHERE id = $1', [testBooking.id]);
      expect(dbResult.rows[0].status).toBe('cancelled');
      expect(dbResult.rows[0].cancellation_reason).toBe('Test cancellation');
    });
  });
});
