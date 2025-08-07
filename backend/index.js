import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import userRoutes from './routes/users.js';
import photoRoutes from './routes/photos.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

connectDB();

app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend API Running',
    database: 'MongoDB connection attempted' 
  });
});

app.use('/api/users', userRoutes);
app.use('/api/photos', photoRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 