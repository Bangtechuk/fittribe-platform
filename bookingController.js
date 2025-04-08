const db = require('../models');

// Get user's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, upcoming } = req.query;
    
    let query = `
      SELECT 
        b.id, 
        b.start_time, 
        b.end_time, 
        b.status, 
        b.zoom_meeting_url,
        b.notes,
        b.created_at,
        ts.name as service_name,
        ts.duration,
        ts.price,
        client.id as client_id,
        client.first_name as client_first_name,
        client.last_name as client_last_name,
        client.profile_image as client_profile_image,
        trainer.id as trainer_id,
        trainer.first_name as trainer_first_name,
        trainer.last_name as trainer_last_name,
        trainer.profile_image as trainer_profile_image
      FROM bookings b
      JOIN trainer_services ts ON b.service_id = ts.id
      JOIN users client ON b.client_id = client.id
      JOIN users trainer ON b.trainer_id = trainer.id
      WHERE (b.client_id = $1 OR b.trainer_id = $1)
    `;
    
    const queryParams = [userId];
    let paramCounter = 2;
    
    // Filter by status if provided
    if (status) {
      query += ` AND b.status = $${paramCounter}`;
      queryParams.push(status);
      paramCounter++;
    }
    
    // Filter by upcoming if provided
    if (upcoming === 'true') {
      query += ` AND b.start_time > NOW()`;
    } else if (upcoming === 'false') {
      query += ` AND b.start_time <= NOW()`;
    }
    
    query += ` ORDER BY b.start_time DESC`;
    
    const bookings = await db.query(query, queryParams);
    
    // Format the response
    const formattedBookings = bookings.rows.map(booking => {
      const isClient = booking.client_id === userId;
      
      return {
        id: booking.id,
        startTime: booking.start_time,
        endTime: booking.end_time,
        status: booking.status,
        zoomMeetingUrl: booking.zoom_meeting_url,
        notes: booking.notes,
        createdAt: booking.created_at,
        service: {
          name: booking.service_name,
          duration: booking.duration,
          price: booking.price
        },
        otherParty: {
          id: isClient ? booking.trainer_id : booking.client_id,
          firstName: isClient ? booking.trainer_first_name : booking.client_first_name,
          lastName: isClient ? booking.trainer_last_name : booking.client_last_name,
          profileImage: isClient ? booking.trainer_profile_image : booking.client_profile_image,
          role: isClient ? 'trainer' : 'client'
        }
      };
    });
    
    res.status(200).json({
      error: false,
      data: {
        bookings: formattedBookings
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching bookings'
    });
  }
};

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { trainerId, serviceId, startTime, endTime, notes } = req.body;
    const clientId = req.user.id;
    
    // Validate inputs
    if (!trainerId || !serviceId || !startTime || !endTime) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields'
      });
    }
    
    // Check if service exists and is active
    const serviceQuery = await db.query(
      'SELECT * FROM trainer_services WHERE id = $1 AND is_active = true',
      [serviceId]
    );
    
    if (serviceQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Service not found or inactive'
      });
    }
    
    // Check if trainer exists
    const trainerQuery = await db.query(
      'SELECT * FROM users WHERE id = $1 AND role = $2',
      [trainerId, 'trainer']
    );
    
    if (trainerQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Trainer not found'
      });
    }
    
    // Check if time slot is available
    const conflictQuery = await db.query(
      `SELECT * FROM bookings 
       WHERE trainer_id = $1 
       AND status IN ('pending', 'confirmed') 
       AND (
         (start_time <= $2 AND end_time > $2) OR
         (start_time < $3 AND end_time >= $3) OR
         (start_time >= $2 AND end_time <= $3)
       )`,
      [trainerId, startTime, endTime]
    );
    
    if (conflictQuery.rows.length > 0) {
      return res.status(409).json({
        error: true,
        message: 'Time slot is not available'
      });
    }
    
    // Create booking
    const newBooking = await db.query(
      `INSERT INTO bookings 
       (client_id, trainer_id, service_id, start_time, end_time, status, notes, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
       RETURNING *`,
      [clientId, trainerId, serviceId, startTime, endTime, 'pending', notes]
    );
    
    res.status(201).json({
      error: false,
      message: 'Booking created successfully',
      data: {
        booking: newBooking.rows[0]
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      error: true,
      message: 'Error creating booking'
    });
  }
};

