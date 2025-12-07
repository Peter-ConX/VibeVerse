const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Simple in-memory message store (in production, use a proper database)
const messages = {};

// Get or create conversation
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const conversationId = [req.userId, req.params.userId].sort().join('_');
    const conversation = messages[conversationId] || [];
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send message
router.post('/send', auth, async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    const conversationId = [req.userId, recipientId].sort().join('_');

    if (!messages[conversationId]) {
      messages[conversationId] = [];
    }

    const message = {
      id: Date.now().toString(),
      senderId: req.userId,
      recipientId,
      text,
      timestamp: new Date(),
    };

    messages[conversationId].push(message);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

