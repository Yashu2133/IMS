import { useState } from 'react';
import { submitRCA } from '../api';

const CATEGORIES = [
  'INFRASTRUCTURE',
  'CODE_BUG',
  'CONFIGURATION',
  'EXTERNAL_DEPENDENCY',
  'HUMAN_ERROR',
];

export default function RCAForm({ workItemId, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    rootCauseCategory: 'CODE_BUG',
    fixApplied: '',
    preventionSteps: '',
    incidentStart: '',
    incidentEnd: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.fixApplied || !form.preventionSteps || !form.incidentStart || !form.incidentEnd) {
      setError('All fields are required');
      return;
    }
    if (form.fixApplied.length < 10 || form.preventionSteps.length < 10) {
      setError('Fix and prevention fields need at least 10 characters');
      return;
    }

    try {
      setLoading(true);
      await submitRCA(workItemId, form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'RCA submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rca-form">
      <h3>📝 Root Cause Analysis</h3>
      <p className="rca-note">Complete this form to close the incident.</p>

      {error && <div className="error">{error}</div>}

      <label>Root Cause Category</label>
      <select name="rootCauseCategory" value={form.rootCauseCategory} onChange={handleChange}>
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <label>Incident Start</label>
      <input type="datetime-local" name="incidentStart" value={form.incidentStart} onChange={handleChange}/>

      <label>Incident End</label>
      <input type="datetime-local" name="incidentEnd" value={form.incidentEnd} onChange={handleChange}/>

      <label>Fix Applied</label>
      <textarea
        name="fixApplied"
        placeholder="What did you do to fix the issue?"
        value={form.fixApplied}
        onChange={handleChange}
        rows={3}
      />

      <label>Prevention Steps</label>
      <textarea
        name="preventionSteps"
        placeholder="How will you prevent this in future?"
        value={form.preventionSteps}
        onChange={handleChange}
        rows={3}
      />

      <div className="rca-actions">
        <button className="action-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit RCA & Close Incident'}
        </button>
        <button className="cancel-btn" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}