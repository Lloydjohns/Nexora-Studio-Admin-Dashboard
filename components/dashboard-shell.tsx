'use client';

import * as React from 'react';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { ProtectedRoute } from '@/components/protected-route';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-64">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="mx-auto max-w-[1400px] p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in-0 duration-300">{children}</div>
  );
}
