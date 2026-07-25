const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  oauthSuccessRedirect,
  refreshToken,
  logout,
  logoutAllDevices,
  verifyEmail,
  resendVerification,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter, loginLimiter, forgotPasswordLimiter, resendVerificationLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/logout-all', protect, logoutAllDevices);
router.get('/verifyemail/:token', verifyEmail);
router.post('/resend-verification', resendVerificationLimiter, resendVerification);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/forgotpassword', forgotPasswordLimiter, forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// OAuth 2.0 Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=GoogleAuthFailed' }),
  oauthSuccessRedirect
);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'], session: false }));
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/login?error=FacebookAuthFailed' }),
  oauthSuccessRedirect
);

module.exports = router;
