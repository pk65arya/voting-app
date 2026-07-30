const express = require("express");
const router = express.Router();
const {
  createTicket,
  getMyTickets,
  replyToTicket,
  getAllTickets,
} = require("../controllers/supportController");
const { protect, authorize } = require("../middleware/auth");

router.post("/ticket", protect, createTicket);
router.get("/tickets", protect, getMyTickets);
router.post("/ticket/:id/reply", protect, replyToTicket);
router.get("/all", protect, authorize("admin"), getAllTickets);

module.exports = router;
