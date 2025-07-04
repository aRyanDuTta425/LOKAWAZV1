# API Documentation

## Overview
This document describes the API endpoints for the Lok Awaaz backend application.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh JWT token

### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `DELETE /users/profile` - Delete user account

### Issues
- `GET /issues` - Get all issues
- `POST /issues` - Create new issue
- `GET /issues/:id` - Get specific issue
- `PUT /issues/:id` - Update issue
- `DELETE /issues/:id` - Delete issue

### Admin
- `GET /admin/users` - Get all users (admin only)
- `GET /admin/issues` - Get all issues (admin only)
- `PUT /admin/issues/:id/status` - Update issue status (admin only)

## Response Format
All responses follow this format:
```json
{
  "success": true,
  "message": "Success message",
  "data": {},
  "error": null
}
```
