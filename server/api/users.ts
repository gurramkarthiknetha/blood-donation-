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

    if (!user.password) {
      res.status(401).json({ message: 'User has no password set' });
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
        token, // Include token in response for client-side storage
        role: user.role,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          bloodGroup: user.bloodGroup
        }
      });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    res.status(500).json({ message: 'Login failed', error: errorMessage });
  }
});

// Admin routes
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) {
      res.status(401).json({ message: 'Invalid admin credentials' });
      return;
    }

    if (!admin.password) {
      res.status(401).json({ message: 'Admin has no password set' });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }

    const token = jwt.sign(
      { userId: admin._id, role: 'admin' },
      'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res
      .cookie('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
      .status(200)
      .json({
        message: 'Admin login successful',
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          fullName: admin.fullName
        }
      });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Admin login failed';
    res.status(500).json({ message: 'Admin login failed', error: errorMessage });
  }
});

// Get dashboard stats for admin
router.get('/admin/dashboard/stats', async (req, res) => {
  try {
    const donorCount = await User.countDocuments({ role: 'donor' });
    const hospitalCount = await User.countDocuments({ role: 'hospital' });

    res.status(200).json({
      donorCount,
      hospitalCount,
      // Add more stats as needed
      recentDonations: [],
      pendingRequests: []
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: errorMessage });
  }
});

// Get all hospital requests for admin
router.get('/admin/requests', async (req, res) => {
  try {
    // This is a placeholder - you would need to create a Request model
    // const requests = await Request.find().sort({ createdAt: -1 });

    res.status(200).json({
      requests: [] // Placeholder for actual requests
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch requests';
    res.status(500).json({ message: 'Failed to fetch requests', error: errorMessage });
  }
});

export default router;
