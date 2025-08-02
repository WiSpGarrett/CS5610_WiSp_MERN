import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  
  filename: {
    type: String,
    required: true
  },
  gcsUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number, 
      required: true
    }
  }
}, {
  timestamps: true
});

photoSchema.index({ userId: 1 });
photoSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
photoSchema.index({ createdAt: -1 });

const Photo = mongoose.model('Photo', photoSchema);

export default Photo;