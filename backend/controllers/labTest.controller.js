import LabTest from '../models/LabTest.model.js';
import Lab from '../models/Lab.model.js';
import User from '../models/User.model.js';

// @desc    Create new lab test booking
// @route   POST /api/lab-tests
// @access  Private/Patient
export const createLabTest = async (req, res) => {
  try {
    const { labId, testDetails, scheduledDate, homeCollection, collectionAddress, prescribedBy } = req.body;

    // Verify lab exists and is approved
    const lab = await User.findById(labId);
    if (!lab || lab.role !== 'lab' || !lab.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lab selected'
      });
    }

    // Calculate total amount
    const totalAmount = testDetails.reduce((sum, test) => sum + (test.price || 0), 0);

    const labTest = await LabTest.create({
      patientId: req.user.id,
      labId,
      testDetails,
      scheduledDate: new Date(scheduledDate),
      totalAmount,
      homeCollection: homeCollection || false,
      collectionAddress: homeCollection ? collectionAddress : null,
      prescribedBy: prescribedBy || null
    });

    const populatedLabTest = await LabTest.findById(labTest._id)
      .populate('patientId', 'name email phone')
      .populate('labId', 'name email phone')
      .populate('prescribedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Lab test booked successfully',
      data: populatedLabTest
    });
  } catch (error) {
    console.error('Create lab test error:', error);
    res.status(500).json({
      success: false,
      message: 'Error booking lab test'
    });
  }
};

// @desc    Get patient's lab tests
// @route   GET /api/lab-tests/my-tests
// @access  Private/Patient
export const getMyLabTests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { patientId: req.user.id };
    if (status) query.status = status;

    const labTests = await LabTest.find(query)
      .populate('labId', 'name email phone profileImage')
      .populate('prescribedBy', 'name email')
      .sort({ bookingDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await LabTest.countDocuments(query);

    res.json({
      success: true,
      count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: labTests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lab tests'
    });
  }
};

// @desc    Get lab's bookings
// @route   GET /api/lab-tests/lab-bookings
// @access  Private/Lab
export const getLabBookings = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;

    const query = { labId: req.user.id };
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.scheduledDate = { $gte: startDate, $lt: endDate };
    }

    const labTests = await LabTest.find(query)
      .populate('patientId', 'name email phone profileImage dateOfBirth gender')
      .populate('prescribedBy', 'name email')
      .sort({ scheduledDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await LabTest.countDocuments(query);

    res.json({
      success: true,
      count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: labTests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lab bookings'
    });
  }
};

// @desc    Get lab test by ID
// @route   GET /api/lab-tests/:id
// @access  Private
export const getLabTestById = async (req, res) => {
  try {
    const labTest = await LabTest.findById(req.params.id)
      .populate('patientId', 'name email phone profileImage dateOfBirth gender address')
      .populate('labId', 'name email phone profileImage')
      .populate('prescribedBy', 'name email');

    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    // Check authorization
    if (
      req.user.role !== 'admin' &&
      labTest.patientId._id.toString() !== req.user.id.toString() &&
      labTest.labId._id.toString() !== req.user.id.toString() &&
      (labTest.prescribedBy && labTest.prescribedBy._id.toString() !== req.user.id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this lab test'
      });
    }

    res.json({
      success: true,
      data: labTest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lab test'
    });
  }
};

// @desc    Update lab test status
// @route   PUT /api/lab-tests/:id/status
// @access  Private/Lab
export const updateLabTestStatus = async (req, res) => {
  try {
    const { status, sampleCollectionDate } = req.body;
    const labTest = await LabTest.findById(req.params.id);

    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    if (labTest.labId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lab test'
      });
    }

    labTest.status = status;
    if (sampleCollectionDate) {
      labTest.sampleCollectionDate = new Date(sampleCollectionDate);
    }

    await labTest.save();

    res.json({
      success: true,
      message: 'Lab test status updated',
      data: labTest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating lab test status'
    });
  }
};

// @desc    Add test results
// @route   PUT /api/lab-tests/:id/results
// @access  Private/Lab
export const addTestResults = async (req, res) => {
  try {
    const { testResults, reportUrl, remarks, technicianNotes } = req.body;
    const labTest = await LabTest.findById(req.params.id);

    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    if (labTest.labId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lab test'
      });
    }

    labTest.status = 'completed';
    labTest.testResults = testResults || [];
    labTest.reportUrl = reportUrl || null;
    labTest.remarks = remarks || null;
    labTest.technicianNotes = technicianNotes || null;
    labTest.reportGenerationDate = new Date();

    await labTest.save();

    res.json({
      success: true,
      message: 'Test results added successfully',
      data: labTest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding test results'
    });
  }
};

// @desc    Cancel lab test
// @route   PUT /api/lab-tests/:id/cancel
// @access  Private
export const cancelLabTest = async (req, res) => {
  try {
    const { reason } = req.body;
    const labTest = await LabTest.findById(req.params.id);

    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    // Check authorization
    if (
      labTest.patientId.toString() !== req.user.id.toString() &&
      labTest.labId.toString() !== req.user.id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this lab test'
      });
    }

    if (labTest.status === 'completed' || labTest.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${labTest.status} lab test`
      });
    }

    labTest.status = 'cancelled';
    labTest.cancelledBy = req.user.id;
    labTest.cancellationReason = reason || 'Not specified';
    labTest.cancellationDate = new Date();

    await labTest.save();

    res.json({
      success: true,
      message: 'Lab test cancelled successfully',
      data: labTest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling lab test'
    });
  }
};
