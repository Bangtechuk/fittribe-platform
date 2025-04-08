const db = require('../models');

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const clientId = req.user.id;
    
    // Check if booking exists and belongs to client
    const bookingQuery = await db.query(
      `SELECT 
        b.id, 
        b.client_id, 
        b.trainer_id, 
        b.status,
        ts.price
      FROM bookings b
      JOIN trainer_services ts ON b.service_id = ts.id
      WHERE b.id = $1 AND b.client_id = $2`,
      [bookingId, clientId]
    );
    
    if (bookingQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Booking not found or you are not the client'
      });
    }
    
    const booking = bookingQuery.rows[0];
    
    // Only allow payment for confirmed bookings
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        error: true,
        message: `Cannot process payment for booking with status: ${booking.status}`
      });
    }
    
    // Check if payment already exists
    const paymentExists = await db.query(
      'SELECT * FROM payments WHERE booking_id = $1',
      [bookingId]
    );
    
    if (paymentExists.rows.length > 0) {
      return res.status(400).json({
        error: true,
        message: 'Payment already exists for this booking'
      });
    }
    
    // Calculate platform fee (10% of booking price)
    const amount = parseFloat(booking.price);
    const platformFee = amount * 0.1;
    const trainerPayout = amount - platformFee;
    
    // In a real implementation, we would use Stripe API to create a payment intent
    // For now, we'll simulate it
    const paymentIntentId = `pi_${Math.random().toString(36).substring(2, 15)}`;
    
    // Create payment record
    const newPayment = await db.query(
      `INSERT INTO payments 
       (booking_id, client_id, trainer_id, amount, currency, status, payment_method, stripe_payment_intent_id, platform_fee, trainer_payout, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) 
       RETURNING *`,
      [bookingId, clientId, booking.trainer_id, amount, 'USD', 'pending', 'card', paymentIntentId, platformFee, trainerPayout]
    );
    
    res.status(201).json({
      error: false,
      message: 'Payment intent created',
      data: {
        payment: newPayment.rows[0],
        clientSecret: `${paymentIntentId}_secret_${Math.random().toString(36).substring(2, 15)}`
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      error: true,
      message: 'Error creating payment intent'
    });
  }
};

// Confirm payment
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    // Update payment status
    const updatedPayment = await db.query(
      `UPDATE payments 
       SET status = 'completed', 
           updated_at = NOW()
       WHERE stripe_payment_intent_id = $1
       RETURNING *`,
      [paymentIntentId]
    );
    
    if (updatedPayment.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Payment not found'
      });
    }
    
    res.status(200).json({
      error: false,
      message: 'Payment confirmed successfully',
      data: {
        payment: updatedPayment.rows[0]
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      error: true,
      message: 'Error confirming payment'
    });
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get payments
    const paymentsQuery = await db.query(
      `SELECT 
        p.id, 
        p.booking_id, 
        p.amount, 
        p.currency, 
        p.status, 
        p.payment_method, 
        p.created_at,
        b.start_time,
        client.first_name as client_first_name,
        client.last_name as client_last_name,
        trainer.first_name as trainer_first_name,
        trainer.last_name as trainer_last_name,
        ts.name as service_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN users client ON p.client_id = client.id
      JOIN users trainer ON p.trainer_id = trainer.id
      JOIN trainer_services ts ON b.service_id = ts.id
      WHERE p.client_id = $1 OR p.trainer_id = $1
      ORDER BY p.created_at DESC`,
      [userId]
    );
    
    // Format response
    const formattedPayments = paymentsQuery.rows.map(payment => {
      const isClient = payment.client_id === userId;
      
      return {
        id: payment.id,
        bookingId: payment.booking_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.payment_method,
        createdAt: payment.created_at,
        sessionDate: payment.start_time,
        serviceName: payment.service_name,
        otherParty: {
          firstName: isClient ? payment.trainer_first_name : payment.client_first_name,
          lastName: isClient ? payment.trainer_last_name : payment.client_last_name,
          role: isClient ? 'trainer' : 'client'
        }
      };
    });
    
    res.status(200).json({
      error: false,
      data: {
        payments: formattedPayments
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching payment history'
    });
  }
};

