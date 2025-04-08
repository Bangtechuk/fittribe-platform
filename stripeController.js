require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');

// Create a payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { bookingId, amount, currency = 'usd', metadata = {} } = req.body;
    
    if (!bookingId || !amount) {
      return res.status(400).json({
        error: true,
        message: 'Booking ID and amount are required'
      });
    }
    
    // Create a payment intent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        bookingId,
        ...metadata
      },
      // Hold the funds until the session is completed
      capture_method: 'manual',
      // Automatically confirm the payment
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    // Return the client secret
    return res.status(200).json({
      error: false,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to create payment intent'
    });
  }
};

// Confirm payment intent (capture funds)
const confirmPaymentIntent = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({
        error: true,
        message: 'Payment intent ID is required'
      });
    }
    
    // Capture the payment (release funds from hold)
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    
    return res.status(200).json({
      error: false,
      data: {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency
      }
    });
  } catch (error) {
    console.error('Error confirming payment intent:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to confirm payment intent'
    });
  }
};

// Cancel payment intent (release hold)
const cancelPaymentIntent = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({
        error: true,
        message: 'Payment intent ID is required'
      });
    }
    
    // Cancel the payment intent
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    
    return res.status(200).json({
      error: false,
      data: {
        status: paymentIntent.status
      }
    });
  } catch (error) {
    console.error('Error cancelling payment intent:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to cancel payment intent'
    });
  }
};

// Create a refund
const createRefund = async (req, res) => {
  try {
    const { paymentIntentId, amount, reason = 'requested_by_customer' } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({
        error: true,
        message: 'Payment intent ID is required'
      });
    }
    
    // Create a refund
    const refundParams = {
      payment_intent: paymentIntentId,
      reason
    };
    
    // If amount is provided, add it to the refund params
    if (amount) {
      refundParams.amount = Math.round(amount * 100); // Convert to cents
    }
    
    const refund = await stripe.refunds.create(refundParams);
    
    return res.status(200).json({
      error: false,
      data: {
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount / 100 // Convert from cents
      }
    });
  } catch (error) {
    console.error('Error creating refund:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to create refund'
    });
  }
};

// Create a payout to a trainer
const createPayout = async (req, res) => {
  try {
    const { trainerId, amount, currency = 'usd', metadata = {} } = req.body;
    
    if (!trainerId || !amount) {
      return res.status(400).json({
        error: true,
        message: 'Trainer ID and amount are required'
      });
    }
    
    // In a real implementation, you would retrieve the trainer's Stripe account ID
    // from your database and use Stripe Connect to transfer funds to their account
    
    // For this example, we'll simulate a payout
    const payout = {
      id: `payout_${Date.now()}`,
      trainerId,
      amount,
      currency,
      status: 'pending',
      created: new Date().toISOString(),
      metadata
    };
    
    // In a real implementation, you would save this payout to your database
    
    return res.status(200).json({
      error: false,
      data: {
        payout
      }
    });
  } catch (error) {
    console.error('Error creating payout:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to create payout'
    });
  }
};

// Webhook handler for Stripe events
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!', paymentIntent.id);
      // Update booking status in your database
      break;
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      console.log('PaymentIntent failed!', failedPaymentIntent.id);
      // Update booking status in your database
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  // Return a 200 response to acknowledge receipt of the event
  res.send();
};

module.exports = {
  createPaymentIntent,
  confirmPaymentIntent,
  cancelPaymentIntent,
  createRefund,
  createPayout,
  handleWebhook
};
