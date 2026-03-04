import User from '../models/User.model.js';
import Doctor from '../models/Doctor.model.js';

// @desc    Get all approved doctors
// @route   GET /api/doctors
// @access  Public
export const getAllDoctors = async (req, res) => {
  try {
    const { specialty, city, search, page = 1, limit = 10 } = req.query;

    // Build query
    const userQuery = { role: 'doctor', isApproved: true, isActive: true };
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

    // Get doctor profiles with optional specialty filter
    const doctorQuery = { userId: { $in: users.map(u => u._id) } };
    if (specialty) {
      doctorQuery.specialty = { $regex: specialty, $options: 'i' };
    }

    const doctors = await Doctor.find(doctorQuery).populate('userId', '-password');

    const count = doctors.length;

    res.json({
      success: true,
      count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: doctors
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors'
    });
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', '-password')
      .populate('reviews.patientId', 'name profileImage');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor'
    });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private/Doctor
export const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'specialty', 'qualifications', 'experience', 'hospitalAffiliation',
      'consultationFee', 'availableDays', 'availableTimeSlots', 'isAvailable'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        doctor[field] = req.body[field];
      }
    });

    await doctor.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// @desc    Add review to doctor
// @route   POST /api/doctors/:id/review
// @access  Private/Patient
export const addDoctorReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if patient already reviewed
    const alreadyReviewed = doctor.reviews.find(
      r => r.patientId.toString() === req.user.id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this doctor'
      });
    }

    const review = {
      patientId: req.user.id,
      rating: Number(rating),
      comment
    };

    doctor.reviews.push(review);
    doctor.calculateRating();
    await doctor.save();

    res.json({
      success: true,
      message: 'Review added successfully',
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding review'
    });
  }
};
