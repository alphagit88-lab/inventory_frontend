'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { api, Invoice } from '@/lib/api';
import { formatDate } from '@/lib/date';

export default function InvoiceDetailPage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (params.id && mounted) {
      fetchInvoice(params.id as string);
    }
  }, [params.id, mounted]);

  const fetchInvoice = async (id: string) => {
    if (!id || id.trim() === '') {
      setError('Invalid invoice ID');
      setLoading(false);
      return;
    }

    try {
      const data = await api.getInvoice(id);
      setInvoice(data);
      setError('');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching invoice:', error);
        setError(error.message || 'Failed to load invoice');
      } else {
        console.error('Error fetching invoice:', error);
        setError('Failed to load invoice');
      }
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted || loading) {
    return (
      <ProtectedRoute>
        <Layout>
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
              <p className="mt-4 text-gray-600">Loading invoice...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error || !invoice) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="rounded-xl bg-red-50 p-4 ring-1 ring-red-200">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0"
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
              <p className="text-sm font-medium text-red-800">{error || 'Invoice not found'}</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Invoice {invoice.invoice_number || 'N/A'}
              </h1>
              <p className="mt-2 text-base text-gray-600 flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Created: {invoice.created_at ? formatDate(invoice.created_at, true) : 'N/A'}
              </p>
            </div>
          </div>

          {/* Invoice Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 ring-1 ring-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-blue-200">
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
                <div>
                  <div className="text-xs font-medium text-blue-600 uppercase tracking-wider">Branch</div>
                  <div className="text-lg font-bold text-gray-900 mt-1">
                    {invoice.branch?.name || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-6 ring-1 ring-purple-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-purple-200">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-medium text-purple-600 uppercase tracking-wider">
                    Invoice Number
                  </div>
                  <div className="text-lg font-bold text-gray-900 mt-1">{invoice.invoice_number}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-200/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Items
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items?.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors duration-150 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.product_variant?.product?.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.product_variant?.brand} - {item.product_variant?.size}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${Number(item.unit_price).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          ${Number(item.subtotal).toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Section */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 ring-1 ring-emerald-100">
            <div className="flex justify-end">
              <div className="w-full max-w-md space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">Subtotal:</span>
                  <span className="text-gray-900 font-semibold">
                    $
                    {(Number(invoice.total_amount) - Number(invoice.tax_amount)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">Tax:</span>
                  <span className="text-gray-900 font-semibold">
                    ${Number(invoice.tax_amount).toFixed(2)}
                  </span>
                </div>
                {invoice.change_amount && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Change:</span>
                    <span className="text-gray-900 font-semibold">
                      ${Number(invoice.change_amount).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-emerald-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      ${Number(invoice.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

