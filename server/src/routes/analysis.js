import express from 'express';
import { proxyToMLBackend, streamFromMLBackend } from '../services/mlBackend.js';
import Analysis from '../models/Analysis.js';

const router = express.Router();

// Start new analysis
router.post('/analysis/run', async (req, res) => {
  try {
    const { video_dir, tracker, model, conf_threshold, speed_threshold } = req.body;
    
    // Forward to Python ML backend
    const mlResponse = await proxyToMLBackend('/api/run', {
      method: 'POST',
      body: JSON.stringify({ video_dir, tracker, model, conf_threshold, speed_threshold })
    });
    
    res.json(mlResponse);
  } catch (err) {
    console.error('Analysis run error:', err);
    res.status(500).json({ error: err.message });
  }
});

// SSE stream for progress
router.get('/analysis/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  
  try {
    await streamFromMLBackend('/api/stream', res);
  } catch (err) {
    console.error('Stream error:', err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// Stop analysis
router.post('/analysis/stop', async (req, res) => {
  try {
    const mlResponse = await proxyToMLBackend('/api/stop', { method: 'POST' });
    res.json(mlResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get latest results
router.get('/results/latest', async (req, res) => {
  try {
    // Try to get from ML backend first
    const mlResponse = await proxyToMLBackend('/api/results', { method: 'GET' });
    
    // Save to MongoDB if connected
    if (mlResponse && mlResponse.kpis) {
      try {
        const analysis = new Analysis({
          config: req.query,
          status: 'completed',
          kpis: mlResponse.kpis,
          perVideo: mlResponse.per_video || [],
          violations: mlResponse.violations || [],
          chartData: mlResponse.chart_data || {}
        });
        await analysis.save();
      } catch (dbErr) {
        console.log('DB save skipped:', dbErr.message);
      }
    }
    
    res.json(mlResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get analysis history
router.get('/history', async (req, res) => {
  try {
    const analyses = await Analysis.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select('createdAt config status kpis');
    res.json(analyses);
  } catch (err) {
    res.status(500).json({ error: err.message, analyses: [] });
  }
});

// Get specific analysis by ID
router.get('/history/:id', async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
