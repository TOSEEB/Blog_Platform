const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./utils/logger');

dotenv.config();

// Validate environment variables
const validateEnv = require('./utils/validateEnv');
validateEnv();

const app = express();

// Middleware - CORS Configuration
// Supports multiple frontend URLs via FRONTEND_URL environment variable (comma-separated)
const getAllowedOrigins = () => {
  const origins = ['http://localhost:3001', 'http://localhost:3000']; // Always allow localhost for development
  
  if (process.env.FRONTEND_URL) {
    // Support comma-separated URLs in FRONTEND_URL (e.g., "https://app1.vercel.app,https://app2.vercel.app")
    // Remove trailing slashes for consistent matching (browsers send origins without trailing slashes)
    const frontendUrls = process.env.FRONTEND_URL
      .split(',')
      .map(url => url.trim().replace(/\/+$/, '')) // Remove trailing slashes
      .filter(Boolean);
    origins.push(...frontendUrls);
  }
  
  return origins;
};

const allowedOrigins = getAllowedOrigins();

// Log allowed origins on startup (for debugging)
logger.info('CORS Allowed Origins:', allowedOrigins);
if (!process.env.FRONTEND_URL) {
  logger.warn('⚠️  FRONTEND_URL environment variable not set! CORS may block production requests.');
  logger.warn('⚠️  Set FRONTEND_URL in Render environment variables to your Vercel domain(s)');
} else {
  logger.info('FRONTEND_URL from environment:', process.env.FRONTEND_URL);
}

// Use simple array-based CORS configuration (more reliable)
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
const rateLimiter = require('./middleware/rateLimiter');
const sanitize = require('./middleware/sanitize');
app.use(rateLimiter(15 * 60 * 1000, 100)); // 100 requests per 15 minutes
app.use(sanitize);

// Basic route (before API routes)
app.get('/', (req, res) => {
  res.json({ message: 'Blog Platform API is running' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/admin', require('./routes/admin'));

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.path 
  });
});

// Error handler (must be last)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-platform';

mongoose.connect(MONGODB_URI)
.then(() => {
  logger.info('MongoDB Connected');
  app.listen(PORT, '0.0.0.0', () => {
    logger.info('\n=================================');
    logger.info('🚀 BACKEND SERVER STARTED');
    logger.info('=================================');
    logger.info(`📍 Server running on: http://0.0.0.0:${PORT}`);
    logger.info(`📍 API Base URL: http://0.0.0.0:${PORT}/api`);
    logger.info('=================================\n');
  });
})
.catch(err => {
  console.error('\n❌ ============================================');
  console.error('❌ MONGODB CONNECTION FAILED');
  console.error('❌ ============================================');
  console.error('❌ Error:', err.message);
  console.error('❌ Check your MONGODB_URI in Render environment variables');
  console.error('❌ Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)');
  console.error('❌ ============================================\n');
  logger.error('MongoDB connection error:', err);
  process.exit(1);
});

