export interface User {
  _id: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Election {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  candidates: Candidate[];
  guidelines: string;
  isActive: boolean;
  createdAt: string;
}

export interface Candidate {
  _id?: string;
  name: string;
  party: string;
  bio: string;
  photo?: string;
}

export interface Vote {
  _id: string;
  election: string;
  voter: string;
  candidate: string;
  timestamp: string;
  location: {
    ip: string;
    country: string;
    region: string;
    city: string;
    lat: number;
    lng: number;
  };
  facialVerification: {
    isVerified: boolean;
    similarityScore: number;
    verificationTime: string;
  };
  blockchainTxHash?: string;
  isAnonymous: boolean;
}

export interface Profile {
  _id: string;
  user: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phoneNumber: string;
  idDocument: {
    type: string;
    number: string;
    uploadedFile?: string;
    isVerified: boolean;
  };
  facePhoto?: string;
  isEligible: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
  requiresMFA?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ElectionStats {
  totalVotes: number;
  candidateResults: {
    candidateId: string;
    candidateName: string;
    voteCount: number;
    percentage: number;
  }[];
}