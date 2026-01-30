'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { api, Invoice } from '@/lib/api';
import { formatDate } from '@/lib/date';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Re-fetch invoices when user context changes (tenant or location)
  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user?.tenantId, user?.locationId, user?.role]);

  const fetchInvoices = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      let data: Invoice[];

      // Super Admin: respect context if set, otherwise fetch all
      if (user.role === 'super_admin') {
        if (user.locationId) {
          // Super Admin switched to specific location context
          data = await api.getInvoicesByLocation(user.locationId);
        } else if (user.tenantId) {
          // Super Admin switched to specific tenant context
          data = await api.getInvoicesByTenant();
        } else {
          // Super Admin without context - fetch all
          data = await api.getInvoicesByTenant();
        }
      }
      // Location Users: fetch by location
      else if (user.role === 'location_user') {
        if (!user.locationId) {
          setError('Your account is not assigned to a location. Please contact your administrator.');
          setLoading(false);
          return;
        }
        data = await api.getInvoicesByLocation(user.locationId);
      }
      // Store Admins: fetch by tenant
      else if (user.role === 'store_admin') {
        if (!user.tenantId) {
          setError('Your account is not assigned to a shop. Please contact your administrator.');
          setLoading(false);
          return;
        }
        data = await api.getInvoicesByTenant();
      }
      else {
        setError('Unknown role. Please contact your administrator.');
        setLoading(false);
        return;
      }

      setInvoices(data);
      setError('');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching invoices:', error);
        setError(error.message || 'Failed to load invoices');
      } else {
        console.error('Error fetching invoices:', error);
        setError('Failed to load invoices');
      }
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
              <p className="mt-2 text-sm text-gray-600">View all invoices</p>
            </div>
            {user?.role === 'location_user' && (
              <Link
                href="/invoices/create"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Create Invoice
              </Link>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : invoices.length === 0 ? (
            <div className="rounded-lg bg-white shadow p-12 text-center">
              <p className="text-gray-500">No invoices found</p>
            </div>
          ) : (
            <div className="rounded-lg bg-white shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${Number(invoice.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${Number(invoice.tax_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.items?.some(item => item.discount && item.discount > 0) ? (
                          <span className="text-green-600 font-medium">
                            ${invoice.items.reduce((total, item) => {
                              if (item.discount && item.discount > 0 && item.original_price) {
                                return total + ((item.original_price - item.unit_price) * item.quantity);
                              }
                              return total;
                            }, 0).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

