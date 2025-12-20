/**
 * Sports Psycho - Main API Server
 * Express.js server for handling all API endpoints
 * Supports both web and mobile applications
 * 
 * @author Sports Psycho Development Team
 * @description Main API server with routing and middleware configuration
 * 
 * Features:
 * - RESTful API endpoints for clubs, events, and tournaments
 * - JWT authentication
 * - CORS support for mobile apps
 * - Rate limiting
 * - Request logging
 * - Error handling
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import API routes
const clubsRouter = require('./clubs');
const eventsRouter = require('./events');
const tournamentsRouter = require('./tournaments');

// Import utilities
const {
  authenticateToken,
  rateLimiter,
  corsOptions,
  requestLogger,
  sendError
} = require('./api-utils');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// Enable CORS for web and mobile apps
app.use(cors(corsOptions));

// Parse JSON request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Rate limiting - 100 requests per minute per IP
app.use(rateLimiter(100, 60000));

// ============================================================================
// API ROUTES
// ============================================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sports Psycho API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount API routers
// All club-related endpoints
app.use('/api/clubs', clubsRouter);

// All event-related endpoints
app.use('/api/events', eventsRouter);

// All tournament-related endpoints
app.use('/api/tournaments', tournamentsRouter);

// User authentication endpoints (placeholder)
app.post('/api/auth/register', async (req, res) => {
  // TODO: Implement user registration
  res.status(501).json({
    success: false,
    message: 'Registration endpoint not yet implemented'
  });
});

app.post('/api/auth/login', async (req, res) => {
  // TODO: Implement user login with JWT
  res.status(501).json({
    success: false,
    message: 'Login endpoint not yet implemented'
  });
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  // TODO: Implement logout (invalidate token)
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// User profile endpoints (placeholder)
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  // TODO: Implement get user profile
  res.status(501).json({
    success: false,
    message: 'User profile endpoint not yet implemented'
  });
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  // TODO: Implement update user profile
  res.status(501).json({
    success: false,
    message: 'Update user profile endpoint not yet implemented'
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  sendError(res, 404, 'Endpoint not found');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║            Sports Psycho API Server                       ║
║                                                           ║
║  Server running on: http://localhost:${PORT}               ║
║  Environment: ${process.env.NODE_ENV || 'development'}                      ║
║  Timestamp: ${new Date().toISOString()}        ║
║                                                           ║
║  Available Endpoints:                                     ║
║  - GET  /api/health                                       ║
║  - POST /api/clubs/create                                 ║
║  - POST /api/events/create                                ║
║  - POST /api/tournaments/create                           ║
║                                                           ║
║  Documentation: See README.md                             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
  });
}

module.exports = app;
