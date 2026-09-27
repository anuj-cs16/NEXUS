"use client";

import React, { useState } from "react";
import { ScreenId } from "@/types/nexus";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Terminal, 
  FolderOpen, 
  ShieldCheck, 
  Brain, 
  Cpu, 
  CheckCircle2,
  Lock,
  Layers,
  Zap,
  ChevronRight
} from "lucide-react";

interface Screen28Props {
  onNavigate: (screen: ScreenId) => void;
}

export const Screen28Onboarding: React.FC<Screen28Props> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // User selections
  const [selectedAssistMode, setSelectedAssistMode] = useState("autonomous-copilot");
  const [connectedApps, setConnectedApps] = useState<string[]>(["vscode", "git", "terminal"]);
  const [securityLevel, setSecurityLevel] = useState("smart-confirm");
  const [memoryMode, setMemoryMode] = useState("local-hybrid");
  const [aiModel, setAiModel] = useState("ollama-qwen");

  const totalSteps = 7;

  const toggleApp = (id: string) => {
    if (connectedApps.includes(id)) {
      setConnectedApps(connectedApps.filter(a => a !== id));
    } else {
      setConnectedApps([...connectedApps, id]);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onNavigate("screen-01-home");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stepTitles = [
    "Welcome to NEXUS",
    "Assist Modes",
    "Connect Applications",
    "Permissions & Trust",
    "Memory & Context",
    "AI Engine",
    "System Ready"
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto flex flex-col justify-between min-h-full">
      {/* Top Stepper */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-nexus-purple to-nexus-blue flex items-center justify-center text-white font-black text-sm shadow-md shadow-nexus-purple/20">
              N
            </div>
            <span className="font-bold tracking-tight text-white">NEXUS INITIALIZATION</span>
          </div>

          <div className="text-xs text-nexus-text-muted font-mono">
            Step {currentStep} of {totalSteps}: <span className="text-white font-medium">{stepTitles[currentStep - 1]}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-nexus-surface rounded-full overflow-hidden border border-nexus-border">
          <div 
            className="h-full bg-gradient-to-r from-nexus-purple via-nexus-blue to-nexus-green transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Step Canvas */}
      <div className="my-8 bg-nexus-card border border-nexus-border rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-nexus-purple/10 rounded-full blur-3xl pointer-events-none" />

        {/* Step 1: Welcome to NEXUS */}
        {currentStep === 1 && (
          <div className="space-y-6 text-center max-w-lg mx-auto py-6 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-nexus-purple to-nexus-blue p-0.5 mx-auto shadow-2xl shadow-nexus-purple/30">
              <div className="w-full h-full bg-nexus-bg rounded-[22px] flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-nexus-purple animate-pulse" />
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Welcome to NEXUS
              </h1>
              <p className="text-sm text-nexus-text-muted mt-2 leading-relaxed">
                The next-generation autonomous AI desktop operating environment. NEXUS orchestrates your apps, coordinates agent tasks, and executes multi-step engineering workflows.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-left">
              <div className="p-3 rounded-xl bg-nexus-surface/60 border border-nexus-border">
                <div className="text-nexus-purple font-mono text-xs font-bold">100% Local</div>
                <div className="text-[11px] text-nexus-text-muted mt-0.5">Private Ollama AI integration</div>
              </div>
              <div className="p-3 rounded-xl bg-nexus-surface/60 border border-nexus-border">
                <div className="text-nexus-blue font-mono text-xs font-bold">Multi-Agent</div>
                <div className="text-[11px] text-nexus-text-muted mt-0.5">7 specialized micro-agents</div>
              </div>
              <div className="p-3 rounded-xl bg-nexus-surface/60 border border-nexus-border">
                <div className="text-nexus-green font-mono text-xs font-bold">Zero-Lockin</div>
                <div className="text-[11px] text-nexus-text-muted mt-0.5">Direct OS &amp; IDE integration</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Choose how NEXUS should assist */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Choose how NEXUS should assist</h2>
              <p className="text-xs text-nexus-text-muted mt-1">
                Select your preferred autonomy level. You can fine-tune module permissions at any time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: "guided-assistant",
                  title: "Guided Assistant",
                  desc: "Asks for confirmation before every tool call, terminal command, or file edit.",
                  badge: "Maximum Oversight"
                },
                {
                  id: "autonomous-copilot",
                  title: "Autonomous Copilot",
                  desc: "Executes safe read & analysis tasks autonomously. Prompts for destructive writes.",
                  badge: "Recommended"
                },
                {
                  id: "full-autonomous",
                  title: "Full Autonomous",
                  desc: "Runs end-to-end task DAG pipelines with post-execution summary reports.",
                  badge: "High Velocity"
                }
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setSelectedAssistMode(opt.id)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedAssistMode === opt.id
                      ? "bg-nexus-surface border-nexus-purple shadow-lg shadow-nexus-purple/10"
                      : "bg-nexus-surface/40 border-nexus-border hover:border-nexus-border/80"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-semibold text-nexus-purple">{opt.badge}</span>
                      {selectedAssistMode === opt.id && <Check className="w-4 h-4 text-nexus-purple" />}
                    </div>
                    <div className="text-sm font-bold text-white">{opt.title}</div>
                    <p className="text-xs text-nexus-text-muted mt-1.5 leading-relaxed">{opt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Connect applications */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Connect your developer workspace</h2>
              <p className="text-xs text-nexus-text-muted mt-1">
                Enable NEXUS to coordinate with your active development toolchain.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: "vscode", name: "Visual Studio Code", icon: Terminal, desc: "Workspace editing & debugging" },
                { id: "git", name: "Git Repository", icon: Layers, desc: "Commits, diffs & branch management" },
                { id: "terminal", name: "PowerShell / Terminal", icon: Terminal, desc: "Direct command execution" },
                { id: "docker", name: "Docker Desktop", icon: Cpu, desc: "Container builds & orchestration" },
                { id: "browser", name: "Google Chrome", icon: Zap, desc: "DevTools & Web research agent" },
                { id: "sqlite", name: "SQLite Database", icon: FolderOpen, desc: "State persistence & WAL storage" },
              ].map((app) => {
                const Icon = app.icon;
                const isSelected = connectedApps.includes(app.id);
                return (
                  <div
                    key={app.id}
                    onClick={() => toggleApp(app.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                      isSelected
                        ? "bg-nexus-surface border-nexus-purple text-white shadow-sm"
                        : "bg-nexus-surface/30 border-nexus-border text-nexus-text-muted hover:border-nexus-border/80"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-nexus-purple" : "text-nexus-text-muted"}`} />
                        <span className="text-xs font-bold text-white">{app.name}</span>
                      </div>
                      <p className="text-[11px] text-nexus-text-muted">{app.desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? "bg-nexus-purple border-nexus-purple text-white" : "border-nexus-border"
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Configure permissions */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Security &amp; Permissions</h2>
              <p className="text-xs text-nexus-text-muted mt-1">
                Configure safety boundaries for filesystem and command-line access.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { id: "strict-sandbox", name: "Strict Sandboxing", desc: "Require interactive biometric/dialog approval for every single OS operation." },
                { id: "smart-confirm", name: "Smart Confirmation (Default)", desc: "Auto-approve safe read operations and workspace git commands. Prompt on destructive system writes." },
                { id: "unrestricted-dev", name: "Trusted Developer Mode", desc: "Allow full autonomous development in specified project root folders without interruptions." }
              ].map((lvl) => (
                <div
                  key={lvl.id}
                  onClick={() => setSecurityLevel(lvl.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    securityLevel === lvl.id
                      ? "bg-nexus-surface border-nexus-green shadow-sm"
                      : "bg-nexus-surface/30 border-nexus-border hover:border-nexus-border/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className={`w-5 h-5 ${securityLevel === lvl.id ? "text-nexus-green" : "text-nexus-text-muted"}`} />
                    <div>
                      <div className="text-xs font-bold text-white">{lvl.name}</div>
                      <div className="text-[11px] text-nexus-text-muted mt-0.5">{lvl.desc}</div>
                    </div>
                  </div>
                  {securityLevel === lvl.id && <Check className="w-4 h-4 text-nexus-green" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Configure memory */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Memory &amp; Knowledge Indexing</h2>
              <p className="text-xs text-nexus-text-muted mt-1">
                Determine how NEXUS captures and retains context across development sessions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => setMemoryMode("local-hybrid")}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  memoryMode === "local-hybrid" 
                    ? "bg-nexus-surface border-nexus-purple shadow-sm" 
                    : "bg-nexus-surface/30 border-nexus-border"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Brain className="w-5 h-5 text-nexus-purple" />
                  {memoryMode === "local-hybrid" && <Check className="w-4 h-4 text-nexus-purple" />}
                </div>
                <div className="text-xs font-bold text-white">Local Persistent Memory</div>
                <p className="text-[11px] text-nexus-text-muted mt-1 leading-relaxed">
                  Stores project conventions, frequently referenced files, and architectural decisions locally in SQLite.
                </p>
              </div>

              <div 
                onClick={() => setMemoryMode("session-only")}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  memoryMode === "session-only" 
                    ? "bg-nexus-surface border-nexus-purple shadow-sm" 
                    : "bg-nexus-surface/30 border-nexus-border"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Lock className="w-5 h-5 text-nexus-blue" />
                  {memoryMode === "session-only" && <Check className="w-4 h-4 text-nexus-purple" />}
                </div>
                <div className="text-xs font-bold text-white">Ephemeral Session Memory</div>
                <p className="text-[11px] text-nexus-text-muted mt-1 leading-relaxed">
                  Clears all runtime context and embeddings upon closing the NEXUS application.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Choose AI preferences */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Select Primary AI Engine</h2>
              <p className="text-xs text-nexus-text-muted mt-1">
                Choose the underlying LLM provider for planning and agent reasoning.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { id: "ollama-qwen", name: "Ollama: Qwen 2.5 Coder 7B (Default Local)", tag: "Zero Latency / 100% Offline" },
                { id: "ollama-llama3", name: "Ollama: Llama 3.3 70B (High Precision Local)", tag: "Advanced Multi-Agent Reasoning" },
                { id: "cloud-claude", name: "Anthropic Claude 3.7 Sonnet (Hybrid Cloud)", tag: "Complex Architecture & PRDs" },
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setAiModel(m.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    aiModel === m.id
                      ? "bg-nexus-surface border-nexus-purple shadow-sm"
                      : "bg-nexus-surface/30 border-nexus-border hover:border-nexus-border/80"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{m.name}</div>
                    <div className="text-[11px] font-mono text-nexus-purple mt-0.5">{m.tag}</div>
                  </div>
                  {aiModel === m.id && <Check className="w-4 h-4 text-nexus-purple" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Finish setup */}
        {currentStep === 7 && (
          <div className="space-y-6 text-center max-w-lg mx-auto py-6 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-nexus-green/10 border border-nexus-green/30 flex items-center justify-center text-nexus-green mx-auto shadow-2xl shadow-nexus-green/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                NEXUS is ready.
              </h1>
              <p className="text-sm text-nexus-text-muted mt-2 leading-relaxed">
                All 7 micro-agents are initialized and standing by. Your workspace telemetry and local SQLite database have been successfully mounted.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-nexus-surface/60 border border-nexus-border font-mono text-xs text-nexus-text space-y-1">
              <div className="flex justify-between text-nexus-text-muted">
                <span>Core Daemon:</span>
                <span className="text-nexus-green">ACTIVE (PID 4892)</span>
              </div>
              <div className="flex justify-between text-nexus-text-muted">
                <span>Security Engine:</span>
                <span className="text-nexus-purple">SMART_CONFIRM</span>
              </div>
              <div className="flex justify-between text-nexus-text-muted">
                <span>AI Backbone:</span>
                <span className="text-nexus-blue">QWEN-2.5-CODER</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-nexus-border">
        {currentStep > 1 ? (
          <button
            onClick={prevStep}
            className="px-4 py-2.5 rounded-xl bg-nexus-surface hover:bg-nexus-border text-nexus-text hover:text-white border border-nexus-border text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        ) : <div />}

        <button
          onClick={nextStep}
          className="px-6 py-2.5 rounded-xl bg-nexus-purple hover:bg-nexus-purple-hover text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-nexus-purple/20 transition-all"
        >
          {currentStep === totalSteps ? (
            <>
              Enter Command Center
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
