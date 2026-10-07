import React from 'react';
import { ScanBarcode, Plus, Settings, Sun, Moon } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onOpenScanner: () => void;
  onAddItem: () => void;
  onOpenSettings: () => void;
  title?: string;
  activeTab?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenScanner,
  onAddItem,
  onOpenSettings,
  title,
  activeTab,
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-slate-100 border-b border-amber-500/30 shadow-xs dir-rtl transition-all">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="بلال كو - Bilal Koo"
            className="h-10 w-auto object-contain shrink-0 md:hidden drop-shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-black text-amber-600 dark:text-amber-400 tracking-tight leading-tight">
                {title || 'بلال كو - Bilal Koo'}
              </h2>
              <span className="hidden xs:inline-block rounded-md bg-amber-500/10 dark:bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-500/30">
                حيث السعر الحقيقي
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium mt-0.5">
              نظام أرشفة وإدارة المنتجات والباركود الخاص بـ بلال كو
            </p>
          </div>
        </div>

        {/* Header Action Shortcuts */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button (Light/Dark Mode) */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center h-10 w-10 rounded-xl transition border min-h-[40px] min-w-[40px] bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-slate-200 dark:border-slate-700 active:scale-95"
            title={isDark ? 'تغيير للوضع النهاري (الفاتح)' : 'تغيير للوضع الليلي (الداكن)'}
          >
            {isDark ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-slate-700" />}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center justify-center h-10 w-10 rounded-xl transition border min-h-[40px] min-w-[40px] ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
            title="الإعدادات والنسخ الاحتياطي"
          >
            <Settings className="h-4.5 w-4.5" />
          </button>

          {/* Quick Barcode Scanner Button */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 min-h-[40px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 active:scale-95 transition border border-slate-200 dark:border-slate-700"
            title="مسح باركود بالكاميرا"
          >
            <ScanBarcode className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="hidden xs:inline">مسح الباركود</span>
          </button>

          {/* Quick Add Item button on desktop */}
          <button
            onClick={onAddItem}
            className="hidden sm:flex items-center gap-2 min-h-[40px] rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-black text-slate-950 shadow-xs active:scale-95 transition"
          >
            <Plus className="h-4 w-4 text-slate-950" />
            <span>إضافة قطعة</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
