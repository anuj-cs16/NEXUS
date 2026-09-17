'use client';

import { useEffect, useState } from 'react';

interface HealthStatus {
  status: string;
  version: string;
  timestamp: string;
  python_version: string;
  platform: string;
  ollama_url: string;
  debug: boolean;
}

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/health')
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setError('Backend not reachable — start the NEXUS backend engine'));
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Title Bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-nexus-bg-elevated border-b border-nexus-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-nexus-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-nexus-text">NEXUS</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-nexus-accent/10 text-nexus-accent font-medium">
            v0.1.0
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot connected={health?.status === 'ok'} />
          <span className="text-xs text-nexus-text-secondary">
            {health ? 'Engine Connected' : 'Engine Offline'}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full space-y-8">
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-nexus-accent to-purple-600 shadow-lg shadow-nexus-accent/20">
              <span className="text-4xl font-bold text-white">N</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome to <span className="text-nexus-accent">NEXUS</span>
            </h2>
            <p className="text-nexus-text-secondary text-lg max-w-md mx-auto">
              Your autonomous, local-first AI Software Engineer. Plan, code, test, debug, secure,
              and review — all on your machine.
            </p>
          </div>

          {/* Status Card */}
          <div className="rounded-xl border border-nexus-border bg-nexus-bg-elevated p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-nexus-text-secondary">
              System Status
            </h3>

            {error && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-nexus-error/10 border border-nexus-error/20">
                <div className="w-2 h-2 rounded-full bg-nexus-error" />
                <span className="text-sm text-nexus-error">{error}</span>
              </div>
            )}

            {health && (
              <div className="grid grid-cols-2 gap-3">
                <StatusItem label="Backend" value={health.status} color="success" />
                <StatusItem label="Version" value={health.version} />
                <StatusItem label="Python" value={health.python_version.split(' ')[0] ?? ''} />
                <StatusItem label="Ollama" value={health.ollama_url} />
              </div>
            )}

            {!health && !error && (
              <div className="flex items-center gap-3 p-3">
                <div className="w-4 h-4 border-2 border-nexus-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-nexus-text-secondary">
                  Connecting to backend engine...
                </span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            <QuickAction icon="📁" label="Import Project" description="Add a codebase" />
            <QuickAction icon="🤖" label="New Task" description="Start an AI task" />
            <QuickAction icon="⚙️" label="Settings" description="Configure NEXUS" />
          </div>
        </div>
      </div>
    </main>
  );
}

function StatusDot({ connected }: { connected: boolean }) {
  return (
    <div className="relative">
      <div
        className={`w-2 h-2 rounded-full ${connected ? 'bg-nexus-success' : 'bg-nexus-text-tertiary'}`}
      />
      {connected && (
        <div className="absolute inset-0 w-2 h-2 rounded-full bg-nexus-success animate-ping opacity-75" />
      )}
    </div>
  );
}

function StatusItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: 'success' | 'error' | 'warning';
}) {
  const colorClass = color
    ? {
        success: 'text-nexus-success',
        error: 'text-nexus-error',
        warning: 'text-nexus-warning',
      }[color]
    : 'text-nexus-text';

  return (
    <div className="p-3 rounded-lg bg-nexus-bg-surface">
      <div className="text-xs text-nexus-text-tertiary mb-1">{label}</div>
      <div className={`text-sm font-medium truncate ${colorClass}`}>{value}</div>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  description,
}: {
  icon: string;
  label: string;
  description: string;
}) {
  return (
    <button className="group p-4 rounded-xl border border-nexus-border bg-nexus-bg-elevated hover:bg-nexus-bg-surface hover:border-nexus-accent/30 transition-all duration-200 text-left cursor-pointer">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm font-medium text-nexus-text group-hover:text-nexus-accent transition-colors">
        {label}
      </div>
      <div className="text-xs text-nexus-text-tertiary mt-0.5">{description}</div>
    </button>
  );
}
