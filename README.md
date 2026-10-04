# NexGenPR — MERN Portfolio Site

React + Vite + Tailwind v4 frontend, Express + MongoDB backend, Cloudinary uploads, JWT admin at `/admin`.

## Setup
```bash
npm install
cp .env.example .env     # then fill in values
npm run dev              # API on :5000, site on http://localhost:5173
```
Admin: http://localhost:5173/admin (log in with ADMIN_EMAIL / ADMIN_PASSWORD).

## MongoDB Atlas
1. Create a free cluster at mongodb.com/atlas.
2. Database Access: create a user. Network Access: allow your IP (or 0.0.0.0/0 for hosted deploys).
3. Connect → Drivers → copy the URI into `MONGO_URI`, adding `/nexgenpr` before the `?`.
On first start, the 5 past works from the old site are seeded (text only). Open `/admin` and edit each to upload real images.

## Cloudinary
Dashboard → copy Cloud name, API Key, API Secret into `.env`. These stay on the server only; browsers upload to `/api/upload`, and the server forwards to Cloudinary and returns URLs. Public pages request auto-optimized `f_auto,q_auto` resized variants.

## Production
**Option A — one host (simplest, e.g. Render/Railway/VPS):**
`npm install && npm run build`, then `npm start`. Express serves `dist/` and the API on the same origin. Set all env vars on the host; `CLIENT_URL` = your site URL.

**Option B — split:**
- API: deploy `server.js` (Render/Railway), set env vars, `CLIENT_URL` = frontend URL.
- Frontend: deploy on Vercel/Netlify with build `npm run build`, output `dist`, env `VITE_API_URL` = API URL, and a rewrite of all routes to `/index.html` (so `/admin` works).

## API
POST /api/admin/login · GET /api/projects (`?all=1` + token for drafts) · GET /api/projects/:id · POST/PUT/DELETE /api/projects (JWT) · POST /api/upload (JWT, field `images`)