import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // Redirect to the original static HTML version
    window.location.href = 'http://localhost:4000/archive/index.html';
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#0a0e1a',
      color: '#e8ecf4',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Redirecting to TrafficVision AI...</h2>
        <p style={{ color: '#8892a8', marginTop: '1rem' }}>
          If you're not redirected, <a href="http://localhost:4000/archive/index.html" style={{ color: '#3b82f6' }}>click here</a>
        </p>
      </div>
    </div>
  )
}

export default App
