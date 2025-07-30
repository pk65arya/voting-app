// controllers/supportController.js

// @desc    Start chat session (REST fallback)
// @route   POST /api/v1/support/chat
exports.startChat = async (req, res, next) => {
  // TODO: Integrate with Socket.io for real-time chat
  res
    .status(200)
    .json({ success: true, message: "Chat session started (stub)" });
};

// @desc    Send message (REST fallback)
// @route   POST /api/v1/support/message
exports.sendMessage = async (req, res, next) => {
  // TODO: Integrate with Socket.io for real-time chat
  res.status(200).json({ success: true, message: "Message sent (stub)" });
};
