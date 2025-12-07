const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Simple AI chat endpoint (using a free API or local model)
// For production, integrate with OpenAI, Anthropic, or a local LLM
router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;

    // Simple response logic (replace with actual AI integration)
    let response = '';

    if (message.toLowerCase().includes('video idea') || message.toLowerCase().includes('content idea')) {
      response = 'Here are some trending video ideas:\n1. Day in my life vlog\n2. Quick tips and tricks\n3. Behind the scenes content\n4. Challenge videos\n5. Tutorial content';
    } else if (message.toLowerCase().includes('hashtag') || message.toLowerCase().includes('tag')) {
      response = 'Try these trending hashtags: #viral #fyp #trending #foryou #explore';
    } else if (message.toLowerCase().includes('help')) {
      response = 'I can help you with:\n- Video content ideas\n- Hashtag suggestions\n- Engagement tips\n- Trending topics\nWhat would you like to know?';
    } else {
      response = `I understand you're asking about "${message}". For a full AI experience, integrate with OpenAI API or a local LLM like Ollama. This is a placeholder response.`;
    }

    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
