const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const socketio = require('socket.io');
const redis = require('./services/redisService');

// Load env vars
//dotenv.config({ path: './config/config.env' });
dotenv.config();
// Connect to database
connectDB();

// Route files
const auth = require('./routes/authRoutes');
const votes = require('./routes/voteRoutes');
const profileRoutes = require('./routes/ProfileRoutes');

// Add other routes as needed

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());
// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj) return obj;
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      } else if (/\$/.test(key)) {
        delete obj[key];
      }
    });
  };
  
  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
});

// Set security headers
app.use(helmet());

// Prevent XSS attacks
const xssClean = require('xss-clean');

app.use((req, res, next) => {
  const sanitize = xssClean();

  // Monkey patch: Avoid modifying read-only query
  Object.defineProperty(req, 'query', {
    writable: true,
    value: { ...req.query } // create a shallow copy to avoid mutation
  });

  sanitize(req, res, next);
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
//app.use(cors());
const corsOptions = {
  origin: 'http://localhost:3002',  // your React frontend
  credentials: true,
};
app.use(cors(corsOptions));
// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/votes', votes);
app.use('/api/v1/profile', profileRoutes);
// Mount other routers as needed

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3005; // Changed from 5000 to 3000

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Set up Socket.io
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

// Handle socket connections
io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  // Join room for vote updates
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Make io accessible to routes
app.set('io', io);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});