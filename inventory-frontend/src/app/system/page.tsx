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
  branchCount: number;
};

type BranchItem = {
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
  branchName: string | null;
};

type InventoryItem = {
  id: string;
  productName: string;
  brand: string;
  size: string;
  quantity: number;
  branchName: string;
  tenantName: string;
};

type RevenueItem = {
  tenantName: string;
  totalRevenue: number;
  invoiceCount: number;
};

export default function SystemPage() {
  const tenantsSectionRef = useRef<HTMLDivElement>(null);
  const branchesSectionRef = useRef<HTMLDivElement>(null);
  const usersSectionRef = useRef<HTMLDivElement>(null);
  const inventorySectionRef = useRef<HTMLDivElement>(null);
  const revenueSectionRef = useRef<HTMLDivElement>(null);

  type Overview = {
    summary: {
      totalTenants: number;
      totalBranches: number;
      totalUsers: number;
      totalInventoryItems: number;
      totalRevenueLast30Days: number;
    };
    tenants: TenantItem[];
    branches: BranchItem[];
    users: UserItem[];
    inventoryItems: InventoryItem[];
    revenue: {
      total: number;
      byTenant: RevenueItem[];
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
      case 'branches':
        ref = branchesSectionRef as React.RefObject<HTMLDivElement>;
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
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Overview</h1>
            <p className="mt-2 text-sm text-gray-600">Complete system statistics</p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : overview ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                <button
                  onClick={() => handleCardClick('tenants')}
                  className="rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow cursor-pointer text-left"
                >
                  <div className="text-sm font-medium text-gray-500">Total Tenants</div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">
                    {overview.summary.totalTenants}
                  </div>
                  <div className="mt-2 text-xs text-blue-600">Click to view →</div>
                </button>
                <button
                  onClick={() => handleCardClick('branches')}
                  className="rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow cursor-pointer text-left"
                >
                  <div className="text-sm font-medium text-gray-500">Total Branches</div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">
                    {overview.summary.totalBranches}
                  </div>
                  <div className="mt-2 text-xs text-blue-600">Click to view →</div>
                </button>
                <button
                  onClick={() => handleCardClick('users')}
                  className="rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow cursor-pointer text-left"
                >
                  <div className="text-sm font-medium text-gray-500">Total Users</div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">
                    {overview.summary.totalUsers}
                  </div>
                  <div className="mt-2 text-xs text-blue-600">Click to view →</div>
                </button>
                <button
                  onClick={() => handleCardClick('inventory')}
                  className="rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow cursor-pointer text-left"
                >
                  <div className="text-sm font-medium text-gray-500">Inventory Items</div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">
                    {overview.summary.totalInventoryItems}
                  </div>
                  <div className="mt-2 text-xs text-blue-600">Click to view →</div>
                </button>
                <button
                  onClick={() => handleCardClick('revenue')}
                  className="rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow cursor-pointer text-left"
                >
                  <div className="text-sm font-medium text-gray-500">Total Revenue</div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">
                    ${Number(overview.summary?.totalRevenueLast30Days ?? 0).toFixed(2)}
                  </div>
                  <div className="mt-2 text-xs text-blue-600">Click to view →</div>
                </button>
              </div>

              {overview.tenants && overview.tenants.length > 0 && (
                <div ref={tenantsSectionRef} className="rounded-lg bg-white shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Tenants</h2>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Branches
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {overview.tenants.map((tenant) => (
                        <tr key={tenant.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {tenant.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                tenant.subscriptionStatus === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : tenant.subscriptionStatus === 'suspended'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {tenant.subscriptionStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {tenant.branchCount || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(tenant.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {overview.branches && overview.branches.length > 0 && (
                <div ref={branchesSectionRef} className="rounded-lg bg-white shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Branches</h2>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tenant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Phone
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {overview.branches.map((branch) => (
                        <tr key={branch.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {branch.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {branch.tenantName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {branch.address || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {branch.phone || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {overview.users && overview.users.length > 0 && (
                <div ref={usersSectionRef} className="rounded-lg bg-white shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Users</h2>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tenant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Branch
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {overview.users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.tenantName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.branchName || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {overview.inventoryItems && overview.inventoryItems.length > 0 && (
                <div ref={inventorySectionRef} className="rounded-lg bg-white shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Inventory Items</h2>
                    <p className="text-xs text-gray-500 mt-1">Showing up to 100 most recent items</p>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Brand/Size
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Branch
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tenant
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {overview.inventoryItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.productName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.brand} / {item.size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.branchName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.tenantName}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {overview.revenue && (
                <div ref={revenueSectionRef} className="rounded-lg bg-white shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Revenue (Last 30 Days)</h2>
                    <p className="text-sm text-gray-900 mt-1">
                      Total: ${Number(overview.revenue.total || 0).toFixed(2)}
                    </p>
                  </div>
                  {overview.revenue.byTenant && overview.revenue.byTenant.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Tenant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Total Revenue
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Invoice Count
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {overview.revenue.byTenant.map((revenue, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {revenue.tenantName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${Number(revenue.totalRevenue || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {revenue.invoiceCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="px-6 py-8 text-center text-gray-900">
                      No revenue data for the last 30 days
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No data available</div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
