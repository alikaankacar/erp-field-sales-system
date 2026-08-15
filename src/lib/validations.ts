import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

// Customer Schemas
export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Müşteri adı en az 2 karakter olmalıdır'),
  segment: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR', 'CORPORATE', 'OTHER']),
  phoneNumber: z.string().min(10, 'Telefon numarası en az 10 karakter olmalıdır'),
  email: z.string().email().optional().or(z.literal('')),
  addressStreet: z.string().min(5, 'Adres en az 5 karakter olmalıdır'),
  addressCity: z.string().min(2, 'Şehir en az 2 karakter olmalıdır'),
  addressProvince: z.string().min(2, 'İl en az 2 karakter olmalıdır'),
  addressPostalCode: z.string().min(5, 'Posta kodu en az 5 karakter olmalıdır'),
});

// Order Schemas
export const createOrderSchema = z.object({
  customerId: z.string().min(1, 'Müşteri seçiniz'),
  shippingAddress: z.string().min(5, 'Teslimat adresi en az 5 karakter olmalıdır'),
  shippingCity: z.string().min(2, 'Şehir en az 2 karakter olmalıdır'),
  shippingProvince: z.string().min(2, 'İl en az 2 karakter olmalıdır'),
  shippingPostalCode: z.string().min(5, 'Posta kodu en az 5 karakter olmalıdır'),
  notes: z.string().optional(),
});

export const addOrderItemSchema = z.object({
  productId: z.string().min(1, 'Ürün seçiniz'),
  quantity: z.number().min(1, 'Miktar en az 1 olmalıdır'),
  unitPrice: z.number().min(0, 'Fiyat 0 veya daha büyük olmalıdır'),
});

// Product Schemas
export const createProductSchema = z.object({
  sku: z.string().min(3, 'SKU en az 3 karakter olmalıdır'),
  name: z.string().min(2, 'Ürün adı en az 2 karakter olmalıdır'),
  category: z.string().min(2, 'Kategori en az 2 karakter olmalıdır'),
  baseCost: z.number().min(0, 'Maliyet 0 veya daha büyük olmalıdır'),
  basePrice: z.number().min(0, 'Fiyat 0 veya daha büyük olmalıdır'),
});

// Visit Note Schemas
export const createVisitNoteSchema = z.object({
  customerId: z.string().min(1, 'Müşteri seçiniz'),
  notes: z.string().optional(),
  durationMinutes: z.number().min(1).optional(),
});

// Types from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type AddOrderItemInput = z.infer<typeof addOrderItemSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateVisitNoteInput = z.infer<typeof createVisitNoteSchema>;
