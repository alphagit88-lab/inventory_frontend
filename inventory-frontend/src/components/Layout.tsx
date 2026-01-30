'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'super_admin':
        // Super Admin: Full access to everything
        return [
          { href: '/dashboard/super-admin', label: 'Dashboard' },
          { href: '/tenants', label: 'Shops' },
          { href: '/system', label: 'System Overview' },
          { href: '/locations', label: 'Locations' },
          { href: '/products', label: 'Products' },
          { href: '/inventory', label: 'Inventory' },
          { href: '/inventory/stock-in', label: 'Stock In' },
          { href: '/invoices', label: 'Invoices' },
          { href: '/invoices/create', label: 'Create Invoice' },
          { href: '/users', label: 'Users' },
          { href: '/reports', label: 'Reports' },
        ];
      case 'store_admin':
        // Store Admin: Can manage their tenant (no shops or system overview)
        return [
          { href: '/dashboard/store-admin', label: 'Dashboard' },
          { href: '/locations', label: 'Locations' },
          { href: '/products', label: 'Products' },
          { href: '/inventory', label: 'Inventory' },
          { href: '/inventory/stock-in', label: 'Stock In' },
          { href: '/invoices', label: 'Invoices' },
          { href: '/invoices/create', label: 'Create Invoice' },
          { href: '/users', label: 'Users' },
          { href: '/reports', label: 'Reports' },
        ];
      case 'location_user':
        // Location User (Cashier): Limited access only
        return [
          { href: '/dashboard/location-user', label: 'Dashboard' },
          { href: '/inventory/stock-in', label: 'Stock In' },
          { href: '/invoices/create', label: 'Create Invoice' },
          { href: '/invoices', label: 'Invoices' },
          { href: '/reports', label: 'Reports' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg ring-1 ring-gray-200/50">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <div className="flex flex-shrink-0 items-center">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg transition-transform duration-200 group-hover:scale-105">
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
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Inventory System
                  </span>
                </Link>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${isActive
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      {isActive && (
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                      )}
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center">
              {user && (
                <div className="flex items-center gap-4">
                  {/* User Profile Avatar with Context */}
                  <div className="hidden md:flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xs font-bold shadow-md">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    {/* Super Admin Context - Shop and Location */}
                    {user.role === 'super_admin' && (user.tenantId || user.locationId) && (
                      <div className="flex flex-col">
                        <span className="text-[10px] leading-tight text-gray-500">
                          {user.tenant?.name && user.tenant.name}
                          {user.tenant?.name && user.location?.name && " • "}
                          {user.location?.name && user.location.name}
                        </span>
                      </div>
                    )}
                    {/* Store Admin & Location User - Show Shop and Location */}
                    {user.role !== 'super_admin' && (user.tenant?.name || user.location?.name) && (
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-900">
                          {user.tenant?.name && user.tenant.name}
                          {user.tenant?.name && user.location?.name && " • "}
                          {user.location?.name && user.location.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={logout}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all duration-200 hover:from-red-700 hover:to-rose-700 hover:shadow-xl hover:shadow-red-500/30"
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
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

