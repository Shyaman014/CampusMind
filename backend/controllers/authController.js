const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department, yearOfStudy } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return errorResponse(res, 400, 'User with this email already exists');
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      department: department || 'Computer Science',
      yearOfStudy: yearOfStudy || '1st Year',
      verificationToken,
      verificationTokenExpire,
      isVerified: true, // Auto-verified for instant seamless dev testing, token preserved for email flow
    });

    const token = generateToken(user._id);

    return successResponse(res, 201, 'User registered successfully', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        reputation: user.reputation,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Error registering user', error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password');
    }

    let user = await User.findOne({ email }).select('+password');
    if (!user && (email === 'student@campusmind.ai' || email === 'admin@campusmind.ai' || email === 'guest@campusmind.ai')) {
      const seedDemoUsers = require('../utils/seedDemo');
      await seedDemoUsers();
      user = await User.findOne({ email }).select('+password');
    }
    if (!user || !(await user.matchPassword(password))) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Daily Streak Update
    const lastActive = new Date(user.lastActiveDate || Date.now());
    const now = new Date();
    const diffDays = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      user.streakDays += 1;
    } else if (diffDays > 1) {
      user.streakDays = 1;
    }
    user.lastActiveDate = now;
    await user.save();

    const token = generateToken(user._id);

    return successResponse(res, 200, 'Login successful', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        reputation: user.reputation,
        streakDays: user.streakDays,
        department: user.department,
        badges: user.badges,
      },
      token,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Login failed', error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return successResponse(res, 200, 'User profile fetched', user);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch user', error);
  }
};

// @desc    Update user profile (name, avatar)
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0 || name.length > 50) {
        return errorResponse(res, 400, 'Name must be a valid string between 1 and 50 characters');
      }
      user.name = name.trim();
    }
    if (avatar !== undefined) {
      if (typeof avatar !== 'string' || !avatar.startsWith('http')) {
        return errorResponse(res, 400, 'Avatar must be a valid HTTP/HTTPS URL');
      }
      user.avatar = avatar.trim();
    }

    await user.save();

    return successResponse(res, 200, 'Profile updated successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      reputation: user.reputation,
      streakDays: user.streakDays,
      department: user.department,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to update profile', error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return errorResponse(res, 404, 'There is no user with that email');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested to reset a password. Please make a PUT request to: \n\n ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token - CampusMind AI',
      message,
    });

    return successResponse(res, 200, 'Email sent with reset link', { resetToken });
  } catch (error) {
    return errorResponse(res, 500, 'Email could not be sent', error);
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return errorResponse(res, 400, 'Invalid or expired reset token');
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    return successResponse(res, 200, 'Password reset successful', { token });
  } catch (error) {
    return errorResponse(res, 500, 'Reset password failed', error);
  }
};
