import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function AddEntry() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'documentation',
    title: '',
    content: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: formData.type,
          title: formData.title,
          content: formData.content,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          source: 'web'
        })
      });

      const data = await response.json();

      if (data.success) {
        navigate('/entries');
      } else {
        setError(data.error || 'Failed to create entry');
      }
    } catch (err) {
      setError('Failed to connect to API. Make sure the API server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Add New Entry</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem', maxWidth: '600px' }}>
        {error && <div className="error">{error}</div>}

        <div className="form-group">
          <label>Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="code">Code</option>
            <option value="documentation">Documentation</option>
            <option value="conversation">Conversation</option>
            <option value="decision">Decision</option>
            <option value="architecture">Architecture</option>
            <option value="process">Process</option>
          </select>
        </div>

        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter a descriptive title"
          />
        </div>

        <div className="form-group">
          <label>Content</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Enter the knowledge content..."
            rows={8}
          />
        </div>

        <div className="form-group">
          <label>Tags (comma-separated)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="e.g., authentication, jwt, security"
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Entry'}
          </button>
          <Link to="/entries" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
