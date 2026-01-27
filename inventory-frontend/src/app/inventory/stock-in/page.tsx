'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { api, ProductVariant, Branch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function StockInPage() {
  const { user } = useAuth();
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productVariantId: '',
    quantity: '',
    costPrice: '',
    sellingPrice: '',
    branchId: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchProducts();
    } else {
      setVariants([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  useEffect(() => {
    // Store Admin or Super Admin can pick branch; Branch User already scoped
    const fetchBranches = async () => {
      if (user?.role === 'store_admin' || user?.role === 'super_admin') {
        try {
          const data = await api.getBranches();
          setBranches(data);
        } catch (err) {
          console.error('Failed to load branches', err);
        }
      }
    };
    fetchBranches();
  }, [user?.role]);

  const searchProducts = async () => {
    try {
      const data = await api.searchProducts(searchTerm);
      setVariants(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.productVariantId) {
        setError('Please select a product');
        setLoading(false);
        return;
      }

      if (!formData.quantity || parseInt(formData.quantity) <= 0) {
        setError('Please enter a valid quantity');
        setLoading(false);
        return;
      }

      if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) {
        setError('Please enter a valid cost price');
        setLoading(false);
        return;
      }

      if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
        setError('Please enter a valid selling price');
        setLoading(false);
        return;
      }

      // Determine branch ID
      const branchIdToUse =
        user?.role === 'branch_user'
          ? user?.branchId
          : formData.branchId || user?.branchId;

      if (!branchIdToUse) {
        setError('Branch is required. Please select a branch.');
        setLoading(false);
        return;
      }

      // Make API call
      await api.stockIn({
        productVariantId: formData.productVariantId,
        quantity: parseInt(formData.quantity),
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        branchId: branchIdToUse,
      });

      setSuccess('Stock added successfully!');
      setFormData({
        productVariantId: '',
        quantity: '',
        costPrice: '',
        sellingPrice: '',
        branchId: '',
      });
      setSearchTerm('');
      setVariants([]);
    } catch (error) {
      console.error('Stock in error:', error);
      setError(error instanceof Error ? error.message : 'Failed to add stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Stock In</h1>
            <p className="mt-2 text-base text-gray-600">Add inventory items to branch</p>
          </div>

          {/* Error Message */}
          {error && (
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
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="rounded-xl bg-green-50 p-4 ring-1 ring-green-200">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Search */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Search Product (Name, Brand, or Size)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type to search products..."
                    className="block w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                {variants.length > 0 && (
                  <div className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg ring-1 ring-gray-200/50">
                    {variants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, productVariantId: variant.id });
                          setSearchTerm(
                            `${variant.product?.name || ''} - ${variant.brand} - ${variant.size}`
                          );
                          setVariants([]);
                        }}
                        className="w-full px-4 py-3 text-left transition-colors duration-150 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-semibold text-gray-900">
                          {variant.product?.name} - {variant.brand} - {variant.size}
                        </div>
                        {variant.product?.category && (
                          <div className="text-sm text-gray-500 mt-1">{variant.product.category}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Quantity *</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Enter quantity"
                  />
                </div>
              </div>

              {/* Branch Selection (for Store Admin/Super Admin) */}
              {(user?.role === 'store_admin' || user?.role === 'super_admin') && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Branch *</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg
                        className="h-5 w-5 text-gray-400"
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
                    <select
                      required
                      value={formData.branchId}
                      onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                      className="block w-full appearance-none rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-10 py-3 text-gray-900 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Select a branch</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Cost Price *</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      className="block w-full rounded-xl border border-gray-300 bg-gray-50 pl-8 pr-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Selling Price *
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                      className="block w-full rounded-xl border border-gray-300 bg-gray-50 pl-8 pr-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading || !formData.productVariantId}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
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
                      Adding Stock...
                    </>
                  ) : (
                    <>
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Add Stock
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

