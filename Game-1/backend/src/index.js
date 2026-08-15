require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 🛡️ CORS & Parsers
// ==========================================
// Allow all origins during setup, or specify your Vercel frontend URL
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ==========================================
// 🗄️ Database Connection
// ==========================================
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));
} else {
  console.warn('⚠️ MONGODB_URI environment variable is missing.');
}

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
// 🚀 Export for Vercel / Run Locally
// ==========================================
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🎮 Game Backend running locally on http://localhost:${PORT}`);
  });
}

module.exports = app;