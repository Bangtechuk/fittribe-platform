const db = require('../models');

// Create a review
exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment, isPublic = true } = req.body;
    const clientId = req.user.id;
    
    // Check if booking exists and belongs to client
    const bookingQuery = await db.query(
      'SELECT * FROM bookings WHERE id = $1 AND client_id = $2 AND status = $3',
      [bookingId, clientId, 'completed']
    );
    
    if (bookingQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Booking not found, not completed, or you are not the client'
      });
    }
    
    const booking = bookingQuery.rows[0];
    
    // Check if review already exists for this booking
    const reviewExists = await db.query(
      'SELECT * FROM reviews WHERE booking_id = $1',
      [bookingId]
    );
    
    if (reviewExists.rows.length > 0) {
      return res.status(400).json({
        error: true,
        message: 'Review already exists for this booking'
      });
    }
    
    // Create review
    const newReview = await db.query(
      `INSERT INTO reviews 
       (booking_id, client_id, trainer_id, rating, comment, is_public, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
       RETURNING *`,
      [bookingId, clientId, booking.trainer_id, rating, comment, isPublic]
    );
    
    // Update trainer average rating
    await db.query(
      `UPDATE trainer_profiles 
       SET avg_rating = (
         SELECT AVG(rating) 
         FROM reviews 
         WHERE trainer_id = $1 AND is_public = true
       )
       WHERE user_id = $1`,
      [booking.trainer_id]
    );
    
    res.status(201).json({
      error: false,
      message: 'Review created successfully',
      data: {
        review: newReview.rows[0]
      }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      error: true,
      message: 'Error creating review'
    });
  }
};

// Get reviews (for trainer or by client)
exports.getReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.query;
    
    let query;
    let queryParams;
    
    if (role === 'trainer') {
      // Get reviews for trainer
      query = `
        SELECT 
          r.id, 
          r.booking_id, 
          r.rating, 
          r.comment, 
          r.is_public, 
          r.created_at,
          u.first_name as client_first_name,
          u.last_name as client_last_name,
          u.profile_image as client_profile_image
        FROM reviews r
        JOIN users u ON r.client_id = u.id
        WHERE r.trainer_id = $1
        ORDER BY r.created_at DESC
      `;
      queryParams = [userId];
    } else {
      // Get reviews by client
      query = `
        SELECT 
          r.id, 
          r.booking_id, 
          r.rating, 
          r.comment, 
          r.is_public, 
          r.created_at,
          u.first_name as trainer_first_name,
          u.last_name as trainer_last_name,
          u.profile_image as trainer_profile_image
        FROM reviews r
        JOIN users u ON r.trainer_id = u.id
        WHERE r.client_id = $1
        ORDER BY r.created_at DESC
      `;
      queryParams = [userId];
    }
    
    const reviewsQuery = await db.query(query, queryParams);
    
    res.status(200).json({
      error: false,
      data: {
        reviews: reviewsQuery.rows
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching reviews'
    });
  }
};

// Get review details
exports.getReviewDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Get review details
    const reviewQuery = await db.query(
      `SELECT 
        r.id, 
        r.booking_id, 
        r.client_id,
        r.trainer_id,
        r.rating, 
        r.comment, 
        r.is_public, 
        r.created_at,
        r.updated_at,
        client.first_name as client_first_name,
        client.last_name as client_last_name,
        client.profile_image as client_profile_image,
        trainer.first_name as trainer_first_name,
        trainer.last_name as trainer_last_name,
        trainer.profile_image as trainer_profile_image,
        b.start_time as session_time
      FROM reviews r
      JOIN users client ON r.client_id = client.id
      JOIN users trainer ON r.trainer_id = trainer.id
      JOIN bookings b ON r.booking_id = b.id
      WHERE r.id = $1 AND (r.client_id = $2 OR r.trainer_id = $2 OR r.is_public = true)`,
      [id, userId]
    );
    
    if (reviewQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Review not found or you do not have access'
      });
    }
    
    const review = reviewQuery.rows[0];
    
    // Format response
    const response = {
      id: review.id,
      bookingId: review.booking_id,
      rating: review.rating,
      comment: review.comment,
      isPublic: review.is_public,
      createdAt: review.created_at,
      updatedAt: review.updated_at,
      sessionTime: review.session_time,
      client: {
        id: review.client_id,
        firstName: review.client_first_name,
        lastName: review.client_last_name,
        profileImage: review.client_profile_image
      },
      trainer: {
        id: review.trainer_id,
        firstName: review.trainer_first_name,
        lastName: review.trainer_last_name,
        profileImage: review.trainer_profile_image
      }
    };
    
    res.status(200).json({
      error: false,
      data: {
        review: response
      }
    });
  } catch (error) {
    console.error('Get review details error:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching review details'
    });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, isPublic } = req.body;
    const clientId = req.user.id;
    
    // Check if review exists and belongs to client
    const reviewQuery = await db.query(
      'SELECT * FROM reviews WHERE id = $1 AND client_id = $2',
      [id, clientId]
    );
    
    if (reviewQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Review not found or you are not the author'
      });
    }
    
    const review = reviewQuery.rows[0];
    
    // Update review
    const updatedReview = await db.query(
      `UPDATE reviews 
       SET rating = COALESCE($1, rating), 
           comment = COALESCE($2, comment), 
           is_public = COALESCE($3, is_public),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [rating, comment, isPublic, id]
    );
    
    // Update trainer average rating
    await db.query(
      `UPDATE trainer_profiles 
       SET avg_rating = (
         SELECT AVG(rating) 
         FROM reviews 
         WHERE trainer_id = $1 AND is_public = true
       )
       WHERE user_id = $1`,
      [review.trainer_id]
    );
    
    res.status(200).json({
      error: false,
      message: 'Review updated successfully',
      data: {
        review: updatedReview.rows[0]
      }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      error: true,
      message: 'Error updating review'
    });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if user is admin
    const userQuery = await db.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );
    
    const isAdmin = userQuery.rows.length > 0 && userQuery.rows[0].role === 'admin';
    
    // Get review details
    const reviewQuery = await db.query(
      'SELECT * FROM reviews WHERE id = $1 AND (client_id = $2 OR $3 = true)',
      [id, userId, isAdmin]
    );
    
    if (reviewQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Review not found or you do not have permission to delete it'
      });
    }
    
    const review = reviewQuery.rows[0];
    
    // Delete review
    await db.query(
      'DELETE FROM reviews WHERE id = $1',
      [id]
    );
    
    // Update trainer average rating
    await db.query(
      `UPDATE trainer_profiles 
       SET avg_rating = (
         SELECT AVG(rating) 
         FROM reviews 
         WHERE trainer_id = $1 AND is_public = true
       )
       WHERE user_id = $1`,
      [review.trainer_id]
    );
    
    res.status(200).json({
      error: false,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      error: true,
      message: 'Error deleting review'
    });
  }
};

// Report inappropriate review
exports.reportReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    
    // Check if review exists
    const reviewQuery = await db.query(
      'SELECT * FROM reviews WHERE id = $1',
      [id]
    );
    
    if (reviewQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Review not found'
      });
    }
    
    // In a real implementation, we would store the report in a reports table
    // For now, we'll simulate it
    
    res.status(200).json({
      error: false,
      message: 'Review reported successfully',
      data: {
        reportId: `rep_${Math.random().toString(36).substring(2, 15)}`,
        reviewId: id,
        reason,
        status: 'pending',
        reportedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({
      error: true,
      message: 'Error reporting review'
    });
  }
};
