import React, { useState, useEffect } from 'react';
import { Item, Category, SubCategory, ColorDetail } from '../types';
import { checkBarcodeExists, generateUniqueBarcode } from '../utils/storage';
import { compressDataUrl, compressFileToDataUrl } from '../utils/imageCompressor';
import { getNearestArabicColorName } from '../utils/colorNames';
import { ImageColorPickerModal } from '../components/ImageColorPickerModal';
import {
  Upload,
  Camera,
  Barcode,
  Palette,
  Ruler,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  Plus,
  Pipette,
  Images,
  Trash2,
  Star,
  Check,
  Loader2,
} from 'lucide-react';

interface AddItemFormProps {
  categories: Category[];
  subCategories: SubCategory[];
  editingItem?: Item | null;
  onSave: (itemData: Omit<Item, 'id' | 'createdAt'> & { id?: string }) => void;
  onCancel: () => void;
  onAddCategory?: (name: string) => Category | void;
  onAddSubCategory?: (categoryId: string, name: string) => SubCategory | void;
}

// Preset visual color palette list for one-tap selection
const POPULAR_SHADES = [
  { name: 'أسود', hex: '#000000' },
  { name: 'أبيض', hex: '#ffffff' },
  { name: 'كحلي داكن', hex: '#1e3a8a' },
  { name: 'أحمر', hex: '#ef4444' },
  { name: 'عنابي داكن', hex: '#881337' },
  { name: 'بيج', hex: '#f5f5dc' },
  { name: 'بني', hex: '#451a03' },
  { name: 'وردي', hex: '#ec4899' },
  { name: 'أخضر زيتي', hex: '#3f6212' },
  { name: 'أخضر زمردي', hex: '#059669' },
  { name: 'أصفر خردلي', hex: '#d97706' },
  { name: 'ذهبي', hex: '#e5be58' },
  { name: 'رمادي', hex: '#475569' },
  { name: 'بنفسجي', hex: '#7c3aed' },
  { name: 'أزرق سماوي', hex: '#38bdf8' },
  { name: 'برتقالي', hex: '#f97316' },
];

