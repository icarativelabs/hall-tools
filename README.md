# Hall Tools

A Chrome extension for Hall Chrysler Dodge Jeep RAM. Highlight text, right-click, and pick **Hall Tools**:

- **Search Inventory** — searches hallchryslerjeep.net inventory for the highlighted text
- **Check Recalls** — opens NHTSA's recall lookup with the highlighted text
- **Get Window Sticker** — appears only when the highlight is a VIN; opens the manufacturer's sticker PDF (Stellantis, Ford, GM)
- **Search Web for Window Sticker** — Google search for the VIN + "window sticker" (works for any brand)

## Install on a new computer

1. Click the green **Code** button above → **Download ZIP**, and unzip it somewhere you'll keep it (e.g. Documents).
   - Or, with git: `git clone <this repo's URL>`
2. In Chrome, go to `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and select the unzipped `hall-tools` folder (the one containing `manifest.json`).

## Update to the latest version

1. Download the ZIP again and unzip it over the old folder (or run `git pull` in the folder).
2. In `chrome://extensions`, click the reload arrow on the Hall Tools card.
3. Refresh any open tabs so VIN detection runs on them.

## Files

| File | What it does |
|---|---|
| `manifest.json` | Extension settings and version |
| `background.js` | Builds the right-click menu and handles clicks |
| `content.js` | Watches what you highlight so VIN-only options can appear |
| `vin.js` | VIN detection, check-digit validation, model year, and maker → sticker link |
