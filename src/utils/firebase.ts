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
  } catch (err) {
    console.error('Google Sign-In Error:', err);
    throw err;
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
  subCategories: SubCategory[]
): Promise<{ success: boolean; itemCount: number }> {
  try {
    const batch = writeBatch(db);

    // Save items
    for (const item of items) {
      const itemRef = doc(db, `users/${userId}/items`, item.id);
      batch.set(itemRef, { ...item, userId });
    }

    // Save categories
    for (const cat of categories) {
      const catRef = doc(db, `users/${userId}/categories`, cat.id);
      batch.set(catRef, { ...cat, userId });
    }

    // Save subcategories
    for (const subCat of subCategories) {
      const subRef = doc(db, `users/${userId}/subcategories`, subCat.id);
      batch.set(subRef, { ...subCat, userId });
    }

    await batch.commit();
    return { success: true, itemCount: items.length };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
    return { success: false, itemCount: 0 };
  }
}

export async function downloadAllFromCloud(
  userId: string
): Promise<{
  items: Item[];
  categories: Category[];
  subCategories: SubCategory[];
} | null> {
  try {
    const itemsSnap = await getDocs(collection(db, `users/${userId}/items`));
    const categoriesSnap = await getDocs(collection(db, `users/${userId}/categories`));
    const subCategoriesSnap = await getDocs(collection(db, `users/${userId}/subcategories`));

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

    return { items, categories, subCategories };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${userId}`);
    return null;
  }
}
