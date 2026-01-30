'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      router.push('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-200/50">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          {/* Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Registration Unavailable
          </h2>
          <p className="text-gray-600 mb-6">
            Public registration has been disabled. User accounts must be created by administrators.
          </p>

          {/* Info Box */}
          <div className="rounded-xl bg-blue-50 p-4 ring-1 ring-blue-100 mb-6">
            <p className="text-sm text-gray-700">
              <strong className="font-semibold text-blue-900">Need an account?</strong><br />
              Please contact your system administrator or store manager to create an account for you.
            </p>
          </div>

          {/* Action Button */}
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30"
          >
            Go to Login
          </Link>
          
          <p className="mt-4 text-xs text-gray-500">
            Redirecting to login in 3 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}