// Get booking details
exports.getBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Get booking details
    const bookingQuery = await db.query(
      `SELECT 
        b.id, 
        b.client_id, 
        b.trainer_id, 
        b.service_id, 
        b.start_time, 
        b.end_time, 
        b.status, 
        b.cancellation_reason, 
        b.zoom_meeting_id, 
        b.zoom_meeting_url, 
        b.zoom_meeting_password, 
        b.notes, 
        b.created_at, 
        b.updated_at,
        ts.name as service_name,
        ts.description as service_description,
        ts.duration as service_duration,
        ts.price as service_price,
        client.first_name as client_first_name,
        client.last_name as client_last_name,
        client.email as client_email,
        client.profile_image as client_profile_image,
        trainer.first_name as trainer_first_name,
        trainer.last_name as trainer_last_name,
        trainer.email as trainer_email,
        trainer.profile_image as trainer_profile_image
      FROM bookings b
      JOIN trainer_services ts ON b.service_id = ts.id
      JOIN users client ON b.client_id = client.id
      JOIN users trainer ON b.trainer_id = trainer.id
      WHERE b.id = $1 AND (b.client_id = $2 OR b.trainer_id = $2)`,
      [id, userId]
    );
    
    if (bookingQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Booking not found or you do not have access'
      });
    }
    
    const booking = bookingQuery.rows[0];
    
    // Format response
    const response = {
      id: booking.id,
      status: booking.status,
      startTime: booking.start_time,
      endTime: booking.end_time,
      cancellationReason: booking.cancellation_reason,
      zoomMeetingUrl: booking.zoom_meeting_url,
      zoomMeetingPassword: booking.zoom_meeting_password,
      notes: booking.notes,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      service: {
        id: booking.service_id,
        name: booking.service_name,
        description: booking.service_description,
        duration: booking.service_duration,
        price: booking.service_price
      },
      client: {
        id: booking.client_id,
        firstName: booking.client_first_name,
        lastName: booking.client_last_name,
        email: booking.client_email,
        profileImage: booking.client_profile_image
      },
      trainer: {
        id: booking.trainer_id,
        firstName: booking.trainer_first_name,
        lastName: booking.trainer_last_name,
        email: booking.trainer_email,
        profileImage: booking.trainer_profile_image
      }
    };
    
    res.status(200).json({
      error: false,
      data: {
        booking: response
      }
    });
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching booking details'
    });
  }
};

// Update booking
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, notes } = req.body;
    const userId = req.user.id;
    
    // Check if booking exists and belongs to user
    const bookingQuery = await db.query(
      'SELECT * FROM bookings WHERE id = $1 AND (client_id = $2 OR trainer_id = $2)',
      [id, userId]
    );
    
    if (bookingQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Booking not found or you do not have access'
      });
    }
    
    const booking = bookingQuery.rows[0];
    
    // Only allow updates for pending or confirmed bookings
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return res.status(400).json({
        error: true,
        message: `Cannot update booking with status: ${booking.status}`
      });
    }
    
    // Check for time slot conflicts if times are being updated
    if (startTime && endTime) {
      const conflictQuery = await db.query(
        `SELECT * FROM bookings 
         WHERE trainer_id = $1 
         AND id != $2
         AND status IN ('pending', 'confirmed') 
         AND (
           (start_time <= $3 AND end_time > $3) OR
           (start_time < $4 AND end_time >= $4) OR
           (start_time >= $3 AND end_time <= $4)
         )`,
        [booking.trainer_id, id, startTime, endTime]
      );
      
      if (conflictQuery.rows.length > 0) {
        return res.status(409).json({
          error: true,
          message: 'Time slot is not available'
        });
      }
    }
    
    // Update booking
    const updatedBooking = await db.query(
      `UPDATE bookings 
       SET start_time = COALESCE($1, start_time), 
           end_time = COALESCE($2, end_time), 
           notes = COALESCE($3, notes),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [startTime, endTime, notes, id]
    );
    
    res.status(200).json({
      error: false,
      message: 'Booking updated successfully',
      data: {
        booking: updatedBooking.rows[0]
      }
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      error: true,
      message: 'Error updating booking'
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const userId = req.user.id;
    
    // Check if booking exists and belongs to user
    const bookingQuery = await db.query(
      'SELECT * FROM bookings WHERE id = $1 AND (client_id = $2 OR trainer_id = $2)',
      [id, userId]
    );
    
    if (bookingQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Booking not found or you do not have access'
      });
    }
    
    const booking = bookingQuery.rows[0];
    
    // Only allow cancellation for pending or confirmed bookings
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return res.status(400).json({
        error: true,
        message: `Cannot cancel booking with status: ${booking.status}`
      });
    }
    
    // Update booking status
    const cancelledBooking = await db.query(
      `UPDATE bookings 
       SET status = 'cancelled', 
           cancellation_reason = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [cancellationReason, id]
    );
    
    res.status(200).json({
      error: false,
      message: 'Booking cancelled successfully',
      data: {
        booking: cancelledBooking.rows[0]
      }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      error: true,
      message: 'Error cancelling booking'
    });
  }
};

