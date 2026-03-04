import mongoose from 'mongoose';

const labTestSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prescribedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Doctor who prescribed the test
    default: null
  },
  testDetails: [{
    testName: String,
    testCode: String,
    category: String,
    price: Number
  }],
  bookingDate: {
    type: Date,
    default: Date.now
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Please provide scheduled date']
  },
  sampleCollectionDate: Date,
  reportGenerationDate: Date,
  status: {
    type: String,
    enum: ['scheduled', 'sample-collected', 'processing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  testResults: [{
    parameter: String,
    value: String,
    unit: String,
    referenceRange: String,
    status: {
      type: String,
      enum: ['normal', 'abnormal', 'critical']
    }
  }],
  reportUrl: String, // URL to PDF report
  remarks: String,
  technicianNotes: String,
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  homeCollection: {
    type: Boolean,
    default: false
  },
  collectionAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
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
labTestSchema.index({ patientId: 1, bookingDate: -1 });
labTestSchema.index({ labId: 1, scheduledDate: -1 });
labTestSchema.index({ status: 1 });

const LabTest = mongoose.model('LabTest', labTestSchema);

export default LabTest;
