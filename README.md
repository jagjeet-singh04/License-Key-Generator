# License Key Generator

Internal site to convert a user-provided request code into a final activation key using a shared secret.

## How it Works
- Normalize: uppercase alphanumeric only (strip non `[A-Za-z0-9]`).
- Compute: `SHA256(normalize(requestCode) + LICENSE_SHARED_SECRET)` using UTF-8 string concatenation.
- Return: first 16 chars of the uppercase hex digest.

Server endpoint: `POST /api/generate` with `{ requestCode }` returns `{ finalKey, normalized }`.

## Setup
1. Create `.env` based on `.env.example` and set `LICENSE_SHARED_SECRET`.
2. Install dependencies:
	```powershell
	npm install
	```
3. Run client locally:
	```powershell
	npm run dev
	```
	- Client (Vite): `http://localhost:5173`

## Security Notes
- Do not expose `LICENSE_SHARED_SECRET` publicly. The key generation runs in a Vercel Serverless Function (`/api/generate`).
- For local-only dev without a server, do not include secrets in the browser; use env on the Vercel function.
- Future: JWT mode (RS256/ES256/EdDSA) issuing a token with `machine_id`.

## Deploy to Vercel
1. Set `LICENSE_SHARED_SECRET` in Vercel Project Settings → Environment Variables.
2. Deploy:
	```powershell
	npx vercel --prod
	```
3. The site will be served statically, and `/api/generate` will be handled by the serverless function.

## Test Case
Given `requestCode = "DEXS4E5AJYF6G"` and `LICENSE_SHARED_SECRET = "OCTANE_AI_SECRET_SALT"`, output must equal `87BF5F85399651A8`.

Normalization check: inputs like `dexs-4e5ajyf6g` yield the same output.
