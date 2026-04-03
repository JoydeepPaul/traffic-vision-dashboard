import fetch from 'node-fetch';

const ML_BACKEND_URL = process.env.ML_BACKEND_URL || 'http://localhost:5000';

/**
 * Proxy a request to the Python ML backend
 */
export async function proxyToMLBackend(endpoint, options = {}) {
  const url = `${ML_BACKEND_URL}${endpoint}`;
  
  const fetchOptions = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  if (options.body) {
    fetchOptions.body = options.body;
  }
  
  const response = await fetch(url, fetchOptions);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ML Backend error: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

/**
 * Stream SSE events from ML backend to client response
 */
export async function streamFromMLBackend(endpoint, clientRes) {
  const url = `${ML_BACKEND_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: { 'Accept': 'text/event-stream' }
  });
  
  if (!response.ok) {
    throw new Error(`ML Backend stream error: ${response.status}`);
  }
  
  // Pipe the SSE stream to the client
  const reader = response.body;
  
  reader.on('data', (chunk) => {
    clientRes.write(chunk);
  });
  
  reader.on('end', () => {
    clientRes.end();
  });
  
  reader.on('error', (err) => {
    console.error('Stream error:', err);
    clientRes.end();
  });
  
  // Handle client disconnect
  clientRes.on('close', () => {
    reader.destroy();
  });
}
