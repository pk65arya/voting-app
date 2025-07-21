const crypto = require('crypto');

// Format success response
exports.successResponse = (res, data, message = '', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

// Format error response
exports.errorResponse = (res, error, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error: error.message || error.toString()
  });
};

// Generate random token
exports.generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};