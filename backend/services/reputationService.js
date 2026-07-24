const User = require('../models/User');
const Reputation = require('../models/Reputation');

/**
 * Award reputation points to user and check badge milestones
 */
const addReputation = async (userId, points, reason, sourceId = null) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.reputation = (user.reputation || 0) + points;
    
    // Check if senior status unlock (reputation >= 100)
    if (user.reputation >= 100 && user.role === 'student') {
      user.role = 'senior';
      if (!user.badges.includes('Senior Scholar')) {
        user.badges.push('Senior Scholar');
      }
    }

    // Award Badges based on reputation thresholds
    if (user.reputation >= 50 && !user.badges.includes('Rising Helper')) {
      user.badges.push('Rising Helper');
    }
    if (user.reputation >= 200 && !user.badges.includes('Campus Legend')) {
      user.badges.push('Campus Legend');
    }

    await user.save();

    await Reputation.create({
      user: userId,
      points,
      reason,
      sourceId,
    });

    return user;
  } catch (error) {
    console.error('[Reputation Error]', error.message);
  }
};

module.exports = {
  addReputation,
};
