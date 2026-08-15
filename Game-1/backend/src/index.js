require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 🛡️ Global CORS & Preflight Handler
// ==========================================
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Terminate preflight OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// Fast favicon bypass
app.get('/favicon.ico', (req, res) => res.status(204).end());

// ==========================================
// 🗄️ Serverless MongoDB Connection Cache
// ==========================================
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not defined.');
    }

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log('✅ Connected to MongoDB Atlas');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Middleware to ensure DB connection before executing routes
app.use(async (req, res, next) => {
  if (req.path === '/favicon.ico' || req.path === '/api/v1/healthCheck') return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ Database connection failed during request:', err.message);
    return res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

// ==========================================
// 🚦 Routes
// ==========================================
const authRoutes = require('./routes/auth.routes');
const scoreRoutes = require('./routes/score.routes');

app.use('/api/auth', authRoutes);
app.use('/api/score', scoreRoutes);

// Health check
app.get('/api/v1/healthCheck', (req, res) => {
  res.status(200).json({ success: true, message: "Game Server is alive! 🚀" });
});

// Root fallback route
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: "Backend API is active" });
});

// ==========================================
// 🚀 Export for Vercel / Local Dev
// ==========================================
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🎮 Game Backend running locally on http://localhost:${PORT}`);
  });
}

module.exports = app;