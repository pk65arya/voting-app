const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  election: {
    type: mongoose.Schema.ObjectId,
    ref: 'Election',
    required: true,
  },
  voter: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  candidate: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  location: {
    ip: String,
    country: String,
    region: String,
    city: String,
    lat: Number,
    lng: Number,
  },
  facialVerification: {
    isVerified: Boolean,
    similarityScore: Number,
    verificationTime: Date,
  },
  blockchainTxHash: String,
  isAnonymous: {
    type: Boolean,
    default: true,
  },
});

// Prevent duplicate votes
VoteSchema.index({ election: 1, voter: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema);