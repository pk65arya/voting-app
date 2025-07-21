const mongoose = require('mongoose');

const VoterProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: [true, 'Please add your full name'],
  },
  dob: {
    type: Date,
    required: [true, 'Please add your date of birth'],
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  voterId: {
    type: String,
    required: [true, 'Please add your voter ID'],
    unique: true,
  },
  idDocument: {
    url: String,
    publicId: String,
    documentType: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationNotes: String,
  faceData: {
    type: String,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('VoterProfile', VoterProfileSchema);