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

router.get('/me', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Missing x-user-id header' });
    }

    const user = await User.findById(userId).select('uploadCount totalStorageUsed maxUploads maxStorage name email');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (err) {
    console.error('Get current user error', err);
    return res.status(500).json({ success: false, message: 'Unexpected server error' });
  }
});

export default router;