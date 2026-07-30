const Vote = require("../models/Vote");
const AuditLog = require("../models/AuditLog");
const Election = require("../models/Election");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Get voting statistics report
// @route   GET /api/v1/reports/voting
// @access  Private/Admin
exports.getVotingReport = async (req, res, next) => {
  try {
    const elections = await Election.find();

    const report = await Promise.all(
      elections.map(async (election) => {
        const totalVotes = await Vote.countDocuments({ election: election._id });

        const candidateVotes = await Vote.aggregate([
          { $match: { election: election._id } },
          { $group: { _id: "$candidate", count: { $sum: 1 } } },
        ]);

        const candidateResults = election.candidates.map((candidate) => {
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

        return {
          electionId: election._id,
          title: election.title,
          startDate: election.startDate,
          endDate: election.endDate,
          isActive: election.isActive,
          totalVotes,
          candidates: candidateResults,
        };
      })
    );

    res.status(200).json({ success: true, count: report.length, data: report });
  } catch (err) {
    next(err);
  }
};

// @desc    Get audit trail
// @route   GET /api/v1/reports/audit
// @access  Private/Admin
exports.getAuditTrail = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const skip = (page - 1) * limit;

    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .populate("user", "email")
      .sort("-timestamp")
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};
