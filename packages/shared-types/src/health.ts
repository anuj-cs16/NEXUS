/**
 * Health check types — mirrors nexus.api.endpoints.health schemas.
 */

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
  python_version: string;
  platform: string;
  ollama_url: string;
  debug: boolean;
}
