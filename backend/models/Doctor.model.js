import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialty: {
    type: String,
    required: [true, 'Please provide a specialty']
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  experience: {
    type: Number,
    required: [true, 'Please provide years of experience']
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please provide license number'],
    unique: true
  },
  hospitalAffiliation: {
    name: String,
    address: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  consultationFee: {
    type: Number,
    required: [true, 'Please provide consultation fee']
  },
  availableDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  availableTimeSlots: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  slotDuration: {
    type: Number,
    default: 30,
    min: 10,
    max: 180
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
    type: String, // URLs to uploaded documents
    description: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate average rating
doctorSchema.methods.calculateRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating = (sum / this.reviews.length).toFixed(1);
  }
};

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
