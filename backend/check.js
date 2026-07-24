const mongoose = require('mongoose');
require('dotenv').config({path: './.env'});
const User = require('./models/User');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campusmind').then(async () => {
  const users = await User.find({ email: { $in: ['student@campusmind.ai', 'admin@campusmind.ai'] } });
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
});
