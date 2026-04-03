"""
app_fastapi.py — TrafficVision AI FastAPI Backend
Exposes REST + SSE endpoints to control the detection pipeline.
Enhanced with GPU status endpoint for website integration.
"""
from __future__ import annotations

import asyncio
import json
import queue
import threading
import traceback
import re
import os
import subprocess
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

app = FastAPI(title="TrafficVision AI", version="2.1.0")

# CORS - Allow all origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Global job state (single-job server) ─────────────────────────────────────
_job: dict = {
    "status": "idle",
    "results": None,
    "error": None,
    "queue": queue.Queue(),
}
_lock = threading.Lock()
_pipeline = None


# ─── Request Models ───────────────────────────────────────────────────────────
class RunRequest(BaseModel):
    video_dir: str
    model: str = "yolo11n.pt"
    tracker: str = "botsort.yaml"
    conf_threshold: float = 0.25
    speed_threshold: float = 50
    iou: float = 0.5
    min_frames: int = 25
    history_limit: int = 120
    max_videos: int = 179


# ─── Helpers ──────────────────────────────────────────────────────────────────
def _clear_queue() -> None:
    while not _job["queue"].empty():
        try:
            _job["queue"].get_nowait()
        except queue.Empty:
            break


def get_gpu_info() -> dict:
    """
    Comprehensive GPU detection and status retrieval.
    Supports NVIDIA (CUDA), AMD (ROCm), and Apple Silicon (MPS).
    """
    gpu_info = {
        "available": False,
        "enabled": False,
        "name": "CPU",
        "type": "cpu",
        "vram_total": "N/A",
        "vram_used": "N/A",
        "vram_free": "N/A",
        "utilization": "N/A",
        "temperature": "N/A",
        "cuda_version": "N/A",
        "driver_version": "N/A",
        "compute_capability": "N/A",
        "status": "offline"
    }
    
    try:
        import torch
        
        # Check NVIDIA CUDA
        if torch.cuda.is_available():
            gpu_info["available"] = True
            gpu_info["enabled"] = True
            gpu_info["type"] = "nvidia"
            gpu_info["name"] = torch.cuda.get_device_name(0)
            gpu_info["status"] = "online"
            
            # Get VRAM info
            props = torch.cuda.get_device_properties(0)
            total_memory = props.total_memory
            gpu_info["vram_total"] = f"{total_memory / (1024**3):.1f} GB"
            
            # Current memory usage
            if hasattr(torch.cuda, 'memory_allocated'):
                used = torch.cuda.memory_allocated(0)
                free = total_memory - used
                gpu_info["vram_used"] = f"{used / (1024**3):.2f} GB"
                gpu_info["vram_free"] = f"{free / (1024**3):.2f} GB"
            
            # CUDA version
            gpu_info["cuda_version"] = torch.version.cuda or "N/A"
            
            # Compute capability
            gpu_info["compute_capability"] = f"{props.major}.{props.minor}"
            
            # Try to get more info via nvidia-smi
            try:
                result = subprocess.run(
                    ['nvidia-smi', '--query-gpu=driver_version,temperature.gpu,utilization.gpu', 
                     '--format=csv,noheader,nounits'],
                    capture_output=True, text=True, timeout=5
                )
                if result.returncode == 0:
                    parts = result.stdout.strip().split(', ')
                    if len(parts) >= 3:
                        gpu_info["driver_version"] = parts[0]
                        gpu_info["temperature"] = f"{parts[1]}°C"
                        gpu_info["utilization"] = f"{parts[2]}%"
            except Exception:
                pass
        
        # Check AMD ROCm
        elif hasattr(torch.version, 'hip') and torch.version.hip:
            gpu_info["available"] = True
            gpu_info["enabled"] = True
            gpu_info["type"] = "amd"
            gpu_info["name"] = "AMD GPU (ROCm)"
            gpu_info["status"] = "online"
            gpu_info["cuda_version"] = f"ROCm {torch.version.hip}"
        
        # Check Apple Silicon MPS
        elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
            gpu_info["available"] = True
            gpu_info["enabled"] = True
            gpu_info["type"] = "apple"
            gpu_info["name"] = "Apple Silicon (MPS)"
            gpu_info["status"] = "online"
            
        else:
            # No GPU available, try to detect if one exists but is disabled
            gpu_info["status"] = "disabled"
            try:
                result = subprocess.run(
                    ['nvidia-smi', '--query-gpu=name', '--format=csv,noheader'],
                    capture_output=True, text=True, timeout=5
                )
                if result.returncode == 0 and result.stdout.strip():
                    gpu_info["available"] = True
                    gpu_info["name"] = result.stdout.strip()
                    gpu_info["status"] = "driver_issue"
            except Exception:
                gpu_info["status"] = "not_found"
                
    except ImportError:
        gpu_info["status"] = "pytorch_not_installed"
    except Exception as e:
        gpu_info["status"] = f"error: {str(e)}"
    
    return gpu_info


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/health")
@app.get("/api/health")
async def health():
    """Quick health-check — also reports CUDA availability."""
    try:
        import torch
        cuda_ok = torch.cuda.is_available()
        device_name = torch.cuda.get_device_name(0) if cuda_ok else "CPU"
    except ImportError:
        cuda_ok = False
        device_name = "CPU (torch not installed)"
    return {"status": "ok", "cuda": cuda_ok, "device": device_name}


