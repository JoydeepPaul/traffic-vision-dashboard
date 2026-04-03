import mongoose from 'mongoose';

const violationSchema = new mongoose.Schema({
  trackId: Number,
  video: String,
  frame: Number,
  speed: Number,
  threshold: Number,
  excess: Number,
  confidence: Number,
  vehicleClass: String,
  severity: String
}, { _id: false });

const perVideoSchema = new mongoose.Schema({
  name: String,
  vehicles: Number,
  violations: Number,
  avgSpeed: Number,
  maxSpeed: Number,
  frames: Number,
  duration: Number,
  fps: Number,
  accuracy: Number
}, { _id: false });

const analysisSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  config: {
    videoDir: String,
    tracker: String,
    model: String,
    confidenceThreshold: Number,
    speedThreshold: Number
  },
  status: {
    type: String,
    enum: ['running', 'completed', 'failed'],
    default: 'running'
  },
  kpis: {
    videosProcessed: Number,
    vehiclesDetected: Number,
    violationsDetected: Number,
    processingFps: Number,
    avgSpeed: Number,
    maxSpeed: Number
  },
  perVideo: [perVideoSchema],
  violations: [violationSchema],
  chartData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

// Index for querying history
analysisSchema.index({ createdAt: -1 });

export default mongoose.model('Analysis', analysisSchema);
