'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        const role = user.role;
        if (role === 'super_admin') {
          router.push('/dashboard/super-admin');
        } else if (role === 'store_admin') {
          router.push('/dashboard/store-admin');
        } else if (role === 'branch_user') {
          router.push('/dashboard/branch-user');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  );
}
