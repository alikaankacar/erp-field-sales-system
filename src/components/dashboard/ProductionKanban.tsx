'use client';

// ============================================================================
// ÜRETİM KANBAN DASHBOARD
// ============================================================================
// Üretim aşamalarını Kanban görünümü ile göster (Pending, In Progress, Completed)

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { formatDateOnly, formatDateTime } from '@/lib/utils';
import { ProductionStageStatus } from '@prisma/client';

interface KanbanStage {
  id: string;
  stageNumber: number;
  stageName: string;
  status: ProductionStageStatus;
  productName: string;
  quantity: number;
  startedAt?: Date;
  completedAt?: Date;
  durationMinutes?: number;
}

interface ProductionKanbanProps {
  stages: Record<ProductionStageStatus, KanbanStage[]>;
  onStageClick?: (stageId: string) => void;
  isLoading?: boolean;
}

export function ProductionKanban({
  stages,
  onStageClick,
  isLoading = false,
}: ProductionKanbanProps) {
  const columns: ProductionStageStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'QUALITY_FAILED'];
  const columnTitles: Record<ProductionStageStatus, string> = {
    PENDING: '⏳ Bekleme',
    IN_PROGRESS: '⚙️ İşlemde',
    COMPLETED: '✅ Tamamlandı',
    QUALITY_FAILED: '❌ Kalite Başarısız',
    PAUSED: '⏸️ Duraklatıldı',
    REJECTED: '🗑️ Reddedildi',
  };

  const getStatusColor = (status: ProductionStageStatus) => {
    const colors = {
      PENDING: 'bg-gray-100 border-gray-300',
      IN_PROGRESS: 'bg-blue-50 border-blue-300',
      COMPLETED: 'bg-green-50 border-green-300',
      QUALITY_FAILED: 'bg-red-50 border-red-300',
      PAUSED: 'bg-yellow-50 border-yellow-300',
      REJECTED: 'bg-red-100 border-red-400',
    };
    return colors[status] || 'bg-gray-50 border-gray-300';
  };

  const getCardIcon = (status: ProductionStageStatus) => {
    const icons = {
      PENDING: <Clock className="w-4 h-4 text-gray-600" />,
      IN_PROGRESS: <Zap className="w-4 h-4 text-blue-600" />,
      COMPLETED: <CheckCircle className="w-4 h-4 text-green-600" />,
      QUALITY_FAILED: <AlertCircle className="w-4 h-4 text-red-600" />,
      PAUSED: <Clock className="w-4 h-4 text-yellow-600" />,
      REJECTED: <AlertCircle className="w-4 h-4 text-red-700" />,
    };
    return icons[status];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 overflow-x-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Üretim Hattı Durumu</h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((status) => (
            <div key={status} className="min-w-0">
              {/* Kolon Başlığı */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">{columnTitles[status]}</h3>
                <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                  {stages[status]?.length || 0}
                </span>
              </div>

              {/* Kartlar */}
              <div className="space-y-3">
                {stages[status] && stages[status].length > 0 ? (
                  stages[status].map((stage) => (
                    <div
                      key={stage.id}
                      onClick={() => onStageClick?.(stage.id)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition hover:shadow-md ${
                        getStatusColor(status)
                      }`}
                    >
                      {/* Kart Başlığı */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-sm">
                            Aşama {stage.stageNumber}: {stage.stageName}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">{stage.productName}</p>
                        </div>
                        {getCardIcon(status)}
                      </div>

                      {/* Kart Bilgileri */}
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center bg-white/50 p-2 rounded">
                          <span className="text-gray-600">Miktar:</span>
                          <span className="font-bold text-gray-900">{stage.quantity} adet</span>
                        </div>

                        {stage.status === 'IN_PROGRESS' && stage.startedAt && (
                          <div className="text-gray-600">
                            Başlangıç: {formatDateTime(new Date(stage.startedAt))}
                          </div>
                        )}

                        {stage.status === 'COMPLETED' && stage.completedAt && (
                          <div className="text-green-700 font-semibold">
                            Tamamlama: {formatDateTime(new Date(stage.completedAt))}
                          </div>
                        )}

                        {stage.durationMinutes && (
                          <div className="text-gray-600">
                            Süre: {stage.durationMinutes} dakika
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Gösterilecek iş yok</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
