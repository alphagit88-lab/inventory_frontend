'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function SuperAdminDashboard() {
  const [overview, setOverview] = useState<any>(null);
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
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">System overview and tenant management</p>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : overview ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="text-sm font-medium text-gray-500">Total Tenants</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  {overview.summary?.totalTenants ?? 0}
                </div>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="text-sm font-medium text-gray-500">Total Branches</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  {overview.summary?.totalBranches ?? 0}
                </div>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="text-sm font-medium text-gray-500">Total Users</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  {overview.summary?.totalUsers ?? 0}
                </div>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="text-sm font-medium text-gray-500">Recent Revenue</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  ${Number(overview.summary?.recentRevenue ?? 0).toFixed(2)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No data available</div>
          )}

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/tenants"
                className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900">Manage Tenants</h3>
                <p className="mt-2 text-sm text-gray-600">Create and manage store tenants</p>
              </Link>
              <Link
                href="/system"
                className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900">System Overview</h3>
                <p className="mt-2 text-sm text-gray-600">View detailed system statistics</p>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

