const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

// Google OAuth 2.0 Strategy
const googleClientId = process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID_PLACEHOLDER';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET_PLACEHOLDER';
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback';

if (googleClientId === 'GOOGLE_CLIENT_ID_PLACEHOLDER') {
  console.warn('[Passport] WARNING: GOOGLE_CLIENT_ID not set. Google OAuth will use placeholder keys.');
}

passport.use(
  new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackUrl,
      proxy: true, // Crucial for Railway/Vercel HTTPS proxies
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
        const name = profile.displayName || (email ? email.split('@')[0] : 'Google User');

        // 1. Check if user exists by googleId
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          user.lastLogin = new Date();
          await user.save({ validateBeforeSave: false });
          return done(null, user);
        }

        // 2. If not found by googleId, check by email (Account Linking)
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            if (user.provider === 'email') {
              user.provider = 'google';
            }
            user.emailVerified = true;
            if (!user.avatar || user.avatar.includes('unsplash.com')) {
              user.avatar = avatar || user.avatar;
            }
            user.lastLogin = new Date();
            await user.save({ validateBeforeSave: false });
            return done(null, user);
          }
        }

        // 3. If no account exists, automatically create a new student account
        if (!email) {
          return done(new Error('No email found in Google OAuth profile'), null);
        }

        user = await User.create({
          name,
          email,
          provider: 'google',
          googleId: profile.id,
          avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          role: 'student',
          department: 'Computer Science & Engineering',
          yearOfStudy: '1st Year',
          reputation: 10,
          streakDays: 1,
          emailVerified: true,
          isVerified: true,
          lastLogin: new Date(),
        });

        return done(null, user);
      } catch (error) {
        console.error('[Passport] Google OAuth Error:', error);
        return done(error, null);
      }
    }
  )
);

// Facebook OAuth 2.0 Strategy
const facebookAppId = process.env.FACEBOOK_APP_ID || 'FACEBOOK_APP_ID_PLACEHOLDER';
const facebookAppSecret = process.env.FACEBOOK_APP_SECRET || 'FACEBOOK_APP_SECRET_PLACEHOLDER';
const facebookCallbackUrl = process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback';

if (facebookAppId === 'FACEBOOK_APP_ID_PLACEHOLDER') {
  console.warn('[Passport] WARNING: FACEBOOK_APP_ID not set. Facebook OAuth will use placeholder keys.');
}

passport.use(
  new FacebookStrategy(
    {
      clientID: facebookAppId,
      clientSecret: facebookAppSecret,
      callbackURL: facebookCallbackUrl,
      profileFields: ['id', 'displayName', 'photos', 'email'],
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
        const name = profile.displayName || (email ? email.split('@')[0] : 'Facebook User');

        // 1. Check if user exists by facebookId
        let user = await User.findOne({ facebookId: profile.id });
        if (user) {
          user.lastLogin = new Date();
          await user.save({ validateBeforeSave: false });
          return done(null, user);
        }

        // 2. If not found by facebookId, check by email (Account Linking)
        if (email) {
          user = await User.findOne({ email });
          if (user) {
            user.facebookId = profile.id;
            if (user.provider === 'email') {
              user.provider = 'facebook';
            }
            user.emailVerified = true;
            if (!user.avatar || user.avatar.includes('unsplash.com')) {
              user.avatar = avatar || user.avatar;
            }
            user.lastLogin = new Date();
            await user.save({ validateBeforeSave: false });
            return done(null, user);
          }
        }

        // 3. If no account exists, automatically create a new student account
        if (!email) {
          return done(new Error('No email found in Facebook OAuth profile. Please grant email permission.'), null);
        }

        user = await User.create({
          name,
          email,
          provider: 'facebook',
          facebookId: profile.id,
          avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          role: 'student',
          department: 'Computer Science & Engineering',
          yearOfStudy: '1st Year',
          reputation: 10,
          streakDays: 1,
          emailVerified: true,
          isVerified: true,
          lastLogin: new Date(),
        });

        return done(null, user);
      } catch (error) {
        console.error('[Passport] Facebook OAuth Error:', error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
