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
          <CommandItem className="gap-2">
            <Plus className="h-4 w-4 text-muted-foreground" />
            Create new client
          </CommandItem>
          <CommandItem className="gap-2">
            <Plus className="h-4 w-4 text-muted-foreground" />
            Add a project
          </CommandItem>
          <CommandItem className="gap-2">
            <Plus className="h-4 w-4 text-muted-foreground" />
            Schedule content
          </CommandItem>
          <CommandItem className="gap-2">
            <Plus className="h-4 w-4 text-muted-foreground" />
            Generate invoice
          </CommandItem>
          <CommandItem className="gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            Search clients
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
