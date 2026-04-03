function KpiCard({ icon, iconClass, label, value }) {
  return (
    <div className="kpi-card">
      <div className={`kpi-icon ${iconClass}`}>
        {icon}
      </div>
      <div className="kpi-content">
        <h3>{label}</h3>
        <div className="kpi-value">{value}</div>
      </div>
    </div>
  );
}

export default KpiCard;
