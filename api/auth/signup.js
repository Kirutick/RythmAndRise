import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import xss from 'xss';
import { connectDB } from '../../lib/db.js';
import User from '../../src/models/user.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    await connectDB();

    let { email, password, name } = req.body;

    if (!email || !password || !name)
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });

    if (!validator.isEmail(email))
      return res.status(400).json({ success: false, message: 'Invalid email format' });

    email = validator.normalizeEmail(email);
    name  = xss(name.trim());

    // Block admin email from signing up
    const authorizedAdmin = process.env.ADMIN_EMAIL || 'rhythmandrise100@gmail.com';
    if (email.toLowerCase() === authorizedAdmin.toLowerCase())
      return res.status(403).json({ success: false, message: 'Admin accounts cannot be created via signup' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword, name, role: 'user' });

    const token = jwt.sign(
      { email: newUser.email, name: newUser.name, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.setHeader('Set-Cookie',
      `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    );

    return res.status(200).json({
      success: true,
      message: 'Account created successfully',
      user: { email: newUser.email, name: newUser.name, role: 'user' }
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    return res.status(500).json({ success: false, message: 'Signup failed' });
  }
}