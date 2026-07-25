const jwt = require('jsonwebtoken');

const generateToken = (id, expiresIn = '15m') => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'campusmind_super_secret_jwt_key_2026_production', {
    expiresIn,
  });
};

const generateRefreshToken = (id, expiresIn = '30d') => {
  return jwt.sign({ id, type: 'refresh' }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'campusmind_super_secret_jwt_key_2026_production', {
    expiresIn,
  });
};

generateToken.generateToken = generateToken;
generateToken.generateRefreshToken = generateRefreshToken;

module.exports = generateToken;
