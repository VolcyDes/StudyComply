'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authFetch } from '@/lib/authFetch';

type Role = 'USER' | 'UNIVERSITY' | 'ADMIN';

export default function RoleGate({
  requiredRole,
  fallbackPath,
  children,
}: {
  requiredRole: Role;
  fallbackPath: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<'loading' | 'ok' | 'denied'>('loading');

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { res, data } = await authFetch('/api/v1/me');
        if (!res.ok) {
          if (alive) setStatus('denied');
          return;
        }
const role: Role | undefined = data?.user?.role;

        if (!role || role !== requiredRole) {
          if (alive) setStatus('denied');
          return;
        }

        if (alive) setStatus('ok');
      } catch {
        if (alive) setStatus('denied');
      }
    })();

    return () => {
      alive = false;
    };
  }, [requiredRole]);

  useEffect(() => {
    if (status === 'denied') {
      if (pathname !== fallbackPath) router.replace(fallbackPath);
    }
  }, [status, router, pathname, fallbackPath]);

  if (status === 'loading') {
    return (
      <div className="p-6">
        <div className="h-6 w-56 rounded bg-muted animate-pulse" />
        <div className="mt-4 h-24 w-full rounded bg-muted animate-pulse" />
      </div>
    );
  }

  if (status === 'denied') return null;

  return <>{children}</>;
}
