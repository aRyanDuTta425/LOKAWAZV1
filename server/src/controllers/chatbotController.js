const Groq = require('groq-sdk');
const { successResponse, errorResponse } = require('../utils/response');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const chatbotController = {
  // Send message to Groq API
  async sendMessage(req, res) {
    console.log('📨 Received chatbot request');
    try {
      const { message, conversationHistory = [], pageContext } = req.body;

      if (!message || typeof message !== 'string') {
        console.log('❌ Invalid message');
        return errorResponse(res, 'Message is required and must be a string', 400);
      }

      if (!process.env.GROQ_API_KEY) {
        console.log('❌ No API key');
        return errorResponse(res, 'Chatbot service is not configured. Please contact administrator.', 503);
      }

      console.log('🔄 Processing message:', message.substring(0, 50) + '...');

      // Generate context-aware system prompt
      const systemPrompt = getContextPrompt(pageContext);

      // Prepare messages for Groq API
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        // Add conversation history
        ...conversationHistory.map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.message
        })),
        // Add current message
        {
          role: 'user',
          content: message
        }
      ];

      // Call Groq API
      console.log('🚀 Calling Groq API...');
      const completion = await groq.chat.completions.create({
        messages,
        model: 'llama3-8b-8192',
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9,
        stream: false,
      });

      console.log('✅ Got response from Groq');
      const response = completion.choices[0]?.message?.content;

      if (!response) {
        console.log('❌ Empty response from Groq');
        return errorResponse(res, 'No response received from AI service', 500);
      }

      console.log('📤 Sending response to frontend');
      return successResponse(res, {
        response,
        timestamp: new Date().toISOString()
      }, 'Message sent successfully');

    } catch (error) {
      console.error('Chatbot error:', error);
      
      // Handle specific Groq API errors
      if (error.status === 401) {
        return errorResponse(res, 'AI service authentication failed. Please contact administrator.', 503);
      } else if (error.status === 429) {
        return errorResponse(res, 'AI service rate limit exceeded. Please try again later.', 429);
      } else if (error.status >= 500) {
        return errorResponse(res, 'AI service is temporarily unavailable. Please try again later.', 503);
      }

      return errorResponse(res, 'Failed to process message. Please try again.', 500);
    }
  },

  // Health check for chatbot service
  async healthCheck(req, res) {
    try {
      const hasApiKey = !!process.env.GROQ_API_KEY;
      
      return successResponse(res, {
        configured: hasApiKey,
        status: hasApiKey ? 'ready' : 'not_configured',
        timestamp: new Date().toISOString()
      }, 'Chatbot service status');
    } catch (error) {
      console.error('Chatbot health check error:', error);
      return errorResponse(res, 'Health check failed', 500);
    }
  }
};

// Generate context-aware prompts based on current page
function getContextPrompt(pageContext) {
  const basePrompt = `You are a helpful AI assistant for Lok Awaaz, a civic issue tracking platform. 
You help users navigate the platform, understand features, and resolve civic issues in their community.

Key platform features:
- Report civic issues with photos and location
- View and track issue status
- Search and filter issues by location/category
- Admin panel for issue management
- Real-time updates and notifications

Be helpful, concise, and friendly. Focus on civic engagement and community improvement.`;

  // Add page-specific context
  switch (pageContext) {
    case 'home':
      return `${basePrompt}

Current page: Home Dashboard
Help users understand how to:
- View recent issues in their area
- Navigate to report new issues
- Use the map to explore local problems
- Understand issue categories and priorities`;

    case 'new-issue':
      return `${basePrompt}

Current page: Report New Issue
Help users with:
- Filling out the issue form properly
- Adding clear photos and descriptions
- Selecting accurate locations and addresses
- Choosing appropriate categories
- Understanding what makes a good issue report`;

    case 'issue-details':
      return `${basePrompt}

Current page: Issue Details
Help users understand:
- How to view issue information and status
- How to interpret the location and map
- How to track issue progress
- How the resolution process works`;

    case 'login':
      return `${basePrompt}

Current page: Login
Help users with:
- Login process and requirements
- Account security best practices
- Troubleshooting login issues
- Understanding user roles and permissions`;

    case 'register':
      return `${basePrompt}

Current page: Registration
Help users with:
- Creating new accounts
- Understanding registration requirements
- Setting up secure passwords
- Getting started with the platform`;

    case 'dashboard':
      return `${basePrompt}

Current page: User Dashboard
Help users understand:
- How to view their reported issues
- How to track issue status and updates
- How to manage their profile
- How to efficiently use dashboard features`;

    case 'admin':
      return `${basePrompt}

Current page: Admin Panel
Help administrators with:
- Managing and moderating issues
- Understanding admin tools and controls
- User management and oversight
- Platform administration best practices`;

    default:
      return basePrompt;
  }
}

module.exports = chatbotController;
