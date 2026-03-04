import User from '../models/User.model.js';
import Lab from '../models/Lab.model.js';

// @desc    Get all approved labs
// @route   GET /api/labs
// @access  Public
export const getAllLabs = async (req, res) => {
  try {
    const { city, search, page = 1, limit = 10 } = req.query;

    const userQuery = { role: 'lab', isApproved: true, isActive: true };
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (city) {
      userQuery['address.city'] = { $regex: city, $options: 'i' };
    }

    const users = await User.find(userQuery)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const labs = await Lab.find({ userId: { $in: users.map(u => u._id) } })
      .populate('userId', '-password');

    const count = labs.length;

    res.json({
      success: true,
      count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: labs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching labs'
    });
  }
};

// @desc    Get lab by ID
// @route   GET /api/labs/:id
// @access  Public
export const getLabById = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id)
      .populate('userId', '-password')
      .populate('reviews.patientId', 'name profileImage');

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: 'Lab not found'
      });
    }

    res.json({
      success: true,
      data: lab
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lab'
    });
  }
};

// @desc    Update lab profile
// @route   PUT /api/labs/profile
// @access  Private/Lab
export const updateLabProfile = async (req, res) => {
  try {
    const lab = await Lab.findOne({ userId: req.user.id });

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: 'Lab profile not found'
      });
    }

    const allowedUpdates = [
      'labName', 'address', 'contactPerson', 'operatingHours',
      'testsOffered', 'equipment', 'isOperational'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        lab[field] = req.body[field];
      }
    });

    await lab.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: lab
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// @desc    Add review to lab
// @route   POST /api/labs/:id/review
// @access  Private/Patient
export const addLabReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const lab = await Lab.findById(req.params.id);

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: 'Lab not found'
      });
    }

    const alreadyReviewed = lab.reviews.find(
      r => r.patientId.toString() === req.user.id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this lab'
      });
    }

    const review = {
      patientId: req.user.id,
      rating: Number(rating),
      comment
    };

    lab.reviews.push(review);
    lab.calculateRating();
    await lab.save();

    res.json({
      success: true,
      message: 'Review added successfully',
      data: lab
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding review'
    });
  }
};
