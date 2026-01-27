'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { api, Product } from '@/lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', category: '' });
  const [variantData, setVariantData] = useState({ brand: '', size: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.createProduct(formData);
      setShowModal(false);
      setFormData({ name: '', category: '' });
      fetchProducts();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  const handleCreateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setError('');
    try {
      await api.createVariant(selectedProduct.id, variantData);
      setShowVariantModal(false);
      setVariantData({ brand: '', size: '' });
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      fetchProducts();
      } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Products</h1>
              <p className="mt-2 text-base text-gray-600">Manage products and variants</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30"
            >
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
              Create Product
            </button>
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
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : (
            /* Products List */
            <div className="space-y-4">
              {products.length === 0 ? (
                <div className="rounded-2xl bg-white p-12 text-center shadow-lg ring-1 ring-gray-200/50">
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
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <p className="mt-4 text-sm text-gray-500">No products found. Create your first product to get started.</p>
                </div>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200/50 transition-all duration-200 hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                            <svg
                              className="h-6 w-6"
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
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                            {product.category && (
                              <p className="text-sm text-gray-500 mt-1">
                                Category: <span className="font-medium text-gray-700">{product.category}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        {product.variants && product.variants.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Variants:</p>
                            <div className="flex flex-wrap gap-2">
                              {product.variants.map((variant) => (
                                <span
                                  key={variant.id}
                                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 text-xs font-semibold text-blue-800 ring-1 ring-blue-200"
                                >
                                  {variant.brand} - {variant.size}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowVariantModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all duration-200 hover:from-green-600 hover:to-emerald-700 hover:shadow-xl hover:shadow-green-500/30"
                        >
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
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          Add Variant
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50 hover:text-red-700"
                        >
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Create Product Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-gray-200/50">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Create Product</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleCreate} className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Product Name</label>
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
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="block w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter product name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Category</label>
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
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="block w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter category (optional)"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30"
                    >
                      Create Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Variant Modal */}
          {showVariantModal && selectedProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-gray-200/50">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Add Variant to {selectedProduct.name}
                  </h2>
                  <button
                    onClick={() => {
                      setShowVariantModal(false);
                      setSelectedProduct(null);
                    }}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleCreateVariant} className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Brand</label>
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
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        required
                        value={variantData.brand}
                        onChange={(e) => setVariantData({ ...variantData, brand: e.target.value })}
                        className="block w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter brand name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Size</label>
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
                            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        required
                        value={variantData.size}
                        onChange={(e) => setVariantData({ ...variantData, size: e.target.value })}
                        className="block w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter size"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowVariantModal(false);
                        setSelectedProduct(null);
                      }}
                      className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all duration-200 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:shadow-green-500/30"
                    >
                      Add Variant
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

