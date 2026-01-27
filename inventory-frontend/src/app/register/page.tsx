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
    // Fetch shops (tenants) for dropdown using public endpoint
    const fetchTenants = async () => {
      try {
        setLoadingTenants(true);
        // Use public endpoint that doesn't require authentication
        const data = await api.getPublicTenants();
        setTenants(data);
        // Auto-select first shop for store_admin or branch_user if none selected
        if (
          data.length > 0 &&
          (formData.role === 'store_admin' || formData.role === 'branch_user') &&
          !formData.tenantId
        ) {
          setFormData((prev) => ({ ...prev, tenantId: data[0].id, branchId: '' }));
        }
      } catch (error) {
        // Silently fail - user can still enter UUID manually
        console.log('Could not fetch shops list:', error);
        setTenants([]);
      } finally {
        setLoadingTenants(false);
      }
    };
    fetchTenants();
  }, [formData.role]);

  useEffect(() => {
    // Fetch branches when shop (tenant) is selected using public endpoint
    const fetchBranches = async () => {
      if (formData.tenantId && formData.role === 'branch_user') {
        // Reset branches and branchId when shop changes
        setBranches([]);
        setFormData((prev) => ({ ...prev, branchId: '' }));
        setLoadingBranches(true);
        
        try {
          // Use public endpoint that doesn't require authentication
          // This works for ALL shops regardless of subscription_status
          console.log('Fetching branches for shop:', formData.tenantId);
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-gray-200/50">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="text-green-600 text-xl font-bold mb-2">
            Registration successful!
          </div>
          <p className="text-gray-600">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header Section */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the inventory management system
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-200/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 p-4 ring-1 ring-red-100">
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
            <div className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
                  Email address
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
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700">
                  Password
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Create a strong password"
                  />
                </div>
              </div>

              {/* Role Field */}
              <div>
                <label htmlFor="role" className="mb-2 block text-sm font-semibold text-gray-700">
                  Role
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
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
                    className="block w-full appearance-none rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-4 py-3 text-gray-900 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="store_admin">Store Admin</option>
                    <option value="branch_user">Branch User</option>
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
              {/* Shop Field */}
              {(formData.role === 'store_admin' || formData.role === 'branch_user') && (
                <div>
                  <label htmlFor="tenantId" className="mb-2 block text-sm font-semibold text-gray-700">
                    Shop <span className="text-red-500">*</span>
                    {formData.role === 'store_admin' && (
                      <span className="ml-1 text-xs font-normal text-gray-500">(required for Store Admin)</span>
                    )}
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    {tenants.length > 0 ? (
                      <>
                        <select
                          id="tenantId"
                          name="tenantId"
                          required
                          value={formData.tenantId}
                          onChange={(e) => {
                            setFormData({ ...formData, tenantId: e.target.value, branchId: '' });
                          }}
                          className="block w-full appearance-none rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-10 py-3 text-gray-900 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="">Select a shop</option>
                          {tenants.map((tenant) => (
                            <option key={tenant.id} value={tenant.id}>
                              {tenant.name} ({tenant.subscription_status})
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
                      </>
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
                        className="block w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter shop UUID"
                      />
                    )}
                  </div>
                  {loadingTenants && (
                    <p className="mt-2 flex items-center text-xs text-gray-500">
                      <svg
                        className="mr-1.5 h-3 w-3 animate-spin"
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
                      Loading shops...
                    </p>
                  )}
                  {!loadingTenants && tenants.length === 0 && (
                    <p className="mt-2 text-xs text-gray-500">
                      Enter shop UUID manually (or contact admin for shop list)
                    </p>
                  )}
                </div>
              )}
              {/* Branch Field */}
              {formData.role === 'branch_user' && (
                <div>
                  <label htmlFor="branchId" className="mb-2 block text-sm font-semibold text-gray-700">
                    Branch <span className="text-red-500">*</span>
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
                    {formData.tenantId ? (
                      loadingBranches ? (
                        <>
                          <div className="block w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-4 py-3 text-gray-500">
                            <span className="flex items-center">
                              <svg
                                className="mr-2 h-4 w-4 animate-spin"
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
                              Loading branches...
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">Fetching branches for this tenant...</p>
                        </>
                      ) : branches.length > 0 ? (
                        <>
                          <select
                            id="branchId"
                            name="branchId"
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
                        </>
                      ) : (
                        <>
                          <input
                            id="branchId"
                            name="branchId"
                            type="text"
                            required
                            value={formData.branchId}
                            onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                            className="block w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Enter branch UUID"
                          />
                          <p className="mt-2 text-xs text-gray-500">
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
                          className="block w-full rounded-xl border border-gray-300 bg-gray-50 pl-10 pr-4 py-3 text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Enter branch UUID"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Select a shop first to see branches, or enter branch UUID manually
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
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
                  Registering...
                </span>
              ) : (
                'Create account'
              )}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-700 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

