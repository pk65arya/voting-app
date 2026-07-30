const express = require("express");
const router = express.Router();
const { submitFeedback, getAllFeedback } = require("../controllers/feedbackController");
const { protect, authorize } = require("../middleware/auth");

// Public/authenticated - submit feedback
router.post("/", submitFeedback);

// Admin only - get all feedback
router.get("/", protect, authorize("admin"), getAllFeedback);

module.exports = router;
