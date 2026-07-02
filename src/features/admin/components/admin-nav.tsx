'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/shared/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: 'Analytics' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/design', label: 'Design' },
];

export const AdminNav = () => {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-border mb-6 pb-0">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              active
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
