import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  uploadCount: {
    type: Number,
    default: 0
  },
  totalStorageUsed: {
    type: Number,
    default: 0
  },
  maxUploads: {
    type: Number,
    default: 10
  },
  maxStorage: {
    type: Number,
    default: 104857600
  }
}, {
  timestamps: true
});

userSchema.index({ googleId: 1 });
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

export default User;