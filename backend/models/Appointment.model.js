import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Please provide appointment date']
  },
  timeSlot: {
    startTime: String,
    endTime: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  reasonForVisit: {
    type: String,
    required: [true, 'Please provide reason for visit']
  },
  symptoms: [String],
  notes: String,
  // Doctor's notes after appointment
  diagnosis: String,
  prescription: [{
    medicine: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  vitalSigns: {
    bloodPressure: String,
    temperature: String,
    heartRate: String,
    weight: String,
    height: String
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  consultationFee: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: String,
  cancellationDate: Date
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
