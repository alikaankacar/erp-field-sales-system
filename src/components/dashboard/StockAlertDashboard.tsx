'use client';

// ============================================================================
// STOK UYARI DASHBOARD'U
// ============================================================================
// Kritik stok seviyeleri, uyarılar, fazla stok uyarıları

import React, { useState } from 'react';
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Filter,
} from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface StockAlert {
  productId: string;
  sku: string;
  productName: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  status: 'critical' | 'warning' | 'normal' | 'overstock';
}

interface StockAlertDashboardProps {
  alerts: StockAlert[];
  summary?: {
    critical: number;
    warning: number;
    overstock: number;
  };
  onAdjustStock?: (productId: string) => void;
  isLoading?: boolean;
}

export function StockAlertDashboard({
  alerts,
  summary = { critical: 0, warning: 0, overstock: 0 },
  onAdjustStock,
  isLoading = false,
}: StockAlertDashboardProps) {
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'critical' | 'warning' | 'overstock'
  >('all');

  const filteredAlerts =
    filterStatus === 'all'
      ? alerts
      : alerts.filter((alert) => alert.status === filterStatus);

  const getStatusIcon = (status: 'critical' | 'warning' | 'normal' | 'overstock') => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'overstock':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const getStatusColor = (status: 'critical' | 'warning' | 'normal' | 'overstock') => {
    switch (status) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'overstock':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  const getStatusLabel = (status: 'critical' | 'warning' | 'normal' | 'overstock') => {
    switch (status) {
      case 'critical':
        return 'KRİTİK STOK';
      case 'warning':
        return 'UYARI';
      case 'overstock':
        return 'FAZLA STOK';
      default:
        return 'NORMAL';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Başlık */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Stok Uyarıları</h2>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border-2 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-semibold">KRİTİK</p>
              <p className="text-3xl font-bold text-red-900">{summary.critical}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border-2 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 font-semibold">UYARI</p>
              <p className="text-3xl font-bold text-orange-900">{summary.warning}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-semibold">FAZLA STOK</p>
              <p className="text-3xl font-bold text-blue-900">{summary.overstock}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-semibold">TOPLAM</p>
              <p className="text-3xl font-bold text-gray-900">{alerts.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Filtre */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-600" />
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
            filterStatus === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tümü
        </button>
        <button
          onClick={() => setFilterStatus('critical')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
            filterStatus === 'critical'
              ? 'bg-red-600 text-white'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          Kritik
        </button>
        <button
          onClick={() => setFilterStatus('warning')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
            filterStatus === 'warning'
              ? 'bg-orange-600 text-white'
              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
          }`}
        >
          Uyarı
        </button>
        <button
          onClick={() => setFilterStatus('overstock')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
            filterStatus === 'overstock'
              ? 'bg-blue-600 text-white'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          Fazla Stok
        </button>
      </div>

      {/* Uyarılar Tablosu */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredAlerts.length > 0 ? (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const percentageFilled = (alert.currentStock / alert.maxStockLevel) * 100;

            return (
              <div
                key={alert.productId}
                className={`border-2 rounded-lg p-4 ${getStatusColor(alert.status)}`}
              >
                {/* Üst Satır */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(alert.status)}
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{alert.productName}</h4>
                      <p className="text-xs text-gray-600 font-mono">SKU: {alert.sku}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    alert.status === 'critical'
                      ? 'bg-red-200 text-red-800'
                      : alert.status === 'warning'
                        ? 'bg-orange-200 text-orange-800'
                        : alert.status === 'overstock'
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-green-200 text-green-800'
                  }`}>
                    {getStatusLabel(alert.status)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Mevcut: {formatNumber(alert.currentStock)}</span>
                    <span>Maksimum: {formatNumber(alert.maxStockLevel)}</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        alert.status === 'critical'
                          ? 'bg-red-600'
                          : alert.status === 'warning'
                            ? 'bg-orange-600'
                            : alert.status === 'overstock'
                              ? 'bg-blue-600'
                              : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(percentageFilled, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Minimum: {formatNumber(alert.minStockLevel)}</span>
                    <span>{formatNumber(percentageFilled.toFixed(0))}%</span>
                  </div>
                </div>

                {/* İşlem Butonu */}
                {onAdjustStock && (
                  <button
                    onClick={() => onAdjustStock(alert.productId)}
                    className="w-full bg-white text-gray-700 border border-gray-300 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                  >
                    Stok Ayarla
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Tüm stok seviyeleri normal</p>
        </div>
      )}
    </div>
  );
}
