# 🚦 TrafficVision AI — Intelligent Traffic Violation Detection System

A responsive, modern web dashboard showcasing an AI-powered traffic monitoring system using **YOLOv12**, **BoTSORT**, and homography-based perspective correction for real-time speed estimation and violation detection.

![TrafficVision AI Dashboard](hero_background.png)

## 🌐 Live Demo

**[https://trafficvision-ai-joydeep.netlify.app](https://trafficvision-ai-joydeep.netlify.app)**

## ✨ Features

- **Hero Section** — Animated KPI counters showcasing system performance
- **Processing Pipeline** — 5-stage architecture visualization (Calibration → Frame Acquisition → Detection & Tracking → Speed Estimation → Violation Detection)
- **Live Detection Simulation** — Interactive canvas-based vehicle tracking with real-time HUD, bounding boxes, and detection log
- **Analytics Dashboard** — 4 KPI cards + 4 Chart.js charts (accuracy, vehicle classes, speed distribution, processing time)
- **Speed Violation Tracker** — Searchable, filterable, paginated violation table with severity badges
- **System Configuration** — Interactive config panel with sliders and live JSON preview

## 🛠️ Tech Stack

### Frontend (Dashboard)
| Technology | Purpose |
|-----------|---------|
| HTML5 | Semantic structure |
| CSS3 | Custom design system, glassmorphism, responsive layout |
| JavaScript | Interactive charts, simulation, table logic |
| Chart.js | Data visualization |
| Inter + JetBrains Mono | Typography (Google Fonts) |

### Backend (Python ML Pipeline)
| Technology | Purpose |
|-----------|---------|
| YOLOv12x | Object detection |
| BoTSORT | Multi-object tracking |
| OpenCV | Frame processing, homography computation |
| PyTorch | GPU acceleration (CUDA) |
| NumPy / Pandas | Data processing & analysis |

## 📁 Project Structure

```
traffic-vision-dashboard/
├── index.html          # Main HTML (6 sections)
├── index.css           # Design system & responsive styles
├── index.js            # Charts, simulation, table, config logic
├── hero_background.png # Hero section background image
├── traffic_analysis.png# Feature illustration
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Run Locally
```bash
# Clone the repository
git clone https://github.com/JoydeepPaul/traffic-vision-dashboard.git
cd traffic-vision-dashboard

# Serve with any static file server
npx serve .
# or
python -m http.server 3000
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir .
```

## 📊 System Metrics

| Metric | Value |
|--------|-------|
| Videos Analyzed | 179 |
| Detection Accuracy | 95.3% |
| Vehicle Classes | 5 (Car, Truck, Bus, Motorbike, Bicycle) |
| Processing Speed | ~48 FPS (CUDA) |

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with using advanced computer vision and deep learning.

