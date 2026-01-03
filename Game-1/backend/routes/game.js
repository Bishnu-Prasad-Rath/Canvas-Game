const express = require("express");
const auth = require("../middleware/auth");
const GameSession = require("../models/GameSession");
const Score = require("../models/Score");

const router = express.Router();

/**
 * START GAME SESSION
 */
router.post("/start", auth, async (req, res) => {
  const session = await GameSession.create({
    userId: req.userId
  });

  res.json({ sessionId: session._id });
});

/**
 * UPDATE SCORE (incremental)
 */
router.post("/update", auth, async (req, res) => {
  const { sessionId, delta } = req.body;

  if (delta < 0 || delta > 500) {
    return res.status(403).json({ error: "Cheat detected" });
  }

  const session = await GameSession.findById(sessionId);

  if (!session || session.ended) {
    return res.status(403).json({ error: "Invalid session" });
  }

  session.score += delta;
  await session.save();

  res.json({ success: true });
});

/**
 * END GAME SESSION
 */
router.post("/end", auth, async (req, res) => {
  const { sessionId } = req.body;

  const session = await GameSession.findById(sessionId);

  if (!session || session.ended) {
    return res.status(403).json({ error: "Invalid session" });
  }

  session.ended = true;
  await session.save();

  // Save best score only
  const existing = await Score.findOne({ userId: req.userId });

  if (!existing || session.score > existing.score) {
    await Score.findOneAndUpdate(
      { userId: req.userId },
      { score: session.score },
      { upsert: true }
    );
  }

  res.json({ success: true });
});

module.exports = router;
