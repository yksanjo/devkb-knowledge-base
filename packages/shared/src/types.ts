// Core types for DevKB - Developer Knowledge Base

export type KnowledgeEntryType = 
  | 'code'
  | 'documentation'
  | 'conversation'
  | 'decision'
  | 'architecture'
  | 'process';

export interface KnowledgeEntry {
  id: string;
  type: KnowledgeEntryType;
  title: string;
  content: string;
  source: string;
  sourcePath?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface SearchResult {
  entry: KnowledgeEntry;
  score: number;
  highlights: string[];
  context?: string;
}

export interface SearchQuery {
  query: string;
  types?: KnowledgeEntryType[];
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface IndexConfig {
  paths: string[];
  excludePatterns: string[];
  includeExtensions: string[];
  maxFileSize: number;
}

export interface ConversationEntry {
  id: string;
  question: string;
  answer: string;
  sources: string[];
  timestamp: Date;
  feedback?: 'positive' | 'negative';
}

export interface CodeContext {
  file: string;
  function?: string;
  class?: string;
  language: string;
  line?: number;
}

export interface AskResponse {
  answer: string;
  sources: KnowledgeEntry[];
  confidence: number;
  suggestions?: string[];
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}
