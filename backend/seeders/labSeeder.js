import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import Lab from '../models/Lab.model.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const labsToSeed = [
  {
    user: {
      name: 'Lab Name',
      email: 'labname@gmail.com',
      password: 'Lab@123456',
      phone: '+91-9876543210',
      role: 'lab',
      address: {
        street: '45 Medical Complex',
        city: 'Pune',
        state: 'Maharashtra',
        zipCode: '411001',
        country: 'India'
      },
      isApproved: true,
      isActive: true
    },
    lab: {
      labName: 'Lab Name Diagnostics',
      licenseNumber: 'LAB-PUNE-001',
      accreditation: [
        'NABL',
        'CAP'
      ],
      address: {
        street: '45 Medical Complex',
        city: 'Pune',
        state: 'Maharashtra',
        zipCode: '411001'
      },
      contactPerson: {
        name: 'Lab Manager',
        phone: '+91-9876543210',
        email: 'labname@gmail.com'
      },
      operatingHours: [
        { day: 'Monday', openTime: '07:00', closeTime: '19:00' },
        { day: 'Tuesday', openTime: '07:00', closeTime: '19:00' },
        { day: 'Wednesday', openTime: '07:00', closeTime: '19:00' },
        { day: 'Thursday', openTime: '07:00', closeTime: '19:00' },
        { day: 'Friday', openTime: '07:00', closeTime: '19:00' },
        { day: 'Saturday', openTime: '08:00', closeTime: '15:00' },
        { day: 'Sunday', openTime: '09:00', closeTime: '13:00' }
      ],
      testsOffered: [
        {
          testName: 'Complete Blood Count',
          testCode: 'CBC',
          category: 'Pathology',
          price: 500,
          duration: '24 hours',
          requirements: 'No fasting required'
        },
        {
          testName: 'Thyroid Profile',
          testCode: 'TP',
          category: 'Pathology',
          price: 800,
          duration: '24 hours',
          requirements: 'Fasting 8-10 hours'
        },
        {
          testName: 'Lipid Profile',
          testCode: 'LP',
          category: 'Pathology',
          price: 600,
          duration: '24 hours',
          requirements: 'Fasting 8-10 hours'
        },
        {
          testName: 'Liver Function Test',
          testCode: 'LFT',
          category: 'Pathology',
          price: 700,
          duration: '24 hours',
          requirements: 'Fasting 8-10 hours'
        },
        {
          testName: 'Kidney Function Test',
          testCode: 'KFT',
          category: 'Pathology',
          price: 650,
          duration: '24 hours',
          requirements: 'No fasting required'
        },
        {
          testName: 'X-Ray Chest',
          testCode: 'XRC',
          category: 'Radiology',
          price: 400,
          duration: '2 hours',
          requirements: 'Wear metallic-free clothing'
        },
        {
          testName: 'Ultrasound Abdomen',
          testCode: 'USG',
          category: 'Radiology',
          price: 800,
          duration: '30 minutes',
          requirements: 'Fasting 6 hours for abdominal imaging'
        }
      ],
      equipment: [
        {
          name: 'Automatic Analyzer',
          model: 'Sysmex XN-1000',
          purchaseDate: new Date('2023-01-15')
        },
        {
          name: 'Ultrasound Machine',
          model: 'GE Logiq E9',
          purchaseDate: new Date('2022-06-20')
        },
        {
          name: 'X-Ray Machine',
          model: 'Siemens Multix Impact',
          purchaseDate: new Date('2023-03-10')
        }
      ],
      rating: 4.6,
      isOperational: true
    }
  }
];

async function seedLabs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    for (const labData of labsToSeed) {
      try {
        // Check if user exists
        let user = await User.findOne({ email: labData.user.email });

        if (!user) {
          // Hash password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(labData.user.password, salt);

          // Create user
          user = await User.create({
            ...labData.user,
            password: hashedPassword
          });
          console.log(`➕ Creating user: ${labData.user.email}`);
        } else {
          console.log(`ℹ️  Updating existing user: ${labData.user.email}`);
        }

        // Create or update lab
        let lab = await Lab.findOne({ userId: user._id });

        if (lab) {
          // Update existing lab
          await Lab.findByIdAndUpdate(lab._id, {
            ...labData.lab,
            userId: user._id
          });
          console.log(`ℹ️  Updating lab profile for ${labData.user.email}`);
        } else {
          // Create new lab
          await Lab.create({
            ...labData.lab,
            userId: user._id
          });
          console.log(`➕ Creating lab profile for ${labData.user.email}`);
        }
      } catch (error) {
        if (error.code === 11000) {
          const field = Object.keys(error.keyPattern)[0];
          console.warn(`⚠️  Duplicate ${field}: ${labData.user.email} or ${labData.lab.licenseNumber}`);
        } else {
          console.error(`❌ Error with ${labData.user.email}:`, error.message);
        }
      }
    }

    console.log('✅ Lab seeding complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding labs:', error.message);
    process.exit(1);
  }
}

seedLabs();
