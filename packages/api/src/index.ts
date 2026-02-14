import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { KnowledgeEntry, SearchQuery, KnowledgeEntryType, APIResponse } from '@devkb/shared';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
const knowledgeStore: Map<string, KnowledgeEntry> = new Map();
const searchHistory: string[] = [];

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Search entries
app.get('/api/search', (req: Request, res: Response) => {
  const { q, type, tags, limit = 10, offset = 0 } = req.query;
  
  const query = q as string;
  const typeFilter = type as KnowledgeEntryType | undefined;
  const tagFilter = tags ? (tags as string).split(',') : undefined;
  const limitNum = parseInt(limit as string);
  const offsetNum = parseInt(offset as string);

  if (!query) {
    const response: APIResponse<KnowledgeEntry[]> = {
      success: false,
      error: 'Search query is required'
    };
    return res.status(400).json(response);
  }

  // Add to search history
  searchHistory.push(query);
  if (searchHistory.length > 100) searchHistory.shift();

  // Filter entries
  let results = Array.from(knowledgeStore.values()).filter(entry => {
    const matchesQuery = 
      entry.title.toLowerCase().includes(query.toLowerCase()) ||
      entry.content.toLowerCase().includes(query.toLowerCase());
    
    const matchesType = !typeFilter || entry.type === typeFilter;
    
    const matchesTags = !tagFilter || 
      tagFilter.some(tag => entry.tags.includes(tag.trim()));

    return matchesQuery && matchesType && matchesTags;
  });

  const total = results.length;
  
  // Apply pagination
  results = results.slice(offsetNum, offsetNum + limitNum);

  const response: APIResponse<KnowledgeEntry[]> = {
    success: true,
    data: results,
    pagination: {
      total,
      limit: limitNum,
      offset: offsetNum
    }
  };

  res.json(response);
});

// Get entry by ID
app.get('/api/entries/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const entry = knowledgeStore.get(id);

  if (!entry) {
    const response: APIResponse<KnowledgeEntry> = {
      success: false,
      error: 'Entry not found'
    };
    return res.status(404).json(response);
  }

  const response: APIResponse<KnowledgeEntry> = {
    success: true,
    data: entry
  };

  res.json(response);
});

// Create entry
app.post('/api/entries', (req: Request, res: Response) => {
  const { type, title, content, source, sourcePath, tags, metadata } = req.body;

  if (!type || !title || !content) {
    const response: APIResponse<KnowledgeEntry> = {
      success: false,
      error: 'type, title, and content are required'
    };
    return res.status(400).json(response);
  }

  const entry: KnowledgeEntry = {
    id: uuidv4(),
    type,
    title,
    content,
    source: source || 'api',
    sourcePath,
    tags: tags || [],
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata
  };

  knowledgeStore.set(entry.id, entry);

  const response: APIResponse<KnowledgeEntry> = {
    success: true,
    data: entry
  };

  res.status(201).json(response);
});

// Update entry
app.put('/api/entries/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = knowledgeStore.get(id);

  if (!existing) {
    const response: APIResponse<KnowledgeEntry> = {
      success: false,
      error: 'Entry not found'
    };
    return res.status(404).json(response);
  }

  const { type, title, content, source, sourcePath, tags, metadata } = req.body;

  const updated: KnowledgeEntry = {
    ...existing,
    type: type || existing.type,
    title: title || existing.title,
    content: content || existing.content,
    source: source || existing.source,
    sourcePath: sourcePath || existing.sourcePath,
    tags: tags || existing.tags,
    metadata: metadata || existing.metadata,
    updatedAt: new Date()
  };

  knowledgeStore.set(id, updated);

  const response: APIResponse<KnowledgeEntry> = {
    success: true,
    data: updated
  };

  res.json(response);
});

// Delete entry
app.delete('/api/entries/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  if (!knowledgeStore.has(id)) {
    const response: APIResponse<void> = {
      success: false,
      error: 'Entry not found'
    };
    return res.status(404).json(response);
  }

  knowledgeStore.delete(id);

  const response: APIResponse<void> = {
    success: true
  };

  res.json(response);
});

// Get all entries
app.get('/api/entries', (req: Request, res: Response) => {
  const { type, tags, limit = 50, offset = 0 } = req.query;
  
  const typeFilter = type as KnowledgeEntryType | undefined;
  const tagFilter = tags ? (tags as string).split(',') : undefined;
  const limitNum = parseInt(limit as string);
  const offsetNum = parseInt(offset as string);

  let results = Array.from(knowledgeStore.values());

  if (typeFilter) {
    results = results.filter(e => e.type === typeFilter);
  }

  if (tagFilter) {
    results = results.filter(e => 
      tagFilter.some(tag => e.tags.includes(tag.trim()))
    );
  }

  const total = results.length;
  results = results.slice(offsetNum, offsetNum + limitNum);

  const response: APIResponse<KnowledgeEntry[]> = {
    success: true,
    data: results,
    pagination: {
      total,
      limit: limitNum,
      offset: offsetNum
    }
  };

  res.json(response);
});

// Ask question (simulated AI response)
app.post('/api/ask', (req: Request, res: Response) => {
  const { question } = req.body;

  if (!question) {
    const response: APIResponse<{ answer: string; sources: string[] }> = {
      success: false,
      error: 'Question is required'
    };
    return res.status(400).json(response);
  }

  // Search for relevant entries
  const relevantEntries = Array.from(knowledgeStore.values())
    .filter(entry => 
      entry.title.toLowerCase().includes(question.toLowerCase()) ||
      entry.content.toLowerCase().includes(question.toLowerCase())
    )
    .slice(0, 5);

  // Simulated answer (in production, use AI/LLM)
  const answer = relevantEntries.length > 0
    ? `Based on your knowledge base, here's what I found about "${question}":\n\n` +
      relevantEntries.map(e => `- ${e.title}: ${e.content.substring(0, 100)}...`).join('\n')
    : `I don't have specific information about "${question}" in your knowledge base. You can add relevant documentation using the CLI or API.`;

  const response: APIResponse<{ answer: string; sources: string[] }> = {
    success: true,
    data: {
      answer,
      sources: relevantEntries.map(e => e.id)
    }
  };

  res.json(response);
});

// Get statistics
app.get('/api/stats', (_req: Request, res: Response) => {
  const entries = Array.from(knowledgeStore.values());
  
  const stats = {
    totalEntries: entries.length,
    byType: entries.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    totalTags: new Set(entries.flatMap(e => e.tags)).size,
    searchHistoryCount: searchHistory.length
  };

  const response: APIResponse<typeof stats> = {
    success: true,
    data: stats
  };

  res.json(response);
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 DevKB API server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   API docs: http://localhost:${PORT}/api`);
});

export default app;
