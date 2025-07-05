# 🔌 LOKAWAZ API Specification
**Frontend-Backend Synchronization Guide**

---

## 📋 Table of Contents
1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Base Configuration](#base-configuration)
4. [User Management](#user-management)
5. [Issue Management](#issue-management)
6. [Comments System](#comments-system)
7. [File Upload](#file-upload)
8. [Admin Operations](#admin-operations)
9. [Error Handling](#error-handling)
10. [Data Models](#data-models)

---

## 🌐 API Overview

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Content Type
All requests should include:
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### Response Format
All responses follow this structure:
```json
{
  "success": true,
  "message": "Success message",
  "data": {},
  "error": null,
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## 🔐 Authentication

### 1. User Registration
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### 2. User Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    },
    "token": "jwt_token_here"
  }
}
```

### 3. Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### 4. Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

---

## 👤 User Management

### 1. Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

### 2. Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

### 3. Change Password
```http
PUT /api/users/change-password
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

---

## 📋 Issue Management

### 1. Get All Issues (Public)
```http
GET /api/issues
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status
- `category`: Filter by category
- `priority`: Filter by priority
- `search`: Search in title/description

**Response:**
```json
{
  "success": true,
  "data": {
    "issues": [
      {
        "id": "issue_id",
        "title": "Broken Street Light",
        "description": "Street light on Main St is not working",
        "category": "INFRASTRUCTURE",
        "status": "REPORTED",
        "priority": "MEDIUM",
        "location": "123 Main St, City",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "images": [
          {
            "url": "https://cloudinary.com/image1.jpg",
            "publicId": "image_public_id"
          }
        ],
        "user": {
          "id": "user_id",
          "name": "John Doe"
        },
        "likesCount": 5,
        "commentsCount": 3,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2. Get Issue by ID
```http
GET /api/issues/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "issue_id",
    "title": "Broken Street Light",
    "description": "Street light on Main St is not working",
    "category": "INFRASTRUCTURE",
    "status": "REPORTED",
    "priority": "MEDIUM",
    "location": "123 Main St, City",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "images": [...],
    "user": {...},
    "likesCount": 5,
    "isLikedByUser": false,
    "commentsCount": 3,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### 3. Create New Issue
```http
POST /api/issues
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
title: "Broken Street Light"
description: "Street light on Main St is not working"
category: "INFRASTRUCTURE"
priority: "MEDIUM"
location: "123 Main St, City"
latitude: 40.7128
longitude: -74.0060
images: [File, File] // Multiple image files
```

**Response:**
```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": "new_issue_id",
    "title": "Broken Street Light",
    ...
  }
}
```

### 4. Update Issue
```http
PUT /api/issues/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "category": "INFRASTRUCTURE",
  "priority": "HIGH"
}
```

### 5. Delete Issue
```http
DELETE /api/issues/:id
Authorization: Bearer <token>
```

### 6. Update Issue Status (Admin/Moderator only)
```http
PATCH /api/issues/:id/status
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

### 7. Like/Unlike Issue
```http
POST /api/issues/:id/like
Authorization: Bearer <token>
```

```http
DELETE /api/issues/:id/like
Authorization: Bearer <token>
```

### 8. Get User's Issues
```http
GET /api/issues/my-issues
Authorization: Bearer <token>
```

---

## 💬 Comments System

### 1. Get Issue Comments
```http
GET /api/issues/:id/comments
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "comment_id",
      "content": "This issue affects my daily commute",
      "user": {
        "id": "user_id",
        "name": "Jane Smith"
      },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Add Comment
```http
POST /api/issues/:id/comments
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "This issue affects my daily commute"
}
```

### 3. Update Comment
```http
PUT /api/comments/:id
Authorization: Bearer <token>
```

### 4. Delete Comment
```http
DELETE /api/comments/:id
Authorization: Bearer <token>
```

---

## 📁 File Upload

### 1. Upload Images (Cloudinary)
```http
POST /api/upload/images
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
images: [File, File] // Multiple files
```

**Response:**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "url": "https://cloudinary.com/image1.jpg",
        "publicId": "image_public_id",
        "width": 1920,
        "height": 1080
      }
    ]
  }
}
```

---

## 🔧 Admin Operations

### 1. Get Dashboard Stats
```http
GET /api/admin/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalIssues": 150,
    "pendingIssues": 45,
    "resolvedIssues": 95,
    "totalUsers": 320,
    "issuesByCategory": {
      "INFRASTRUCTURE": 45,
      "ENVIRONMENT": 30,
      "SAFETY": 25,
      "UTILITIES": 50
    },
    "issuesByStatus": {
      "REPORTED": 20,
      "UNDER_REVIEW": 15,
      "IN_PROGRESS": 10,
      "RESOLVED": 95,
      "CLOSED": 10
    },
    "recentActivity": [...]
  }
}
```

### 2. Get All Users (Admin only)
```http
GET /api/admin/users
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "issuesCount": 5,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "lastLogin": "2025-01-02T00:00:00.000Z"
    }
  ]
}
```

### 3. Update User Role
```http
PUT /api/admin/users/:id/role
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "role": "MODERATOR"
}
```

### 4. Get All Issues (Admin view)
```http
GET /api/admin/issues
Authorization: Bearer <token>
```

---

## ⚠️ Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "VALIDATION_ERROR",
  "details": {
    "field": "email",
    "message": "Email is required"
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Common Error Codes
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

### Error Types
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Invalid credentials
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND_ERROR`: Resource not found
- `DUPLICATE_ERROR`: Resource already exists
- `RATE_LIMIT_ERROR`: Too many requests

