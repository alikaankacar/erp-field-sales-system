// ============================================================================
// TARİH VE SAAT UTILITELERI
// ============================================================================

import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Türkçe, insan tarafından okunabilir tarih formatı
 * Örn: "2 saat önce", "dün", "3 hafta önce"
 */
export function formatDateRelative(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: tr });
}

/**
 * Standart tarih formatı (DD.MM.YYYY HH:mm)
 */
export function formatDateTime(date: Date): string {
  return format(date, 'dd.MM.yyyy HH:mm', { locale: tr });
}

/**
 * Sadece tarih (DD.MM.YYYY)
 */
export function formatDateOnly(date: Date): string {
  return format(date, 'dd.MM.yyyy', { locale: tr });
}

/**
 * Sadece saat (HH:mm)
 */
export function formatTimeOnly(date: Date): string {
  return format(date, 'HH:mm');
}

/**
 * Gün adını Türkçe olarak döndür
 */
export function getDayName(date: Date): string {
  return format(date, 'EEEE', { locale: tr });
}

/**
 * Ay adını Türkçe olarak döndür
 */
export function getMonthName(date: Date): string {
  return format(date, 'MMMM', { locale: tr });
}

/**
 * "Bugün", "Dün", "3 gün önce" gibi formatla
 */
export function formatDateSmart(date: Date): string {
  if (isToday(date)) return 'Bugün';
  if (isYesterday(date)) return 'Dün';
  return formatDateRelative(date);
}

/**
 * İş günü sayısını hesapla (hafta sonu hariç)
 */
export function getBusinessDaysBetween(startDate: Date, endDate: Date): number {
  let count = 0;
  let current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Tarih aralığını Türkçe formatla
 * Örn: "15.08.2026 - 20.08.2026"
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  return `${formatDateOnly(startDate)} - ${formatDateOnly(endDate)}`;
}