@app.get("/api/gpu-status")
async def gpu_status():
    """
    Comprehensive GPU status endpoint.
    Returns detailed GPU information for website display.
    """
    return get_gpu_info()


@app.post("/api/run")
async def run(request: RunRequest):
    """Start a new analysis job."""
    global _pipeline

    video_dir = request.video_dir.strip()
    if not video_dir:
        raise HTTPException(status_code=400, detail="video_dir is required")

    with _lock:
        if _job["status"] in ("loading_model", "processing", "compiling"):
            raise HTTPException(status_code=409, detail="A job is already running. Stop it first.")

        _clear_queue()
        _job["status"] = "loading_model"
        _job["results"] = None
        _job["error"] = None

    config = {
        "model_name": request.model,
        "tracker_yaml": request.tracker,
        "conf_threshold": request.conf_threshold,
        "iou_threshold": request.iou,
        "speed_threshold_kmph": request.speed_threshold,
        "min_frames_to_count": request.min_frames,
        "history_limit": request.history_limit,
        "max_videos": request.max_videos,
    }

    # Detect if video_dir is a Kaggle link
    is_kaggle = False
    dataset_id = ""
    m = re.search(r'kaggle\.com/datasets/([^/]+/[^/?#]+)', video_dir)
    if m:
        is_kaggle = True
        dataset_id = m.group(1)
    elif "/" in video_dir and not video_dir.startswith("http") and ":" not in video_dir and not video_dir.startswith("/"):
        parts = video_dir.split("/")
        if len(parts) == 2 and " " not in video_dir:
            is_kaggle = True
            dataset_id = video_dir

    def _worker():
        global _pipeline
        try:
            target_dir = video_dir
            if is_kaggle:
                try:
                    import kaggle
                    _job["queue"].put({"status": "downloading", "message": f"Downloading Kaggle dataset {dataset_id}..."})
                    dl_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "datasets", dataset_id.replace("/", "_")))
                    os.makedirs(dl_dir, exist_ok=True)
                    kaggle.api.dataset_download_cli(dataset_id, path=dl_dir, unzip=True)
                    target_dir = dl_dir
                except Exception as e:
                    tb = traceback.format_exc()
                    print("[KAGGLE DL ERROR]\n" + tb, flush=True)
                    err_msg = f"Kaggle Download Failed. Ensure your kaggle.json is correct. Error: {e}"
                    _job["queue"].put({"status": "error", "error": err_msg})
                    with _lock:
                        _job["status"] = "error"
                        _job["error"] = err_msg
                    return

            from pipeline import TrafficPipeline

            def _cb(payload: dict) -> None:
                with _lock:
                    if "status" in payload:
                        _job["status"] = payload["status"]
                _job["queue"].put(payload)

            _pipeline = TrafficPipeline(config, _cb)
            results = _pipeline.run(target_dir)

            with _lock:
                if "error" in results:
                    _job["status"] = "error"
                    _job["error"] = results["error"]
                    _job["queue"].put({"status": "error", "error": _job["error"]})
                else:
                    _job["status"] = "complete"
                    _job["results"] = results
                    _job["queue"].put({"status": "complete"})

        except Exception as exc:
            tb = traceback.format_exc()
            print(f"[WORKER ERROR]\n{tb}", flush=True)
            with _lock:
                _job["status"] = "error"
                _job["error"] = f"{type(exc).__name__}: {exc}"
            _job["queue"].put({"status": "error", "error": _job["error"]})

    threading.Thread(target=_worker, daemon=True).start()
    return {"message": "Pipeline started", "status": "loading_model"}


