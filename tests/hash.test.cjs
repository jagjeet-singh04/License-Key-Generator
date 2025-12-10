const assert = require('assert');
const crypto = require('crypto');

function normalize(str) {
  return (str || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

function finalKey(requestCode, secret) {
  const temp = normalize(requestCode);
  const digest = crypto.createHash('sha256').update(Buffer.from(temp + secret, 'utf8')).digest('hex').toUpperCase();
  return digest.slice(0, 16);
}

// Sample test cases
const SECRET = process.env.LICENSE_SHARED_SECRET || 'OCTANE_AI_SECRET_SALT';

assert.strictEqual(finalKey('DEXS4E5AJYF6G', SECRET), '87BF5F85399651A8');
assert.strictEqual(finalKey('dexs-4e5ajyf6g', SECRET), '87BF5F85399651A8');

console.log('All hashing tests passed');
