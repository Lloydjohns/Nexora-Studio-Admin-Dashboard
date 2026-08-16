'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { navItems } from '@/lib/data';
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
  Plus,
  Search,
} from 'lucide-react';

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

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  const quickActions = [
    { label: 'Create new client', href: '/clients', icon: Plus },
    { label: 'Add a project', href: '/projects', icon: Plus },
    { label: 'Schedule content', href: '/social', icon: Plus },
    { label: 'Generate invoice', href: '/finance', icon: Plus },
    { label: 'Search clients', href: '/clients', icon: Search },
  ];

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages, actions, or jump to..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] ?? LayoutDashboard;
            return (
              <CommandItem
                key={item.href}
                onSelect={() => go(item.href)}
                className="gap-2"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {item.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <CommandItem
                key={action.label}
                onSelect={() => go(action.href)}
                className="gap-2"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {action.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
