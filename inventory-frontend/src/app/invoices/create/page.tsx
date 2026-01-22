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
}

export default function CreateInvoicePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [taxAmount, setTaxAmount] = useState('');
  const [changeAmount, setChangeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchProducts();
    } else {
      setVariants([]);
    }
  }, [searchTerm]);

  // Branch Users use their assigned branch automatically
  // No need to fetch branches or allow selection

  const searchProducts = async () => {
    try {
      const data = await api.searchProducts(searchTerm);
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
    // Branch Users can only use their assigned branch
    const branchIdToUse = user?.branchId;

    if (!branchIdToUse) {
      setError('Branch ID is required. Please contact admin to assign you to a branch.');
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
        setCart([
          ...cart,
          {
            productVariantId: variant.id,
            variant,
            quantity: 1,
            unitPrice: Number(stock.sellingPrice ?? 0),
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
    setCart(
      cart.map((item) =>
        item.productVariantId === productVariantId ? { ...item, quantity } : item
      )
    );
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + Number(item.unitPrice ?? 0) * item.quantity, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = parseFloat(taxAmount) || 0;
    return subtotal + tax;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }
    // Branch Users can only use their assigned branch
    const branchIdToUse = user?.branchId;
    if (!branchIdToUse) {
      setError('Branch ID is required. Please contact admin to assign you to a branch.');
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
        branchId: branchIdToUse,
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

  // Check if user has required branch assignment
  if (user && user.role === 'branch_user' && !user.branchId) {
    return (
      <ProtectedRoute allowedRoles={['branch_user']}>
        <Layout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Invoice (POS)</h1>
              <p className="mt-2 text-sm text-gray-600">Point of Sale - Create new invoice</p>
            </div>
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                Branch Assignment Required
              </p>
              <p className="mt-2 text-sm text-red-700">
                Your account is not assigned to a branch. Please contact your administrator to assign you to a branch before creating invoices.
              </p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['branch_user']}>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Invoice (POS)</h1>
            <p className="mt-2 text-sm text-gray-600">Point of Sale - Create new invoice</p>
          </div>

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
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, brand, or size..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
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
                          {variant.product?.name} - {variant.brand} - {variant.size}
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
                      <div key={item.productVariantId} className="border-b pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">
                              {item.variant.product?.name} - {item.variant.brand} -{' '}
                              {item.variant.size}
                            </div>
                            <div className="text-xs text-gray-900">
                              ${Number(item.unitPrice ?? 0).toFixed(2)} × {item.quantity}
                            </div>
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

