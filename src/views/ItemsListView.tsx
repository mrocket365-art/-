import React, { useState, useMemo } from 'react';
import { Item, Category, SubCategory } from '../types';
import {
  Search,
  ScanBarcode,
  X,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  PlusCircle,
  SlidersHorizontal,
  Palette,
  Ruler,
  Share2,
} from 'lucide-react';
import { shareItem } from '../utils/share';

interface ItemsListViewProps {
  items: Item[];
  categories: Category[];
  subCategories: SubCategory[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOpenScanner: () => void;
  onSelectItem: (item: Item) => void;
  onEditItem: (item: Item) => void;
  onToggleHideItem: (itemId: string) => void;
  onDeleteItem: (item: Item) => void;
  onAddNewItem: () => void;
}

export const ItemsListView: React.FC<ItemsListViewProps> = ({
  items,
  categories,
  subCategories,
  searchTerm,
  setSearchTerm,
  onOpenScanner,
  onSelectItem,
  onEditItem,
  onToggleHideItem,
  onDeleteItem,
  onAddNewItem,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [selectedSubCatId, setSelectedSubCatId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'barcode'>('newest');

  const categoriesMap = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const subCategoriesMap = useMemo(() => new Map(subCategories.map((sc) => [sc.id, sc.name])), [subCategories]);

  // Subcategories available under selected category
  const filteredSubCats = useMemo(() => {
    if (selectedCatId === 'all') return [];
    return subCategories.filter((sc) => sc.categoryId === selectedCatId && !sc.isHidden);
  }, [subCategories, selectedCatId]);

  // Filter items
  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      if (item.isHidden) return false;

      if (selectedCatId !== 'all' && item.categoryId !== selectedCatId) return false;
      if (selectedSubCatId !== 'all' && item.subCategoryId !== selectedSubCatId) return false;

      if (term) {
        const matchName = item.name.toLowerCase().includes(term);
        const matchBarcode = item.barcode.toLowerCase().includes(term);
        const matchNotes = (item.notes || '').toLowerCase().includes(term);
        const matchColors = item.colors.some((c) => c.toLowerCase().includes(term));
        const matchSizes = item.sizes.some((s) => s.toLowerCase().includes(term));

        return matchName || matchBarcode || matchNotes || matchColors || matchSizes;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ar');
      if (sortBy === 'barcode') return a.barcode.localeCompare(b.barcode);
      return 0;
    });
  }, [items, searchTerm, selectedCatId, selectedSubCatId, sortBy]);

