import { useState, useEffect } from 'react';

interface Stats {
  totalEntries: number;
  byType: Record<string, number>;
  totalTags: number;
  searchHistoryCount: number;
}

export default function Stats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Failed to load stats');
      }
    } catch (err) {
      setError('Failed to connect to API. Make sure the API server is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!stats) {
    return <div className="empty">No statistics available</div>;
  }

  return (
    <div>
      <h1>Knowledge Base Statistics</h1>

      <div className="stats" style={{ marginTop: '1.5rem' }}>
        <div className="stat-card">
          <h4>Total Entries</h4>
          <div className="value">{stats.totalEntries}</div>
        </div>
        <div className="stat-card">
          <h4>Unique Tags</h4>
          <div className="value">{stats.totalTags}</div>
        </div>
        <div className="stat-card">
          <h4>Searches</h4>
          <div className="value">{stats.searchHistoryCount}</div>
        </div>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Entries by Type</h2>
      <div className="grid" style={{ marginTop: '1rem' }}>
        {Object.entries(stats.byType).map(([type, count]) => (
          <div key={type} className="card">
            <span className={`card-type ${type}`}>{type}</span>
            <h3 style={{ marginTop: '0.5rem' }}>{count} entries</h3>
          </div>
        ))}
        {Object.keys(stats.byType).length === 0 && (
          <div className="empty">
            <p>No entries yet. Add some knowledge entries to see statistics!</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Getting Started Tips</h2>
        <ul style={{ marginTop: '1rem', marginLeft: '1.5rem', lineHeight: '2' }}>
          <li>Use the CLI to index your codebase: <code>devkb index</code></li>
          <li>Add documentation entries to capture "why" decisions</li>
          <li>Tag entries consistently for better searchability</li>
          <li>Use the API to integrate with other tools</li>
        </ul>
      </div>
    </div>
  );
}
