'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  FolderKanban,
  Share2,
  Users,
  FileText,
  Clock,
} from 'lucide-react';
import { DashboardShell, PageHeader } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchDiscoveryCalls, fetchProjects, fetchContentItems, fetchInvoices } from '@/lib/api';
import { useFetch } from '@/hooks/use-fetch';
import { cn } from '@/lib/utils';

interface CalEvent {
  id: string;
  title: string;
  date: string;
  type: 'call' | 'deadline' | 'content' | 'meeting' | 'invoice';
  time: string;
}

const eventTypeMeta: Record<string, { color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  call: { color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-500/15', icon: PhoneCall },
  deadline: { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-500/15', icon: FolderKanban },
  content: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/15', icon: Share2 },
  meeting: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/15', icon: Users },
  invoice: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/15', icon: FileText },
};

export default function CalendarPage() {
  const [refreshKey] = React.useState(0);
  const { data: calls } = useFetch(fetchDiscoveryCalls, [refreshKey]);
  const { data: projects } = useFetch(fetchProjects, [refreshKey]);
  const { data: contentItems } = useFetch(fetchContentItems, [refreshKey]);
  const { data: invoices } = useFetch(fetchInvoices, [refreshKey]);

  const todayDate = new Date();
  const [viewYear, setViewYear] = React.useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(todayDate.getMonth());

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }
  function goToToday() {
    setViewYear(todayDate.getFullYear());
    setViewMonth(todayDate.getMonth());
  }

  const allCalls = calls ?? [];
  const allProjects = projects ?? [];
  const allContent = contentItems ?? [];
  const allInvoices = invoices ?? [];

  const events: CalEvent[] = [
    ...allCalls.map((c) => ({
      id: c.id,
      title: `${c.type} — ${c.clientName}`,
      date: c.date.split('T')[0],
      type: 'call' as const,
      time: new Date(c.date).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' }),
    })),
    ...allProjects.filter((p) => p.stage !== 'Completed').map((p) => ({
      id: p.id,
      title: `Deadline: ${p.name}`,
      date: p.deadline,
      type: 'deadline' as const,
      time: '11:59 PM',
    })),
    ...allContent.filter((c) => c.status === 'Scheduled' || c.status === 'Published').map((c) => ({
      id: c.id,
      title: `${c.platform}: ${c.caption.slice(0, 40)}...`,
      date: c.scheduledDate.split('T')[0],
      type: 'content' as const,
      time: new Date(c.scheduledDate).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' }),
    })),
    ...allInvoices.filter((i) => i.status !== 'Paid').map((i) => ({
      id: i.id,
      title: `Invoice due: ${i.id}`,
      date: i.dueDate,
      type: 'invoice' as const,
      time: 'End of day',
    })),
  ];

  // Build calendar for the current view month
  const year = viewYear;
  const month = viewMonth;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.date === dateStr);
  };

  const sortedAgenda = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <DashboardShell>
      <PageHeader title="Calendar" description="Unified view of calls, deadlines, content, and invoices" />

      <Tabs defaultValue="month" className="mt-6">
        <TabsList>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
        </TabsList>

        {/* Month view */}
        <TabsContent value="month" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">{monthName}</CardTitle>
              <div className="flex gap-1.5">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" className="h-8" onClick={goToToday}>Today</Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Legend */}
              <div className="mb-4 flex flex-wrap gap-3">
                {Object.entries(eventTypeMeta).map(([type, meta]) => {
                  const Icon = meta.icon;
                  return (
                    <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={cn('flex h-4 w-4 items-center justify-center rounded', meta.bg)}>
                        <Icon className={cn('h-2.5 w-2.5', meta.color)} />
                      </span>
                      <span className="capitalize">{type}</span>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((d) => (
                  <div key={d} className="pb-2 text-center text-[10px] font-semibold uppercase text-muted-foreground">
                    {d}
                  </div>
                ))}
                {cells.map((day, i) => {
                  const dayEvents = day ? getEventsForDay(day) : [];
                  const isToday = day !== null && `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` === todayStr;
                  return (
                    <div
                      key={i}
                      className={cn(
                        'min-h-[100px] rounded-lg border p-1.5',
                        day ? 'cursor-pointer hover:bg-muted/30' : ''
                      )}
                    >
                      {day && (
                        <>
                          <span className={cn(
                            'text-xs font-medium',
                            isToday && 'flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground'
                          )}>
                            {day}
                          </span>
                          <div className="mt-1 space-y-0.5">
                            {dayEvents.slice(0, 3).map((e) => {
                              const meta = eventTypeMeta[e.type];
                              const Icon = meta.icon;
                              return (
                                <motion.div
                                  key={e.id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className={cn('flex items-center gap-1 rounded px-1 py-0.5 text-[9px]', meta.bg)}
                                >
                                  <Icon className={cn('h-2.5 w-2.5 shrink-0', meta.color)} />
                                  <span className={cn('truncate', meta.color)}>{e.title}</span>
                                </motion.div>
                              );
                            })}
                            {dayEvents.length > 3 && (
                              <p className="px-1 text-[9px] text-muted-foreground">+{dayEvents.length - 3} more</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agenda view */}
        <TabsContent value="agenda" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Upcoming Events</CardTitle></CardHeader>
            <CardContent>
              {sortedAgenda.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">No events scheduled.</div>
              ) : (
                <div className="space-y-2">
                  {sortedAgenda.map((e, i) => {
                    const meta = eventTypeMeta[e.type];
                    const Icon = meta.icon;
                    return (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', meta.bg)}>
                          <Icon className={cn('h-4 w-4', meta.color)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{e.title}</p>
                          <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString('en-PH', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {e.time}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
