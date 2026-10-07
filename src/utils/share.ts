import { Item } from '../types';

export interface ShareDataPayload {
  title: string;
  text: string;
  url?: string;
}

/**
 * Safely converts a base64 Data URL, utf8 SVG, or fetchable URL to a File object
 */
export const urlToFile = async (url: string, filename: string): Promise<File | null> => {
  try {
    if (!url) return null;

    if (url.startsWith('data:')) {
      const commaIndex = url.indexOf(',');
      if (commaIndex === -1) return null;

      const header = url.substring(0, commaIndex);
      const data = url.substring(commaIndex + 1);

      const mimeMatch = header.match(/data:(.*?);/);
      let mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      if (header.includes('svg')) mime = 'image/svg+xml';

      let blob: Blob;
      if (header.includes('base64')) {
        const binaryStr = atob(data);
        const len = binaryStr.length;
        const u8arr = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          u8arr[i] = binaryStr.charCodeAt(i);
        }
        blob = new Blob([u8arr], { type: mime });
      } else {
        const decoded = decodeURIComponent(data);
        blob = new Blob([decoded], { type: mime });
      }

      return new File([blob], filename, { type: mime });
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
      // 1. Try sharing with multiple image files AND text
      if (files.length > 0 && navigator.canShare) {
        try {
          if (navigator.canShare({ files })) {
            await navigator.share({
              title: `قطعة: ${item.name} - بلال كو`,
              text: shareText,
              files: files,
            });
            return { success: true, method: 'native_files' };
          }
        } catch (fErr) {
          console.warn('Files + text share failed, trying files only:', fErr);
        }

        // 2. Try sharing ONLY files (works on Android Chrome / WhatsApp when text+files combination fails)
        try {
          if (navigator.canShare({ files })) {
            // Copy formatted text to clipboard so user can paste it into WhatsApp alongside images
            try {
              await navigator.clipboard.writeText(shareText);
            } catch (e) {}

            await navigator.share({
              title: `قطعة: ${item.name}`,
              files: files,
            });
            return { success: true, method: 'native_files' };
          }
        } catch (filesOnlyErr) {
          console.warn('Files-only share failed:', filesOnlyErr);
        }
      }

      // 3. Fallback Web Share text (opens Android share menu with WhatsApp, Telegram, etc.)
      await navigator.share({
        title: `قطعة: ${item.name} - بلال كو`,
        text: shareText,
      });
      return { success: true, method: 'native_text' };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User cancelled share dialog
        return { success: true, method: 'native_text' };
      }
      console.warn('Web Share API exception:', err);
    }
  }

  // Fallback 2: Copy formatted text to clipboard & open WhatsApp
  try {
    await navigator.clipboard.writeText(shareText);
    openWhatsAppShare(item, categoryName, subCategoryName);
    return { success: true, method: 'whatsapp' };
  } catch (waErr) {
    console.warn('WhatsApp direct share fallback:', waErr);
  }

  // Fallback 3: Copy formatted text to clipboard
  try {
    await navigator.clipboard.writeText(shareText);
    return { success: true, method: 'copied' };
  } catch (err) {
    console.error('Clipboard write failed:', err);
    return { success: false, method: 'copied', error: String(err) };
  }
};

/**
 * Shares ONLY the high-resolution images via native share sheet (HD quality)
 */
export const shareImagesOnly = async (item: Item): Promise<boolean> => {
  const imagesList = item.images && item.images.length > 0 ? item.images : [item.image];
  const filePromises = imagesList
    .filter(Boolean)
    .slice(0, 4)
    .map((imgUrl, index) => {
      const ext = imgUrl.includes('image/svg') ? 'svg' : 'jpg';
      return urlToFile(imgUrl, `bilal-koo-item-${item.barcode}-${index + 1}.${ext}`);
    });

  const files = (await Promise.all(filePromises)).filter((f): f is File => f !== null);

  if (files.length > 0 && typeof navigator !== 'undefined' && navigator.share) {
    try {
      if (navigator.canShare && navigator.canShare({ files })) {
        await navigator.share({
          files: files,
        });
        return true;
      }
    } catch (err) {
      console.warn('shareImagesOnly failed:', err);
    }
  }

  // Fallback: Download HD images
  for (const f of files) {
    const url = URL.createObjectURL(f);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  return false;
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
