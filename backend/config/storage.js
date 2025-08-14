import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

const storage = new Storage();

// Uploads an in-memory JPEG buffer to GCS under a user folder.
export const uploadBufferToGCS = async (buffer, userId) => {
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) throw new Error('GCS_BUCKET_NAME env var not set');

  const bucket = storage.bucket(bucketName);

  // Create a unique filename for the uploaded file.
  const filename = `${userId}/${uuidv4()}.jpg`;
  const file = bucket.file(filename);
  
  // Upload the file to GCS.
  await file.save(buffer, {
    contentType: 'image/jpeg',
    metadata: { cacheControl: 'public, max-age=604800' }
  });

  // Return the public URL and filename.
  const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
  return { publicUrl, filename, bucketName };
};

// Delete a previously uploaded file from GCS.
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