/**
 * Knowledge & Retrieval types — mirrors nexus.schemas.knowledge.
 *
 * Per Agent Memory & Retrieval Architecture (§6, §10, §13).
 */

export interface KnowledgeIndexRequest {
  force_reindex?: boolean;
}

export interface KnowledgeIndexResponse {
  project_id: string;
  files_scanned: number;
  files_indexed: number;
  files_skipped: number;
  chunks_created: number;
  elapsed_seconds: number;
  errors: string[];
}

export interface KnowledgeSearchResultItem {
  chunk_id: string;
  file_path: string;
  start_line: number;
  end_line: number;
  content: string;
  score: number;
  chunk_type: string;
  language: string;
  symbol_name?: string | null;
}

export interface KnowledgeSearchResponse {
  project_id: string;
  query: string;
  results: KnowledgeSearchResultItem[];
  total_results: number;
}

export interface KnowledgeStatsResponse {
  project_id: string;
  total_files: number;
  total_chunks: number;
  fts_enabled: boolean;
  vector_enabled: boolean;
  embedding_provider: string;
}
