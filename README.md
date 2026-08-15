# ERP Field Sales & Operations System

**Kapsamlı, bulut tabanlı, ölçeklenebilir ve modern bir Dikey ERP & B2B Saha Satış Otomasyonu**

## 🎯 Genel Bakış

Bu sistem, saha temsilcilerinin müşteri ziyaretleri, hızlı sipariş girişi ve sunum kataloğu kullanımıyla başlayan, üretim hattı takibi, stok yönetimi ve kargo/lojistik operasyonlarını kapsayan **production-ready** bir ERP çözümüdür.

## 🏗️ Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend Layer (Next.js + TypeScript + Shadcn UI + Tailwind)  │
│  - Saha Temsilcisi Arayüzü (Tablet/Mobil PWA)                  │
│  - Yönetim Panelleri (Üretim, Kargo, Stok)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  API Layer (Next.js Server Actions / RESTful Routes)            │
│  - CRUD İşlemleri                                               │
│  - WebSocket (Anlık Güncellemeler)                              │
│  - Validasyon & Authorization                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Business Logic Layer (Server Actions & Utilities)              │
│  - Sipariş İş Mantığı                                           │
│  - Üretim Planlama                                              │
│  - Stok Yönetimi                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Data Layer (PostgreSQL + Prisma ORM)                           │
│  - 30+ İlişkisel Tablo                                          │
│  - Indexler & Constraints                                       │
│  - Audit Logging                                                │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 Sistem Modülleri

### 1. **Saha Temsilcisi & Satış Modülü** 👥
- Müşteri/Dükkan Profili (Ziyaret geçmişi, siparişler, risk analizi)
- Hızlı Sipariş Girişi (Barkod okuma, dinamik fiyatlandırma)
- İnteraktif Sunum Kataloğu (360° görseller, varyantlar, teknik özellikler)
- Ziyaret Notları (Sesli not transkripsiyonu, fotoğraflar, gözlemler)

### 2. **Stok & Depo Yönetimi** 📦
- Çoklu depo desteği, raf/lokasyon takibi
- Anlık stok düşümü ve rezerve stok yönetimi
- Kritik stok uyarıları
- Ürün varyant yönetimi (SKU, Barkod, QR kod)

### 3. **Üretim Aşamaları Takibi** 🏭
- Ürün Reçetesi (BOM) yönetimi
- Üretim İş Emirleri: Aşama takibi (Ham Madde → Kesim → Montaj → QC → Paketlenmiş)
- İstasyon bazlı süre ve fire/atık oranları

### 4. **Lojistik, Kargo & Sevkiyat** 🚚
- Paketlenme, irsaliye ve çeki listesi oluşturma
- Kargo API entegrasyon şablonu
- Teslimat onayı (Dijital imza, kanıt fotoğrafı)
- Anlık kargo durum sorgulama

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|--------|----------|
| **Frontend** | Next.js 15, TypeScript, React 18, Tailwind CSS, Shadcn UI |
| **Backend** | Next.js Server Actions, RESTful API, WebSocket |
| **Veritabanı** | PostgreSQL + Prisma ORM |
| **Auth** | NextAuth.js v5 |
| **Medya** | AWS S3 / Cloudinary |
| **Validasyon** | Zod + React Hook Form |

## 📁 Proje Yapısı

```
erp-field-sales-system/
├── prisma/
│   └── schema.prisma           # Veritabanı şeması
├── src/
│   ├── app/
│   │   ├── api/                # API routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── field-rep/          # Saha temsilcisi bileşenleri
│   │   ├── dashboard/          # Yönetim paneli bileşenleri
│   │   └── shared/             # Ortak bileşenler
│   ├── lib/
│   │   ├── server-actions/     # Backend iş mantığı
│   │   ├── db.ts               # Prisma client
│   │   └── utils/              # Yardımcı fonksiyonlar
│   ├── types/                  # TypeScript tip tanımları
│   └── server/                 # Sunucu tarafı fonksiyonlar
├── .env.example                # Environment örneği
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind config
└── package.json
```

## 🚀 Başlangıç

### Ön Gereksinimler
- Node.js 18+
- PostgreSQL 13+
- npm veya yarn

### Kurulum Adımları

1. **Repository klonlayın:**
```bash
git clone https://github.com/alikaankacar/erp-field-sales-system.git
cd erp-field-sales-system
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **.env dosyasını yapılandırın:**
```bash
cp .env.example .env
# .env dosyasını düzenleyin ve veritabanı bağlantısını ayarlayın
```

4. **Veritabanını hazırlayın:**
```bash
npm run prisma:generate
npm run db:push
```

5. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

Arayüz: http://localhost:3000

## 📋 Veritabanı Şeması Özeti

### Temel Tablolar (30+)

| Tablo | Açıklama |
|-------|----------|
| `users` | Sistem kullanıcıları (RBAC ile) |
| `customers` | Müşteri bilgileri |
| `visit_notes` | Ziyaret notları |
| `products` | Ürün kataloğu |
| `product_variants` | Ürün varyantları (renk, beden, vb.) |
| `orders` | Satış siparişleri |
| `order_items` | Sipariş kalem detayları |
| `production_orders` | Üretim emirleri |
| `production_stages` | Üretim aşamaları |
| `boms` | Ürün reçeteleri |
| `shipments` | Kargo/Sevkiyat |
| `stock_movements` | Stok hareketleri |
| `price_lists` | Fiyat listeleri |
| `invoices` | Faturalar |
| `audit_logs` | Sistem denetim günlüğü |

## 🔐 Yetkilendirme (RBAC)

```typescript
enum UserRole {
  SUPER_ADMIN           // Tüm erişim
  FIELD_REP             // Saha ziyaretleri, sipariş girişi
  PRODUCTION_MANAGER    // Üretim planlama ve takibi
  WAREHOUSE_MANAGER     // Stok ve depo yönetimi
  ACCOUNTING            // Fatura ve ödeme
  CUSTOMER_SERVICE      // Müşteri hizmetleri
}
```

## 📊 Temel İş Akışları

### 1. Saha Temsilcisinin Günü
```
Gün Başı → Müşteri Ziyareti → Sipariş Girişi → Sunum Kataloğu → Ziyaret Notu → Gün Sonu Rapor
```

### 2. Sipariş Yaşam Döngüsü
```
Taslak → Onaylanmış → Üretim → Hazır → Sevkiyat → Teslimat
```

### 3. Üretim Süreci
```
İş Emri → Aşama 1 → Aşama 2 → Kalite Kontrol → Paketleme → Stok
```

## 🎨 UI/UX Özellikler

- ✅ Mobil-first responsive tasarım (PWA destekli)
- ✅ Dark mode desteği
- ✅ Offline capabilities (Service Workers)
- ✅ Real-time notifikasyonlar (WebSocket)
- ✅ Barkod okuma entegrasyonu
- ✅ 360° ürün görselleri
- ✅ İnteraktif Kanban/Timeline dashboards

## 🔌 API Entegrasyonları

- **Kargo Firmaları:** Tracking, Barcode Generation
- **Medya:** AWS S3, Cloudinary
- **Ödeme:** Stripe, Iyzico (İçinde eklenecek)
- **Authentication:** NextAuth.js v5

## 📝 Lisans

MIT

## 👨‍💼 Destek

Sorular veya öneriler için: [support@example.com](mailto:support@example.com)

---

**Son Güncelleme:** Ağustos 2026
