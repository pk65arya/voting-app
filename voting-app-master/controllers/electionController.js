// controllers/electionController.js
const Election = require("../models/Election");

// @desc    Create a new election (admin)
// @route   POST /api/v1/elections
exports.createElection = async (req, res, next) => {
  try {
    const election = await Election.create(req.body);
    res.status(201).json({ success: true, data: election });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all elections
// @route   GET /api/v1/elections
exports.getElections = async (req, res, next) => {
  try {
    const elections = await Election.find();
    res.status(200).json({ success: true, data: elections });
  } catch (err) {
    next(err);
  }
};
