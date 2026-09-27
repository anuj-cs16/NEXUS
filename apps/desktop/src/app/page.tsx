"use client";

import React, { useState, useEffect } from "react";
import { ScreenId, CoreState, NexusModule, TaskItem, AutomationWorkflow } from "@/types/nexus";
import { AppSidebar } from "@/components/AppSidebar";
import { GlobalHeader } from "@/components/GlobalHeader";
import { INITIAL_MODULES, INITIAL_TASKS, INITIAL_AUTOMATIONS } from "@/data/mockData";

// Screens
import { Screen01Home } from "@/screens/Screen01Home";
import { Screen02Command } from "@/screens/Screen02Command";
import { Screen04Modules } from "@/screens/Screen04Modules";
import { Screen05ModuleDetail } from "@/screens/Screen05ModuleDetail";
import { Screen06Tasks } from "@/screens/Screen06Tasks";
import { Screen07TaskDetail } from "@/screens/Screen07TaskDetail";
import { Screen08Automations } from "@/screens/Screen08Automations";
import { Screen09AutomationBuilder } from "@/screens/Screen09AutomationBuilder";
import { Screen10AutomationRun } from "@/screens/Screen10AutomationRun";
import { Screen11LiveActivity } from "@/screens/Screen11LiveActivity";
import { Screen12NexusTrace } from "@/screens/Screen12NexusTrace";
import { Screen13Files } from "@/screens/Screen13Files";
import { Screen14FileSearch } from "@/screens/Screen14FileSearch";
import { Screen15Apps } from "@/screens/Screen15Apps";
import { Screen16SystemControl } from "@/screens/Screen16SystemControl";
import { Screen17Memory } from "@/screens/Screen17Memory";
import { Screen18MemoryDetail } from "@/screens/Screen18MemoryDetail";
import { Screen19Insights } from "@/screens/Screen19Insights";
import { Screen20Notifications } from "@/screens/Screen20Notifications";
import { Screen21Settings } from "@/screens/Screen21Settings";
import { Screen22Integrations } from "@/screens/Screen22Integrations";
import { Screen25ErrorRecovery } from "@/screens/Screen25ErrorRecovery";
import { Screen26SuccessState } from "@/screens/Screen26SuccessState";
import { Screen27EmptyStates } from "@/screens/Screen27EmptyStates";
import { Screen28Onboarding } from "@/screens/Screen28Onboarding";
import { Screen33FirstRun } from "@/screens/Screen33FirstRun";
import { Screen34CompactResponsive } from "@/screens/Screen34CompactResponsive";

// Modals & Overlays
import { CommandPaletteModal } from "@/components/CommandPaletteModal";
import { GlobalSearchModal } from "@/components/GlobalSearchModal";
import { PermissionModal } from "@/components/PermissionModal";
import { AiConfirmationModal } from "@/components/AiConfirmationModal";
import { ProfileMenuModal } from "@/components/ProfileMenuModal";
import { DesktopOverlayWidget } from "@/components/DesktopOverlayWidget";
import { DesktopNotificationToast } from "@/components/DesktopNotificationToast";

// Icons for Switcher
import { Layers, ChevronDown } from "lucide-react";

