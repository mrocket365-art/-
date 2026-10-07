import React, { useState } from 'react';
import { Item, Category, SubCategory } from '../types';
import { BarcodeSVG } from '../components/BarcodeSVG';
import { shareItem, openWhatsAppShare } from '../utils/share';
import {
  X,
  Edit,
  EyeOff,
  Eye,
  Trash2,
  Printer,
  Calendar,
  Tag,
  Palette,
  Ruler,
  FileText,
  Copy,
  Check,
  Share2,
  MessageCircle,
  Share,
} from 'lucide-react';

interface ItemDetailsModalProps {
  item: Item | null;
  categories: Category[];
  subCategories: SubCategory[];
  onClose: () => void;
  onEdit: (item: Item) => void;
  onToggleHide: (itemId: string) => void;
  onDelete: (item: Item) => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  categories,
  subCategories,
  onClose,
  onEdit,
  onToggleHide,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  if (!item) return null;

  const categoryName = categories.find((c) => c.id === item.categoryId)?.name || 'غير محدد';
  const subCategoryName = subCategories.find((sc) => sc.id === item.subCategoryId)?.name;

  // Resolve item images array
  const allImages =
    item.images && item.images.length > 0 ? item.images : [item.image];
  const activeImage = allImages[selectedImgIndex] || item.image;

