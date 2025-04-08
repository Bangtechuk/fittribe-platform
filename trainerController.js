const db = require('../models');

// Get all trainers (with filtering)
exports.getAllTrainers = async (req, res) => {
  try {
    const { specialization, minRating, maxPrice, location, search } = req.query;
    
    let query = `
      SELECT 
        u.id, 
        u.first_name, 
        u.last_name, 
        u.profile_image, 
        tp.bio, 
        tp.specializations, 
        tp.years_experience, 
        tp.location, 
        tp.avg_rating, 
        tp.hourly_rate
      FROM users u
      JOIN trainer_profiles tp ON u.id = tp.user_id
      WHERE u.role = 'trainer' AND u.is_active = true
    `;
    
    const queryParams = [];
    let paramCounter = 1;
    
    // Add filters if provided
    if (specialization) {
      query += ` AND $${paramCounter} = ANY(tp.specializations)`;
      queryParams.push(specialization);
      paramCounter++;
    }
    
    if (minRating) {
      query += ` AND tp.avg_rating >= $${paramCounter}`;
      queryParams.push(minRating);
      paramCounter++;
    }
    
    if (maxPrice) {
      query += ` AND tp.hourly_rate <= $${paramCounter}`;
      queryParams.push(maxPrice);
      paramCounter++;
    }
    
    if (location) {
      query += ` AND tp.location ILIKE $${paramCounter}`;
      queryParams.push(`%${location}%`);
      paramCounter++;
    }
    
    if (search) {
      query += ` AND (u.first_name ILIKE $${paramCounter} OR u.last_name ILIKE $${paramCounter} OR tp.bio ILIKE $${paramCounter})`;
      queryParams.push(`%${search}%`);
      paramCounter++;
    }
    
    query += ` ORDER BY tp.avg_rating DESC`;
    
    const trainers = await db.query(query, queryParams);
    
    res.status(200).json({
      error: false,
      data: {
        trainers: trainers.rows
      }
    });
  } catch (error) {
    console.error('Get all trainers error:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching trainers'
    });
  }
};

// Get trainer by ID
exports.getTrainerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get trainer profile
    const trainerQuery = await db.query(
      `SELECT 
        u.id, 
        u.first_name, 
        u.last_name, 
        u.email, 
        u.profile_image, 
        tp.bio, 
        tp.specializations, 
        tp.years_experience, 
        tp.location, 
        tp.avg_rating, 
        tp.hourly_rate, 
        tp.availability_hours
      FROM users u
      JOIN trainer_profiles tp ON u.id = tp.user_id
      WHERE u.id = $1 AND u.role = 'trainer'`,
      [id]
    );
    
    if (trainerQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Trainer not found'
      });
    }
    
    // Get trainer certifications
    const certificationsQuery = await db.query(
      `SELECT 
        id, 
        name, 
        issuing_organization, 
        issue_date, 
        expiry_date, 
        verification_url, 
        document_url, 
        is_verified
      FROM certifications
      WHERE trainer_id = $1`,
      [trainerQuery.rows[0].id]
    );
    
    // Get trainer services
    const servicesQuery = await db.query(
      `SELECT 
        id, 
        name, 
        description, 
        duration, 
        price, 
        is_group, 
        max_participants
      FROM trainer_services
      WHERE trainer_id = $1 AND is_active = true`,
      [trainerQuery.rows[0].id]
    );
    
    // Get trainer packages
    const packagesQuery = await db.query(
      `SELECT 
        id, 
        name, 
        description, 
        service_id, 
        session_count, 
        price, 
        validity_days
      FROM trainer_packages
      WHERE trainer_id = $1 AND is_active = true`,
      [trainerQuery.rows[0].id]
    );
    
    // Get trainer reviews
    const reviewsQuery = await db.query(
      `SELECT 
        r.id, 
        r.rating, 
        r.comment, 
        r.created_at,
        u.first_name, 
        u.last_name, 
        u.profile_image
      FROM reviews r
      JOIN users u ON r.client_id = u.id
      WHERE r.trainer_id = $1 AND r.is_public = true
      ORDER BY r.created_at DESC`,
      [trainerQuery.rows[0].id]
    );
    
    const trainer = trainerQuery.rows[0];
    
    // Format response
    const response = {
      id: trainer.id,
      firstName: trainer.first_name,
      lastName: trainer.last_name,
      email: trainer.email,
      profileImage: trainer.profile_image,
      bio: trainer.bio,
      specializations: trainer.specializations,
      yearsExperience: trainer.years_experience,
      location: trainer.location,
      avgRating: trainer.avg_rating,
      hourlyRate: trainer.hourly_rate,
      availabilityHours: trainer.availability_hours,
      certifications: certificationsQuery.rows,
      services: servicesQuery.rows,
      packages: packagesQuery.rows,
      reviews: reviewsQuery.rows
    };
    
    res.status(200).json({
      error: false,
      data: {
        trainer: response
      }
    });
  } catch (error) {
    console.error('Get trainer by ID error:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching trainer'
    });
  }
};

