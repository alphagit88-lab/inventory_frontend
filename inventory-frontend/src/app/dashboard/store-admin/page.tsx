'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function StoreAdminDashboard() {
  const [stats, setStats] = useState({
    branches: 0,
    products: 0,
    inventoryItems: 0,
    invoices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [branches, products, inventory, invoices] = await Promise.all([
          api.getBranches().catch(() => []),
          api.getProducts().catch(() => []),
          api.getInventoryByTenant().catch(() => []),
          api.getInvoicesByTenant().catch(() => []),
        ]);
        setStats({
          branches: branches.length,
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
  }, []);
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }
  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }
  return (
    <ProtectedRoute allowedRoles={['store_admin']}>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Store Admin Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">Manage your store operations</p>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="text-sm font-medium text-gray-500">Branches</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">{stats.branches}</div>
                <Link href="/branches" className="mt-4 text-sm text-blue-600 hover:text-blue-700">
                  View all →
                </Link>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="text-sm font-medium text-gray-500">Products</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">{stats.products}</div>
                <Link href="/products" className="mt-4 text-sm text-blue-600 hover:text-blue-700">
                  View all →
                </Link>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="text-sm font-medium text-gray-500">Inventory Items</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">{stats.inventoryItems}</div>
                <Link href="/inventory" className="mt-4 text-sm text-blue-600 hover:text-blue-700">
                  View all →
                </Link>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="text-sm font-medium text-gray-500">Invoices</div>
                <div className="mt-2 text-3xl font-bold text-gray-900">{stats.invoices}</div>
                <Link href="/invoices" className="mt-4 text-sm text-blue-600 hover:text-blue-700">
                  View all →
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
                href="/branches"
                className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900">Manage Branches</h3>
                <p className="mt-2 text-sm text-gray-600">Create and manage store branches</p>
              </Link>
              <Link
                href="/products"
                className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900">Manage Products</h3>
                <p className="mt-2 text-sm text-gray-600">Add products and variants</p>
              </Link>
              <Link
                href="/inventory"
                className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900">View Inventory</h3>
                <p className="mt-2 text-sm text-gray-600">Check stock levels</p>
              </Link>
              <Link
                href="/users"
                className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
                <p className="mt-2 text-sm text-gray-600">Create branch users</p>
              </Link>
              <Link
                href="/reports"
                className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
                <p className="mt-2 text-sm text-gray-600">View sales and profit reports</p>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

