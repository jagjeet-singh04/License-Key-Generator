import dotenv from 'dotenv';
import express from 'express';
import crypto from 'crypto';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors({ origin: true }));

function normalize(str) {
  return (str || '')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase();
}

function computeFinalKey(requestCode, secret) {
  const tempClean = normalize(requestCode);
  const input = Buffer.from(tempClean + secret, 'utf8');
  const digest = crypto.createHash('sha256').update(input).digest('hex').toUpperCase();
  const finalKey = digest.slice(0, 16);
  const formattedFinalKey = finalKey.match(/.{1,4}/g).join('-');
  return {
    tempClean,
    finalKey,
    formattedFinalKey,
  };
}

app.post('/api/generate', (req, res) => {
  try {
    const { requestCode } = req.body || {};
    if (!requestCode || typeof requestCode !== 'string') {
      return res.status(400).json({ error: 'Invalid requestCode' });
    }

    const secret = process.env.LICENSE_SHARED_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'LICENSE_SHARED_SECRET not configured' });
    }

    const { tempClean, finalKey, formattedFinalKey } = computeFinalKey(requestCode, secret);
    if (!tempClean || !/^[A-Z0-9]+$/.test(tempClean)) {
      return res.status(400).json({ error: 'Normalized request code is empty or non-alphanumeric' });
    }

    return res.json({ finalKey, formattedFinalKey, normalized: tempClean });
  } catch (err) {
    console.error('Error in /api/generate', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`License server listening on http://localhost:${PORT}`);
});
