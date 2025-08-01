import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { electionsAPI, votesAPI } from '../lib/api';
import { Election, Vote } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Navbar from '../components/layout/Navbar';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [myVotes, setMyVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [electionsResponse, votesResponse] = await Promise.all([
          electionsAPI.getElections(),
          votesAPI.getMyVotes()
        ]);
        
        if (electionsResponse.data.success) {
          setElections(electionsResponse.data.data || []);
        }
        
        if (votesResponse.data.success) {
          setMyVotes(votesResponse.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeElections = elections.filter(election => {
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    return election.isActive && now >= startDate && now <= endDate;
  });

  const upcomingElections = elections.filter(election => {
    const now = new Date();
    const startDate = new Date(election.startDate);
    return election.isActive && now < startDate;
  });

  const completedElections = elections.filter(election => {
    const now = new Date();
    const endDate = new Date(election.endDate);
    return now > endDate;
  });

  const stats = [
    {
      name: 'Active Elections',
      value: activeElections.length,
      icon: ClockIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Votes Cast',
      value: myVotes.length,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Upcoming Elections',
      value: upcomingElections.length,
      icon: ExclamationTriangleIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'Total Elections',
      value: elections.length,
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">
            Stay informed and participate in secure, transparent elections.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-md ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Elections */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                Active Elections
              </h2>
            </div>
            <div className="p-6">
              {activeElections.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No active elections at the moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeElections.slice(0, 3).map((election) => (
                    <div key={election._id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">{election.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{election.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Ends: {new Date(election.endDate).toLocaleDateString()}
                        </div>
                        <Link
                          to={`/elections/${election._id}`}
                          className="btn-primary text-xs px-3 py-1"
                        >
                          Vote Now
                        </Link>
                      </div>
                    </div>
                  ))}
                  {activeElections.length > 3 && (
                    <Link
                      to="/elections"
                      className="block text-center text-primary-600 hover:text-primary-500 text-sm font-medium"
                    >
                      View all active elections →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <DocumentCheckIcon className="h-5 w-5 text-green-600 mr-2" />
                Recent Activity
              </h2>
            </div>
            <div className="p-6">
              {myVotes.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No voting activity yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Your votes will appear here once you participate in elections
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myVotes.slice(0, 3).map((vote) => (
                    <div key={vote._id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          Voted in election
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(vote.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {myVotes.length > 3 && (
                    <Link
                      to="/votes"
                      className="block text-center text-primary-600 hover:text-primary-500 text-sm font-medium"
                    >
                      View all activity →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/elections"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
            >
              <ClockIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Browse Elections</h3>
                <p className="text-sm text-gray-600">View all available elections</p>
              </div>
            </Link>
            
            <Link
              to="/profile"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
            >
              <UserGroupIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Update Profile</h3>
                <p className="text-sm text-gray-600">Manage your voter information</p>
              </div>
            </Link>
            
            <Link
              to="/votes"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
            >
              <DocumentCheckIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Voting History</h3>
                <p className="text-sm text-gray-600">Review your past votes</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;