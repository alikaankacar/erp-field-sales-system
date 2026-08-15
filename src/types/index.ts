// Re-export all types from Prisma
export * from '@prisma/client';

// Extended types for the application
export type UserWithRelations = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
};

export type CustomerWithStats = {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string;
  segment: string;
  riskLevel: string;
  totalOrders: number;
  totalPurchaseAmount: number;
  lastVisitDate: Date | null;
  lastOrderDate: Date | null;
};

export type OrderWithItems = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
