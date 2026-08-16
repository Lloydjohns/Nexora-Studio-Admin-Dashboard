'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
  index?: number;
}

export function KpiCard({
  label,
  value,
  delta,
  trend,
  icon: Icon,
  accent = 'text-primary bg-primary/10',
  index = 0,
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight">
                {value}
              </p>
            </div>
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                accent
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
          {delta && (
            <div className="mt-3 flex items-center gap-1.5">
              {trend === 'up' ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                )}
              >
                {delta}
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  Onboarding: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  Paused: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  Churned: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
  Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  Outstanding: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  Overdue: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  Refunded: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400',
  Failed: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
  Draft: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400',
  'In Review': 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  Approved: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
  Scheduled: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400',
  Published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  New: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  Contacted: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400',
  'Discovery Scheduled': 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
  'Proposal Sent': 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  Won: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  Lost: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
  Scheduled2: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400',
  Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  Cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
  Free: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400',
  Available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  Busy: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  'On Leave': 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400',
  'Not Started': 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400',
  'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  Review: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  Live: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  'Not Sent': 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400',
  Sent: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  Accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
  Retired: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = statusColors[status] ?? statusColors['Draft'];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        cls
      )}
    >
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const cls =
    priority === 'High'
      ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'
      : priority === 'Medium'
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
      : 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        cls
      )}
    >
      {priority}
    </span>
  );
}

export function Avatar({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-600 text-xs font-semibold text-white',
        className
      )}
    >
      {initials}
    </div>
  );
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong' }: { message?: string }) {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/15">
          <TrendingDown className="h-6 w-6 text-rose-500" />
        </div>
        <p className="text-sm font-medium text-rose-600">{message}</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="w-full space-y-2">
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            <div className="h-7 w-24 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
        {value}%
      </span>
    </div>
  );
}
