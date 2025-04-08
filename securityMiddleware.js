const jwt = require('jsonwebtoken');
const { promisify } = require('util');

// Middleware to authenticate token
const authenticateToken = async (req, res, next) => {
  try {
    // 1) Get token and check if it exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'You are not logged in. Please provide a token to access this resource.'
      });
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: true,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 4) Check if user changed password after the token was issued
    if (userResult.rows[0].password_changed_at) {
      const changedTimestamp = parseInt(
        new Date(userResult.rows[0].password_changed_at).getTime() / 1000,
        10
      );

      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({
          error: true,
          message: 'User recently changed password. Please log in again.'
        });
      }
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = {
      id: userResult.rows[0].id,
      email: userResult.rows[0].email,
      firstName: userResult.rows[0].first_name,
      lastName: userResult.rows[0].last_name,
      role: userResult.rows[0].role
    };
    next();
  } catch (error) {
    return res.status(401).json({
      error: true,
      message: 'Invalid token. Please log in again.'
    });
  }
};

// Middleware to authorize based on user role
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: true,
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

// Middleware to restrict to resource owner
const restrictToOwner = (model, paramIdField) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramIdField];
      const userId = req.user.id;
      
      // Get the resource
      const query = `SELECT * FROM ${model} WHERE id = $1`;
      const result = await db.query(query, [resourceId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          error: true,
          message: `${model} not found`
        });
      }
      
      // Check if user is the owner
      const resource = result.rows[0];
      
      if (resource.user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          error: true,
          message: 'You do not have permission to perform this action'
        });
      }
      
      // If user is the owner or admin, grant access
      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: 'Error checking resource ownership'
      });
    }
  };
};

// Middleware to validate request body
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        error: true,
        message
      });
    }
    
    next();
  };
};

// Middleware to sanitize user input
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Basic sanitization - remove script tags
        req.body[key] = req.body[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
    }
  }
  next();
};

// Middleware to log requests
const logRequest = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${req.ip}`);
  next();
};

module.exports = {
  authenticateToken,
  authorizeRole,
  restrictToOwner,
  validateRequest,
  sanitizeInput,
  logRequest
};
