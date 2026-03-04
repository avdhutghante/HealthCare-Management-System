import Appointment from '../models/Appointment.model.js';
import Doctor from '../models/Doctor.model.js';
import User from '../models/User.model.js';

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private/Patient
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, reasonForVisit, symptoms, notes } = req.body;

    // Verify doctor exists and is approved
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor' || !doctor.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor selected'
      });
    }

    // Get doctor profile for consultation fee
    const doctorProfile = await Doctor.findOne({ userId: doctorId });
    if (!doctorProfile) {
      return res.status(400).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Check for existing appointment at same time
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate: new Date(appointmentDate),
      'timeSlot.startTime': timeSlot.startTime,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      reasonForVisit,
      symptoms: symptoms || [],
      notes,
      consultationFee: doctorProfile.consultationFee
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: populatedAppointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating appointment'
    });
  }
};

// @desc    Get patient's appointments
// @route   GET /api/appointments/my-appointments
// @access  Private/Patient
export const getMyAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { patientId: req.user.id };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('doctorId', 'name email phone profileImage')
      .sort({ appointmentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Appointment.countDocuments(query);

    res.json({
      success: true,
      count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments'
    });
  }
};

// @desc    Get doctor's appointments
// @route   GET /api/appointments/doctor-appointments
// @access  Private/Doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;

    const query = { doctorId: req.user.id };
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.appointmentDate = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone profileImage dateOfBirth gender')
      .sort({ appointmentDate: 1, 'timeSlot.startTime': 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Appointment.countDocuments(query);

    res.json({
      success: true,
      count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments'
    });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone profileImage dateOfBirth gender address')
      .populate('doctorId', 'name email phone profileImage');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (
      req.user.role !== 'admin' &&
      appointment.patientId._id.toString() !== req.user.id.toString() &&
      appointment.doctorId._id.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment'
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private/Doctor
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.doctorId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    appointment.status = status;
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment status updated',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating appointment status'
    });
  }
};

// @desc    Add diagnosis and prescription to appointment
// @route   PUT /api/appointments/:id/complete
// @access  Private/Doctor
export const completeAppointment = async (req, res) => {
  try {
    const { diagnosis, prescription, vitalSigns, followUpRequired, followUpDate, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.doctorId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    appointment.status = 'completed';
    appointment.diagnosis = diagnosis;
    appointment.prescription = prescription || [];
    appointment.vitalSigns = vitalSigns || {};
    appointment.followUpRequired = followUpRequired || false;
    appointment.followUpDate = followUpDate || null;
    if (notes) appointment.notes = notes;

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment completed successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing appointment'
    });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
export const cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (
      appointment.patientId.toString() !== req.user.id.toString() &&
      appointment.doctorId.toString() !== req.user.id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment'
      });
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${appointment.status} appointment`
      });
    }

    appointment.status = 'cancelled';
    appointment.cancelledBy = req.user.id;
    appointment.cancellationReason = reason || 'Not specified';
    appointment.cancellationDate = new Date();

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment'
    });
  }
};

// Helpers for time slot generation
const parseTimeToMinutes = (timeString = '') => {
  const trimmed = timeString.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3] ? match[3].toUpperCase() : null;

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  }

  if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  if (!meridiem && hours === 24) {
    hours = 0;
  }

  return (hours * 60) + minutes;
};

const formatMinutesTo24Hour = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const formatMinutesTo12Hour = (minutes) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setMinutes(minutes);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const generateTimeSlots = (timeRanges = [], durationMinutes = 30) => {
  const slots = [];

  timeRanges.forEach((range) => {
    const startMinutes = parseTimeToMinutes(range.startTime);
    const endMinutes = parseTimeToMinutes(range.endTime);

    if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
      return;
    }

    for (let cursor = startMinutes; cursor + durationMinutes <= endMinutes; cursor += durationMinutes) {
      const slotStart = cursor;
      const slotEnd = cursor + durationMinutes;

      slots.push({
        startTime: formatMinutesTo24Hour(slotStart),
        endTime: formatMinutesTo24Hour(slotEnd),
        label: `${formatMinutesTo12Hour(slotStart)} - ${formatMinutesTo12Hour(slotEnd)}`
      });
    }
  });

  // Ensure unique slots by start time
  const unique = [];
  const seen = new Set();

  slots.forEach((slot) => {
    if (!seen.has(slot.startTime)) {
      seen.add(slot.startTime);
      unique.push(slot);
    }
  });

  return unique;
};

// @desc    Get available time slots for a doctor on a specific date
// @route   GET /api/appointments/available-slots
// @access  Public
export const getAvailableTimeSlots = async (req, res) => {
  try {
    const { date, doctorId } = req.query;
    
    if (!date || !doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Date and doctor ID are required'
      });
    }

    // Get doctor's schedule
    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const requestedDate = new Date(date);
    if (Number.isNaN(requestedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    requestedDate.setHours(0, 0, 0, 0);
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });

    const isDoctorAvailableThatDay = !Array.isArray(doctor.availableDays) || doctor.availableDays.length === 0 || doctor.availableDays.some((day) => day.toLowerCase() === dayOfWeek.toLowerCase());

    if (!isDoctorAvailableThatDay) {
      return res.json({
        success: true,
        slots: []
      });
    }

    let timeRanges = [];

    if (Array.isArray(doctor.availableTimeSlots) && doctor.availableTimeSlots.length > 0) {
      timeRanges = doctor.availableTimeSlots.filter((range) => {
        if (!range.day) return true;
        return range.day.toLowerCase() === dayOfWeek.toLowerCase();
      });

      if (timeRanges.length === 0) {
        // Fallback to day-agnostic ranges if provided
        timeRanges = doctor.availableTimeSlots.filter((range) => !range.day);
      }
    }

    if (timeRanges.length === 0) {
      // Default working hours if no specific schedule is defined
      timeRanges = [{ startTime: '09:00', endTime: '17:00' }];
    }

    const slotDuration = doctor.slotDuration || 30;

    // Generate all possible time slots for the doctor's availability
    const allSlots = generateTimeSlots(timeRanges, slotDuration);

    // Get booked appointments for the date
    const startDate = new Date(requestedDate);
    const endDate = new Date(requestedDate);
    endDate.setDate(endDate.getDate() + 1);

    const bookedAppointments = await Appointment.find({
      doctorId,
      appointmentDate: {
        $gte: startDate,
        $lt: endDate
      },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    // Filter out booked slots
    const availableSlots = allSlots.filter((slot) => {
      return !bookedAppointments.some((appointment) => {
        return appointment.timeSlot?.startTime === slot.startTime;
      });
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));

    res.json({
      success: true,
      slots: availableSlots
    });
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available time slots'
    });
  }
};
