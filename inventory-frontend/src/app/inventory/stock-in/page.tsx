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
    } catch (error: any) {
      setError(error.message);
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
    } catch (error: any) {
      console.error('Stock in error:', error);
      setError(error.message || 'Failed to add stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stock In</h1>
            <p className="mt-2 text-sm text-gray-600">Add inventory items to branch</p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <div className="rounded-lg bg-white p-6 shadow">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black">
                  Search Product (Name, Brand, or Size)
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type to search..."
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
                {variants.length > 0 && (
                  <div className="mt-2 max-h-60 overflow-y-auto rounded-md border border-gray-200">
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
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">
                          {variant.product?.name} - {variant.brand} - {variant.size}
                        </div>
                        {variant.product?.category && (
                          <div className="text-sm text-gray-500">{variant.product.category}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black">Quantity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>

              {(user?.role === 'store_admin' || user?.role === 'super_admin') && (
                <div>
                  <label className="block text-sm font-medium text-black">Branch *</label>
                  <select
                    required
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">Select a branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black">Cost Price *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !formData.productVariantId}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Adding Stock...' : 'Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

