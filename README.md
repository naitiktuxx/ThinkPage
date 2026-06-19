# ThinkPage — New Tab Dashboard (Offline-first PWA)

A personalized new-tab dashboard inspired by modern “new tab” experiences.

- **Single-page app** (no framework build step)
- **PWA / offline support** via a service worker
- **Customizable UI** (theme, glass effect, animations, layout)
- **Profiles** (separate settings + history per profile)
- **Search** with suggestions/history
- **Image search** (Google Lens UI with fallbacks)
- **Shortcuts / web apps** speed dial
- **Backup/restore** (export/import settings + history)

> Live demo (if you want to view the current UI state): https://thinkpage.vercel.app

---

## Firefox setup (recommended)

1. In Firefox, install recommended extensions for best experience (visual + navigation):
   - **New Tab Override** (to load this page as your new tab)
   - **Adaptive Tab Colour** (browser color theming)
   - **Gesturify** (navigation gestures)
2. Set **this page URL** as your default homepage/new tab.
3. In Firefox “New Tab” settings, ensure:
   - **Focus** behavior is enabled so this page can receive focus when opened.

> Note: The PWA/service-worker offline behavior requires a site origin (not `file://`).

---


## Features

### 1) New-tab layout
The page includes:
- Top-right links (e.g., **Gmail**, **Images**)
- An apps dropdown (“Your favourites”)
- A central search bar with suggestions
- A shortcuts area (web apps / speed-dial)
- A bottom “Customize” button (opens the customization panel)

### 2) Search
- Type a query in the search bar.
- The dashboard shows **suggestions** (built from local history).
- If you type a URL, it will open accordingly (behavior depends on the app logic in `index.html`).

### 3) Search by image (Lens UI)
There is a **Lens button** with a Google Lens-like UI.

When the image search flow requires fallbacks, the project shows a modal with options such as:
- Paste an image URL
- Drag & drop an image
- Paste from clipboard
- Redirect buttons for other engines (Bing / DuckDuckGo)

> Note: depending on platform/browser permissions, clipboard and drag-drop may vary.

### 4) Profiles
Use the avatar button to manage profiles:
- Add a profile (name + avatar/emoji/photo)
- Switch between profiles
- Each profile maintains its own:
  - Settings
  - Search history
  - Shortcuts and web apps

### 5) Shortcuts & Web Apps
You can create and arrange shortcuts:
- Add a shortcut (name + URL)
- Optional custom icon (URL or upload)
- Reorder via drag-and-drop (in edit mode)

### 6) Customization panel
Click **Customize** to open a side panel. It includes (high-level):
- **Search**
  - Search engine selection (including custom engine settings)
  - Search target: open in current tab vs new tab
  - Search bar layout controls (width/position)
  - Suggestions & history tuning
  - Show/hide logo + logo position
- **AI & tools**
  - Select which AI/tool buttons are visible
  - Control AI search history persistence
- **Shortcuts**
  - Show/hide shortcuts
  - Choose shortcuts source (your shortcuts vs most-visited)
  - Dock behavior next to the search bar
  - Collapse extra shortcuts
  - Hide expand button on focus
  - Dock position
- **Appearance**
  - Theme: dark / light / Catppuccin / auto
  - Glass effect toggle
  - Animations toggle
  - Close button position
- **Background**
  - Default / Random wallpaper / Custom upload

### 7) Backup / export / import
From the profile dropdown:
- **Export Data**: downloads a JSON backup
- **Import Data**: restores settings/history from a JSON file

There are also UI flows for importing search history (e.g., from Takeout-style JSON), depending on the data expected by the app.

---

## Offline support (Service Worker)

This project registers a **service worker** to enable offline usage.

### Files involved
- `sw.js` — service worker
- `manifest.webmanifest` — PWA manifest
- `app-icon.svg`, `index.html` — app shell

### Caching strategy (from `sw.js`)
- **App shell cache** (`APP_CACHE`):
  - caches `./`, `./index.html`, `./sw.js`, `./manifest.webmanifest`, `./app-icon.svg`
- **Runtime cache** (`RUNTIME_CACHE`):
  - caches images fetched from a curated set of hosts (e.g. Unsplash, NASA, Picsum)
  - limits cache size (`MAX_RUNTIME_ITEMS`)

Navigation behavior:
- If `index.html` (or a cached match) exists, it is returned.
- Assets are served from the appropriate cache when possible.

---

## Project structure


- `index.html`
  - All UI markup + styling (large single-file app)
  - App logic is also embedded in the page (in later parts of the file)
- `sw.js`
  - Offline caching + runtime image caching
- `manifest.webmanifest`
  - PWA metadata
- `app-icon.svg`
  - Icon used by the PWA

---

## Browser / platform notes

- **PWA behavior requires an origin** (typically `http://...`).
  - Opening `index.html` from disk may not fully enable service worker features.
- **Clipboard / drag-drop** depends on browser permission policies.
- Some styling uses `backdrop-filter`. The UI includes fallbacks when unsupported.

---

## License

MIT License. See [LICENSE](./LICENSE).


---

## Contributing

This is currently a work-in-progress with UI and logic embedded in `index.html`.

If you contribute:
1. Keep changes focused and documented.
2. Validate offline behavior after modifications to `sw.js`.
3. Test profiles + export/import flows.

