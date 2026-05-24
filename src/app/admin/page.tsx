'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { AdminPanel } from '@/components/store/AdminPanel';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, authLoading, checkAuth } = useStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    checkAuth().then(() => setChecked(true));
  }, [checkAuth]);

  useEffect(() => {
    if (checked && !authLoading) {
      if (!user) {
        router.push('/admin/login');
      }
    }
  }, [checked, authLoading, user, router]);

  if (!checked || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) return null;

  return <AdminPanel onBack={() => router.push('/')} />;
}