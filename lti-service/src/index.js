const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');
const { setupLTI } = require('./auth/ltiSetup');
const { logger } = require('./utils/logger');
const launchHandler = require('./handlers/launchHandler');
const gradeHandler = require('./handlers/gradeHandler');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8080'],
  credentials: true
}));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 3600000 // 1 hour
  }
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize LTI
const lti = setupLTI();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'lti-service' });
});

// LTI Routes
app.post('/lti/launch', launchHandler(lti));
app.post('/lti/grade', gradeHandler(lti));
app.get('/lti/jwks', (req, res) => {
  res.json(lti.getKeyset());
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`LTI Service running on port ${PORT}`);
});