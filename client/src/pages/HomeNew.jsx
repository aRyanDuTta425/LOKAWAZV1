// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import issueService from '../services/issueService';
import { toast } from 'react-hot-toast';
import { 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  MapPin, 
  Camera, 
  ThumbsUp,
  TrendingUp,
  Shield,
  Zap,
  Heart,
  Star,
  Calendar,
  Eye
} from 'lucide-react';

const Home = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchRecentIssues();
    fetchStats();
  }, []);

  const fetchRecentIssues = async () => {
    try {
      const response = await issueService.getIssues({ limit: 6 });
      if (response.success) {
        setIssues(response.data);
      }
    } catch (error) {
      console.error('Error fetching recent issues:', error);
      toast.error('Failed to load recent issues');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get multiple pages to calculate stats properly
      let allIssues = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore && page <= 10) { // Limit to 10 pages (1000 items max)
        const response = await issueService.getIssues({ 
          limit: 100, 
          page: page 
        });
        
        if (response.success && response.data.length > 0) {
          allIssues = [...allIssues, ...response.data];
          hasMore = response.data.length === 100; // If we got 100 items, there might be more
          page++;
        } else {
          hasMore = false;
        }
      }
      
      const statsData = {
        total: allIssues.length,
        pending: allIssues.filter(issue => issue.status === 'REPORTED').length,
        inProgress: allIssues.filter(issue => issue.status === 'IN_PROGRESS').length,
        resolved: allIssues.filter(issue => issue.status === 'RESOLVED').length
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'REPORTED': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: AlertTriangle,
        label: 'Reported' 
      },
      'UNDER_REVIEW': { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: Eye,
        label: 'Under Review' 
      },
      'IN_PROGRESS': { 
        color: 'bg-purple-100 text-purple-800 border-purple-200', 
        icon: Clock,
        label: 'In Progress' 
      },
      'RESOLVED': { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle,
        label: 'Resolved' 
      },
      'CLOSED': { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: CheckCircle,
        label: 'Closed' 
      }
    };

    const config = statusConfig[status] || statusConfig['REPORTED'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Your Voice for
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Community Change</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Report civic issues, track progress, and build a better community together. 
                  LokAwaaz empowers citizens to make their voices heard and drive real change.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Link 
                    to="/new-issue"
                    className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Report Issue
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <Link 
                    to="/register"
                    className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
                
                <Link 
                  to="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Explore Issues
                </Link>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-green-500" />
                  Secure & Private
                </div>
                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                  Fast Response
                </div>
                <div className="flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-red-500" />
                  Community Driven
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Quick Report</h3>
                    <Star className="w-5 h-5 text-yellow-400" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <Camera className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="text-sm text-gray-700">Take a photo of the issue</span>
                    </div>
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-600 mr-3" />
                      <span className="text-sm text-gray-700">Mark the location</span>
                    </div>
                    <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-600 mr-3" />
                      <span className="text-sm text-gray-700">Track progress in real-time</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
                <p className="text-sm font-medium text-gray-600">Total Issues</p>
              </div>
            </div>

            <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{stats.pending.toLocaleString()}</p>
                <p className="text-sm font-medium text-gray-600">Pending</p>
              </div>
            </div>

            <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <Zap className="w-5 h-5 text-purple-500" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress.toLocaleString()}</p>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
              </div>
            </div>

            <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <ThumbsUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{stats.resolved.toLocaleString()}</p>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to report issues and create positive change in your community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative group">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Camera className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Report Issue</h3>
                <p className="text-gray-600 leading-relaxed">
                  Take a photo of the civic issue, add a description, and mark the location on the map. 
                  Your report helps authorities understand the problem.
                </p>
              </div>
              <div className="hidden md:block absolute top-10 -right-4 text-gray-300">
                <ArrowRight className="w-8 h-8" />
              </div>
            </div>

            <div className="relative group">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Eye className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Track Progress</h3>
                <p className="text-gray-600 leading-relaxed">
                  Follow your issue through different stages - from reported to under review, 
                  in progress, and finally resolved with real-time updates.
                </p>
              </div>
              <div className="hidden md:block absolute top-10 -right-4 text-gray-300">
                <ArrowRight className="w-8 h-8" />
              </div>
            </div>

            <div className="group">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">3. See Results</h3>
                <p className="text-gray-600 leading-relaxed">
                  Watch as your reported issues get resolved and your community improves. 
                  Every resolved issue makes a difference for everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Issues Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Recent Issues</h2>
              <p className="text-xl text-gray-600">
                See what's happening in your community and how issues are being resolved
              </p>
            </div>
            <Link 
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              View All Issues
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {issues.map((issue) => (
                <Link 
                  key={issue.id} 
                  to={`/issue/${issue.id}`}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-2"
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {issue.imageUrl ? (
                      <img 
                        src={issue.imageUrl} 
                        alt={issue.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Camera className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(issue.status)}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {issue.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {issue.description}
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(issue.createdAt)}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          View Location
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && issues.length === 0 && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Issues Found</h3>
                <p className="text-gray-600 mb-6">Be the first to report an issue in your community.</p>
                {isAuthenticated && (
                  <Link 
                    to="/new-issue"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Report First Issue
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
