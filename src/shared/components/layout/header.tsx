'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { useLogout } from '@/features/auth/hooks/use-logout';
import { ThemeToggle } from '@/shared/components/layout/theme-toggle';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

type SessionUser = {
  name?: string | null;
  avatar?: string | null;
  role?: 'admin' | 'user';
};

type HeaderProps = { glass?: boolean };

export const Header = ({ glass = false }: HeaderProps) => {
  const { data: session } = useSession();
  const { logout } = useLogout();
  const sessionUser = session?.user as SessionUser | undefined;
  const userName = sessionUser?.name ?? '';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <header
      className={cn(
        'flex items-center justify-between px-6 py-5 sm:px-10',
        glass
          ? 'border-b border-white/10 bg-white/5 backdrop-blur-md'
          : 'border-b border-border bg-background'
      )}
    >
      <Link
        href="/"
        className={cn(
          'flex items-center rounded-xl transition-opacity hover:opacity-90',
          glass
            ? 'bg-white/15 px-3 py-1 backdrop-blur-sm ring-1 ring-white/20'
            : 'mix-blend-multiply dark:mix-blend-normal'
        )}
      >
        <Image
          src="/logo.png"
          alt="Meal Planner"
          width={140}
          height={56}
          className="h-14 w-auto object-contain"
          priority
        />
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        {sessionUser ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(glass ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent')}
            >
              <Link href="/plan">My Plan</Link>
            </Button>
            {sessionUser.role === 'admin' && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(glass ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent')}
              >
                <Link href="/admin">Dashboard</Link>
              </Button>
            )}
            <div className="flex items-center gap-3">
              {sessionUser.avatar ? (
                <Image
                  src={sessionUser.avatar}
                  alt={userName}
                  width={32}
                  height={32}
                  className="size-8 rounded-full border border-border object-cover"
                />
              ) : (
                <div className={cn(
                  'size-8 rounded-full flex items-center justify-center text-xs font-semibold',
                  glass ? 'border border-white/30 bg-white/10 text-white' : 'border border-border bg-muted text-foreground'
                )}>
                  {initials || 'U'}
                </div>
              )}
              <span className={cn('text-sm hidden sm:block', glass ? 'text-white/70' : 'text-muted-foreground')}>{userName}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className={cn(glass ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent')}
            >
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(glass ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent')}
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className={cn(
                glass
                  ? 'bg-white text-black hover:bg-white/90 font-semibold'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 font-semibold'
              )}
            >
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
};
