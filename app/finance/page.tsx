'use client';

import * as React from 'react';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  FileWarning,
  Download,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DashboardShell, PageHeader } from '@/components/dashboard-shell';
import { KpiCard, StatusBadge } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { fetchInvoices, fetchMonthlyRevenue, insertInvoice, updateInvoice, deleteInvoice } from '@/lib/api';
import { revenueByService, revenueByClient, formatPeso, formatPesoK } from '@/lib/data';
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

interface InvoiceForm {
  client: string;
  amount: string;
  status: 'Paid' | 'Outstanding' | 'Overdue';
  dueDate: string;
  issuedDate: string;
  service: string;
}

const emptyForm: InvoiceForm = {
  client: '',
  amount: '0',
  status: 'Outstanding',
  dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  issuedDate: new Date().toISOString().split('T')[0],
  service: '',
};

export default function FinancePage() {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const { data: invoices, loading } = useFetch(fetchInvoices, [refreshKey]);
  const { data: revData } = useFetch(fetchMonthlyRevenue, [refreshKey]);
  const refetch = () => setRefreshKey((k) => k + 1);

  const [open, setOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<InvoiceForm>(emptyForm);

  const allInvoices = invoices ?? [];
  const revenueData = revData ?? revenueByService.length ? [] : [];
  const chartData = (revData ?? []).map((r: any) => ({
    month: r.month,
    revenue: r.revenue,
    expenses: r.expenses,
  }));

  const totalRevenue = chartData.reduce((s: number, r: any) => s + r.revenue, 0);
  const totalExpenses = chartData.reduce((s: number, r: any) => s + r.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const outstanding = allInvoices.filter((i) => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0);
  const paidThisMonth = allInvoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(id: string) {
    const inv = allInvoices.find((x) => x.id === id);
    if (!inv) return;
    setEditId(id);
    setForm({
      client: inv.client,
      amount: String(inv.amount),
      status: inv.status,
      dueDate: inv.dueDate,
      issuedDate: inv.issuedDate,
      service: inv.service,
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        client: form.client,
        amount: Number(form.amount) || 0,
        status: form.status,
        due_date: form.dueDate,
        issued_date: form.issuedDate,
        service: form.service,
      };
      if (editId) {
        await updateInvoice(editId, payload);
        toast.success('Invoice updated');
      } else {
        await insertInvoice(payload);
        toast.success('Invoice created');
      }
      setOpen(false);
      refetch();
    } catch (err: any) {
      toast.error('Failed to save invoice', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteInvoice(id);
      toast.success('Invoice deleted');
      refetch();
    } catch (err: any) {
      toast.error('Failed to delete invoice', { description: err.message });
    }
  }

  return (
    <DashboardShell>
      <PageHeader title="Finance" description="Track revenue, expenses, invoices, and profitability">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => {
            const rows = [
              ['Invoice ID', 'Client', 'Service', 'Amount', 'Issued', 'Due', 'Status'],
              ...allInvoices.map((inv) => [inv.id, inv.client, inv.service, String(inv.amount), inv.issuedDate, inv.dueDate, inv.status]),
            ];
            const csv = rows.map((r) => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'finance_export.csv';
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Report exported');
          }}>
            <Download className="mr-1.5 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </PageHeader>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total Revenue (12mo)" value={formatPesoK(totalRevenue)} delta="+12.4%" trend="up" icon={DollarSign} accent="text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400" index={0} />
        <KpiCard label="Total Profit (12mo)" value={formatPesoK(totalProfit)} delta="+15.2%" trend="up" icon={TrendingUp} accent="text-violet-600 bg-violet-100 dark:bg-violet-500/15 dark:text-violet-400" index={1} />
        <KpiCard label="Outstanding" value={formatPeso(outstanding)} icon={FileWarning} accent="text-amber-600 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400" index={2} />
        <KpiCard label="Paid This Month" value={formatPesoK(paidThisMonth)} icon={Wallet} accent="text-blue-600 bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400" index={3} />
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Cash Flow</CardTitle>
            <p className="text-sm text-muted-foreground">Revenue vs Expenses</p>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-6))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-6))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickFormatter={(v) => formatPesoK(v)} />
                <Tooltip content={<ChartTooltip formatter={formatPeso} />} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2.5} fill="url(#rev)" />
                <Area type="monotone" dataKey="expenses" stroke="hsl(var(--chart-6))" strokeWidth={2} fill="url(#exp)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">Loading chart data...</div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue by Service</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={revenueByService} dataKey="revenue" nameKey="service" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {revenueByService.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip formatter={formatPeso} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-1.5">
              {revenueByService.map((s) => (
                <div key={s.service} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.fill }} />
                    <span className="text-muted-foreground">{s.service}</span>
                  </div>
                  <span className="font-medium tabular-nums">{formatPeso(s.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Revenue by Client</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueByClient} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickFormatter={(v) => formatPesoK(v)} />
                <YAxis type="category" dataKey="client" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={70} />
                <Tooltip content={<ChartTooltip formatter={formatPeso} />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle className="text-base">Invoices</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}><div className="h-4 w-20 rounded bg-muted animate-pulse" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                allInvoices.map((inv) => (
                  <TableRow key={inv.id} className="cursor-pointer" onClick={() => openEdit(inv.id)}>
                    <TableCell className="font-mono text-xs font-medium">{inv.id}</TableCell>
                    <TableCell className="font-medium">{inv.client}</TableCell>
                    <TableCell className="text-muted-foreground">{inv.service}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{formatPeso(inv.amount)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{inv.issuedDate}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{inv.dueDate}</TableCell>
                    <TableCell><StatusBadge status={inv.status} /></TableCell>
                    <TableCell>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-rose-500" onClick={(e) => { e.stopPropagation(); handleDelete(inv.id); }} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Invoice' : 'New Invoice'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="client">Client</Label>
                <Input id="client" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="service">Service Description</Label>
                <Input id="service" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₱)</Label>
                <Input id="amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as InvoiceForm['status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Outstanding">Outstanding</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuedDate">Issued Date</Label>
                <Input id="issuedDate" type="date" value={form.issuedDate} onChange={(e) => setForm({ ...form, issuedDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              {editId && (
                <Button type="button" variant="destructive" onClick={() => { handleDelete(editId); setOpen(false); }} className="mr-auto">
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editId ? 'Update' : 'Create Invoice'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
