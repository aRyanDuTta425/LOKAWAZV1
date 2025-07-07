import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  MapPin, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  MessageCircle, 
  Camera,
  ArrowLeft,
  Flag,
  Edit,
  Trash2,
  Send,
  Loader2,
  X,
  Star,
  Heart,
  Share2
} from 'lucide-react';
import LeafletMap from '../components/LeafletMap';
import issueService from '../services/issueService';

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    fetchIssue();
    fetchComments();
  }, [id]);

  const fetchIssue = async () => {
    try {
      setLoading(true);
      const response = await issueService.getIssueById(id);
      if (response.success) {
        setIssue(response.data);
        // Temporarily disable likes until backend implements it
        // setLikesCount(response.data.likesCount || 0);
        // setIsLiked(response.data.isLikedByUser || false);
      } else {
        setError('Failed to load issue');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch issue details');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      // Temporarily disable comments until backend implements it
      // const response = await issueService.getIssueComments(id);
      // if (response.success) {
      //   setComments(response.data || []);
      // }
      setComments([]); // Empty array for now
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await issueService.updateIssueStatus(id, newStatus);
      setIssue(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      // Temporarily disabled until backend implements comments
      // const comment = await issueService.addComment(id, newComment);
      // setComments(prev => [...prev, comment]);
      setNewComment('');
      alert('Comment functionality coming soon!');
    } catch (err) {
      alert('Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteIssue = async () => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;

    try {
      await issueService.deleteIssue(id);
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to delete issue');
    }
  };

  const handleLikeToggle = async () => {
    try {
      // Temporarily disabled until backend implements likes
      alert('Like functionality coming soon!');
      // if (isLiked) {
      //   await issueService.unlikeIssue(id);
      //   setLikesCount(prev => prev - 1);
      // } else {
      //   await issueService.likeIssue(id);
      //   setLikesCount(prev => prev + 1);
      // }
      // setIsLiked(!isLiked);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: issue.title,
          text: issue.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.log('Failed to copy link');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'REPORTED': 'bg-blue-100 text-blue-800',
      'UNDER_REVIEW': 'bg-yellow-100 text-yellow-800',
      'IN_PROGRESS': 'bg-purple-100 text-purple-800',
      'RESOLVED': 'bg-green-100 text-green-800',
      'CLOSED': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'LOW': 'text-green-600',
      'MEDIUM': 'text-orange-600',
      'HIGH': 'text-red-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'REPORTED': Clock,
      'UNDER_REVIEW': AlertCircle,
      'IN_PROGRESS': Clock,
      'RESOLVED': CheckCircle,
      'CLOSED': CheckCircle
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const canEditIssue = user && (user.id === issue?.userId || user.role === 'ADMIN' || user.role === 'MODERATOR');
  const canUpdateStatus = user && (user.role === 'ADMIN' || user.role === 'MODERATOR');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Issue Not Found</h2>
          <p className="text-gray-600">The issue you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{issue.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {issue.user?.name || 'Anonymous'}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(issue.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                  {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              {/* Action Buttons */}
              <button
                onClick={handleLikeToggle}
                className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                  isLiked 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </button>

              {canEditIssue && (
                <>
                  <button
                    onClick={() => navigate(`/issue/${id}/edit`)}
                    className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteIssue}
                    className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Details Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(issue.status)}`}>
                    {getStatusIcon(issue.status)}
                    <span className="ml-1">{issue.status?.replace('_', ' ') || 'Unknown'}</span>
                  </span>
                  <span className={`text-sm font-medium flex items-center ${getPriorityColor(issue.priority)}`}>
                    <Flag className="w-4 h-4 mr-1" />
                    {issue.priority || 'Unknown'} Priority
                  </span>
                </div>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {issue.category}
                </span>
              </div>

              {/* Status Update (for admins/moderators) */}
              {canUpdateStatus && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Update Status</h4>
                  <select
                    value={issue.status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="REPORTED">Reported</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              )}

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{issue.description}</p>
              </div>

              {/* Images */}
              {((issue.images && issue.images.length > 0) || issue.imageUrl) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Images ({(issue.images?.length || 0) + (issue.imageUrl ? 1 : 0)})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Display multiple images from images array */}
                    {issue.images && issue.images.map((image, index) => (
                      <div
                        key={`multi-${index}`}
                        className="relative cursor-pointer group"
                        onClick={() => setSelectedImage(image)}
                      >
                        <img
                          src={typeof image === 'string' ? image : image.url}
                          alt={`Issue image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                          <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                    
                    {/* Display single image from imageUrl (legacy support) */}
                    {issue.imageUrl && !issue.images && (
                      <div
                        className="relative cursor-pointer group"
                        onClick={() => setSelectedImage(issue.imageUrl)}
                      >
                        <img
                          src={issue.imageUrl}
                          alt="Issue image"
                          className="w-full h-32 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                          <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location */}
              {issue.latitude && issue.longitude && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Location
                  </h3>
                  <div className="space-y-3">
                    {issue.location && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-700 text-sm font-medium">Address:</p>
                        <p className="text-gray-900">{issue.location}</p>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-700 text-sm font-medium">Coordinates:</p>
                      <p className="text-gray-900 font-mono text-sm">
                        {parseFloat(issue.latitude).toFixed(6)}, {parseFloat(issue.longitude).toFixed(6)}
                      </p>
                    </div>
                    <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
                      <LeafletMap
                        center={[parseFloat(issue.latitude), parseFloat(issue.longitude)]}
                        zoom={16}
                        markers={[{
                          position: [parseFloat(issue.latitude), parseFloat(issue.longitude)],
                          popup: issue.title
                        }]}
                        interactive={true}
                        showIssueMarkers={false}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Comments ({comments.length})
              </h3>

              {/* Add Comment Form */}
              {user && (
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-blue-600">
                        {user.name?.charAt(0) || user.email?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows="3"
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={commentLoading || !newComment.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                        >
                          {commentLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          {commentLoading ? 'Posting...' : 'Post Comment'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No comments yet.</p>
                    {!user && (
                      <p className="text-sm text-gray-400 mt-2">
                        <button
                          onClick={() => navigate('/login')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Sign in
                        </button>{' '}
                        to add a comment.
                      </p>
                    )}
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-gray-600">
                            {comment.user?.name?.charAt(0) || comment.user?.email?.charAt(0) || 'A'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {comment.user?.name || 'Anonymous'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()} at{' '}
                              {new Date(comment.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Issue Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Issue Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${getStatusColor(issue.status)} px-2 py-1 rounded text-xs`}>
                    {issue.status?.replace('_', ' ') || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <span className={`font-medium ${getPriorityColor(issue.priority)}`}>
                    {issue.priority || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-gray-900">{issue.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reporter:</span>
                  <span className="font-medium text-gray-900">{issue.user?.name || 'Anonymous'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {issue.updatedAt !== issue.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(issue.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            {user && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={handleLikeToggle}
                    className={`w-full flex items-center justify-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      isLiked 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                    {isLiked ? 'Unlike' : 'Like'} This Issue
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Issue
                  </button>

                  <button
                    onClick={() => navigate('/issue/new')}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Report Similar Issue
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              >
                <X className="w-8 h-8" />
              </button>
              <img
                src={typeof selectedImage === 'string' ? selectedImage : selectedImage.url || selectedImage}
                alt="Issue image"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueDetails;
