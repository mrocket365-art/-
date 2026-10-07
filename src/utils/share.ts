import { Item } from '../types';

export interface ShareDataPayload {
  title: string;
  text: string;
  url?: string;
}

/**
 * Converts a base64 Data URL or fetchable URL to a File object
 */
export const urlToFile = async (url: string, filename: string): Promise<File | null> => {
  try {
    if (!url) return null;

    if (url.startsWith('data:')) {
      const arr = url.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      let mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';

      if (mime.includes('svg')) {
        mime = 'image/svg+xml';
      }

      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } else {
      const res = await fetch(url);
      const blob = await res.blob();
      return new File([blob], filename, { type: blob.type || 'image/jpeg' });
    }
  } catch (err) {
    console.warn('Could not convert image to File for share:', err);
    return null;
  }
};

/**
 * Formats the item details into clean Arabic share text with emoji
 */
export const formatItemShareText = (
  item: Item,
  categoryName: string,
  subCategoryName?: string
): string => {
  const colorsText = item.colors && item.colors.length > 0 ? item.colors.join('، ') : 'غير محدد';
  const sizesText = item.sizes && item.sizes.length > 0 ? item.sizes.join('، ') : 'غير محدد';

  return `📦 *تفاصيل القطعة — بلال كو*
📌 *الاسم:* ${item.name}
🏷️ *القسم:* ${categoryName}${subCategoryName ? ` (${subCategoryName})` : ''}
🔢 *الباركود:* ${item.barcode}
🎨 *الألوان:* ${colorsText}
📏 *المقاسات:* ${sizesText}
${item.notes ? `📝 *ملاحظات:* ${item.notes}\n` : ''}
✨ بلال كو - حيث السعر الحقيقي`;
};

/**
 * Shares item using Web Share API including image files (for Android/WhatsApp/Telegram)
 */
export const shareItemWithImages = async (
  item: Item,
  categoryName: string,
  subCategoryName?: string
): Promise<{ success: boolean; method: 'native_files' | 'native_text' | 'whatsapp' | 'copied'; error?: string }> => {
  const shareText = formatItemShareText(item, categoryName, subCategoryName);
  const imagesList = item.images && item.images.length > 0 ? item.images : [item.image];

  // Convert images to File objects for Web Share API
  const filePromises = imagesList
    .filter(Boolean)
    .slice(0, 4) // max 4 files for maximum app compatibility
    .map((imgUrl, index) => {
      const ext = imgUrl.includes('image/svg') ? 'svg' : 'jpg';
      return urlToFile(imgUrl, `bilal-koo-item-${item.barcode}-${index + 1}.${ext}`);
    });

  const files = (await Promise.all(filePromises)).filter((f): f is File => f !== null);

  // Check Web Share API support
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      // 1. Try sharing with multiple image files
      if (files.length > 0 && navigator.canShare && navigator.canShare({ files })) {
        await navigator.share({
          title: `قطعة: ${item.name} - بلال كو`,
          text: shareText,
          files: files,
        });
        return { success: true, method: 'native_files' };
      }

      // 2. Try sharing with 1 primary image file
      if (files.length > 0 && navigator.canShare && navigator.canShare({ files: [files[0]] })) {
        await navigator.share({
          title: `قطعة: ${item.name} - بلال كو`,
          text: shareText,
          files: [files[0]],
        });
        return { success: true, method: 'native_files' };
      }

      // 3. Fallback Web Share without files
      await navigator.share({
        title: `قطعة: ${item.name} - بلال كو`,
        text: shareText,
      });
      return { success: true, method: 'native_text' };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { success: true, method: 'native_text' };
      }
      console.warn('Web Share API exception:', err);
    }
  }

  // Fallback: Copy formatted text to clipboard
  try {
    await navigator.clipboard.writeText(shareText);
    return { success: true, method: 'copied' };
  } catch (err) {
    console.error('Clipboard write failed:', err);
    return { success: false, method: 'copied', error: String(err) };
  }
};

export const shareItem = shareItemWithImages;

/**
 * Direct WhatsApp Link opener
 */
export const openWhatsAppShare = (
  item: Item,
  categoryName: string,
  subCategoryName?: string
) => {
  const text = formatItemShareText(item, categoryName, subCategoryName);
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
};

/**
 * Downloads the item primary image file to device so user can attach or save it
 */
export const downloadItemImage = async (item: Item) => {
  const imageToShare = (item.images && item.images.length > 0) ? item.images[0] : item.image;
  if (!imageToShare) return;

  const file = await urlToFile(imageToShare, `bilal-koo-${item.barcode}.jpg`);
  if (!file) return;

  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bilal-koo-${item.barcode}.jpg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
