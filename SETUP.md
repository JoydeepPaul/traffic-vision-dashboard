# TrafficVision Dashboard - Hybrid MERN Architecture

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account (free tier works)

### 1. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Server
cd ../server
npm install

# Backend (Python)
cd ../backend
pip install -r requirements.txt
```

### 2. Configure MongoDB

1. Create a free MongoDB Atlas cluster at https://cloud.mongodb.com
2. Get your connection string
3. Edit `server/.env` and replace the MONGODB_URI

### 3. Start All Services

**Windows:**
```bash
start_all.bat
```

**Manual:**
```bash
# Terminal 1 - Python ML Backend
cd backend
python app_fastapi.py

# Terminal 2 - Node.js API Gateway  
cd server
npm start

# Terminal 3 - React Frontend
cd frontend
npm run dev
```

### 4. Open Dashboard

Navigate to http://localhost:3000

## Architecture

```
React (Vite)  →  Node.js/Express  →  Python FastAPI
   :3000            :4000              :5000
                      ↓
                  MongoDB Atlas
```

## Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React dashboard |
| API Gateway | 4000 | Node.js routing + MongoDB |
| ML Backend | 5000 | Python YOLO processing |

## API Endpoints

### Node.js Gateway (Port 4000)
- `POST /api/analysis/run` - Start analysis
- `GET /api/analysis/stream` - SSE progress
- `POST /api/analysis/stop` - Stop analysis
- `GET /api/results/latest` - Get results
- `GET /api/history` - Past analyses

### Python Backend (Port 5000)
- `GET /health` - Health check
- `POST /api/run` - Start ML processing
- `GET /api/stream` - SSE events
- `GET /api/results` - Current results
