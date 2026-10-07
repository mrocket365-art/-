// Arabic color name dictionary and nearest hex color matcher
interface ColorMapEntry {
  name: string;
  rgb: [number, number, number];
}

const COLOR_DICTIONARY: ColorMapEntry[] = [
  { name: 'أسود', rgb: [0, 0, 0] },
  { name: 'أبيض', rgb: [255, 255, 255] },
  { name: 'أحمر', rgb: [239, 68, 68] },
  { name: 'أحمر عنابي', rgb: [136, 19, 55] },
  { name: 'وردي', rgb: [236, 72, 153] },
  { name: 'وردي فاتح', rgb: [251, 207, 232] },
  { name: 'أزرق', rgb: [59, 130, 246] },
  { name: 'أزرق سماوي', rgb: [56, 189, 248] },
  { name: 'كحلي داكن', rgb: [30, 58, 138] },
  { name: 'أخضر', rgb: [16, 185, 129] },
  { name: 'أخضر زيتي', rgb: [63, 98, 18] },
  { name: 'أخضر زمردي', rgb: [5, 150, 105] },
  { name: 'أصفر', rgb: [234, 179, 8] },
  { name: 'أصفر خردلي', rgb: [217, 119, 6] },
  { name: 'ذهبي', rgb: [229, 190, 88] },
  { name: 'بني', rgb: [120, 53, 15] },
  { name: 'بني شوكولاتة', rgb: [69, 26, 3] },
  { name: 'بيج', rgb: [245, 245, 220] },
  { name: 'رمادي', rgb: [100, 116, 139] },
  { name: 'رمادي رصاصي', rgb: [71, 85, 105] },
  { name: 'فضي', rgb: [148, 163, 184] },
  { name: 'بنفسجي', rgb: [147, 51, 234] },
  { name: 'بنفسجي ملكي', rgb: [124, 58, 237] },
  { name: 'برتقالي', rgb: [249, 115, 22] },
];

function hexToRgb(hex: string): [number, number, number] {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((char) => char + char).join('');
  }
  const num = parseInt(cleanHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function getNearestArabicColorName(hex: string): string {
  const targetRgb = hexToRgb(hex);
  let minDistance = Infinity;
  let closestName = 'لون مخصص';

  for (const entry of COLOR_DICTIONARY) {
    const [r1, g1, b1] = targetRgb;
    const [r2, g2, b2] = entry.rgb;

    // Euclidean distance in RGB space
    const distance = Math.sqrt(
      Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestName = entry.name;
    }
  }

  return closestName;
}