// Confirm booking (trainer only)
exports.confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const trainerId = req.user.id;
    
    // Check if booking exists and belongs to trainer
    const bookingQuery = await db.query(
      'SELECT * FROM bookings WHERE id = $1 AND trainer_id = $2',
      [id, trainerId]
    );
    
    if (bookingQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Booking not found or you are not the trainer'
      });
    }
    
    const booking = bookingQuery.rows[0];
    
    // Only allow confirmation for pending bookings
    if (booking.status !== 'pending') {
      return res.status(400).json({
        error: true,
        message: `Cannot confirm booking with status: ${booking.status}`
      });
    }
    
    // Update booking status
    const confirmedBooking = await db.query(
      `UPDATE bookings 
       SET status = 'confirmed', 
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    
    res.status(200).json({
      error: false,
      message: 'Booking confirmed successfully',
      data: {
        booking: confirmedBooking.rows[0]
      }
    });
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({
      error: true,
      message: 'Error confirming booking'
    });
  }
};

// Decline booking (trainer only)
exports.declineBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const trainerId = req.user.id;
    
    // Check if booking exists and belongs to trainer
    const bookingQuery = await db.query(
      'SELECT * FROM bookings WHERE id = $1 AND trainer_id = $2',
      [id, trainerId]
    );
    
    if (bookingQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Booking not found or you are not the trainer'
      });
    }
    
    const booking = bookingQuery.rows[0];
    
    // Only allow declining for pending bookings
    if (booking.status !== 'pending') {
      return res.status(400).json({
        error: true,
        message: `Cannot decline booking with status: ${booking.status}`
      });
    }
    
    // Update booking status
    const declinedBooking = await db.query(
      `UPDATE bookings 
       SET status = 'cancelled', 
           cancellation_reason = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [cancellationReason || 'Declined by trainer', id]
    );
    
    res.status(200).json({
      error: false,
      message: 'Booking declined successfully',
      data: {
        booking: declinedBooking.rows[0]
      }
    });
  } catch (error) {
    console.error('Decline booking error:', error);
    res.status(500).json({
      error: true,
      message: 'Error declining booking'
    });
  }
};

// Complete booking (trainer only)
exports.completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const trainerId = req.user.id;
    
    // Check if booking exists and belongs to trainer
    const bookingQuery = await db.query(
      'SELECT * FROM bookings WHERE id = $1 AND trainer_id = $2',
      [id, trainerId]
    );
    
    if (bookingQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Booking not found or you are not the trainer'
      });
    }
    
    const booking = bookingQuery.rows[0];
    
    // Only allow completion for confirmed bookings
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        error: true,
        message: `Cannot complete booking with status: ${booking.status}`
      });
    }
    
    // Update booking status
    const completedBooking = await db.query(
      `UPDATE bookings 
       SET status = '
(Content truncated due to size limit. Use line ranges to read in chunks)