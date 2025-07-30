// routes/electionRoutes.js
const express = require("express");
const router = express.Router();
const electionController = require("../controllers/electionController");

// List all elections
router.get("/", electionController.getElections);
// Create a new election (admin)
router.post("/", electionController.createElection);

module.exports = router;
