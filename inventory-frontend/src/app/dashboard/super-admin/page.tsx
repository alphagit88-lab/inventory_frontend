'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { TenantLocationSelector } from '@/components/TenantLocationSelector';
import { api } from '@/lib/api';
import Link from 'next/link';

interface OverviewSummary {
  totalTenants?: number;
  totalLocations?: number;
  totalUsers?: number;
  recentRevenue?: number;
}

interface Overview {
  summary?: OverviewSummary;
}

export default function SuperAdminDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await api.getSystemOverview();
        setOverview(data);
      } catch (error) {
        console.error('Failed to fetch overview:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['super_admin']}>
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="mt-2 text-base text-gray-600">System overview and shop management</p>
          </div>

          {/* Tenant/Location Context Selector */}
          <TenantLocationSelector onContextChange={() => {
            // Refresh dashboard when context changes
            setLoading(true);
            const fetchOverview = async () => {
              try {
                const data = await api.getSystemOverview();
                setOverview(data);
              } catch (error) {
                console.error('Failed to fetch overview:', error);
              } finally {
                setLoading(false);
              }
            };
            fetchOverview();
          }} />

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
          ) : overview ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Tenants Card */}
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-blue-100">Total Shops</div>
                  <div className="mt-2 text-4xl font-bold text-white">
                    {overview.summary?.totalTenants ?? 0}
                  </div>
                </div>
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
                <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-white/5"></div>
              </div>

              {/* Total Locations Card */}
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
                  <div className="text-sm font-medium text-indigo-100">Total Locations</div>
                  <div className="mt-2 text-4xl font-bold text-white">
                    {overview.summary?.totalLocations ?? 0}
                  </div>
                </div>
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
                <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-white/5"></div>
              </div>

              {/* Total Users Card */}
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
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-purple-100">Total Users</div>
                  <div className="mt-2 text-4xl font-bold text-white">
                    {overview.summary?.totalUsers ?? 0}
                  </div>
                </div>
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
                <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-white/5"></div>
              </div>

              {/* Recent Revenue Card */}
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
                  <div className="text-sm font-medium text-emerald-100">Recent Revenue</div>
                  <div className="mt-2 text-4xl font-bold text-white">
                    ${Number(overview.summary?.recentRevenue ?? 0).toFixed(2)}
                  </div>
                </div>
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
                <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-white/5"></div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-50 p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <p className="mt-4 text-gray-500">No data available</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
              <p className="mt-1 text-sm text-gray-600">Access key management features</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Link
                href="/tenants"
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative z-10">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Manage Shops</h3>
                  <p className="mt-2 text-sm text-gray-600">Create and manage shops</p>
                  <div className="mt-4 flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                    Go to Shops
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
                </div>
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-50 opacity-0 transition-opacity group-hover:opacity-100"></div>
              </Link>

              <Link
                href="/system"
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative z-10">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">System Overview</h3>
                  <p className="mt-2 text-sm text-gray-600">View detailed system statistics</p>
                  <div className="mt-4 flex items-center text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                    View System
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
                </div>
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-50 opacity-0 transition-opacity group-hover:opacity-100"></div>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

