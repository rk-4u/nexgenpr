import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const { MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, CLIENT_URL, PORT = 5000 } = process.env;
if (!MONGO_URI || !JWT_SECRET || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Missing env vars: MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD');
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const Project = mongoose.model('Project', new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  category: { type: String, default: '', trim: true },
  client: { type: String, default: '', trim: true },
  year: Number,
  description: { type: String, default: '', maxlength: 3000 },
  tags: [String],
  cover: { type: String, default: '' },
  images: [String],
  url: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: true },
}, { timestamps: true }));

const app = express();
app.set('trust proxy', 1);
app.use(cors({ origin: CLIENT_URL ? CLIENT_URL.split(',') : true }));
app.use(express.json({ limit: '1mb' }));

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();
const safeEq = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));
const verify = (req) => {
  try { return jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), JWT_SECRET); } catch { return null; }
};
const auth = (req, res, next) => (verify(req) ? next() : res.status(401).json({ error: 'Unauthorized' }));

const cld = (u) => (typeof u === 'string' && /^https:\/\/(res\.cloudinary\.com|picsum\.photos)\//.test(u) ? u : '');
const pick = (b) => ({
  title: String(b.title || '').trim(),
  category: String(b.category || '').trim(),
  client: String(b.client || '').trim(),
  year: b.year ? Number(b.year) : undefined,
  description: String(b.description || '').slice(0, 3000),
  tags: (Array.isArray(b.tags) ? b.tags : []).map((t) => String(t).trim()).filter(Boolean).slice(0, 12),
  cover: cld(b.cover),
  images: (Array.isArray(b.images) ? b.images : []).map(cld).filter(Boolean).slice(0, 20),
  url: /^https?:\/\//i.test(b.url || '') ? b.url : '',
  featured: !!b.featured,
  published: b.published !== false,
});

// ---- Auth (basic in-memory brute-force limiter) ----
const tries = new Map();
app.post('/api/admin/login', (req, res) => {
  const ip = req.ip, now = Date.now();
  const t = (tries.get(ip) || []).filter((x) => now - x < 15 * 60 * 1000);
  if (t.length >= 10) return res.status(429).json({ error: 'Too many attempts. Try later.' });
  const { email = '', password = '' } = req.body || {};
  if (safeEq(email.toLowerCase(), ADMIN_EMAIL.toLowerCase()) && safeEq(password, ADMIN_PASSWORD)) {
    tries.delete(ip);
    return res.json({ token: jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' }) });
  }
  tries.set(ip, [...t, now]);
  res.status(401).json({ error: 'Invalid credentials' });
});

// ---- Projects ----
app.get('/api/projects', async (req, res) => {
  try {
    const all = req.query.all === '1' && verify(req);
    const items = await Project.find(all ? {} : { published: true }).sort({ featured: -1, createdAt: -1 }).lean();
    res.json(items);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/projects/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
  const p = await Project.findById(req.params.id).lean();
  if (!p || (!p.published && !verify(req))) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

app.post('/api/projects', auth, async (req, res) => {
  try {
    const data = pick(req.body);
    if (!data.title) return res.status(400).json({ error: 'Title is required' });
    res.status(201).json(await Project.create(data));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/projects/:id', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
    const data = pick(req.body);
    if (!data.title) return res.status(400).json({ error: 'Title is required' });
    const p = await Project.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    p ? res.json(p) : res.status(404).json({ error: 'Not found' });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/projects/:id', auth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
  const p = await Project.findByIdAndDelete(req.params.id);
  p ? res.json({ ok: true }) : res.status(404).json({ error: 'Not found' });
});

// ---- Upload: browser -> backend -> Cloudinary -> URL ----
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 12 },
  fileFilter: (_, f, cb) => cb(/^image\/(jpe?g|png|webp|gif|avif)$/.test(f.mimetype) ? null : new Error('Only images allowed'), true),
});
const toCloudinary = (buf) => new Promise((resolve, reject) =>
  cloudinary.uploader.upload_stream({ folder: 'nexgenpr', resource_type: 'image' }, (err, r) => (err ? reject(err) : resolve(r.secure_url))).end(buf));

app.post('/api/upload', auth, upload.array('images', 12), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ error: 'No files' });
    res.json({ urls: await Promise.all(req.files.map((f) => toCloudinary(f.buffer))) });
  } catch (e) { res.status(500).json({ error: 'Upload failed: ' + e.message }); }
});

// ---- Client reviews ----
const Review = mongoose.model('Review', new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  company: { type: String, default: '', trim: true, maxlength: 100 },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  text: { type: String, required: true, maxlength: 1000 },
  published: { type: Boolean, default: true },
  demo: { type: Boolean, default: false },
}, { timestamps: true }));

const pickReview = (b) => ({
  name: String(b.name || '').trim(),
  company: String(b.company || '').trim(),
  rating: Math.min(5, Math.max(1, Math.round(Number(b.rating)) || 5)),
  text: String(b.text || '').trim().slice(0, 1000),
  published: b.published !== false,
});

