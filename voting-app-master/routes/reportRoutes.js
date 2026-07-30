const express = require("express");
const router = express.Router();
const { getVotingReport, getAuditTrail } = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/auth");

router.get("/voting", protect, authorize("admin"), getVotingReport);
router.get("/audit", protect, authorize("admin"), getAuditTrail);

module.exports = router;
