import User from '../models/User.model.js';
import Doctor from '../models/Doctor.model.js';
import Lab from '../models/Lab.model.js';
import Appointment from '../models/Appointment.model.js';
import LabTest from '../models/LabTest.model.js';

// @desc    Get all pending approvals (doctors and labs)
// @route   GET /api/admin/pending-approvals
// @access  Private/Admin
export const getPendingApprovals = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      role: { $in: ['doctor', 'lab'] },
      isApproved: false,
      isActive: true
    }).select('-password');

    // Get additional profile data
    const usersWithProfiles = await Promise.all(
      pendingUsers.map(async (user) => {
        let profileData = null;
        if (user.role === 'doctor') {
          profileData = await Doctor.findOne({ userId: user._id });
        } else if (user.role === 'lab') {
          profileData = await Lab.findOne({ userId: user._id });
        }
        return {
          ...user.toJSON(),
          profileData
        };
      })
    );

    res.json({
      success: true,
      count: usersWithProfiles.length,
      data: usersWithProfiles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending approvals'
    });
  }
};

// @desc    Approve doctor or lab
// @route   PUT /api/admin/approve/:userId
// @access  Private/Admin
export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'doctor' && user.role !== 'lab') {
      return res.status(400).json({
        success: false,
        message: 'Only doctors and labs require approval'
      });
    }

    if (user.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'User is already approved'
      });
    }

    user.isApproved = true;
    user.approvedBy = req.user.id;
    user.approvedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} approved successfully`,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving user'
    });
  }
};

// @desc    Reject doctor or lab
// @route   PUT /api/admin/reject/:userId
// @access  Private/Admin
export const rejectUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'doctor' && user.role !== 'lab') {
      return res.status(400).json({
        success: false,
        message: 'Only doctors and labs can be rejected'
      });
    }

    user.isActive = false;
    user.rejectionReason = reason || 'Not specified';
    await user.save();

    res.json({
      success: true,
      message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} rejected`,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting user'
    });
  }
};

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { role, isApproved, isActive, page = 1, limit = 10 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalLabs,
      pendingApprovals,
      totalAppointments,
      totalLabTests,
      recentAppointments,
      recentLabTests
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor', isApproved: true }),
      User.countDocuments({ role: 'lab', isApproved: true }),
      User.countDocuments({ 
        role: { $in: ['doctor', 'lab'] }, 
        isApproved: false,
        isActive: true
      }),
      Appointment.countDocuments(),
      LabTest.countDocuments(),
      Appointment.find()
        .populate('patientId', 'name email')
        .populate('doctorId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      LabTest.find()
        .populate('patientId', 'name email')
        .populate('labId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalLabs,
        pendingApprovals,
        totalAppointments,
        totalLabTests,
        totalUsers: totalPatients + totalDoctors + totalLabs
      },
      recentActivity: {
        appointments: recentAppointments,
        labTests: recentLabTests
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};

// @desc    Deactivate user account
// @route   PUT /api/admin/deactivate/:userId
// @access  Private/Admin
export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate admin account'
      });
    }

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User account deactivated',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating user'
    });
  }
};

// @desc    Activate user account
// @route   PUT /api/admin/activate/:userId
// @access  Private/Admin
export const activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: 'User account activated',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error activating user'
    });
  }
};