export default function NexusApp() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>("01-home");
  const [coreState, setCoreState] = useState<CoreState>("idle");
  const [activeModel, setActiveModel] = useState<string>("qwen2.5-coder:7b");
  const [selectedModule, setSelectedModule] = useState<NexusModule>(INITIAL_MODULES[0]);
  const [selectedTask, setSelectedTask] = useState<TaskItem>(INITIAL_TASKS[0]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<AutomationWorkflow>(INITIAL_AUTOMATIONS[0]);

  // Modals & Overlays state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDesktopOverlayVisible, setIsDesktopOverlayVisible] = useState(false);
  const [isToastNotificationVisible, setIsToastNotificationVisible] = useState(true);

  // Permission / Confirmation payload state
  const [permissionPayload, setPermissionPayload] = useState({ appName: "Visual Studio Code", reason: "Required to continue your requested development workflow." });
  const [confirmationPayload, setConfirmationPayload] = useState({ workflowName: "Development & Test Automation Workflow", steps: ["Open Visual Studio Code", "Modify selected files", "Run test suite", "Commit changes"] });

  // Quick Screen Switcher Bar visibility
  const [showScreenSwitcher, setShowScreenSwitcher] = useState(true);

  // Global Keyboard Shortcuts (Ctrl+K, Ctrl+F, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsCommandPaletteOpen(false);
        setIsGlobalSearchOpen(false);
        setIsPermissionModalOpen(false);
        setIsConfirmationModalOpen(false);
        setIsProfileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavigate = (screen: ScreenId) => {
    setActiveScreen(screen);
    // Auto-close overlays
    setIsCommandPaletteOpen(false);
    setIsGlobalSearchOpen(false);
    setIsPermissionModalOpen(false);
    setIsConfirmationModalOpen(false);
    setIsProfileMenuOpen(false);
  };

  const handleRequestPermission = (appName: string, reason: string) => {
    setPermissionPayload({ appName, reason });
    setIsPermissionModalOpen(true);
  };

  const handleRequestAiConfirmation = (workflowName: string, steps: string[]) => {
    setConfirmationPayload({ workflowName, steps });
    setIsConfirmationModalOpen(true);
  };

  // Prototype Flow Triggers
  const triggerFlow = (flowIndex: number) => {
    switch (flowIndex) {
      case 1:
        // Onboarding -> Home -> Command -> Task Execution -> Trace -> Success -> Activity
        setActiveScreen("28-onboarding");
        break;
      case 2:
        // Home -> Automations -> Builder -> Permission -> Run -> Result
        setActiveScreen("09-automation-builder");
        break;
      case 3:
        // Home -> Command Palette -> File Search -> Result
        setIsCommandPaletteOpen(true);
        break;
      case 4:
        // Home -> AI Modules -> Module Detail -> Permissions
        setActiveScreen("04-modules");
        break;
      default:
        setActiveScreen("01-home");
    }
  };

  const allScreens: { id: ScreenId; title: string; num: string }[] = [
    { id: "01-home", title: "Home / Command Center", num: "01" },
    { id: "02-command", title: "NEXUS Command", num: "02" },
    { id: "03-palette", title: "Command Palette (Ctrl+K)", num: "03" },
    { id: "04-modules", title: "AI Modules Network", num: "04" },
    { id: "05-module-detail", title: "Module Detail Workspace", num: "05" },
    { id: "06-tasks", title: "AI Tasks Management", num: "06" },
    { id: "07-task-detail", title: "Task Execution Workspace", num: "07" },
    { id: "08-automations", title: "Automations Hub", num: "08" },
    { id: "09-automation-builder", title: "Visual Workflow Builder", num: "09" },
    { id: "10-automation-run", title: "Automation Run Audit", num: "10" },
    { id: "11-activity", title: "Live Activity Center", num: "11" },
    { id: "12-trace", title: "NEXUS Trace Transparency", num: "12" },
    { id: "13-files", title: "AI File Explorer", num: "13" },
    { id: "14-file-search", title: "Intelligent File Search", num: "14" },
    { id: "15-apps", title: "App Ecosystem", num: "15" },
    { id: "16-system", title: "System Awareness & Telemetry", num: "16" },
    { id: "17-memory", title: "Memory Center", num: "17" },
    { id: "18-memory-detail", title: "Memory Detail Workspace", num: "18" },
    { id: "19-insights", title: "Productivity Insights", num: "19" },
    { id: "20-notifications", title: "Notification Center", num: "20" },
    { id: "21-settings", title: "Settings Portal", num: "21" },
    { id: "22-integrations", title: "Integrations Hub", num: "22" },
    { id: "23-permission-modal", title: "Permission Modal", num: "23" },
    { id: "24-ai-confirmation", title: "AI Action Confirmation", num: "24" },
    { id: "25-error-recovery", title: "Error Recovery State", num: "25" },
    { id: "26-success", title: "Success Completion State", num: "26" },
    { id: "27-empty-states", title: "Empty States Showcase", num: "27" },
    { id: "28-onboarding", title: "First-Time Onboarding", num: "28" },
    { id: "29-global-search", title: "Global Search Overlay", num: "29" },
    { id: "30-profile-menu", title: "Profile Menu", num: "30" },
    { id: "31-desktop-overlay", title: "Floating Desktop Overlay", num: "31" },
    { id: "32-desktop-notifications", title: "Desktop Toast Alert", num: "32" },
    { id: "33-first-run", title: "First-Run Dashboard", num: "33" },
    { id: "34-compact", title: "Compact Responsive Fallback", num: "34" },
  ];

  const isCompact = activeScreen === "34-compact" || activeScreen === "screen-34-compact-responsive";
  const isOnboarding = activeScreen === "28-onboarding" || activeScreen === "screen-28-onboarding";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0f] text-[#f0f0f5] font-sans antialiased">
      {/* Primary Sidebar */}
      {!isCompact && (
        <AppSidebar
          currentScreen={activeScreen}
          onNavigate={handleNavigate}
          unreadCount={3}
        />
      )}

      {/* Main Execution Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Global Top Header Bar */}
        {!isCompact && !isOnboarding && (
          <GlobalHeader
            currentScreen={activeScreen}
            onNavigate={handleNavigate}
            onOpenPalette={() => setIsCommandPaletteOpen(true)}
            onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
            onOpenOverlay={() => setIsDesktopOverlayVisible(true)}
            unreadCount={3}
            ollamaConnected={true}
            activeModel={activeModel}
          />
        )}

        {/* Dynamic Screen Renderer */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative bg-[#0a0a0f]">
          {(activeScreen === "01-home" || activeScreen === "screen-01-home") && (
            <Screen01Home 
              onNavigate={handleNavigate} 
              coreState={coreState}
              setCoreState={setCoreState}
              onOpenPalette={() => setIsCommandPaletteOpen(true)}
            />
          )}

          {(activeScreen === "02-command" || activeScreen === "screen-02-command") && (
            <Screen02Command 
              onNavigate={handleNavigate} 
              onRequestPermission={handleRequestPermission}
              onRequestAiConfirmation={handleRequestAiConfirmation}
            />
          )}

          {(activeScreen === "03-palette" || activeScreen === "screen-03-command-palette") && (
            <div className="flex-1 p-8 flex items-center justify-center">
              <div className="text-center space-y-3">
                <p className="text-[#9494a8] text-sm">Command Palette is currently open as a modal overlay.</p>
                <button 
                  onClick={() => setIsCommandPaletteOpen(true)}
                  className="px-4 py-2 bg-[#6366f1] text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Open Ctrl+K Palette
                </button>
              </div>
            </div>
          )}

          {(activeScreen === "04-modules" || activeScreen === "screen-04-modules") && (
            <Screen04Modules 
              onNavigate={handleNavigate} 
              onSelectModule={(mod) => {
                setSelectedModule(mod);
                setActiveScreen("05-module-detail");
              }} 
            />
          )}

          {(activeScreen === "05-module-detail" || activeScreen === "screen-05-module-detail") && (
            <Screen05ModuleDetail 
              module={selectedModule} 
              onNavigate={handleNavigate} 
            />
          )}

          {(activeScreen === "06-tasks" || activeScreen === "screen-06-tasks") && (
            <Screen06Tasks 
              onNavigate={handleNavigate} 
              onSelectTask={(task) => {
                setSelectedTask(task);
                setActiveScreen("07-task-detail");
              }}
            />
          )}

          {(activeScreen === "07-task-detail" || activeScreen === "screen-07-task-detail") && (
            <Screen07TaskDetail onNavigate={handleNavigate} />
          )}

          {(activeScreen === "08-automations" || activeScreen === "screen-08-automations") && (
            <Screen08Automations 
              onNavigate={handleNavigate} 
              onSelectAutomation={(wf) => {
                setSelectedWorkflow(wf);
                setActiveScreen("09-automation-builder");
              }}
            />
          )}

          {(activeScreen === "09-automation-builder" || activeScreen === "screen-09-automation-builder") && (
            <Screen09AutomationBuilder 
              workflow={selectedWorkflow}
              onNavigate={handleNavigate} 
              onRequestPermission={handleRequestPermission}
            />
          )}

          {(activeScreen === "10-automation-run" || activeScreen === "screen-10-automation-run") && (
            <Screen10AutomationRun onNavigate={handleNavigate} />
          )}

          {(activeScreen === "11-activity" || activeScreen === "screen-11-activity") && (
            <Screen11LiveActivity onNavigate={handleNavigate} />
          )}

          {(activeScreen === "12-trace" || activeScreen === "screen-12-trace") && (
            <Screen12NexusTrace onNavigate={handleNavigate} />
          )}

          {(activeScreen === "13-files" || activeScreen === "screen-13-files") && (
            <Screen13Files onNavigate={handleNavigate} />
          )}

          {(activeScreen === "14-file-search" || activeScreen === "screen-14-file-search") && (
            <Screen14FileSearch onNavigate={handleNavigate} />
          )}

          {(activeScreen === "15-apps" || activeScreen === "screen-15-apps") && (
            <Screen15Apps 
              onNavigate={handleNavigate} 
              onRequestPermission={handleRequestPermission}
            />
          )}

          {(activeScreen === "16-system" || activeScreen === "screen-16-system") && (
            <Screen16SystemControl onNavigate={handleNavigate} />
          )}

          {(activeScreen === "17-memory" || activeScreen === "screen-17-memory") && (
            <Screen17Memory 
              onNavigate={handleNavigate} 
              onSelectMemory={() => setActiveScreen("18-memory-detail")} 
            />
          )}

          {(activeScreen === "18-memory-detail" || activeScreen === "screen-18-memory-detail") && (
            <Screen18MemoryDetail onNavigate={handleNavigate} />
          )}

          {(activeScreen === "19-insights" || activeScreen === "screen-19-insights") && (
            <Screen19Insights onNavigate={handleNavigate} />
          )}

          {(activeScreen === "20-notifications" || activeScreen === "screen-20-notifications") && (
            <Screen20Notifications 
              onNavigate={handleNavigate} 
              onRequestPermission={handleRequestPermission}
            />
          )}

          {(activeScreen === "21-settings" || activeScreen === "screen-21-settings") && (
            <Screen21Settings 
              onNavigate={handleNavigate} 
              activeModel={activeModel}
              setActiveModel={setActiveModel}
            />
          )}

          {(activeScreen === "22-integrations" || activeScreen === "screen-22-integrations") && (
            <Screen22Integrations 
              onNavigate={handleNavigate} 
              onRequestPermission={handleRequestPermission}
            />
          )}

          {(activeScreen === "23-permission-modal" || activeScreen === "screen-23-permission-modal") && (
            <div className="flex-1 p-8 flex items-center justify-center">
              <div className="text-center space-y-3">
                <p className="text-[#9494a8] text-sm">Permission Modal view mode active.</p>
                <button 
                  onClick={() => setIsPermissionModalOpen(true)}
                  className="px-4 py-2 bg-[#6366f1] text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Trigger Security Permission Modal
                </button>
              </div>
            </div>
          )}

          {(activeScreen === "24-ai-confirmation" || activeScreen === "screen-24-ai-confirmation") && (
            <div className="flex-1 p-8 flex items-center justify-center">
              <div className="text-center space-y-3">
                <p className="text-[#9494a8] text-sm">AI Confirmation Modal view mode active.</p>
                <button 
                  onClick={() => setIsConfirmationModalOpen(true)}
                  className="px-4 py-2 bg-[#6366f1] text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Trigger AI Approval Dialog
                </button>
              </div>
            </div>
          )}

          {(activeScreen === "25-error-recovery" || activeScreen === "screen-25-error-recovery") && (
            <Screen25ErrorRecovery onNavigate={handleNavigate} />
          )}

          {(activeScreen === "26-success" || activeScreen === "screen-26-success-state") && (
            <Screen26SuccessState onNavigate={handleNavigate} />
          )}

          {(activeScreen === "27-empty-states" || activeScreen === "screen-27-empty-states") && (
            <Screen27EmptyStates onNavigate={handleNavigate} />
          )}

          {(activeScreen === "28-onboarding" || activeScreen === "screen-28-onboarding") && (
            <Screen28Onboarding onNavigate={handleNavigate} />
          )}

          {(activeScreen === "29-global-search" || activeScreen === "screen-29-global-search") && (
            <div className="flex-1 p-8 flex items-center justify-center">
              <div className="text-center space-y-3">
                <p className="text-[#9494a8] text-sm">Universal Global Search overlay active.</p>
                <button 
                  onClick={() => setIsGlobalSearchOpen(true)}
                  className="px-4 py-2 bg-[#6366f1] text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Open Global Search
                </button>
              </div>
            </div>
          )}

          {(activeScreen === "30-profile-menu" || activeScreen === "screen-30-profile-menu") && (
            <div className="flex-1 p-8 flex items-center justify-center">
              <div className="text-center space-y-3">
                <p className="text-[#9494a8] text-sm">User Profile &amp; Plan Menu modal.</p>
                <button 
                  onClick={() => setIsProfileMenuOpen(true)}
                  className="px-4 py-2 bg-[#6366f1] text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Open Profile Menu
                </button>
              </div>
            </div>
          )}

          {(activeScreen === "31-desktop-overlay" || activeScreen === "screen-31-desktop-overlay") && (
            <div className="flex-1 p-8 flex items-center justify-center relative">
              <div className="text-center space-y-3">
                <p className="text-[#9494a8] text-sm">Desktop Quick Floating Overlay Widget is active in the bottom right corner.</p>
                <button 
                  onClick={() => setIsDesktopOverlayVisible(!isDesktopOverlayVisible)}
                  className="px-4 py-2 bg-[#6366f1] text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Toggle Floating Widget
                </button>
              </div>
            </div>
          )}

          {(activeScreen === "32-desktop-notifications" || activeScreen === "screen-32-desktop-notification") && (
            <div className="flex-1 p-8 flex items-center justify-center">
              <div className="text-center space-y-3">
                <p className="text-[#9494a8] text-sm">Desktop Toast Notification active in the top right corner.</p>
                <button 
                  onClick={() => setIsToastNotificationVisible(true)}
                  className="px-4 py-2 bg-[#6366f1] text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Re-fire Toast Notification
                </button>
              </div>
            </div>
          )}

          {(activeScreen === "33-first-run" || activeScreen === "screen-33-first-run") && (
            <Screen33FirstRun onNavigate={handleNavigate} />
          )}

          {(activeScreen === "34-compact" || activeScreen === "screen-34-compact-responsive") && (
            <Screen34CompactResponsive onNavigate={handleNavigate} />
          )}
        </main>

        {/* Floating Quick Navigation & Prototype Flow Switcher Bar */}
        {showScreenSwitcher && (
          <div className="absolute bottom-4 left-6 z-40 flex items-center gap-2 p-1.5 rounded-2xl bg-[#12121a]/90 border border-[#2a2a3a] backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold text-[#818cf8] border-r border-[#2a2a3a]">
              <Layers className="w-3.5 h-3.5" />
              <span>NEXUS 34-SCREEN AUDIT</span>
            </div>

            {/* Quick Screen Dropdown */}
            <div className="relative group">
              <select
                value={activeScreen}
                onChange={(e) => handleNavigate(e.target.value as ScreenId)}
                className="bg-[#1a1a25] border border-[#2a2a3a] text-white text-xs rounded-xl px-3 py-1.5 appearance-none pr-8 cursor-pointer focus:outline-none focus:border-[#6366f1]"
              >
                {allScreens.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#1a1a25] text-white">
                    {s.num}. {s.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#9494a8] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Prototype Flows */}
            <div className="flex items-center gap-1 pl-1 border-l border-[#2a2a3a]">
              <button
                onClick={() => triggerFlow(1)}
                title="Flow 1: Onboarding ➔ Home ➔ Command ➔ Execution ➔ Trace ➔ Success"
                className="px-2.5 py-1 rounded-lg bg-[#1a1a25] hover:bg-[#22222f] text-[#9494a8] hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
              >
                Flow 1: Task
              </button>
              <button
                onClick={() => triggerFlow(2)}
                title="Flow 2: Automations ➔ Builder ➔ Permission ➔ Run"
                className="px-2.5 py-1 rounded-lg bg-[#1a1a25] hover:bg-[#22222f] text-[#9494a8] hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
              >
                Flow 2: Auto
              </button>
              <button
                onClick={() => triggerFlow(3)}
                title="Flow 3: Command Palette ➔ File Search ➔ AI Action"
                className="px-2.5 py-1 rounded-lg bg-[#1a1a25] hover:bg-[#22222f] text-[#9494a8] hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
              >
                Flow 3: Files
              </button>
              <button
                onClick={() => triggerFlow(4)}
                title="Flow 4: Modules ➔ Detail ➔ Permissions"
                className="px-2.5 py-1 rounded-lg bg-[#1a1a25] hover:bg-[#22222f] text-[#9494a8] hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
              >
                Flow 4: Modules
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Global Modals & Overlay Widgets */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen || activeScreen === "03-palette" || activeScreen === "screen-03-command-palette"}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
        onExecuteCommand={(cmd) => {
          setActiveScreen("02-command");
        }}
      />

      <GlobalSearchModal
        isOpen={isGlobalSearchOpen || activeScreen === "29-global-search" || activeScreen === "screen-29-global-search"}
        onClose={() => setIsGlobalSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      <PermissionModal
        isOpen={isPermissionModalOpen || activeScreen === "23-permission-modal" || activeScreen === "screen-23-permission-modal"}
        appName={permissionPayload.appName}
        reason={permissionPayload.reason}
        onClose={() => setIsPermissionModalOpen(false)}
        onAllowOnce={() => {
          setIsPermissionModalOpen(false);
          setActiveScreen("07-task-detail");
        }}
        onAlwaysAllow={() => {
          setIsPermissionModalOpen(false);
          setActiveScreen("07-task-detail");
        }}
      />

      <AiConfirmationModal
        isOpen={isConfirmationModalOpen || activeScreen === "24-ai-confirmation" || activeScreen === "screen-24-ai-confirmation"}
        workflowName={confirmationPayload.workflowName}
        steps={confirmationPayload.steps}
        onClose={() => setIsConfirmationModalOpen(false)}
        onApprove={() => {
          setIsConfirmationModalOpen(false);
          setActiveScreen("26-success");
        }}
        onReview={() => {
          setIsConfirmationModalOpen(false);
          setActiveScreen("07-task-detail");
        }}
      />

      <ProfileMenuModal
        isOpen={isProfileMenuOpen || activeScreen === "30-profile-menu" || activeScreen === "screen-30-profile-menu"}
        onClose={() => setIsProfileMenuOpen(false)}
        onNavigate={handleNavigate}
      />

      <DesktopOverlayWidget
        isOpen={isDesktopOverlayVisible || activeScreen === "31-desktop-overlay" || activeScreen === "screen-31-desktop-overlay"}
        onClose={() => setIsDesktopOverlayVisible(false)}
        onNavigate={handleNavigate}
        onExecuteCommand={(cmd) => {
          setActiveScreen("02-command");
        }}
      />

      <DesktopNotificationToast
        isOpen={isToastNotificationVisible || activeScreen === "32-desktop-notifications" || activeScreen === "screen-32-desktop-notification"}
        onClose={() => setIsToastNotificationVisible(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
