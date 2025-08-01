const { check } = require('express-validator');
const { body } = require('express-validator');

exports.registerValidator = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 6+ characters').isLength({ min: 6 })
];

exports.loginValidator = [
  check('email', 'Email is required').notEmpty(),
  check('password', 'Password is required').exists()
];
exports.verifyMfaValidator = [
  check('mfaToken', 'MFA token is required').notEmpty(),
  check('mfaCode', 'MFA code is required').notEmpty().isLength({ min: 6, max: 6 })
];

exports.forgotPasswordValidator = [
  // Validate email field
  check('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
    
  // You can add additional security checks if needed
  // check('securityQuestion')
  //   .if(check('email').exists())
  //   .notEmpty().withMessage('Security question is required')
];

exports.resetPasswordValidator = [
  // Validate password field
  check('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain a number')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),
    
  // Validate password confirmation
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  
  // Validate token format (if using JWT)
  check('token')
    .if((value, { req }) => req.path.includes('reset-password'))
    .notEmpty().withMessage('Reset token is required')
    .isJWT().withMessage('Invalid token format')
];
exports.generateLinkValidator = [
  body('electionId')
    .notEmpty()
    .withMessage('Election ID is required'),
];

exports.castVoteValidator = [
  body('voterId')
    .notEmpty()
    .withMessage('Voter ID is required'),
  body('candidateId')
    .notEmpty()
    .withMessage('Candidate ID is required'),
];
