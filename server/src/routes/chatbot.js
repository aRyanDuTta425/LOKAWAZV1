const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for chatbot endpoints
const chatbotLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per IP
  message: {
    success: false,
    message: 'Too many chatbot requests. Please try again later.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all chatbot routes
router.use(chatbotLimiter);

// @route   POST /api/chatbot/message
// @desc    Send message to AI chatbot
// @access  Public (but rate limited)
router.post('/message', chatbotController.sendMessage);

// @route   GET /api/chatbot/health
// @desc    Check chatbot service health
// @access  Public
router.get('/health', chatbotController.healthCheck);

module.exports = router;
