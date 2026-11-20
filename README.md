# Celestial Atlas

A static, multi-section lore atlas designed for GitHub Pages. It uses plain HTML, CSS, and JavaScript—no build tools or dependencies.

## Files

- `index.html` — application shell and navigation
- `css/atlas.css` — shared visual styling
- `js/starMap.js` — canvas starfield, panning, wraparound, and constellation selection
- `js/app.js` — navigation, search, and detail-panel rendering
- `data/constellations.js` — constellation positions and descriptions
- `data/lore.js` — starter records for the lore sections

## Run locally

Open `index.html` in a browser. For best results, use a small local web server (for example, VS Code Live Server), especially as the project grows.

## Publish with GitHub Pages

1. Upload the contents of this folder to the root of your GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Choose **Deploy from a branch**, select your main branch and the `/ (root)` folder, then save.
4. Open the published Pages URL.

## Customize

- Add or move stars in `data/constellations.js`. Coordinates use a 5000 × 4000 world.
- Add lore by editing `data/lore.js`. The navigation keys are `magic`, `creation`, `planes`, `forces`, `gods`, `titans`, `spirits`, and `empires`.
- The atlas is intentionally data-driven: new records can be added without changing the renderer.
