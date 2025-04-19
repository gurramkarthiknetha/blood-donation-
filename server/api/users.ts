import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, role, fullName, phoneNumber, bloodGroup, address } = req.body;
    
    if (!email || !password || !role || !fullName || !phoneNumber || !address) {
      res.status(400).json({ message: 'All required fields must be filled' });
      return;
    }

    if (role === 'donor' && !bloodGroup) {
      res.status(400).json({ message: 'Blood group is required for donors' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    const user = new User({
      email,
      password,
      role,
      fullName,
      phoneNumber,
      bloodGroup,
      address
    });

    await user.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    res.status(500).json({ message: 'Registration failed', error: errorMessage });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const user = await User.findOne({ email, role });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or role' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
      .status(200)
      .json({ 
        message: 'Login successful',
        role: user.role
      });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    res.status(500).json({ message: 'Login failed', error: errorMessage });
  }
});

export default router;
