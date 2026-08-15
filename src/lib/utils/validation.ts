// ============================================================================
// DOĞRULAMA UTILITELERI
// ============================================================================

/**
 * Email doğrulama
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Türkiye telefon numarası doğrulama
 * Formats: 05xxxxxxxxx, +905xxxxxxxxx, (5XX) XXX-XXXX
 */
export function isValidTurkishPhone(phone: string): boolean {
  const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
  const cleaned = phone.replace(/[^0-9+]/g, '');
  return phoneRegex.test(cleaned);
}

/**
 * Türkiye Vergi Numarası (VKN) doğrulama
 * 10 haneli sayı
 */
export function isValidTaxId(taxId: string): boolean {
  const vknRegex = /^\d{10}$/;
  return vknRegex.test(taxId);
}

/**
 * Pozitif sayı doğrulama
 */
export function isPositiveNumber(value: number): boolean {
  return value > 0;
}

/**
 * Yüzde değeri doğrulama (0-100)
 */
export function isValidPercentage(value: number): boolean {
  return value >= 0 && value <= 100;
}

/**
 * URL doğrulama
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Tarih doğrulama (gelecek tarih)
 */
export function isFutureDate(date: Date): boolean {
  return date > new Date();
}

/**
 * Tarih doğrulama (geçmiş tarih)
 */
export function isPastDate(date: Date): boolean {
  return date < new Date();
}

/**
 * String uzunluk doğrulama
 */
export function isValidLength(
  value: string,
  minLength?: number,
  maxLength?: number
): boolean {
  if (minLength && value.length < minLength) return false;
  if (maxLength && value.length > maxLength) return false;
  return true;
}

/**
 * Barkod formatı doğrulama (EAN-13)
 */
export function isValidBarcode(barcode: string): boolean {
  const barcodeRegex = /^\d{8,14}$/; // 8-14 haneli sayı
  return barcodeRegex.test(barcode);
}
