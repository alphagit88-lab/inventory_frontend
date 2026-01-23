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
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    selectedDate: new Date().toISOString().split('T')[0],
  });

  const fetchProfit = async () => {
    if (!user?.branchId) return;
    setLoading(true);
    try {
      const data = await api.calculateProfit(
        user.branchId,
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
    if (!user?.branchId) return;
    setLoading(true);
    try {
      const data = await api.getDailySales(user.branchId, dateRange.selectedDate);
      setDailySales(data);
    } catch (error) {
      console.error('Failed to fetch daily sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockReport = async () => {
    if (!user?.branchId) return;
    setLoading(true);
    try {
      const data = await api.getLocalStockReport(user.branchId);
      setStockReport(data);
    } catch (error) {
      console.error('Failed to fetch stock report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.branchId) {
      fetchProfit();
      fetchDailySales();
      fetchStockReport();
    }
  }, [user, dateRange.startDate, dateRange.endDate, dateRange.selectedDate]);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="mt-2 text-sm text-gray-600">View sales and profit reports</p>
          </div>

          {loading && (
            <div className="rounded-md bg-blue-50 p-4">
              <p className="text-sm text-blue-800">Loading reports...</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Profit Report</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, startDate: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black">End Date</label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                </div>
                {loading && !profit ? (
                  <div className="text-center py-8 text-gray-500">Loading profit data...</div>
                ) : profit ? (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="font-semibold">${Number(profit.totalRevenue ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="font-semibold">${Number(profit.totalCost ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Profit:</span>
                      <span className="text-green-600">${Number(profit.profit ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {profit.invoiceCount} invoices
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Daily Sales</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black">Date</label>
                  <input
                    type="date"
                    value={dateRange.selectedDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, selectedDate: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>
                {loading && !dailySales ? (
                  <div className="text-center py-8 text-gray-500">Loading daily sales...</div>
                ) : dailySales ? (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="font-semibold">
                        ${Number(dailySales.totalRevenue ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Invoices:</span>
                      <span className="font-semibold">{dailySales.totalInvoices}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* New Inventory Summary Card */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Inventory Summary</h2>
              {loading && !stockReport ? (
                <div className="text-center py-8 text-gray-500">Loading inventory data...</div>
              ) : stockReport ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-xs text-blue-600 font-medium uppercase">Total Items</div>
                      <div className="text-2xl font-bold text-blue-800">{stockReport.totalItems}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-xs text-green-600 font-medium uppercase">Total Value</div>
                      {/* Ensure totalValue is treated as number before toFixed */}
                      <div className="text-xl font-bold text-green-800">${Number(stockReport.totalValue ?? 0).toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-medium">Low Stock Items</span>
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                        {stockReport.lowStockItems?.length || 0}
                      </span>
                    </div>
                    {stockReport.lowStockItems && stockReport.lowStockItems.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto text-sm space-y-2">
                        {stockReport.lowStockItems.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-gray-600 bg-gray-50 p-2 rounded">
                            <span>{item.product_variant?.product?.name} ({item.product_variant?.size})</span>
                            <span className="font-bold text-red-600">{item.quantity} left</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No items strictly low on stock.</p>
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

