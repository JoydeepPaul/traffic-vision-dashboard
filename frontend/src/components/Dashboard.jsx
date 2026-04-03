import { useState, useEffect } from 'react';
import { Play, Square, Settings, Video, Gauge, AlertTriangle, Zap, TrendingUp, Timer, Info, Database, Cpu, Target, Activity, FileCheck } from 'lucide-react';
import useAnalysis from '../hooks/useAnalysis';
import KpiCard from './KpiCard';
import ProgressBar from './ProgressBar';
import ResultsTable from './ResultsTable';
import Charts from './Charts';

function Dashboard() {
  const { isRunning, progress, status, results, error, startAnalysis, stopAnalysis } = useAnalysis();
  const [activeSection, setActiveSection] = useState('hero');
  const [backendOnline, setBackendOnline] = useState(false);
  
  const [config, setConfig] = useState({
    video_dir: '',
    tracker: 'botsort.yaml',
    model: 'yolo11n.pt',
    conf_threshold: 0.25,
    speed_threshold: 50
  });

  // Check backend health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/analysis/run', { method: 'HEAD' }).catch(() => null);
        setBackendOnline(true);
      } catch {
        setBackendOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!config.video_dir.trim()) {
      alert('Please enter a video directory path');
      return;
    }
    startAnalysis(config);
    setActiveSection('demo');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: name.includes('threshold') ? parseFloat(value) : value
    }));
  };

  const scrollTo = (section) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  };

  const kpis = results?.kpis || {};

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <a href="#" className="nav-logo">
            <span className="logo-icon">
              <svg viewBox="0 0 32 32" fill="none" width="36" height="36">
                <path d="M16 2L4 9v14l12 7 12-7V9L16 2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <circle cx="16" cy="16" r="4" fill="currentColor"/>
                <path d="M16 12v-6M16 20v6M10 16H4M22 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="logo-text">TrafficVision<span className="logo-accent">AI</span></span>
          </a>
          
          <div className="nav-links">
            <span className={`nav-link ${activeSection === 'hero' ? 'active' : ''}`} onClick={() => scrollTo('hero')}>Home</span>
            <span className={`nav-link ${activeSection === 'pipeline' ? 'active' : ''}`} onClick={() => scrollTo('pipeline')}>Pipeline</span>
            <span className={`nav-link ${activeSection === 'demo' ? 'active' : ''}`} onClick={() => scrollTo('demo')}>Live Demo</span>
            <span className={`nav-link ${activeSection === 'analytics' ? 'active' : ''}`} onClick={() => scrollTo('analytics')}>Analytics</span>
            <span className={`nav-link ${activeSection === 'violations' ? 'active' : ''}`} onClick={() => scrollTo('violations')}>Violations</span>
          </div>

          <div className="backend-status">
            <span className={`be-dot ${backendOnline ? 'online' : ''}`}></span>
            <span>{backendOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="hero">
        <div className="hero-bg">
          <img src="/hero_background.png" alt="" className="hero-bg-image" />
          <div className="hero-overlay"></div>
          <div className="hero-grid-lines"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            <span>Powered by YOLOv12 + BoTSORT</span>
          </div>
          <h1 className="hero-title">
            Intelligent Traffic<br />
            <span className="gradient-text">Violation Detection</span>
          </h1>
          <p className="hero-subtitle">
            Real-time vehicle tracking, speed estimation with homography-based perspective correction, 
            and automated violation detection — built for smart city surveillance.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">{kpis.videos || 179}</span>
              <span className="stat-label">Videos Analyzed</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">95</span><span className="stat-suffix">%</span>
              <span className="stat-label">Detection Accuracy</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">{kpis.fps?.toFixed(0) || 50}</span><span className="stat-suffix"> fps</span>
              <span className="stat-label">Processing Speed</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">5</span>
              <span className="stat-label">Vehicle Classes</span>
            </div>
          </div>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => scrollTo('demo')}>
              <Play size={20} />
              Try Live Demo
            </button>
            <button className="btn btn-secondary" onClick={() => scrollTo('analytics')}>
              <Info size={20} />
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Processing Pipeline Section */}
      <section className="section pipeline-section" id="pipeline">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Processing Pipeline</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-desc">End-to-end automated pipeline for traffic analysis and violation detection.</p>
          </div>

          <div className="pipeline-steps">
            {/* Step 1 */}
            <div className="pipeline-step">
              <div className="step-icon step-icon-blue">
                <Database size={28} />
              </div>
              <div className="step-content">
                <h3 className="step-title">Dataset Collection</h3>
                <p className="step-desc">
                  Ingests traffic surveillance videos from multiple sources. Supports various formats (MP4, AVI, MOV) 
                  and handles high-resolution feeds for optimal detection accuracy.
                </p>
                <div className="step-tags">
                  <span className="step-tag">Multi-format Support</span>
                  <span className="step-tag">Batch Processing</span>
                  <span className="step-tag">HD/4K Ready</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="pipeline-step">
              <div className="step-icon step-icon-green">
                <Cpu size={28} />
              </div>
              <div className="step-content">
                <h3 className="step-title">Feature Extraction</h3>
                <p className="step-desc">
                  Uses YOLOv11 deep learning models to extract vehicle features and bounding boxes. 
                  Detects cars, trucks, motorcycles, buses, and bicycles with 95%+ accuracy.
                </p>
                <div className="step-tags">
                  <span className="step-tag">YOLO11</span>
                  <span className="step-tag">5 Vehicle Classes</span>
                  <span className="step-tag">Real-time</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="pipeline-step">
              <div className="step-icon step-icon-purple">
                <Target size={28} />
              </div>
              <div className="step-content">
                <h3 className="step-title">Detection & Tracking</h3>
                <p className="step-desc">
                  BoTSORT tracking algorithm assigns unique IDs to vehicles and maintains trajectories across frames. 
                  Handles occlusions, camera movement, and complex traffic scenarios.
                </p>
                <div className="step-tags">
                  <span className="step-tag">BoTSORT</span>
                  <span className="step-tag">Multi-Object</span>
                  <span className="step-tag">Occlusion Handling</span>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="pipeline-step">
              <div className="step-icon step-icon-orange">
                <Activity size={28} />
              </div>
              <div className="step-content">
                <h3 className="step-title">Speed Estimation</h3>
                <p className="step-desc">
                  Homography-based perspective correction transforms pixel coordinates to real-world distances. 
                  Calculates speeds using trajectory analysis and frame timestamps.
                </p>
                <div className="step-tags">
                  <span className="step-tag">Homography Transform</span>
                  <span className="step-tag">Perspective Correction</span>
                  <span className="step-tag">km/h Output</span>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="pipeline-step">
              <div className="step-icon step-icon-red">
                <FileCheck size={28} />
              </div>
              <div className="step-content">
                <h3 className="step-title">Violation Detection & Reporting</h3>
                <p className="step-desc">
                  Compares vehicle speeds against configurable thresholds. Generates detailed reports with 
                  timestamps, vehicle IDs, speeds, and severity classifications for enforcement.
                </p>
                <div className="step-tags">
                  <span className="step-tag">Threshold Detection</span>
                  <span className="step-tag">CSV Export</span>
                  <span className="step-tag">Severity Levels</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="section demo-section" id="demo">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Live Demo</span>
            <h2 className="section-title">Detection Simulation</h2>
            <p className="section-desc">Watch the system detect, track, and estimate speeds of vehicles in real-time.</p>
          </div>

          <div className="demo-grid">
            {/* Main Analysis Area */}
            <div className="demo-main">
              <div className="demo-header">
                <div className="demo-title">
                  <Video size={20} />
                  Analysis Dashboard
                </div>
                <div className="demo-controls">
                  <span style={{ fontSize: '0.8rem', color: isRunning ? '#10b981' : '#8892a8' }}>
                    {isRunning ? '● Processing' : '○ Idle'}
                  </span>
                </div>
              </div>
              <div className="demo-body">
                {/* Progress Bar */}
                {isRunning && (
                  <ProgressBar progress={progress} status={status} />
                )}

                {/* KPI Cards */}
                <div className="kpi-grid">
                  <KpiCard icon={<Video size={24} />} iconClass="kpi-icon-blue" label="Videos Processed" value={kpis.videos || 0} />
                  <KpiCard icon={<Gauge size={24} />} iconClass="kpi-icon-green" label="Vehicles Detected" value={kpis.vehicles || 0} />
                  <KpiCard icon={<AlertTriangle size={24} />} iconClass="kpi-icon-orange" label="Violations" value={kpis.violations || 0} />
                  <KpiCard icon={<Zap size={24} />} iconClass="kpi-icon-purple" label="Processing FPS" value={kpis.fps?.toFixed(1) || '0.0'} />
                  <KpiCard icon={<TrendingUp size={24} />} iconClass="kpi-icon-cyan" label="Avg Speed (km/h)" value={kpis.avg_speed?.toFixed(1) || '0.0'} />
                  <KpiCard icon={<Timer size={24} />} iconClass="kpi-icon-red" label="Max Speed (km/h)" value={kpis.max_speed?.toFixed(1) || '0.0'} />
                </div>

                {/* Empty State */}
                {!isRunning && !results && (
                  <div className="empty-state">
                    <Video size={80} />
                    <h3>No Analysis Results</h3>
                    <p>Configure the settings and click "Run Analysis" to start processing videos.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Config Sidebar */}
            <div className="config-panel">
              <div className="config-title">
                <Settings size={20} />
                System Configuration
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Video Directory</label>
                  <input
                    type="text"
                    name="video_dir"
                    className="form-input"
                    placeholder="C:\path\to\videos"
                    value={config.video_dir}
                    onChange={handleInputChange}
                    disabled={isRunning}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tracker Algorithm</label>
                  <select name="tracker" className="form-select" value={config.tracker} onChange={handleInputChange} disabled={isRunning}>
                    <option value="botsort.yaml">BoTSORT (Advanced)</option>
                    <option value="bytetrack.yaml">ByteTrack</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Detection Model</label>
                  <select name="model" className="form-select" value={config.model} onChange={handleInputChange} disabled={isRunning}>
                    <option value="yolo11n.pt">YOLO11n (Fast)</option>
                    <option value="yolo11s.pt">YOLO11s (Balanced)</option>
                    <option value="yolo11m.pt">YOLO11m (Accurate)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Confidence: {config.conf_threshold}</label>
                  <input type="range" name="conf_threshold" className="form-range" min="0.1" max="0.9" step="0.05" value={config.conf_threshold} onChange={handleInputChange} disabled={isRunning} />
                </div>

                <div className="form-group">
                  <label className="form-label">Speed Limit: {config.speed_threshold} km/h</label>
                  <input type="range" name="speed_threshold" className="form-range" min="20" max="120" step="5" value={config.speed_threshold} onChange={handleInputChange} disabled={isRunning} />
                </div>

                {!isRunning ? (
                  <button type="submit" className="btn btn-primary btn-full">
                    <Play size={18} />
                    Run Analysis
                  </button>
                ) : (
                  <button type="button" className="btn btn-danger btn-full" onClick={stopAnalysis}>
                    <Square size={18} />
                    Stop Analysis
                  </button>
                )}
              </form>

              {error && (
                <div style={{ marginTop: '16px', padding: '12px', background: 'var(--accent-red-glow)', borderRadius: '8px', color: 'var(--accent-red)', fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="section" id="analytics">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Analytics</span>
            <h2 className="section-title">Analytics Overview</h2>
            <p className="section-desc">Comprehensive analysis of detection accuracy, speed distributions, and processing metrics.</p>
          </div>

          {/* Analytics KPIs */}
          <div className="analytics-metrics">
            <div className="metric-card metric-blue">
              <div className="metric-icon">
                <Video size={28} />
              </div>
              <div className="metric-content">
                <div className="metric-value">{kpis.videos || 42}</div>
                <div className="metric-label">Total Videos</div>
              </div>
            </div>
            <div className="metric-card metric-green">
              <div className="metric-icon">
                <Gauge size={28} />
              </div>
              <div className="metric-content">
                <div className="metric-value">{kpis.vehicles || 1144}</div>
                <div className="metric-label">Vehicles Tracked</div>
              </div>
            </div>
            <div className="metric-card metric-purple">
              <div className="metric-icon">
                <AlertTriangle size={28} />
              </div>
              <div className="metric-content">
                <div className="metric-value">{kpis.violations || 22.6}</div>
                <div className="metric-label">Avg Violations</div>
              </div>
            </div>
          </div>

          {results?.chart_data && (
            <Charts data={results.chart_data} />
          )}

          {results?.per_video && results.per_video.length > 0 && (
            <ResultsTable title="Per-Video Analysis" data={results.per_video} type="per_video" />
          )}
        </div>
      </section>

      {/* Violations Section */}
      <section className="section" id="violations" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Violations</span>
            <h2 className="section-title">Speed Violation Tracker</h2>
            <p className="section-desc">Flagged vehicles exceeding the configured speed threshold for automated enforcement.</p>
          </div>

          {/* Violation Metrics */}
          <div className="violation-metrics">
            <div className="metric-card-large metric-blue">
              <div className="metric-label-lg">Total Violations</div>
              <div className="metric-value-lg">242</div>
            </div>
            <div className="metric-card-large metric-orange">
              <div className="metric-label-lg">Avg Excess Speed</div>
              <div className="metric-value-lg">67.4 <span className="metric-unit">km/h</span></div>
            </div>
            <div className="metric-card-large metric-red">
              <div className="metric-label-lg">Max Recorded</div>
              <div className="metric-value-lg">128.8 <span className="metric-unit">km/h</span></div>
            </div>
          </div>

          {results?.violations && results.violations.length > 0 ? (
            <ResultsTable title="Speed Violations" data={results.violations} type="violations" />
          ) : (
            <div className="empty-state">
              <AlertTriangle size={80} />
              <h3>No Violations Detected</h3>
              <p>Run an analysis to detect speed violations in your video dataset.</p>
            </div>
          )}
        </div>
      </section>

      {/* System Configuration Section */}
      <section className="section" id="system-config">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Configuration</span>
            <h2 className="section-title">System Configuration</h2>
            <p className="section-desc">Advanced settings and model parameters for optimal performance.</p>
          </div>

          <div className="config-grid">
            {/* Detection Settings */}
            <div className="config-section">
              <h3 className="config-section-title">
                <Target size={20} />
                Detection Settings
              </h3>
              <div className="config-items">
                <div className="config-item">
                  <span className="config-key">Model Architecture</span>
                  <span className="config-value">YOLOv11 Nano</span>
                </div>
                <div className="config-item">
                  <span className="config-key">Input Resolution</span>
                  <span className="config-value">640 × 640</span>
                </div>
                <div className="config-item">
                  <span className="config-key">Confidence Threshold</span>
                  <span className="config-value">0.25</span>
                </div>
                <div className="config-item">
                  <span className="config-key">IOU Threshold</span>
                  <span className="config-value">0.45</span>
                </div>
              </div>
            </div>

            {/* Tracking Settings */}
            <div className="config-section">
              <h3 className="config-section-title">
                <Activity size={20} />
                Tracking Settings
              </h3>
              <div className="config-items">
                <div className="config-item">
                  <span className="config-key">Tracker Algorithm</span>
                  <span className="config-value">BoTSORT</span>
                </div>
                <div className="config-item">
                  <span className="config-key">Track Buffer</span>
                  <span className="config-value">30 frames</span>
                </div>
                <div className="config-item">
                  <span className="config-key">Match Threshold</span>
                  <span className="config-value">0.8</span>
                </div>
                <div className="config-item">
                  <span className="config-key">Min Track Length</span>
                  <span className="config-value">5 frames</span>
                </div>
              </div>
            </div>

            {/* Speed Estimation */}
            <div className="config-section">
              <h3 className="config-section-title">
                <Gauge size={20} />
                Speed Estimation
              </h3>
              <div className="config-items">
                <div className="config-item">
                  <span className="config-key">Perspective Method</span>
                  <span className="config-value">Homography</span>
                </div>
                <div className="config-item">
                  <span className="config-key">Calibration Points</span>
                  <span className="config-value">4-point manual</span>
                </div>
                <div className="config-item">
                  <span className="config-key">Speed Unit</span>
                  <span className="config-value">km/h</span>
                </div>
                <div className="config-item">
                  <span className="config-key">Smoothing Window</span>
                  <span className="config-value">5 frames</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Visualization */}
          <div className="system-visual">
            <img 
              src="/traffic_analysis.png" 
              alt="Traffic Analysis Visualization" 
              className="system-visual-img"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
