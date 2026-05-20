import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { connectDB } from '../../lib/db.js';
import User from '../../models/User.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    await connectDB();

    let { email, password, role } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    email = validator.normalizeEmail(email);

    let foundUser;

    if (role === 'admin') {
      // Admin is not stored in DB — validated via env vars only
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
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.setHeader('Set-Cookie',
      `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    );

    return res.status(200).json({
      success: true,
      user: { email: foundUser.email, name: foundUser.name, role: foundUser.role }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
}