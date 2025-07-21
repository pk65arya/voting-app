const express = require('express');
const {
  generateVotingLink,
  castVote,
  getMyVotes,
} = require('../controllers/voteController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  generateLinkValidator,
  castVoteValidator,
} = require('../utils/validators');

const router = express.Router();

router.post(
  '/generate-link',
  protect,
  generateLinkValidator,
  validate,
  generateVotingLink
);

router.post(
  '/cast/:token',
  protect,
  castVoteValidator,
  validate,
  castVote
);

router.get('/my-votes', protect, getMyVotes);

module.exports = router;