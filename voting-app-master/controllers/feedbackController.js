// controllers/feedbackController.js
const Feedback = require("../models/Feedback");

// @desc    Submit feedback
// @route   POST /api/v1/feedback
exports.submitFeedback = async (req, res, next) => {
  // TODO: Validate input, associate with user if authenticated
  const feedback = await Feedback.create(req.body);
  res.status(201).json({ success: true, data: feedback });
};

// @desc    Get all feedback (admin)
// @route   GET /api/v1/feedback
exports.getAllFeedback = async (req, res, next) => {
  // TODO: Add admin check
  const feedbacks = await Feedback.find();
  res.status(200).json({ success: true, data: feedbacks });
};
