import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import Doctor from '../models/Doctor.model.js';
import Lab from '../models/Lab.model.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, ...additionalData } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'patient',
      ...additionalData
    });

    // If user is doctor or lab, create additional profile
    if (role === 'doctor' && req.body.doctorData) {
      await Doctor.create({
        userId: user._id,
        ...req.body.doctorData
      });
    } else if (role === 'lab' && req.body.labData) {
      await Lab.create({
        userId: user._id,
        ...req.body.labData
      });
    }

    // For doctors and labs, don't send token until approved
    if (role === 'doctor' || role === 'lab') {
      return res.status(201).json({
        success: true,
        message: 'Registration successful! Your account is pending admin approval. You will be able to login once the admin approves your account.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: false
        }
      });
    }

    // Generate token only for patients and admins
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error in registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Check if user exists (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support for assistance.'
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please try again.'
      });
    }

    // Check if doctor or lab is approved by admin
    if ((user.role === 'doctor' || user.role === 'lab') && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval. Please wait for the admin to approve your account before logging in.'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Get additional profile data if doctor or lab
    let profileData = null;
    if (user.role === 'doctor') {
      profileData = await Doctor.findOne({ userId: user._id });
    } else if (user.role === 'lab') {
      profileData = await Lab.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isApproved: user.isApproved,
        profileImage: user.profileImage,
        ...(profileData && { profileData })
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in login'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Get additional profile data if doctor or lab
    let profileData = null;
    if (user.role === 'doctor') {
      profileData = await Doctor.findOne({ userId: user._id });
    } else if (user.role === 'lab') {
      profileData = await Lab.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      user: {
        ...user.toJSON(),
        ...(profileData && { profileData })
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating password'
    });
  }
};