---

## 📊 Data Models

### User Model
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hashed
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Issue Model
```typescript
interface Issue {
  id: string;
  title: string;
  description: string;
  category: 'INFRASTRUCTURE' | 'ENVIRONMENT' | 'SAFETY' | 'UTILITIES' | 'OTHER';
  status: 'REPORTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  location?: string;
  latitude?: number;
  longitude?: number;
  images: ImageUpload[];
  userId: string;
  user: User;
  likes: Like[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Comment Model
```typescript
interface Comment {
  id: string;
  content: string;
  userId: string;
  user: User;
  issueId: string;
  issue: Issue;
  createdAt: Date;
  updatedAt: Date;
}
```

### Image Upload Model
```typescript
interface ImageUpload {
  id: string;
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
  issueId?: string;
  userId?: string;
  createdAt: Date;
}
```

---

## 🔌 Frontend Service Implementation

### API Service (utils/api.js)
```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
```

### Auth Service
```javascript
import api from '../utils/api';

const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async getCurrentUser() {
    return await api.get('/auth/me');
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

export default authService;
```

### Issue Service
```javascript
import api from '../utils/api';

const issueService = {
  async getAllIssues(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/issues?${queryString}`);
  },

  async getIssueById(id) {
    return await api.get(`/issues/${id}`);
  },

  async createIssue(formData) {
    return await api.post('/issues', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  async updateIssue(id, data) {
    return await api.put(`/issues/${id}`, data);
  },

  async deleteIssue(id) {
    return await api.delete(`/issues/${id}`);
  },

  async updateIssueStatus(id, status) {
    return await api.patch(`/issues/${id}/status`, { status });
  },

  async likeIssue(id) {
    return await api.post(`/issues/${id}/like`);
  },

  async unlikeIssue(id) {
    return await api.delete(`/issues/${id}/like`);
  },

  async getIssueComments(id) {
    return await api.get(`/issues/${id}/comments`);
  },

  async addComment(id, content) {
    return await api.post(`/issues/${id}/comments`, { content });
  },

  async getMyIssues() {
    return await api.get('/issues/my-issues');
  },

  async getStats() {
    return await api.get('/admin/stats');
  }
};

export default issueService;
```

---

## 🚀 Implementation Checklist

### Backend Requirements
- [ ] Express.js server setup
- [ ] PostgreSQL database with Prisma ORM
- [ ] JWT authentication middleware
- [ ] File upload with Cloudinary
- [ ] Input validation with Joi/Zod
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Error handling middleware
- [ ] Logging system

### Frontend Requirements
- [ ] Axios instance with interceptors
- [ ] Authentication context
- [ ] Protected routes
- [ ] Form validation
- [ ] Error handling
- [ ] Loading states
- [ ] Toast notifications
- [ ] File upload component
- [ ] Map integration (Leaflet)

### Security Considerations
- [ ] Password hashing (bcrypt)
- [ ] JWT token expiration
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] HTTPS in production
- [ ] Environment variables
- [ ] Rate limiting

---

This API specification ensures complete synchronization between your frontend and backend, providing a solid foundation for the LOKAWAZ application! 🎉
