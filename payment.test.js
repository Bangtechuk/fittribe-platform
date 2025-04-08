const request = require('supertest');
const app = require('../src/index');
const db = require('../src/models');
const jwt = require('jsonwebtoken');

describe('Payment API', () => {
  let clientToken, trainerToken, adminToken;
  let testClient, testTrainer, testBooking, testPayment;
  
  beforeAll(async () => {
    // Create test users
    const clientResult = await db.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['paymentclient@example.com', 'hashedpassword', 'Payment', 'Client', 'client']
    );
    
    const trainerResult = await db.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['paymenttrainer@example.com', 'hashedpassword', 'Payment', 'Trainer', 'trainer']
    );
    
    const adminResult = await db.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['paymentadmin@example.com', 'hashedpassword', 'Payment', 'Admin', 'admin']
    );
    
    testClient = clientResult.rows[0];
    testTrainer = trainerResult.rows[0];
    
    // Create trainer profile
    const trainerProfileResult = await db.query(
      'INSERT INTO trainer_profiles (user_id, bio, specializations, years_experience, location) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [
        testTrainer.id, 
        'Payment test trainer', 
        ['Cardio', 'Strength'], 
        4, 
        'Miami'
      ]
    );
    
    // Create trainer service
    const serviceResult = await db.query(
      'INSERT INTO trainer_services (trainer_id, name, description, duration, price, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [
        trainerProfileResult.rows[0].id,
        'Test Strength Session',
        'A test strength session for payment',
        45,
        40.00,
        true
      ]
    );
    
    // Create a test booking
    const now = new Date();
    const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const endTime = new Date(startTime.getTime() + 45 * 60 * 1000); // 45 minutes later
    
    const bookingResult = await db.query(
      'INSERT INTO bookings (client_id, trainer_id, service_id, start_time, end_time, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [
        testClient.id,
        testTrainer.id,
        serviceResult.rows[0].id,
        startTime,
        endTime,
        'confirmed',
        'Test payment booking'
      ]
    );
    
    testBooking = bookingResult.rows[0];
    
    // Create a test payment
    const paymentResult = await db.query(
      'INSERT INTO payments (booking_id, client_id, trainer_id, amount, currency, status, payment_method, payment_intent_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [
        testBooking.id,
        testClient.id,
        testTrainer.id,
        40.00,
        'usd',
        'completed',
        'credit_card',
        'pi_test_' + Date.now()
      ]
    );
    
    testPayment = paymentResult.rows[0];
    
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
    await db.query('DELETE FROM payments WHERE id = $1', [testPayment.id]);
    await db.query('DELETE FROM bookings WHERE id = $1', [testBooking.id]);
    await db.query('DELETE FROM trainer_services WHERE trainer_id IN (SELECT id FROM trainer_profiles WHERE user_id = $1)', [testTrainer.id]);
    await db.query('DELETE FROM trainer_profiles WHERE user_id = $1', [testTrainer.id]);
    await db.query('DELETE FROM users WHERE email IN ($1, $2, $3)', [
      'paymentclient@example.com', 
      'paymenttrainer@example.com', 
      'paymentadmin@example.com'
    ]);
    await db.end();
  });
  
  describe('GET /api/payments/history', () => {
    it('should return client payment history when authenticated as client', async () => {
      const response = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('payments');
      expect(Array.isArray(response.body.data.payments)).toBe(true);
      
      // Check if our test payment is in the list
      const foundPayment = response.body.data.payments.find(
        payment => payment.id === testPayment.id
      );
      expect(foundPayment).toBeDefined();
      expect(foundPayment.amount).toBe(40);
      expect(foundPayment.status).toBe('completed');
    });
    
    it('should return trainer payment history when authenticated as trainer', async () => {
      const response = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer ${trainerToken}`)
        .expect(200);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('payments');
      expect(Array.isArray(response.body.data.payments)).toBe(true);
      
      // Check if our test payment is in the list
      const foundPayment = response.body.data.payments.find(
        payment => payment.id === testPayment.id
      );
      expect(foundPayment).toBeDefined();
    });
  });
  
  describe('GET /api/payments/:id', () => {
    it('should return a specific payment when authenticated as the client', async () => {
      const response = await request(app)
        .get(`/api/payments/${testPayment.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('payment');
      expect(response.body.data.payment.id).toBe(testPayment.id);
      expect(response.body.data.payment.amount).toBe(40);
      expect(response.body.data.payment.status).toBe('completed');
    });
    
    it('should return a specific payment when authenticated as the trainer', async () => {
      const response = await request(app)
        .get(`/api/payments/${testPayment.id}`)
        .set('Authorization', `Bearer ${trainerToken}`)
        .expect(200);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('payment');
      expect(response.body.data.payment.id).toBe(testPayment.id);
    });
    
    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .get('/api/payments/999999')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
      
      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('not found');
    });
  });
  
  describe('POST /api/payments/create-payment-intent', () => {
    it('should create a payment intent when authenticated as client', async () => {
      // Create a new booking for this test
      const now = new Date();
      const startTime = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 3 days from now
      const endTime = new Date(startTime.getTime() + 45 * 60 * 1000); // 45 minutes later
      
      const bookingResult = await db.query(
        'INSERT INTO bookings (client_id, trainer_id, service_id, start_time, end_time, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [
          testClient.id,
          testTrainer.id,
          1, // Using service ID 1 for simplicity
          startTime,
          endTime,
          'confirmed',
          'Payment intent test booking'
        ]
      );
      
      const newBookingId = bookingResult.rows[0].id;
      
      const paymentData = {
        bookingId: newBookingId,
        amount: 40.00,
        currency: 'usd'
      };
      
      const response = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(paymentData)
        .expect(200);
      
      expect(response.body.error).toBe(false);
      expect(response.body.data).toHaveProperty('clientSecret');
      expect(response.body.data).toHaveProperty('paymentIntentId');
      
      // Clean up
      await db.query('DELETE FROM bookings WHERE id = $1', [newBookingId]);
    });
    
    it('should reject payment intent creation without authentication', async () => {
      const paymentData = {
        bookingId: testBooking.id,
        amount: 40.00,
        currency: 'usd'
      };
      
      const response = await request(app)
        .post('/api/payments/create-payment-intent')
        .send(paymentData)
        .expect(401);
      
      expect(response.body.error).toBe(true);
      expect(response.body.message).toContain('token');
    });
  });
  
  describe('POST /api/payments/confirm-payment', () => {
    it('should confirm payment when authenticated as client', async () => {
      // This would normally interact with Stripe, so we'll mock the behavior
      const confirmData = {
        paymentIntentId: 'pi_test_mock_' + Date.now()
      };
      
      // In a real test, we would mock the Stripe API call
      // For this example, we'll just check that the endpoint responds correctly
      
      const response = await request(app)
        .post('/api/payments/confirm-payment')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(confirmData)
        .expect(200);
      
      expect(response.body.error).toBe(false);
      // The actual response would depend on the Stripe mock implementation
    });
  });
});