// Create trainer profile
exports.createTrainerProfile = async (req, res) => {
  try {
    const { 
      bio, 
      specializations, 
      yearsExperience, 
      location, 
      hourlyRate, 
      availabilityHours 
    } = req.body;
    
    // Check if user is a trainer
    const userQuery = await db.query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (userQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    if (userQuery.rows[0].role !== 'trainer') {
      return res.status(403).json({
        error: true,
        message: 'Only trainers can create trainer profiles'
      });
    }
    
    // Check if trainer profile already exists
    const profileExists = await db.query(
      'SELECT * FROM trainer_profiles WHERE user_id = $1',
      [req.user.id]
    );
    
    if (profileExists.rows.length > 0) {
      return res.status(400).json({
        error: true,
        message: 'Trainer profile already exists'
      });
    }
    
    // Create trainer profile
    const newProfile = await db.query(
      `INSERT INTO trainer_profiles 
       (user_id, bio, specializations, years_experience, location, is_verified, avg_rating, hourly_rate, availability_hours, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, false, 0, $6, $7, NOW(), NOW()) 
       RETURNING *`,
      [req.user.id, bio, specializations, yearsExperience, location, hourlyRate, availabilityHours || {}]
    );
    
    res.status(201).json({
      error: false,
      message: 'Trainer profile created successfully',
      data: {
        profile: newProfile.rows[0]
      }
    });
  } catch (error) {
    console.error('Create trainer profile error:', error);
    res.status(500).json({
      error: true,
      message: 'Error creating trainer profile'
    });
  }
};

// Update trainer profile
exports.updateTrainerProfile = async (req, res) => {
  try {
    const { 
      bio, 
      specializations, 
      yearsExperience, 
      location, 
      hourlyRate, 
      availabilityHours 
    } = req.body;
    
    // Check if trainer profile exists
    const profileQuery = await db.query(
      'SELECT * FROM trainer_profiles WHERE user_id = $1',
      [req.user.id]
    );
    
    if (profileQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Trainer profile not found'
      });
    }
    
    // Update trainer profile
    const updatedProfile = await db.query(
      `UPDATE trainer_profiles 
       SET bio = COALESCE($1, bio), 
           specializations = COALESCE($2, specializations), 
           years_experience = COALESCE($3, years_experience), 
           location = COALESCE($4, location), 
           hourly_rate = COALESCE($5, hourly_rate), 
           availability_hours = COALESCE($6, availability_hours),
           updated_at = NOW()
       WHERE user_id = $7
       RETURNING *`,
      [bio, specializations, yearsExperience, location, hourlyRate, availabilityHours, req.user.id]
    );
    
    res.status(200).json({
      error: false,
      message: 'Trainer profile updated successfully',
      data: {
        profile: updatedProfile.rows[0]
      }
    });
  } catch (error) {
    console.error('Update trainer profile error:', error);
    res.status(500).json({
      error: true,
      message: 'Error updating trainer profile'
    });
  }
};

// Get trainer availability
exports.getTrainerAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get trainer availability
    const availabilityQuery = await db.query(
      'SELECT availability_hours FROM trainer_profiles WHERE user_id = $1',
      [id]
    );
    
    if (availabilityQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Trainer not found'
      });
    }
    
    // Get trainer bookings
    const bookingsQuery = await db.query(
      `SELECT start_time, end_time 
       FROM bookings 
       WHERE trainer_id = $1 AND status IN ('pending', 'confirmed') 
       AND start_time > NOW()`,
      [id]
    );
    
    res.status(200).json({
      error: false,
      data: {
        availability: availabilityQuery.rows[0].availability_hours,
        bookedSlots: bookingsQuery.rows
      }
    });
  } catch (error) {
    console.error('Get trainer availability error:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching trainer availability'
    });
  }
};

