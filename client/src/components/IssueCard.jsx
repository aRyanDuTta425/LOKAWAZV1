import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, User, Camera } from 'lucide-react';

const IssueCard = ({ issue }) => {
  // Status styling
  const getStatusColor = (status) => {
    switch (status) {
      case 'REPORTED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Priority styling
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600';
      case 'MEDIUM':
        return 'text-orange-600';
      case 'LOW':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Issue Image */}
      {issue.images && issue.images.length > 0 && (
        <div className="relative h-48 w-full">
          <img
            src={issue.images[0]}
            alt={issue.title}
            className="w-full h-full object-cover rounded-t-lg"
          />
          {issue.images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <Camera size={12} />
              {issue.images.length}
            </div>
          )}
        </div>
      )}

      {/* Issue Content */}
      <div className="p-4">
        {/* Status and Priority */}
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(issue.status)}`}>
            {issue.status.replace('_', ' ')}
          </span>
          <span className={`text-xs font-medium ${getPriorityColor(issue.priority)}`}>
            {issue.priority} Priority
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {issue.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {issue.description}
        </p>

        {/* Category */}
        <div className="mb-3">
          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
            {issue.category}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <MapPin size={16} className="mr-1" />
          <span className="truncate">{issue.location}</span>
        </div>

        {/* Date and Reporter */}
        <div className="flex items-center justify-between text-gray-500 text-xs mb-3">
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            <span>{formatDate(issue.createdAt)}</span>
          </div>
          <div className="flex items-center">
            <User size={14} className="mr-1" />
            <span>{issue.reporter?.name || 'Anonymous'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            to={`/issue/${issue.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
          
          {/* Vote/Like Count (if applicable) */}
          {issue.votes && (
            <div className="text-gray-500 text-sm">
              {issue.votes} votes
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueCard;