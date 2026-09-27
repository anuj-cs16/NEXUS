export type ScreenId =
  | 'screen-01-home'
  | 'screen-02-command'
  | 'screen-03-command-palette'
  | 'screen-04-modules'
  | 'screen-05-module-detail'
  | 'screen-06-tasks'
  | 'screen-07-task-detail'
  | 'screen-08-automations'
  | 'screen-09-automation-builder'
  | 'screen-10-automation-run'
  | 'screen-11-activity'
  | 'screen-12-trace'
  | 'screen-13-files'
  | 'screen-14-file-search'
  | 'screen-15-apps'
  | 'screen-16-system'
  | 'screen-17-memory'
  | 'screen-18-memory-detail'
  | 'screen-19-insights'
  | 'screen-20-notifications'
  | 'screen-21-settings'
  | 'screen-22-integrations'
  | 'screen-23-permission-modal'
  | 'screen-24-ai-confirmation'
  | 'screen-25-error-recovery'
  | 'screen-26-success-state'
  | 'screen-27-empty-states'
  | 'screen-28-onboarding'
  | 'screen-29-global-search'
  | 'screen-30-profile-menu'
  | 'screen-31-desktop-overlay'
  | 'screen-32-desktop-notification'
  | 'screen-33-first-run'
  | 'screen-34-compact-responsive'
  | '01-home'
  | '02-command'
  | '03-palette'
  | '04-modules'
  | '05-module-detail'
  | '06-tasks'
  | '07-task-detail'
  | '08-automations'
  | '09-automation-builder'
  | '10-automation-run'
  | '11-activity'
  | '12-trace'
  | '13-files'
  | '14-file-search'
  | '15-apps'
  | '16-system'
  | '17-memory'
  | '18-memory-detail'
  | '19-insights'
  | '20-notifications'
  | '21-settings'
  | '22-integrations'
  | '23-permission-modal'
  | '24-ai-confirmation'
  | '25-error-recovery'
  | '26-success'
  | '27-empty-states'
  | '28-onboarding'
  | '29-global-search'
  | '30-profile-menu'
  | '31-desktop-overlay'
  | '32-desktop-notifications'
  | '33-first-run'
  | '34-compact';

export type NexusStatus = 'ONLINE' | 'OFFLINE' | 'BUSY' | 'SYNCING' | 'ERROR';

export type CoreState = 'idle' | 'thinking' | 'processing' | 'executing' | 'success' | 'error';

export interface NexusModule {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  status: 'active' | 'idle' | 'processing' | 'disabled' | 'error';
  tasksHandled: number;
  lastActivity: string;
  color: string;
  capabilities: string[];
  connectedTools: string[];
  permissions: string[];
  latencyMs: number;
  successRate: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  status: 'active' | 'waiting' | 'completed' | 'failed' | 'scheduled';
  aiStatus: string;
  createdAt: string;
  deadline?: string;
  relatedFiles: string[];
  relatedApps: string[];
  agentModule?: string;
  steps: {
    name: string;
    status: 'completed' | 'current' | 'pending';
    duration?: string;
  }[];
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  schedule: string;
  status: 'active' | 'paused' | 'running' | 'failed';
  lastRun: string;
  nextRun: string;
  stepsCount: number;
  trigger: string;
  description: string;
  steps?: { name: string; app?: string }[];
  nodes: {
    id: string;
    type: 'trigger' | 'condition' | 'action' | 'ai' | 'result';
    label: string;
    subtitle: string;
    icon: string;
    config?: Record<string, string>;
  }[];
}

export interface TraceEvent {
  id: string;
  timestamp: string;
  phase: string;
  action: string;
  toolUsed: string;
  duration: string;
  status: 'completed' | 'running' | 'failed';
  metadata: Record<string, string>;
}

export interface ActivityItem {
  id: string;
  title?: string;
  action?: string;
  timestamp?: string;
  timeAgo?: string;
  category: 'ai' | 'apps' | 'files' | 'tasks' | 'automations' | 'system' | string;
  icon?: string;
  status?: 'success' | 'info' | 'warning' | 'error' | string;
}

export interface FileItem {
  id: string;
  name: string;
  path: string;
  type: 'code' | 'doc' | 'config' | 'archive' | 'image';
  size: string;
  modified: string;
  relevanceScore?: number;
  tags: string[];
  project: string;
}

export interface AppItem {
  id: string;
  name: string;
  status: 'running' | 'idle' | 'installed';
  icon: string;
  cpu: string;
  memory: string;
  lastUsed: string;
  relatedTasks: string[];
}

export interface MemoryItem {
  id: string;
  title: string;
  category: 'Recent Context' | 'Preferences' | 'Projects' | 'Important Information' | 'Saved Workflows' | 'Connected Knowledge' | string;
  createdAt: string;
  importance: 'High' | 'Medium' | 'Low' | string;
  source: string;
  status: 'Active' | 'Archived' | string;
  description: string;
  relatedInfo: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeAgo?: string;
  timestamp?: string;
  category: 'ai' | 'tasks' | 'automations' | 'system' | 'security' | string;
  priority?: 'low' | 'normal' | 'high' | 'critical' | string;
  unread?: boolean;
  read?: boolean;
}

export interface IntegrationItem {
  id: string;
  name: string;
  category: 'Development' | 'Productivity' | 'Communication' | 'Files' | 'AI' | 'System' | string;
  icon: string;
  status: 'connected' | 'not_connected' | string;
  permissions: string[];
  lastSynced: string;
}
