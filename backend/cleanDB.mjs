import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function cleanDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await mongoose.connection.dropDatabase();
    console.log('✅ Database cleared');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanDatabase();
