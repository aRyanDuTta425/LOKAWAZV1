# LOKAWAZ Chatbot Integration (Secure Backend Implementation)

## Overview

LOKAWAZ now includes an AI-powered chatbot that provides real-time assistance to users navigating the civic issue tracking platform. The chatbot is built with security in mind, using backend API calls to protect sensitive API keys.

## Features

- **Context-Aware Assistance**: Provides relevant help based on the current page
- **Conversation Memory**: Maintains conversation history for better context
- **Smart Suggestions**: Offers relevant quick-reply options for each page
- **Secure Implementation**: API keys are securely stored on the backend
- **Rate Limited**: Prevents abuse with intelligent rate limiting
- **Error Handling**: Graceful fallbacks for service disruptions

## Technical Architecture

### Backend Integration (Secure)
- **API Endpoint**: `/api/chatbot/message`
- **Authentication**: No authentication required (rate limited)
- **Model**: LLaMA 3 8B (via Groq API)
- **Security**: API keys stored securely on server

### Frontend Components
- **Chatbot.jsx**: Main chat interface with minimize/maximize
- **chatbotService.js**: Service layer for backend communication
- **Context Detection**: Automatic page context for relevant responses

## Setup Instructions

### 1. Backend Configuration (Required)

Add your Groq API key to the server environment:

```bash
# In server/.env file
GROQ_API_KEY=your_actual_groq_api_key_here
```

### 2. Get Groq API Key

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up or log in to your account
3. Navigate to the "API Keys" section
4. Create a new API key
5. Copy the generated key
6. Add it to your `server/.env` file

### 3. Restart Backend Server

After adding the API key, restart your backend server:

```bash
cd server
npm run dev
# or
npm start
```

### 4. Verify Setup

The chatbot will automatically check backend connectivity. You can verify the setup by:

1. Opening the application
2. Clicking the blue chat bubble in the bottom-right corner
3. Sending a test message

## Usage

### User Interface

- **Chat Bubble**: Blue floating button in bottom-right corner
- **Minimize/Maximize**: Click the header to toggle chat window
- **Quick Suggestions**: Tap suggested responses for common questions
- **Context Awareness**: Gets help relevant to current page

### For Users

The chatbot can help with:
- Reporting new issues
- Understanding platform features
- Navigating different sections
- Account-related questions
- Issue status explanations
- Best practices for civic reporting

### Page-Specific Context

The chatbot provides relevant assistance based on where you are:

- **Home**: Platform overview and getting started
- **New Issue**: Help with reporting process and form fields
- **Issue Details**: Understanding status updates and tracking
- **Dashboard**: Managing your reports and account
- **Login/Register**: Account access and security
- **Admin Panel**: Administrative functions and moderation

## API Endpoints

### POST /api/chatbot/message
Send a message to the chatbot

**Request Body:**
```json
{
  "message": "How do I report a new issue?",
  "conversationHistory": [],
  "pageContext": "home"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "To report a new issue, click the 'Report Issue' button...",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/chatbot/health
Check chatbot service status

**Response:**
```json
{
  "success": true,
  "data": {
    "configured": true,
    "status": "ready",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Security Features

- **No Frontend API Keys**: All sensitive keys stored on backend
- **Rate Limiting**: 20 requests per minute per IP
- **Input Validation**: Message content validated and sanitized
- **Error Handling**: Secure error messages without exposing internals
- **CORS Protection**: Restricted to authorized domains

## Rate Limits

- **Messages**: 20 per minute per IP address
- **Health Checks**: No rate limit
- **Automatic Retry**: Built-in exponential backoff for failed requests

## Troubleshooting

### Chatbot Not Responding

1. **Check Backend Status**: Ensure server is running on port 8000
2. **Verify API Key**: Check that `GROQ_API_KEY` is set in `server/.env`
3. **Check Logs**: Look at server logs for error messages
4. **Test Health Endpoint**: Visit `http://localhost:8000/api/chatbot/health`

### Common Error Messages

- **"Chatbot service is not configured"**: Missing or invalid Groq API key
- **"Too many requests"**: Rate limit exceeded, wait and try again
- **"Service temporarily unavailable"**: Groq API issues or server problems
- **"Unable to connect"**: Network connectivity issues

### Backend Logs

Monitor server logs for chatbot-related messages:

```bash
cd server
npm run dev
# Watch for chatbot controller logs
```

## Development

### Testing the Integration

1. Start both servers:
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm run dev
```

2. Test the chatbot functionality
3. Monitor network requests in browser DevTools
4. Check server logs for API calls

### Extending the Chatbot

To add new features:

1. **Backend**: Update `chatbotController.js` for new endpoints
2. **Frontend**: Modify `chatbotService.js` for new client methods
3. **UI**: Enhance `Chatbot.jsx` for interface changes
4. **Context**: Add new page contexts in `getContextPrompt()`

## Performance Considerations

- **Response Time**: Typically 1-3 seconds for LLaMA responses
- **Token Limits**: Responses capped at 1000 tokens for performance
- **Memory Usage**: Conversation history limited to prevent memory issues
- **Caching**: Service health status cached for 5 minutes

## Privacy & Data Handling

- **No Data Storage**: Conversations are not permanently stored
- **Temporary Processing**: Messages processed in memory only
- **No Personal Info**: Avoid sharing sensitive personal information
- **Platform Context Only**: Chatbot focuses on platform assistance

## Support

For issues with the chatbot:

1. Check this documentation
2. Verify server configuration
3. Test API connectivity
4. Review error logs
5. Contact technical support if problems persist

---

The chatbot enhances user experience by providing instant, context-aware assistance throughout the LOKAWAZ platform, helping citizens effectively report and track civic issues in their communities.
