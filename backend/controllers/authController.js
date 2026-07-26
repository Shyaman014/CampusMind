const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendEmail, getVerificationEmailHtml, getPasswordResetEmailHtml, getWelcomeEmailHtml } = require('../utils/sendEmail');
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

    const isDemoOrTest = process.env.NODE_ENV === 'test' || email.endsWith('@campusmind.ai');

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      department: department || 'Computer Science',
      yearOfStudy: yearOfStudy || '1st Year',
      verificationToken,
      verificationTokenExpire,
      isVerified: isDemoOrTest,
      emailVerified: isDemoOrTest,
    });

    if (!isDemoOrTest) {
      const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
      await sendEmail({
        email: user.email,
        subject: 'Verify Your Email Address - CampusMind AI',
        html: getVerificationEmailHtml(user.name, verifyUrl),
      });
    }

    const token = generateToken(user._id, '30d');
    const refreshToken = generateToken.generateRefreshToken(user._id, '30d');
    const expiresAtMs = 30 * 24 * 60 * 60 * 1000;
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + expiresAtMs),
      deviceInfo: req.headers['user-agent'] || 'unknown',
      isValid: true,
    });
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: expiresAtMs,
    });

    return successResponse(res, 201, 'User registered successfully', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        reputation: user.reputation,
        isVerified: user.isVerified,
        emailVerified: user.emailVerified,
      },
      token,
      refreshToken,
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
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password');
    }

    let user = await User.findOne({ email }).select('+password');
    if (!user && (email === 'student@campusmind.ai' || email === 'admin@campusmind.ai' || email === 'guest@campusmind.ai')) {
      const seedDemoUsers = require('../utils/seedDemo');
      await seedDemoUsers();
      user = await User.findOne({ email }).select('+password');
    }
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    if (user.isAccountLocked()) {
      const lockMinutes = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
      return errorResponse(res, 423, `Account is locked due to too many failed login attempts. Please try again after ${lockMinutes} minutes.`);
    }

    if (!user.password && (user.provider === 'google' || user.provider === 'facebook')) {
      const providerName = user.provider.charAt(0).toUpperCase() + user.provider.slice(1);
      return errorResponse(res, 400, `This account was registered using ${providerName}. Please sign in with ${providerName}.`);
    }

    if (!(await user.matchPassword(password))) {
      await user.incrementLoginAttempts();
      if (user.isAccountLocked()) {
        return errorResponse(res, 423, 'Account is locked due to too many failed login attempts. Please try again after 30 minutes.');
      }
      return errorResponse(res, 401, 'Invalid email or password');
    }

    if (!user.emailVerified && !user.isVerified && !user.email.endsWith('@campusmind.ai') && process.env.NODE_ENV !== 'test') {
      return res.status(403).json({
        success: false,
        requireVerification: true,
        email: user.email,
        message: 'Please verify your email address to sign in.',
      });
    }

    await user.resetLoginAttempts();

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
    user.lastLogin = now;
    user.rememberMe = !!rememberMe;

    const duration = rememberMe ? '30d' : '7d';
    const accessToken = generateToken(user._id, duration);
    const refreshDuration = rememberMe ? '30d' : '7d';
    const refreshToken = generateToken.generateRefreshToken(user._id, refreshDuration);

    const expiresAtMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + expiresAtMs),
      deviceInfo: req.headers['user-agent'] || 'unknown',
      isValid: true,
    });
    if (user.refreshTokens.length > 10) {
      user.refreshTokens = user.refreshTokens.slice(-10);
    }
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: expiresAtMs,
    });

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
        emailVerified: user.emailVerified || user.isVerified,
      },
      token: accessToken,
      refreshToken,
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
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expireTime = Date.now() + 15 * 60 * 1000; // 15 minutes

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = expireTime;
    user.passwordResetToken = hashedToken;
    user.passwordResetExpire = expireTime;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token - CampusMind AI',
      html: getPasswordResetEmailHtml(user.name, resetUrl),
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
    const hashedToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
      $or: [
        { resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } },
        { passwordResetToken: hashedToken, passwordResetExpire: { $gt: Date.now() } },
      ],
    });

    if (!user) {
      return errorResponse(res, 400, 'Invalid or expired reset token');
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    const token = generateToken(user._id, '30d');

    return successResponse(res, 200, 'Password reset successful', { token });
  } catch (error) {
    return errorResponse(res, 500, 'Reset password failed', error);
  }
};

