import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

const storage = new Storage();

export const uploadBufferToGCS = async (buffer, userId) => {
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) throw new Error('GCS_BUCKET_NAME env var not set');

  const bucket = storage.bucket(bucketName);
  const filename = `${userId}/${uuidv4()}.jpg`;
  const file = bucket.file(filename);

  await file.save(buffer, {
    contentType: 'image/jpeg',
    metadata: { cacheControl: 'public, max-age=604800' }
  });

  const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
  return { publicUrl, filename, bucketName };
};

export const deleteFileFromGCS = async (filename) => {
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) throw new Error('GCS_BUCKET_NAME env var not set');
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filename);
  try {
    await file.delete();
  } catch (err) {
    if (err.code !== 404) throw err;
  }
};