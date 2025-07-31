import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { electionAPI, profileAPI } from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import { Vote, User, Calendar, CheckCircle, AlertTriangle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'ended';
  hasVoted: boolean;
  totalCandidates: number;
}

interface Profile {
  id: string;
  isVerified: boolean;
  documentUploaded: boolean;
  profileComplete: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Socket integration for real-time updates
  useSocket({
    onElectionUpdate: (data) => {
      // Update elections when real-time updates are received
      setElections((prev: Election[]) => prev.map(election => 
        election.id === data.id ? { ...election, ...data } : election
      ));
    },
    onVoteUpdate: () => {
      // Refresh data when votes are updated
      fetchDashboardData();
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [electionsResponse, profileResponse] = await Promise.all([
        electionAPI.getElections(),
        profileAPI.getProfile()
      ]);
      
      setElections(electionsResponse.data.elections || []);
      setProfile(profileResponse.data.profile);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Upcoming</span>;
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
      case 'ended':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Ended</span>;
      default:
        return null;
    }
  };

  const getVerificationStatus = () => {
    if (!profile) return null;

    if (profile.isVerified) {
      return (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Your profile is verified and you can participate in elections.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (profile.verificationStatus === 'pending') {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your profile verification is pending. You'll be able to vote once approved.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Please complete your profile verification to participate in elections.
            </p>
            <div className="mt-2">
              <Link
                to="/profile/complete"
                className="text-sm font-medium text-red-700 underline hover:text-red-600"
              >
                Complete Profile →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Vote className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Voting Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
              <Link
                to="/profile"
                className="text-gray-500 hover:text-gray-700"
              >
                <Settings className="h-5 w-5" />
              </Link>
              <button
                onClick={logout}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Verification Status */}
          <div className="mb-6">
            {getVerificationStatus()}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {elections.filter(e => e.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-500">Active Elections</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {elections.filter(e => e.hasVoted).length}
                  </div>
                  <div className="text-sm text-gray-500">Votes Cast</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {profile?.isVerified ? 'Verified' : 'Pending'}
                  </div>
                  <div className="text-sm text-gray-500">Verification Status</div>
                </div>
              </div>
            </div>
          </div>

          {/* Elections List */}
          <div className="card">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">Available Elections</h2>
              <p className="text-sm text-gray-500">
                Participate in active elections and view upcoming ones
              </p>
            </div>

            {elections.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Elections Available</h3>
                <p className="text-gray-500">Check back later for upcoming elections.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {elections.map((election) => (
                  <div
                    key={election.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {election.title}
                        </h3>
                        <p className="text-sm text-gray-500">{election.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(election.status)}
                        {election.hasVoted && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>
                        {new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}
                      </span>
                      <span>{election.totalCandidates} candidates</span>
                    </div>

                    <div className="flex justify-end">
                      {election.status === 'active' && !election.hasVoted && profile?.isVerified ? (
                        <Link
                          to={`/elections/${election.id}/vote`}
                          className="btn-primary"
                        >
                          Vote Now
                        </Link>
                      ) : election.hasVoted ? (
                        <Link
                          to={`/elections/${election.id}/results`}
                          className="btn-secondary"
                        >
                          View Results
                        </Link>
                      ) : (
                        <Link
                          to={`/elections/${election.id}`}
                          className="btn-secondary"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;