'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  Users,
  DollarSign,
  PhoneCall,
  Share2,
  FolderKanban,
  Package,
  Target,
  FileWarning,
  Mail,
  Calendar,
  CreditCard,
  CheckCircle,
  ShoppingBag,
  UserPlus,
  ArrowUpRight,
} from 'lucide-react';
import { DashboardShell, PageHeader } from '@/components/dashboard-shell';
import { KpiCard, StatusBadge, Avatar, LoadingState, ErrorState, SkeletonCard } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPeso, formatPesoK } from '@/lib/data';
import {
  fetchClients,
  fetchLeads,
  fetchProjects,
  fetchDiscoveryCalls,
  fetchOrders,
  fetchInvoices,
  fetchActivities,
  fetchMonthlyRevenue,
  fetchProductSales,
  fetchCallBookings,
} from '@/lib/api';
import { useFetch } from '@/hooks/use-fetch';

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Mail,
  Calendar,
  CreditCard,
  CheckCircle,
  FolderKanban,
  ShoppingBag,
  UserPlus,
};

const activityColors: Record<string, string> = {
  inquiry: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  call: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
  payment: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  content: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
  project: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  order: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
  client: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
};

function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="tabular-nums">
          <span className="text-muted-foreground">{p.name}: </span>
          <span className="font-semibold">
            {formatter ? formatter(p.value) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data: clientsData, loading: clientsLoading, error: clientsError } = useFetch(fetchClients);
  const { data: leadsData, loading: leadsLoading } = useFetch(fetchLeads);
  const { data: projectsData, loading: projectsLoading } = useFetch(fetchProjects);
  const { data: callsData, loading: callsLoading } = useFetch(fetchDiscoveryCalls);
  const { data: ordersData, loading: ordersLoading } = useFetch(fetchOrders);
  const { data: invoicesData, loading: invoicesLoading } = useFetch(fetchInvoices);
  const { data: activitiesData, loading: activitiesLoading } = useFetch(fetchActivities);
  const { data: revenueData, loading: revenueLoading } = useFetch(fetchMonthlyRevenue);
  const { data: productSalesData, loading: productSalesLoading } = useFetch(fetchProductSales);
  const { data: callBookingsData, loading: callBookingsLoading } = useFetch(fetchCallBookings);
  const [period, setPeriod] = React.useState<'12M' | '30D' | '7D'>('12M');
  const [now, setNow] = React.useState(new Date());
  const router = useRouter();

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const anyError = clientsError;

  // Derived KPI values
  const activeClients = clientsData?.filter((c) => c.status === 'Active').length ?? 0;
  const monthlyRevenue = invoicesData?.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0) ?? 0;
  const callsBooked = callsData?.filter((c) => c.status === 'Scheduled').length ?? 0;
  const projectsInProgress = projectsData?.filter((p) => p.stage !== 'Completed').length ?? 0;
  const productSalesCount = ordersData?.filter((o) => o.status === 'Paid').length ?? 0;
  const outstandingInvoices = invoicesData?.filter((i) => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0) ?? 0;
  const leadsCount = leadsData?.length ?? 0;
  const wonLeads = leadsData?.filter((l) => l.status === 'Won').length ?? 0;
  const conversionRate = leadsCount > 0 ? ((wonLeads / leadsCount) * 100).toFixed(1) : '0';

  // Lead sources from leads data
  const leadSourceData = React.useMemo(() => {
    if (!leadsData) return [];
    const sourceCounts: Record<string, number> = {};
    leadsData.forEach((l) => {
      sourceCounts[l.source] = (sourceCounts[l.source] ?? 0) + 1;
    });
    const fills = ['hsl(var(--chart-1))', 'hsl(var(--chart-3))', 'hsl(var(--chart-2))', 'hsl(var(--chart-5))', 'hsl(var(--chart-4))'];
    return Object.entries(sourceCounts).map(([source, count], i) => ({ source, count, fill: fills[i % fills.length] }));
  }, [leadsData]);

  // Project pipeline from projects data
  const projectPipelineData = React.useMemo(() => {
    if (!projectsData) return [];
    const stageCounts: Record<string, number> = {};
    const stageOrder = ['Discovery', 'Planning', 'Content Creation', 'Design', 'Development', 'Review', 'Client Approval'];
    stageOrder.forEach((s) => (stageCounts[s] = 0));
    projectsData.filter((p) => p.stage !== 'Completed').forEach((p) => {
      const key = p.stage === 'Content Creation' ? 'Content' : p.stage === 'Client Approval' ? 'Approval' : p.stage;
      stageCounts[key] = (stageCounts[key] ?? 0) + 1;
    });
    return Object.entries(stageCounts).map(([stage, count]) => ({ stage, count }));
  }, [projectsData]);

  if (anyError) {
    return (
      <DashboardShell>
        <PageHeader title="Dashboard" description="Executive overview of Nexora Studio operations" />
        <ErrorState message="Failed to load dashboard data. Please check your connection." />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Dashboard"
        description="Executive overview of Nexora Studio operations"
      >
        <div className="flex items-center gap-2">
          <Button
            variant={period === '12M' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('12M')}
          >
            Last 12 months
          </Button>
          <Button
            variant={period === '30D' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('30D')}
          >
            30 days
          </Button>
          <Button
            variant={period === '7D' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('7D')}
          >
            7 days
          </Button>
        </div>
        <Button size="sm" onClick={() => router.push('/reports')}>
          <ArrowUpRight className="mr-1.5 h-4 w-4" />
          View Reports
        </Button>
      </PageHeader>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Realtime</p>
          <p className="mt-1 text-sm font-medium text-foreground">Operations overview is updating live.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-center">
          <div className="rounded-lg border border-border bg-muted/40 px-2.5 py-2">
            <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Date</p>
            <p className="mt-1 text-xs font-semibold tabular-nums text-foreground">
              {new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }).format(now)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 px-2.5 py-2">
            <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Hr</p>
            <p className="mt-1 text-xs font-semibold tabular-nums text-foreground">
              {String(now.getHours()).padStart(2, '0')}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 px-2.5 py-2">
            <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Min</p>
            <p className="mt-1 text-xs font-semibold tabular-nums text-foreground">
              {String(now.getMinutes()).padStart(2, '0')}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 px-2.5 py-2">
            <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Sec</p>
            <p className="mt-1 text-xs font-semibold tabular-nums text-foreground">
              {String(now.getSeconds()).padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {clientsLoading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <KpiCard label="Active Clients" value={String(activeClients)} delta="+2" trend="up" icon={Users} index={0} />
            <KpiCard label="Monthly Revenue" value={formatPeso(monthlyRevenue)} delta="+12.4%" trend="up" icon={DollarSign} accent="text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400" index={1} />
            <KpiCard label="Discovery Calls Booked" value={String(callsBooked)} delta="+8" trend="up" icon={PhoneCall} accent="text-violet-600 bg-violet-100 dark:bg-violet-500/15 dark:text-violet-400" index={2} />
            <KpiCard label="Social Accounts Managed" value="14" delta="+1" trend="up" icon={Share2} accent="text-blue-600 bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400" index={3} />
            <KpiCard label="Projects in Progress" value={String(projectsInProgress)} delta="+3" trend="up" icon={FolderKanban} accent="text-amber-600 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400" index={4} />
            <KpiCard label="Digital Product Sales" value={String(productSalesCount)} delta="+15%" trend="up" icon={Package} accent="text-rose-600 bg-rose-100 dark:bg-rose-500/15 dark:text-rose-400" index={5} />
            <KpiCard label="Conversion Rate" value={`${conversionRate}%`} delta="+4.2%" trend="up" icon={Target} accent="text-indigo-600 bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-400" index={6} />
            <KpiCard label="Outstanding Invoices" value={formatPeso(outstandingInvoices)} delta="-₱18K" trend="up" icon={FileWarning} accent="text-orange-600 bg-orange-100 dark:bg-orange-500/15 dark:text-orange-400" index={7} />
          </>
        )}
      </div>

      {/* Charts row 1 */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Revenue area chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Revenue Overview</CardTitle>
              <p className="text-sm text-muted-foreground">Last 12 months</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-lg font-bold tabular-nums">{formatPesoK(revenueData?.reduce((s, r) => s + r.revenue, 0) ?? 0)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <div className="flex h-[280px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueData ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickFormatter={(v) => formatPesoK(v)} />
                  <Tooltip content={<ChartTooltip formatter={formatPeso} />} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2.5} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Lead sources pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lead Sources</CardTitle>
            <p className="text-sm text-muted-foreground">This quarter</p>
          </CardHeader>
          <CardContent>
            {leadsLoading ? (
              <div className="flex h-[200px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={leadSourceData}
                      dataKey="count"
                      nameKey="source"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {leadSourceData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-1.5">
                  {leadSourceData.map((s) => (
                    <div key={s.source} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.fill }} />
                        <span className="text-muted-foreground">{s.source}</span>
                      </div>
                      <span className="font-medium tabular-nums">{s.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Project pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project Pipeline</CardTitle>
            <p className="text-sm text-muted-foreground">Projects by stage</p>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="flex h-[220px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={projectPipelineData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="stage" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Discovery calls by week */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Discovery Calls</CardTitle>
            <p className="text-sm text-muted-foreground">Bookings by week</p>
          </CardHeader>
          <CardContent>
            {callBookingsLoading ? (
              <div className="flex h-[220px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={callBookingsData ?? []} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Bar dataKey="calls" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Product sales trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Digital Product Sales</CardTitle>
            <p className="text-sm text-muted-foreground">Monthly trend</p>
          </CardHeader>
          <CardContent>
            {productSalesLoading ? (
              <div className="flex h-[220px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={productSalesData ?? []} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="sales" stroke="hsl(var(--chart-3))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--chart-3))', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity feed + quick stats */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs">
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="flex h-[200px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
              </div>
            ) : (
              <div className="space-y-1">
                {(activitiesData ?? []).map((act, i) => {
                  const Icon = activityIcons[act.icon] ?? Mail;
                  return (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50"
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${activityColors[act.type]}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug">{act.text}</p>
                        <p className="text-xs text-muted-foreground">{act.time}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Active Clients', value: String(activeClients), icon: Users, color: 'text-primary' },
              { label: 'MRR', value: formatPeso(monthlyRevenue), icon: DollarSign, color: 'text-emerald-500' },
              { label: 'Calls This Month', value: String(callsBooked), icon: PhoneCall, color: 'text-violet-500' },
              { label: 'Projects in Progress', value: String(projectsInProgress), icon: FolderKanban, color: 'text-amber-500' },
              { label: 'Product Sales', value: String(productSalesCount), icon: Package, color: 'text-rose-500' },
              { label: 'Outstanding', value: formatPeso(outstandingInvoices), icon: FileWarning, color: 'text-orange-500' },
              { label: 'Content Scheduled', value: '96', icon: Share2, color: 'text-blue-500' },
              { label: 'Team Utilization', value: '84%', icon: Target, color: 'text-indigo-500' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${s.color}`} />
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{s.value}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
