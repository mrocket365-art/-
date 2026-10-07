import React from 'react';
import { Item, Category, SubCategory } from '../types';
import { EyeOff, Eye, Trash2, ArrowRight } from 'lucide-react';

interface HiddenItemsViewProps {
  items: Item[];
  categories: Category[];
  subCategories: SubCategory[];
  onSelectItem: (item: Item) => void;
  onToggleHideItem: (itemId: string) => void;
  onDeleteItem: (item: Item) => void;
  onBackToItems: () => void;
}

export const HiddenItemsView: React.FC<HiddenItemsViewProps> = ({
  items,
  categories,
  subCategories,
  onSelectItem,
  onToggleHideItem,
  onDeleteItem,
  onBackToItems,
}) => {
  const hiddenItems = items.filter((i) => i.isHidden);
  const categoriesMap = new Map(categories.map((c) => [c.id, c.name]));
  const subCategoriesMap = new Map(subCategories.map((sc) => [sc.id, sc.name]));

  return (
    <div className="space-y-5 pb-24 md:pb-8 dir-rtl max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToItems}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
              <EyeOff className="h-6 w-6 text-amber-500" />
              <span>القطع المخفية ({hiddenItems.length})</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              هذه القطع مخفية من العرض الرئيسي والبحث، يمكنك إعادتها للظهور في أي وقت.
            </p>
          </div>
        </div>
      </div>

      {hiddenItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 mb-3">
            <EyeOff className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">لا توجد قطع مخفية حالياً</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            عند إخفاء أي قطعة من القائمة الرئيسية، ستظهر هنا في هذا القسم.
          </p>
          <button
            onClick={onBackToItems}
            className="mt-4 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition min-h-[40px]"
          >
            العودة إلى قائمة القطع
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hiddenItems.map((item) => {
            const catName = categoriesMap.get(item.categoryId) || 'غير محدد';
            const subCatName = subCategoriesMap.get(item.subCategoryId);

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-500/20 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="p-4 flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 rounded-xl object-cover bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0 cursor-pointer"
                    onClick={() => onSelectItem(item)}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="inline-block rounded-md bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 mb-1">
                      مخفية
                    </span>
                    <h4
                      onClick={() => onSelectItem(item)}
                      className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-amber-500 cursor-pointer"
                    >
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                      {catName} {subCatName ? `· ${subCatName}` : ''}
                    </p>
                    <p className="text-xs font-mono font-bold text-slate-700 dark:text-amber-400 mt-1">
                      #{item.barcode}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 px-4 py-2.5">
                  <button
                    onClick={() => onToggleHideItem(item.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition min-h-[36px]"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-950" />
                    <span>إعادة إظهار</span>
                  </button>

                  <button
                    onClick={() => onDeleteItem(item)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/60 hover:text-red-500 transition min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="حذف نهائي"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
