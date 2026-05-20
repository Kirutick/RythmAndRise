// api/upload.js
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import fs from 'fs';
import xss from 'xss';
import path from 'path';

// Tell Vercel not to parse the body — formidable handles it
export const config = {
  api: { bodyParser: false },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')
    return res.status(405).json({ success: false, message: 'Method not allowed' });

  const form = formidable({
    maxFileSize: 50 * 1024 * 1024, // 50MB
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    const file = Array.isArray(files.media) ? files.media[0] : files.media;

    if (!file)
      return res.status(400).json({ success: false, message: 'No file uploaded' });

    const mime = file.mimetype || '';
    const isImage = mime.startsWith('image/');
    const isVideo = mime.startsWith('video/');

    if (!isImage && !isVideo)
      return res.status(400).json({ success: false, message: 'Only images and videos are allowed' });

    try {
      // Upload to Cloudinary from the temp file path
      const result = await cloudinary.uploader.upload(file.filepath, {
        resource_type: isVideo ? 'video' : 'image',
        folder: 'rhythm-and-rise',            // organizes uploads in your Cloudinary dashboard
        use_filename: false,
        unique_filename: true,
      });

      // Clean up Vercel's temp file after upload
      fs.unlink(file.filepath, () => {});

      const originalName = path.parse(file.originalFilename || 'file').name;
      const safeTitle    = xss(originalName);

      return res.status(200).json({
        success: true,
        url:   result.secure_url,     // permanent HTTPS URL
        title: safeTitle,
        publicId: result.public_id,   // save this if you want to delete later
      });

    } catch (uploadErr) {
      console.error('Cloudinary upload error:', uploadErr.message);
      return res.status(500).json({ success: false, message: 'Upload failed' });
    }
  });
}