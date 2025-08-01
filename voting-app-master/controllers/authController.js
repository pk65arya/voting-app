const User = require("../models/User");
const VoterProfile = require("../models/VoterProfile");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../services/emailService");
const {
  generateToken,
  generateMfaSecret,
  verifyMfaCode,
} = require("../utils/generateTokens");
const { validationResult } = require("express-validator");
const redis = require("../services/redisService");
const AWS = require("aws-sdk");
const crypto = require("crypto");
const config = require("../config/config");
// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }

  const { email, password } = req.body;

  try {
    // Create user
    const user = await User.create({
      email,
      password,
      mfaSecret: generateMfaSecret(),
    });

    // Generate verification token
    const verificationToken = user.getVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Create verification URL
    const verificationUrl =  `http://localhost:5173/verify/${verificationToken}`;

    // Send email
    try {
      await sendEmail({
        email: user.email,
        subject: "Email Verification - Online Voting System",
        message: `Please verify your email by clicking on the following link: ${verificationUrl}`,
      });

      res.status(200).json({
        success: true,
        data: "Verification email sent",
      });
    } catch (err) {
      console.error(err);
      user.verificationToken = undefined;
      user.verificationTokenExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Verify email
// @route   GET /api/v1/auth/verify/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  const verificationToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  try {
    const user = await User.findOne({
      verificationToken,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      // Check if the user is already verified by email
      const alreadyVerified = await User.findOne({ isVerified: true });
      if (alreadyVerified) {
        return res.status(200).json({
          success: true,
          message: "Email already verified",
        });
      }

      return next(new ErrorResponse("Invalid or expired token", 400));
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email }).select("+password +mfaSecret");

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check if email is verified
    if (!user.isVerified) {
      return next(new ErrorResponse("Please verify your email first", 401));
    }

    // Generate MFA token and store in Redis
    const mfaToken = crypto.randomBytes(20).toString("hex");
    await redis.set(`mfa:${mfaToken}`, user.id, "EX", 300); // 5 minutes expiration

    // Log the MFA code for development/testing
    const generatedCode = crypto
      .createHash("sha256")
      .update(user.mfaSecret + Math.floor(Date.now() / 120000)) // 2-minute window
      .digest("hex")
      .substr(0, 6);
    await redis.set(`code:${user.id}`, generatedCode, "EX", 300);
    console.log(user.email)

// Send MFA code via email
await sendEmail({
  email: user.email,
  subject: "Your MFA Verification Code",
  message: `Your MFA verification code is: ${generatedCode}`,
});

console.log(`MFA code for user ${user.email}: ${generatedCode}`); // For debugging

    res.status(200).json({
      success: true,
      mfaToken,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify MFA
// @route   POST /api/v1/auth/verify-mfa
// @access  Public
exports.verifyMfa = async (req, res, next) => {
  const { mfaToken, mfaCode } = req.body;

  try {
    // Get user ID from Redis
    const userId = await redis.get(`mfa:${mfaToken}`);

    if (!userId) {
      return next(new ErrorResponse("Invalid or expired MFA token", 400));
    }

    // Get user
    const user = await User.findById(userId).select("+mfaSecret");

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // Get expected code
    const expectedCode = await redis.get(`code:${user.id}`);

    if (!expectedCode || expectedCode !== mfaCode) {
      return next(new ErrorResponse("Invalid MFA code", 401));
    }

    // Verify MFA code (TOTP for example)
    const isVerified = verifyMfaCode(user.mfaSecret, mfaCode);
    if (!isVerified) {
      return next(new ErrorResponse("Invalid MFA code", 401));
    }

    // Clean up Redis
    await redis.del(`mfa:${mfaToken}`);
    await redis.del(`code:${user.id}`);

    // Generate JWT token
    const token = generateToken(user.id);

    // Set cookie options
    const options = {
      expires: new Date(Date.now() + config.COOKIE_EXPIRE),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    res.status(200).cookie("token", token, options).json({
      success: true,
      token,
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const profile = await VoterProfile.findOne({ user: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        user,
        profile,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse("No user with that email", 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `http://localhost:5173/resetpassword/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        message: `You are receiving this email because you (or someone else) has requested a password reset. Please make a PUT request to: \n\n ${resetUrl}`,
      });

      res.status(200).json({
        success: true,
        data: "Email sent",
      });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse("Invalid token", 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate JWT token
    // const token = generateToken(user.id);

    res.status(200).json({
      success: true,
  
    });
  } catch (err) {
    next(err);
  }
};
