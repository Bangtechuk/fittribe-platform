const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body;

    // Check if user already exists
    const userExists = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        error: true,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const newUser = await db.query(
      `INSERT INTO users 
       (email, password_hash, first_name, last_name, role, phone, created_at, updated_at, is_verified, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), false, true) 
       RETURNING id, email, first_name, last_name, role, created_at`,
      [email, hashedPassword, firstName, lastName, role || 'client', phone]
    );

    // Create token
    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      error: false,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.rows[0].id,
          email: newUser.rows[0].email,
          firstName: newUser.rows[0].first_name,
          lastName: newUser.rows[0].last_name,
          role: newUser.rows[0].role
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: true,
      message: 'Error registering user'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({
        error: true,
        message: 'Invalid credentials'
      });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);

    if (!isMatch) {
      return res.status(401).json({
        error: true,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.rows[0].id]
    );

    // Create token
    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      error: false,
      message: 'Login successful',
      data: {
        user: {
          id: user.rows[0].id,
          email: user.rows[0].email,
          firstName: user.rows[0].first_name,
          lastName: user.rows[0].last_name,
          role: user.rows[0].role,
          profileImage: user.rows[0].profile_image
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: true,
      message: 'Error logging in'
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await db.query(
      'SELECT id, email, first_name, last_name, role, profile_image, phone, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }

    res.status(200).json({
      error: false,
      data: {
        user: {
          id: user.rows[0].id,
          email: user.rows[0].email,
          firstName: user.rows[0].first_name,
          lastName: user.rows[0].last_name,
          role: user.rows[0].role,
          profileImage: user.rows[0].profile_image,
          phone: user.rows[0].phone,
          createdAt: user.rows[0].created_at
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching user data'
    });
  }
};

// Update user profile
exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, phone, profileImage } = req.body;
    
    const updatedUser = await db.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name), 
           last_name = COALESCE($2, last_name), 
           phone = COALESCE($3, phone), 
           profile_image = COALESCE($4, profile_image),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, first_name, last_name, role, profile_image, phone`,
      [firstName, lastName, phone, profileImage, req.user.id]
    );

    res.status(200).json({
      error: false,
      message: 'User updated successfully',
      data: {
        user: {
          id: updatedUser.rows[0].id,
          email: updatedUser.rows[0].email,
          firstName: updatedUser.rows[0].first_name,
          lastName: updatedUser.rows[0].last_name,
          role: updatedUser.rows[0].role,
          profileImage: updatedUser.rows[0].profile_image,
          phone: updatedUser.rows[0].phone
        }
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: true,
      message: 'Error updating user'
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }

    // Generate reset token (in a real app, would store this and send via email)
    const resetToken = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In a real implementation, send email with reset link
    // For now, just return success message
    res.status(200).json({
      error: false,
      message: 'Password reset instructions sent to email',
      // In development only, return token directly
      devToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: true,
      message: 'Error processing password reset request'
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, decoded.id]
    );

    res.status(200).json({
      error: false,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: true,
      message: 'Error resetting password'
    });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Update user verification status
    await db.query(
      'UPDATE users SET is_verified = true, updated_at = NOW() WHERE id = $1',
      [decoded.id]
    );

    res.status(200).json({
      error: false,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      error: true,
      message: 'Error verifying email'
    });
  }
};

// Logout (client-side only, just return success)
exports.logout = (req, res) => {
  res.status(200).json({
    error: false,
    message: 'Logout successful'
  });
};
