import React from 'react';
import {
  LayoutDashboard,
  HeartPulse,
  LineChart,
  ClipboardList,
  Cpu,
  Sparkles
} from 'lucide-react';

export type PageId =
  | 'dashboard'
  | 'cow-profile'
  | 'charts'
  | 'activity-log'
  | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  isSimulatedMode?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isSimulatedMode = false,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Overview Dashboard',
      description: 'At-a-glance vitals & health status',
      icon: LayoutDashboard,
    },
    {
      id: 'cow-profile',
      label: 'Cow Health & Profile',
      description: 'Individual cow details & baseline',
      icon: HeartPulse,
    },
    {
      id: 'charts',
      label: 'Sensor Trend Charts',
      description: 'Live graphs for temp, milk & activity',
      icon: LineChart,
    },
    {
      id: 'activity-log',
      label: 'Recent Activity Log',
      description: 'Real-time telemetry event history',
      icon: ClipboardList,
    },
    {
      id: 'settings',
      label: 'Hardware Settings',
      description: 'Simple ESP32 connection guide & pins',
      icon: Cpu,
    },
  ] as const;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-30 select-none shadow-xs">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-xl shadow-2xs">
          🐄
        </div>
        <div>
          <h2 className="font-bold text-sm tracking-tight text-slate-900">
            Cattle Health IoT
          </h2>
          <p className="text-[11px] text-blue-600 font-medium">Smart Monitoring</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Main Navigation
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id as PageId)}
              className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-blue-50/80 text-blue-700 border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className={`block text-xs font-semibold leading-tight ${isActive ? 'text-blue-900 font-bold' : 'text-slate-800'}`}>
                  {item.label}
                </span>
                <span className="block text-[10px] text-slate-400 truncate mt-0.5">
                  {item.description}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Demo Mode Notice in Sidebar */}
      {isSimulatedMode && (
        <div className="px-3 pb-2">
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Demo Mode Active</span>
            </div>
            <p className="text-[10px] text-purple-600 leading-snug">
              Running simulated live cattle vitals for demonstration.
            </p>
          </div>
        </div>
      )}

      {/* Project Info Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-slate-700 text-[11px]">System Status</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            ESP32 Microcontroller • Bluetooth Classic SPP • 4 Sensor Probes
          </p>
        </div>
      </div>
    </aside>
  );
};
