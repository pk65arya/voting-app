const Election = require("../models/Election");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Create a new election (admin)
// @route   POST /api/v1/elections
// @access  Private/Admin
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
// @access  Public
exports.getElections = async (req, res, next) => {
  try {
    const elections = await Election.find().sort("-createdAt");
    res.status(200).json({ success: true, count: elections.length, data: elections });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single election
// @route   GET /api/v1/elections/:id
// @access  Public
exports.getElection = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return next(new ErrorResponse("Election not found", 404));
    }

    res.status(200).json({ success: true, data: election });
  } catch (err) {
    next(err);
  }
};

// @desc    Update election
// @route   PUT /api/v1/elections/:id
// @access  Private/Admin
exports.updateElection = async (req, res, next) => {
  try {
    const election = await Election.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!election) {
      return next(new ErrorResponse("Election not found", 404));
    }

    res.status(200).json({ success: true, data: election });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete election
// @route   DELETE /api/v1/elections/:id
// @access  Private/Admin
exports.deleteElection = async (req, res, next) => {
  try {
    const election = await Election.findByIdAndDelete(req.params.id);

    if (!election) {
      return next(new ErrorResponse("Election not found", 404));
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// @desc    Get election results (public, after election ends)
// @route   GET /api/v1/elections/:id/results
// @access  Public
exports.getElectionResults = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return next(new ErrorResponse("Election not found", 404));
    }

    const Vote = require("../models/Vote");
    const totalVotes = await Vote.countDocuments({ election: election._id });

    const candidateVotes = await Vote.aggregate([
      { $match: { election: election._id } },
      { $group: { _id: "$candidate", count: { $sum: 1 } } },
    ]);

    const results = election.candidates.map((candidate) => {
      const voteData = candidateVotes.find(
        (cv) => cv._id.toString() === candidate._id.toString()
      );
      return {
        candidateId: candidate._id,
        name: candidate.name,
        party: candidate.party,
        votes: voteData ? voteData.count : 0,
        percentage: totalVotes > 0
          ? ((voteData ? voteData.count : 0) / totalVotes * 100).toFixed(2)
          : "0.00",
      };
    });

    res.status(200).json({
      success: true,
      data: {
        election: {
          id: election._id,
          title: election.title,
          startDate: election.startDate,
          endDate: election.endDate,
          isActive: election.isActive,
        },
        totalVotes,
        results,
      },
    });
  } catch (err) {
    next(err);
  }
};
