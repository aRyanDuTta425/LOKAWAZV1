# Database Documentation

## Overview
This document describes the database schema for the Lok Awaaz application using PostgreSQL with Prisma ORM.

## Database Schema

### Users Table
- `id` (String, Primary Key) - Unique identifier
- `email` (String, Unique) - User email address
- `password` (String) - Hashed password
- `name` (String, Optional) - User's full name
- `role` (Enum) - User role (USER, ADMIN)
- `avatar` (String, Optional) - Profile picture URL
- `phone` (String, Optional) - Phone number
- `address` (String, Optional) - User address
- `isVerified` (Boolean) - Email verification status
- `createdAt` (DateTime) - Account creation timestamp
- `updatedAt` (DateTime) - Last update timestamp

### Issues Table
- `id` (String, Primary Key) - Unique identifier
- `title` (String) - Issue title
- `description` (String) - Issue description
- `category` (Enum) - Issue category
- `priority` (Enum) - Issue priority level
- `status` (Enum) - Issue status
- `images` (String Array) - Associated image URLs
- `location` (String, Optional) - Issue location
- `userId` (String, Foreign Key) - Reporter user ID
- `assignedTo` (String, Optional) - Assigned admin ID
- `createdAt` (DateTime) - Issue creation timestamp
- `updatedAt` (DateTime) - Last update timestamp

## Relationships
- One User can have many Issues (1:N)
- One Admin can be assigned to many Issues (1:N)

## Enums

### UserRole
- USER
- ADMIN

### IssueCategory
- INFRASTRUCTURE
- HEALTH
- EDUCATION
- ENVIRONMENT
- SAFETY
- OTHER

### IssuePriority
- LOW
- MEDIUM
- HIGH
- URGENT

### IssueStatus
- OPEN
- IN_PROGRESS
- RESOLVED
- CLOSED

## Indexes
- Email (unique index on users.email)
- User ID (index on issues.userId)
- Status (index on issues.status)
- Category (index on issues.category)
