'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { api, ProductVariant } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface CartItem {
  productVariantId: string;
  variant: ProductVariant;
  quantity: number;
  unitPrice: number;
  originalPrice?: number;
  discount?: number;
  availableStock: number; // Track available stock for warnings
}

export default function CreateInvoicePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productCode, setProductCode] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [changeAmount, setChangeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchTerm.length > 2 || productCode.length > 0) {
      searchProducts();
    } else {
      setVariants([]);
    }
  }, [searchTerm, productCode]);

  // Location Users use their assigned location automatically
  // No need to fetch locations or allow selection

  const searchProducts = async () => {
    try {
      let data;
      if (productCode) {
        // Search by product code
        data = await api.searchProductsByCode(productCode);
      } else {
        // Search by name/brand/size
        data = await api.searchProducts(searchTerm);
      }
      setVariants(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  const addToCart = async (variant: ProductVariant) => {
    // Location Users can only use their assigned location
    const branchIdToUse = user?.locationId;

    if (!branchIdToUse) {
      setError('Location ID is required. Please contact admin to assign you to a location.');
      return;
    }

    try {
      const stock = await api.checkStock(branchIdToUse, variant.id);
      if (!stock.available || stock.quantity === 0) {
        setError('Product out of stock');
        return;
      }

      const existingItem = cart.find((item) => item.productVariantId === variant.id);
      if (existingItem) {
        if (existingItem.quantity >= stock.quantity) {
          setError('Insufficient stock');
          return;
        }
        setCart(
          cart.map((item) =>
            item.productVariantId === variant.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        const finalPrice = stock.discountedPrice ?? Number(stock.sellingPrice ?? 0);
        setCart([
          ...cart,
          {
            productVariantId: variant.id,
            variant,
            quantity: 1,
            unitPrice: finalPrice,
            originalPrice: Number(stock.sellingPrice ?? 0),
            discount: stock.discount,
            availableStock: stock.quantity,
          },
        ]);
      }
      setSearchTerm('');
      setVariants([]);
      setError('');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  const removeFromCart = (productVariantId: string) => {
    setCart(cart.filter((item) => item.productVariantId !== productVariantId));
  };

  const updateQuantity = (productVariantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productVariantId);
      return;
    }

    // Check if requested quantity exceeds available stock
    const item = cart.find(i => i.productVariantId === productVariantId);
    if (item && quantity > item.availableStock) {
      setError(`Cannot add more than ${item.availableStock} units. Only ${item.availableStock} available in stock.`);
      return;
    }

    setCart(
      cart.map((item) =>
        item.productVariantId === productVariantId ? { ...item, quantity } : item
      )
    );
    setError(''); // Clear error if quantity update is successful
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + Number(item.unitPrice ?? 0) * item.quantity, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = parseFloat(taxAmount) || 0;
    return subtotal + tax;
  };

  // Low stock threshold - items with stock below this will show warning
  const LOW_STOCK_THRESHOLD = 10;

  const getLowStockItems = () => {
    return cart.filter(item => item.availableStock <= LOW_STOCK_THRESHOLD);
  };

  const hasLowStockItems = () => {
    return getLowStockItems().length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }
    // Location Users can only use their assigned location
    const branchIdToUse = user?.locationId;
    if (!branchIdToUse) {
      setError('Location ID is required. Please contact admin to assign you to a location.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const invoice = await api.createInvoice({
        items: cart.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        })),
        taxAmount: parseFloat(taxAmount) || undefined,
        changeAmount: parseFloat(changeAmount) || undefined,
        locationId: branchIdToUse,
        customerName: customerName.trim() || undefined,
      });
      router.push(`/invoices/${invoice.id}`);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if user has required location assignment
  if (user && user.role === 'location_user' && !user.locationId) {
    return (
      <ProtectedRoute allowedRoles={['location_user', 'store_admin', 'super_admin']}>
        <Layout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Invoice (POS)</h1>
              <p className="mt-2 text-sm text-gray-600">Point of Sale - Create new invoice</p>
            </div>
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                Location Assignment Required
              </p>
              <p className="mt-2 text-sm text-red-700">
                Your account is not assigned to a location. Please contact your administrator to assign you to a location before creating invoices.
              </p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['location_user', 'store_admin', 'super_admin']}>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Invoice (POS)</h1>
            <p className="mt-2 text-sm text-gray-600">Point of Sale - Create new invoice</p>
          </div>

          {/* Low Stock Warning Banner */}
          {hasLowStockItems() && (
            <div className="rounded-xl bg-amber-50 border-2 border-amber-300 p-5 shadow-md">
              <div className="flex items-start">
                <svg
                  className="h-6 w-6 text-amber-600 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-amber-900">
                    ⚠️ Low Stock Warning
                  </h3>
                  <p className="mt-2 text-sm text-amber-800">
                    The following items in your cart are running low on stock:
                  </p>
                  <ul className="mt-3 space-y-2">
                    {getLowStockItems().map((item) => (
                      <li
                        key={item.productVariantId}
                        className="flex items-center justify-between bg-white rounded-lg px-4 py-2 border border-amber-200"
                      >
                        <span className="font-medium text-amber-900">
                          {item.variant.product?.name} - {item.variant.variant_name}
                        </span>
                        <span className="text-sm font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                          Only {item.availableStock} left in stock
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-amber-700 font-medium">
                    💡 Consider restocking these items soon to avoid running out.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-lg font-semibold mb-4 text-black">Search Products</h2>

                {/* Product Search - Name and Code Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product Name Search */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Search Product
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setProductCode(''); // Clear code when searching by name
                      }}
                      placeholder="Search by product name..."
                      className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>

                  {/* Product Code Search */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Product Code
                    </label>
                    <input
                      type="text"
                      value={productCode}
                      onChange={(e) => {
                        setProductCode(e.target.value);
                        setSearchTerm(''); // Clear name when searching by code
                      }}
                      placeholder="Enter product code..."
                      className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                </div>

                {variants.length > 0 && (
                  <div className="mt-2 max-h-96 overflow-y-auto rounded-md border border-gray-200">
                    {variants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => addToCart(variant)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">
                          {variant.product?.name} - {variant.variant_name}
                        </div>
                        {variant.product?.category && (
                          <div className="text-sm text-gray-900">{variant.product.category}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-lg font-semibold mb-4 text-black">Cart</h2>
                {cart.length === 0 ? (
                  <p className="text-black text-center py-8">Cart is empty</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.productVariantId} className={`border-b pb-3 ${item.availableStock <= LOW_STOCK_THRESHOLD ? 'bg-amber-50 rounded-lg p-2 border-amber-200' : ''}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">
                              {item.variant.product?.name} - {item.variant.variant_name}
                            </div>
                            <div className="text-xs text-gray-900">
                              {item.discount && item.discount > 0 ? (
                                <>
                                  <span className="line-through text-gray-500">${Number(item.originalPrice ?? 0).toFixed(2)}</span>
                                  {' '}
                                  <span className="text-green-600 font-semibold">${Number(item.unitPrice ?? 0).toFixed(2)}</span>
                                  {' '}({item.discount}% off) × {item.quantity}
                                </>
                              ) : (
                                <>${Number(item.unitPrice ?? 0).toFixed(2)} × {item.quantity}</>
                              )}
                            </div>
                            {/* Low Stock Indicator */}
                            {item.availableStock <= LOW_STOCK_THRESHOLD && (
                              <div className="mt-1">
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${item.availableStock <= 5
                                  ? 'bg-red-100 text-red-700 border border-red-300'
                                  : 'bg-amber-100 text-amber-700 border border-amber-300'
                                  }`}>
                                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  {item.availableStock} left
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.productVariantId)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            ×
                          </button>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.productVariantId, item.quantity - 1)}
                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-900"
                          >
                            -
                          </button>
                          <span className="text-sm text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productVariantId, item.quantity + 1)}
                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-900"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black">Customer Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name (optional)"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black">Subtotal</label>
                    <div className="mt-1 text-lg font-semibold text-gray-900">
                      ${calculateSubtotal().toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black">Tax Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black">Total</label>
                    <div className="mt-1 text-xl font-bold text-gray-900">${calculateTotal().toFixed(2)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black">Change Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={changeAmount}
                      onChange={(e) => setChangeAmount(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || cart.length === 0}
                    className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Invoice'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

