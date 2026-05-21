// api/auth/index.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import xss from 'xss';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../../lib/db.js';
import User from '../../src/models/user.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env files
dotenv.config({ path: path.join(__dirname, '../../.env.local') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'rhythm_rise_super_secret_key';

const app = express();
// Enable trusting Vercel proxy to allow secure cookies to be set correctly
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.FRONTEND_URL,
      'https://rythmnrise.com',
      'https://www.rythmnrise.com',
    ].filter(Boolean);
    if (!origin || allowed.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true
}));

// Parsers (cookie parser is initialized before routes)
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many uploads, please try again later.' }
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage (no read-only disk access required)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed.'));
    }
  }
});

// Helper to parse cookies in verify route (fallback)
function parseCookies(cookieHeader = '') {
  return Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k.trim(), v.join('=')];
    })
  );
}

// Apply rate limiter to auth endpoints
app.use('/api/auth', authLimiter);

const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

// ── Signup Endpoint ────────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  try {
    await connectDB();
    let { email, password, name } = req.body;

    if (!email || !password || !name)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });

    if (!validator.isEmail(email))
      return res.status(400).json({ success: false, message: 'Invalid email format' });

    email = validator.normalizeEmail(email);
    name  = xss(name.trim());

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });

    const authorizedAdmin = process.env.ADMIN_EMAIL || 'rhythmandrise100@gmail.com';
    if (email.toLowerCase() === authorizedAdmin.toLowerCase())
      return res.status(403).json({ success: false, message: 'Admin accounts cannot be created via signup' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword, name, role: 'user' });

    const token = jwt.sign({ email: newUser.email, name: newUser.name, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    // Set cookie using res.cookie(...) before sending JSON response
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'Lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });

    return res.status(200).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: { email: newUser.email, name: newUser.name, role: 'user' }
    });
  } catch (err) {
    console.error('signup error:', err.message);
    return res.status(500).json({ success: false, message: 'Signup failed' });
  }
});

// ── Login Endpoint ─────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
    let { email, password, role } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    email = validator.normalizeEmail(email);

    let foundUser;
    if (role === 'admin') {
      const authorizedAdmin = process.env.ADMIN_EMAIL || 'rhythmandrise100@gmail.com';
      const adminPassword   = process.env.ADMIN_PASSWORD || '18*June*1976';

      if (email.toLowerCase() !== authorizedAdmin.toLowerCase())
        return res.status(403).json({ success: false, message: 'Unauthorized admin account' });

      if (password !== adminPassword)
        return res.status(401).json({ success: false, message: 'Invalid email or password' });

      foundUser = { email: authorizedAdmin, role: 'admin', name: 'Admin' };
    } else {
      foundUser = await User.findOne({ email });
      if (!foundUser)
        return res.status(401).json({ success: false, message: 'Invalid email or password' });

      const validPassword = await bcrypt.compare(password, foundUser.password);
      if (!validPassword)
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { email: foundUser.email, name: foundUser.name, role: foundUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie using res.cookie(...) before sending JSON response
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'Lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });

    return res.status(200).json({
      success: true,
      token,
      user: { email: foundUser.email, name: foundUser.name, role: foundUser.role }
    });
  } catch (err) {
    console.error('login error:', err.message);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ── Verify Session Endpoint ──────────────────────────────────────
app.get('/api/auth/verify', (req, res) => {
  try {
    // Try cookie first, then Authorization header as fallback
    let token = req.cookies?.token || parseCookies(req.headers.cookie)?.token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token)
      return res.status(401).json({ success: false, message: 'No session token provided' });

    const decoded = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({ success: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
});

// ── Logout Endpoint ──────────────────────────────────────────────
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'Lax' : 'Lax',
    path: '/'
  });
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// ── File Upload Endpoint (Supports Cloudinary Stream) ─────────────
app.post(['/api/upload', '/api/auth/upload'], uploadLimiter, upload.single('media'), (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No file uploaded or invalid format' });

    const mime = req.file.mimetype || '';
    const isVideo = mime.startsWith('video/');

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: isVideo ? 'video' : 'image',
        folder: 'rhythm-and-rise',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ success: false, message: 'Upload failed' });
        }
        const originalName = req.file.originalname.split('.')[0];
        const safeTitle = xss(originalName);
        return res.status(200).json({
          success: true,
          url: result.secure_url,
          title: safeTitle,
          publicId: result.public_id
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File is too large. Max size is 50MB.' });
  }
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start local dev server if not in Vercel lambda environment
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Backend server listening on port ${PORT}`));
}

export default app;
