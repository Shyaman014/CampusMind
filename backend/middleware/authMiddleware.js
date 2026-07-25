const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized to access this route');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'campusmind_super_secret_jwt_key_2026_production'
    );

    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 401, 'User associated with token no longer exists');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }
    return errorResponse(res, 401, 'Token invalid or expired', err);
  }
};

const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'campusmind_super_secret_jwt_key_2026_production'
      );
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
        return next();
      }
    } catch (err) {
      // Fallthrough to guest
    }
  }

  // Fallback Guest User for instant access
  req.user = { _id: '65f1a2b3c4d5e6f7a8b9c0d1', id: '65f1a2b3c4d5e6f7a8b9c0d1', name: 'Campus Scholar', role: 'student' };
  next();
};

module.exports = { protect, optionalAuth };