app.get('/api/reviews', async (req, res) => {
  try {
    const all = req.query.all === '1' && verify(req);
    res.json(await Review.find(all ? {} : { published: true }).sort({ createdAt: -1 }).lean());
  } catch { res.status(500).json({ error: 'Server error' }); }
});
app.post('/api/reviews', auth, async (req, res) => {
  try { res.status(201).json(await Review.create(pickReview(req.body))); } catch (e) { res.status(400).json({ error: e.message }); }
});
app.put('/api/reviews/:id', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
    const r = await Review.findByIdAndUpdate(req.params.id, pickReview(req.body), { new: true, runValidators: true });
    r ? res.json(r) : res.status(404).json({ error: 'Not found' });
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete('/api/demo-reviews', auth, async (_, res) => res.json(await Review.deleteMany({ demo: true })));
app.delete('/api/reviews/:id', auth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
  (await Review.findByIdAndDelete(req.params.id)) ? res.json({ ok: true }) : res.status(404).json({ error: 'Not found' });
});

app.use('/api', (_, res) => res.status(404).json({ error: 'Not found' }));

// ---- Serve built frontend (single-host deployment) ----
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist, { maxAge: '7d', index: false }));
  app.get('*', (_, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((err, _req, res, _next) => res.status(400).json({ error: err.message || 'Error' }));

// // ---- Seed existing work from the old site (text only; add images in /admin) ----
// const SEED = [
//   { title: 'Earth Day', category: 'Graphic Design', description: "Bringing nature's best to life through design.", featured: true },
//   { title: 'Sizzler', client: 'Anjushree Cafe', category: 'Graphic Design', description: 'Where design meets comfort and every detail tells a story.', featured: true },
//   { title: 'Back to School', category: 'Graphic Design', description: 'Where creativity meets storytelling on every page.', featured: true },
//   { title: 'Exhibition Booth', category: 'Exhibition Design', description: 'Showcasing innovation, one booth at a time.' },
//   { title: 'Paris 2024 Bronze — Swapnil Kusale', category: 'Graphic Design', description: 'Powering up your brand with dynamic design and bold strategies.' },
// ];

// mongoose.connect(MONGO_URI).then(async () => {
//   if ((await Project.countDocuments()) === 0) await Project.insertMany(SEED);
//   app.listen(PORT, () => console.log(`API running on :${PORT}`));
// }).catch((e) => { console.error('MongoDB connection failed:', e.message); process.exit(1); });



// ---- Demo data (placeholder images from picsum.photos; replace via /admin) ----
const pic = (seed, w, h) => `https://picsum.photos/seed/${seed}/${w}/${h}`;
const SEED = [
  { title: 'Earth Day', category: 'Graphic Design', description: "Bringing nature's best to life through design.", cover: pic('ng-earth', 900, 1125), images: [pic('ng-earth-b', 1200, 800)], tags: ['Social media'], featured: true },
  { title: 'Sizzler', client: 'Anjushree Cafe', category: 'Graphic Design', description: 'Where design meets comfort and every detail tells a story.', cover: pic('ng-sizzler', 900, 900), images: [pic('ng-sizzler-b', 900, 1200)], tags: ['Restaurant', 'Social media'], featured: true },
  { title: 'Back to School', category: 'Graphic Design', description: 'Where creativity meets storytelling on every page.', cover: pic('ng-school', 900, 1200), tags: ['Education'], featured: true },
  { title: 'Exhibition Booth', category: 'Exhibition Design', description: 'Showcasing innovation, one booth at a time.', cover: pic('ng-booth', 1000, 700), tags: ['3D', 'CGI'] },
  { title: 'Paris 2024 Bronze — Swapnil Kusale', category: 'Graphic Design', description: 'Powering up your brand with dynamic design and bold strategies.', cover: pic('ng-bronze', 900, 1100), tags: ['Sports'] },
];
const DEMO_REVIEWS = [
  { name: 'Aarav Mehta', company: 'Sample Brand One', rating: 5, text: 'Sample review text for layout testing. The team understood our brand quickly and delivered creative work on time.' },
  { name: 'Priya Sharma', company: 'Sample Cafe', rating: 5, text: 'Placeholder feedback: our social media looks far more consistent and our posts get noticed.' },
  { name: 'Rohan Verma', company: 'Sample School', rating: 4, text: 'Placeholder feedback: great communication and clean designs for our admission campaign.' },
  { name: 'Neha Joshi', company: 'Sample Studio', rating: 5, text: 'Placeholder feedback: a smooth process from the first call to the final delivery.' },
  { name: 'Karan Patel', company: 'Sample Exports', rating: 5, text: 'Placeholder feedback: our website and branding finally feel professional and modern.' },
].map((r) => ({ ...r, demo: true }));

mongoose.connect(MONGO_URI).then(async () => {
  if ((await Project.countDocuments()) === 0) await Project.insertMany(SEED);
  if ((await Review.countDocuments()) === 0) await Review.insertMany(DEMO_REVIEWS);
  app.listen(PORT, () => console.log(`API running on :${PORT}`));
}).catch((e) => { console.error('MongoDB connection failed:', e.message); process.exit(1); });