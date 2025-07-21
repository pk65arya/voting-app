const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');

// Generate JWT token
exports.generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE
  });
};

// Generate MFA secret
exports.generateMfaSecret = () => {
  return crypto.randomBytes(20).toString('hex');
};

// Verify MFA code (example using TOTP)
exports.verifyMfaCode = (secret, code) => {
  // In a real implementation, you would use a library like speakeasy or otplib
  // This is just a placeholder implementation
  const generatedCode = crypto.createHash('sha256')
    .update(secret + Math.floor(Date.now() / 30000)) // 30-second window
    .digest('hex')
    .substr(0, 6);
    
  return generatedCode === code;
};