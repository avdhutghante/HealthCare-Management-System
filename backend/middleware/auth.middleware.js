import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is approved (for doctors and labs)
export const checkApproval = (req, res, next) => {
  if ((req.user.role === 'doctor' || req.user.role === 'lab') && !req.user.isApproved) {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending approval from admin'
    });
  }
  next();
};

// Admin only
export const adminOnly = [protect, authorize('admin')];

// Doctor only (approved)
export const doctorOnly = [protect, authorize('doctor'), checkApproval];

// Lab only (approved)
export const labOnly = [protect, authorize('lab'), checkApproval];

// Patient only
export const patientOnly = [protect, authorize('patient')];

// Doctor or Admin
export const doctorOrAdmin = [protect, authorize('doctor', 'admin')];

// Lab or Admin
export const labOrAdmin = [protect, authorize('lab', 'admin')];
