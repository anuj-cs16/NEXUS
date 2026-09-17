/**
 * Common types — mirrors nexus.schemas.common.
 */

/** Task lifecycle states (per NEXUS Tech Stack §19) */
export type TaskStatus =
  | 'pending'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'recovery_required';

/** Risk assessment levels for human-in-the-loop decisions */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/** NEXUS agent types (per PRD §12) */
export type AgentType = 'planner' | 'developer' | 'tester' | 'debugger' | 'security' | 'reviewer';

/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
}

/** Pagination query parameters */
export interface PaginationParams {
  page: number;
  page_size: number;
}

/** Project schemas */
export interface ProjectCreate {
  name: string;
  path: string;
  description?: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  path: string;
  description: string;
  created_at: string;
  status: string;
}

export interface ProjectListResponse {
  projects: ProjectResponse[];
  total: number;
}
