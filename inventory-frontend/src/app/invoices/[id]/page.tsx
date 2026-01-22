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
          <div className="text-center py-12">Loading...</div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error || !invoice) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error || 'Invoice not found'}</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice {invoice.invoice_number || 'N/A'}</h1>
            <p className="mt-2 text-sm text-gray-600">
              Created: {invoice.created_at ? formatDate(invoice.created_at, true) : 'N/A'}
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-500">Branch</div>
                <div className="text-lg font-semibold">{invoice.branch?.name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Invoice Number</div>
                <div className="text-lg font-semibold">{invoice.invoice_number}</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Items</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm">
                        {item.product_variant?.product?.name} - {item.product_variant?.brand} -{' '}
                        {item.product_variant?.size}
                      </td>
                      <td className="px-4 py-3 text-sm">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm">${Number(item.unit_price).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        ${Number(item.subtotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>
                      $
                      {(
                        Number(invoice.total_amount) - Number(invoice.tax_amount)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span>${Number(invoice.tax_amount).toFixed(2)}</span>
                  </div>
                  {invoice.change_amount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Change:</span>
                      <span>${Number(invoice.change_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${Number(invoice.total_amount).toFixed(2)}</span>
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

