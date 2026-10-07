import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Keyboard, AlertCircle } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'barcode-reader-container';

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    // Delay initialization until modal DOM element is rendered
    const timer = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    setScannerError(null);
    try {
      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' }, // Back camera preferred for phones
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        (decodedText) => {
          if (decodedText) {
            onScan(decodedText);
            stopScanner();
            onClose();
          }
        },
        () => {
          // Ignore parse errors while scanning continuous frames
        }
      );
      setIsCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera access issue:', err);
      setIsCameraActive(false);
      setScannerError('لم نتمكن من الوصول إلى الكاميرا. يمكنك إدخال الباركود يدوياً أدناه.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsCameraActive(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl dir-rtl border border-slate-200 dark:border-amber-500/30">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-900 px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-bold">مسح الباركود بالكاميرا</h3>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Camera View Area */}
          <div className="relative overflow-hidden rounded-xl bg-slate-950 border-2 border-dashed border-slate-700 min-h-[220px] flex items-center justify-center">
            <div id={containerId} className="w-full h-full" />

            {!isCameraActive && !scannerError && (
              <div className="text-center p-4 text-slate-400">
                <Camera className="mx-auto h-10 w-10 mb-2 animate-pulse text-amber-400" />
                <p className="text-sm">جاري تشغيل الكاميرا...</p>
              </div>
            )}

            {scannerError && (
              <div className="p-4 text-center text-amber-200 bg-amber-950/60 rounded-lg mx-3 flex flex-col items-center">
                <AlertCircle className="h-8 w-8 text-amber-400 mb-2" />
                <p className="text-xs leading-relaxed">{scannerError}</p>
              </div>
            )}
          </div>

          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
            وجه كاميرا الهاتف نحو ملصق الباركود للمسح التلقائي
          </p>

          {/* Manual Input Fallback */}
          <div className="mt-5 border-t border-slate-200 dark:border-slate-800 pt-4">
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="أو أدخل رقم الباركود يدوياً..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 py-2.5 pr-9 pl-3 text-sm text-slate-900 dark:text-white focus:border-amber-500 focus:outline-hidden"
                  autoFocus
                />
                <Keyboard className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
              </div>
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-black text-slate-950 shadow-xs hover:bg-amber-400 disabled:opacity-50 transition"
              >
                بحث
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
