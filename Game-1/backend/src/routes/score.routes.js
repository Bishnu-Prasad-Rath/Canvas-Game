const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/score.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/leaderboard', scoreController.getLeaderboard); // Public
router.post('/', authMiddleware, scoreController.saveScore); // Protected (Needs Login)
router.get('/me', authMiddleware, scoreController.getMyScore); // Protected (Needs Login)

module.exports = router;