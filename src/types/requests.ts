// ============================================================================
// API İSTEK SHAPELARI (Zod ile validasyon için)
// ============================================================================

import { z } from 'zod';
import {
  OrderStatus,
  PaymentStatus,
  ProductionStageStatus,
  StockMovementType,
  CustomerSegment,
  CustomerRiskLevel,
} from '@prisma/client';

// ============================================================================
// KULLANICI İSTEKLERİ
// ============================================================================

export const LoginRequestSchema = z.object({
  email: z.string().email('Geçersiz email adresi'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// ============================================================================
// MÜŞTERİ İSTEKLERİ
// ============================================================================

export const CreateCustomerSchema = z.object({
  name: z.string().min(2, 'Müşteri adı en az 2 karakter olmalıdır'),
  legalName: z.string().optional(),
  taxId: z.string().optional(),
  segment: z.nativeEnum(CustomerSegment),
  phoneNumber: z.string().min(10, 'Telefon numarası geçersiz'),
  email: z.string().email('Geçersiz email').optional(),
  addressStreet: z.string().min(5, 'Adres geçersiz'),
  addressCity: z.string().min(2, 'Şehir geçersiz'),
  addressProvince: z.string().min(2, 'İl geçersiz'),
  addressPostalCode: z.string(),
  creditLimit: z.number().default(0),
  paymentTerms: z.number().default(30),
  assignedToId: z.string().optional(),
});

export type CreateCustomerRequest = z.infer<typeof CreateCustomerSchema>;

export const UpdateCustomerSchema = CreateCustomerSchema.partial().extend({
  id: z.string(),
});

export type UpdateCustomerRequest = z.infer<typeof UpdateCustomerSchema>;

// ============================================================================
// ZİYARET İSTEKLERİ
// ============================================================================

export const CreateVisitNoteSchema = z.object({
  customerId: z.string(),
  fieldRepId: z.string(),
  visitDate: z.date(),
  durationMinutes: z.number().optional(),
  notes: z.string().optional(),
  voiceNoteTranscript: z.string().optional(),
  stockObservation: z.string().optional(),
  competitorInfo: z.string().optional(),
  displayMerchandising: z.string().optional(),
  orderPotential: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.date().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type CreateVisitNoteRequest = z.infer<typeof CreateVisitNoteSchema>;

// ============================================================================
// ÜRÜNİN SİPARİŞ İSTEKLERİ
// ============================================================================

export const OrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1, 'Miktar en az 1 olmalıdır'),
  unitPrice: z.number().min(0, 'Fiyat negatif olamaz'),
  discountPercentage: z.number().default(0),
});

export const CreateOrderSchema = z.object({
  customerId: z.string(),
  fieldRepId: z.string(),
  items: z.array(OrderItemSchema).min(1, 'En az bir ürün seçilmelidir'),
  discountPercentage: z.number().default(0),
  shippingAddress: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingProvince: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  deliveryDate: z.date().optional(),
  notes: z.string().optional(),
});

export type CreateOrderRequest = z.infer<typeof CreateOrderSchema>;

export const UpdateOrderStatusSchema = z.object({
  orderId: z.string(),
  status: z.nativeEnum(OrderStatus),
  notes: z.string().optional(),
});

export type UpdateOrderStatusRequest = z.infer<typeof UpdateOrderStatusSchema>;

// ============================================================================
// ÜRETİM İSTEKLERİ
// ============================================================================

export const UpdateProductionStageSchema = z.object({
  stageId: z.string(),
  status: z.nativeEnum(ProductionStageStatus),
  outputQuantity: z.number().optional(),
  wasteQuantity: z.number().default(0),
  notes: z.string().optional(),
});

export type UpdateProductionStageRequest = z.infer<typeof UpdateProductionStageSchema>;

// ============================================================================
// STOK İSTEKLERİ
// ============================================================================

export const StockMovementSchema = z.object({
  productId: z.string(),
  movementType: z.nativeEnum(StockMovementType),
  quantity: z.number().min(0, 'Miktar negatif olamaz'),
  warehouseId: z.string().optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  notes: z.string().optional(),
});

export type StockMovementRequest = z.infer<typeof StockMovementSchema>;

// ============================================================================
// KARGO İSTEKLERİ
// ============================================================================

export const CreateShipmentSchema = z.object({
  orderId: z.string(),
  carrierName: z.string().optional(),
  packageCount: z.number().default(1),
  totalWeight: z.number().optional(),
  notes: z.string().optional(),
});

export type CreateShipmentRequest = z.infer<typeof CreateShipmentSchema>;

export const UpdateShipmentTrackingSchema = z.object({
  shipmentId: z.string(),
  trackingNumber: z.string(),
  trackingUrl: z.string().optional(),
  estimatedDeliveryDate: z.date().optional(),
});

export type UpdateShipmentTrackingRequest = z.infer<typeof UpdateShipmentTrackingSchema>;
