// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.js');
const {
  getProfile,
  createProfile,
  updateProfile
} = require('../controllers/profileController.js');

router
  .route('/')
  .get(protect, getProfile)
  .post(protect, createProfile)
  .put(protect, updateProfile);

module.exports = router;
