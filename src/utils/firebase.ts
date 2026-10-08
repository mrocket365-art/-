import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  signInAnonymously
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Item, Category, SubCategory } from '../types';
import { compressDataUrl } from './imageCompressor';
import { saveSyncLog } from './storage';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testFirebaseConnection() {
  try {
    if (auth.currentUser) {
      await getDocFromServer(doc(db, `users/${auth.currentUser.uid}/connection/test`));
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn('Firebase connection offline or pending auth.');
    }
  }
}

// Helper auth functions
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: unknown) {
    console.warn('Google Sign-In failed or blocked, attempting anonymous auth fallback:', err);
    // If popup or Google auth fails (e.g., inside Android WebView, popup blocker, or disallowed agent), fallback to anonymous auth
    try {
      const anonResult = await signInAnonymously(auth);
      return anonResult.user;
    } catch (anonErr) {
      console.error('Both Google and Anonymous auth failed:', anonErr);
      throw err;
    }
  }
}

export async function loginAnonymously() {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (err) {
    console.error('Anonymous Sign-In Error:', err);
    throw err;
  }
}

export async function logoutFirebase() {
  await signOut(auth);
}

// Cloud Synchronization Functions
export async function uploadAllToCloud(
  userId: string,
  items: Item[],
  categories: Category[],
  subCategories: SubCategory[],
  isAutoSync = false
): Promise<{ success: boolean; itemCount: number; error?: string }> {
  try {
    let activeUid = userId || auth.currentUser?.uid;
    if (!activeUid) {
      try {
        const user = await loginAnonymously();
        activeUid = user.uid;
      } catch (e) {
        const errStr = 'غير مسجل دخول - يرجى تفعيل المزامنة أولاً';
        saveSyncLog({
          action: isAutoSync ? 'auto_sync' : 'upload',
          itemCount: 0,
          status: 'failed',
          details: errStr,
        });
        return { success: false, itemCount: 0, error: errStr };
      }
    }

    // 1. Process items and optimize base64 images so they do not exceed Firestore 1MB doc limit
    const optimizedItems: Item[] = await Promise.all(
      items.map(async (item) => {
        const itemImages = item.images || (item.image ? [item.image] : []);
        const compImgs = await Promise.all(
          itemImages.map(async (img) => {
            if (!img || !img.startsWith('data:image/')) return img;
            // Compress for cloud document storage if large (> 100KB string)
            if (img.length > 100000) {
              return await compressDataUrl(img, 800, 800, 0.7);
            }
            return img;
          })
        );

        return {
          ...item,
          image: compImgs[0] || item.image || '',
          images: compImgs,
        };
      })
    );

    // 2. Prepare chunked writes (max 50 operations per writeBatch to prevent Firestore limits)
    const BATCH_SIZE = 50;

    // Collect all write operations
    const operations: { ref: ReturnType<typeof doc>; data: Record<string, unknown> }[] = [];

    for (const item of optimizedItems) {
      operations.push({
        ref: doc(db, `users/${activeUid}/items`, item.id),
        data: { ...item, userId: activeUid },
      });
    }

    for (const cat of categories) {
      operations.push({
        ref: doc(db, `users/${activeUid}/categories`, cat.id),
        data: { ...cat, userId: activeUid },
      });
    }

    for (const subCat of subCategories) {
      operations.push({
        ref: doc(db, `users/${activeUid}/subcategories`, subCat.id),
        data: { ...subCat, userId: activeUid },
      });
    }

    // Execute in chunks
    for (let i = 0; i < operations.length; i += BATCH_SIZE) {
      const chunk = operations.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);
      for (const op of chunk) {
        batch.set(op.ref, op.data);
      }
      await batch.commit();
    }

    saveSyncLog({
      action: isAutoSync ? 'auto_sync' : 'upload',
      itemCount: items.length,
      status: 'success',
      details: `تم رفع ${items.length} قطعة بنجاح إلى Firebase`,
    });

    return { success: true, itemCount: items.length };
  } catch (err: unknown) {
    console.error('uploadAllToCloud error:', err);
    const errMsg = err instanceof Error ? err.message : String(err);

    saveSyncLog({
      action: isAutoSync ? 'auto_sync' : 'upload',
      itemCount: items.length,
      status: 'failed',
      details: errMsg,
    });

    return { success: false, itemCount: 0, error: errMsg };
  }
};

export async function downloadAllFromCloud(
  userId: string,
  isAutoSync = false
): Promise<{
  items: Item[];
  categories: Category[];
  subCategories: SubCategory[];
} | null> {
  try {
    let activeUid = userId || auth.currentUser?.uid;
    if (!activeUid) {
      try {
        const user = await loginAnonymously();
        activeUid = user.uid;
      } catch (e) {
        saveSyncLog({
          action: isAutoSync ? 'auto_sync' : 'download',
          itemCount: 0,
          status: 'failed',
          details: 'غير مسجل دخول',
        });
        return null;
      }
    }

    const itemsSnap = await getDocs(collection(db, `users/${activeUid}/items`));
    const categoriesSnap = await getDocs(collection(db, `users/${activeUid}/categories`));
    const subCategoriesSnap = await getDocs(collection(db, `users/${activeUid}/subcategories`));

    const items: Item[] = [];
    itemsSnap.forEach((doc) => {
      items.push(doc.data() as Item);
    });

    const categories: Category[] = [];
    categoriesSnap.forEach((doc) => {
      categories.push(doc.data() as Category);
    });

    const subCategories: SubCategory[] = [];
    subCategoriesSnap.forEach((doc) => {
      subCategories.push(doc.data() as SubCategory);
    });

    saveSyncLog({
      action: isAutoSync ? 'auto_sync' : 'download',
      itemCount: items.length,
      status: 'success',
      details: `تم جلب ${items.length} قطعة بنجاح من Firebase`,
    });

    return { items, categories, subCategories };
  } catch (err) {
    console.error('downloadAllFromCloud error:', err);
    const errMsg = err instanceof Error ? err.message : String(err);

    saveSyncLog({
      action: isAutoSync ? 'auto_sync' : 'download',
      itemCount: 0,
      status: 'failed',
      details: errMsg,
    });

    return null;
  }
}
