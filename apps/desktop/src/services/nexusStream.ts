/**
 * NEXUS Event Streaming Client
 * Connects to Server-Sent Events (SSE) or WebSocket for real-time multi-agent execution events.
 */

export interface NexusEventEnvelope {
  event_id: string;
  topic: string;
  payload: Record<string, unknown>;
  timestamp: string;
  task_id?: string;
  step_id?: string;
}

export type NexusStreamCallback = (event: NexusEventEnvelope) => void;

export class NexusStreamClient {
  private eventSource: EventSource | null = null;
  private ws: WebSocket | null = null;

  connectSSE(taskId: string, onEvent: NexusStreamCallback, onError?: (err: Event) => void): () => void {
    const sseUrl = `http://127.0.0.1:8000/api/v1/stream/events/tasks/${taskId}`;
    
    try {
      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as NexusEventEnvelope;
          onEvent(data);
        } catch (err) {
          console.warn('[NEXUS Stream] Failed to parse SSE event data:', err);
        }
      };

      this.eventSource.onerror = (err) => {
        if (onError) onError(err);
      };
    } catch (err) {
      console.warn('[NEXUS Stream] EventSource initialization error:', err);
    }

    return () => {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
    };
  }

  connectWS(taskId: string, onEvent: NexusStreamCallback, onClose?: () => void): () => void {
    const wsUrl = `ws://127.0.0.1:8000/api/v1/stream/ws/tasks/${taskId}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as NexusEventEnvelope;
          onEvent(data);
        } catch (err) {
          console.warn('[NEXUS Stream] Failed to parse WS message:', err);
        }
      };

      this.ws.onclose = () => {
        if (onClose) onClose();
      };
    } catch (err) {
      console.warn('[NEXUS Stream] WebSocket connection failed:', err);
    }

    return () => {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    };
  }
}

export const streamClient = new NexusStreamClient();
