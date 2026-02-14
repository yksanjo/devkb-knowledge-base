import { useState, useEffect } from 'react';

interface KnowledgeEntry {
  id: string;
  type: string;
  title: string;
  content: string;
  source: string;
  tags: string[];
  createdAt: string;
}

export default function Entries() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    setError('');

    try {
      const url = filterType 
        ? `/api/entries?type=${filterType}&limit=50`
        : '/api/entries?limit=50';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setEntries(data.data || []);
      } else {
        setError(data.error || 'Failed to load entries');
      }
    } catch (err) {
      setError('Failed to connect to API. Make sure the API server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [filterType]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const response = await fetch(`/api/entries/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setEntries(entries.filter(e => e.id !== id));
      }
    } catch (err) {
      alert('Failed to delete entry');
    }
  };

  return (
    <div>
      <h1>Knowledge Entries</h1>

      <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <label style={{ marginRight: '1rem' }}>Filter by type:</label>
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
        >
          <option value="">All Types</option>
          <option value="code">Code</option>
          <option value="documentation">Documentation</option>
          <option value="conversation">Conversation</option>
          <option value="decision">Decision</option>
          <option value="architecture">Architecture</option>
          <option value="process">Process</option>
        </select>
      </div>

      {loading && <div className="loading">Loading entries...</div>}

      {error && <div className="error">{error}</div>}

      {!loading && !error && entries.length === 0 && (
        <div className="empty">
          <p>No entries found</p>
          <p>Add your first knowledge entry to get started!</p>
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="grid">
          {entries.map((entry) => (
            <div key={entry.id} className="card">
              <span className={`card-type ${entry.type}`}>{entry.type}</span>
              <h3>{entry.title}</h3>
              <p>{entry.content.substring(0, 150)}...</p>
              <div className="card-tags">
                {entry.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => handleDelete(entry.id)}
                  style={{ 
                    padding: '0.25rem 0.5rem', 
                    background: 'var(--error)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
