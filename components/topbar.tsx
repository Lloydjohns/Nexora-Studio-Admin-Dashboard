'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Plus,
  Sun,
  Moon,
  Menu,
  Command,
  ChevronDown,
  Settings,
  LogOut,
  UserCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CommandPalette } from '@/components/command-palette';
import { QuickCreate } from '@/components/quick-create';
import { useAuth } from '@/components/auth-provider';
import { fetchNotifications } from '@/lib/api';
import { useFetch } from '@/hooks/use-fetch';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const [qcOpen, setQcOpen] = React.useState(false);

  const { data: notificationsData } = useFetch(fetchNotifications);
  const notifications = notificationsData ?? [];

  React.useEffect(() => {
    setMounted(true);
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const unreadCount = notifications.filter((n: any) => n.unread).length;

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  const markAllRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ unread: false })
      .eq('unread', true);
    if (error) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U';
  const displayName = user?.email?.split('@')[0] ?? 'User';

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search or jump to..."
            className="h-9 cursor-pointer pl-9 pr-16"
            onFocus={() => setCmdOpen(true)}
            readOnly
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Quick create */}
          <Button
            size="sm"
            className="hidden gap-1.5 sm:flex"
            onClick={() => setQcOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Quick Create
          </Button>
          <Button
            size="icon"
            variant="default"
            className="sm:hidden h-9 w-9"
            onClick={() => setQcOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {mounted && theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b px-3 py-2.5">
                <p className="text-sm font-semibold">Notifications</p>
                <Badge variant="secondary" className="text-[10px]">
                  {unreadCount} new
                </Badge>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    No notifications
                  </p>
                ) : (
                  notifications.map((n: any) => (
                    <div
                      key={n.id}
                      className={cn(
                        'flex gap-3 border-b px-3 py-2.5 last:border-0 transition-colors hover:bg-muted/50',
                        n.unread && 'bg-primary/5'
                      )}
                    >
                      <div
                        className={cn(
                          'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                          n.unread ? 'bg-primary' : 'bg-transparent'
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug">{n.title}</p>
                        <p className="text-xs text-muted-foreground leading-snug">
                          {n.description}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {n.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t p-2">
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={markAllRead}>
                  Mark all as read
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-muted">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-600 text-xs font-semibold text-white">
                  {initials}
                </div>
                <div className="hidden text-left leading-tight sm:block">
                  <p className="text-xs font-semibold">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground">Admin</p>
                </div>
                <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      <QuickCreate open={qcOpen} onOpenChange={setQcOpen} />
    </>
  );
}