export const AddItemForm: React.FC<AddItemFormProps> = ({
  categories,
  subCategories,
  editingItem,
  onSave,
  onCancel,
  onAddCategory,
  onAddSubCategory,
}) => {
  const [name, setName] = useState(editingItem?.name || '');
  const [categoryId, setCategoryId] = useState(editingItem?.categoryId || '');
  const [subCategoryId, setSubCategoryId] = useState(editingItem?.subCategoryId || '');
  const [barcode, setBarcode] = useState(editingItem?.barcode || '');

  // Multi-image state & loading state
  const [images, setImages] = useState<string[]>(() => {
    if (editingItem?.images && editingItem.images.length > 0) {
      return editingItem.images;
    }
    if (editingItem?.image) {
      return [editingItem.image];
    }
    return [];
  });
  const [isCompressingImages, setIsCompressingImages] = useState(false);

  // Color Details State
  const [colorDetails, setColorDetails] = useState<ColorDetail[]>(() => {
    if (editingItem?.colorDetails && editingItem.colorDetails.length > 0) {
      return editingItem.colorDetails;
    }
    if (editingItem?.colors) {
      return editingItem.colors.map((c) => ({ name: c, hex: '#e5be58' }));
    }
    return [];
  });

  const [sizes, setSizes] = useState<string[]>(editingItem?.sizes || []);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [notes, setNotes] = useState(editingItem?.notes || '');

  const [barcodeWarning, setBarcodeWarning] = useState<string | null>(null);

  // Color Picker State
  const [colorModalHex, setColorModalHex] = useState('#2563eb');
  const [colorModalName, setColorModalName] = useState('أزرق');
  const [showImageColorPickerModal, setShowImageColorPickerModal] = useState(false);

  // Quick Add Category/Subcategory Modals
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatNameInput, setNewCatNameMapInput] = useState('');

  const [showAddSubCatModal, setShowAddSubCatModal] = useState(false);
  const [newSubCatNameInput, setNewSubCatNameInput] = useState('');

  // Set default category
  useEffect(() => {
    if (!editingItem && categories.length > 0 && !categoryId) {
      const firstActive = categories.find((c) => !c.isHidden) || categories[0];
      setCategoryId(firstActive.id);
    }
  }, [categories, categoryId, editingItem]);

  // Update subcategories when category changes
  const availableSubCats = subCategories.filter(
    (sc) => sc.categoryId === categoryId && !sc.isHidden
  );

  useEffect(() => {
    if (availableSubCats.length > 0 && !editingItem) {
      if (!availableSubCats.some((sc) => sc.id === subCategoryId)) {
        setSubCategoryId(availableSubCats[0].id);
      }
    }
  }, [categoryId, availableSubCats]);

  // Auto-generate barcode if empty on new item
  useEffect(() => {
    if (!editingItem && !barcode) {
      setBarcode(generateUniqueBarcode());
    }
  }, [editingItem]);

  // Validate barcode uniqueness
  useEffect(() => {
    if (barcode.trim()) {
      const isDuplicate = checkBarcodeExists(barcode.trim(), editingItem?.id);
      if (isDuplicate) {
        setBarcodeWarning('تنبيه: رقم الباركود هذا مستخدم بالفعل لقطعة أخرى في النظام!');
      } else {
        setBarcodeWarning(null);
      }
    } else {
      setBarcodeWarning('يرجى إدخال رقم باركود فريد للقطعة.');
    }
  }, [barcode, editingItem]);

  // Multi-image upload handler using fast canvas compressor
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsCompressingImages(true);
      const compressedList: string[] = [];
      for (const file of Array.from(files)) {
        try {
          // Directly compress File object to HD resolution (max 1600px, quality 0.85) for crisp WhatsApp sharing
          const compressed = await compressFileToDataUrl(file, 1600, 1600, 0.85);
          if (compressed) {
            compressedList.push(compressed);
          }
        } catch (err) {
          console.error('Failed to compress file:', err);
        }
      }
      if (compressedList.length > 0) {
        setImages((prev) => [...prev, ...compressedList]);
      }
      setIsCompressingImages(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const setCoverImage = (indexToCover: number) => {
    if (indexToCover === 0) return;
    const selected = images[indexToCover];
    const remaining = images.filter((_, idx) => idx !== indexToCover);
    setImages([selected, ...remaining]);
  };

  // Color detail management
  const handleAddColorDetail = (nameToAdd: string, hexToAdd: string) => {
    const cleanName = nameToAdd.trim();
    if (!cleanName) return;

    if (!colorDetails.some((cd) => cd.name === cleanName)) {
      setColorDetails([...colorDetails, { name: cleanName, hex: hexToAdd }]);
    }
  };

  const removeColorDetail = (nameToRemove: string) => {
    setColorDetails(colorDetails.filter((cd) => cd.name !== nameToRemove));
  };

  // Update color hex and auto-suggest Arabic color name
  const handleColorHexChange = (newHex: string) => {
    setColorModalHex(newHex);
    const suggestedName = getNearestArabicColorName(newHex);
    setColorModalName(suggestedName);
  };

  // EyeDropper API & Image Screen Color Picker
  const handleEyeDropper = async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          handleColorHexChange(result.sRGBHex);
          return;
        }
      } catch (err) {
        console.log('EyeDropper closed or fallback to photo picker');
      }
    }

    if (images.length > 0) {
      setShowImageColorPickerModal(true);
    } else {
      alert('يرجى إضافة صورة للقطعة أولاً للتمكن من التقاط الألوان منها باللمس المباشر.');
    }
  };

  // Size management
  const addSize = (sizeToAdd: string) => {
    if (sizeToAdd.trim() && !sizes.includes(sizeToAdd.trim())) {
      setSizes([...sizes, sizeToAdd.trim()]);
      setNewSizeInput('');
    }
  };

  const removeSize = (sizeToRemove: string) => {
    setSizes(sizes.filter((s) => s !== sizeToRemove));
  };

  const handleGenerateBarcode = () => {
    const generated = generateUniqueBarcode();
    setBarcode(generated);
  };

  // Quick Category creation
  const handleQuickSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameInput.trim()) return;

    if (onAddCategory) {
      const created = onAddCategory(newCatNameInput.trim());
      if (created && created.id) {
        setCategoryId(created.id);
      }
    }
    setNewCatNameMapInput('');
    setShowAddCatModal(false);
  };

  // Quick SubCategory creation
  const handleQuickSaveSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCatNameInput.trim() || !categoryId) return;

    if (onAddSubCategory) {
      const created = onAddSubCategory(categoryId, newSubCatNameInput.trim());
      if (created && created.id) {
        setSubCategoryId(created.id);
      }
    }
    setNewSubCatNameInput('');
    setShowAddSubCatModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('يرجى كتابة اسم القطعة');
      return;
    }

    if (!categoryId) {
      alert('يرجى اختيار القسم');
      return;
    }

    if (!barcode.trim()) {
      alert('يرجى أدخال رقم الباركود');
      return;
    }

    if (barcodeWarning) {
      alert(barcodeWarning);
      return;
    }

    // Default image if none uploaded
    const defaultImage = `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#e5be58" rx="20"/><text x="50%" y="50%" fill="#0f172a" font-size="28" font-family="Cairo, sans-serif" font-weight="900" text-anchor="middle" dominant-baseline="middle">${encodeURIComponent(
        name
      )}</text></svg>`
    )}`;

    const rawImages = images.length > 0 ? images : [defaultImage];
    const finalImages = await Promise.all(
      rawImages.map((img) => compressDataUrl(img, 600, 600, 0.65))
    );
    const primaryImage = finalImages[0];
    const colorsList = colorDetails.map((cd) => cd.name);

    onSave({
      id: editingItem?.id,
      name: name.trim(),
      categoryId,
      subCategoryId,
      barcode: barcode.trim(),
      colors: colorsList,
      colorDetails,
      sizes,
      image: primaryImage,
      images: finalImages,
      notes: notes.trim(),
      isHidden: editingItem?.isHidden || false,
    });
  };

  const PRESET_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '38', '40', '42', '44', 'أحجام أخرى'];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-8 dir-rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {editingItem ? 'تعديل بيانات القطعة' : 'إضافة قطعة جديدة — بلال كو'}
            </h1>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">حيث السعر الحقيقي</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Multi-Image Upload Section */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-xs border border-slate-200 dark:border-amber-500/20 space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Images className="h-4.5 w-4.5 text-amber-500" />
              <span>صور القطعة (يمكنك اختيار عدة صور معاً)</span> <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {images.length} صور مضافة
            </span>
          </div>

          {/* Loading Indicator when compressing */}
          {isCompressingImages && (
            <div className="flex items-center justify-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              <span>جاري ضغط ومعالجة الصور المحددة لضمان السرعة...</span>
            </div>
          )}

          {/* Images Gallery Display */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((imgUrl, index) => (
              <div
                key={index}
                className="group relative aspect-square rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
              >
                <img
                  src={imgUrl}
                  alt={`صورة ${index + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback for broken image
                    (e.target as HTMLImageElement).src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23334155"/><text x="50%" y="50%" fill="%23ffffff" font-size="14" text-anchor="middle" dominant-baseline="middle">صورة ${index + 1}</text></svg>`;
                  }}
                />

                {/* Primary Cover Badge */}
                {index === 0 ? (
                  <span className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded-lg bg-amber-500 px-2 py-0.5 text-[9px] font-black text-slate-950 shadow-xs">
                    <Star className="h-3 w-3 fill-slate-950" />
                    <span>الغلاف الرئيسي</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCoverImage(index)}
                    className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 rounded-lg bg-slate-900/90 px-2 py-0.5 text-[9px] font-bold text-amber-300 transition"
                  >
                    اجعلها الغلاف
                  </button>
                )}

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute bottom-1.5 left-1.5 rounded-full bg-slate-950/80 p-1.5 text-white hover:bg-red-600 transition"
                  title="حذف الصورة"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {/* Add More Images Box */}
            <label className="flex flex-col items-center justify-center aspect-square rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition p-2 text-center">
              <Upload className="h-6 w-6 text-amber-500 mb-1" />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                + إضافة صور
              </span>
              <span className="text-[9px] text-slate-400">اختر عدة صور</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleMultipleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            💡 يتم تحسين وضغط الصور تلقائياً للحفاظ على مساحة الهاتف وسرعة التطبيق.
          </p>
        </div>

        {/* 2. Basic Info */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-xs border border-slate-200 dark:border-amber-500/20 space-y-4">
          <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 border-b border-slate-200 dark:border-slate-800 pb-2">
            المعلومات الأساسية
          </h3>

          {/* Item Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              اسم القطعة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: فستان نسائي مع كوت شاش"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-xs md:text-sm font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-hidden transition"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  القسم الرئيسي <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(true)}
                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ قسم جديد</span>
                </button>
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-xs md:text-sm font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-hidden transition"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} {cat.isHidden ? '(مخفي)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">الفئة الفرعية</label>
                {categoryId && (
                  <button
                    type="button"
                    onClick={() => setShowAddSubCatModal(true)}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ فئة جديدة</span>
                  </button>
                )}
              </div>
              <select
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-xs md:text-sm font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-hidden transition"
              >
                <option value="">-- بدون فئة فرعية --</option>
                {availableSubCats.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3. Barcode Input */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-xs border border-slate-200 dark:border-amber-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Barcode className="h-4.5 w-4.5 text-amber-500" />
              <span>رقم الباركود</span> <span className="text-red-500">*</span>
            </label>

            <button
              type="button"
              onClick={handleGenerateBarcode}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 px-2.5 py-1 rounded-lg transition border border-amber-500/30"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>توليد باركود تلقائي</span>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="أدخل رقم الباركود..."
              className={`w-full rounded-xl border ${
                barcodeWarning
                  ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-200'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-amber-400'
              } px-4 py-3 text-sm font-mono font-bold focus:border-amber-500 focus:outline-hidden transition`}
              required
            />
          </div>

          {barcodeWarning ? (
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/60 p-3 rounded-xl border border-red-200 dark:border-red-800">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{barcodeWarning}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>رقم الباركود متوفر ومستعد للحفظ</span>
            </div>
          )}
        </div>

        {/* 4. Enhanced Sleek Color Selection Section */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-xs border border-slate-200 dark:border-amber-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Palette className="h-4.5 w-4.5 text-amber-500" />
              <span>ألوان القطعة وتحديد الدرجات اللونية</span>
            </label>

            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {colorDetails.length} ألوان مضافة
            </span>
          </div>

          {/* Selected Colors Chips with Swatches */}
          <div className="flex flex-wrap gap-2 min-h-[38px]">
            {colorDetails.length === 0 ? (
              <span className="text-xs text-slate-500 font-medium self-center">لم تقم بإضافة ألوان بعد</span>
            ) : (
              colorDetails.map((cd, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold border shadow-2xs"
                  style={{ borderColor: cd.hex + '60' }}
                >
                  <span
                    className="h-4 w-4 rounded-full inline-block border border-black/20 shrink-0"
                    style={{ backgroundColor: cd.hex }}
                  />
                  <span style={{ color: cd.hex }} className="font-black">{cd.name}</span>
                  <button
                    type="button"
                    onClick={() => removeColorDetail(cd.name)}
                    className="rounded-full p-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    <X className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* A) Quick One-Tap Popular Colors Grid */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
              1. اختر الألوان السريعة بنقرة واحدة:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {POPULAR_SHADES.map((shade) => {
                const isSelected = colorDetails.some((cd) => cd.name === shade.name);
                return (
                  <button
                    key={shade.name}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        removeColorDetail(shade.name);
                      } else {
                        handleAddColorDetail(shade.name, shade.hex);
                      }
                    }}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold border transition active:scale-95 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 ring-1 ring-amber-500'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-4 w-4 rounded-full border border-black/20 shrink-0 shadow-2xs"
                        style={{ backgroundColor: shade.hex }}
                      />
                      <span>{shade.name}</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* B) Custom Color Picker with Auto-Name Generation */}
          <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                2. أو حدد أي درجة لونية مخصصة بالدائرة أو من صورة القطعة:
              </span>

              {images.length > 0 && (
                <button
                  type="button"
                  onClick={handleEyeDropper}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-500/30 transition"
                >
                  <Pipette className="h-3.5 w-3.5" />
                  <span>التقاط من صورة القطعة</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Visual Color Circle Picker */}
              <div className="relative shrink-0 flex items-center" title="اختر درجة اللون">
                <input
                  type="color"
                  value={colorModalHex}
                  onChange={(e) => handleColorHexChange(e.target.value)}
                  className="h-12 w-12 cursor-pointer rounded-xl border-2 border-amber-500 bg-slate-50 dark:bg-slate-950 p-1 transition hover:scale-105"
                />
              </div>

              {/* Text Input for Color Name */}
              <input
                type="text"
                value={colorModalName}
                onChange={(e) => setColorModalName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (colorModalName.trim()) {
                      handleAddColorDetail(colorModalName, colorModalHex);
                    }
                  }
                }}
                placeholder="اسم اللون (مثل: زيتي فاتح)..."
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-3 text-xs md:text-sm font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-hidden min-h-[48px]"
              />

              {/* Add Color Button */}
              <button
                type="button"
                disabled={!colorModalName.trim()}
                onClick={() => handleAddColorDetail(colorModalName, colorModalHex)}
                className="rounded-xl bg-amber-500 hover:bg-amber-400 px-4 text-xs font-black text-slate-950 disabled:opacity-50 transition min-h-[48px] shrink-0 active:scale-95 shadow-2xs"
              >
                + إضافة هذا اللون
              </button>
            </div>
          </div>
        </div>

        {/* 5. Sizes Management */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-xs border border-slate-200 dark:border-amber-500/20 space-y-3">
          <label className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Ruler className="h-4.5 w-4.5 text-amber-500" />
            <span>المقاسات المتاحة للقطعة</span>
          </label>

          {/* Preset size chips */}
          <div className="flex flex-wrap gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 self-center ml-1">
              سريعة:
            </span>
            {PRESET_SIZES.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => addSize(sz)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold border transition ${
                  sizes.includes(sz)
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                + {sz}
              </button>
            ))}
          </div>

          {/* Selected Sizes */}
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            {sizes.length === 0 ? (
              <span className="text-xs text-slate-500 font-medium">لم تقم بإضافة مقاسات بعد</span>
            ) : (
              sizes.map((sz, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-500/30"
                >
                  <span>{sz}</span>
                  <button
                    type="button"
                    onClick={() => removeSize(sz)}
                    className="rounded-full p-0.5 hover:bg-amber-500/20 transition"
                  >
                    <X className="h-3 w-3 text-amber-500" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Custom Size Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSizeInput}
              onChange={(e) => setNewSizeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSize(newSizeInput);
                }
              }}
              placeholder="إدخال مقاس يدوي آخر (مثل 40، L، 12 سنة)..."
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => addSize(newSizeInput)}
              className="rounded-xl bg-slate-800 text-white px-4 py-2 text-xs font-bold hover:bg-slate-700 transition min-h-[36px]"
            >
              إضافة مقاس
            </button>
          </div>
        </div>

        {/* 6. Notes */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-xs border border-slate-200 dark:border-amber-500/20">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">ملاحظات إضافية</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="اكتب أي ملاحظات إضافية عن القطعة (موقع التخزين، تفاصيل القماش...)"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3.5 text-xs font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-hidden transition"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={!!barcodeWarning || isCompressingImages}
            className="flex-1 flex items-center justify-center gap-2 min-h-[48px] rounded-2xl bg-amber-500 py-3.5 text-xs md:text-sm font-black text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 active:scale-95 disabled:opacity-50 transition"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>{editingItem ? 'حفظ التعديلات' : 'حفظ وأرشفة القطعة في بلال كو'}</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="min-h-[48px] rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-6 py-3.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            إلغاء
          </button>
        </div>
      </form>

      {/* Image Touch Color Picker Modal */}
      {showImageColorPickerModal && images.length > 0 && (
        <ImageColorPickerModal
          isOpen={showImageColorPickerModal}
          imageSrc={images[0]}
          onClose={() => setShowImageColorPickerModal(false)}
          onSelectColor={(colorName, hex) => handleAddColorDetail(colorName, hex)}
        />
      )}

      {/* Quick Add Category Modal */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl dir-rtl border border-amber-500/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">إضافة قسم رئيسي جديد</h3>
              <button
                type="button"
                onClick={() => setShowAddCatModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleQuickSaveCategory} className="space-y-3">
              <input
                type="text"
                value={newCatNameInput}
                onChange={(e) => setNewCatNameMapInput(e.target.value)}
                placeholder="اسم القسم الجديد (مثال: أثاث، إكسسوارات)..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!newCatNameInput.trim()}
                  className="flex-1 rounded-xl bg-amber-500 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 disabled:opacity-50"
                >
                  إضافة واختيار
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add SubCategory Modal */}
      {showAddSubCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl dir-rtl border border-amber-500/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                إضافة فئة فرعية جديدة تحت قسم {categories.find((c) => c.id === categoryId)?.name}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddSubCatModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleQuickSaveSubCategory} className="space-y-3">
              <input
                type="text"
                value={newSubCatNameInput}
                onChange={(e) => setNewSubCatNameInput(e.target.value)}
                placeholder="اسم الفئة الفرعية..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!newSubCatNameInput.trim()}
                  className="flex-1 rounded-xl bg-amber-500 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 disabled:opacity-50"
                >
                  إضافة واختيار
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSubCatModal(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