  const handleCopyBarcode = () => {
    navigator.clipboard.writeText(item.barcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareNative = async () => {
    const res = await shareItem(item, categoryName, subCategoryName);
    if (res.method === 'copied') {
      setShareNotice('تم نسخ كافة تفاصيل القطعة إلى الحافظة لمشاركتها!');
      setTimeout(() => setShareNotice(null), 3000);
    }
  };

  const handleShareWhatsApp = () => {
    openWhatsAppShare(item, categoryName, subCategoryName);
  };

  const handlePrintBarcode = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <title>طباعة باركود - ${item.name}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 20px; }
            .sticker { border: 2px dashed #000; padding: 15px; display: inline-block; width: 220px; border-radius: 8px; }
            .name { font-size: 14px; font-weight: bold; margin-bottom: 5px; }
            .cat { font-size: 11px; color: #555; margin-bottom: 10px; }
            .barcode-num { font-family: monospace; font-size: 16px; font-weight: bold; margin-top: 5px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="sticker">
            <div class="name">${item.name}</div>
            <div class="cat">${categoryName} ${subCategoryName ? ' - ' + subCategoryName : ''}</div>
            <div class="barcode-num">*${item.barcode}*</div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const formattedDate = new Date(item.createdAt).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative my-6 w-full max-w-xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl dir-rtl border border-slate-200 dark:border-amber-500/30">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-900 px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <Tag className="h-4.5 w-4.5 text-amber-400" />
            <h3 className="text-base font-bold">تفاصيل القطعة — بلال كو</h3>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-5 md:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Share Toast Banner Notice */}
          {shareNotice && (
            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 p-3 rounded-2xl border border-emerald-300 dark:border-emerald-800 text-xs font-bold">
              <span>{shareNotice}</span>
              <button onClick={() => setShareNotice(null)}>
                <X className="h-4 w-4 text-emerald-600" />
              </button>
            </div>
          )}

          {/* Top Section: High-Res Image Gallery & Barcode Visual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            {/* Image Box & Multi-Image Thumbnails */}
            <div className="space-y-2">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs">
                <img src={activeImage} alt={item.name} className="h-full w-full object-cover" />
                {item.isHidden && (
                  <span className="absolute top-2.5 right-2.5 rounded-lg bg-amber-500 px-2.5 py-0.5 text-[11px] font-bold text-slate-950 shadow-xs">
                    مخفية من العرض
                  </span>
                )}
                {allImages.length > 1 && (
                  <span className="absolute bottom-2.5 left-2.5 rounded-lg bg-slate-950/80 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                    صورة {selectedImgIndex + 1} من {allImages.length}
                  </span>
                )}
              </div>

              {/* Thumbnails Row if multiple images */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImgIndex(idx)}
                      className={`relative h-14 w-14 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                        selectedImgIndex === idx
                          ? 'border-amber-500 shadow-sm scale-105'
                          : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`مصغرة ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Barcode Visual Generator & Direct Share Actions */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-3 h-full">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">رمز الباركود الرسمي</span>

              <BarcodeSVG value={item.barcode} height={55} />

              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-amber-400">
                  #{item.barcode}
                </span>
                <button
                  onClick={handleCopyBarcode}
                  className="rounded-lg bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 flex items-center gap-1 transition min-h-[32px]"
                  title="نسخ الباركود"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                </button>
              </div>

              {/* Direct Share Buttons */}
              <div className="w-full pt-1 space-y-2">
                <button
                  onClick={handleShareNative}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-800 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition min-h-[40px] border border-slate-700"
                >
                  <Share2 className="h-4 w-4 text-amber-400" />
                  <span>مشاركة بيانات القطعة</span>
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition min-h-[40px]"
                >
                  <MessageCircle className="h-4 w-4 text-white" />
                  <span>إرسال عبر WhatsApp</span>
                </button>

                <button
                  onClick={handlePrintBarcode}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-2 text-xs font-black text-slate-950 hover:bg-amber-400 transition min-h-[36px]"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-950" />
                  <span>طباعة ملصق الباركود</span>
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Info List */}
          <div className="space-y-3.5">
            {/* Name */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">اسم القطعة</span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-0.5 leading-snug">{item.name}</h2>
            </div>

            {/* Section & Subcategory */}
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 dark:bg-slate-950 p-3.5 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">القسم الرئيسي</span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{categoryName}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">الفئة الفرعية</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {subCategoryName || 'بدون فئة فرعية'}
                </span>
              </div>
            </div>

            {/* Colors & Sizes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Colors */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                  <Palette className="h-4 w-4 text-amber-500" />
                  <span>الألوان المتاحة والدرجات</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.colorDetails && item.colorDetails.length > 0 ? (
                    item.colorDetails.map((cd, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900/5 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold border shadow-2xs"
                        style={{ borderColor: cd.hex + '60' }}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full inline-block shrink-0 border border-black/20 shadow-xs"
                          style={{ backgroundColor: cd.hex }}
                        />
                        <span style={{ color: cd.hex }} className="font-black">
                          {cd.name}
                        </span>
                      </span>
                    ))
                  ) : item.colors.length === 0 ? (
                    <span className="text-xs text-slate-400">لا يوجد ألوان محددة</span>
                  ) : (
                    item.colors.map((c, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-500/20"
                      >
                        {c}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Sizes */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                  <Ruler className="h-4 w-4 text-amber-500" />
                  <span>المقاسات المتاحة</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.sizes.length === 0 ? (
                    <span className="text-xs text-slate-400">لا يوجد مقاسات محددة</span>
                  ) : (
                    item.sizes.map((s, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-500/20"
                      >
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {item.notes && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <span>ملاحظات إضافية</span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{item.notes}</p>
              </div>
            )}

            {/* Date Added */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 font-medium">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>تاريخ الإضافة تلقائياً: {formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              className="flex items-center gap-1.5 min-h-[40px] rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 shadow-xs hover:bg-amber-400 transition"
            >
              <Edit className="h-4 w-4 text-slate-950" />
              <span>تعديل</span>
            </button>

            <button
              onClick={() => {
                onToggleHide(item.id);
                onClose();
              }}
              className="flex items-center gap-1.5 min-h-[40px] rounded-xl bg-slate-200 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
            >
              {item.isHidden ? (
                <>
                  <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>إظهار القطعة</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>إخفاء</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onDelete(item);
            }}
            className="flex items-center gap-1.5 min-h-[40px] rounded-xl bg-red-50 dark:bg-red-950/50 px-4 py-2 text-xs font-bold text-red-700 dark:text-red-400 hover:bg-red-100 transition border border-red-100 dark:border-red-900"
          >
            <Trash2 className="h-4 w-4" />
            <span>حذف</span>
          </button>
        </div>
      </div>
    </div>
  );
};
