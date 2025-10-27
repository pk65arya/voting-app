import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { electionAPI, votingAPI } from '../../services/api';
import { CheckCircle, User, Camera, MapPin, Lock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Candidate {
  id: string;
  name: string;
  party: string;
  bio: string;
  imageUrl?: string;
  qualifications: string[];
}

interface Election {
  id: string;
  title: string;
  description: string;
  endDate: string;
  candidates: Candidate[];
}

const VotingInterface: React.FC = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  
  const [election, setElection] = useState<Election | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [step, setStep] = useState<'selection' | 'verification' | 'confirmation'>('selection');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [voteToken, setVoteToken] = useState<string>('');
  const [faceVerified, setFaceVerified] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);

  useEffect(() => {
    if (electionId) {
      fetchElectionData();
      generateVoteLink();
    }
  }, [electionId]);

  const fetchElectionData = async () => {
    try {
      const [electionResponse, candidatesResponse] = await Promise.all([
        electionAPI.getElection(electionId!),
        electionAPI.getCandidates(electionId!)
      ]);
      
      setElection({
        ...electionResponse.data.election,
        candidates: candidatesResponse.data.candidates
      });
    } catch (error: any) {
      console.error('Error fetching election data:', error);
      toast.error('Failed to load election data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const generateVoteLink = async () => {
    try {
      const response = await votingAPI.generateVoteLink(electionId!);
      setVoteToken(response.data.token);
    } catch (error: any) {
      console.error('Error generating vote link:', error);
      toast.error('Failed to generate secure vote link');
    }
  };

  const simulateFaceVerification = () => {
    // Simulate face verification process
    setFaceVerified(true);
    toast.success('Face verification completed');
  };

  const simulateLocationVerification = () => {
    // Simulate location verification
    setLocationVerified(true);
    toast.success('Location verification completed');
  };

  const handleCandidateSelect = (candidateId: string) => {
    setSelectedCandidate(candidateId);
  };

  const proceedToVerification = () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }
    setStep('verification');
  };

  const proceedToConfirmation = () => {
    if (!faceVerified || !locationVerified) {
      toast.error('Please complete all verification steps');
      return;
    }
    setStep('confirmation');
  };

  const submitVote = async () => {
    if (!selectedCandidate || !voteToken) {
      toast.error('Invalid vote data');
      return;
    }

    setSubmitting(true);
    try {
      await votingAPI.submitVote({
        electionId,
        candidateId: selectedCandidate,
        token: voteToken,
        verifications: {
          face: faceVerified,
          location: locationVerified
        }
      });

      toast.success('Vote submitted successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error submitting vote:', error);
      toast.error('Failed to submit vote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Election Not Found</h2>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{election.title}</h1>
              <p className="text-sm text-gray-500">Secure Voting Interface</p>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Secure Connection</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              <div className={`flex items-center ${step === 'selection' ? 'text-primary-600' : step === 'verification' || step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'selection' ? 'bg-primary-600 text-white' : step === 'verification' || step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  {step === 'verification' || step === 'confirmation' ? <CheckCircle className="h-5 w-5" /> : '1'}
                </div>
                <span className="ml-2 text-sm font-medium">Select Candidate</span>
              </div>
              
              <div className={`flex items-center ${step === 'verification' ? 'text-primary-600' : step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'verification' ? 'bg-primary-600 text-white' : step === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  {step === 'confirmation' ? <CheckCircle className="h-5 w-5" /> : '2'}
                </div>
                <span className="ml-2 text-sm font-medium">Verify Identity</span>
              </div>
              
              <div className={`flex items-center ${step === 'confirmation' ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'confirmation' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="ml-2 text-sm font-medium">Confirm Vote</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          {step === 'selection' && (
            <div className="card">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900">Select Your Candidate</h2>
                <p className="text-sm text-gray-500">Choose one candidate to vote for in this election.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {election.candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                      selectedCandidate === candidate.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleCandidateSelect(candidate.id)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {candidate.imageUrl ? (
                          <img
                            src={candidate.imageUrl}
                            alt={candidate.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-medium text-gray-900">{candidate.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{candidate.party}</p>
                        <p className="text-sm text-gray-700 mb-3">{candidate.bio}</p>
                        {candidate.qualifications.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium text-gray-900 mb-1">Qualifications:</h4>
                            <ul className="text-xs text-gray-600 list-disc list-inside">
                              {candidate.qualifications.map((qual, index) => (
                                <li key={index}>{qual}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      {selectedCandidate === candidate.id && (
                        <CheckCircle className="h-6 w-6 text-primary-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={proceedToVerification}
                  disabled={!selectedCandidate}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Verification
                </button>
              </div>
            </div>
          )}

          {step === 'verification' && (
            <div className="card">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900">Identity Verification</h2>
                <p className="text-sm text-gray-500">
                  Complete the following verification steps to ensure vote security.
                </p>
              </div>

              <div className="space-y-6">
                {/* Face Verification */}
                <div className={`border rounded-lg p-6 ${faceVerified ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Camera className={`h-8 w-8 ${faceVerified ? 'text-green-600' : 'text-gray-400'}`} />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Face Verification</h3>
                        <p className="text-sm text-gray-500">
                          Verify your identity using facial recognition
                        </p>
                      </div>
                    </div>
                    {faceVerified ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <button
                        onClick={simulateFaceVerification}
                        className="btn-primary"
                      >
                        Start Verification
                      </button>
                    )}
                  </div>
                </div>

                {/* Location Verification */}
                <div className={`border rounded-lg p-6 ${locationVerified ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MapPin className={`h-8 w-8 ${locationVerified ? 'text-green-600' : 'text-gray-400'}`} />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Location Verification</h3>
                        <p className="text-sm text-gray-500">
                          Confirm your voting location
                        </p>
                      </div>
                    </div>
                    {locationVerified ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <button
                        onClick={simulateLocationVerification}
                        className="btn-primary"
                      >
                        Verify Location
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep('selection')}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={proceedToConfirmation}
                  disabled={!faceVerified || !locationVerified}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Confirmation
                </button>
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="card">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900">Confirm Your Vote</h2>
                <p className="text-sm text-gray-500">
                  Please review your selection before submitting your vote.
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Important:</strong> Once you submit your vote, it cannot be changed. 
                      Please ensure your selection is correct.
                    </p>
                  </div>
                </div>
              </div>

              {/* Vote Summary */}
              <div className="border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vote Summary</h3>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Election:</span>
                    <span className="ml-2 text-sm text-gray-700">{election.title}</span>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-900">Selected Candidate:</span>
                    <span className="ml-2 text-sm text-gray-700">
                      {election.candidates.find(c => c.id === selectedCandidate)?.name}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-900">Party:</span>
                    <span className="ml-2 text-sm text-gray-700">
                      {election.candidates.find(c => c.id === selectedCandidate)?.party}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('verification')}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={submitVote}
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting Vote...' : 'Submit Vote'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VotingInterface;