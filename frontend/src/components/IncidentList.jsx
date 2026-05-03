import { useEffect, useState } from 'react';
import { fetchWorkItems } from '../api';

const SEVERITY_COLOR = { P0: '#ff4444', P1: '#ff9900', P2: '#00aaff' };
const STATUS_COLOR = {
  OPEN: '#ff4444',
  INVESTIGATING: '#ff9900',
  RESOLVED: '#00cc88',
  CLOSED: '#888888',
};

export default function IncidentList({ onSelect, selectedId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await fetchWorkItems();
      // Sort by severity: P0 first
      data.sort((a, b) => a.severity.localeCompare(b.severity));
      setItems(data);
    } catch {
      console.error('Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 5 seconds (live feed)
  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="loading">Loading incidents...</div>;

  return (
    <div>
      <div className="panel-header">
        <h2>Active Incidents</h2>
        <span className="count">{items.length} total</span>
      </div>

      {items.length === 0 && (
        <div className="empty">No incidents found. Run the simulator!</div>
      )}

      {items.map(item => (
        <div
          key={item._id}
          className={`incident-card ${selectedId === item._id ? 'selected' : ''}`}
          onClick={() => onSelect(item._id)}
        >
          <div className="card-top">
            <span
              className="badge"
              style={{ background: SEVERITY_COLOR[item.severity] }}
            >
              {item.severity}
            </span>
            <span
              className="badge"
              style={{ background: STATUS_COLOR[item.status] }}
            >
              {item.status}
            </span>
          </div>

          <div className="card-title">{item.title}</div>

          <div className="card-meta">
            <span>📡 {item.signalCount} signals</span>
            <span>🕐 {new Date(item.createdAt).toLocaleTimeString()}</span>
            {item.mttr && <span>⚡ MTTR: {item.mttr}m</span>}
          </div>
        </div>
      ))}
    </div>
  );
}