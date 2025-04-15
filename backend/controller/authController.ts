import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import User, { IUserDocument } from '../model/User.js';
import Token from '../model/Token.js';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Register new user using token
export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, token } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    const registrationToken = await Token.findOne({ email, token, used: false });
    if (!registrationToken || registrationToken.expiresAt < new Date()) {
      res.status(403).json({ message: 'Invalid or expired registration token' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'employee',
    });

    registrationToken.used = true;
    await registrationToken.save();

    res.status(201).json({
      message: 'User registered',
      user: { id: newUser._id, username: newUser.username, email: newUser.email },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login controller
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }) as IUserDocument;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const payload = {
      id: user._id.toString(),
      role: user.role,
    };

    const signOptions: SignOptions = {
      expiresIn: JWT_EXPIRES_IN as unknown as SignOptions['expiresIn'],
    };

    const token = jwt.sign(payload, JWT_SECRET, signOptions);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
};