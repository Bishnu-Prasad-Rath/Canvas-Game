const mongoose = require("mongoose");

const gameSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  ended: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("GameSession", gameSessionSchema);
