import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { uploadBufferToGCS, deleteFileFromGCS } from '../config/storage.js';
import Photo from '../models/Photo.js';
import User from '../models/User.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const router = express.Router();

router.post('/', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo file provided' });
    }

    const { title = '', latitude, longitude } = req.body;

    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ success:false, message:'Missing x-user-id header'});

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success:false, message:'User not found'});

    if (user.uploadCount >= user.maxUploads) {
      return res.status(413).json({ success:false, message:'Upload limit reached' });
    }
    if (user.totalStorageUsed + req.file.size > user.maxStorage) {
      return res.status(413).json({ success:false, message:'Storage limit reached' });
    }

    const compressed = await sharp(req.file.buffer)
      .resize({ width: 1280, withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toBuffer();

    const { publicUrl, filename } = await uploadBufferToGCS(compressed, userId);

    const photoDoc = await Photo.create({
      userId,
      title,
      description: '',
      filename,
      gcsUrl: publicUrl,
      fileSize: compressed.length,
      location: { latitude, longitude }
    });

    user.uploadCount += 1;
    user.totalStorageUsed += compressed.length;
    await user.save();

    return res.json({ success:true, photo: photoDoc });
  } catch (err) {
    console.error('Upload error', err);
    res.status(500).json({ success: false, message: 'Unexpected server error' });
  }
});

router.delete('/:photoId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ success:false, message:'Missing x-user-id header'});

    const { photoId } = req.params;
    const photo = await Photo.findById(photoId);
    if (!photo) return res.status(404).json({ success:false, message:'Photo not found'});
    if (photo.userId.toString() !== userId) {
      return res.status(403).json({ success:false, message:'Not your photo'});
    }

    await deleteFileFromGCS(photo.filename);

    await User.findByIdAndUpdate(userId, {
      $inc: {
        uploadCount: -1,
        totalStorageUsed: -photo.fileSize
      }
    });

    await photo.deleteOne();

    return res.json({ success:true, message:'Photo deleted'});
  } catch (err) {
    console.error('Delete error', err);
    res.status(500).json({ success:false, message:'Unexpected server error'});
  }
});

router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};

    const photos = await Photo.find(filter, 'title gcsUrl location createdAt userId')
      .sort({ createdAt: -1 });

    res.json({ success: true, photos });
  } catch (err) {
    console.error('Get photos error', err);
    res.status(500).json({ success: false, message: 'Unexpected server error' });
  }
});

export default router;