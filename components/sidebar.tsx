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

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
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

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-[#d7d0c8] bg-[#f5f1ea] text-slate-800 shadow-xl shadow-slate-900/10 transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-28 items-center justify-between border-b border-[#d9d0c7] px-4 pb-2 pt-4">
          <Link href="/" className="flex items-center" onClick={onClose}>
            <Image
              src="/images/companylogo.png"
              alt="Nexora Studio"
              width={220}
              height={120}
              className="h-auto w-[180px] object-contain"
              priority
            />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-700 hover:bg-white/60 hover:text-slate-900 lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = iconMap[item.icon] ?? LayoutDashboard;
                  const active =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                          active
                            ? 'bg-[#e7e0d7] text-slate-900 shadow-sm ring-1 ring-[#d5c8ba]'
                            : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                        )}
                      >
                        {active && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#3d5d4b]"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <Icon className={cn('h-[17px] w-[17px] shrink-0', active ? 'text-[#3d5d4b]' : 'text-slate-500')} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#d9d0c7] p-4">
          <div className="rounded-xl bg-gradient-to-r from-[#dfe6de] to-[#efe3d5] p-3 ring-1 ring-[#d5c7b7]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Team Utilization</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-[#224d3f]">84%</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/70">
              <div className="h-full w-[84%] rounded-full bg-[#3d5d4b]" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
