import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { googleId, email, name } = req.body;

    let user = await User.findOne({ googleId });
    
    if (!user) {
      user = new User({
        googleId,
        email,
        name
      });
      await user.save();
      console.log('New user created:', user.email);
    } else {
      console.log('User already exists:', user.email);
    }

    res.json({ 
      success: true, 
      message: 'User processed successfully',
      user: {
        id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving user'
    });
  }
});

export default router;