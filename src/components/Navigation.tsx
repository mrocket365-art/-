import React from 'react';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  Boxes,
  PlusCircle,
  FolderTree,
  EyeOff,
  Settings,
} from 'lucide-react';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  totalItems: number;
  hiddenCount: number;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  highlight?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  totalItems,
  hiddenCount,
}) => {
  // Mobile bottom bar items
  const mobileNavItems: NavItem[] = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'items', label: 'القطع', icon: Boxes, badge: totalItems },
    { id: 'add-item', label: 'إضافة قطعة', icon: PlusCircle, highlight: true },
    { id: 'categories', label: 'الأقسام', icon: FolderTree },
    { id: 'hidden-items', label: 'المخفية', icon: EyeOff, badge: hiddenCount > 0 ? hiddenCount : undefined },
  ];

  // Sidebar items for Desktop
  const sidebarItems: NavItem[] = [
    ...mobileNavItems,
    { id: 'settings', label: 'الإعدادات والنسخ', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 z-30 border-l border-slate-200 dark:border-amber-500/20 shadow-xl transition-colors">
        {/* Brand Banner with Bilal Koo Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-slate-900/60">
          <img
            src="/logo.svg"
            alt="بلال كو Logo"
            className="h-12 w-auto object-contain shrink-0 drop-shadow-md"
          />
          <div>
            <h1 className="text-base font-black tracking-tight text-amber-600 dark:text-amber-400">بلال كو</h1>
            <p className="text-[11px] text-amber-700 dark:text-amber-200/80 font-bold">حيث السعر الحقيقي</p>
          </div>
        </div>

        {/* Menu Links */}
        <nav className="flex-1 space-y-1.5 px-3.5 py-6 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/90 hover:text-amber-600 dark:hover:text-amber-400'
                } ${item.highlight && !isActive ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 dark:hover:bg-amber-950/40' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-slate-950' : item.highlight ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 dark:border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-200/70 text-center font-bold">
          بلال كو - حيث السعر الحقيقي
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-amber-500/30 shadow-2xl px-1 py-1.5 dir-rtl transition-colors">
        <div className="flex items-center justify-around">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.highlight) {
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="flex flex-col items-center justify-center -mt-5 min-w-[52px]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 border-4 border-white dark:border-slate-950 active:scale-90 transition">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 mt-1">إضافة</span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2 min-h-[44px] rounded-xl transition ${
                  isActive ? 'text-amber-600 dark:text-amber-400 font-black' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium mt-1 leading-none">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="absolute -top-1 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black text-slate-950">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
