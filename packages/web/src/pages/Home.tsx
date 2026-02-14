import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div>
      <div className="hero">
        <h1>Developer Knowledge Base</h1>
        <p>
          Your personal or team knowledge management system that learns from your codebase,
          docs, and conversations to answer questions about "how we do X here" or "why did we choose Y?"
        </p>

        <form onSubmit={handleSearch} className="search-box">
          <input
            type="text"
            placeholder="Ask a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="grid">
        <Link to="/search" className="card">
          <h3>🔍 Search Knowledge</h3>
          <p>Search through all indexed code, documentation, and conversations</p>
        </Link>

        <Link to="/entries" className="card">
          <h3>📚 Browse Entries</h3>
          <p>View all knowledge entries organized by type and tags</p>
        </Link>

        <Link to="/add" className="card">
          <h3>➕ Add Entry</h3>
          <p>Add new knowledge entries - code snippets, decisions, docs</p>
        </Link>

        <Link to="/stats" className="card">
          <h3>📊 View Statistics</h3>
          <p>See insights about your knowledge base</p>
        </Link>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2>Getting Started</h2>
        <div style={{ marginTop: '1rem' }}>
          <h3>Using the CLI</h3>
          <pre style={{ 
            background: '#1e293b', 
            color: '#e2e8f0', 
            padding: '1rem', 
            borderRadius: '8px',
            marginTop: '0.5rem',
            overflow: 'auto'
          }}>
{`# Initialize DevKB in your project
devkb init

# Index your codebase
devkb index

# Search for files
devkb search "auth"

# Ask a question
devkb ask "how do we handle authentication?"

# Add a knowledge entry
devkb add decision --title "Chose JWT for auth" --content "..." --tags auth,jwt`}
          </pre>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <h3>Using the API</h3>
          <pre style={{ 
            background: '#1e293b', 
            color: '#e2e8f0', 
            padding: '1rem', 
            borderRadius: '8px',
            marginTop: '0.5rem',
            overflow: 'auto'
          }}>
{`# Search entries
GET /api/search?q=authentication

# Get all entries
GET /api/entries

# Create entry
POST /api/entries
{
  "type": "decision",
  "title": "Chose JWT for auth",
  "content": "We chose JWT because...",
  "tags": ["auth", "jwt"]
}

# Ask a question
POST /api/ask
{
  "question": "how do we handle authentication?"
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
