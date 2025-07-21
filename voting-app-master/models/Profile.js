// models/Profile.js
const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  fullName: String,
  gender: String,
  address: String,
  mobile: String,
});

module.exports = mongoose.model('Profile', ProfileSchema);
