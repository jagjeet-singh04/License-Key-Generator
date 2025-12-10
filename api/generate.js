export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { requestCode } = req.body || {};
    if (!requestCode || typeof requestCode !== 'string') {
      return res.status(400).json({ error: 'Invalid requestCode' });
    }

    const secret = process.env.LICENSE_SHARED_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'LICENSE_SHARED_SECRET not configured' });
    }

    const tempClean = (requestCode || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (!tempClean || !/^[A-Z0-9]+$/.test(tempClean)) {
      return res.status(400).json({ error: 'Normalized request code is empty or non-alphanumeric' });
    }

    const crypto = await import('crypto');
    const digest = crypto.createHash('sha256').update(Buffer.from(tempClean + secret, 'utf8')).digest('hex').toUpperCase();
    const finalKey = digest.slice(0, 16);
    const formattedFinalKey = finalKey.match(/.{1,4}/g).join('-');

    return res.status(200).json({ finalKey, formattedFinalKey, normalized: tempClean });
  } catch (err) {
    console.error('Error in /api/generate', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
