import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import User, { IUserDocument } from '../model/User.js';
import Token from '../model/Token.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';

// Register new user using token
export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, token } = req.body;

  try {
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    const existingUsernameUser = await User.findOne({ username });
    if (existingUsernameUser) {
      res.status(400).json({ message: 'Username already taken' });
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
    console.log(error.message);
  }
};

// Login controller
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }) as IUserDocument;

    if (user) {
      console.log('Password match:', await bcrypt.compare(password, user.password));
    }
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
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Login error', error: error.message });
  }
};

export const checkRegistrationToken = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    res.status(400).json({ message: 'Token is required' });
    return;
  }

  try {
    const tokenRecord = await Token.findOne({ token });

    if (!tokenRecord) {
      res.status(400).json({ message: 'Invalid registration token' });
      return;
    }

    if (tokenRecord.used) {
      res.status(403).json({ message: 'This registration token has already been used.' });
      return;
    }

    if (tokenRecord.expiresAt < new Date()) {
      res.status(403).json({ message: 'This registration token has expired.' });
      return;
    }

    res.status(200).json({ email: tokenRecord.email }); 
  } catch (error: any) {
    console.error('Error checking token:', error.message);
    res.status(500).json({ message: 'Server error validating token' });
  }
};