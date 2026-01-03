const express = require("express");
const Score = require("../models/Score");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * SAVE SCORE (protected)
 */
router.post("/", auth, async (req, res) => {
  let { score } = req.body;
  score = Number(score);

  if (Number.isNaN(score)) {
    return res.status(400).json({ error: "Invalid score" });
  }

  const MAX_SCORE = 100000;
  if (score < 0 || score > MAX_SCORE) {
    return res.status(403).json({ error: "Cheat detected" });
  }

  const existing = await Score.findOne({ userId: req.userId });

  if (existing) {
    if (score > existing.score) {
      existing.score = score;
      existing.lastPlayedAt = new Date();
      await existing.save();
    }
    return res.json({ success: true });
  }

  await Score.create({
    userId: req.userId,
    score,
    lastPlayedAt: new Date()
  });

  res.json({ success: true });
});





/**
 * GET LEADERBOARD (public)
 */
router.get("/leaderboard", async (req, res) => {
  const leaderboard = await Score.find()
    .sort({ score: -1 })
    .limit(10)
    .populate("userId", "username");

  const formatted = leaderboard.map(item => ({
    username: item.userId.username,
    score: item.score
  }));

  res.json(formatted);
});

module.exports = router;
