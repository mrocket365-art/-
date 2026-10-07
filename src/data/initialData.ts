import { Category, SubCategory, Item } from '../types';

// Clean SVG placeholders for demo items
const createSvgImage = (title: string, color1: string, color2: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}" />
        <stop offset="100%" stop-color="${color2}" />
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#g)" rx="20"/>
    <circle cx="200" cy="180" r="80" fill="#ffffff" opacity="0.15" />
    <path d="M160 180 L200 140 L240 180 M200 140 L200 240" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.8"/>
    <text x="50%" y="320" font-family="Tajawal, sans-serif" font-size="24" font-weight="bold" fill="#ffffff" text-anchor="middle" direction="rtl">${title}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'نسائي', isHidden: false, createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: 'cat-2', name: 'بناتي', isHidden: false, createdAt: new Date(Date.now() - 25 * 86400000).toISOString() },
  { id: 'cat-3', name: 'ولادي', isHidden: false, createdAt: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: 'cat-4', name: 'أحذية', isHidden: false, createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: 'cat-5', name: 'شنط', isHidden: false, createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'cat-6', name: 'أواني منزلية', isHidden: false, createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
];

export const INITIAL_SUBCATEGORIES: SubCategory[] = [
  // نسائي
  { id: 'sub-101', categoryId: 'cat-1', name: 'بلايز', isHidden: false, createdAt: new Date().toISOString() },
  { id: 'sub-102', categoryId: 'cat-1', name: 'بناطيل', isHidden: false, createdAt: new Date().toISOString() },
  { id: 'sub-103', categoryId: 'cat-1', name: 'فساتين', isHidden: false, createdAt: new Date().toISOString() },
  { id: 'sub-104', categoryId: 'cat-1', name: 'أطقم', isHidden: false, createdAt: new Date().toISOString() },
  { id: 'sub-105', categoryId: 'cat-1', name: 'جاكيتات', isHidden: false, createdAt: new Date().toISOString() },

  // بناتي
  { id: 'sub-201', categoryId: 'cat-2', name: 'فساتين صيفية', isHidden: false, createdAt: new Date().toISOString() },
  { id: 'sub-202', categoryId: 'cat-2', name: 'تنورات', isHidden: false, createdAt: new Date().toISOString() },

  // ولادي
  { id: 'sub-301', categoryId: 'cat-3', name: 'قمصان', isHidden: false, createdAt: new Date().toISOString() },
  { id: 'sub-302', categoryId: 'cat-3', name: 'ترنجات', isHidden: false, createdAt: new Date().toISOString() },

  // أحذية
  { id: 'sub-401', categoryId: 'cat-4', name: 'أحذية رياضية', isHidden: false, createdAt: new Date().toISOString() },
  { id: 'sub-402', categoryId: 'cat-4', name: 'كعب عالي', isHidden: false, createdAt: new Date().toISOString() },

  // شنط
  { id: 'sub-501', categoryId: 'cat-5', name: 'حقائب يد', isHidden: false, createdAt: new Date().toISOString() },

  // أواني منزلية
  { id: 'sub-601', categoryId: 'cat-6', name: 'أطقم ضيافة', isHidden: false, createdAt: new Date().toISOString() },
];

export const INITIAL_ITEMS: Item[] = [
  {
    id: 'item-100001',
    name: 'بلوزة حريرية نسائية راقية',
    categoryId: 'cat-1',
    subCategoryId: 'sub-101',
    barcode: '100001',
    colors: ['أسود', 'أبيض', 'بيج'],
    sizes: ['M', 'L', 'XL'],
    image: createSvgImage('بلوزة حريرية', '#3b82f6', '#1d4ed8'),
    notes: 'قماش حريري فاخر يناسب السهرات والعمل الرسمية.',
    isHidden: false,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'item-100002',
    name: 'بنطال جينز كاجوال مطاطي',
    categoryId: 'cat-1',
    subCategoryId: 'sub-102',
    barcode: '100002',
    colors: ['أزرق غامق', 'أسود'],
    sizes: ['28', '30', '32', '34'],
    image: createSvgImage('بنطال جينز', '#0284c7', '#0f172a'),
    notes: 'قماش جينز مريح للارتداء اليومي.',
    isHidden: false,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'item-100003',
    name: 'فستان سهرة مطرز بالخرز',
    categoryId: 'cat-1',
    subCategoryId: 'sub-103',
    barcode: '100003',
    colors: ['كحلي', 'عنابي', 'ذهبي'],
    sizes: ['S', 'M', 'L'],
    image: createSvgImage('فستان سهرة', '#ec4899', '#831843'),
    notes: 'تطريز يدوي على الصدر والخصر مع بطانة ناعمة.',
    isHidden: false,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'item-100004',
    name: 'حذاء رياضي مريح للجري',
    categoryId: 'cat-4',
    subCategoryId: 'sub-401',
    barcode: '100004',
    colors: ['أبيض', 'رمادي', 'كحلي'],
    sizes: ['38', '39', '40', '41', '42'],
    image: createSvgImage('حذاء رياضي', '#10b981', '#065f46'),
    notes: 'نعل طبي ممتص للصدمات ومناسب للمشي الطويل.',
    isHidden: false,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'item-100005',
    name: 'حقيبة يد جلدية أصلية',
    categoryId: 'cat-5',
    subCategoryId: 'sub-501',
    barcode: '100005',
    colors: ['بني', 'أسود', 'هافان'],
    sizes: ['حجم متوسط'],
    image: createSvgImage('حقيبة جلدية', '#854d0e', '#3f2c06'),
    notes: 'جلد طبيعي فاخر مع سير إضافي للكتف.',
    isHidden: false,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'item-100006',
    name: 'طقم فنجان قهوة مذهب 12 قطعة',
    categoryId: 'cat-6',
    subCategoryId: 'sub-601',
    barcode: '100006',
    colors: ['ذهبي', 'فضي'],
    sizes: ['طقم كامل'],
    image: createSvgImage('طقم فنجان قهوة', '#eab308', '#713f12'),
    notes: 'بورسلين عالي الجودة مع حواف مذهبة 24 قيراط.',
    isHidden: false,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'item-100007',
    name: 'قميص ولادي رسمي مخطط',
    categoryId: 'cat-3',
    subCategoryId: 'sub-301',
    barcode: '100007',
    colors: ['أزرق فاتح', 'أبيض'],
    sizes: ['6 سنوات', '8 سنوات', '10 سنوات'],
    image: createSvgImage('قميص ولادي', '#6366f1', '#312e81'),
    notes: 'قطن 100% مناسب للمناسبات والأعياد.',
    isHidden: false,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];
