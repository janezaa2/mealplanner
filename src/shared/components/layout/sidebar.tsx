'use client';
import { UtensilsCrossed, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SIDEBAR_NAV_ITEMS, type SidebarNavItem } from '@/shared/const/navigation.const';
import { cn } from '@/shared/lib/utils';

const SIDEBAR_ICON_MAP: Record<SidebarNavItem['icon'], LucideIcon> = {
  plan: UtensilsCrossed,
};

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full border-r bg-background flex flex-col py-4">
      <nav className="flex-1 px-3 space-y-1">
        {SIDEBAR_NAV_ITEMS.map(({ href, label, icon }) => {
          const Icon = SIDEBAR_ICON_MAP[icon];

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
