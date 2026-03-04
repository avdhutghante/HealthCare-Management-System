import mongoose from 'mongoose';

const labSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  labName: {
    type: String,
    required: [true, 'Please provide lab name']
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please provide license number'],
    unique: true
  },
  accreditation: [{
    type: String, // e.g., NABL, CAP, ISO
    certificationNumber: String,
    validUntil: Date
  }],
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  operatingHours: [{
    day: String,
    openTime: String,
    closeTime: String
  }],
  testsOffered: [{
    testName: String,
    testCode: String,
    category: String, // e.g., Pathology, Radiology, Cardiology
    price: Number,
    duration: String, // Time to get results
    requirements: String // Sample requirements, fasting, etc.
  }],
  equipment: [{
    name: String,
    model: String,
    purchaseDate: Date
  }],
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
    url: String,
    type: String, // license, accreditation, etc.
    description: String
  }],
  isOperational: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate average rating
labSchema.methods.calculateRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating = (sum / this.reviews.length).toFixed(1);
  }
};

const Lab = mongoose.model('Lab', labSchema);

export default Lab;
