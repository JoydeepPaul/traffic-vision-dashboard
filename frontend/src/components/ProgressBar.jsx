function ProgressBar({ progress, status }) {
  return (
    <div className="progress-section">
      <div className="progress-header">
        <span className="progress-title">Analysis Progress</span>
        <span className="progress-percent">{Math.round(progress)}%</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="progress-status">{status}</div>
    </div>
  );
}

export default ProgressBar;
