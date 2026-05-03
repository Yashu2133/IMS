import { useEffect, useState } from 'react';
import { fetchWorkItem, fetchSignals, updateStatus } from '../api';
import RCAForm from './RCAForm';

const NEXT_STATUS = {
  OPEN: 'INVESTIGATING',
  INVESTIGATING: 'RESOLVED',
  RESOLVED: 'CLOSED',
  CLOSED: null,
};

const TYPE_ICON = {
  API_FAILURE:  '🔴',
  DB_DELAY:     '🟠',
  CACHE_MISS:   '🔵',
  QUEUE_BACKUP: '🟡',
};

export default function IncidentDetail({ id, onClose }) {
  const [workItem, setWorkItem] = useState(null);
  const [signals, setSignals]   = useState([]);
  const [showRCA, setShowRCA]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const load = async () => {
    try {
      const [wi, sigs] = await Promise.all([
        fetchWorkItem(id),
        fetchSignals(id),
      ]);
      setWorkItem(wi);
      setSignals(sigs);
    } catch {
      setError('Failed to load incident');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusUpdate = async () => {
    const next = NEXT_STATUS[workItem.status];
    if (!next) return;

    // If moving to CLOSED, show RCA form instead
    if (next === 'CLOSED') {
      setShowRCA(true);
      return;
    }

    try {
      await updateStatus(id, next);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Status update failed');
    }
  };

  const handleRCASubmit = () => {
    setShowRCA(false);
    load();
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error)   return <div className="error">{error}</div>;
  if (!workItem) return null;

  const nextStatus = NEXT_STATUS[workItem.status];

  return (
    <div className="detail">
      <div className="detail-header">
        <button className="back-btn" onClick={onClose}>← Back</button>
        <h2>{workItem.title}</h2>
      </div>

      {/* Status bar */}
      <div className="status-bar">
        {['OPEN','INVESTIGATING','RESOLVED','CLOSED'].map(s => (
          <div
            key={s}
            className={`status-step ${workItem.status === s ? 'active' : ''} 
                        ${isCompleted(s, workItem.status) ? 'done' : ''}`}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Info grid */}
      <div className="info-grid">
        <div className="info-box">
          <div className="info-label">Severity</div>
          <div className="info-value">{workItem.severity}</div>
        </div>
        <div className="info-box">
          <div className="info-label">Signals</div>
          <div className="info-value">{workItem.signalCount}</div>
        </div>
        <div className="info-box">
          <div className="info-label">Started</div>
          <div className="info-value">{new Date(workItem.createdAt).toLocaleString()}</div>
        </div>
        {workItem.mttr && (
          <div className="info-box">
            <div className="info-label">MTTR</div>
            <div className="info-value">{workItem.mttr} minutes</div>
          </div>
        )}
      </div>

      {/* Action button */}
      {nextStatus && !showRCA && (
        <button className="action-btn" onClick={handleStatusUpdate}>
          Move to {nextStatus}
          {nextStatus === 'CLOSED' ? ' (requires RCA)' : ''}
        </button>
      )}

      {/* RCA Form */}
      {showRCA && (
        <RCAForm
          workItemId={id}
          onSuccess={handleRCASubmit}
          onCancel={() => setShowRCA(false)}
        />
      )}

      {/* Raw signals */}
      <div className="signals-section">
        <h3>Raw Signals ({signals.length})</h3>
        {signals.map(sig => (
          <div key={sig._id} className="signal-row">
            <span>{TYPE_ICON[sig.type]} {sig.type}</span>
            <span className="signal-msg">{sig.message}</span>
            <span className="signal-time">
              {new Date(sig.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function isCompleted(step, current) {
  const order = ['OPEN','INVESTIGATING','RESOLVED','CLOSED'];
  return order.indexOf(step) < order.indexOf(current);
}