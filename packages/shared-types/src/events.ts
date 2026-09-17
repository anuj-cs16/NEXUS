/**
 * Event system types — mirrors nexus.core.events.
 * Standardized JSON Event Envelope (per NEXUS Tech Stack §28).
 */

/** Core event types for the NEXUS event bus */
export type EventType =
  // Task lifecycle
  | 'task.created'
  | 'task.started'
  | 'task.completed'
  | 'task.failed'
  // Agent lifecycle
  | 'agent.started'
  | 'agent.thought'
  | 'agent.step_completed'
  // Tool execution
  | 'tool.invoked'
  | 'tool.completed'
  | 'tool.error'
  // Test lifecycle
  | 'test.started'
  | 'test.passed'
  | 'test.failed'
  // Security & approvals
  | 'security.finding_detected'
  | 'approval.required'
  | 'approval.resolved';

/** Standardized JSON event envelope for all NEXUS internal events */
export interface EventEnvelope {
  event_id: string;
  timestamp: string;
  task_id: string | null;
  agent_id: string | null;
  event_type: EventType;
  correlation_id: string | null;
  payload: Record<string, unknown>;
}
