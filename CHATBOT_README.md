# 🤖 LOKAWAZ Chatbot Integration

## Overview
The LOKAWAZ platform now includes an intelligent AI chatbot powered by Groq's fast inference API. The chatbot helps users navigate the platform, understand how to report issues, and provides context-aware assistance.

## Features

### 🎯 **Context-Aware Responses**
- Provides different suggestions based on current page (Dashboard, New Issue, Issue Details, etc.)
- Understands the civic issue tracking domain
- Gives relevant help for each section of the platform

### 💬 **Interactive Chat Interface**
- Floating chat button in bottom-right corner
- Clean, professional chat window
- Minimize/maximize functionality
- Message history with timestamps
- Quick suggestion buttons
- Loading indicators and error handling

### 🚀 **Smart Features**
- **Real-time responses** using Groq's fast LLaMA model
- **Conversation memory** maintains context across messages
- **Quick suggestions** based on current page context
- **Error recovery** with user-friendly error messages
- **Clear chat** functionality to start fresh

## Setup Instructions

### 1. Get Groq API Key
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up or log in to your account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy the API key

### 2. Configure Environment
1. Open `client/.env` file
2. Replace `your_groq_api_key_here` with your actual API key:
   ```
   VITE_GROQ_API_KEY=gsk_your_actual_api_key_here
   ```
3. Save the file

### 3. Restart Development Server
```bash
cd client
npm run dev
```

## Usage

### 🎈 **Opening the Chat**
- Click the blue chat bubble icon in the bottom-right corner
- The chatbot will greet you with context-specific suggestions

### 💡 **What the Chatbot Can Help With**
- **Navigation**: "How do I report an issue?"
- **Process**: "What happens after I submit an issue?"
- **Categories**: "What types of issues can I report?"
- **Status**: "How do I check my issue status?"
- **Platform**: "How does LOKAWAZ work?"
- **Account**: "How do I register or login?"

### 🎯 **Context-Aware Suggestions**
The chatbot provides different suggestions based on where you are:

**Dashboard Page:**
- "How do I view my reported issues?"
- "What do the status colors mean?"
- "How do I edit my issue?"

**New Issue Page:**
- "How do I add photos to my report?"
- "What priority should I set?"
- "How do I set the location?"

**Issue Details Page:**
- "How can I track this issue?"
- "Can I add more information?"
- "How do I share this issue?"

## Technical Details

### 🏗️ **Architecture**
- **Frontend**: React component with real-time chat interface
- **AI Service**: Groq API with LLaMA 3 8B model
- **Context Detection**: React Router location-based context
- **State Management**: Local state with conversation history

### 📦 **Components**
- `components/Chatbot.jsx` - Main chat interface
- `services/chatbotService.js` - Groq API integration
- Context-aware prompt engineering for civic domain

### ⚡ **Performance**
- **Fast Responses**: Groq's inference speed (~100-500ms)
- **Efficient Model**: LLaMA 3 8B optimized for speed
- **Smart Caching**: Conversation history for context
- **Debounced Input**: Smooth typing experience

## Customization

### 🎨 **Styling**
The chatbot uses Tailwind CSS classes and can be customized by modifying:
- `components/Chatbot.jsx` - Component styling
- Colors, sizes, positioning can be adjusted

### 🤖 **Bot Personality**
The chatbot's responses can be customized by modifying:
- `services/chatbotService.js` - System prompt and context
- Add domain-specific knowledge
- Adjust tone and personality

### 🔧 **Features**
Additional features can be added:
- Integration with user data
- Issue status lookups
- Multi-language support
- Voice input/output

## Cost Considerations

### 💰 **Groq Pricing** (as of 2025)
- Very cost-effective compared to other AI APIs
- Pay per request model
- Free tier available for development
- Production costs scale with usage

### 📊 **Usage Optimization**
- Conversation history limited to last 10 messages
- 500 token max response length
- Context-aware prompts reduce unnecessary tokens
- Efficient error handling prevents wasted requests

## Future Enhancements

### 🚀 **Planned Features**
1. **Issue Status Integration** - Query specific issue status
2. **Multi-language Support** - Local language responses
3. **Voice Interface** - Speech-to-text and text-to-speech
4. **Admin Integration** - Help with admin tasks
5. **Analytics** - Chat usage and effectiveness metrics

### 🎯 **Advanced Capabilities**
1. **Smart Issue Classification** - Auto-categorize user reports
2. **Predictive Suggestions** - Suggest solutions based on issue type
3. **Community Integration** - Connect users with similar issues
4. **Notification Integration** - Proactive status updates

## Troubleshooting

### 🔧 **Common Issues**

**Chatbot not responding:**
- Check if Groq API key is correctly set in `.env`
- Verify internet connection
- Check browser console for errors

**Slow responses:**
- Normal for first request (cold start)
- Subsequent requests should be fast
- Check Groq service status

**Context not working:**
- Ensure React Router is properly set up
- Check if page detection is working in browser dev tools

## Security & Privacy

### 🔒 **Data Handling**
- Conversations are not stored on servers
- API key is client-side (consider server-side for production)
- No personal information sent to Groq without user consent
- Chat history cleared on page refresh

### 🛡️ **Best Practices**
- Keep API keys secure
- Implement rate limiting for production
- Consider server-side proxy for API calls
- Monitor usage and costs

---

The chatbot enhances user experience by providing instant, context-aware help throughout the LOKAWAZ platform, making it easier for citizens to report and track civic issues effectively! 🏛️✨
