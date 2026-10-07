import React, { useRef } from 'react';
import { exportDataAsJSON, exportItemsAsCSV, resetToInitialData } from '../utils/storage';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { useTheme } from '../context/ThemeContext';
import {
  Settings,
  Download,
  Upload,
  FileSpreadsheet,
  RotateCcw,
  Smartphone,
  Database,
  Info,
  Sun,
  Moon,
  Cloud,
} from 'lucide-react';

interface SettingsViewProps {
  onReloadData: () => void;
  onOpenCloudSync?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onReloadData, onOpenCloudSync }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.categories && parsed.items) {
            localStorage.setItem('shop_archive_categories_v1', JSON.stringify(parsed.categories));
            localStorage.setItem('shop_archive_subcategories_v1', JSON.stringify(parsed.subCategories || []));
            localStorage.setItem('shop_archive_items_v1', JSON.stringify(parsed.items));
            alert('تم استيراد البيانات بنجاح!');
            onReloadData();
          } else {
            alert('ملف النسخة الاحتياطية غير صالح.');
          }
        } catch (err) {
          alert('حدث خطأ أثناء قراءة الملف.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetData = () => {
    if (confirm('تنبيه: هل أنت متأكد من إعادة تعيين البيانات إلى البيانات التجريبية الأولى؟')) {
      resetToInitialData();
      onReloadData();
      alert('تم إعادة تعيين البيانات بنجاح.');
    }
  };

  return (
    <div className="space-y-5 pb-24 md:pb-8 dir-rtl max-w-3xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
          <Settings className="h-6 w-6 text-amber-500" />
          <span>الإعدادات والنسخ الاحتياطي</span>
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
          اختيار المظهر (الوضع الليلي والنهاري)، إدارة النسخ الاحتياطي، وتصدير ملفات Excel.
        </p>
      </div>

      {/* 0. Theme Selection Card (Light Mode / Dark Mode) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-xs border border-slate-200 dark:border-amber-500/20 space-y-3">
        <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
          <Sun className="h-4 w-4 text-amber-500" />
          <span>مظهر التطبيق (الوضع النهاري / الليلي)</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
          اختر المظهر المفضل للاستخدام حسب الإضاءة المحيطة بك:
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Light Mode Button */}
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-xs font-bold transition min-h-[48px] ${
              theme === 'light'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sun className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
            <span>الوضع النهاري (الفاتح)</span>
          </button>

          {/* Dark Mode Button */}
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-xs font-bold transition min-h-[48px] ${
              theme === 'dark'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            <Moon className="h-4.5 w-4.5 text-slate-700 dark:text-amber-300" />
            <span>الوضع الليلي (الداكن)</span>
          </button>
        </div>
      </div>

      {/* 0.5. Cloud Storage & Sync Card (Optional) */}
      {onOpenCloudSync && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-xs border border-slate-200 dark:border-amber-500/20 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-300 border border-amber-500/20">
                <Cloud className="h-3.5 w-3.5 text-amber-500" />
                <span>التخزين السحابي والمزامنة (اختياري)</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">مزامنة البيانات بين الأجهزة</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md leading-relaxed font-medium">
                احفظ بياناتك سحابياً وافتح منتجاتك وأرشيفك من أي هاتف أو كمبيوتر آخر بضغطة زر.
              </p>
            </div>

            <button
              onClick={onOpenCloudSync}
              className="shrink-0 flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-black text-slate-950 shadow-xs transition"
            >
              <Cloud className="h-4 w-4" />
              <span>إدارة المزامنة السحابية</span>
            </button>
          </div>
        </div>
      )}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-300 border border-amber-500/20">
              <Smartphone className="h-3.5 w-3.5" />
              <span>جاهز للاستخدام على Android</span>
            </div>
            <h3 className="text-sm font-bold">تثبيت التطبيق على الهاتف</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md leading-relaxed font-medium">
              يمكنك تثبيت هذا النظام على شاشة هاتف Android أو iPhone ليعمل كتطبيق أصلي مريح وسريع.
            </p>
          </div>

          <div className="shrink-0">
            <PWAInstallButton />
          </div>
        </div>
      </div>

      {/* 2. Backup & Export Options */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-xs border border-slate-200 dark:border-amber-500/20 space-y-3.5">
        <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <Database className="h-4 w-4 text-amber-500" />
          <span>إدارة النسخ الاحتياطي والاستيراد</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Export JSON */}
          <button
            onClick={exportDataAsJSON}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition text-right min-h-[56px]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Download className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="block font-bold">تصدير نسخة احتياطية (JSON)</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">حفظ كامل الأقسام والقطع في ملف</span>
            </div>
          </button>

          {/* Import JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition text-right min-h-[56px]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              <Upload className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="block font-bold">استيراد نسخة احتياطية</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">استرجاع بيانات من ملف سابق</span>
            </div>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
          />

          {/* Export Excel / CSV */}
          <button
            onClick={exportItemsAsCSV}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition text-right sm:col-span-2 min-h-[56px]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <FileSpreadsheet className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="block font-bold">تصدير جدول القطع إلى Excel (CSV)</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                تنزيل ملف Excel يحتوي على كافة القطع، الأقسام، الألوان، الباركود والمقاسات
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Reset Data Option */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-xs border border-slate-200 dark:border-amber-500/20 space-y-2.5">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <RotateCcw className="h-4 w-4 text-amber-500" />
          <span>البيانات التجريبية الأولى</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          إذا كنت ترغب في استعادة القطع والأقسام التجريبية الأولى لاختبار النظام.
        </p>
        <button
          onClick={handleResetData}
          className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition min-h-[36px]"
        >
          إعادة تعيين إلى البيانات التجريبية
        </button>
      </div>

      {/* 4. System info */}
      <div className="rounded-2xl bg-slate-100 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2.5">
        <Info className="h-4.5 w-4.5 text-slate-400 shrink-0" />
        <span>
          بلال كو - نظام أرشفة وإدارة المنتجات v1.0 — تحفظ كافة البيانات محلياً على جهازك بسرعة وأمان.
        </span>
      </div>
    </div>
  );
};
