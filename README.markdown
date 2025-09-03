# Beatstore Static (GitHub Pages Ready)

This is a static HTML/CSS/JS beatstore designed for deployment on GitHub Pages.

## Structure
- `index.html` – Homepage
- `beats.html` – Beats catalog (preview & add to cart)
- `music.html` – Music catalog (similar to beats)
- `sample-packs.html` – Sample packs catalog
- `vocal-presets.html` – Vocal presets catalog
- `admin-upload.html` – Client-side admin uploader (stores to localStorage)
- `checkout.html` – Cart & demo checkout
- `style.css` – Stylesheet
- `script.js` – JavaScript logic
- `products.json` – Optional product data (falls back to seed if not present)
- `assets/audio/silence.wav` – Placeholder audio file

## Notes
- Uses pure CSS (no Tailwind required) for simplicity.
- Data is stored in localStorage for client-side persistence.
- Admin password is 'admin' (change in `script.js` for security, though client-side only).
- Audio previews use `assets/audio/silence.wav`. Replace with real audio files and update URLs in `products.json` or `script.js`.
- Sorting is by price or default order (add 'date' to products for true 'newest').

## Setup
1. Ensure all files are in the `beatstore` folder as shown in the structure.
2. Place a `silence.wav` file in `assets/audio/` (create or download a silent WAV file).
3. Optionally, customize `products.json` or `script.js` seed data with your products.

## Create ZIP File
1. Create a `beatstore` folder with the structure above.
2. Copy all files into their respective locations.
3. On Windows: Right-click `beatstore` → "Send to" → "Compressed (zipped) folder".
4. On macOS/Linux: Run `zip -r beatstore.zip beatstore` in the terminal.

## Deploy to GitHub Pages
1. Create a new GitHub repository.
2. Upload the contents of the `beatstore` folder to the `main` branch.
3. Go to GitHub → Settings → Pages → Set "Source" to `main` branch and `/root`.
4. Site will be live at `https://<username>.github.io/<repo>/`.

## Customize
- Edit `products.json` or `script.js` seed data for catalog changes.
- Replace `assets/audio/silence.wav` with real audio and update URLs.
- For server-side functionality, migrate to a backend (e.g., Next.js).