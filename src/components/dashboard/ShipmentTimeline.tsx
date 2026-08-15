'use client';

// ============================================================================
// KARGO TAKIBI TİMLİNE
// ============================================================================
// Siparişin teslimat aşamalarını timeline olarak göster

import React from 'react';
import { Package, Truck, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDateOnly } from '@/lib/utils';
import { ShipmentStatus } from '@prisma/client';

interface ShipmentTimelineEvent {
  status: ShipmentStatus;
  date: Date;
  location?: string;
  notes?: string;
}

interface ShipmentTimelineProps {
  shipmentNumber: string;
  orderNumber: string;
  customerName: string;
  currentStatus: ShipmentStatus;
  events: ShipmentTimelineEvent[];
  trackingNumber?: string;
  pickupDate?: Date;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
}

export function ShipmentTimeline({
  shipmentNumber,
  orderNumber,
  customerName,
  currentStatus,
  events,
  trackingNumber,
  pickupDate,
  estimatedDeliveryDate,
  actualDeliveryDate,
}: ShipmentTimelineProps) {
  const statusOrder: ShipmentStatus[] = [
    'PENDING',
    'PACKED',
    'PICKED_UP',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
  ];

  const statusLabels: Record<ShipmentStatus, string> = {
    PENDING: '⏳ Hazırlanıyor',
    PACKED: '📦 Paketlendi',
    PICKED_UP: '🚚 Kargoda',
    IN_TRANSIT: '🛣️ Yolda',
    OUT_FOR_DELIVERY: '📍 Teslimat Aşamasında',
    DELIVERED: '✅ Teslim Edildi',
    RETURNED: '↩️ İade Edildi',
    LOST: '❌ Kayıp',
    CANCELLED: '🚫 İptal Edildi',
  };

  const statusColors: Record<ShipmentStatus, string> = {
    PENDING: 'bg-gray-200 text-gray-800',
    PACKED: 'bg-blue-200 text-blue-800',
    PICKED_UP: 'bg-blue-300 text-blue-900',
    IN_TRANSIT: 'bg-purple-300 text-purple-900',
    OUT_FOR_DELIVERY: 'bg-orange-300 text-orange-900',
    DELIVERED: 'bg-green-300 text-green-900',
    RETURNED: 'bg-yellow-200 text-yellow-800',
    LOST: 'bg-red-300 text-red-900',
    CANCELLED: 'bg-gray-400 text-gray-900',
  };

  const isCompleted = (status: ShipmentStatus) => {
    const completedStatuses: ShipmentStatus[] = [
      'DELIVERED',
      'RETURNED',
      'LOST',
      'CANCELLED',
    ];
    return completedStatuses.includes(status);
  };

  const getStatusIndex = (status: ShipmentStatus) => {
    return statusOrder.indexOf(status);
  };

  const currentStatusIndex = getStatusIndex(currentStatus);

  const getStatusIcon = (status: ShipmentStatus) => {
    switch (status) {
      case 'PENDING':
        return <Package className="w-5 h-5" />;
      case 'PACKED':
        return <Package className="w-5 h-5" />;
      case 'PICKED_UP':
      case 'IN_TRANSIT':
        return <Truck className="w-5 h-5" />;
      case 'OUT_FOR_DELIVERY':
        return <MapPin className="w-5 h-5" />;
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Başlık */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{orderNumber}</h2>
        <p className="text-gray-600">Kargo: {shipmentNumber}</p>
        <p className="text-gray-600">{customerName}</p>
        {trackingNumber && (
          <p className="text-sm text-blue-600 font-mono mt-2">
            Takip Numarası: {trackingNumber}
          </p>
        )}
      </div>

      {/* Durum Özeti */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">MEVCUT DURUM</p>
          <p className={`text-lg font-bold px-3 py-1 rounded-lg inline-block ${
            statusColors[currentStatus]
          }`}>
            {statusLabels[currentStatus]}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">TAHMİN TESLİM TARİHİ</p>
          <p className="text-lg font-bold text-purple-900">
            {estimatedDeliveryDate
              ? formatDateOnly(new Date(estimatedDeliveryDate))
              : 'Bilgisi Yok'}
          </p>
        </div>

        {actualDeliveryDate && (
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">TESLİM TARİHİ</p>
            <p className="text-lg font-bold text-green-900">
              {formatDateOnly(new Date(actualDeliveryDate))}
            </p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 text-lg mb-6">Kargo Aşamaları</h3>

        {statusOrder.map((status, index) => {
          const isActive = index <= currentStatusIndex;
          const isCurrent = status === currentStatus;
          const event = events.find((e) => e.status === status);

          return (
            <div key={status} className="flex gap-4">
              {/* Timeline Nokta */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${
                    isCurrent
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isActive
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-gray-200 border-gray-300 text-gray-600'
                  }`}
                >
                  {getStatusIcon(status)}
                </div>

                {index < statusOrder.length - 1 && (
                  <div
                    className={`w-1 flex-1 my-2 ${
                      isActive ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>

              {/* Aşama Bilgileri */}
              <div className="flex-1 pb-4">
                <div className={`font-bold text-lg ${
                  isActive ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {statusLabels[status]}
                </div>

                {event && (
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-semibold">Tarih:</span> {formatDateOnly(new Date(event.date))}
                    </p>
                    {event.location && (
                      <p>
                        <span className="font-semibold">Konum:</span> {event.location}
                      </p>
                    )}
                    {event.notes && (
                      <p>
                        <span className="font-semibold">Not:</span> {event.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Uyarı */}
      {currentStatus === 'LOST' || currentStatus === 'CANCELLED' ? (
        <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-semibold">Bu kargo başarısız olmuştur</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
