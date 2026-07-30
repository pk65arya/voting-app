const ErrorResponse = require("../utils/errorResponse");

// In-memory store for demo; in production use a database model
let tickets = [];
let ticketIdCounter = 1;

// @desc    Create support ticket
// @route   POST /api/v1/support/ticket
// @access  Private
exports.createTicket = async (req, res, next) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return next(new ErrorResponse("Please provide subject and message", 400));
    }

    const ticket = {
      id: ticketIdCounter++,
      user: req.user.id,
      subject,
      message,
      status: "open",
      createdAt: new Date(),
      replies: [],
    };

    tickets.push(ticket);

    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

// @desc    Get my support tickets
// @route   GET /api/v1/support/tickets
// @access  Private
exports.getMyTickets = async (req, res, next) => {
  try {
    const userTickets = tickets.filter((t) => t.user === req.user.id);
    res.status(200).json({ success: true, count: userTickets.length, data: userTickets });
  } catch (err) {
    next(err);
  }
};

// @desc    Reply to support ticket
// @route   POST /api/v1/support/ticket/:id/reply
// @access  Private
exports.replyToTicket = async (req, res, next) => {
  try {
    const { message } = req.body;
    const ticketId = parseInt(req.params.id, 10);

    const ticket = tickets.find((t) => t.id === ticketId);

    if (!ticket) {
      return next(new ErrorResponse("Ticket not found", 404));
    }

    ticket.replies.push({
      user: req.user.id,
      message,
      createdAt: new Date(),
    });

    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all tickets (admin)
// @route   GET /api/v1/support/all
// @access  Private/Admin
exports.getAllTickets = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (err) {
    next(err);
  }
};
