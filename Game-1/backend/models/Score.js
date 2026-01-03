const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  lastPlayedAt: {
    type: Date,
    default: Date.now
  },
  playDuration: {
    type: Number, // seconds
    default: 0
  }
});

module.exports = mongoose.model("Score", scoreSchema);
