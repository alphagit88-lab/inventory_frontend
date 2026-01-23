'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function StockStatusPage() {
    const { user } = useAuth();
    const [filters, setFilters] = useState({
        size: '',
        brand: '',
        category: '',
    });
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSearched(true);
        try {
            // Call the getStockStatus API with filters
            // Note: We might need to ensure the API method supports passing these parameters
            const data = await api.getStockStatus({
                branchId: user?.role === 'branch_user' ? (user.branchId ?? undefined) : undefined, // specific branch for users, all for store admin
                size: filters.size || undefined,
                brand: filters.brand || undefined,
                category: filters.category || undefined,
            });
            setResults(data);
        } catch (error) {
            console.error('Failed to fetch stock status:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <Layout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Stock Status Report</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Check inventory levels across attributes (e.g., "All 1/2 inch pipes")
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Size</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 1 inch"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={filters.size}
                                    onChange={(e) => setFilters({ ...filters, size: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Brand</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Zlone"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={filters.brand}
                                    onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Plumbing"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Searching...' : 'Search Inventory'}
                            </button>
                        </form>
                    </div>

                    {searched && (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Results</h3>
                            </div>

                            {results.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    No inventory found matching these criteria.
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attributes</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Qty</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Breakdown</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {results.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                                                    <div className="text-sm text-gray-500">{item.category}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">Size: {item.size}</div>
                                                    <div className="text-sm text-gray-500">Brand: {item.brand}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {item.totalQuantity} Units
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    <ul className="list-disc pl-4 space-y-1">
                                                        {item.branches.map((b: any, bIdx: number) => (
                                                            <li key={bIdx}>
                                                                <span className="font-medium text-gray-900">{b.branchName}:</span> {b.quantity}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
