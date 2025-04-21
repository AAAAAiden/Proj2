import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../model/User.js';

dotenv.config();

const createHR = async () => {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: 'hr@example.com' });
  if (existing) {
    console.log('HR user already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('123456', 10);
  const hrUser = new User({
    username: 'hradmin',
    email: 'hr@example.com',
    password: hashedPassword,
    role: 'hr',
  });

  await hrUser.save();
  console.log('HR user created:', hrUser);
  process.exit();
};

createHR().catch((err) => {
  console.error(err);
  process.exit(1);
});
