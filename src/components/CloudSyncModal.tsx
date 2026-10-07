import React, { useState, useEffect } from 'react';
import {
  auth,
  loginWithGoogle,
  loginAnonymously,
  logoutFirebase,
  uploadAllToCloud,
  downloadAllFromCloud
} from '../utils/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { loadCategories, loadSubCategories, saveCategories, saveSubCategories, saveItems, loadItemsAsync } from '../utils/storage';
import { Item, Category, SubCategory } from '../types';
import {
  Cloud,
  CloudUpload,
  CloudDownload,
  LogOut,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  UserCheck,
  LogIn
} from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const user = await loginWithGoogle();
      setStatusMessage({ type: 'success', text: `أهلاً بك ${user.displayName || user.email}! تم ربط الحساب السحابي بنجاح.` });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'فشل تسجيل الدخول باستخدام Google.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      await loginAnonymously();
      setStatusMessage({ type: 'success', text: 'تم تسجيل الدخول السحابي المؤقت بنجاح.' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'فشل تفعيل الحساب السحابي.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logoutFirebase();
      setStatusMessage({ type: 'info', text: 'تم تسجيل الخروج من المزامنة السحابية.' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadToCloud = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'جاري رفع البيانات إلى التخزين السحابي...' });

    try {
      const categories = loadCategories();
      const subCategories = loadSubCategories();
      const items = await loadItemsAsync();

      const result = await uploadAllToCloud(currentUser.uid, items, categories, subCategories);
      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: `تم رفع ${result.itemCount} قطعة بنجاح إلى حسابك السحابي! يمكنك الآن فتحها من أي جهاز آخر.`
        });
        onSyncComplete();
      } else {
        setStatusMessage({ type: 'error', text: 'فشل رفع البيانات إلى السحاب.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'حدث خطأ أثناء الرفع.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadFromCloud = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'جاري استعادة البيانات من السحاب...' });

    try {
      const data = await downloadAllFromCloud(currentUser.uid);
      if (data) {
        if (data.categories && data.categories.length > 0) saveCategories(data.categories);
        if (data.subCategories && data.subCategories.length > 0) saveSubCategories(data.subCategories);
        if (data.items && data.items.length > 0) await saveItems(data.items);

        setStatusMessage({
          type: 'success',
          text: `تم استعادة ${data.items.length} قطعة بنجاح وتحديث الهاتف بها!`
        });
        onSyncComplete();
      } else {
        setStatusMessage({ type: 'error', text: 'لم يتم العثور على بيانات سابقة في حسابك السحابي.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'حدث خطأ أثناء تنزيل البيانات.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl dir-rtl border border-slate-200 dark:border-amber-500/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-900 px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-bold">التخزين السحابي والمزامنة (اختياري)</h3>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Informational Banner */}
          <div className="flex items-start gap-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-4 border border-amber-200 dark:border-amber-800/60 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
            <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">تخزين محلي أولاً — والسحابي اختياري:</span>
              يعمل تطبيق بلال كو محلياً بدون إنترنت أوفلاين. يتيح لك هذا الخيار اختيارياً رفع بياناتك للسحاب لفتحها من أي جهاز آخر في أي وقت!
            </div>
          </div>

          {/* Status Alert if available */}
          {statusMessage && (
            <div
              className={`flex items-center gap-2.5 p-3.5 rounded-2xl border text-xs font-bold ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                  : statusMessage.type === 'error'
                  ? 'bg-red-50 dark:bg-red-950/80 text-red-800 dark:text-red-200 border-red-300 dark:border-red-800'
                  : 'bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Account Status / Login options */}
          {currentUser ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm">
                    {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {currentUser.displayName || 'حساب سحابي مرتبط'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {currentUser.email || 'تسجيل دخول متصل'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>خروج</span>
                </button>
              </div>

              {/* Action Buttons for Cloud Sync */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleUploadToCloud}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 p-4 text-xs font-black text-slate-950 shadow-sm transition min-h-[50px] disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4.5 w-4.5" />}
                  <span>رفع البيانات الحالية للسحاب</span>
                </button>

                <button
                  onClick={handleDownloadFromCloud}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white p-4 text-xs font-bold border border-slate-700 transition min-h-[50px] disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudDownload className="h-4.5 w-4.5 text-amber-400" />}
                  <span>استعادة البيانات من السحاب</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                اختر طريقة تفعيل المزامنة السحابية:
              </span>

              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition min-h-[48px] shadow-xs"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>تسجيل الدخول مع Google بضغطة زر</span>
                  </>
                )}
              </button>

              <button
                onClick={handleAnonymousSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 p-3.5 text-xs font-black text-slate-950 transition min-h-[48px]"
              >
                <LogIn className="h-4 w-4" />
                <span>تفعيل المزامنة السحابية الفورية (مباشرة)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