// @desc    OAuth Success Redirect Callback
// @route   GET /api/auth/google/callback, GET /api/auth/facebook/callback
// @access  Public
exports.oauthSuccessRedirect = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=OAuthFailed`);
    }
    const token = generateToken(req.user._id, '30d');
    const refreshToken = generateToken.generateRefreshToken(req.user._id, '30d');
    
    req.user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      deviceInfo: req.headers['user-agent'] || 'oauth',
      isValid: true,
    });
    await req.user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/oauth-callback?token=${token}&refreshToken=${refreshToken}`);
  } catch (error) {
    console.error('OAuth Redirect Error:', error);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/login?error=OAuthServerError`);
  }
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public (using Refresh Token)
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken || req.headers['x-refresh-token'];
    if (!token) {
      return errorResponse(res, 401, 'No refresh token provided');
    }

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'campusmind_super_secret_jwt_key_2026_production';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return errorResponse(res, 401, 'Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 401, 'User not found for this refresh token');
    }

    const tokenIndex = user.refreshTokens.findIndex((t) => t.token === token && t.isValid);
    if (tokenIndex === -1) {
      // Possible token reuse attack - invalidate all refresh tokens for security
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });
      return errorResponse(res, 401, 'Invalidated refresh token detected. Please sign in again.');
    }

    // Token rotation
    user.refreshTokens[tokenIndex].isValid = false;
    const duration = user.rememberMe ? '30d' : '7d';
    const newAccessToken = generateToken(user._id, duration);
    const refreshDuration = user.rememberMe ? '30d' : '7d';
    const newRefreshToken = generateToken.generateRefreshToken(user._id, refreshDuration);

    const expiresAtMs = user.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    user.refreshTokens.push({
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + expiresAtMs),
      deviceInfo: req.headers['user-agent'] || 'unknown',
      isValid: true,
    });
    if (user.refreshTokens.length > 10) {
      user.refreshTokens = user.refreshTokens.slice(-10);
    }
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: expiresAtMs,
    });

    return successResponse(res, 200, 'Token refreshed successfully', {
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Error refreshing token', error);
  }
};

// @desc    Logout user (current device)
// @route   POST /api/auth/logout
// @access  Public
exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken || req.headers['x-refresh-token'];
    if (token && req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);
        await user.save({ validateBeforeSave: false });
      }
    }
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    return successResponse(res, 200, 'Logged out successfully');
  } catch (error) {
    return successResponse(res, 200, 'Logged out');
  }
};

// @desc    Logout user from all devices
// @route   POST /api/auth/logout-all
// @access  Private
exports.logoutAllDevices = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });
    }
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    return successResponse(res, 200, 'Logged out from all devices successfully');
  } catch (error) {
    return errorResponse(res, 500, 'Error logging out from all devices', error);
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verifyemail/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      $or: [
        { verificationToken: token },
        { verificationToken: hashedToken },
      ],
    });

    if (!user) {
      return errorResponse(res, 400, 'Invalid or expired verification token');
    }

    if (user.verificationTokenExpire && user.verificationTokenExpire < Date.now() && !user.isVerified) {
      return errorResponse(res, 400, 'Verification token has expired. Please request a new verification email.');
    }

    user.emailVerified = true;
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    await sendEmail({
      email: user.email,
      subject: 'Welcome to CampusMind AI! 🎉',
      html: getWelcomeEmailHtml(user.name, clientUrl),
    });

    return successResponse(res, 200, 'Email verified successfully', {
      emailVerified: true,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Email verification failed', error);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 400, 'Please provide an email address');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, 'No user found with that email address');
    }

    if (user.emailVerified || user.isVerified) {
      return errorResponse(res, 400, 'This account is already verified. You can log in directly.');
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email Address - CampusMind AI',
      html: getVerificationEmailHtml(user.name, verifyUrl),
    });

    return successResponse(res, 200, 'Verification email sent successfully');
  } catch (error) {
    return errorResponse(res, 500, 'Failed to resend verification email', error);
  }
};