// Get payment details
exports.getPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Get payment details
    const paymentQuery = await db.query(
      `SELECT 
        p.id, 
        p.booking_id, 
        p.client_id,
        p.trainer_id,
        p.amount, 
        p.currency, 
        p.status, 
        p.payment_method, 
        p.transaction_id,
        p.refund_amount,
        p.platform_fee,
        p.trainer_payout,
        p.created_at,
        p.updated_at,
        b.start_time,
        b.end_time,
        b.status as booking_status,
        client.first_name as client_first_name,
        client.last_name as client_last_name,
        client.email as client_email,
        trainer.first_name as trainer_first_name,
        trainer.last_name as trainer_last_name,
        trainer.email as trainer_email,
        ts.name as service_name,
        ts.duration as service_duration
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN users client ON p.client_id = client.id
      JOIN users trainer ON p.trainer_id = trainer.id
      JOIN trainer_services ts ON b.service_id = ts.id
      WHERE p.id = $1 AND (p.client_id = $2 OR p.trainer_id = $2)`,
      [id, userId]
    );
    
    if (paymentQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Payment not found or you do not have access'
      });
    }
    
    const payment = paymentQuery.rows[0];
    
    // Format response
    const response = {
      id: payment.id,
      bookingId: payment.booking_id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.payment_method,
      transactionId: payment.transaction_id,
      refundAmount: payment.refund_amount,
      platformFee: payment.platform_fee,
      trainerPayout: payment.trainer_payout,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
      booking: {
        startTime: payment.start_time,
        endTime: payment.end_time,
        status: payment.booking_status
      },
      service: {
        name: payment.service_name,
        duration: payment.service_duration
      },
      client: {
        id: payment.client_id,
        firstName: payment.client_first_name,
        lastName: payment.client_last_name,
        email: payment.client_email
      },
      trainer: {
        id: payment.trainer_id,
        firstName: payment.trainer_first_name,
        lastName: payment.trainer_last_name,
        email: payment.trainer_email
      }
    };
    
    res.status(200).json({
      error: false,
      data: {
        payment: response
      }
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching payment details'
    });
  }
};

// Process refund
exports.processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    const userId = req.user.id;
    
    // Check if user is admin
    const userQuery = await db.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );
    
    if (userQuery.rows.length === 0 || userQuery.rows[0].role !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Only administrators can process refunds'
      });
    }
    
    // Get payment details
    const paymentQuery = await db.query(
      'SELECT * FROM payments WHERE id = $1 AND status = $2',
      [id, 'completed']
    );
    
    if (paymentQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Payment not found or not eligible for refund'
      });
    }
    
    const payment = paymentQuery.rows[0];
    
    // Validate refund amount
    const refundAmount = parseFloat(amount) || parseFloat(payment.amount);
    if (refundAmount <= 0 || refundAmount > parseFloat(payment.amount)) {
      return res.status(400).json({
        error: true,
        message: 'Invalid refund amount'
      });
    }
    
    // In a real implementation, we would use Stripe API to process the refund
    // For now, we'll simulate it
    
    // Update payment record
    const updatedPayment = await db.query(
      `UPDATE payments 
       SET status = 'refunded', 
           refund_amount = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [refundAmount, id]
    );
    
    // Update booking status if full refund
    if (refundAmount === parseFloat(payment.amount)) {
      await db.query(
        `UPDATE bookings 
         SET status = 'cancelled', 
             cancellation_reason = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [reason || 'Refunded by administrator', payment.booking_id]
      );
    }
    
    res.status(200).json({
      error: false,
      message: 'Refund processed successfully',
      data: {
        payment: updatedPayment.rows[0]
      }
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      error: true,
      message: 'Error processing refund'
    });
  }
};

// Get payout history (trainer only)
exports.getPayoutHistory = async (req, res) => {
  try {
    const trainerId = req.user.id;
    
    // Check if user is a trainer
    const userQuery = await db.query(
      'SELECT role FROM users WHERE id = $1',
      [trainerId]
    );
    
    if (userQuery.rows.length === 0 || userQuery.rows[0].role !== 'trainer') {
      return res.status(403).json({
        error: true,
        message: 'Only trainers can access payout history'
      });
    }
    
    // Get completed payments for trainer
    const paymentsQuery = await db.query(
      `SELECT 
        p.id, 
        p.booking_id, 
        p.amount, 
        p.currency, 
        p.status, 
        p.trainer_payout,
        p.created_at,
        b.start_time,
        client.first_name as client_first_name,
        client.last_name as client_last_name,
        ts.name as service_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN users client ON p.client_id = client.id
      JOIN trainer_services ts ON b.service_id = ts.id
      WHERE p.trainer_id = $1 AND p.status = 'completed'
      ORDER BY p.created_at DESC`,
      [trainerId]
    );
    
    // Calculate total earnings
    const totalEarnings = paymentsQuery.rows.reduce((sum, payment) => {
      return sum + parseFloat(payment.trainer_payout);
    }, 0);
    
    res.status(200).json({
      error: false,
      data: {
        payouts: paymentsQuery.rows,
        totalEarnings
      }
    });
  } catch (error) {
    console.error('Get payout history error:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching payout history'
    });
  }
};

// Request payout (trainer only)
exports.requestPayout = async (req, res) => {
  try {
    const trainerId = req.user.id;
    
    // In a real implementation, we would use Stripe Connect or similar to process payouts
    // For now, we'll simulate it
    
    res.status(200).json({
      error: false,
      message: 'Payout request submitted successfully',
      data: {
        payoutId: `po_${Math.random().toString(36).substring(2, 15)}`,
        status: 'processing',
        requestedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Request payout error:', error);
    res.status(500).json({
      error: true,
      message: 'Error requesting payout'
    });
  }
};
