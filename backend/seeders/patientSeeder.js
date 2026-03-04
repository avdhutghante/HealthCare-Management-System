import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';

dotenv.config();

const patientData = {
  name: 'Ritesh Patil',
  email: process.env.DEMO_PATIENT_EMAIL || 'ritesh.patil@example.com',
  password: process.env.DEMO_PATIENT_PASSWORD || 'Patient@123',
  phone: '+91-9000000001',
  role: 'patient',
  gender: 'male',
  address: {
    street: '8 Wellness Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    zipCode: '400002'
  },
  isApproved: true,
  isActive: true
};

const seedPatient = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    let user = await User.findOne({ email: patientData.email }).select('+password');

    if (user) {
      console.log(`ℹ️  Patient already exists: ${patientData.email}`);
      Object.assign(user, patientData);
      await user.save();
    } else {
      console.log(`➕ Creating patient: ${patientData.email}`);
      user = await User.create(patientData);
    }

    console.log('\n✅ Patient seeding complete');
    console.log('   Use these credentials to log in:');
    console.log(`   Email   : ${patientData.email}`);
    console.log(`   Password: ${patientData.password}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding patient:', error.message);
    process.exit(1);
  }
};

seedPatient();
