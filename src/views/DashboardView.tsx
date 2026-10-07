import React from 'react';
import { Item, Category, SubCategory, ActiveTab } from '../types';
import {
  Boxes,
  FolderTree,
  EyeOff,
  PlusCircle,
  Search,
  ArrowRight,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  items: Item[];
  categories: Category[];
  subCategories: SubCategory[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectItem: (item: Item) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  items,
  categories,
  subCategories,
  setActiveTab,
  onSelectItem,
}) => {
  const activeItems = items.filter((i) => !i.isHidden);
  const hiddenItemsCount = items.filter((i) => i.isHidden).length;
  const activeCategoriesCount = categories.filter((c) => !c.isHidden).length;
  const activeSubCategoriesCount = subCategories.filter((sc) => !sc.isHidden).length;

  // 5 Most recently added active items
  const recentItems = [...activeItems]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const categoriesMap = new Map(categories.map((c) => [c.id, c.name]));
  const subCategoriesMap = new Map(subCategories.map((sc) => [sc.id, sc.name]));

  return (
    <div className="space-y-6 pb-20 md:pb-6 dir-rtl">
      {/* Welcome & Overview Banner - Bilal Koo Brand Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-950 p-6 md:p-8 text-slate-900 dark:text-white shadow-lg border border-slate-200 dark:border-amber-500/30 transition-colors">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Logo Emblem */}
            <img
              src="/logo.svg"
              alt="بلال كو Logo"
              className="h-20 w-auto object-contain shrink-0 hidden sm:block drop-shadow-md"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-black text-amber-600 dark:text-amber-400 border border-amber-500/30 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>بلال كو - Bilal Koo</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                أرشيف المنتجات والقطع
              </h1>
              <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-amber-200/90 font-bold">
                حيث السعر الحقيقي — أرشفة سريعة وبحث فوري بالاسم والباركود.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('add-item')}
              className="flex items-center gap-2 min-h-[44px] rounded-2xl bg-amber-500 px-5 py-3 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition shrink-0"
            >
              <PlusCircle className="h-5 w-5 text-slate-950" />
              <span>إضافة قطعة جديدة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <div
          onClick={() => setActiveTab('items')}
          className="cursor-pointer rounded-2xl bg-white dark:bg-slate-900/90 p-5 shadow-xs border border-slate-200 dark:border-amber-500/20 hover:border-amber-500/40 transition active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي القطع</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-400 tabular-nums">{activeItems.length}</p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">قطعة مؤرشفة في بلال كو</p>
        </div>

        {/* Categories Count */}
        <div
          onClick={() => setActiveTab('categories')}
          className="cursor-pointer rounded-2xl bg-white dark:bg-slate-900/90 p-5 shadow-xs border border-slate-200 dark:border-amber-500/20 hover:border-amber-500/40 transition active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">عدد الأقسام</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <FolderTree className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-400 tabular-nums">{activeCategoriesCount}</p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">أقسام رئيسية</p>
        </div>

        {/* Subcategories Count */}
        <div
          onClick={() => setActiveTab('categories')}
          className="cursor-pointer rounded-2xl bg-white dark:bg-slate-900/90 p-5 shadow-xs border border-slate-200 dark:border-amber-500/20 hover:border-amber-500/40 transition active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">عدد الفئات</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl md:text-3xl font-black text-slate-800 dark:text-white tabular-nums">{activeSubCategoriesCount}</p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">فئات فرعية تابعة</p>
        </div>

        {/* Hidden Items Count */}
        <div
          onClick={() => setActiveTab('hidden-items')}
          className="cursor-pointer rounded-2xl bg-white dark:bg-slate-900/90 p-5 shadow-xs border border-slate-200 dark:border-amber-500/20 hover:border-amber-500/40 transition active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">القطع المخفية</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <EyeOff className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl md:text-3xl font-black text-slate-700 dark:text-slate-300 tabular-nums">{hiddenItemsCount}</p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">قطع مخفية من العرض</p>
        </div>
      </div>

      {/* Quick Shortcuts */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 p-5 shadow-xs border border-slate-200 dark:border-amber-500/20">
        <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-3.5">اختصارات سريعة</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveTab('add-item')}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 text-slate-800 dark:text-slate-200 font-bold text-xs transition border border-slate-200 dark:border-slate-700/80 min-h-[44px]"
          >
            <PlusCircle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
            <span>إضافة قطعة جديدة</span>
          </button>

          <button
            onClick={() => setActiveTab('items')}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 text-slate-800 dark:text-slate-200 font-bold text-xs transition border border-slate-200 dark:border-slate-700/80 min-h-[44px]"
          >
            <Search className="h-4.5 w-4.5 text-amber-500 shrink-0" />
            <span>البحث عن قطعة</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 text-slate-800 dark:text-slate-200 font-bold text-xs transition border border-slate-200 dark:border-slate-700/80 min-h-[44px]"
          >
            <FolderTree className="h-4.5 w-4.5 text-amber-500 shrink-0" />
            <span>إدارة الأقسام والفئات</span>
          </button>

          <button
            onClick={() => setActiveTab('hidden-items')}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 text-slate-800 dark:text-slate-200 font-bold text-xs transition border border-slate-200 dark:border-slate-700/80 min-h-[44px]"
          >
            <EyeOff className="h-4.5 w-4.5 text-amber-500 shrink-0" />
            <span>القطع المخفية ({hiddenItemsCount})</span>
          </button>
        </div>
      </div>

      {/* Recently Added Items */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 p-5 shadow-xs border border-slate-200 dark:border-amber-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-amber-500 dark:text-amber-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">آخر القطع المضافة</h3>
          </div>
          <button
            onClick={() => setActiveTab('items')}
            className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition"
          >
            <span>عرض الجميع</span>
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          </button>
        </div>

        {recentItems.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Boxes className="mx-auto h-10 w-10 text-slate-400 mb-2" />
            <p className="text-xs">لا توجد قطع مضافة بعد.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentItems.map((item) => {
              const catName = categoriesMap.get(item.categoryId) || 'غير محدد';
              const subCatName = subCategoriesMap.get(item.subCategoryId) || '';
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 cursor-pointer transition active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-13 w-13 rounded-xl object-cover bg-slate-200 dark:bg-slate-950 shrink-0 border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                        <span className="font-bold">{catName}</span>
                        {subCatName && (
                          <span className="text-slate-500 dark:text-slate-400">· {subCatName}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-left hidden xs:block">
                    <span className="inline-block rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-2.5 py-1 text-xs font-mono font-bold">
                      #{item.barcode}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
