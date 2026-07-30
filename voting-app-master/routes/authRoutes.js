const express = require('express');
const {
  register,
  verifyEmail,
  login,
  verifyMfa,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  registerValidator,
  loginValidator,
  verifyMfaValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../utils/validators');

const router = express.Router();

router.post('/register', registerValidator, validate, register);
router.get('/verify/:token', verifyEmail);
router.post('/login', loginValidator, validate, login);
router.post('/verifyMfa', verifyMfaValidator, validate, verifyMfa);
router.get('/getMe', protect, getMe);
router.get('/logout', protect, logout);
router.post('/forgotPassword', forgotPasswordValidator, validate, forgotPassword);
router.put('/resetpassword/:resettoken', resetPasswordValidator, validate, resetPassword);

module.exports = router;