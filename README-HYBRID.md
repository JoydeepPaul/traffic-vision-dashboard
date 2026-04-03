# TrafficVision AI - MERN Stack Version

## Architecture

This project uses a **hybrid approach** to serve the exact Netlify design while maintaining a MERN backend:

- **Frontend (React)**: Redirects to the original static HTML
- **Server (Node/Express)**: Serves the original design from `/archive` + API endpoints
- **Backend (Python FastAPI)**: ML processing and analysis
- **Database (MongoDB)**: Persistent storage for results

## Setup & Running

### Start All Services

```bash
.\start_all.bat
```

This will start:
1. Python ML Backend on `http://localhost:5000`
2. Node.js API Gateway on `http://localhost:4000`
3. React Frontend on `http://localhost:3000` (redirects to archive)

### Access the Application

**Option 1: Via React** (recommended)
- Visit: `http://localhost:3000`
- Automatically redirects to the original design

**Option 2: Direct Access**
- Visit: `http://localhost:4000/archive/index.html`
- Direct access to the original static HTML

Both options will show the **exact design** from https://trafficvision-ai-joydeep.netlify.app/

## Why This Approach?

The original design (`/archive` folder) is a fully-featured static HTML/CSS/JS site with:
- Complex canvas-based demo simulations
- Chart.js visualizations
- Custom animations and interactions
- Pixel-perfect styling

Rather than rebuilding everything in React (which would take considerable time and risk introducing visual differences), we:
1. **Serve the original design as-is** via Express static middleware
2. **Keep the MERN backend** for API processing and database operations
3. **Maintain React** for future feature additions

## API Endpoints

The Node.js server provides:
- `POST /api/analysis/run` - Start video analysis
- `GET /api/analysis/status/:id` - Check analysis status
- `GET /api/analysis/result/:id` - Get analysis results
- `POST /api/analysis/stop/:id` - Stop running analysis

## File Structure

```
traffic-vision-dashboard/
├── archive/          # Original static HTML/CSS/JS (served at /archive)
├── backend/          # Python FastAPI ML backend
├── frontend/         # React app (redirects to archive)
├── server/           # Node.js Express API gateway
└── start_all.bat     # Start all services
```

## Next Steps

If you want to rebuild specific sections in React in the future:
1. Start with simple sections (Hero, Pipeline)
2. Use the archive HTML/CSS as exact reference
3. Gradually migrate components one by one
4. Update App.jsx to use the new React components instead of redirecting

For now, you have a **fully functional MERN stack** serving the **exact original design**! 🚀
