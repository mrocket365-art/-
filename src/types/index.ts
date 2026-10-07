export interface Category {
  id: string;
  name: string;
  isHidden: boolean;
  createdAt: string;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  isHidden: boolean;
  createdAt: string;
}

export interface ColorDetail {
  name: string;
  hex: string;
}

export interface Item {
  id: string;
  name: string;
  categoryId: string;
  subCategoryId: string;
  barcode: string;
  colors: string[];
  colorDetails?: ColorDetail[];
  sizes: string[];
  image: string; // Primary image / cover
  images?: string[]; // Multiple images array
  notes: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type ActiveTab = 'dashboard' | 'items' | 'add-item' | 'categories' | 'hidden-items' | 'settings';
