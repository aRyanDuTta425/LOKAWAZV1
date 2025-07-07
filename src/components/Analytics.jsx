import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Users, AlertTriangle } from 'lucide-react';
import api from '../utils/api';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    statusDistribution: [],
    categoryDistribution: [],
    monthlyTrends: [],
    priorityDistribution: [],
    userActivityTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/analytics?timeRange=${timeRange}`);
      if (response.success) {
        setAnalyticsData(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Fallback with mock data for demonstration
      setAnalyticsData({
        statusDistribution: [
          { name: 'Reported', value: 35, count: 35 },
          { name: 'Under Review', value: 20, count: 20 },
          { name: 'In Progress', value: 25, count: 25 },
          { name: 'Resolved', value: 60, count: 60 },
          { name: 'Closed', value: 15, count: 15 }
        ],
        categoryDistribution: [
          { name: 'Road Issues', value: 45, count: 45 },
          { name: 'Water Supply', value: 30, count: 30 },
          { name: 'Electricity', value: 25, count: 25 },
          { name: 'Sanitation', value: 20, count: 20 },
          { name: 'Public Safety', value: 15, count: 15 },
          { name: 'Other', value: 20, count: 20 }
        ],
        monthlyTrends: [
          { month: 'Jan', reported: 20, resolved: 18, pending: 2 },
          { month: 'Feb', reported: 25, resolved: 22, pending: 5 },
          { month: 'Mar', reported: 30, resolved: 28, pending: 7 },
          { month: 'Apr', reported: 35, resolved: 30, pending: 12 },
          { month: 'May', reported: 40, resolved: 35, pending: 17 },
          { month: 'Jun', reported: 45, resolved: 38, pending: 24 }
        ],
        priorityDistribution: [
          { name: 'High', value: 25, count: 25 },
          { name: 'Medium', value: 45, count: 45 },
          { name: 'Low', value: 85, count: 85 }
        ],
        userActivityTrends: [
          { month: 'Jan', newUsers: 12, activeUsers: 45 },
          { month: 'Feb', newUsers: 18, activeUsers: 52 },
          { month: 'Mar', newUsers: 22, activeUsers: 68 },
          { month: 'Apr', newUsers: 15, activeUsers: 74 },
          { month: 'May', newUsers: 28, activeUsers: 89 },
          { month: 'Jun', newUsers: 35, activeUsers: 102 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = {
    primary: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
    secondary: ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA'],
    gradient: ['#1E40AF', '#059669', '#D97706', '#DC2626', '#7C3AED']
  };

  const StatusChart = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Issues by Status</h3>
        <AlertTriangle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={analyticsData.statusDistribution}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {analyticsData.statusDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value} issues`, name]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const CategoryChart = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Issues by Category</h3>
        <BarChart className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={analyticsData.categoryDistribution}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis />
          <Tooltip formatter={(value) => [`${value} issues`, 'Count']} />
          <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const MonthlyTrendsChart = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow col-span-2 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Trends</h3>
        <div className="flex items-center space-x-4">
          <TrendingUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
          </select>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={analyticsData.monthlyTrends}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="reported"
            stackId="1"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.6}
            name="Reported"
          />
          <Area
            type="monotone"
            dataKey="resolved"
            stackId="2"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.6}
            name="Resolved"
          />
          <Area
            type="monotone"
            dataKey="pending"
            stackId="3"
            stroke="#F59E0B"
            fill="#F59E0B"
            fillOpacity={0.6}
            name="Pending"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const PriorityChart = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Issues by Priority</h3>
        <Calendar className="w-5 h-5 text-gray-400" />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={analyticsData.priorityDistribution} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={80} />
          <Tooltip formatter={(value) => [`${value} issues`, 'Count']} />
          <Bar dataKey="value" fill="#EF4444" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const UserActivityChart = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
        <Users className="w-5 h-5 text-gray-400" />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={analyticsData.userActivityTrends}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="newUsers"
            stroke="#8B5CF6"
            strokeWidth={3}
            dot={{ r: 6 }}
            name="New Users"
          />
          <Line
            type="monotone"
            dataKey="activeUsers"
            stroke="#06B6D4"
            strokeWidth={3}
            dot={{ r: 6 }}
            name="Active Users"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const SummaryCards = () => {
    const totalIssues = analyticsData.statusDistribution.reduce((sum, item) => sum + item.count, 0);
    const resolvedIssues = analyticsData.statusDistribution.find(item => item.name === 'Resolved')?.count || 0;
    const resolutionRate = totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(1) : 0;
    const highPriorityIssues = analyticsData.priorityDistribution.find(item => item.name === 'High')?.count || 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Issues</p>
              <p className="text-3xl font-bold">{totalIssues}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-blue-200" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm">+12% from last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Resolution Rate</p>
              <p className="text-3xl font-bold">{resolutionRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm">+5% from last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">High Priority</p>
              <p className="text-3xl font-bold">{highPriorityIssues}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingDown className="w-4 h-4 mr-1" />
            <span className="text-sm">-8% from last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Active Users</p>
              <p className="text-3xl font-bold">
                {analyticsData.userActivityTrends[analyticsData.userActivityTrends.length - 1]?.activeUsers || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-200" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm">+15% from last month</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SummaryCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MonthlyTrendsChart />
        <StatusChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart />
        <PriorityChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <UserActivityChart />
      </div>
    </div>
  );
};

export default Analytics;
