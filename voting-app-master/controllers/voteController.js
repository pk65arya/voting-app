const Election = require('../models/Election');
const Vote = require('../models/Vote');
const User = require('../models/User');
const VoterProfile = require('../models/VoterProfile');
const ErrorResponse = require('../utils/errorResponse');
const redis = require('../services/redisService');
const { validationResult } = require('express-validator');
const AWS = require('aws-sdk');
const AuditLog = require('../models/AuditLog');

// @desc    Generate voting link
// @route   POST /api/v1/votes/generate-link
// @access  Private
exports.generateVotingLink = async (req, res, next) => {
  const { electionId } = req.body;

  try {
    // Check if election exists and is active
    const election = await Election.findById(electionId);
    
    if (!election) {
      return next(new ErrorResponse('Election not found', 404));
    }

    if (new Date() < election.startDate || new Date() > election.endDate) {
      return next(new ErrorResponse('Election is not currently active', 400));
    }

    // Check if user has already voted
    const existingVote = await Vote.findOne({
      election: electionId,
      voter: req.user.id,
    });

    if (existingVote) {
      return next(new ErrorResponse('You have already voted in this election', 400));
    }

    // Check if user profile is verified
    const profile = await VoterProfile.findOne({ user: req.user.id });
    
    if (!profile || !profile.isVerified) {
      return next(new ErrorResponse('Your profile is not verified', 403));
    }

    // Generate unique voting token
    const votingToken = crypto.randomBytes(32).toString('hex');
    const votingLink = `${req.protocol}://${req.get('host')}/api/v1/votes/cast/${votingToken}`;

    // Store in Redis with 2 minute expiration
    await redis.set(`vote:${votingToken}`, JSON.stringify({
      userId: req.user.id,
      electionId,
    }), 'EX', 120); // 2 minutes

    // Send email with voting link
    try {
      await sendEmail({
        email: req.user.email,
        subject: 'Your Voting Link - Online Voting System',
        message: `Please use the following link to cast your vote. This link will expire in 2 minutes: ${votingLink}`,
      });

      // Log the action
      await AuditLog.create({
        action: 'Voting link generated',
        user: req.user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: { electionId },
      });

      res.status(200).json({
        success: true,
        data: {
          message: 'Voting link sent to your email',
          expiresIn: '2 minutes',
        },
      });
    } catch (err) {
      console.error(err);
      await redis.del(`vote:${votingToken}`);
      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Cast vote
// @route   POST /api/v1/votes/cast/:token
// @access  Private
exports.castVote = async (req, res, next) => {
  const votingToken = req.params.token;
  const { candidateId, faceImage } = req.body;

  try {
    // Verify voting token from Redis
    const voteData = await redis.get(`vote:${votingToken}`);
    
    if (!voteData) {
      return next(new ErrorResponse('Invalid or expired voting link', 400));
    }

    const { userId, electionId } = JSON.parse(voteData);

    // Verify user
    if (userId !== req.user.id) {
      return next(new ErrorResponse('Unauthorized to use this voting link', 401));
    }

    // Check if election exists and is active
    const election = await Election.findById(electionId);
    
    if (!election) {
      return next(new ErrorResponse('Election not found', 404));
    }

    if (new Date() < election.startDate || new Date() > election.endDate) {
      return next(new ErrorResponse('Election is not currently active', 400));
    }

    // Check if candidate exists in this election
    const candidate = election.candidates.find(c => c._id.toString() === candidateId);
    
    if (!candidate) {
      return next(new ErrorResponse('Candidate not found in this election', 404));
    }

    // Check if user has already voted
    const existingVote = await Vote.findOne({
      election: electionId,
      voter: req.user.id,
    });

    if (existingVote) {
      return next(new ErrorResponse('You have already voted in this election', 400));
    }

    // Verify face image if provided
    let faceVerificationResult = null;
    if (faceImage) {
      const profile = await VoterProfile.findOne({ user: req.user.id }).select('+faceData');
      
      if (profile && profile.faceData) {
        faceVerificationResult = await verifyFace(profile.faceData, faceImage);
        
        if (!faceVerificationResult.isVerified) {
          return next(new ErrorResponse('Face verification failed', 401));
        }
      }
    }

    // Get location data
    const location = {
      ip: req.ip,
      ...req.geo, // Assuming you have geoip middleware
    };

    // Create vote
    const vote = await Vote.create({
      election: electionId,
      voter: req.user.id,
      candidate: candidateId,
      location,
      facialVerification: faceVerificationResult,
    });

    // Record on blockchain (pseudo-implementation)
    const txHash = await recordVoteOnBlockchain(vote);

    // Update vote with blockchain tx hash
    vote.blockchainTxHash = txHash;
    await vote.save();

    // Delete voting token from Redis
    await redis.del(`vote:${votingToken}`);

    // Log the action
    await AuditLog.create({
      action: 'Vote cast',
      user: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { electionId, candidateId },
    });

    res.status(201).json({
      success: true,
      data: {
        vote,
        message: 'Vote successfully cast',
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get my votes
// @route   GET /api/v1/votes/my-votes
// @access  Private
exports.getMyVotes = async (req, res, next) => {
  try {
    const votes = await Vote.find({ voter: req.user.id })
      .populate({
        path: 'election',
        select: 'title startDate endDate',
      })
      .select('-voter -location -facialVerification');

    res.status(200).json({
      success: true,
      count: votes.length,
      data: votes,
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to verify face
async function verifyFace(registeredFaceData, capturedImage) {
  // Implement face verification using AWS Rekognition or similar service
  const rekognition = new AWS.Rekognition();
  
  const params = {
    SourceImage: {
      Bytes: Buffer.from(registeredFaceData, 'base64'),
    },
    TargetImage: {
      Bytes: Buffer.from(capturedImage, 'base64'),
    },
    SimilarityThreshold: 90,
  };

  try {
    const data = await rekognition.compareFaces(params).promise();
    
    if (data.FaceMatches && data.FaceMatches.length > 0) {
      return {
        isVerified: true,
        similarityScore: data.FaceMatches[0].Similarity,
        verificationTime: new Date(),
      };
    }
    
    return {
      isVerified: false,
      similarityScore: 0,
      verificationTime: new Date(),
    };
  } catch (err) {
    console.error('Face verification error:', err);
    throw new Error('Face verification failed');
  }
}

// Helper function to record vote on blockchain
async function recordVoteOnBlockchain(vote) {
  // This is a pseudo-implementation
  // In a real scenario, you would interact with your blockchain network
  return `0x${crypto.randomBytes(32).toString('hex')}`;
}