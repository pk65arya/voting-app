// controllers/profileController.js
const Profile = require('../models/Profile');
const ErrorResponse = require('../utils/errorResponse');

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return next(new ErrorResponse('Profile not found', 404));
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

exports.createProfile = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const profile = await Profile.create(req.body);
    res.status(201).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!profile) return next(new ErrorResponse('Profile not found', 404));
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};
