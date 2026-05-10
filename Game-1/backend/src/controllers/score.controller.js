const User = require('../models/user.model');

exports.saveScore = async (req, res) => {
  try {
    const { score } = req.body;
    const user = await User.findById(req.userId);
    
    // Only update if the new score is higher than their previous high score
    if (score > user.highScore) {
      user.highScore = score;
      await user.save();
    }
    res.status(200).json({ success: true, highScore: user.highScore });
  } catch (err) {
    res.status(500).json({ error: "Failed to save score" });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    // Find top 10 players, sort by highest score
    const topUsers = await User.find().sort({ highScore: -1 }).limit(10);
    
    // Format the data exactly how your frontend fetch expects it
    const leaderboard = topUsers.map(user => ({
      username: user.username,
      score: user.highScore
    }));
    
    res.status(200).json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
};

exports.getMyScore = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json({ score: user.highScore });
  } catch (err) {
    res.status(500).json({ error: "Failed to load user score" });
  }
};