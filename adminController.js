const db = require('../models');

// Get platform statistics
exports.getStats = async (req, res) => {
  try {
    // Get user counts
    const userCountsQuery = await db.query(
      `SELECT 
        COUNT(*) FILTER (WHERE role = 'client') as client_count,
        COUNT(*) FILTER (WHERE role = 'trainer') as trainer_count,
        COUNT(*) as total_users
      FROM users`
    );
    
    // Get booking stats
    const bookingStatsQuery = await db.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
        COUNT(*) as total_bookings
      FROM bookings`
    );
    
    // Get payment stats
    const paymentStatsQuery = await db.query(
      `SELECT 
        COUNT(*) as total_payments,
        SUM(amount) as total_revenue,
        SUM(platform_fee) as total_platform_fees
      FROM payments
      WHERE status = 'completed'`
    );
    
    // Get recent activity
    const recentActivityQuery = await db.query(
      `SELECT 
        'booking' as type,
        b.id,
        b.status,
        b.created_at,
        client.first_name || ' ' || client.last_name as client_name,
        trainer.first_name || ' ' || trainer.last_name as trainer_name
      FROM bookings b
      JOIN users client ON b.client_id = client.id
      JOIN users trainer ON b.trainer_id = trainer.id
      ORDER BY b.created_at DESC
      LIMIT 10`
    );
    
    res.status(200).json({
      error: false,
      data: {
        userStats: userCountsQuery.rows[0],
        bookingStats: bookingStatsQuery.rows[0],
        paymentStats: paymentStatsQuery.rows[0],
        recentActivity: recentActivityQuery.rows
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching admin statistics'
    });
  }
};

// Get pending trainer verifications
exports.getPendingTrainerVerifications = async (req, res) => {
  try {
    const pendingTrainersQuery = await db.query(
      `SELECT 
        u.id, 
        u.email, 
        u.first_name, 
        u.last_name, 
        u.profile_image,
        u.created_at,
        tp.bio,
        tp.specializations,
        tp.years_experience,
        tp.location
      FROM users u
      JOIN trainer_profiles tp ON u.id = tp.user_id
      WHERE u.role = 'trainer' AND tp.is_verified = false
      ORDER BY u.created_at DESC`
    );
    
    res.status(200).json({
      error: false,
      data: {
        pendingTrainers: pendingTrainersQuery.rows
      }
    });
  } catch (error) {
    console.error('Get pending trainer verifications error:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching pending trainer verifications'
    });
  }
};

// Verify trainer
exports.verifyTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Update trainer verification status
    const verifiedTrainer = await db.query(
      `UPDATE trainer_profiles 
       SET is_verified = true, 
           updated_at = NOW()
       WHERE user_id = $1
       RETURNING *`,
      [id]
    );
    
    if (verifiedTrainer.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Trainer profile not found'
      });
    }
    
    res.status(200).json({
      error: false,
      message: 'Trainer verified successfully',
      data: {
        trainer: verifiedTrainer.rows[0]
      }
    });
  } catch (error) {
    console.error('Verify trainer error:', error);
    res.status(500).json({
      error: true,
      message: 'Error verifying trainer'
    });
  }
};

// Get reported content
exports.getReportedContent = async (req, res) => {
  try {
    // In a real implementation, we would fetch from a reports table
    // For now, we'll return a mock response
    
    res.status(200).json({
      error: false,
      data: {
        reports: []
      }
    });
  } catch (error) {
    console.error('Get reported content error:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching reported content'
    });
  }
};

// Resolve report
exports.resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    
    // In a real implementation, we would update the report status
    // For now, we'll return a mock response
    
    res.status(200).json({
      error: false,
      message: 'Report resolved successfully',
      data: {
        reportId: id,
        action,
        reason,
        resolvedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({
      error: true,
      message: 'Error resolving report'
    });
  }
};

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    let query = `
      SELECT 
        p.id, 
        p.booking_id, 
        p.client_id,
        p.trainer_id,
        p.amount, 
        p.currency, 
        p.status, 
        p.payment_method, 
        p.platform_fee,
        p.trainer_payout,
        p.created_at,
        client.first_name || ' ' || client.last_name as client_name,
        trainer.first_name || ' ' || trainer.last_name as trainer_name
      FROM payments p
      JOIN users client ON p.client_id = client.id
      JOIN users trainer ON p.trainer_id = trainer.id
    `;
    
    const queryParams = [];
    let paramCounter = 1;
    let whereAdded = false;
    
    // Add filters if provided
    if (startDate) {
      query += whereAdded ? ' AND' : ' WHERE';
      query += ` p.created_at >= $${paramCounter}`;
      queryParams.push(startDate);
      paramCounter++;
      whereAdded = true;
    }
    
    if (endDate) {
      query += whereAdded ? ' AND' : ' WHERE';
      query += ` p.created_at <= $${paramCounter}`;
      queryParams.push(endDate);
      paramCounter++;
      whereAdded = true;
    }
    
    if (status) {
      query += whereAdded ? ' AND' : ' WHERE';
      query += ` p.status = $${paramCounter}`;
      queryParams.push(status);
      paramCounter++;
      whereAdded = true;
    }
    
    query += ` ORDER BY p.created_at DESC`;
    
    const transactionsQuery = await db.query(query, queryParams);
    
    res.status(200).json({
      error: false,
      data: {
        transactions: transactionsQuery.rows
      }
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching transactions'
    });
  }
};

// Get pending payouts
exports.getPendingPayouts = async (req, res) => {
  try {
    // In a real implementation, we would fetch from a payouts table
    // For now, we'll calculate from completed payments
    
    const pendingPayoutsQuery = await db.query(
      `SELECT 
        trainer_id,
        SUM(trainer_payout) as pending_amount,
        COUNT(*) as transaction_count,
        MAX(created_at) as last_transaction_date,
        u.first_name || ' ' || u.last_name as trainer_name,
        u.email as trainer_email
      FROM payments p
      JOIN users u ON p.trainer_id = u.id
      WHERE status = 'completed'
      GROUP BY trainer_id, u.first_name, u.last_name, u.email
      ORDER BY pending_amount DESC`
    );
    
    res.status(200).json({
      error: false,
      data: {
        pendingPayouts: pendingPayoutsQuery.rows
      }
    });
  } catch (error) {
    console.error('Get pending payouts error:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching pending payouts'
    });
  }
};

// Process payout
exports.processPayout = async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, we would use Stripe Connect or similar to process payouts
    // For now, we'll return a mock response
    
    res.status(200).json({
      error: false,
      message: 'Payout processed successfully',
      data: {
        trainerId: id,
        payoutId: `po_${Math.random().toString(36).substring(2, 15)}`,
        amount: req.body.amount,
        status: 'completed',
        processedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Process payout error:', error);
    res.status(500).json({
      error: true,
      message: 'Error processing payout'
    });
  }
};

// Get platform settings
exports.getPlatformSettings = async (req, res) => {
  try {
    // In a real implementation, we would fetch from a settings table
    // For now, we'll return mock settings
    
    res.status(200).json({
      error: false,
      data: {
        settings: {
          platformFeePercentage: 10,
          allowTrainerRegistration: true,
          requireTrainerVerification: true,
          allowClientReviews: true,
          minimumSessionPrice: 10,
          maximumSessionPrice: 500,
          currency: 'USD',
          timeZone: 'America/New_York',
          supportEmail: 'support@fittribe.fitness',
          termsUrl: 'https://fittribe.fitness/terms',
          privacyUrl: 'https://fittribe.fitness/privacy'
        }
      }
    });
  } catch (error) {
    console.error('Get platform settings error:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching platform settings'
    });
  }
};

// Update platform settings
exports.updatePlatformSettings = async (req, res) => {
  try {
    const { 
      platformFeePercentage,
      allowTrainerRegistration,
      requireTrainerVerification,
      allowClientReviews,
      minimumSessionPrice,
      maximumSessionPrice,
      currency,
      timeZone,
      supportEmail,
      termsUrl,
      privacyUrl
    } = req.body;
    
    // In a real implementation, we would update a settings table
    // For now, we'll return the updated settings
    
    res.status(200).json({
      error: false,
      message: 'Platform settings updated successfully',
      data: {
        settings: {
          platformFeePercentage: platformFeePercentage || 10,
          allowTrainerRegistration: allowTrainerRegistration !== undefined ? allowTrainerRegistration : true,
          requireTrainerVerification: requireTrainerVerification !== undefined ? requireTrainerVerification : true,
          allowClientReviews: allowClientReviews !== undefined ? allowClientReviews : true,
          minimumSessionPrice: minimumSessionPrice || 10,
          maximumSessionPrice: maximumSessionPrice || 500,
          currency: currency || 'USD',
          timeZone: timeZone || 'America/New_York',
          supportEmail: supportEmail || 'support@fittribe.fitness',
          termsUrl: termsUrl || 'https://fittribe.fitness/terms',
          privacyUrl: privacyUrl || 'https://fittribe.fitness/privacy'
        }
      }
    });
  } catch (error) {
    console.error('Update platform settings error:', error);
    res.status(500).json({
      error: true,
      message: 'Error updating platform settings'
    });
  }
};
