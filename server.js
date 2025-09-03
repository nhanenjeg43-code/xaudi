
// Simple Node.js + Express backend for Xaudi
// Handles uploads, products.json, and serves frontend

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const UPLOAD_DIR = path.join(__dirname, 'uploads');
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Storage config for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.static(__dirname)); // serve frontend files

// Load products
function loadProducts() {
  try {
    return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
  } catch (e) {
    return [];
  }
}

// Save products
function saveProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

// API: get products
app.get('/products.json', (req, res) => {
  res.json(loadProducts());
});

// API: upload new product
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    const { title, price, category } = req.body;
    const fileUrl = '/uploads/' + path.basename(req.file.path);

    const products = loadProducts();
    const newProduct = {
      id: Date.now(),
      title,
      price: parseFloat(price) || 0,
      category,
      file: fileUrl,
      audio: fileUrl // treat upload as audio/asset
    };
    products.push(newProduct);
    saveProducts(products);

    res.json({ success: true, product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
