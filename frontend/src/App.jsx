import { useState } from 'react';
import IncidentList from './components/IncidentList';
import IncidentDetail from './components/IncidentDetail';
import './App.css';

export default function App() {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div className="app">
      <header className="header">
        <h1>🚨 Incident Management System</h1>
        <span className="subtitle">Real-time incident tracking</span>
      </header>

      <div className="layout">
        <div className="panel left">
          <IncidentList
            onSelect={setSelectedId}
            selectedId={selectedId}
          />
        </div>

        <div className="panel right">
          {selectedId
            ? <IncidentDetail id={selectedId} onClose={() => setSelectedId(null)} />
            : <div className="empty">← Select an incident to view details</div>
          }
        </div>
      </div>
    </div>
  );
}