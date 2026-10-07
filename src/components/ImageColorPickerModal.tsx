import React, { useRef, useState, useEffect } from 'react';
import { getNearestArabicColorName } from '../utils/colorNames';
import { X, Pipette, Check, Crosshair, Sparkles } from 'lucide-react';

interface ImageColorPickerModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onSelectColor: (colorName: string, hex: string) => void;
}

export const ImageColorPickerModal: React.FC<ImageColorPickerModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onSelectColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [pickedHex, setPickedHex] = useState('#2563eb');
  const [colorName, setColorName] = useState('أزرق');
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    setIsImageLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fit canvas size to image aspect ratio
      canvas.width = img.naturalWidth || 600;
      canvas.height = img.naturalHeight || 600;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setIsImageLoaded(true);

      // Pick center pixel color by default
      const centerX = Math.floor(canvas.width / 2);
      const centerY = Math.floor(canvas.height / 2);
      pickPixelColor(centerX, centerY);
    };
  }, [isOpen, imageSrc]);

  const pickPixelColor = (canvasX: number, canvasY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
      const r = pixel[0];
      const g = pixel[1];
      const b = pixel[2];

      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      setPickedHex(hex);

      // Auto-suggest Arabic name
      const suggestedName = getNearestArabicColorName(hex);
      setColorName(suggestedName);
    } catch (err) {
      console.warn('Canvas pixel pick error:', err);
    }
  };

  const handleTouchOrClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const xInCanvas = clientX - rect.left;
    const yInCanvas = clientY - rect.top;

    // Convert display coordinates to canvas coordinates
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = Math.min(Math.max(0, Math.floor(xInCanvas * scaleX)), canvas.width - 1);
    const canvasY = Math.min(Math.max(0, Math.floor(yInCanvas * scaleY)), canvas.height - 1);

    setPointerPos({ x: xInCanvas, y: yInCanvas });
    pickPixelColor(canvasX, canvasY);
  };

  const handleConfirm = () => {
    if (colorName.trim()) {
      onSelectColor(colorName.trim(), pickedHex);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 md:p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl dir-rtl border border-amber-500/30 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-900 px-5 py-3.5 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Pipette className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm md:text-base font-bold">التقاط واختيار اللون من الصورة</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Crosshair className="h-4 w-4 text-amber-500 shrink-0" />
            <span>المس أو اسحب إصبعك فوق أي جزء من الصورة لالتقاط درسته اللونية مباشرة:</span>
          </p>

          {/* Interactive Image Canvas Box */}
          <div
            ref={containerRef}
            onClick={handleTouchOrClick}
            onMouseMove={(e) => e.buttons === 1 && handleTouchOrClick(e)}
            onTouchMove={handleTouchOrClick}
            className="relative w-full aspect-square rounded-2xl bg-slate-950 overflow-hidden cursor-crosshair border-2 border-slate-300 dark:border-slate-800 select-none shadow-inner flex items-center justify-center"
          >
            <canvas ref={canvasRef} className="w-full h-full object-contain" />

            {/* Pointer Crosshair Overlay */}
            {pointerPos && isImageLoaded && (
              <div
                className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{ left: `${pointerPos.x}px`, top: `${pointerPos.y}px` }}
              >
                {/* Outer Reticle Ring */}
                <div
                  className="h-10 w-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: pickedHex }}
                >
                  <div className="h-2 w-2 rounded-full bg-white shadow-xs" />
                </div>
              </div>
            )}

            {!isImageLoaded && (
              <div className="text-center p-4 text-slate-400 animate-pulse">
                <Pipette className="mx-auto h-8 w-8 mb-2 text-amber-400" />
                <p className="text-xs font-bold">جاري تحميل صورة القطعة...</p>
              </div>
            )}
          </div>

          {/* Selected Color Result & Custom Name Input Card */}
          <div
            className="p-3.5 rounded-2xl border space-y-3 shadow-xs transition"
            style={{ backgroundColor: pickedHex + '15', borderColor: pickedHex }}
          >
            <div className="flex items-center gap-3">
              {/* Swatch Circle */}
              <div
                className="h-12 w-12 rounded-2xl border-2 border-white dark:border-slate-900 shadow-md shrink-0"
                style={{ backgroundColor: pickedHex }}
              />

              <div className="flex-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  الدرجة اللونية الملتقطة:
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  {pickedHex.toUpperCase()}
                </span>
              </div>

              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2.5 py-1 text-[11px] font-bold border border-amber-500/30">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>الاسم المقترح</span>
              </span>
            </div>

            {/* Editable Name Field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم اللون وتفاصيله (يمكنك تعديل الاسم كما تحب):
              </label>
              <input
                type="text"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                placeholder="اسم اللون (مثل: زيتي فاتح، كحلي)..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs md:text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex gap-2 shrink-0">
          <button
            type="button"
            disabled={!colorName.trim()}
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs md:text-sm font-black text-slate-950 hover:bg-amber-400 disabled:opacity-50 transition shadow-xs"
          >
            <Check className="h-4.5 w-4.5 text-slate-950" />
            <span>حفظ وإضافة اللون للقطعة</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 dark:border-slate-700 px-5 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