@app.get("/api/stream")
async def stream():
    """Server-Sent Events endpoint for real-time progress updates."""
    
    async def event_generator():
        while True:
            try:
                # Non-blocking check with asyncio
                payload = None
                try:
                    payload = _job["queue"].get_nowait()
                except queue.Empty:
                    pass

                if payload:
                    yield f"data: {json.dumps(payload)}\n\n"
                    if payload.get("status") in ("complete", "error", "stopped"):
                        break
                else:
                    # Heartbeat
                    with _lock:
                        current_status = _job["status"]
                    
                    if current_status not in ("loading_model", "processing", "compiling"):
                        # Job finished or idle
                        if current_status == "complete" and _job["results"]:
                            yield f'data: {{"status":"complete"}}\n\n'
                        break
                    
                    yield 'data: {"status":"heartbeat"}\n\n'
                
                await asyncio.sleep(0.5)
                
            except Exception as e:
                yield f'data: {{"status":"error","error":"{str(e)}"}}\n\n'
                break

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        }
    )


@app.get("/api/results")
async def results():
    """Fetch completed results (or current status if still running)."""
    with _lock:
        st = _job["status"]
        if st == "complete":
            return _job["results"]
        if st == "error":
            raise HTTPException(status_code=500, detail=_job["error"])
        return {"status": st}


@app.post("/api/stop")
async def stop():
    """Gracefully abort the current job."""
    global _pipeline
    with _lock:
        if _pipeline and _job["status"] in ("loading_model", "processing", "compiling"):
            _pipeline.stop_flag.set()
            _job["status"] = "stopped"
            _job["queue"].put({"status": "stopped"})
    return {"message": "Stop signal sent"}


@app.get("/api/status")
async def status():
    """Lightweight status check (no SSE)."""
    with _lock:
        return {
            "status": _job["status"],
            "has_results": _job["results"] is not None,
        }


# ─── Entrypoint ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    
    # Get GPU info at startup
    gpu = get_gpu_info()
    
    print("=" * 60)
    print("  TrafficVision AI — FastAPI Backend Server")
    print("=" * 60)
    print(f"  GPU Status: {gpu['status'].upper()}")
    if gpu['available']:
        print(f"  GPU Name:   {gpu['name']}")
        print(f"  VRAM:       {gpu['vram_total']}")
        if gpu['cuda_version'] != 'N/A':
            print(f"  CUDA:       {gpu['cuda_version']}")
    else:
        print("  Running on: CPU")
    print("=" * 60)
    print("  Listening on http://localhost:5000")
    print("  Press Ctrl+C to stop")
    print("=" * 60)
    
    uvicorn.run(app, host="0.0.0.0", port=5000)
