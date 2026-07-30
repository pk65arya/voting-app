const Feedback = require("../models/Feedback");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Submit feedback
// @route   POST /api/v1/feedback
// @access  Public (optionally authenticated)
exports.submitFeedback = async (req, res, next) => {
  try {
    const { message, rating } = req.body;

    if (!message) {
      return next(new ErrorResponse("Please provide a message", 400));
    }

    const feedbackData = { message, rating };

    // Associate with user if authenticated
    if (req.user) {
      feedbackData.user = req.user.id;
    }

    const feedback = await Feedback.create(feedbackData);
    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all feedback (admin)
// @route   GET /api/v1/feedback
// @access  Private/Admin
exports.getAllFeedback = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const total = await Feedback.countDocuments();
    const feedbacks = await Feedback.find()
      .populate("user", "email")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: feedbacks,
    });
  } catch (err) {
    next(err);
  }
};
