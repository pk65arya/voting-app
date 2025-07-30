// routes/feedbackRoutes.js
const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");

router.post("/", feedbackController.submitFeedback);
router.get("/", feedbackController.getAllFeedback); // Admin only

module.exports = router;
