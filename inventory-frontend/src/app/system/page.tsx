'use client';

import { useEffect, useState, useRef } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/date';

type TenantItem = {
  id: string;
  name: string;
  subscriptionStatus: string;
  createdAt: string | Date;
  locationCount: number;
};

type LocationItem = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  tenantName: string;
};

type UserItem = {
  id: string;
  email: string;
  role: string;
  tenantName: string | null;
  locationName: string | null;
};

type InventoryItem = {
  id: string;
  productName: string;
  variantName: string;
  quantity: number;
  locationName: string;
  tenantName: string;
};

type RevenueItem = {
  tenantName: string;
  totalRevenue: number;
  invoiceCount: number;
};

type LocationRevenueItem = {
  tenantName: string;
  locationName: string;
  totalRevenue: number;
  invoiceCount: number;
};

export default function SystemPage() {
  const tenantsSectionRef = useRef<HTMLDivElement>(null);
  const locationsSectionRef = useRef<HTMLDivElement>(null);
  const usersSectionRef = useRef<HTMLDivElement>(null);
  const inventorySectionRef = useRef<HTMLDivElement>(null);
  const revenueSectionRef = useRef<HTMLDivElement>(null);

  type Overview = {
    summary: {
      totalTenants: number;
      totalLocations: number;
      totalUsers: number;
      totalInventoryItems: number;
      totalRevenueLast30Days: number;
    };
    tenants: TenantItem[];
    locations: LocationItem[];
    users: UserItem[];
    inventoryItems: InventoryItem[];
    revenue: {
      total: number;
      byTenant: RevenueItem[];
      byLocation?: LocationRevenueItem[];
    };
  };

  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const data = await api.getSystemOverview();
      setOverview(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (type: string) => {
    let ref: React.RefObject<HTMLDivElement> | null = null;

    switch (type) {
      case 'tenants':
        ref = tenantsSectionRef as React.RefObject<HTMLDivElement>;
        break;
      case 'locations':
        ref = locationsSectionRef as React.RefObject<HTMLDivElement>;
        break;
      case 'users':
        ref = usersSectionRef as React.RefObject<HTMLDivElement>;
        break;
      case 'inventory':
        ref = inventorySectionRef as React.RefObject<HTMLDivElement>;
        break;
      case 'revenue':
        ref = revenueSectionRef as React.RefObject<HTMLDivElement>;
        break;
    }

    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ProtectedRoute allowedRoles={['super_admin']}>
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900">System Overview</h1>
            <p className="mt-2 text-base text-gray-600">Complete system statistics and analytics</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-red-50 p-4 ring-1 ring-red-200">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-red-600 mt-0.5 mr-3 shrink-0"
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
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
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
                <p className="mt-4 text-gray-600">Loading system overview...</p>
              </div>
            </div>
          ) : overview ? (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                <button
                  onClick={() => handleCardClick('tenants')}
                  className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 p-6 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1 cursor-pointer text-left"
                >
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
                      {overview.summary.totalTenants}
                    </div>
                    <div className="mt-3 flex items-center text-xs font-semibold text-blue-100 group-hover:text-white">
                      Click to view
                      <svg
                        className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1"
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
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
                  <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-white/5"></div>
                </button>

                <button
                  onClick={() => handleCardClick('locations')}
                  className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-500 to-indigo-600 p-6 shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-1 cursor-pointer text-left"
                >
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
                      {overview.summary.totalLocations}
                    </div>
                    <div className="mt-3 flex items-center text-xs font-semibold text-indigo-100 group-hover:text-white">
                      Click to view
                      <svg
                        className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1"
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
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
                  <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-white/5"></div>
                </button>

                <button
                  onClick={() => handleCardClick('users')}
                  className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-purple-500 to-purple-600 p-6 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-1 cursor-pointer text-left"
                >
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
                      {overview.summary.totalUsers}
                    </div>
                    <div className="mt-3 flex items-center text-xs font-semibold text-purple-100 group-hover:text-white">
                      Click to view
                      <svg
                        className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1"
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
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
                  <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-white/5"></div>
                </button>

                <button
                  onClick={() => handleCardClick('inventory')}
                  className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-600 p-6 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-1 cursor-pointer text-left"
                >
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
                    <div className="text-sm font-medium text-emerald-100">Inventory Items</div>
                    <div className="mt-2 text-4xl font-bold text-white">
                      {overview.summary.totalInventoryItems}
                    </div>
                    <div className="mt-3 flex items-center text-xs font-semibold text-emerald-100 group-hover:text-white">
                      Click to view
                      <svg
                        className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1"
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
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
                  <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-white/5"></div>
                </button>

                <button
                  onClick={() => handleCardClick('revenue')}
                  className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-red-500 to-red-600 p-6 shadow-lg shadow-red-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-1 cursor-pointer text-left"
                >
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
                    <div className="text-sm font-medium text-white">Total Revenue</div>
                    <div className="mt-2 text-4xl font-bold text-white">
                      ${Number(overview.summary?.totalRevenueLast30Days ?? 0).toFixed(2)}
                    </div>
                    <div className="mt-3 flex items-center text-xs font-semibold text-white">
                      Click to view
                      <svg
                        className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1"
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
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10"></div>
                  <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-white/5"></div>
                </button>
              </div>

              {overview.tenants && overview.tenants.length > 0 && (
                <div
                  ref={tenantsSectionRef}
                  className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-200/50 overflow-hidden"
                >
                  <div className="bg-linear-to-r from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Shops</h2>
                    <p className="mt-1 text-sm text-gray-600">All registered shops</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Locations
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Created
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {overview.tenants.map((tenant) => (
                          <tr
                            key={tenant.id}
                            className="transition-colors duration-150 hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-gray-200">
                                  <svg
                                    className="h-5 w-5 text-blue-600"
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
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {tenant.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${tenant.subscriptionStatus === 'active'
                                  ? 'bg-green-100 text-green-800 ring-1 ring-green-200'
                                  : tenant.subscriptionStatus === 'suspended'
                                    ? 'bg-red-100 text-red-800 ring-1 ring-red-200'
                                    : 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200'
                                  }`}
                              >
                                {tenant.subscriptionStatus === 'active' && (
                                  <svg
                                    className="mr-1.5 h-3 w-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                                {tenant.subscriptionStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {tenant.locationCount || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatDate(tenant.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {overview.locations && overview.locations.length > 0 && (
                <div
                  ref={locationsSectionRef}
                  className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-200/50 overflow-hidden"
                >
                  <div className="bg-linear-to-r from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Locations</h2>
                    <p className="mt-1 text-sm text-gray-600">All store locations across shops</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Shop
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Address
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Phone
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {overview.locations.map((location) => (
                          <tr
                            key={location.id}
                            className="transition-colors duration-150 hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-gray-200">
                                  <svg
                                    className="h-5 w-5 text-purple-600"
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
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {location.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {location.tenantName}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {location.address || <span className="text-gray-400">N/A</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {location.phone || <span className="text-gray-400">N/A</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {overview.users && overview.users.length > 0 && (
                <div
                  ref={usersSectionRef}
                  className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-200/50 overflow-hidden"
                >
                  <div className="bg-linear-to-r from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Users</h2>
                    <p className="mt-1 text-sm text-gray-600">All system users across shops</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Shop
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Location
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {overview.users.map((user) => (
                          <tr
                            key={user.id}
                            className="transition-colors duration-150 hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-gray-200">
                                  <svg
                                    className="h-5 w-5 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 ring-1 ring-blue-200">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {user.tenantName || <span className="text-gray-400">N/A</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {user.locationName || <span className="text-gray-400">N/A</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {overview.inventoryItems && overview.inventoryItems.length > 0 && (
                <div
                  ref={inventorySectionRef}
                  className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-200/50 overflow-hidden"
                >
                  <div className="bg-linear-to-r from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Inventory Items</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Showing up to 100 most recent items
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Variant Name
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Shop
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {overview.inventoryItems.map((item) => (
                          <tr
                            key={item.id}
                            className="transition-colors duration-150 hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {item.productName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {item.variantName}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {item.locationName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {item.tenantName}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {overview.revenue && (
                <div
                  ref={revenueSectionRef}
                  className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-200/50 overflow-hidden"
                >
                  <div className="bg-linear-to-r from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Revenue (Last 30 Days)</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Total: <span className="font-bold text-gray-900">${Number(overview.revenue.total || 0).toFixed(2)}</span>
                    </p>
                  </div>
                  {overview.revenue.byTenant && overview.revenue.byTenant.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Shop
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Total Revenue
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Invoice Count
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {overview.revenue.byTenant.map((revenue, index) => (
                            <tr
                              key={index}
                              className="transition-colors duration-150 hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-amber-500 to-orange-500 text-white font-semibold">
                                    <svg
                                      className="h-5 w-5"
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
                                  <div className="ml-4">
                                    <div className="text-sm font-semibold text-gray-900">
                                      {revenue.tenantName}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-bold text-gray-900">
                                  ${Number(revenue.totalRevenue || 0).toFixed(2)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                  {revenue.invoiceCount}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="px-6 py-12 text-center">
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
                      <p className="mt-4 text-gray-600">No revenue data for the last 30 days</p>
                    </div>
                  )}

                  {/* Location-wise Revenue Breakdown */}
                  {overview.revenue.byLocation && overview.revenue.byLocation.length > 0 && (
                    <div className="mt-8 border-t border-gray-200">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
                        <h3 className="text-lg font-bold text-gray-900">Revenue by Location</h3>
                        <p className="mt-1 text-xs text-gray-600">Detailed breakdown by store location</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Shop
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Location
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Total Revenue
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Invoice Count
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {overview.revenue.byLocation.map((revenue, index) => (
                              <tr
                                key={index}
                                className="transition-colors duration-150 hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                      <svg
                                        className="h-5 w-5"
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
                                    <div className="ml-4">
                                      <div className="text-sm font-semibold text-gray-900">
                                        {revenue.tenantName}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
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
                                    <div className="ml-3">
                                      <div className="text-sm font-semibold text-gray-900">
                                        {revenue.locationName}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-bold text-emerald-600">
                                    ${Number(revenue.totalRevenue || 0).toFixed(2)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
                                    {revenue.invoiceCount}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
