import { Item } from '../types';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

export interface ShareDataPayload {
  title: string;
  text: string;
  url?: string;
}

/**
 * Safely converts a base64 Data URL, utf8 SVG, or fetchable URL to a Blob object
 */
export const urlToBlob = async (url: string): Promise<Blob | null> => {
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

      if (header.includes('base64')) {
        const binaryStr = atob(data);
        const len = binaryStr.length;
        const u8arr = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          u8arr[i] = binaryStr.charCodeAt(i);
        }
        return new Blob([u8arr], { type: mime });
      } else {
        const decoded = decodeURIComponent(data);
        return new Blob([decoded], { type: mime });
      }
    } else {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
      return await res.blob();
    }
  } catch (err) {
    console.warn('Could not convert image URL to Blob:', err);
    return null;
  }
};

/**
 * Safely converts a base64 Data URL, utf8 SVG, or fetchable URL to a File object via Blob
 */
export const urlToFile = async (url: string, filename: string): Promise<File | null> => {
  try {
    const blob = await urlToBlob(url);
    if (!blob) return null;
    const mimeType = blob.type || (filename.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg');
    return new File([blob], filename, { type: mimeType, lastModified: Date.now() });
  } catch (err) {
    console.warn('Could not convert image Blob to File for share:', err);
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
 * Shares item using Native Android Share sheet or Web Share API including HD image files
 */
export const shareItemWithImages = async (
  item: Item,
  categoryName: string,
  subCategoryName?: string
): Promise<{ success: boolean; method: 'native_files' | 'native_text' | 'whatsapp' | 'copied'; error?: string }> => {
  const shareText = formatItemShareText(item, categoryName, subCategoryName);
  const imagesList = item.images && item.images.length > 0 ? item.images : (item.image ? [item.image] : []);

  // 1. Native Mobile Platform (Android APK via Capacitor)
  if (Capacitor.isNativePlatform()) {
    try {
      const fileUris: string[] = [];

      for (let i = 0; i < Math.min(imagesList.length, 4); i++) {
        const imgUrl = imagesList[i];
        if (!imgUrl) continue;

        let base64Data = imgUrl;
        if (imgUrl.includes(',')) {
          base64Data = imgUrl.split(',')[1];
        }

        const fileName = `bilal_koo_item_${item.barcode}_${i + 1}.jpg`;
        const writeRes = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        fileUris.push(writeRes.uri);
      }

      await Share.share({
        title: `قطعة: ${item.name}`,
        text: shareText,
        files: fileUris.length > 0 ? fileUris : undefined,
      });

      return { success: true, method: 'native_files' };
    } catch (err: unknown) {
      console.warn('Capacitor native share exception:', err);
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('canceled') || message.includes('cancelled')) {
        return { success: true, method: 'native_files' };
      }
    }
  }

  // 2. Web Share API (Desktop / Web Browsers / Android WebView)
  const filePromises = imagesList
    .filter(Boolean)
    .map(async (imgUrl, index) => {
      const blob = await urlToBlob(imgUrl);
      if (!blob) return null;
      const mimeType = blob.type || (imgUrl.includes('image/svg') ? 'image/svg+xml' : 'image/jpeg');
      const ext = mimeType.includes('svg') ? 'svg' : 'jpg';
      return new File([blob], `bilal-koo-item-${item.barcode}-${index + 1}.${ext}`, {
        type: mimeType,
        lastModified: Date.now(),
      });
    });

  const files = (await Promise.all(filePromises)).filter((f): f is File => f !== null);

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      if (files.length > 0) {
        // Attempt 1: Share all images + text together
        try {
          await navigator.share({
            title: `قطعة: ${item.name} - بلال كو`,
            text: shareText,
            files: files,
          });
          return { success: true, method: 'native_files' };
        } catch (fErr) {
          console.warn('Web Share files + text failed, attempting files only with copied text:', fErr);
        }

        // Attempt 2: Copy text to clipboard and share ALL image files only
        try {
          try {
            await navigator.clipboard.writeText(shareText);
          } catch (e) {}

          await navigator.share({
            title: `قطعة: ${item.name}`,
            files: files,
          });
          return { success: true, method: 'native_files' };
        } catch (filesOnlyErr) {
          console.warn('Web Share files-only failed, attempting single primary file share:', filesOnlyErr);
        }

        // Attempt 3: If multi-file sharing failed, try sharing primary image file + text
        if (files.length > 1) {
          try {
            await navigator.share({
              title: `قطعة: ${item.name} - بلال كو`,
              text: shareText,
              files: [files[0]],
            });
            return { success: true, method: 'native_files' };
          } catch (singleFileErr) {
            console.warn('Web Share single-file failed:', singleFileErr);
          }
        }
      }

      // Fallback: Text only share
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

  // Fallback 3: Copy to clipboard & open WhatsApp
  try {
    await navigator.clipboard.writeText(shareText);
    openWhatsAppShare(item, categoryName, subCategoryName);
    return { success: true, method: 'whatsapp' };
  } catch (waErr) {
    console.warn('WhatsApp direct share fallback:', waErr);
  }

  // Fallback 4: Copy formatted text to clipboard
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
  const imagesList = item.images && item.images.length > 0 ? item.images : (item.image ? [item.image] : []);

  if (Capacitor.isNativePlatform()) {
    try {
      const fileUris: string[] = [];
      for (let i = 0; i < Math.min(imagesList.length, 4); i++) {
        const imgUrl = imagesList[i];
        if (!imgUrl) continue;

        let base64Data = imgUrl;
        if (imgUrl.includes(',')) {
          base64Data = imgUrl.split(',')[1];
        }

        const fileName = `bilal_koo_hd_${item.barcode}_${i + 1}.jpg`;
        const writeRes = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        fileUris.push(writeRes.uri);
      }

      if (fileUris.length > 0) {
        await Share.share({
          files: fileUris,
        });
        return true;
      }
    } catch (err) {
      console.warn('Native shareImagesOnly failed:', err);
      return false;
    }
  }

  const filePromises = imagesList
    .filter(Boolean)
    .map(async (imgUrl, index) => {
      const blob = await urlToBlob(imgUrl);
      if (!blob) return null;
      const mimeType = blob.type || (imgUrl.includes('image/svg') ? 'image/svg+xml' : 'image/jpeg');
      const ext = mimeType.includes('svg') ? 'svg' : 'jpg';
      return new File([blob], `bilal-koo-item-${item.barcode}-${index + 1}.${ext}`, {
        type: mimeType,
        lastModified: Date.now(),
      });
    });

  const files = (await Promise.all(filePromises)).filter((f): f is File => f !== null);

  if (files.length > 0 && typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        files: files,
      });
      return true;
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
