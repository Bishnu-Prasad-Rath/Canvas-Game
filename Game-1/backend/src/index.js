require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 🛡️ THE FIRST BOUNCER: Strict CORS Policy
// ==========================================
// This ensures ONLY your specific frontend can talk to this API.
const allowedOrigins = [
  'http://127.0.0.1:5500', 
  'http://localhost:5500', 
  // Add your Vercel URL here if you have one!
  'https://40988640-6702-44f2-b6f0-18885e0e22eb-00-xq0l3m7wo5sk.pike.replit.dev' // 🔥 ADD THIS EXACT LINE
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true
}));

// Middleware to parse incoming JSON data from the frontend fetch() calls
app.use(express.json());

// ==========================================
// 🗄️ THE VAULT: MongoDB Connection
// ==========================================
// This pulls the secret string from your .env file
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas (The Vault)'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// ==========================================
// 🚦 ROUTES (We will hook these up next)
// ==========================================
const authRoutes = require('./routes/auth.routes');
const scoreRoutes = require('./routes/score.routes');

app.use('/api/auth', authRoutes);
app.use('/api/score', scoreRoutes);

// The "Fast Lane" Health Check (Just like you did for YT-NEO!)
app.get('/api/v1/healthCheck', (req, res) => {
  res.status(200).json({ success: true, message: "Game Server V2 is alive! 🚀" });
});

// ==========================================
// 🚀 START THE ENGINE
// ==========================================
app.listen(PORT, () => {
  console.log(`🎮 Game Backend running on port ${PORT}`);
});