import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { electionsAPI } from '../lib/api';
import { Election } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Navbar from '../components/layout/Navbar';

const Elections: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [filteredElections, setFilteredElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await electionsAPI.getElections();
        if (response.data.success) {
          setElections(response.data.data || []);
          setFilteredElections(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch elections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchElections();
  }, []);

  useEffect(() => {
    let filtered = elections;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(election =>
        election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        election.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    const now = new Date();
    switch (filter) {
      case 'active':
        filtered = filtered.filter(election => {
          const startDate = new Date(election.startDate);
          const endDate = new Date(election.endDate);
          return election.isActive && now >= startDate && now <= endDate;
        });
        break;
      case 'upcoming':
        filtered = filtered.filter(election => {
          const startDate = new Date(election.startDate);
          return election.isActive && now < startDate;
        });
        break;
      case 'completed':
        filtered = filtered.filter(election => {
          const endDate = new Date(election.endDate);
          return now > endDate;
        });
        break;
      default:
        break;
    }

    setFilteredElections(filtered);
  }, [elections, searchTerm, filter]);

  const getElectionStatus = (election: Election) => {
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);

    if (!election.isActive) {
      return { status: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' };
    }
    
    if (now < startDate) {
      return { status: 'upcoming', label: 'Upcoming', color: 'bg-yellow-100 text-yellow-800' };
    }
    
    if (now >= startDate && now <= endDate) {
      return { status: 'active', label: 'Active', color: 'bg-green-100 text-green-800' };
    }
    
    return { status: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <ClockIcon className="h-4 w-4" />;
      case 'upcoming':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Elections</h1>
          <p className="text-gray-600">
            Browse and participate in available elections
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search elections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>
            
            {/* Filter */}
            <div className="sm:w-48">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="form-input"
              >
                <option value="all">All Elections</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Elections Grid */}
        {filteredElections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-12"
          >
            <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No elections found</h3>
            <p className="text-gray-600">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'There are no elections available at the moment.'
              }
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredElections.map((election, index) => {
              const statusInfo = getElectionStatus(election);
              
              return (
                <motion.div
                  key={election._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {getStatusIcon(statusInfo.status)}
                        <span className="ml-1">{statusInfo.label}</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        {election.candidates.length} candidates
                      </span>
                    </div>

                    {/* Election Info */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {election.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {election.description}
                    </p>

                    {/* Dates */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-xs text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>Starts: {new Date(election.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>Ends: {new Date(election.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        to={`/elections/${election._id}`}
                        className="flex-1 btn-primary text-center text-sm py-2"
                      >
                        {statusInfo.status === 'active' ? 'Vote Now' : 'View Details'}
                      </Link>
                      {statusInfo.status === 'completed' && (
                        <Link
                          to={`/elections/${election._id}/results`}
                          className="flex-1 btn-secondary text-center text-sm py-2"
                        >
                          View Results
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Elections;