'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Globe,
  PhoneCall,
  FileText,
  Users,
  TrendingUp,
  Package,
  Calendar,
  DollarSign,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DashboardShell, PageHeader } from '@/components/dashboard-shell';
import { KpiCard, ProgressBar } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPeso, formatPesoK } from '@/lib/data';
import {
  fetchMonthlyRevenue,
  fetchProductSales,
  fetchCallBookings,
  fetchLeads,
  fetchProjects,
  fetchClients,
  fetchInvoices,
  fetchContentItems,
  fetchTeam,
} from '@/lib/api';
import { useFetch } from '@/hooks/use-fetch';
import { toast } from 'sonner';

function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="tabular-nums">
          <span className="text-muted-foreground">{p.name}: </span>
          <span className="font-semibold">{formatter ? formatter(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: revenueData } = useFetch(fetchMonthlyRevenue);
  const { data: productSalesData } = useFetch(fetchProductSales);
  const { data: callBookingsData } = useFetch(fetchCallBookings);
  const { data: leadsData } = useFetch(fetchLeads);
  const { data: projectsData } = useFetch(fetchProjects);
  const { data: clientsData } = useFetch(fetchClients);
  const { data: invoicesData } = useFetch(fetchInvoices);
  const { data: contentData } = useFetch(fetchContentItems);
  const { data: teamData } = useFetch(fetchTeam);

  const leads = leadsData ?? [];
  const projects = projectsData ?? [];
  const clients = clientsData ?? [];
  const invoices = invoicesData ?? [];
  const content = contentData ?? [];
  const team = teamData ?? [];

  // Derived metrics
  const wonLeads = leads.filter((l) => l.status === 'Won').length;
  const conversionRate = leads.length > 0 ? ((wonLeads / leads.length) * 100).toFixed(1) : '0';
  const activeClients = clients.filter((c) => c.status === 'Active').length;
  const retainedClients = clients.length > 0 ? Math.round((activeClients / clients.length) * 100) : 0;
  const paidInvoices = invoices.filter((i) => i.status === 'Paid').length;
  const proposalAcceptance = invoices.length > 0 ? Math.round((paidInvoices / invoices.length) * 100) : 0;
  const scheduledContent = content.filter((c) => c.status === 'Scheduled' || c.status === 'Published').length;
  const approvedContent = content.filter((c) => c.status === 'Approved' || c.status === 'Published').length;
  const contentApprovalRate = content.length > 0 ? Math.round((approvedContent / content.length) * 100) : 0;
  const activeTeam = team.filter((t) => t.availability !== 'On Leave');
  const avgUtilization = activeTeam.length > 0 ? Math.round(activeTeam.reduce((s, t) => s + t.utilization, 0) / activeTeam.length) : 0;
  const totalRevenue = (revenueData ?? []).reduce((s: number, r: any) => s + r.revenue, 0);
  const totalExpenses = (revenueData ?? []).reduce((s: number, r: any) => s + r.expenses, 0);
  const mrr = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);

  const metrics = [
    { label: 'Website Inquiries', value: String(leads.length), delta: '+12', trend: 'up' as const, icon: Globe, color: 'text-blue-600 bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400' },
    { label: 'Discovery Call Conversion', value: `${conversionRate}%`, delta: '+4.2%', trend: 'up' as const, icon: PhoneCall, color: 'text-violet-600 bg-violet-100 dark:bg-violet-500/15 dark:text-violet-400' },
    { label: 'Proposal Acceptance', value: `${proposalAcceptance}%`, delta: '+6%', trend: 'up' as const, icon: FileText, color: 'text-amber-600 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400' },
    { label: 'Client Retention', value: `${retainedClients}%`, delta: '+2%', trend: 'up' as const, icon: Users, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400' },
    { label: 'Content Published', value: String(scheduledContent), delta: '+3.1%', trend: 'up' as const, icon: TrendingUp, color: 'text-rose-600 bg-rose-100 dark:bg-rose-500/15 dark:text-rose-400' },
    { label: 'Active Projects', value: String(projects.filter((p) => p.stage !== 'Completed').length), delta: '+15%', trend: 'up' as const, icon: Package, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-400' },
    { label: 'Avg Project Duration', value: '6.2 weeks', delta: '-0.8w', trend: 'up' as const, icon: Calendar, color: 'text-teal-600 bg-teal-100 dark:bg-teal-500/15 dark:text-teal-400' },
    { label: 'Monthly Recurring Revenue', value: formatPesoK(mrr), delta: '+₱20K', trend: 'up' as const, icon: DollarSign, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400' },
  ];

  const revenueChart = (revenueData ?? []).map((r: any) => ({ month: r.month, revenue: r.revenue }));
  const salesChart = (productSalesData ?? []).map((r: any) => ({ month: r.month, sales: r.sales }));
  const callsChart = (callBookingsData ?? []).map((r: any) => ({ week: r.week, calls: r.calls }));

  return (
    <DashboardShell>
      <PageHeader title="Analytics" description="Business intelligence across all areas of Nexora Studio">
        <Button size="sm" onClick={() => {
          const rows = [
            ['Metric', 'Value', 'Delta', 'Trend'],
            ...metrics.map((m) => [m.label, m.value, m.delta, m.trend]),
            [],
            ['Month', 'Revenue', 'Sales', 'Calls'],
            ...revenueChart.map((r: any, i: number) => [
              r.month,
              r.revenue,
              salesChart[i]?.sales ?? '',
              callsChart[i]?.calls ?? '',
            ]),
          ];
          const csv = rows.map((r) => r.join(',')).join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'analytics_report.csv';
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Analytics report downloaded');
        }}>
          <Download className="mr-1.5 h-4 w-4" />
          Download Report
        </Button>
      </PageHeader>

      {/* Metrics grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
                      <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight">{m.value}</p>
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${m.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    {m.trend === 'up' ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
                    )}
                    <span className={`text-xs font-medium ${m.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>{m.delta}</span>
                    <span className="text-xs text-muted-foreground">vs last period</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* MRR trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Recurring Revenue</CardTitle>
            <p className="text-sm text-muted-foreground">Total: {formatPesoK(totalRevenue)}</p>
          </CardHeader>
          <CardContent>
            {revenueChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={revenueChart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickFormatter={(v) => formatPesoK(v)} />
                  <Tooltip content={<ChartTooltip formatter={formatPeso} />} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-4))" strokeWidth={2.5} fill="url(#mrrGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">Loading chart...</div>
            )}
          </CardContent>
        </Card>

        {/* Product sales performance */}
        <Card>
          <CardHeader><CardTitle className="text-base">Product Sales Performance</CardTitle></CardHeader>
          <CardContent>
            {salesChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={salesChart} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Bar dataKey="sales" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">Loading chart...</div>
            )}
          </CardContent>
        </Card>

        {/* Call conversion trend */}
        <Card>
          <CardHeader><CardTitle className="text-base">Discovery Call Bookings Trend</CardTitle></CardHeader>
          <CardContent>
            {callsChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={callsChart} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="calls" stroke="hsl(var(--chart-2))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--chart-2))', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">Loading chart...</div>
            )}
          </CardContent>
        </Card>

        {/* KPI bars */}
        <Card>
          <CardHeader><CardTitle className="text-base">Key Performance Indicators</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Client Retention Rate', value: retainedClients, color: 'bg-emerald-500' },
              { label: 'Proposal Acceptance Rate', value: proposalAcceptance, color: 'bg-violet-500' },
              { label: 'Lead Conversion Rate', value: Number(conversionRate), color: 'bg-blue-500' },
              { label: 'Team Utilization', value: avgUtilization, color: 'bg-amber-500' },
              { label: 'Content Approval Rate', value: contentApprovalRate, color: 'bg-indigo-500' },
            ].map((kpi) => (
              <div key={kpi.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{kpi.label}</span>
                  <span className="font-semibold tabular-nums">{kpi.value}%</span>
                </div>
                <ProgressBar value={kpi.value} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Expenses summary */}
      <Card className="mt-4">
        <CardHeader><CardTitle className="text-base">Revenue vs Expenses Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Total Revenue (12mo)</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-600">{formatPeso(totalRevenue)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Total Expenses (12mo)</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-rose-600">{formatPeso(totalExpenses)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Net Profit (12mo)</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-primary">{formatPeso(totalRevenue - totalExpenses)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
