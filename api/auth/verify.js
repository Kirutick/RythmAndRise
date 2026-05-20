// api/auth/verify.js
import jwt from 'jsonwebtoken';
import { connectDB } from '../../lib/db.js';
import User from '../../models/User.js';

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies.token;

    if (!token)
      return res.status(401).json({ error: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');

    if (!user)
      return res.status(401).json({ error: 'User not found' });

    return res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}