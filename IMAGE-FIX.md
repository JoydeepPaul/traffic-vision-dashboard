# Image Loading Fix

## Issue
Background images (`hero_background.png` and `traffic_analysis.png`) were not loading when accessing the archive HTML.

## Solution
Updated the Express server (`server/src/index.js`) to serve the root directory assets under the `/archive` route.

This allows the archive HTML to find:
- `/archive/hero_background.png` → serves root `hero_background.png`
- `/archive/traffic_analysis.png` → serves root `traffic_analysis.png`

## Testing

1. Stop all services (Ctrl+C in all terminals)
2. Run: `.\start_all.bat`
3. Visit: `http://localhost:4000/archive/index.html`
4. Check:
   - Hero section should show traffic highway background
   - System Configuration section should show traffic analysis diagram

## Image Paths

The following files are served:
```
Root Directory:
  ├── hero_background.png (used in hero section)
  ├── traffic_analysis.png (used in config section)
  └── archive/
      └── index.html (references both images)
```

Express middleware stack:
```javascript
app.use('/archive', express.static('archive/'));     // Serve archive HTML/CSS/JS
app.use('/archive', express.static('./'));            // Serve root images
app.use(express.static('./'));                        // Fallback for direct access
```

This configuration ensures images load correctly from any access point! ✅
