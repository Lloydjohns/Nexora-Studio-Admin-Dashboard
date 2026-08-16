'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { navItems } from '@/lib/data';
import { toast } from 'sonner';
import {
  UserPlus,
  FolderPlus,
  CalendarPlus,
  FileText,
  Package,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickCreateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const actions = [
  { label: 'New Client', desc: 'Add a client to your CRM', icon: UserPlus, href: '/clients', color: 'text-chart-1' },
  { label: 'New Project', desc: 'Create a project board', icon: FolderPlus, href: '/projects', color: 'text-chart-2' },
  { label: 'Schedule Content', desc: 'Add a content calendar item', icon: CalendarPlus, href: '/social', color: 'text-chart-3' },
  { label: 'Create Invoice', desc: 'Bill a client for services', icon: FileText, href: '/finance', color: 'text-chart-5' },
  { label: 'Add Product', desc: 'List a new digital product', icon: Package, href: '/products', color: 'text-chart-4' },
  { label: 'Record Payment', desc: 'Log a received payment', icon: CreditCard, href: '/finance', color: 'text-chart-6' },
];

export function QuickCreate({ open, onOpenChange }: QuickCreateProps) {
  const router = useRouter();

  const handleSelect = (label: string, href: string) => {
    onOpenChange(false);
    toast.success(`${label} form opened`, { description: 'Ready to fill in details.' });
    router.push(href);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Quick Create</SheetTitle>
          <SheetDescription>
            Jump straight into creating something new.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-2">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={() => handleSelect(a.label, a.href)}
                className="group flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-all hover:border-primary/50 hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className={cn('h-5 w-5', a.color)} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
