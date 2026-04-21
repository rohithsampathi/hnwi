'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearDashboardCachePage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dashboard:clear-cache'));
      window.sessionStorage.setItem('dashboard-cache-cleared-at', new Date().toISOString());
    }

    const timer = window.setTimeout(() => {
      router.replace('/dashboard?cacheBust=true');
    }, 200);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-[40vh] items-center justify-center px-6 text-center">
      <div className="max-w-md space-y-3">
        <h1 className="text-xl font-semibold">Refreshing dashboard cache</h1>
        <p className="text-sm text-muted-foreground">
          Clearing stale dashboard state and returning to the live board.
        </p>
      </div>
    </main>
  );
}