// Update trainer availability
exports.updateTrainerAvailability = async (req, res) => {
  try {
    const { availabilityHours } = req.body;
    
    // Update trainer availability
    const updatedAvailability = await db.query(
      `UPDATE trainer_profiles 
       SET availability_hours = $1, 
           updated_at = NOW()
       WHERE user_id = $2
       RETURNING availability_hours`,
      [availabilityHours, req.user.id]
    );
    
    if (updatedAvailability.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Trainer profile not found'
      });
    }
    
    res.status(200).json({
      error: false,
      message: 'Availability updated successfully',
      data: {
        availability: updatedAvailability.rows[0].availability_hours
      }
    });
  } catch (error) {
    console.error('Update trainer availability error:', error);
    res.status(500).json({
      error: true,
      message: 'Error updating trainer availability'
    });
  }
};

// Add certification
exports.addCertification = async (req, res) => {
  try {
    const { 
      name, 
      issuingOrganization, 
      issueDate, 
      expiryDate, 
      verificationUrl, 
      documentUrl 
    } = req.body;
    
    // Get trainer profile ID
    const profileQuery = await db.query(
      'SELECT id FROM trainer_profiles WHERE user_id = $1',
      [req.user.id]
    );
    
    if (profileQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Trainer profile not found'
      });
    }
    
    const trainerId = profileQuery.rows[0].id;
    
    // Add certification
    const newCertification = await db.query(
      `INSERT INTO certifications 
       (trainer_id, name, issuing_organization, issue_date, expiry_date, verification_url, document_url, is_verified, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW(), NOW()) 
       RETURNING *`,
      [trainerId, name, issuingOrganization, issueDate, expiryDate, verificationUrl, documentUrl]
    );
    
    res.status(201).json({
      error: false,
      message: 'Certification added successfully',
      data: {
        certification: newCertification.rows[0]
      }
    });
  } catch (error) {
    console.error('Add certification error:', error);
    res.status(500).json({
      error: true,
      message: 'Error adding certification'
    });
  }
};

// Delete certification
exports.deleteCertification = async (req, res) => {
  try {
    const { certId } = req.params;
    
    // Get trainer profile ID
    const profileQuery = await db.query(
      'SELECT id FROM trainer_profiles WHERE user_id = $1',
      [req.user.id]
    );
    
    if (profileQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Trainer profile not found'
      });
    }
    
    const trainerId = profileQuery.rows[0].id;
    
    // Check if certification exists and belongs to trainer
    const certQuery = await db.query(
      'SELECT * FROM certifications WHERE id = $1 AND trainer_id = $2',
      [certId, trainerId]
    );
    
    if (certQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Certification not found or does not belong to trainer'
      });
    }
    
    // Delete certification
    await db.query(
      'DELETE FROM certifications WHERE id = $1',
      [certId]
    );
    
    res.status(200).json({
      error: false,
      message: 'Certification deleted successfully'
    });
  } catch (error) {
    console.error('Delete certification error:', error);
    res.status(500).json({
      error: true,
      message: 'Error deleting certification'
    });
  }
};

// Get trainer services
exports.getTrainerServices = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get trainer profile ID
    const profileQuery = await db.query(
      'SELECT id FROM trainer_profiles WHERE user_id = $1',
      [id]
    );
    
    if (profileQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Trainer profile not found'
      });
    }
    
    const trainerId = profileQuery.rows[0].id;
    
    // Get trainer services
    const servicesQuery = await db.query(
      `SELECT * FROM trainer_services 
       WHERE trainer_id = $1 AND is_active = true 
       ORDER BY price ASC`,
      [trainerId]
    );
    
    res.status(200).json({
      error: false,
      data: {
        services: servicesQuery.rows
      }
    });
  } catch (error) {
    console.error('Get trainer services error:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching trainer services'
    });
  }
};

// Add trainer service
exports.addTrainerService = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      duration, 
      price, 
      isGroup, 
      maxParticipants 
    } = req.body;
    
    // Get trainer profile ID
    const profileQuery = await db.query(
      'SELECT id FROM trainer_profiles WHERE user_id = $1',
      [req.user.id]
    );
    
    if (profileQuery.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Trainer profile not found'
      });
    }
    
    const trainerId = profileQuery.rows[0].id;
    
    // Add service
    const newService = await db.query(
      `INSERT INTO trainer_services 
       (trainer_id, name, description, duration, price, is_group, max_participants, is_active, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW()) 
       RETURNING *`,
      [trainerId, name, description, duration, price, isGroup, maxParticipants || null]
    );
    
    res.status(201).json({
      error: false,
      message: 'Service added successfully',
      data: {
        service: newService.rows[0]
      }
    });
  } catch (error) {
    console.error('Add trainer service error:', error);
    res.status(500).json({
      error: true,
      message: 'Error adding trainer service'
    });
  }
};

// Update trainer service
exports.updateTrainerService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { 
      name, 
      description, 
      durat
(Content truncated due to size limit. Use line ranges to read in chunks)