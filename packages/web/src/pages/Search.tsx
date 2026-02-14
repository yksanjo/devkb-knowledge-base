import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface KnowledgeEntry {
  id: string;
  type: string;
  title: string;
  content: string;
  source: string;
  tags: string[];
  createdAt: string;
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      searchEntries(q);
    }
  }, [searchParams]);

  const searchEntries = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data || []);
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err) {
      setError('Failed to connect to API. Make sure the API server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
    }
  };

  return (
    <div>
      <h1>Search Knowledge Base</h1>
      
      <form onSubmit={handleSearch} className="search-box" style={{ marginTop: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search for code, docs, decisions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <div className="loading">Searching...</div>}

      {error && <div className="error">{error}</div>}

      {results.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Results ({results.length})</h2>
          <div className="grid">
            {results.map((entry) => (
              <div key={entry.id} className="card">
                <span className={`card-type ${entry.type}`}>{entry.type}</span>
                <h3>{entry.title}</h3>
                <p>{entry.content.substring(0, 150)}...</p>
                <div className="card-tags">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && query && results.length === 0 && (
        <div className="empty">
          <p>No results found for "{query}"</p>
          <p>Try different keywords or add new entries to your knowledge base.</p>
        </div>
      )}

      {!query && (
        <div className="empty">
          <p>Enter a search query to find knowledge entries</p>
        </div>
      )}
    </div>
  );
}
