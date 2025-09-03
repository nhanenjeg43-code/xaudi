
// Xaudi backend: Express + Multer
// - Serves static site
// - Handles product uploads with cover + audio preview
// - Exposes /products.json for the frontend
// - (Optional) PayFast notify stub

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const PUBLIC_DIR = __dirname;
const UPLOAD_DIR = path.join(PUBLIC_DIR, 'uploads');
const PRODUCTS_FILE = path.join(PUBLIC_DIR, 'products.json');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR));
app.use('/uploads', express.static(UPLOAD_DIR));

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.-]/g, '_');
    cb(null, Date.now() + '-' + safe);
  }
});
const upload = multer({ storage });

function loadProducts() {
  try { return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8')); }
  catch { return []; }
}
function saveProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

// GET product list
app.get('/products.json', (_req, res) => {
  res.json(loadProducts());
});

// Upload route: expects fields and two files
// Fields: title, category, price, bpm, key, daw, files, tags (comma)
// Files: coverFile (image), audioFile (audio)
app.post('/upload', upload.fields([
  { name: 'coverFile', maxCount: 1 },
  { name: 'audioFile', maxCount: 1 }
]), (req, res) => {
  try {
    const b = req.body;
    const cover = req.files?.coverFile?.[0] ? '/uploads/' + path.basename(req.files.coverFile[0].path) : '';
    const audio = req.files?.audioFile?.[0] ? '/uploads/' + path.basename(req.files.audioFile[0].path) : '';

    if (!b.title || !b.category || !b.price || !cover || !audio) {
      return res.status(400).json({ success:false, error: 'Missing required fields' });
    }

    const tags = (b.tags || '').split(',').map(s => s.trim()).filter(Boolean);
    const product = {
      id: `${b.category}-${Date.now()}`,
      title: b.title,
      category: b.category,
      price: parseFloat(b.price) || 0,
      cover,
      audio,
      tags,
      dateAdded: new Date().toISOString()
    };

    if (b.category === 'beats' || b.category === 'music') {
      product.bpm = parseInt(b.bpm || '120', 10);
      product.key = b.key || 'Cmin';
    } else if (b.category === 'vocal-presets') {
      product.daw = b.daw || 'FL Studio';
    } else if (b.category === 'sample-packs') {
      product.files = parseInt(b.files || '50', 10);
    }

    const products = loadProducts();
    products.push(product);
    saveProducts(products);

    return res.json({ success: true, product });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success:false, error: 'Upload failed' });
  }
});

// PayFast notify stub (optional)
app.post('/notify', express.urlencoded({ extended: true }), (req, res) => {
  console.log('PayFast ITN hit:', req.body);
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Xaudi server running at http://localhost:${PORT}`);
});
