// ============================================================================
// FORMATLAMA UTILITELERI
// ============================================================================

/**
 * Para birimi formatı (Türk Lirası)
 * Örn: 1.234,56 ₺
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Sayı formatı (binlik ayırıcı)
 * Örn: 1.234
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Yüzde formatı
 * Örn: 15.50%
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Büyük sayıları kısaltma
 * Örn: 1500 => 1.5K, 1000000 => 1M
 */
export function formatCompactNumber(value: number): string {
  const units = ['', 'K', 'M', 'B'];
  let unitIndex = 0;
  let compactValue = value;

  while (compactValue >= 1000 && unitIndex < units.length - 1) {
    compactValue /= 1000;
    unitIndex++;
  }

  return `${Math.round(compactValue * 100) / 100}${units[unitIndex]}`;
}

/**
 * Dosya boyutu formatı
 * Örn: 1024 => 1 KB, 1048576 => 1 MB
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Adı ve soyadı formatı
 */
export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Adres formatı
 */
export function formatAddress(
  street: string,
  city: string,
  province: string,
  postalCode: string
): string {
  return `${street}, ${postalCode} ${city}/${province}`;
}

/**
 * Telefon numarasını formatla
 * Örn: 05001234567 => (500) 123-4567 veya 0500 123 45 67
 */
export function formatPhoneNumber(phone: string, format: 'parentheses' | 'spaces' = 'parentheses'): string {
  const cleaned = phone.replace(/\D/g, '').slice(-10); // Son 10 hanesi

  if (format === 'parentheses') {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return `0${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
}

/**
 * Metni kısalt (elipsis ile)
 * Örn: "Çok uzun bir metindir" (15 karakter) => "Çok uzun bir m..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Slug oluştur (URL-safe)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Metnin başındaki boşlukları temizle ve ilk harfi büyük yap
 */
export function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
