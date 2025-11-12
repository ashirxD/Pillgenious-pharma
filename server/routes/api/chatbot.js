const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const getServerSession = require('../../middleware/serverSession');
const ChatMessage = require('../../models/ChatMessage');

// Initialize OpenAI client
const OPEN_AI_KEY = process.env.OPEN_AI_KEY;
if (!OPEN_AI_KEY) {
  console.error('Warning: OPEN_AI_KEY is not set in environment variables');
}

const openai = OPEN_AI_KEY ? new OpenAI({ apiKey: OPEN_AI_KEY }) : null;

// System prompt for medical assistant (optimized for token efficiency)
const SYSTEM_PROMPT = `Medical AI assistant. Analyze symptoms/diseases, suggest generic medications with dosages, provide treatment instructions and safety warnings. Include disclaimers: "This is educational only, not medical advice. Consult a healthcare provider before taking medication. Seek emergency care for serious symptoms." Be concise, empathetic, and recommend professional consultation when needed.`;

// POST /api/chatbot/message
router.post('/message', getServerSession, async (req, res, next) => {
  try {
    const { message } = req.body;
    const userId = req.user._id || req.user.id;

    // Validate input
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required and must be a non-empty string' });
    }

    // Check if OpenAI is configured
    if (!openai) {
      return res.status(500).json({ 
        error: 'Chatbot service is not available. Please contact support.' 
      });
    }

    // Get recent chat history for context (last 10 messages) BEFORE saving new message
    const recentMessages = await ChatMessage.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('role content')
      .lean();

    // Reverse to get chronological order
    recentMessages.reverse();

    // Save user message to database
    const userMessage = new ChatMessage({
      user: userId,
      role: 'user',
      content: message.trim()
    });
    await userMessage.save();

    // Build messages array for OpenAI (include system prompt + recent history + new message)
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add recent conversation history
    recentMessages.forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add current user message
    messages.push({ role: 'user', content: message.trim() });

    // Call OpenAI API - Using gpt-4o-mini for best cost/performance balance
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.6,
      max_tokens: 400
    });

    // Extract response
    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return res.status(500).json({ 
        error: 'Failed to generate response. Please try again.' 
      });
    }

    // Save assistant response to database
    const assistantMessage = new ChatMessage({
      user: userId,
      role: 'assistant',
      content: response
    });
    await assistantMessage.save();

    // Return the response
    res.json({ response });

  } catch (error) {
    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error:', error.message);
      
      if (error.status === 401) {
        return res.status(500).json({ 
          error: 'Chatbot service configuration error. Please contact support.' 
        });
      } else if (error.status === 429) {
        return res.status(429).json({ 
          error: 'Chatbot service is temporarily unavailable due to high demand. Please try again in a moment.' 
        });
      } else if (error.status === 500) {
        return res.status(500).json({ 
          error: 'Chatbot service encountered an error. Please try again later.' 
        });
      }
      
      return res.status(500).json({ 
        error: 'An error occurred while processing your request. Please try again.' 
      });
    }

    // Handle other errors
    console.error('Chatbot error:', error);
    next(error);
  }
});

// GET /api/chatbot/history - Get chat history for authenticated user
router.get('/history', getServerSession, async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const limit = parseInt(req.query.limit) || 50; // Default to last 50 messages
    const skip = parseInt(req.query.skip) || 0;

    // Get chat messages for the user
    const messages = await ChatMessage.find({ user: userId })
      .sort({ createdAt: 1 }) // Chronological order
      .limit(limit)
      .skip(skip)
      .select('role content createdAt')
      .lean();

    // Format messages for frontend
    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.createdAt
    }));

    res.json({ messages: formattedMessages, total: formattedMessages.length });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    next(error);
  }
});

// DELETE /api/chatbot/history - Clear chat history for authenticated user
router.delete('/history', getServerSession, async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    // Delete all chat messages for the user
    const result = await ChatMessage.deleteMany({ user: userId });

    res.json({ 
      message: 'Chat history cleared successfully',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    next(error);
  }
});

module.exports = router;

