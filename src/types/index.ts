// ============================================================================
// TEMEL TIP TANIMLARI
// ============================================================================

import {
  User,
  Customer,
  Product,
  ProductVariant,
  Order,
  OrderItem,
  VisitNote,
  ProductionOrder,
  ProductionStage,
  Shipment,
  StockMovement,
  UserRole,
  CustomerSegment,
  CustomerRiskLevel,
  OrderStatus,
  PaymentStatus,
  ProductionStageStatus,
  ShipmentStatus,
  StockMovementType,
  MediaType,
} from '@prisma/client';

// ============================================================================
// EXPORT PRISMA TYPES
// ============================================================================

export type {
  User,
  Customer,
  Product,
  ProductVariant,
  Order,
  OrderItem,
  VisitNote,
  ProductionOrder,
  ProductionStage,
  Shipment,
  StockMovement,
  UserRole,
  CustomerSegment,
  CustomerRiskLevel,
  OrderStatus,
  PaymentStatus,
  ProductionStageStatus,
  ShipmentStatus,
  StockMovementType,
  MediaType,
};

// ============================================================================
// OTURUM TİPLERİ
// ============================================================================

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface Session {
  user: SessionUser;
  expires: string;
}

// ============================================================================
// SAHA TEMSİLCİSİ TİPLERİ
// ============================================================================

export interface CustomerProfileWithStats extends Customer {
  totalOrders: number;
  totalVisits: number;
  lastVisitDate: Date | null;
  averageOrderValue: number;
  currentDebt: number;
}

export interface QuickOrderInput {
  customerId: string;
  fieldRepId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    discountPercentage?: number;
  }>;
  notes?: string;
  deliveryDate?: Date;
}

export interface QuickOrderResponse {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
  totalAmount?: number;
}

export interface VisitNoteInput {
  customerId: string;
  fieldRepId: string;
  visitDate: Date;
  durationMinutes?: number;
  notes?: string;
  stockObservation?: string;
  competitorInfo?: string;
  displayMerchandising?: string;
  orderPotential?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
  latitude?: number;
  longitude?: number;
}

export interface VisitNoteResponse {
  success: boolean;
  visitNoteId?: string;
  error?: string;
}

// ============================================================================
// ÜRÜN & KATALOG TİPLERİ
// ============================================================================

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
  images: any[];
}

export interface PresentationMode {
  productId: string;
  displayMode: 'gallery' | 'details' | 'variants' | '360';
  selectedVariantId?: string;
  zoom: number;
  currentImageIndex: number;
}

// ============================================================================
// ÜRETİM TİPLERİ
// ============================================================================

export interface ProductionOrderWithStages extends ProductionOrder {
  stages: ProductionStage[];
}

export interface ProductionStageUpdate {
  stageId: string;
  status: ProductionStageStatus;
  outputQuantity?: number;
  wasteQuantity?: number;
  notes?: string;
  photoUrls?: string[];
}

export interface ProductionMetrics {
  totalOrders: number;
  completedOrders: number;
  inProgressOrders: number;
  averageLeadTime: number; // gün
  overallYield: number; // %
  rejectionRate: number; // %
}

// ============================================================================
// STOK TİPLERİ
// ============================================================================

export interface StockMovementInput {
  productId: string;
  movementType: StockMovementType;
  quantity: number;
  warehouseId?: string;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
}

export interface StockAlert {
  productId: string;
  sku: string;
  productName: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  status: 'critical' | 'warning' | 'normal' | 'overstock';
}

export interface WarehouseInventory {
  warehouseId: string;
  warehouseName: string;
  totalItems: number;
  utilization: number; // %
  topProducts: Array<{
    productId: string;
    sku: string;
    quantity: number;
  }>;
}

// ============================================================================
// KARGO & LOJISTIK TİPLERİ
// ============================================================================

export interface ShipmentWithDetails extends Shipment {
  order: Order & { items: OrderItem[] };
  deliveryProofs: any[];
}

export interface ShipmentTracking {
  shipmentId: string;
  shipmentNumber: string;
  trackingNumber: string;
  status: ShipmentStatus;
  pickupDate: Date | null;
  estimatedDeliveryDate: Date | null;
  actualDeliveryDate: Date | null;
  location?: string;
  lastUpdate: Date;
}

// ============================================================================
// DASHBOARD & RAPORLAMA TİPLERİ
// ============================================================================

export interface DashboardMetrics {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  pendingOrders: number;
  inProductionOrders: number;
  readyForShipment: number;
  criticalStockItems: number;
}

export interface OrderStatistics {
  byStatus: Record<OrderStatus, number>;
  byPaymentStatus: Record<PaymentStatus, number>;
  totalValue: number;
  averageOrderValue: number;
  orderCount: number;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    orderCount: number;
    totalValue: number;
  }>;
}

export interface SalesPerformance {
  fieldRepId: string;
  fieldRepName: string;
  totalOrders: number;
  totalRevenue: number;
  customerCount: number;
  visitCount: number;
  avgOrderValue: number;
  targetAchievement: number; // %
}

// ============================================================================
// HATA TİPLERİ
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// ============================================================================
// FİLTRELEME & ARAMA TİPLERİ
// ============================================================================

export interface OrderFilter {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerId?: string;
  fieldRepId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

export interface CustomerFilter {
  segment?: CustomerSegment;
  riskLevel?: CustomerRiskLevel;
  assignedToId?: string;
  isActive?: boolean;
  searchTerm?: string;
  lastVisitFrom?: Date;
  lastVisitTo?: Date;
}

export interface ProductFilter {
  category?: string;
  isActive?: boolean;
  searchTerm?: string;
  minStock?: number;
  maxStock?: number;
}
