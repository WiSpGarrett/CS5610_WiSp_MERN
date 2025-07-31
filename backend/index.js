import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend API Running',
    database: 'MongoDB connection attempted' 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 