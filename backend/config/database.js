import mongoose from 'mongoose';

// Establish a MongoDB connection using Mongoose.
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.log('Warning: MONGO_URI not found in environment variables');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;