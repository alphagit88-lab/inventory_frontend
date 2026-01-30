'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function ReportsPage() {
  const { user } = useAuth();
  const [profit, setProfit] = useState<{
    totalRevenue: number;
    totalCost: number;
    profit: number;
    invoiceCount: number;
  } | null>(null);
  const [dailySales, setDailySales] = useState<{
    totalRevenue: number;
    totalInvoices: number;
  } | null>(null);
  const [stockReport, setStockReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
    selectedDate: string;
  }>({
    startDate: '',
    endDate: '',
    selectedDate: '',
  });
  const [mounted, setMounted] = useState(false);

  // Initialize dates on client-side only to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined' && !mounted) {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      setDateRange({
        startDate: thirtyDaysAgo.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
        selectedDate: today.toISOString().split('T')[0],
      });
      setMounted(true);
    }
  }, [mounted]);

  const fetchProfit = async () => {
    if (!user?.locationId) return;
    setLoading(true);
    try {
      const data = await api.calculateProfit(
        user.locationId,
        dateRange.startDate,
        dateRange.endDate
      );
      setProfit(data);
    } catch (error) {
      console.error('Failed to fetch profit:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailySales = async () => {
    if (!user?.locationId) return;
    setLoading(true);
    try {
      const data = await api.getDailySales(user.locationId, dateRange.selectedDate);
      setDailySales(data);
    } catch (error) {
      console.error('Failed to fetch daily sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockReport = async () => {
    if (!user?.locationId) return;
    setLoading(true);
    try {
      const data = await api.getLocalStockReport(user.locationId);
      setStockReport(data);
    } catch (error) {
      console.error('Failed to fetch stock report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch reports when location context changes
  useEffect(() => {
    if (user?.locationId && mounted && dateRange.startDate && dateRange.endDate && dateRange.selectedDate) {
      fetchProfit();
      fetchDailySales();
      fetchStockReport();
    }
  }, [user?.locationId, dateRange.startDate, dateRange.endDate, dateRange.selectedDate, mounted]);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Reports</h1>
            <p className="mt-2 text-base text-gray-600">View sales, profit, and inventory reports</p>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="rounded-xl bg-blue-50 p-4 ring-1 ring-blue-200">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 animate-spin text-blue-600 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="text-sm font-medium text-blue-800">Loading reports...</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit Report Card */}
            <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200/50">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Profit Report</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Start Date</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, startDate: e.target.value })
                        }
                        className="block w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-4 py-3 text-gray-900 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">End Date</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        className="block w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-4 py-3 text-gray-900 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
                {loading && !profit ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center">
                      <svg
                        className="h-6 w-6 animate-spin text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">Loading profit data...</p>
                    </div>
                  </div>
                ) : profit ? (
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Revenue:</span>
                      <span className="text-base font-bold text-gray-900">
                        ${Number(profit.totalRevenue ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Cost:</span>
                      <span className="text-base font-bold text-gray-900">
                        ${Number(profit.totalCost ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="text-lg font-bold text-gray-900">Profit:</span>
                      <span className="text-2xl font-bold text-emerald-600">
                        ${Number(profit.profit ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 pt-2">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {profit.invoiceCount} invoices
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Daily Sales Card */}
            <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200/50">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Daily Sales</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Date</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      type="date"
                      value={dateRange.selectedDate}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, selectedDate: e.target.value })
                      }
                      className="block w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-4 py-3 text-gray-900 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
                {loading && !dailySales ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center">
                      <svg
                        className="h-6 w-6 animate-spin text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">Loading daily sales...</p>
                    </div>
                  </div>
                ) : dailySales ? (
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Revenue:</span>
                      <span className="text-lg font-bold text-gray-900">
                        ${Number(dailySales.totalRevenue ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Invoices:</span>
                      <span className="text-lg font-bold text-gray-900">{dailySales.totalInvoices}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Inventory Summary Card */}
            <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200/50 lg:col-span-2">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Inventory Summary</h2>
              </div>
              {loading && !stockReport ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center">
                    <svg
                      className="h-6 w-6 animate-spin text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Loading inventory data...</p>
                  </div>
                </div>
              ) : stockReport ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-center ring-1 ring-blue-200">
                      <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
                        Total Items
                      </div>
                      <div className="text-3xl font-bold text-blue-800">{stockReport.totalItems}</div>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center ring-1 ring-emerald-200">
                      <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                        Total Value
                      </div>
                      <div className="text-3xl font-bold text-emerald-800">
                        ${Number(stockReport.totalValue ?? 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-base font-bold text-gray-900">Low Stock Items</span>
                      <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 ring-1 ring-red-200">
                        {stockReport.lowStockItems?.length || 0}
                      </span>
                    </div>
                    {stockReport.lowStockItems && stockReport.lowStockItems.length > 0 ? (
                      <div className="max-h-48 overflow-y-auto space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        {stockReport.lowStockItems.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center rounded-lg bg-white p-3 ring-1 ring-gray-200"
                          >
                            <span className="text-sm font-medium text-gray-900">
                              {item.product_variant?.product?.name} ({item.product_variant?.size})
                            </span>
                            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                              {item.quantity} left
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg bg-gray-50 p-4 text-center">
                        <p className="text-sm text-gray-500 italic">No items strictly low on stock.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

