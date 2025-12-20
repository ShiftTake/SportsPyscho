/**
 * Sports Psycho - API Utilities Module
 * Provides shared utility functions for API operations
 * Includes authentication, validation, error handling, and helper functions
 * 
 * @module api/api-utils
 * @author Sports Psycho Development Team
 * @description Shared utilities for backend API
 */

/**
 * Authentication middleware to verify JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    // In production, verify JWT token
    // const jwt = require('jsonwebtoken');
    // const user = jwt.verify(token, process.env.JWT_SECRET);
    
    // For demo, decode mock user
    const user = decodeMockToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}

/**
 * Mock token decoder for demo purposes
 * @param {string} token - JWT token
 * @returns {Object} User object
 */
function decodeMockToken(token) {
  // In production, use actual JWT verification
  return {
    id: 'user_12345',
    username: 'demo_user',
    email: 'demo@sportspsycho.com'
  };
}

/**
 * Validation helper to check required fields
 * @param {Object} data - Data object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Validation result { valid: boolean, missing: string[] }
 */
function validateRequiredFields(data, requiredFields) {
  const missing = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missing.push(field);
    }
  });

  return {
    valid: missing.length === 0,
    missing: missing
  };
}

/**
 * Email validation helper
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Generate unique ID with prefix
 * @param {string} prefix - ID prefix (e.g., 'club', 'event', 'user')
 * @returns {string} Unique ID
 */
function generateId(prefix) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Format date to ISO string
 * @param {Date|string} date - Date object or string
 * @returns {string} ISO formatted date string
 */
function formatDate(date) {
  return new Date(date).toISOString();
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in miles
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Paginate array results
 * @param {Array} array - Array to paginate
 * @param {number} page - Page number (1-indexed)
 * @param {number} perPage - Items per page
 * @returns {Object} Paginated results with metadata
 */
function paginate(array, page = 1, perPage = 10) {
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      perPage: perPage,
      totalItems: array.length,
      totalPages: Math.ceil(array.length / perPage),
      hasNextPage: endIndex < array.length,
      hasPrevPage: page > 1
    }
  };
}

/**
 * Error response helper
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 */
function sendError(res, statusCode, message, details = null) {
  const response = {
    success: false,
    message: message
  };
  
  if (details) {
    response.details = details;
  }
  
  res.status(statusCode).json(response);
}

/**
 * Success response helper
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object} data - Response data
 * @param {number} statusCode - HTTP status code (default 200)
 */
function sendSuccess(res, message, data = null, statusCode = 200) {
  const response = {
    success: true,
    message: message
  };
  
  if (data) {
    response.data = data;
  }
  
  res.status(statusCode).json(response);
}

/**
 * Rate limiting helper - tracks API calls per IP
 * @param {string} ip - Client IP address
 * @param {number} maxRequests - Max requests per time window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} True if request is allowed
 */
const rateLimitStore = new Map();

function checkRateLimit(ip, maxRequests = 100, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, []);
  }
  
  const requests = rateLimitStore.get(ip);
  
  // Remove old requests outside the window
  const recentRequests = requests.filter(timestamp => timestamp > windowStart);
  
  if (recentRequests.length >= maxRequests) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);
  
  return true;
}

/**
 * Rate limiting middleware
 * @param {number} maxRequests - Max requests per time window
 * @param {number} windowMs - Time window in milliseconds
 */
function rateLimiter(maxRequests = 100, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    
    if (!checkRateLimit(ip, maxRequests, windowMs)) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }
    
    next();
  };
}

/**
 * CORS configuration for mobile and web support
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In production, maintain a whitelist of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8080',
      'https://sportspsycho.com',
      'https://www.sportspsycho.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

/**
 * Logging middleware for API requests
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
}

module.exports = {
  authenticateToken,
  validateRequiredFields,
  validateEmail,
  sanitizeInput,
  generateId,
  formatDate,
  calculateDistance,
  paginate,
  sendError,
  sendSuccess,
  checkRateLimit,
  rateLimiter,
  corsOptions,
  requestLogger
};
