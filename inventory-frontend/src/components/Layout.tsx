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
        return [
          { href: '/dashboard/super-admin', label: 'Dashboard' },
          { href: '/tenants', label: 'Tenants' },
          { href: '/system', label: 'System Overview' },
        ];
      case 'store_admin':
        return [
          { href: '/dashboard/store-admin', label: 'Dashboard' },
          { href: '/branches', label: 'Branches' },
          { href: '/products', label: 'Products' },
          { href: '/inventory', label: 'Inventory' },
          { href: '/invoices', label: 'Invoices' },
          { href: '/users', label: 'Users' },
          { href: '/reports', label: 'Reports' },
        ];
      case 'branch_user':
        return [
          { href: '/dashboard/branch-user', label: 'Dashboard' },
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
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                  Inventory System
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                      pathname === link.href
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              {user && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    {user.email} ({user.role})
                  </span>
                  <button
                    onClick={logout}
                    className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

