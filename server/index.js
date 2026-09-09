require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('dotenv').config(); // also fallback to server/.env

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

// Import route modules
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const schemeRoutes = require('./routes/schemes');
const serviceRoutes = require('./routes/services');
const applicationRoutes = require('./routes/applications');
const documentRoutes = require('./routes/documents');
const consentRoutes = require('./routes/consents');
const digiLockerRoutes = require('./routes/digilocker');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for local Next.js and Vercel deployments
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, server-side)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in prototype for seamless staging
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production' && !req.url.startsWith('/_next')) {
    console.log(`[API ${req.method}] ${req.url}`);
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'MahaSetu Government Citizen & Admin Backend',
    state: 'Maharashtra',
    timestamp: new Date().toISOString(),
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/consents', consentRoutes);
app.use('/api/digilocker', digiLockerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start server and initialize DB connection
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n================================================================`);
    console.log(`🚀 MahaSetu Express Backend running on port ${PORT}`);
    console.log(`   Citizen API: http://localhost:${PORT}/api`);
    console.log(`   Admin API:   http://localhost:${PORT}/api/admin`);
    console.log(`   Health:      http://localhost:${PORT}/api/health`);
    console.log(`================================================================\n`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
