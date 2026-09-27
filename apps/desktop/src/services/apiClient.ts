/**
 * NEXUS Desktop API Client
 * Connects the Next.js desktop renderer to the local FastAPI backend (http://127.0.0.1:8000/api/v1)
 * with automatic fallback to local offline mode when the backend is initializing.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_NEXUS_API_URL || 'http://127.0.0.1:8000/api/v1';

export interface BackendHealth {
  status: string;
  version: string;
  database: string;
  ollama: {
    status: string;
    model: string;
  };
}

export interface BackendProject {
  id: string;
  name: string;
  path: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface BackendTask {
  id: string;
  project_id: string;
  goal: string;
  status: 'PENDING' | 'PLANNING' | 'RUNNING' | 'WAITING_APPROVAL' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  model: string;
  created_at: string;
  updated_at: string;
  error_message?: string;
  plan?: Record<string, unknown>;
}

export interface BackendApproval {
  id: string;
  task_id: string;
  step_id?: string;
  action_type: string;
  description: string;
  payload: Record<string, unknown>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

class NexusApiClient {
  private baseUrl: string;

  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`NEXUS API Error (${response.status}): ${errorBody || response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`[NEXUS API] Call to ${endpoint} failed: ${message}`);
      throw err;
    }
  }

  // Health
  async getHealth(): Promise<BackendHealth> {
    return this.request<BackendHealth>('/health');
  }

  // Models
  async getModels(): Promise<{ models: string[]; default: string }> {
    return this.request<{ models: string[]; default: string }>('/models');
  }

  // Projects
  async listProjects(): Promise<{ items: BackendProject[]; total: number }> {
    return this.request<{ items: BackendProject[]; total: number }>('/projects');
  }

  async createProject(name: string, path: string, description?: string): Promise<BackendProject> {
    return this.request<BackendProject>('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, path, description }),
    });
  }

  // Tasks
  async listTasks(projectId: string): Promise<{ items: BackendTask[]; total: number }> {
    return this.request<{ items: BackendTask[]; total: number }>(`/projects/${projectId}/tasks`);
  }

  async createTask(projectId: string, goal: string, model = 'qwen2.5-coder:7b'): Promise<BackendTask> {
    return this.request<BackendTask>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ goal, model }),
    });
  }

  async runTask(projectId: string, taskId: string): Promise<BackendTask> {
    return this.request<BackendTask>(`/projects/${projectId}/tasks/${taskId}/run`, {
      method: 'POST',
    });
  }

  async getTask(taskId: string): Promise<BackendTask> {
    return this.request<BackendTask>(`/tasks/${taskId}`);
  }

  async cancelTask(taskId: string): Promise<BackendTask> {
    return this.request<BackendTask>(`/tasks/${taskId}/cancel`, {
      method: 'POST',
    });
  }

  // Approvals
  async listPendingApprovals(): Promise<{ items: BackendApproval[]; total: number }> {
    return this.request<{ items: BackendApproval[]; total: number }>('/approvals/pending');
  }

  async resolveApproval(approvalId: string, approved: boolean, note?: string): Promise<BackendApproval> {
    return this.request<BackendApproval>(`/approvals/${approvalId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ approved, note }),
    });
  }
}

export const apiClient = new NexusApiClient();
