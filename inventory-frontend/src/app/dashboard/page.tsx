'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const role = user.role;
      if (role === 'super_admin') {
        router.push('/dashboard/super-admin');
      } else if (role === 'store_admin') {
        router.push('/dashboard/store-admin');
      } else if (role === 'branch_user') {
        router.push('/dashboard/branch-user');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  );
}

