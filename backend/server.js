const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const expressMongoSanitize = require('express-mongo-sanitize');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const passport = require('./config/passport');
const { initSocket } = require('./services/socketService');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Connect Database (skip during Jest testing to allow MongoMemoryServer control)
if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
  connectDB().then(() => {
    const seedDemoUsers = require('./utils/seedDemo');
    seedDemoUsers();
  });
}

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Trust reverse proxy (Railway/Vercel) for express-rate-limit and client IPs
app.set('trust proxy', 1);

// Body parsers & Security Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(expressMongoSanitize());

const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000']
  : true;
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('dev'));
app.use(passport.initialize());

// Serve Uploaded Files statically
app.use('/uploads', express.static(uploadsDir));

// Rate Limiting
app.use('/api/', apiLimiter);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'CampusMind AI Backend API',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/answers', require('./routes/answerRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/learning', require('./routes/learningRoutes'));
app.use('/api/community', require('./routes/communityRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`[CampusMind AI] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = { app, server };
