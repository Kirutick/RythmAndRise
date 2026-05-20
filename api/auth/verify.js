import jwt from 'jsonwebtoken';

function parseCookies(cookieHeader = '') {
  return Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k.trim(), v.join('=')];
    })
  );
}

export default function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const cookies = parseCookies(req.headers.cookie);
    const token   = cookies.token;

    if (!token)
      return res.status(401).json({ success: false, message: 'No session cookie provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ success: true, user: decoded });

  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
}