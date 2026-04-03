import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';

const API_BASE = '/api';

export function useAnalysis() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  const eventSourceRef = useRef(null);

  // Start analysis
  const startAnalysis = useCallback(async (config) => {
    setIsRunning(true);
    setProgress(0);
    setStatus('Starting analysis...');
    setError(null);
    setResults(null);

    try {
      // Start the analysis
      await axios.post(`${API_BASE}/analysis/run`, config);

      // Connect to SSE stream for progress updates
      eventSourceRef.current = new EventSource(`${API_BASE}/analysis/stream`);

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.progress !== undefined) {
            setProgress(data.progress);
          }
          
          if (data.status) {
            setStatus(data.status);
          }
          
          if (data.current_video) {
            setStatus(`Processing: ${data.current_video}`);
          }

          // Check for completion
          if (data.status === 'completed' || data.progress >= 100) {
            fetchResults();
            closeStream();
          }

          // Check for error
          if (data.error) {
            setError(data.error);
            setIsRunning(false);
            closeStream();
          }
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      };

      eventSourceRef.current.onerror = (e) => {
        console.error('SSE error:', e);
        // Try to fetch results anyway - stream might have ended normally
        fetchResults();
        closeStream();
      };

    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setIsRunning(false);
    }
  }, []);

  // Stop analysis
  const stopAnalysis = useCallback(async () => {
    try {
      await axios.post(`${API_BASE}/analysis/stop`);
      closeStream();
      setIsRunning(false);
      setStatus('Analysis stopped');
    } catch (err) {
      console.error('Stop error:', err);
    }
  }, []);

  // Fetch results
  const fetchResults = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/results/latest`);
      setResults(response.data);
      setIsRunning(false);
      setProgress(100);
      setStatus('Analysis complete');
    } catch (err) {
      console.error('Fetch results error:', err);
      setError('Failed to fetch results');
      setIsRunning(false);
    }
  }, []);

  // Close SSE stream
  const closeStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => closeStream();
  }, [closeStream]);

  return {
    isRunning,
    progress,
    status,
    results,
    error,
    startAnalysis,
    stopAnalysis,
    fetchResults
  };
}

export default useAnalysis;
