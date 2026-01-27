'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function BranchUserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    inventoryItems: 0,
    invoices: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.branchId) {
        setLoading(false);
        return;
      }

      try {
        const [inventory, invoices, dailySales] = await Promise.all([
          api.getInventoryByBranch(user.branchId).catch(() => []),
          api.getInvoicesByBranch(user.branchId).catch(() => []),
          api.getDailySales(user.branchId).catch(() => ({ totalRevenue: 0 })),
        ]);
        setStats({
          inventoryItems: inventory.length,
          invoices: invoices.length,
          todayRevenue: dailySales.totalRevenue || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['branch_user']}>
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Branch User Dashboard</h1>
            <p className="mt-2 text-base text-gray-600">Manage inventory and create invoices</p>
          </div>

          {/* Stats Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center">
                <svg
                  className="h-8 w-8 animate-spin text-blue-600"
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
                <p className="mt-4 text-gray-600">Loading dashboard data...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Inventory Items Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1">
                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                      <svg
                        className="h-6 w-6 text-white"
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
                  </div>
                  <div className="text-sm font-medium text-blue-100">Inventory Items</div>
                  <div className="mt-2 text-4xl font-bold text-white">{stats.inventoryItems}</div>
                  <Link
                    href="/inventory/stock-in"
                    className="mt-4 inline-flex items-center text-sm font-semibold text-blue-100 hover:text-white transition-colors"
                  >
                    Stock In
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
                <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-white/5"></div>
              </div>

              {/* Total Invoices Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-1">
                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                      <svg
                        className="h-6 w-6 text-white"
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
                    </div>
                  </div>
                  <div className="text-sm font-medium text-indigo-100">Total Invoices</div>
                  <div className="mt-2 text-4xl font-bold text-white">{stats.invoices}</div>
                  <Link
                    href="/invoices"
                    className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-100 hover:text-white transition-colors"
                  >
                    View all
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
                <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-white/5"></div>
              </div>

              {/* Today's Revenue Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-1">
                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                      <svg
                        className="h-6 w-6 text-white"
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
                  </div>
                  <div className="text-sm font-medium text-emerald-100">Today&apos;s Revenue</div>
                  <div className="mt-2 text-4xl font-bold text-white">
                    ${stats.todayRevenue.toFixed(2)}
                  </div>
                  <Link
                    href="/reports"
                    className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-100 hover:text-white transition-colors"
                  >
                    View reports
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
                <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-white/5"></div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
              <p className="mt-1 text-sm text-gray-600">Access key features quickly</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/inventory/stock-in"
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Stock In</h3>
                <p className="mt-2 text-sm text-gray-600">Add new inventory items</p>
                <div className="mt-4 flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                  Go to Stock In
                  <svg
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>

              <Link
                href="/invoices/create"
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Create Invoice</h3>
                <p className="mt-2 text-sm text-gray-600">Point of Sale (POS)</p>
                <div className="mt-4 flex items-center text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                  Create Now
                  <svg
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>

              <Link
                href="/invoices"
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">View Invoices</h3>
                <p className="mt-2 text-sm text-gray-600">Browse sales history</p>
                <div className="mt-4 flex items-center text-sm font-semibold text-purple-600 group-hover:text-purple-700">
                  View All
                  <svg
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>

              <Link
                href="/reports"
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Reports</h3>
                <p className="mt-2 text-sm text-gray-600">Daily sales and stock reports</p>
                <div className="mt-4 flex items-center text-sm font-semibold text-emerald-600 group-hover:text-emerald-700">
                  View Reports
                  <svg
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

