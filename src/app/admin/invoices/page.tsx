'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { InvoiceDashboard } from '@/components/invoices/InvoiceDashboard';
import { Button } from '@/components/ui/button';
import { ArrowRight, LogOut, Receipt } from 'lucide-react';

export default function AdminInvoicesPage() {
  const router = useRouter();
  const { user, authLoading, checkAuth, logout } = useStore();
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin')}
                className="text-gray-500"
              >
                <ArrowRight className="h-4 w-4 ml-1" />
                العودة
              </Button>
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600" />
                <h1 className="text-lg font-bold text-gray-900">لوحة التحكم</h1>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await logout();
                window.location.href = '/admin/login';
              }}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="ml-1 h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>

      <InvoiceDashboard />
    </div>
  );
}
