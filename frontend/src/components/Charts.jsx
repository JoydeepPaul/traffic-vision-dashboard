import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

function Charts({ data }) {
  if (!data) return null;

  const { accuracy, classes, speed_distribution, processing } = data;

  return (
    <div className="charts-grid">
      {/* Detection Accuracy */}
      {accuracy && accuracy.length > 0 && (
        <div className="chart-card">
          <h3>Detection Accuracy by Video</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={accuracy.slice(0, 10)}>
              <XAxis dataKey="video" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Vehicle Classes */}
      {classes && classes.length > 0 && (
        <div className="chart-card">
          <h3>Vehicle Classes Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={classes}
                dataKey="count"
                nameKey="class"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {classes.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Speed Distribution */}
      {speed_distribution && speed_distribution.length > 0 && (
        <div className="chart-card">
          <h3>Speed Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={speed_distribution}>
              <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
              />
              <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Processing Time */}
      {processing && processing.length > 0 && (
        <div className="chart-card">
          <h3>Processing Time per Video</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={processing.slice(0, 15)}>
              <XAxis dataKey="video" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
              />
              <Line type="monotone" dataKey="time" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default Charts;
