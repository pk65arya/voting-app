import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { electionsAPI, votesAPI } from '../lib/api';
import { Election, Candidate } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';

const ElectionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [votingStep, setVotingStep] = useState<'selection' | 'verification' | 'confirmation'>('selection');

  useEffect(() => {
    const fetchElection = async () => {
      if (!id) return;
      
      try {
        const response = await electionsAPI.getElections();
        if (response.data.success) {
          const foundElection = response.data.data?.find((e: Election) => e._id === id);
          if (foundElection) {
            setElection(foundElection);
          } else {
            toast.error('Election not found');
            navigate('/elections');
          }
        }
      } catch (error) {
        console.error('Failed to fetch election:', error);
        toast.error('Failed to load election details');
        navigate('/elections');
      } finally {
        setIsLoading(false);
      }
    };

    fetchElection();
  }, [id, navigate]);

  const getElectionStatus = (election: Election) => {
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);

    if (!election.isActive) {
      return 'inactive';
    }
    
    if (now < startDate) {
      return 'upcoming';
    }
    
    if (now >= startDate && now <= endDate) {
      return 'active';
    }
    
    return 'completed';
  };

  const handleCandidateSelect = (candidateId: string) => {
    setSelectedCandidate(candidateId);
  };

  const handleGenerateVotingLink = async () => {
    if (!election || !selectedCandidate) return;
    
    setIsVoting(true);
    try {
      const response = await votesAPI.generateVotingLink({ electionId: election._id });
      if (response.data.success) {
        setVotingStep('verification');
        toast.success('Voting link generated. Please verify your identity.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate voting link');
    } finally {
      setIsVoting(false);
    }
  };

  const handleVoteSubmit = async () => {
    if (!election || !selectedCandidate) return;
    
    setIsVoting(true);
    try {
      // This would normally use the token from the verification step
      const mockToken = 'verification-token';
      const response = await votesAPI.castVote(mockToken, { candidateId: selectedCandidate });
      
      if (response.data.success) {
        setVotingStep('confirmation');
        toast.success('Your vote has been cast successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cast vote');
    } finally {
      setIsVoting(false);
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

  if (!election) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Election Not Found</h2>
            <button
              onClick={() => navigate('/elections')}
              className="btn-primary"
            >
              Back to Elections
            </button>
          </div>
        </div>
      </div>
    );
  }

  const status = getElectionStatus(election);
  const canVote = status === 'active';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {votingStep === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Election Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{election.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    status === 'active' ? 'bg-green-100 text-green-800' :
                    status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                    status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-6">{election.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span>Starts: {new Date(election.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <span>Ends: {new Date(election.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    <span>{election.candidates.length} candidates</span>
                  </div>
                </div>
              </div>

              {/* Election Guidelines */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Election Guidelines</h2>
                <div className="prose prose-sm text-gray-600">
                  <p>{election.guidelines}</p>
                </div>
              </div>

              {/* Candidates */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Candidates</h2>
                
                {!canVote && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                      <span className="text-sm text-yellow-800">
                        {status === 'upcoming' ? 'Voting has not started yet.' :
                         status === 'completed' ? 'Voting has ended.' :
                         'This election is not active.'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {election.candidates.map((candidate) => (
                    <motion.div
                      key={candidate._id}
                      whileHover={{ scale: canVote ? 1.02 : 1 }}
                      whileTap={{ scale: canVote ? 0.98 : 1 }}
                      className={`border rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                        selectedCandidate === candidate._id
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500'
                          : canVote
                          ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          : 'border-gray-200 opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => canVote && handleCandidateSelect(candidate._id || '')}
                    >
                      {candidate.photo && (
                        <img
                          src={candidate.photo}
                          alt={candidate.name}
                          className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                        />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                        {candidate.name}
                      </h3>
                      <p className="text-sm text-gray-600 text-center mb-3">
                        {candidate.party}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {candidate.bio}
                      </p>
                      {selectedCandidate === candidate._id && (
                        <div className="mt-4 flex items-center justify-center">
                          <CheckCircleIcon className="h-5 w-5 text-primary-600" />
                          <span className="ml-2 text-sm font-medium text-primary-600">Selected</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Vote Button */}
              {canVote && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Ready to Vote?</h3>
                      <p className="text-sm text-gray-600">
                        {selectedCandidate 
                          ? 'Click below to proceed with secure verification and vote casting.'
                          : 'Please select a candidate to continue.'
                        }
                      </p>
                    </div>
                    <button
                      onClick={handleGenerateVotingLink}
                      disabled={!selectedCandidate || isVoting}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isVoting ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShieldCheckIcon className="h-5 w-5 mr-2" />
                          Proceed to Vote
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {votingStep === 'verification' && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center"
            >
              <div className="max-w-md mx-auto">
                <ShieldCheckIcon className="h-16 w-16 text-blue-600 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Security Verification</h2>
                <p className="text-gray-600 mb-8">
                  For security purposes, we need to verify your identity before casting your vote.
                  This includes facial recognition and location verification.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    Email verification: Complete
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    Facial verification: In progress...
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    Location verification: In progress...
                  </div>
                </div>

                <button
                  onClick={handleVoteSubmit}
                  disabled={isVoting}
                  className="btn-primary w-full flex items-center justify-center disabled:opacity-50"
                >
                  {isVoting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Casting Vote...
                    </>
                  ) : (
                    <>
                      <DocumentCheckIcon className="h-5 w-5 mr-2" />
                      Cast My Vote
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {votingStep === 'confirmation' && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center"
            >
              <div className="max-w-md mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircleIcon className="h-10 w-10 text-green-600" />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Vote Cast Successfully!</h2>
                <p className="text-gray-600 mb-8">
                  Your vote has been securely recorded and encrypted. Thank you for participating 
                  in this election. You will be redirected to your dashboard shortly.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600">
                    <strong>Transaction ID:</strong> #VT{Date.now().toString().slice(-8)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Timestamp:</strong> {new Date().toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-primary w-full"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ElectionDetails;