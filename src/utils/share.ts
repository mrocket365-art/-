import { Item } from '../types';

export interface ShareDataPayload {
  title: string;
  text: string;
  url?: string;
}

// Convert base64 Data URL or fetchable Image URL to a File object
export const urlToFile = async (url: string, filename: string): Promise<File | null> => {
  try {
    if (url.startsWith('data:')) {
      const arr = url.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/png';
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
    console.warn('Could not convert image to File:', err);
    return null;
  }
};

export const formatItemShareText = (
  item: Item,
  categoryName: string,
  subCategoryName?: string
): string => {
  const colorsText = item.colors.length > 0 ? item.colors.join('، ') : 'غير محدد';
  const sizesText = item.sizes.length > 0 ? item.sizes.join('، ') : 'غير محدد';

  return `📦 *تفاصيل القطعة — بلال كو*
📌 *الاسم:* ${item.name}
🏷️ *القسم:* ${categoryName}${subCategoryName ? ` (${subCategoryName})` : ''}
🔢 *الباركود:* ${item.barcode}
🎨 *الألوان:* ${colorsText}
📏 *المقاسات:* ${sizesText}
${item.notes ? `📝 *ملاحظات:* ${item.notes}\n` : ''}
✨ بلال كو - حيث السعر الحقيقي`;
};

export const shareItem = async (
  item: Item,
  categoryName: string,
  subCategoryName?: string
): Promise<{ success: boolean; method: 'native' | 'whatsapp' | 'copied' }> => {
  const shareText = formatItemShareText(item, categoryName, subCategoryName);

  // Try Web Share API with image file if supported
  if (navigator.share) {
    try {
      const imageToShare = (item.images && item.images.length > 0) ? item.images[0] : item.image;
      const imgFile = imageToShare ? await urlToFile(imageToShare, `bilal-koo-${item.barcode}.png`) : null;

      if (imgFile && navigator.canShare && navigator.canShare({ files: [imgFile] })) {
        await navigator.share({
          title: `قطعة: ${item.name} - بلال كو`,
          text: shareText,
          files: [imgFile],
        });
        return { success: true, method: 'native' };
      } else {
        await navigator.share({
          title: `قطعة: ${item.name} - بلال كو`,
          text: shareText,
        });
        return { success: true, method: 'native' };
      }
    } catch (err) {
      console.log('Web Share dismissed or failed:', err);
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(shareText);
    return { success: true, method: 'copied' };
  } catch (err) {
    console.error('Copy failed:', err);
    return { success: false, method: 'copied' };
  }
};

export const openWhatsAppShare = (
  item: Item,
  categoryName: string,
  subCategoryName?: string
) => {
  const text = formatItemShareText(item, categoryName, subCategoryName);
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
};
