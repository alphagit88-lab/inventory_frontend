'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Tenant, Branch } from '@/lib/api';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'branch_user' as 'super_admin' | 'store_admin' | 'branch_user',
    tenantId: '',
    branchId: '',
  });
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const router = useRouter();

  const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value.trim()
    );

  useEffect(() => {
    // Fetch tenants for dropdown using public endpoint
    const fetchTenants = async () => {
      try {
        setLoadingTenants(true);
        // Use public endpoint that doesn't require authentication
        const data = await api.getPublicTenants();
        setTenants(data);
        // Auto-select first tenant for store_admin or branch_user if none selected
        if (
          data.length > 0 &&
          (formData.role === 'store_admin' || formData.role === 'branch_user') &&
          !formData.tenantId
        ) {
          setFormData((prev) => ({ ...prev, tenantId: data[0].id, branchId: '' }));
        }
      } catch (error) {
        // Silently fail - user can still enter UUID manually
        console.log('Could not fetch tenants list:', error);
        setTenants([]);
      } finally {
        setLoadingTenants(false);
      }
    };
    fetchTenants();
  }, [formData.role]);

  useEffect(() => {
    // Fetch branches when tenant is selected using public endpoint
    const fetchBranches = async () => {
      if (formData.tenantId && formData.role === 'branch_user') {
        // Reset branches and branchId when tenant changes
        setBranches([]);
        setFormData((prev) => ({ ...prev, branchId: '' }));
        setLoadingBranches(true);
        
        try {
          // Use public endpoint that doesn't require authentication
          // This works for ALL tenants regardless of subscription_status
          console.log('Fetching branches for tenant:', formData.tenantId);
          const data = await api.getPublicBranches(formData.tenantId);
          console.log('Branches received:', data);
          
          if (data && Array.isArray(data)) {
            setBranches(data);
            // Auto-select first branch if branches are available
            if (data.length > 0) {
              setFormData((prev) => ({ ...prev, branchId: data[0].id }));
            }
          } else {
            console.warn('Invalid branches data received:', data);
            setBranches([]);
          }
        } catch (error) {
          console.error('Error fetching branches list:', error);
          console.error('Error details:', {
            message: (error as Error)?.message,
            tenantId: formData.tenantId,
            error: error
          });
          setBranches([]);
          // Clear branchId if fetch fails
          setFormData((prev) => ({ ...prev, branchId: '' }));
        } finally {
          setLoadingBranches(false);
        }
      } else {
        setBranches([]);
        setLoadingBranches(false);
        if (formData.role !== 'branch_user') {
          setFormData((prev) => ({ ...prev, branchId: '' }));
        }
      }
    };
    fetchBranches();
  }, [formData.tenantId, formData.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (formData.role === 'store_admin' && !formData.tenantId) {
      setError('Tenant ID is required for Store Admin role');
      return;
    }

    if (formData.role === 'branch_user') {
      if (!formData.tenantId) {
        setError('Tenant ID is required for Branch User role');
        return;
      }
      if (!formData.branchId) {
        setError('Branch ID is required for Branch User role');
        return;
      }
      if (!isUuid(formData.tenantId)) {
        setError('Tenant ID must be a valid UUID');
        return;
      }
      if (!isUuid(formData.branchId)) {
        setError('Branch ID must be a valid UUID');
        return;
      }
    }

    if (formData.role === 'store_admin') {
      if (!isUuid(formData.tenantId)) {
        setError('Tenant ID must be a valid UUID');
        return;
      }
    }

    setLoading(true);

    try {
      const data: {
        email: string;
        password: string;
        role: string;
        tenantId?: string;
        branchId?: string;
      } = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (formData.role === 'store_admin') {
        data.tenantId = formData.tenantId;
      }
      if (formData.role === 'branch_user') {
        data.tenantId = formData.tenantId;
        data.branchId = formData.branchId;
      }

      await api.register(data);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
        if (err instanceof Error) {
          setError(err.message || 'Registration failed');
        } else {
          setError('Registration failed');
        }
      } finally {
        setLoading(false);
      }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg p-8 text-center">
          <div className="text-green-600 text-lg font-semibold mb-4">
            Registration successful!
          </div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-900">
            Inventory Management System
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-black">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as "super_admin" | "store_admin" | "branch_user",
                  })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="super_admin">Super Admin</option>
                <option value="store_admin">Store Admin</option>
                <option value="branch_user">Branch User</option>
              </select>
            </div>
            {(formData.role === 'store_admin' || formData.role === 'branch_user') && (
              <div>
                <label htmlFor="tenantId" className="block text-sm font-medium text-black">
                  Tenant {formData.role === 'branch_user' ? '*' : '* (required for Store Admin)'}
                </label>
                {tenants.length > 0 ? (
                  <select
                    id="tenantId"
                    name="tenantId"
                    required
                    value={formData.tenantId}
                    onChange={(e) => {
                      setFormData({ ...formData, tenantId: e.target.value, branchId: '' });
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">Select a tenant</option>
                    {tenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name} ({tenant.subscription_status})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="tenantId"
                    name="tenantId"
                    type="text"
                    required
                    value={formData.tenantId}
                    onChange={(e) => {
                      setFormData({ ...formData, tenantId: e.target.value, branchId: '' });
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    placeholder="Enter tenant UUID"
                  />
                )}
                {loadingTenants && (
                  <p className="mt-1 text-xs text-gray-900">Loading tenants...</p>
                )}
                {!loadingTenants && tenants.length === 0 && (
                  <p className="mt-1 text-xs text-gray-900">
                    Enter tenant UUID manually (or contact admin for tenant list)
                  </p>
                )}
              </div>
            )}
            {formData.role === 'branch_user' && (
              <div>
                <label htmlFor="branchId" className="block text-sm font-medium text-gray-900">
                  Branch *
                </label>
                {formData.tenantId ? (
                  loadingBranches ? (
                    <>
                      <div className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-500 bg-gray-50">
                        Loading branches...
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Fetching branches for this tenant...</p>
                    </>
                  ) : branches.length > 0 ? (
                    <select
                      id="branchId"
                      name="branchId"
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
                  ) : (
                    <>
                      <input
                        id="branchId"
                        name="branchId"
                        type="text"
                        required
                        value={formData.branchId}
                        onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        placeholder="Enter branch UUID"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        No branches found for this tenant. Please enter branch UUID manually or contact admin.
                      </p>
                    </>
                  )
                ) : (
                  <>
                    <input
                      id="branchId"
                      name="branchId"
                      type="text"
                      required
                      value={formData.branchId}
                      onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="Enter branch UUID"
                    />
                    <p className="mt-1 text-xs text-gray-900">
                      Select a tenant first to see branches, or enter branch UUID manually
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-900">Already have an account? </span>
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

