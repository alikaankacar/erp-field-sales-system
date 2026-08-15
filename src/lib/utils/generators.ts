// ============================================================================
// NUMARALANDIRMA IŞLEMLERİ - SIPARIŞ, FATURA, ÜRETİM NUMARASI
// ============================================================================

import { prisma } from '@/lib/db';

/**
 * Sipariş numarası oluştur
 * Format: ORD-YYYYMMDD-0001
 */
export async function generateOrderNumber(): Promise<string> {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0].replace(/-/g, '');

  // Bugünün son sipariş numarasını bul
  const lastOrder = await prisma.order.findFirst({
    where: {
      orderNumber: {
        startsWith: `ORD-${dateString}`,
      },
    },
    orderBy: {
      orderNumber: 'desc',
    },
  });

  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `ORD-${dateString}-${String(sequence).padStart(4, '0')}`;
}

/**
 * Üretim numarası oluştur
 * Format: PROD-YYYYMMDD-0001
 */
export async function generateProductionNumber(): Promise<string> {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0].replace(/-/g, '');

  const lastProduction = await prisma.productionOrder.findFirst({
    where: {
      productionNumber: {
        startsWith: `PROD-${dateString}`,
      },
    },
    orderBy: {
      productionNumber: 'desc',
    },
  });

  let sequence = 1;
  if (lastProduction) {
    const lastSequence = parseInt(lastProduction.productionNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `PROD-${dateString}-${String(sequence).padStart(4, '0')}`;
}

/**
 * Fatura numarası oluştur
 * Format: INV-YYYYMMDD-0001
 */
export async function generateInvoiceNumber(): Promise<string> {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0].replace(/-/g, '');

  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: `INV-${dateString}`,
      },
    },
    orderBy: {
      invoiceNumber: 'desc',
    },
  });

  let sequence = 1;
  if (lastInvoice) {
    const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `INV-${dateString}-${String(sequence).padStart(4, '0')}`;
}

/**
 * Kargo numarası oluştur
 * Format: SHIP-YYYYMMDD-0001
 */
export async function generateShipmentNumber(): Promise<string> {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0].replace(/-/g, '');

  const lastShipment = await prisma.shipment.findFirst({
    where: {
      shipmentNumber: {
        startsWith: `SHIP-${dateString}`,
      },
    },
    orderBy: {
      shipmentNumber: 'desc',
    },
  });

  let sequence = 1;
  if (lastShipment) {
    const lastSequence = parseInt(lastShipment.shipmentNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `SHIP-${dateString}-${String(sequence).padStart(4, '0')}`;
}

/**
 * SKU (Stock Keeping Unit) oluştur
 * Format: CAT-SUBCAT-XXXXX
 */
export function generateSKU(category: string, subCategory: string, sequence: number): string {
  const catCode = category.slice(0, 3).toUpperCase();
  const subCatCode = subCategory ? subCategory.slice(0, 3).toUpperCase() : 'GEN';
  return `${catCode}-${subCatCode}-${String(sequence).padStart(5, '0')}`;
}

/**
 * QR Code oluşturma (veri hazırlama)
 * Gerçek QR kodun generate edilmesi frontend veya harici API'de yapılır
 */
export function prepareQRCodeData(productId: string, variantId?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://erp.local';
  return `${baseUrl}/product/${productId}${variantId ? `?variant=${variantId}` : ''}`;
}
