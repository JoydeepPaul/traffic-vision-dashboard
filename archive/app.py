"""
app.py — TrafficVision AI Flask Backend
Exposes REST + SSE endpoints to control the detection pipeline.
"""
from __future__ import annotations

import json
import queue
import threading
from flask import Flask, Response, jsonify, request, stream_with_context
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ─── Global job state (single-job server) ─────────────────────────────────────
_job: dict = {
    "status": "idle",       # idle | loading_model | processing | compiling | complete | error | stopped
    "results": None,
    "error": None,
    "queue": queue.Queue(),
}
_lock = threading.Lock()
_pipeline = None           # reference to running TrafficPipeline instance


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _clear_queue() -> None:
    while not _job["queue"].empty():
        try:
            _job["queue"].get_nowait()
        except queue.Empty:
            break


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.route("/api/health")
def health():
    """Quick health-check — also reports CUDA availability."""
    try:
        import torch
        cuda_ok = torch.cuda.is_available()
        device_name = torch.cuda.get_device_name(0) if cuda_ok else "CPU"
    except ImportError:
        cuda_ok = False
        device_name = "CPU (torch not installed)"
    return jsonify({"status": "ok", "cuda": cuda_ok, "device": device_name})


@app.route("/api/run", methods=["POST"])
def run():
    """Start a new analysis job."""
    global _pipeline

    data = request.get_json(force=True) or {}
    video_dir = data.get("video_dir", "").strip()
    if not video_dir:
        return jsonify({"error": "video_dir is required"}), 400

    with _lock:
        if _job["status"] in ("loading_model", "processing", "compiling"):
            return jsonify({"error": "A job is already running. Stop it first."}), 409

        _clear_queue()
        _job["status"] = "loading_model"
        _job["results"] = None
        _job["error"]   = None

    config = {
        "model_name":           data.get("model", "yolov12x.pt"),
        "tracker_yaml":         data.get("tracker", "botsort.yaml"),
        "conf_threshold":       float(data.get("conf", 0.5)),
        "iou_threshold":        float(data.get("iou", 0.5)),
        "speed_threshold_kmph": float(data.get("speed_threshold", 50)),
        "min_frames_to_count":  int(data.get("min_frames", 25)),
        "history_limit":        int(data.get("history_limit", 120)),
        "max_videos":           int(data.get("max_videos", 179)),
    }

    # Detect if video_dir is a Kaggle link
    import re, os
    import traceback
    is_kaggle = False
    dataset_id = ""
    m = re.search(r'kaggle\.com/datasets/([^/]+/[^/?#]+)', video_dir)
    if m:
        is_kaggle = True
        dataset_id = m.group(1)
    elif "/" in video_dir and not video_dir.startswith("http") and not ":" in video_dir and not video_dir.startswith("/"):
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
                    _job["error"]  = results["error"]
                    _job["queue"].put({"status": "error", "error": _job["error"]})
                else:
                    _job["status"]  = "complete"
                    _job["results"] = results
                    _job["queue"].put({"status": "complete"})

        except Exception as exc:
            tb = traceback.format_exc()
            with _lock:
                _job["status"] = "error"
                _job["error"]  = f"{type(exc).__name__}: {exc}"
            _job["queue"].put({"status": "error", "error": _job["error"]})

    threading.Thread(target=_worker, daemon=True).start()
    return jsonify({"message": "Pipeline started", "status": "loading_model"})


@app.route("/api/stream")
def stream():
    """
    Server-Sent Events endpoint.
    The browser subscribes here to get real-time progress updates.
    """
    def _generate():
        while True:
            try:
                payload = _job["queue"].get(timeout=20)
                yield f"data: {json.dumps(payload)}\n\n"
                if payload.get("status") in ("complete", "error", "stopped"):
                    break
            except queue.Empty:
                # Heartbeat keeps the connection alive through proxies / browsers
                yield 'data: {"status":"heartbeat"}\n\n'
                with _lock:
                    if _job["status"] not in ("loading_model", "processing", "compiling"):
                        break

    return Response(
        stream_with_context(_generate()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        },
    )


@app.route("/api/results")
def results():
    """Fetch completed results (or current status if still running)."""
    with _lock:
        st = _job["status"]
        if st == "complete":
            return jsonify(_job["results"])
        if st == "error":
            return jsonify({"error": _job["error"]}), 500
        return jsonify({"status": st}), 202


@app.route("/api/stop", methods=["POST"])
def stop():
    """Gracefully abort the current job."""
    global _pipeline
    with _lock:
        if _pipeline and _job["status"] in ("loading_model", "processing", "compiling"):
            _pipeline.stop_flag.set()
            _job["status"] = "stopped"
            _job["queue"].put({"status": "stopped"})
    return jsonify({"message": "Stop signal sent"})


@app.route("/api/status")
def status():
    """Lightweight status check (no SSE)."""
    with _lock:
        return jsonify({
            "status": _job["status"],
            "has_results": _job["results"] is not None,
        })


# ─── Entrypoint ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("  TrafficVision AI — Backend API Server")
    print("  Listening on http://localhost:5000")
    print("=" * 60)
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
