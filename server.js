const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Validate environment variables
const validateEnv = require('./utils/validateEnv');
validateEnv();

const app = express();

// Middleware
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:3001', 'http://localhost:3000']
  : '*';

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

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/admin', require('./routes/admin'));

// Error handler (must be last)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-platform';

const logger = require('./utils/logger');

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

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Blog Platform API is running' });
});

