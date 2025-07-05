// src/services/issueService.js
import api from '../utils/api';

class IssueService {
  // Create new issue
  async createIssue(issueData) {
    try {
      const response = await api.post('/issues', issueData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get all issues with optional filters
  async getIssues(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filters if provided
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const queryString = params.toString();
      const url = queryString ? `/issues?${queryString}` : '/issues';
      
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get issue by ID
  async getIssueById(id) {
    try {
      const response = await api.get(`/issues/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update issue
  async updateIssue(id, updateData) {
    try {
      const response = await api.put(`/issues/${id}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete issue
  async deleteIssue(id) {
    try {
      const response = await api.delete(`/issues/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get nearby issues
  async getNearbyIssues(latitude, longitude, radius = 5) {
    try {
      const response = await api.get(`/issues/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get user's issues
  async getUserIssues(userId) {
    try {
      const response = await api.get(`/issues?userId=${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get comments for an issue (placeholder until backend implements it)
  async getIssueComments(issueId) {
    console.log('Comment functionality not implemented in backend yet');
    return { success: true, data: [] };
  }

  // Add comment to an issue (placeholder until backend implements it)
  async addComment(issueId, commentData) {
    console.log('Comment functionality not implemented in backend yet');
    return { success: true, message: 'Comment functionality coming soon!' };
  }

  // Update comment (placeholder until backend implements it)
  async updateComment(issueId, commentId, commentData) {
    console.log('Comment functionality not implemented in backend yet');
    return { success: true, message: 'Comment functionality coming soon!' };
  }

  // Delete comment (placeholder until backend implements it)
  async deleteComment(issueId, commentId) {
    console.log('Comment functionality not implemented in backend yet');
    return { success: true, message: 'Comment functionality coming soon!' };
  }

  // Like/Unlike an issue (placeholder until backend implements it)
  async toggleLike(issueId) {
    console.log('Like functionality not implemented in backend yet');
    return { success: true, message: 'Like functionality coming soon!' };
  }

  // Update issue status (admin only)
  async updateIssueStatus(issueId, status) {
    try {
      const response = await api.patch(`/issues/${issueId}/status`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new IssueService();