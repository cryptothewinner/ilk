'use client';

import { usePathname } from 'next/navigation';
import { LightningShell } from '@/components/layout/lightning-shell';

export function ShellGate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    if (pathname.startsWith('/login')) {
        return <>{children}</>;
    }

    return <LightningShell>{children}</LightningShell>;
}