  return (
    <div className="space-y-5 pb-24 md:pb-8 dir-rtl">
      {/* Search Header - Light / Dark Slate Accent */}
      <div className="sticky top-[61px] z-10 bg-slate-100/95 dark:bg-slate-900/95 pt-2 pb-3 backdrop-blur-md transition-colors">
        <div className="flex items-center gap-2">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم القطعة أو رقم الباركود..."
              className="w-full rounded-2xl border border-amber-500/30 bg-white dark:bg-slate-950 py-3 pr-11 pl-10 text-xs md:text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 shadow-xs focus:border-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 transition"
              autoFocus={false}
            />
            <Search className="absolute right-3.5 top-3.5 h-4.5 w-4.5 text-amber-500" />

            {/* Clear button */}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-2.5 rounded-full bg-slate-200 dark:bg-slate-800 p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                title="مسح البحث"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Barcode Scanner Button */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 min-h-[44px] rounded-2xl bg-amber-500 px-4 py-2.5 text-xs font-black text-slate-950 shadow-xs hover:bg-amber-400 active:scale-95 transition shrink-0"
            title="مسح الباركود بالكاميرا"
          >
            <ScanBarcode className="h-4.5 w-4.5 text-slate-950" />
            <span className="hidden sm:inline">مسح الباركود</span>
          </button>
        </div>

        {/* Categories Filter Pills */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => {
              setSelectedCatId('all');
              setSelectedSubCatId('all');
            }}
            className={`min-h-[36px] rounded-xl px-4 py-1.5 text-xs font-bold whitespace-nowrap transition ${
              selectedCatId === 'all'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50'
            }`}
          >
            جميع الأقسام ({items.filter((i) => !i.isHidden).length})
          </button>

          {categories
            .filter((c) => !c.isHidden)
            .map((cat) => {
              const count = items.filter((i) => !i.isHidden && i.categoryId === cat.id).length;
              const isSelected = selectedCatId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCatId(cat.id);
                    setSelectedSubCatId('all');
                  }}
                  className={`min-h-[36px] rounded-xl px-4 py-1.5 text-xs font-bold whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
        </div>

        {/* Subcategories Filter Pills */}
        {selectedCatId !== 'all' && filteredSubCats.length > 0 && (
          <div className="mt-2 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pr-1">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 shrink-0">الفئة:</span>
            <button
              onClick={() => setSelectedSubCatId('all')}
              className={`min-h-[32px] rounded-lg px-3 py-1 text-[11px] font-bold whitespace-nowrap transition ${
                selectedSubCatId === 'all'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              الكل
            </button>
            {filteredSubCats.map((sc) => {
              const isSelected = selectedSubCatId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedSubCatId(sc.id)}
                  className={`min-h-[32px] rounded-lg px-3 py-1 text-[11px] font-bold whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {sc.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* List Header Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">قائمة القطع المتاحة</h2>
          <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-black text-amber-600 dark:text-amber-400 tabular-nums">
            {filteredItems.length} قطعة
          </span>
        </div>

        {/* Sort select */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-amber-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name' | 'barcode')}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="newest">الأحدث إضافة</option>
            <option value="oldest">الأقدم إضافة</option>
            <option value="name">الاسم أبجدياً</option>
            <option value="barcode">رقم الباركود</option>
          </select>
        </div>
      </div>

      {/* Items Display Cards */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">لم نجد أي قطعة مطابقة</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            جرّب تغيير كلمة البحث أو اختيار قسم آخر، أو إضافة قطعة جديدة.
          </p>
          <button
            onClick={onAddNewItem}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-slate-950 shadow-xs hover:bg-amber-400 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>إضافة قطعة الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const catName = categoriesMap.get(item.categoryId) || 'غير محدد';
            const subCatName = subCategoriesMap.get(item.subCategoryId);

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 shadow-xs transition duration-200"
              >
                {/* Image & Header Badges */}
                <div
                  onClick={() => onSelectItem(item)}
                  className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  {/* Category Pill Badge */}
                  <div className="absolute top-2.5 right-2.5 flex flex-wrap gap-1">
                    <span className="rounded-lg bg-slate-900/90 text-amber-300 dark:bg-slate-950/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold border border-amber-500/30 shadow-xs">
                      {catName}
                    </span>
                    {subCatName && (
                      <span className="rounded-lg bg-amber-500/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-black text-slate-950 shadow-xs">
                        {subCatName}
                      </span>
                    )}
                  </div>

                  {/* Barcode Badge Overlay */}
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="rounded-lg bg-slate-900/90 dark:bg-slate-950/90 text-amber-400 backdrop-blur-xs px-2.5 py-0.5 text-xs font-mono font-bold border border-amber-500/30 shadow-xs">
                      #{item.barcode}
                    </span>
                  </div>
                </div>

                {/* Card Main Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => onSelectItem(item)}
                      className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-amber-500 cursor-pointer transition"
                    >
                      {item.name}
                    </h3>

                    {/* Colors & Sizes Chips */}
                    <div className="mt-2.5 space-y-1.5">
                      {/* Colors */}
                      {item.colors && item.colors.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Palette className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <div className="flex flex-wrap gap-1">
                            {item.colors.map((color, idx) => (
                              <span
                                key={idx}
                                className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                              >
                                {color}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sizes */}
                      {item.sizes && item.sizes.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Ruler className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <div className="flex flex-wrap gap-1">
                            {item.sizes.map((size, idx) => (
                              <span
                                key={idx}
                                className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-500/30"
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => onSelectItem(item)}
                      className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition min-h-[36px]"
                    >
                      <Eye className="h-4 w-4" />
                      <span>التفاصيل</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          shareItem(item, catName, subCatName);
                        }}
                        className="rounded-lg p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 transition"
                        title="مشاركة القطعة"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onEditItem(item)}
                        className="rounded-lg p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 transition"
                        title="تعديل"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onToggleHideItem(item.id)}
                        className="rounded-lg p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 transition"
                        title="إخفاء القطعة"
                      >
                        <EyeOff className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onDeleteItem(item)}
                        className="rounded-lg p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/60 hover:text-red-500 transition"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
