# Beatstore Static (GitHub Pages Ready)

This is a static HTML/CSS/JS export of your Next.js beatstore starter with a similar design.

## Structure
- `index.html` – homepage
- `beats.html` – beats catalog (preview & add to cart)
- `music.html` – same catalog styled as music
- `sample-packs.html` – sample packs
- `vocal-presets.html` – vocal presets
- `upload.html` – client-side mock uploader (stores to localStorage)
- `admin-upload.html` – static admin mock
- `checkout.html` – cart & demo checkout
- `assets/` – images & audio (includes a silent wav placeholder)

## Notes
- Tailwind is included via CDN for zero build steps.
- Fonts use Geist via CDN.
- Audio previews point to `assets/audio/silence.wav` by default. Replace with your own files and update `script.js` seed data (see `seedBeats`).

## Deploy to GitHub Pages
1. Create a new repo and upload the folder contents.
2. In GitHub → Settings → Pages → **Source**: select `main` branch `/root`.
3. Your site will be live at `https://<username>.github.io/<repo>/`.

## Customize
- Edit `script.js` to modify catalog data (beats, packs, presets).
- Replace images/audio in `assets/` and update URLs accordingly.
