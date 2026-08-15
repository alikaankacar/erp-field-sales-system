// ============================================================================
// FIYATLANDIRMA HESAPLAMA UTILITELERI
// ============================================================================

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
}

export interface OrderTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

/**
 * Sipariş toplam tutarını hesapla
 * Vergi oranı: %18 (Türkiye KDV)
 */
export function calculateOrderTotals(
  items: OrderItem[],
  orderDiscountPercentage: number = 0
): OrderTotals {
  const TAX_RATE = 0.18; // %18 KDV

  // Satır toplamları (birim fiyat * miktar - satır indirimi)
  const lineSubtotals = items.map((item) => {
    const lineTotal = item.unitPrice * item.quantity;
    const lineDiscount = (lineTotal * item.discountPercentage) / 100;
    return lineTotal - lineDiscount;
  });

  // Tüm satırların toplamı
  const subtotalBeforeOrderDiscount = lineSubtotals.reduce((sum, total) => sum + total, 0);

  // Sipariş seviyesi indirimi
  const orderDiscount = (subtotalBeforeOrderDiscount * orderDiscountPercentage) / 100;
  const subtotal = subtotalBeforeOrderDiscount - orderDiscount;

  // Vergi hesaplama
  const taxAmount = subtotal * TAX_RATE;
  const totalAmount = subtotal + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(orderDiscount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}

/**
 * Müşteri segmentine göre iskonto yüzdesini hesapla
 */
export function getSegmentDiscount(segment: string): number {
  const discounts: Record<string, number> = {
    RETAIL: 0,
    WHOLESALE: 5,
    DISTRIBUTOR: 10,
    CORPORATE: 15,
    OTHER: 0,
  };

  return discounts[segment] || 0;
}

/**
 * Sipariş tutarına göre kademeli iskonto hesapla
 */
export function getTieredDiscount(orderAmount: number): number {
  if (orderAmount >= 50000) return 15;
  if (orderAmount >= 25000) return 10;
  if (orderAmount >= 10000) return 5;
  return 0;
}

/**
 * Müşteri credit limit'i kontrol et
 */
export function isWithinCreditLimit(
  currentDebt: number,
  creditLimit: number,
  newOrderAmount: number
): boolean {
  return currentDebt + newOrderAmount <= creditLimit;
}

/**
 * Ödeme koşullarına göre vade tarihini hesapla
 */
export function calculateDueDate(paymentTermsDays: number): Date {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + paymentTermsDays);
  return dueDate;
}
