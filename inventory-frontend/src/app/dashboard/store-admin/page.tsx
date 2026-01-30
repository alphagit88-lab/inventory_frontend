'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function StoreAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    locations: 0,
    products: 0,
    inventoryItems: 0,
    invoices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      // Only fetch stats if user has a tenantId
      if (!user?.tenantId) {
        setLoading(false);
        return;
      }
      
      try {
        const [locations, products, inventory, invoices] = await Promise.all([
          api.getLocations().catch(() => []),
          api.getProducts().catch(() => []),
          api.getInventoryByTenant().catch(() => []),
          api.getInvoicesByTenant().catch(() => []),
        ]);
        setStats({
          locations: locations.length,
          products: products.length,
          inventoryItems: inventory.length,
          invoices: invoices.length,
        });
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?.tenantId]);
  
  // Check if Store Admin has tenantId assigned
  if (user && !user.tenantId) {
    return (
      <ProtectedRoute allowedRoles={['store_admin']}>
        <Layout>
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Store Admin Dashboard</h1>
              <p className="mt-2 text-base text-gray-600">Manage your shop</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-6 ring-1 ring-amber-200">
              <div className="flex items-start">
                <svg
                  className="h-6 w-6 text-amber-600 mr-3 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-amber-900">Shop Assignment Required</h3>
                  <p className="mt-2 text-sm text-amber-800">
                    Your Store Admin account is not assigned to a shop. To use this system, you need to be assigned to a shop.
                  </p>
                  <p className="mt-4 text-sm text-amber-900 font-medium">
                    Please contact your Super Administrator to assign you to a shop, or register a new account with a shop assigned.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }
  
  if (error) {
    return (
      <ProtectedRoute allowedRoles={['store_admin']}>
        <Layout>
          <div className="rounded-2xl bg-red-50 p-6 ring-1 ring-red-200">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-red-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['store_admin']}>
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Store Admin Dashboard</h1>
            <p className="mt-2 text-base text-gray-600">Manage your store operations</p>
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Locations Card */}
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-blue-100">Locations</div>
                  <div className="mt-2 text-4xl font-bold text-white">{stats.locations}</div>
                  <Link
                    href="/locations"
                    className="mt-4 inline-flex items-center text-sm font-semibold text-blue-100 hover:text-white transition-colors"
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

              {/* Products Card */}
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
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-indigo-100">Products</div>
                  <div className="mt-2 text-4xl font-bold text-white">{stats.products}</div>
                  <Link
                    href="/products"
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

              {/* Inventory Items Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-1">
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
                  <div className="text-sm font-medium text-purple-100">Inventory Items</div>
                  <div className="mt-2 text-4xl font-bold text-white">{stats.inventoryItems}</div>
                  <Link
                    href="/inventory"
                    className="mt-4 inline-flex items-center text-sm font-semibold text-purple-100 hover:text-white transition-colors"
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

              {/* Invoices Card */}
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-emerald-100">Invoices</div>
                  <div className="mt-2 text-4xl font-bold text-white">{stats.invoices}</div>
                  <Link
                    href="/invoices"
                    className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-100 hover:text-white transition-colors"
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
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
              <p className="mt-1 text-sm text-gray-600">Access key management features</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/locations"
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Manage Locations</h3>
                <p className="mt-2 text-sm text-gray-600">Create and manage store locations</p>
                <div className="mt-4 flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                  Go to Locations
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
                href="/products"
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Manage Products</h3>
                <p className="mt-2 text-sm text-gray-600">Add products and variants</p>
                <div className="mt-4 flex items-center text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                  Go to Products
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
                href="/inventory"
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">View Inventory</h3>
                <p className="mt-2 text-sm text-gray-600">Check stock levels</p>
                <div className="mt-4 flex items-center text-sm font-semibold text-purple-600 group-hover:text-purple-700">
                  Go to Inventory
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
                href="/users"
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Manage Users</h3>
                <p className="mt-2 text-sm text-gray-600">Create location users</p>
                <div className="mt-4 flex items-center text-sm font-semibold text-emerald-600 group-hover:text-emerald-700">
                  Go to Users
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
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg">
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
                <p className="mt-2 text-sm text-gray-600">View sales and profit reports</p>
                <div className="mt-4 flex items-center text-sm font-semibold text-amber-600 group-hover:text-amber-700">
                  Go to Reports
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

