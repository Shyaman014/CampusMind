const User = require('../models/User');

const seedDemoUsers = async () => {
  try {
    const studentExists = await User.findOne({ email: 'student@campusmind.ai' });
    if (!studentExists) {
      await User.create({
        name: 'Demo Student',
        email: 'student@campusmind.ai',
        password: 'Password123!',
        role: 'student',
        department: 'Computer Science',
        yearOfStudy: '3rd Year',
        isVerified: true
      });
      console.log('[Seed] Demo Student created.');
    }

    const adminExists = await User.findOne({ email: 'admin@campusmind.ai' });
    if (!adminExists) {
      await User.create({
        name: 'Demo Admin',
        email: 'admin@campusmind.ai',
        password: 'AdminPassword123!',
        role: 'admin',
        department: 'Administration',
        yearOfStudy: 'Staff',
        isVerified: true
      });
      console.log('[Seed] Demo Admin created.');
    }

    const guestExists = await User.findById('65f1a2b3c4d5e6f7a8b9c0d1');
    if (!guestExists) {
      await User.create({
        _id: '65f1a2b3c4d5e6f7a8b9c0d1',
        name: 'Campus Scholar',
        email: 'guest@campusmind.ai',
        password: 'GuestPassword123!',
        role: 'student',
        department: 'General Studies',
        yearOfStudy: 'Guest',
        isVerified: true
      });
      console.log('[Seed] Guest Scholar created.');
    }
  } catch (error) {
    console.error('[Seed Error] Failed to seed demo users:', error.message);
  }
};

module.exports = seedDemoUsers;
