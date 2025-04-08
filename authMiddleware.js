const jwt = require('jsonwebtoken');
const db = require('../models');

// Middleware to authenticate user
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: true,
        message: 'Authentication required. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await db.query(
      'SELECT id, role FROM users WHERE id = $1',
      [decoded.id]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({
        error: true,
        message: 'Invalid token. User not found.'
      });
    }

    // Add user info to request
    req.user = {
      id: user.rows[0].id,
      role: user.rows[0].role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: true,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: true,
        message: 'Token expired'
      });
    }
    
    res.status(500).json({
      error: true,
      message: 'Authentication error'
    });
  }
};

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: true,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Middleware to check if user is trainer
exports.isTrainer = (req, res, next) => {
  if (req.user.role !== 'trainer' && req.user.role !== 'admin') {
    return res.status(403).json({
      error: true,
      message: 'Access denied. Trainer privileges required.'
    });
  }
  next();
};

// Middleware to check if user is client
exports.isClient = (req, res, next) => {
  if (req.user.role !== 'client' && req.user.role !== 'admin') {
    return res.status(403).json({
      error: true,
      message: 'Access denied. Client privileges required.'
    });
  }
  next();
};

// Middleware to check if user is owner of resource or admin
exports.isOwnerOrAdmin = (resourceTable, resourceIdParam) => {
  return async (req, res, next) => {
    try {
      // Admin can access any resource
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceId = req.params[resourceIdParam];
      
      // Check if resource exists and belongs to user
      const resource = await db.query(
        `SELECT * FROM ${resourceTable} WHERE id = $1`,
        [resourceId]
      );

      if (resource.rows.length === 0) {
        return res.status(404).json({
          error: true,
          message: 'Resource not found'
        });
      }

      // Check if user is owner of resource
      // This assumes the resource has a user_id or client_id or trainer_id field
      const userId = resource.rows[0].user_id || 
                     resource.rows[0].client_id || 
                     resource.rows[0].trainer_id;

      if (userId !== req.user.id) {
        return res.status(403).json({
          error: true,
          message: 'Access denied. You do not own this resource.'
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({
        error: true,
        message: 'Authorization error'
      });
    }
  };
};
