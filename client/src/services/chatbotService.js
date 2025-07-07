import api from '../utils/api';

class ChatbotService {
  constructor() {
    this.isHealthy = false;
    this.lastHealthCheck = null;
    this.healthCheckInterval = 5 * 60 * 1000; // 5 minutes
  }

  // Send message to chatbot via backend
  async sendMessage(message, conversationHistory = [], currentPage = 'general') {
    console.log('🔄 ChatbotService.sendMessage called with:', { message, currentPage });
    console.log('🌐 API Base URL:', api.defaults.baseURL);
    
    try {
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        throw new Error('Message cannot be empty');
      }

      // Check service health if needed
      console.log('� Ensuring health...');
      await this.ensureHealthy();

      const requestData = {
        message: message.trim(),
        conversationHistory: conversationHistory.map(msg => ({
          message: msg.content || msg.message,
          isUser: msg.role === 'user'
        })),
        pageContext: currentPage
      };

      console.log('🚀 Making API request to /chatbot/message with data:', requestData);
      
      const response = await api.post('/chatbot/message', requestData);

      console.log('✅ API response received:', response);

      // Since axios interceptor returns response.data directly, response IS the data object
      if (response && response.success) {
        console.log('✅ Success response, extracting message:', response.data);
        return {
          success: true,
          message: response.data.response,
          timestamp: response.data.timestamp
        };
      } else {
        console.log('❌ Response not successful:', response);
        throw new Error(response?.message || 'Failed to get response from chatbot');
      }
    } catch (error) {
      console.error('Chatbot service error:', error);
      
      let errorMessage = 'Sorry, I\'m having trouble responding right now. Please try again later.';
      
      // Handle different types of errors
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 429:
            errorMessage = 'I\'m receiving too many requests. Please wait a moment and try again.';
            break;
          case 503:
            errorMessage = data?.message || 'Chatbot service is temporarily unavailable.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = data?.message || 'Failed to send message. Please try again.';
        }
      } else if (error.request) {
        errorMessage = 'Unable to connect to chatbot service. Please check your internet connection.';
      }

      return {
        success: false,
        message: errorMessage,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Check chatbot service health
  async checkHealth() {
    console.log('🔍 Checking chatbot health...');
    try {
      const response = await api.get('/chatbot/health');
      console.log('✅ Health check response:', response);
      
      if (response.data && response.data.success) {
        this.isHealthy = response.data.data.configured && response.data.data.status === 'ready';
        this.lastHealthCheck = Date.now();
        return response.data.data;
      } else {
        this.isHealthy = false;
        return {
          configured: false,
          status: 'error',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Chatbot health check error:', error);
      this.isHealthy = false;
      return {
        configured: false,
        status: 'error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Ensure service is healthy before making requests
  async ensureHealthy() {
    const now = Date.now();
    const needsHealthCheck = !this.lastHealthCheck || 
                            (now - this.lastHealthCheck) > this.healthCheckInterval;
    
    if (needsHealthCheck) {
      await this.checkHealth();
    }
    
    return this.isHealthy;
  }

  // Get context-specific prompts
  getContextPrompt(currentPage) {
    const contexts = {
      'dashboard': 'The user is currently on their dashboard where they can view all their reported issues, see issue statuses, and manage their reports.',
      'new-issue': 'The user is on the "Report New Issue" page where they can create a new civic issue report with photos, location, and details.',
      'issue-details': 'The user is viewing details of a specific issue, including photos, location on map, status updates, and comments.',
      'login': 'The user is on the login page trying to access their account.',
      'register': 'The user is on the registration page trying to create a new account.',
      'home': 'The user is on the homepage learning about the platform and its features.',
      'admin': 'The user is on the admin panel where they can manage issues, view statistics, and moderate content.',
      'general': 'The user is browsing the platform.'
    };

    return contexts[currentPage] || contexts.general;
  }

  // Get suggested quick responses based on context
  getSuggestedResponses(context = 'general') {
    const suggestions = {
      general: [
        "How do I report an issue?",
        "What types of issues can I report?",
        "How do I check my issue status?",
        "How does the platform work?"
      ],
      newIssue: [
        "How do I add photos to my report?",
        "What priority should I set?",
        "How do I set the location?",
        "What category should I choose?"
      ],
      dashboard: [
        "How do I view my reported issues?",
        "What do the status colors mean?",
        "How do I edit my issue?",
        "When will my issue be resolved?"
      ],
      map: [
        "How do I view issues on the map?",
        "What do the different markers mean?",
        "How do I report an issue from the map?",
        "Can I see all issues in my area?"
      ],
      'new-issue': [
        "How do I add photos to my report?",
        "What priority should I set?",
        "How do I set the location?",
        "What category should I choose?"
      ],
      'issue-details': [
        "How do I track issue progress?",
        "What do the status updates mean?",
        "Can I add more information?",
        "How long does resolution take?"
      ],
      login: [
        "I forgot my password",
        "How do I create an account?",
        "Why can't I log in?",
        "Is my data secure?"
      ],
      register: [
        "What information do I need?",
        "How do I verify my account?",
        "Is registration free?",
        "What can I do after registering?"
      ],
      admin: [
        "How do I manage reports?",
        "How do I update issue status?",
        "How do I moderate content?",
        "How do I view analytics?"
      ]
    };

    return suggestions[context] || suggestions.general;
  }

  // Get welcome message
  getWelcomeMessage() {
    return {
      message: "👋 Hi! I'm your LOKAWAZ Assistant. I'm here to help you navigate the platform and report civic issues effectively. How can I assist you today?",
      suggestions: this.getSuggestedResponses('general')
    };
  }
}

export default new ChatbotService();
