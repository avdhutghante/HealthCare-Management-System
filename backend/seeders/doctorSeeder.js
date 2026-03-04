import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import Doctor from '../models/Doctor.model.js';

dotenv.config();

const doctorsToSeed = [
  {
    user: {
      name: 'Dr. Priya Shah',
      email: 'priya.shah@example.com',
      password: 'Doctor@123',
      phone: '+91-9876543210',
      role: 'doctor',
      gender: 'female',
      address: {
        street: '12 Medical Park',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '400001'
      },
      isApproved: true,
      isActive: true
    },
    doctor: {
      specialty: 'Cardiology',
      experience: 12,
      licenseNumber: 'MH-CARD-1001',
      hospitalAffiliation: {
        name: 'HeartCare Hospital',
        address: 'Marine Lines, Mumbai',
        city: 'Mumbai'
      },
      consultationFee: 1500,
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      availableTimeSlots: [
        { day: 'Monday', startTime: '09:00', endTime: '13:00' },
        { day: 'Wednesday', startTime: '11:00', endTime: '16:00' },
        { day: 'Friday', startTime: '10:00', endTime: '14:00' }
      ],
      slotDuration: 30,
      rating: 4.6,
      isAvailable: true
    }
  },
  {
    user: {
      name: 'Dr. Arjun Mehta',
      email: 'arjun.mehta@example.com',
      password: 'Doctor@123',
      phone: '+91-9123456780',
      role: 'doctor',
      gender: 'male',
      address: {
        street: '22 Sunrise Ave',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '411001'
      },
      isApproved: true,
      isActive: true
    },
    doctor: {
      specialty: 'Dermatology',
      experience: 8,
      licenseNumber: 'MH-DERM-2002',
      hospitalAffiliation: {
        name: 'SkinCare Clinic',
        address: 'FC Road, Pune',
        city: 'Pune'
      },
      consultationFee: 900,
      availableDays: ['Tuesday', 'Thursday', 'Saturday'],
      availableTimeSlots: [
        { day: 'Tuesday', startTime: '10:00', endTime: '15:00' },
        { day: 'Thursday', startTime: '12:00', endTime: '17:00' },
        { day: 'Saturday', startTime: '09:00', endTime: '12:00' }
      ],
      slotDuration: 20,
      rating: 4.4,
      isAvailable: true
    }
  },
  {
    user: {
      name: 'Dr. Neha Kulkarni',
      email: 'neha.kulkarni@example.com',
      password: 'Doctor@123',
      phone: '+91-9988776655',
      role: 'doctor',
      gender: 'female',
      address: {
        street: '18 Wellness Street',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        zipCode: '560001'
      },
      isApproved: true,
      isActive: true
    },
    doctor: {
      specialty: 'General Medicine',
      experience: 10,
      licenseNumber: 'KA-GEN-3003',
      hospitalAffiliation: {
        name: 'CarePlus Clinic',
        address: 'MG Road, Bengaluru',
        city: 'Bengaluru'
      },
      consultationFee: 700,
      availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
      availableTimeSlots: [
        { day: 'Monday', startTime: '09:30', endTime: '13:30' },
        { day: 'Tuesday', startTime: '09:30', endTime: '13:30' },
        { day: 'Thursday', startTime: '14:00', endTime: '18:00' },
        { day: 'Friday', startTime: '14:00', endTime: '18:00' }
      ],
      slotDuration: 30,
      rating: 4.5,
      isAvailable: true
    }
  },
  {
    user: {
      name: 'Dr. Demo',
      email: 'demo.doctor@example.com',
      password: 'Doctor@123',
      phone: '+91-9012345678',
      role: 'doctor',
      gender: 'female',
      address: {
        street: '123 Noble Hospital',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '411028'
      },
      isApproved: true,
      isActive: true
    },
    doctor: {
      specialty: 'General Physician',
      qualifications: [
        { degree: 'MBBS', institution: 'BJ Medical College, Pune', year: 2007 },
        { degree: 'MD (General Medicine)', institution: 'AIIMS Delhi', year: 2011 }
      ],
      experience: 15,
      licenseNumber: 'MH-HAD-1001',
      hospitalAffiliation: {
        name: 'Noble Hospital',
        address: '123 Noble Hospital, Hadapsar',
        city: 'Hadapsar'
      },
      consultationFee: 500,
      availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
      availableTimeSlots: [
        { day: 'Monday', startTime: '09:00', endTime: '13:00' },
        { day: 'Tuesday', startTime: '10:00', endTime: '14:00' },
        { day: 'Thursday', startTime: '15:00', endTime: '18:00' },
        { day: 'Friday', startTime: '15:00', endTime: '18:00' }
      ],
      slotDuration: 30,
      rating: 4.8,
      isAvailable: true
    }
  },
  {
    user: {
      name: 'Dr. Milind Gadkari',
      email: 'milind.gadkari@example.com',
      password: 'Doctor@123',
      phone: '+91-9023456789',
      role: 'doctor',
      gender: 'male',
      address: {
        street: '456 Sahyadri Hospital',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '411028'
      },
      isApproved: true,
      isActive: true
    },
    doctor: {
      specialty: 'Cardiologist',
      qualifications: [
        { degree: 'MBBS', institution: 'BJ Medical College, Pune', year: 2009 },
        { degree: 'DM Cardiology', institution: 'KEM Hospital, Mumbai', year: 2014 }
      ],
      experience: 12,
      licenseNumber: 'MH-HAD-1002',
      hospitalAffiliation: {
        name: 'Sahyadri Hospital',
        address: '456 Sahyadri Hospital, Hadapsar',
        city: 'Hadapsar'
      },
      consultationFee: 850,
      availableDays: ['Monday', 'Wednesday', 'Saturday'],
      availableTimeSlots: [
        { day: 'Monday', startTime: '11:00', endTime: '15:00' },
        { day: 'Wednesday', startTime: '10:00', endTime: '14:00' },
        { day: 'Saturday', startTime: '09:00', endTime: '13:00' }
      ],
      slotDuration: 25,
      rating: 4.9,
      isAvailable: true
    }
  },
  {
    user: {
      name: 'Dr. Pushkar Gadre',
      email: 'pushkar.gadre@example.com',
      password: 'Doctor@123',
      phone: '+91-9034567890',
      role: 'doctor',
      gender: 'male',
      address: {
        street: '789 Lifeline Hospital',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '411048'
      },
      isApproved: true,
      isActive: true
    },
    doctor: {
      specialty: 'Dermatologist',
      qualifications: [
        { degree: 'MBBS', institution: 'Grant Medical College, Mumbai', year: 2010 },
        { degree: 'MD (Dermatology)', institution: 'AFMC Pune', year: 2014 }
      ],
      experience: 10,
      licenseNumber: 'MH-KON-2001',
      hospitalAffiliation: {
        name: 'Lifeline Hospital',
        address: '789 Lifeline Hospital, Kondwa',
        city: 'Kondwa'
      },
      consultationFee: 700,
      availableDays: ['Tuesday', 'Thursday', 'Saturday'],
      availableTimeSlots: [
        { day: 'Tuesday', startTime: '10:00', endTime: '14:00' },
        { day: 'Thursday', startTime: '12:00', endTime: '16:00' },
        { day: 'Saturday', startTime: '09:00', endTime: '12:00' }
      ],
      slotDuration: 20,
      rating: 4.7,
      isAvailable: true
    }
  },
  {
    user: {
      name: 'Dr. Smita Dhadge',
      email: 'smita.dhadge@example.com',
      password: 'Doctor@123',
      phone: '+91-9045678901',
      role: 'doctor',
      gender: 'female',
      address: {
        street: '654 Satyanand Hospital',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '411048'
      },
      isApproved: true,
      isActive: true
    },
    doctor: {
      specialty: 'Orthopedic Surgeon',
      qualifications: [
        { degree: 'MBBS', institution: 'Lokmanya Tilak Medical College, Mumbai', year: 2002 },
        { degree: 'MS (Orthopedics)', institution: 'Seth GS Medical College, Mumbai', year: 2006 }
      ],
      experience: 20,
      licenseNumber: 'MH-KON-2002',
      hospitalAffiliation: {
        name: 'Satyanand Hospital',
        address: '654 Satyanand Hospital, Kondwa',
        city: 'Kondwa'
      },
      consultationFee: 950,
      availableDays: ['Wednesday', 'Friday', 'Saturday'],
      availableTimeSlots: [
        { day: 'Wednesday', startTime: '10:00', endTime: '13:00' },
        { day: 'Friday', startTime: '15:00', endTime: '18:00' },
        { day: 'Saturday', startTime: '11:00', endTime: '14:00' }
      ],
      slotDuration: 30,
      rating: 4.8,
      isAvailable: true
    }
  },
  {
    user: {
      name: 'Dr. Monika Bhagat',
      email: 'monika.bhagat@example.com',
      password: 'Doctor@123',
      phone: '+91-9056789012',
      role: 'doctor',
      gender: 'female',
      address: {
        street: '321 Bharati Hospital',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '411046'
      },
      isApproved: true,
      isActive: true
    },
    doctor: {
      specialty: 'Pediatrician',
      qualifications: [
        { degree: 'MBBS', institution: 'Dr. DY Patil Medical College, Pune', year: 2001 },
        { degree: 'MD (Pediatrics)', institution: 'King Edward Memorial Hospital, Mumbai', year: 2005 }
      ],
      experience: 18,
      licenseNumber: 'MH-KAT-3001',
      hospitalAffiliation: {
        name: 'Bharati Hospital',
        address: '321 Bharati Hospital, Katraj',
        city: 'Katraj'
      },
      consultationFee: 600,
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      availableTimeSlots: [
        { day: 'Monday', startTime: '10:00', endTime: '14:00' },
        { day: 'Wednesday', startTime: '12:00', endTime: '16:00' },
        { day: 'Friday', startTime: '09:00', endTime: '12:00' }
      ],
      slotDuration: 30,
      rating: 4.9,
      isAvailable: true
    }
  },
  {
    user: {
      name: 'Dr. Sanjay Jain',
      email: 'sanjay.jain@example.com',
      password: 'Doctor@123',
      phone: '+91-9067890123',
      role: 'doctor',
      gender: 'male',
      address: {
        street: '987 Global Hospital',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '411046'
      },
      isApproved: true,
      isActive: true
    },
    doctor: {
      specialty: 'Neurologist',
      qualifications: [
        { degree: 'MBBS', institution: 'BJ Medical College, Pune', year: 2004 },
        { degree: 'DM Neurology', institution: 'NIMHANS, Bengaluru', year: 2009 }
      ],
      experience: 14,
      licenseNumber: 'MH-KAT-3002',
      hospitalAffiliation: {
        name: 'Global Hospital',
        address: '987 Global Hospital, Katraj',
        city: 'Katraj'
      },
      consultationFee: 1100,
      availableDays: ['Tuesday', 'Thursday', 'Saturday'],
      availableTimeSlots: [
        { day: 'Tuesday', startTime: '09:30', endTime: '13:30' },
        { day: 'Thursday', startTime: '14:00', endTime: '18:00' },
        { day: 'Saturday', startTime: '10:00', endTime: '14:00' }
      ],
      slotDuration: 30,
      rating: 4.7,
      isAvailable: true
    }
  },
  {
    user: {
      name: 'Dr. Yash Sah',
      email: 'yash.sah@example.com',
      password: 'Doctor@123',
      phone: '+91-9078901234',
      role: 'doctor',
      gender: 'male',
      address: {
        street: '147 Pawar Hospital',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '411028'
      },
      isApproved: true,
      isActive: true
    },
    doctor: {
      specialty: 'Gynecologist',
      qualifications: [
        { degree: 'MBBS', institution: 'Seth GS Medical College, Mumbai', year: 2003 },
        { degree: 'MD (Obstetrics & Gynecology)', institution: 'KEM Hospital, Mumbai', year: 2007 }
      ],
      experience: 16,
      licenseNumber: 'MH-HAN-4001',
      hospitalAffiliation: {
        name: 'Pawar Hospital',
        address: '147 Pawar Hospital, Handewadi',
        city: 'Handewadi'
      },
      consultationFee: 750,
      availableDays: ['Monday', 'Thursday', 'Saturday'],
      availableTimeSlots: [
        { day: 'Monday', startTime: '09:30', endTime: '12:30' },
        { day: 'Thursday', startTime: '15:00', endTime: '18:00' },
        { day: 'Saturday', startTime: '10:00', endTime: '13:00' }
      ],
      slotDuration: 30,
      rating: 4.9,
      isAvailable: true
    }
  },
  {
    user: {
      name: 'Dr. Priya Kulkarni',
      email: 'priya.kulkarni@example.com',
      password: 'Doctor@123',
      phone: '+91-9089012345',
      role: 'doctor',
      gender: 'female',
      address: {
        street: '22 Sunrise Clinic',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '411028'
      },
      isApproved: true,
      isActive: true
    },
    doctor: {
      specialty: 'General Physician',
      qualifications: [
        { degree: 'MBBS', institution: 'BJ Medical College, Pune', year: 2012 },
        { degree: 'DNB (Family Medicine)', institution: 'Ruby Hall Clinic, Pune', year: 2016 }
      ],
      experience: 8,
      licenseNumber: 'MH-HAN-4002',
      hospitalAffiliation: {
        name: 'Sunrise Clinic',
        address: '22 Sunrise Clinic, Handewadi',
        city: 'Handewadi'
      },
      consultationFee: 550,
      availableDays: ['Tuesday', 'Wednesday', 'Friday'],
      availableTimeSlots: [
        { day: 'Tuesday', startTime: '09:00', endTime: '12:00' },
        { day: 'Wednesday', startTime: '14:00', endTime: '17:00' },
        { day: 'Friday', startTime: '10:00', endTime: '13:00' }
      ],
      slotDuration: 30,
      rating: 4.6,
      isAvailable: true
    }
  },
  {
    user: {
      name: 'Dr. Vikram Pandit',
      email: 'vikram.pandit@example.com',
      password: 'Doctor@123',
      phone: '+91-9090123456',
      role: 'doctor',
      gender: 'male',
      address: {
        street: '258 Inamdar Hospital',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '411040'
      },
      isApproved: true,
      isActive: true
    },
    doctor: {
      specialty: 'Psychiatrist',
      qualifications: [
        { degree: 'MBBS', institution: 'Grant Medical College, Mumbai', year: 2005 },
        { degree: 'MD (Psychiatry)', institution: 'NIMHANS, Bengaluru', year: 2009 }
      ],
      experience: 13,
      licenseNumber: 'MH-WAN-5001',
      hospitalAffiliation: {
        name: 'Inamdar Hospital',
        address: '258 Inamdar Hospital, Wanavde',
        city: 'Wanavde'
      },
      consultationFee: 900,
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      availableTimeSlots: [
        { day: 'Monday', startTime: '10:00', endTime: '13:00' },
        { day: 'Wednesday', startTime: '15:00', endTime: '18:00' },
        { day: 'Friday', startTime: '11:00', endTime: '14:00' }
      ],
      slotDuration: 30,
      rating: 4.8,
      isAvailable: true
    }
  },
  {
    user: {
      name: 'Dr. Anil Deshpande',
      email: 'anil.deshpande@example.com',
      password: 'Doctor@123',
      phone: '+91-9101234567',
      role: 'doctor',
      gender: 'male',
      address: {
        street: '88 Green Valley Hospital',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '411040'
      },
      isApproved: true,
      isActive: true
    },
    doctor: {
      specialty: 'Internal Medicine',
      qualifications: [
        { degree: 'MBBS', institution: 'BJ Medical College, Pune', year: 2006 },
        { degree: 'MD (Internal Medicine)', institution: 'Sassoon General Hospital, Pune', year: 2010 }
      ],
      experience: 11,
      licenseNumber: 'MH-WAN-5002',
      hospitalAffiliation: {
        name: 'Green Valley Hospital',
        address: '88 Green Valley Hospital, Wanavde',
        city: 'Wanavde'
      },
      consultationFee: 650,
      availableDays: ['Tuesday', 'Thursday', 'Saturday'],
      availableTimeSlots: [
        { day: 'Tuesday', startTime: '09:00', endTime: '12:00' },
        { day: 'Thursday', startTime: '15:00', endTime: '18:00' },
        { day: 'Saturday', startTime: '11:00', endTime: '14:00' }
      ],
      slotDuration: 30,
      rating: 4.5,
      isAvailable: true
    }
  }
];

