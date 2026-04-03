function ResultsTable({ title, data, type }) {
  if (!data || data.length === 0) return null;

  const renderPerVideoTable = () => (
    <table className="table">
      <thead>
        <tr>
          <th>Video</th>
          <th>Vehicles</th>
          <th>Violations</th>
          <th>Avg Speed</th>
          <th>Max Speed</th>
          <th>Frames</th>
          <th>FPS</th>
          <th>Accuracy</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            <td>{row.name}</td>
            <td>{row.vehicles}</td>
            <td>{row.violations}</td>
            <td>{row.avgSpeed?.toFixed(1) || row.avg_speed?.toFixed(1) || '0.0'} km/h</td>
            <td>{row.maxSpeed?.toFixed(1) || row.max_speed?.toFixed(1) || '0.0'} km/h</td>
            <td>{row.frames}</td>
            <td>{row.fps?.toFixed(1) || '0.0'}</td>
            <td>{((row.accuracy || row.accuracy_pct || 0) * 100).toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderViolationsTable = () => (
    <table className="table">
      <thead>
        <tr>
          <th>Track ID</th>
          <th>Video</th>
          <th>Frame</th>
          <th>Speed</th>
          <th>Limit</th>
          <th>Excess</th>
          <th>Class</th>
          <th>Severity</th>
        </tr>
      </thead>
      <tbody>
        {data.slice(0, 50).map((v, i) => (
          <tr key={i}>
            <td>{v.track_id || v.trackId}</td>
            <td>{v.video}</td>
            <td>{v.frame}</td>
            <td>{v.speed?.toFixed(1)} km/h</td>
            <td>{v.threshold} km/h</td>
            <td style={{ color: 'var(--accent-red)' }}>+{v.excess?.toFixed(1)} km/h</td>
            <td>{v.vehicle_class || v.vehicleClass || 'Vehicle'}</td>
            <td>
              <span className={`badge badge-${(v.severity || 'medium').toLowerCase()}`}>
                {v.severity || 'Medium'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="table-container">
      <div className="table-header">
        <span className="table-title">{title}</span>
        <span className="table-count">
          {data.length} {type === 'violations' ? 'violations' : 'videos'}
        </span>
      </div>
      {type === 'per_video' ? renderPerVideoTable() : renderViolationsTable()}
    </div>
  );
}

export default ResultsTable;
