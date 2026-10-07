import { Item, Category, SubCategory } from '../types';
import { INITIAL_CATEGORIES, INITIAL_SUBCATEGORIES, INITIAL_ITEMS } from '../data/initialData';
import { compressDataUrl } from './imageCompressor';

const KEYS = {
  CATEGORIES: 'shop_archive_categories_v1',
  SUBCATEGORIES: 'shop_archive_subcategories_v1',
  ITEMS: 'shop_archive_items_v1',
};

// --- IndexedDB Persistence Layer ---
const IDB_NAME = 'BilalKooShopDB';
const IDB_VERSION = 1;
const IDB_STORE = 'items';

function getIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveItemsToIDB(items: Item[]): Promise<void> {
  try {
    const db = await getIDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.clear();
    items.forEach((item) => store.put(item));
  } catch (e) {
    console.warn('IndexedDB write warning:', e);
  }
}

export async function loadItemsFromIDB(): Promise<Item[] | null> {
  try {
    const db = await getIDB();
    const tx = db.transaction(IDB_STORE, 'readonly');
    const store = tx.objectStore(IDB_STORE);
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const res = req.result as Item[];
        resolve(res && res.length > 0 ? res : null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

// Utility to load categories from localStorage or initialize
export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(KEYS.CATEGORIES);
    if (!raw) {
      saveCategories(INITIAL_CATEGORIES);
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load categories', err);
    return INITIAL_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  try {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories', err);
  }
}

export function loadSubCategories(): SubCategory[] {
  try {
    const raw = localStorage.getItem(KEYS.SUBCATEGORIES);
    if (!raw) {
      saveSubCategories(INITIAL_SUBCATEGORIES);
      return INITIAL_SUBCATEGORIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load subcategories', err);
    return INITIAL_SUBCATEGORIES;
  }
}

export function saveSubCategories(subCategories: SubCategory[]): void {
  try {
    localStorage.setItem(KEYS.SUBCATEGORIES, JSON.stringify(subCategories));
  } catch (err) {
    console.error('Failed to save subcategories', err);
  }
}

export function loadItems(): Item[] {
  try {
    const raw = localStorage.getItem(KEYS.ITEMS);
    if (!raw) {
      return INITIAL_ITEMS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load items from localStorage', err);
    return INITIAL_ITEMS;
  }
}

export async function loadItemsAsync(): Promise<Item[]> {
  const idbItems = await loadItemsFromIDB();
  if (idbItems && idbItems.length > 0) {
    // Also keep localStorage in sync
    try {
      localStorage.setItem(KEYS.ITEMS, JSON.stringify(idbItems));
    } catch (e) {
      // Ignored if localstorage quota exceeded
    }
    return idbItems;
  }
  return loadItems();
}

export async function saveItems(items: Item[]): Promise<void> {
  // Always persist to IndexedDB asynchronously as master storage
  await saveItemsToIDB(items);

  // First try saving directly to LocalStorage
  try {
    localStorage.setItem(KEYS.ITEMS, JSON.stringify(items));
    return;
  } catch (err) {
    console.warn('LocalStorage QuotaExceededError detected in saveItems. Compressing images for localStorage cache...', err);
  }

  // Fallback 1: Compress images of all items to small JPEG thumbnails for LocalStorage cache
  try {
    const compressedItems = await Promise.all(
      items.map(async (item) => {
        const itemImages = item.images || (item.image ? [item.image] : []);
        const compImgs = await Promise.all(
          itemImages.map((img) => compressDataUrl(img, 300, 300, 0.5))
        );
        return {
          ...item,
          image: compImgs[0] || item.image,
          images: compImgs,
        };
      })
    );

    localStorage.setItem(KEYS.ITEMS, JSON.stringify(compressedItems));
    console.log('Successfully saved compressed items to LocalStorage.');
  } catch (err2) {
    console.warn('LocalStorage still full after compression. Master copy remains safe in IndexedDB.', err2);
  }
}

// Barcode duplication check
export function checkBarcodeExists(barcode: string, currentItemId?: string): boolean {
  if (!barcode || !barcode.trim()) return false;
  const items = loadItems();
  const cleanBarcode = barcode.trim().toLowerCase();
  return items.some(item => item.barcode.trim().toLowerCase() === cleanBarcode && item.id !== currentItemId);
}

// Generate unique random numeric barcode
export function generateUniqueBarcode(): string {
  const items = loadItems();
  const existingBarcodes = new Set(items.map(i => i.barcode.trim()));
  let newBarcode = '';
  do {
    // 6 to 10 digit barcode
    const randNumber = Math.floor(100000 + Math.random() * 900000);
    newBarcode = randNumber.toString();
  } while (existingBarcodes.has(newBarcode));
  return newBarcode;
}

// Reset data to initial sample
export function resetToInitialData(): { categories: Category[]; subCategories: SubCategory[]; items: Item[] } {
  saveCategories(INITIAL_CATEGORIES);
  saveSubCategories(INITIAL_SUBCATEGORIES);
  saveItems(INITIAL_ITEMS);
  return {
    categories: INITIAL_CATEGORIES,
    subCategories: INITIAL_SUBCATEGORIES,
    items: INITIAL_ITEMS,
  };
}

// Backup JSON export
export function exportDataAsJSON() {
  const data = {
    categories: loadCategories(),
    subCategories: loadSubCategories(),
    items: loadItems(),
    exportDate: new Date().toISOString(),
    version: '1.0',
  };
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `shop_archive_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Export CSV for Excel
export function exportItemsAsCSV() {
  const items = loadItems();
  const categoriesMap = new Map(loadCategories().map(c => [c.id, c.name]));
  const subCategoriesMap = new Map(loadSubCategories().map(sc => [sc.id, sc.name]));

  const headers = ['المعرف', 'الاسم', 'الباركود', 'القسم', 'الفئة', 'الألوان', 'المقاسات', 'الملاحظات', 'مخفي', 'تاريخ الإضافة'];
  const rows = items.map(item => [
    item.id,
    `"${(item.name || '').replace(/"/g, '""')}"`,
    `"${item.barcode}"`,
    `"${categoriesMap.get(item.categoryId) || ''}"`,
    `"${subCategoriesMap.get(item.subCategoryId) || ''}"`,
    `"${(item.colors || []).join(', ')}"`,
    `"${(item.sizes || []).join(', ')}"`,
    `"${(item.notes || '').replace(/"/g, '""')}"`,
    item.isHidden ? 'نعم' : 'لا',
    item.createdAt,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', url);
  downloadAnchor.setAttribute('download', `shop_items_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
