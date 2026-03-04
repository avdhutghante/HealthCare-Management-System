import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (adminExists) {
      console.log('⚠️  Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Avdhut',
      email: process.env.ADMIN_EMAIL || 'avdhut@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'Avdhut@09',
      phone: '+1234567890',
      role: 'admin',
      isApproved: true
    });

    console.log('✅ Admin user created successfully');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log('\n⚠️  Please change the admin password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
