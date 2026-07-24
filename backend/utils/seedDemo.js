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
  } catch (error) {
    console.error('[Seed Error] Failed to seed demo users:', error.message);
  }
};

module.exports = seedDemoUsers;
