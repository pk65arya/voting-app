const express = require("express");
const router = express.Router();
const {
  getElections,
  getElection,
  createElection,
  updateElection,
  deleteElection,
  getElectionResults,
} = require("../controllers/electionController");
const { protect, authorize } = require("../middleware/auth");

// Public routes
router.get("/", getElections);
router.get("/:id", getElection);
router.get("/:id/results", getElectionResults);

// Admin only routes
router.post("/", protect, authorize("admin"), createElection);
router.put("/:id", protect, authorize("admin"), updateElection);
router.delete("/:id", protect, authorize("admin"), deleteElection);

module.exports = router;
