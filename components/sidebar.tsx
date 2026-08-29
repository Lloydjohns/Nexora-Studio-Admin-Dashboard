```tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserSearch,
  PhoneCall,
  FolderKanban,
  Share2,
  Package,
  ShoppingBag,
  Globe,
  CalendarDays,
  UsersRound,
  Wallet,
  BarChart3,
  FileText,
  Settings,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { navGroups } from '@/lib/data';
import { Button } from '@/components/ui/button';

const iconMap: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  LayoutDashboard,
  Users,
  UserSearch,
  PhoneCall,
  FolderKanban,
  Share2,
  Package,
  ShoppingBag,
  Globe,
  CalendarDays,
  UsersRound,
  Wallet,
  BarChart3,
  FileText,
  Settings,
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({
  open,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] shadow-xl shadow-slate-950/10 transition-transform duration-300 lg:translate-x-0',
          open
            ? 'translate-x-0'
            : '-translate-x-full',
        )}
      >
        {/* =====================================================
            LOGO / BRAND
        ===================================================== */}
        <div className="flex h-20 items-center gap-2 border-b border-[hsl(var(--sidebar-border))] px-4">
          <Link
            href="/"
            className="min-w-0 flex-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={onClose}
          >
            <div className="flex min-w-0 items-center gap-3 rounded-lg py-2">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted/60 ring-1 ring-border/70">
                <Image
                  src="/images/companylogo.png"
                  alt="Nexora Studio logo"
                  width={931}
                  height={268}
                  preload
                  className="absolute left-1/2 top-0 h-[74px] w-auto max-w-none -translate-x-1/2 -translate-y-1"
                />
              </div>

              <div className="min-w-0 leading-tight">
                <p className="truncate text-[15px] font-semibold tracking-tight text-foreground">
                  Nexora Studio
                </p>

                <p className="mt-1 truncate text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Branding &amp; Design
                </p>
              </div>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* =====================================================
            NAVIGATION
        ===================================================== */}
        <nav
          aria-label="Main navigation"
          className="flex-1 overflow-y-auto px-3 py-4"
        >
          {navGroups.map((group) => (
            <div
              key={group.title}
              className="mb-5 last:mb-0"
            >
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {group.title}
              </p>

              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon =
                    iconMap[item.icon] ??
                    LayoutDashboard;

                  const active =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(
                          item.href,
                        );

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={
                          active
                            ? 'page'
                            : undefined
                        }
                        className={cn(
                          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          active
                            ? 'bg-primary/10 text-foreground shadow-sm ring-1 ring-primary/15'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        {/* Active indicator */}
                        {active && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}

                        <Icon
                          className={cn(
                            'h-[17px] w-[17px] shrink-0',
                            active
                              ? 'text-primary'
                              : 'text-muted-foreground',
                          )}
                        />

                        <span>
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* =====================================================
            TEAM UTILIZATION
        ===================================================== */}
        <div className="border-t border-[hsl(var(--sidebar-border))] p-3">
          <div className="rounded-lg bg-muted/70 p-3 ring-1 ring-border/70">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Team utilization
              </p>

              <p className="text-lg font-bold tabular-nums text-foreground">
                84%
              </p>
            </div>

            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background">
              <div className="h-full w-[84%] rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
```