const seedDoctors = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    const seedEmailSet = new Set(doctorsToSeed.map(({ user }) => user.email.toLowerCase()));

    const existingDoctorUsers = await User.find({ role: 'doctor' });
    for (const doctorUser of existingDoctorUsers) {
      if (!seedEmailSet.has(doctorUser.email.toLowerCase())) {
        console.log(`🗑 Removing doctor not in seed list: ${doctorUser.email}`);
        await Doctor.deleteOne({ userId: doctorUser._id });
        await doctorUser.deleteOne();
      }
    }

    for (const doctorEntry of doctorsToSeed) {
      const { user: userData, doctor: doctorData } = doctorEntry;

      let user = await User.findOne({ email: userData.email });

      if (user) {
        console.log(`ℹ️  Updating existing user: ${userData.email}`);
        Object.assign(user, userData);
        user.isApproved = true;
        await user.save();
      } else {
        console.log(`➕ Creating user: ${userData.email}`);
        user = await User.create(userData);
      }

      let doctorProfile = await Doctor.findOne({ userId: user._id });

      if (doctorProfile) {
        console.log(`ℹ️  Updating doctor profile for ${userData.email}`);
        Object.assign(doctorProfile, doctorData);
        await doctorProfile.save();
      } else {
        console.log(`➕ Creating doctor profile for ${userData.email}`);
        doctorProfile = await Doctor.create({
          userId: user._id,
          ...doctorData
        });
      }
    }

    console.log('\n✅ Doctor seeding complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding doctors:', error.message);
    process.exit(1);
  }
};

seedDoctors();
