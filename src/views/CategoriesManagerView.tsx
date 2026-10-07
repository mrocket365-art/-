import React, { useState } from 'react';
import { Category, SubCategory, Item } from '../types';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronLeft,
  FolderPlus,
  Layers,
  X,
  Check,
} from 'lucide-react';

interface CategoriesManagerViewProps {
  categories: Category[];
  subCategories: SubCategory[];
  items: Item[];
  onAddCategory: (name: string) => void;
  onEditCategory: (id: string, name: string) => void;
  onToggleHideCategory: (id: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddSubCategory: (categoryId: string, name: string) => void;
  onEditSubCategory: (id: string, name: string) => void;
  onToggleHideSubCategory: (id: string) => void;
  onDeleteSubCategory: (id: string) => void;
}

export const CategoriesManagerView: React.FC<CategoriesManagerViewProps> = ({
  categories,
  subCategories,
  items,
  onAddCategory,
  onEditCategory,
  onToggleHideCategory,
  onDeleteCategory,
  onAddSubCategory,
  onEditSubCategory,
  onToggleHideSubCategory,
  onDeleteSubCategory,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  const [openCatId, setOpenCatId] = useState<string | null>(categories[0]?.id || null);

  const [newSubCatNameMap, setNewSubCatNameMap] = useState<Record<string, string>>({});
  const [editingSubCatId, setEditingSubCatId] = useState<string | null>(null);
  const [editingSubCatName, setEditingSubCatName] = useState('');

  // Handle Add Main Section
  const handleAddCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  // Handle Edit Section
  const saveCatEdit = (catId: string) => {
    if (editingCatName.trim()) {
      onEditCategory(catId, editingCatName.trim());
      setEditingCatId(null);
    }
  };

  // Handle Add SubCategory
  const handleAddSubCatSubmit = (catId: string, e: React.FormEvent) => {
    e.preventDefault();
    const name = newSubCatNameMap[catId];
    if (name && name.trim()) {
      onAddSubCategory(catId, name.trim());
      setNewSubCatNameMap({ ...newSubCatNameMap, [catId]: '' });
    }
  };

  // Handle Edit SubCategory
  const saveSubCatEdit = (subCatId: string) => {
    if (editingSubCatName.trim()) {
      onEditSubCategory(subCatId, editingSubCatName.trim());
      setEditingSubCatId(null);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 dir-rtl max-w-3xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
          <FolderTree className="h-6 w-6 text-amber-500 dark:text-amber-400" />
          <span>إدارة الأقسام والفئات — بلال كو</span>
        </h1>
        <p className="mt-1 text-xs text-amber-700 dark:text-amber-200/80 font-bold">
          أنشئ الأقسام الرئيسية (نسائي، بناتي، ولادي، أحذية، شنط، أواني...) والفئات الفرعية التابعة لها.
        </p>
      </div>

      {/* 1. Add Main Category Form */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-xs border border-slate-200 dark:border-amber-500/20">
        <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2.5 flex items-center gap-1.5">
          <FolderPlus className="h-4 w-4 text-amber-500" />
          <span>إضافة قسم رئيسي جديد</span>
        </h3>

        <form onSubmit={handleAddCatSubmit} className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="اسم القسم الرئيسي (مثل: نسائي، بناتي، أواني منزلية)..."
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs md:text-sm font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-hidden transition"
          />
          <button
            type="submit"
            disabled={!newCategoryName.trim()}
            className="flex items-center gap-1.5 min-h-[44px] rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-xs hover:bg-amber-400 disabled:opacity-50 transition shrink-0"
          >
            <Plus className="h-4 w-4 text-slate-950" />
            <span>إضافة قسم</span>
          </button>
        </form>
      </div>

      {/* 2. List of Main Categories & Subcategories */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400">الأقسام والفئات المسجلة</h3>

        {categories.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
            لا توجد أقسام حالياً.
          </div>
        ) : (
          categories.map((category) => {
            const isExpanded = openCatId === category.id;
            const categorySubCats = subCategories.filter((sc) => sc.categoryId === category.id);
            const itemCount = items.filter((i) => i.categoryId === category.id).length;

            return (
              <div
                key={category.id}
                className={`overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border transition ${
                  category.isHidden ? 'border-amber-500/30 bg-slate-50 dark:bg-slate-900/60' : 'border-slate-200 dark:border-slate-800 shadow-xs'
                }`}
              >
                {/* Section Header */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
                  {/* Title & Edit mode */}
                  <div className="flex items-center gap-2.5 flex-1">
                    <button
                      onClick={() => setOpenCatId(isExpanded ? null : category.id)}
                      className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4.5 w-4.5 text-amber-500" />
                      ) : (
                        <ChevronLeft className="h-4.5 w-4.5 text-slate-400" />
                      )}
                    </button>

                    {editingCatId === category.id ? (
                      <div className="flex items-center gap-2 flex-1 max-w-sm">
                        <input
                          type="text"
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          className="flex-1 rounded-lg border border-amber-500 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
                          autoFocus
                        />
                        <button
                          onClick={() => saveCatEdit(category.id)}
                          className="p-1.5 rounded-lg bg-emerald-600 text-white"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingCatId(null)}
                          className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{category.name}</h4>
                        <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-black text-amber-600 dark:text-amber-400 tabular-nums">
                          {itemCount} قطعة
                        </span>
                        {category.isHidden && (
                          <span className="rounded-md bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            مخفي
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCatId(category.id);
                        setEditingCatName(category.name);
                      }}
                      className="rounded-lg p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-amber-500 transition"
                      title="تعديل اسم القسم"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onToggleHideCategory(category.id)}
                      className="rounded-lg p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-amber-500 transition"
                      title={category.isHidden ? 'إظهار القسم' : 'إخفاء القسم'}
                    >
                      {category.isHidden ? (
                        <Eye className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `هل أنت متأكد من حذف قسم "${category.name}"؟ سيتم حذف الفئات التابعة له أيضاً.`
                          )
                        ) {
                          onDeleteCategory(category.id);
                        }
                      }}
                      className="rounded-lg p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/60 hover:text-red-500 transition"
                      title="حذف القسم"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Section Subcategories Drawer Body */}
                {isExpanded && (
                  <div className="p-4 md:p-5 space-y-3.5 bg-white dark:bg-slate-900">
                    {/* Add SubCategory Form */}
                    <form
                      onSubmit={(e) => handleAddSubCatSubmit(category.id, e)}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={newSubCatNameMap[category.id] || ''}
                        onChange={(e) =>
                          setNewSubCatNameMap({
                            ...newSubCatNameMap,
                            [category.id]: e.target.value,
                          })
                        }
                        placeholder={`إضافة فئة فرعية تحت ${category.name} (مثال: بلايز، فساتين)...`}
                        className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-hidden transition"
                      />
                      <button
                        type="submit"
                        disabled={!(newSubCatNameMap[category.id] || '').trim()}
                        className="flex items-center gap-1 min-h-[36px] rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-400 disabled:opacity-50 transition shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5 text-slate-950" />
                        <span>إضافة فئة</span>
                      </button>
                    </form>

                    {/* Subcategories Grid List */}
                    {categorySubCats.length === 0 ? (
                      <p className="text-xs text-slate-500 py-1 font-medium">
                        لا توجد فئات فرعية مضافة تحت قسم {category.name}.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {categorySubCats.map((subCat) => {
                          const subCatItems = items.filter(
                            (i) => i.subCategoryId === subCat.id
                          ).length;

                          return (
                            <div
                              key={subCat.id}
                              className={`flex items-center justify-between p-3 rounded-xl border transition ${
                                subCat.isHidden
                                  ? 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
                                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              {editingSubCatId === subCat.id ? (
                                <div className="flex items-center gap-1 flex-1">
                                  <input
                                    type="text"
                                    value={editingSubCatName}
                                    onChange={(e) => setEditingSubCatName(e.target.value)}
                                    className="w-full rounded-md border border-amber-500 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-900 dark:text-white"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => saveSubCatEdit(subCat.id)}
                                    className="p-1 rounded bg-emerald-600 text-white"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingSubCatId(null)}
                                    className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Layers className="h-3.5 w-3.5 text-amber-500" />
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {subCat.name}
                                  </span>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tabular-nums">
                                    ({subCatItems} قطعة)
                                  </span>
                                  {subCat.isHidden && (
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                      مخفي
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingSubCatId(subCat.id);
                                    setEditingSubCatName(subCat.name);
                                  }}
                                  className="p-1 text-slate-400 hover:text-amber-500 transition"
                                  title="تعديل الفئة"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => onToggleHideSubCategory(subCat.id)}
                                  className="p-1 text-slate-400 hover:text-amber-500 transition"
                                  title={subCat.isHidden ? 'إظهار الفئة' : 'إخفاء الفئة'}
                                >
                                  {subCat.isHidden ? (
                                    <Eye className="h-3.5 w-3.5 text-emerald-500" />
                                  ) : (
                                    <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`هل أنت متأكد من حذف فئة "${subCat.name}"؟`)) {
                                      onDeleteSubCategory(subCat.id);
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-500 transition"
                                  title="حذف الفئة"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
