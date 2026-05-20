// api/auth/logout.js
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  res.setHeader('Set-Cookie', [
    'token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
  ]);

  return res.status(200).json({ message: 'Logged out' });
}