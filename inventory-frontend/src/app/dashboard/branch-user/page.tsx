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
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Branch User Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">Manage inventory and create invoices</p>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="text-sm font-medium text-gray-500">Inventory Items</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">{stats.inventoryItems}</div>
                <Link
                  href="/inventory/stock-in"
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                >
                  Stock In →
                </Link>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="text-sm font-medium text-gray-500">Total Invoices</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">{stats.invoices}</div>
                <Link href="/invoices" className="mt-4 text-sm text-blue-600 hover:text-blue-700">
                  View all →
                </Link>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="text-sm font-medium text-gray-500">Today's Revenue</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">
                  ${stats.todayRevenue.toFixed(2)}
                </div>
                <Link href="/reports" className="mt-4 text-sm text-blue-600 hover:text-blue-700">
                  View reports →
                </Link>
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/inventory/stock-in"
                className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900">Stock In</h3>
                <p className="mt-2 text-sm text-gray-600">Add new inventory items</p>
              </Link>
              <Link
                href="/invoices/create"
                className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900">Create Invoice</h3>
                <p className="mt-2 text-sm text-gray-600">Point of Sale (POS)</p>
              </Link>
              <Link
                href="/invoices"
                className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900">View Invoices</h3>
                <p className="mt-2 text-sm text-gray-600">Browse sales history</p>
              </Link>
              <Link
                href="/reports"
                className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
                <p className="mt-2 text-sm text-gray-600">Daily sales and stock reports</p>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

