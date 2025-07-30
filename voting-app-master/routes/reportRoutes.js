// routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/voting", reportController.getVotingReport); // Admin only
router.get("/audit", reportController.getAuditTrail); // Admin only

module.exports = router;
