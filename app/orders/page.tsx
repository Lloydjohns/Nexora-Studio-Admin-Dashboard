'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  ShoppingBag,
  DollarSign,
  CheckCircle,
  XCircle,
  Download,
  Search,
  Filter,
  Trash2,
} from 'lucide-react';
import { DashboardShell, PageHeader } from '@/components/dashboard-shell';
import { KpiCard, StatusBadge } from '@/components/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { fetchOrders, insertOrder, updateOrder, deleteOrder } from '@/lib/api';
import { formatPeso } from '@/lib/data';
import { useFetch } from '@/hooks/use-fetch';
import { toast } from 'sonner';

const paymentOptions = ['GCash', 'PayPal', 'Bank Transfer', 'Credit Card', 'PayMaya'];
const statusOptions = ['Paid', 'Pending', 'Refunded', 'Failed'] as const;

interface OrderForm {
  customer: string;
  product: string;
  amount: string;
  paymentMethod: string;
  status: 'Paid' | 'Pending' | 'Refunded' | 'Failed';
  date: string;
}

const emptyForm: OrderForm = {
  customer: '',
  product: '',
  amount: '0',
  paymentMethod: 'GCash',
  status: 'Paid',
  date: new Date().toISOString().split('T')[0],
};

export default function OrdersPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const { data: orders, loading } = useFetch(fetchOrders, [refreshKey]);
  const refetch = () => setRefreshKey((k) => k + 1);

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [open, setOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<OrderForm>(emptyForm);

  const allOrders = orders ?? [];

  const filtered = allOrders.filter((o) => {
    const matchesSearch =
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = allOrders.filter((o) => o.status === 'Paid').reduce((s, o) => s + o.amount, 0);
  const paidCount = allOrders.filter((o) => o.status === 'Paid').length;
  const pendingCount = allOrders.filter((o) => o.status === 'Pending').length;
  const failedCount = allOrders.filter((o) => o.status === 'Failed').length;

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(id: string) {
    const o = allOrders.find((x) => x.id === id);
    if (!o) return;
    setEditId(id);
    setForm({
      customer: o.customer,
      product: o.product,
      amount: String(o.amount),
      paymentMethod: o.paymentMethod,
      status: o.status,
      date: o.date,
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        customer: form.customer,
        product: form.product,
        amount: Number(form.amount) || 0,
        payment_method: form.paymentMethod,
        status: form.status,
        download_sent: form.status === 'Paid',
        date: form.date,
      };
      if (editId) {
        await updateOrder(editId, payload);
        toast.success('Order updated');
      } else {
        await insertOrder(payload);
        toast.success('Order added');
      }
      setOpen(false);
      refetch();
    } catch (err: any) {
      toast.error('Failed to save order', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteOrder(id);
      toast.success('Order deleted');
      refetch();
    } catch (err: any) {
      toast.error('Failed to delete order', { description: err.message });
    }
  }

  return (
    <DashboardShell>
      <PageHeader title="Orders" description="Track digital product purchases and payments">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => {
            const rows = [
              ['Order ID', 'Customer', 'Product', 'Amount', 'Payment Method', 'Status', 'Download Sent', 'Date'],
              ...allOrders.map((o) => [o.id, o.customer, o.product, String(o.amount), o.paymentMethod, o.status, o.downloadSent ? 'Yes' : 'No', o.date]),
            ];
            const csv = rows.map((r) => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'orders_export.csv';
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Orders exported');
          }}>
            <Download className="mr-1.5 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Order
          </Button>
        </div>
      </PageHeader>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total Orders" value={String(allOrders.length)} delta="+8" trend="up" icon={ShoppingBag} index={0} />
        <KpiCard label="Revenue" value={formatPeso(totalRevenue)} delta="+₱8K" trend="up" icon={DollarSign} accent="text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400" index={1} />
        <KpiCard label="Pending" value={String(pendingCount)} icon={ShoppingBag} accent="text-amber-600 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400" index={2} />
        <KpiCard label="Failed" value={String(failedCount)} icon={XCircle} accent="text-rose-600 bg-rose-100 dark:bg-rose-500/15 dark:text-rose-400" index={3} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order ID, customer, or product..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Refunded">Refunded</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Download</TableHead>
              <TableHead>Date</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((__, j) => (
                    <TableCell key={j}><div className="h-4 w-20 rounded bg-muted animate-pulse" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              filtered.map((o, i) => (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="cursor-pointer border-b transition-colors hover:bg-muted/50"
                  onClick={() => openEdit(o.id)}
                >
                  <TableCell className="font-mono text-xs font-medium">{o.id}</TableCell>
                  <TableCell className="font-medium">{o.customer}</TableCell>
                  <TableCell className="text-muted-foreground">{o.product}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{formatPeso(o.amount)}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{o.paymentMethod}</Badge></TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                  <TableCell>
                    {o.downloadSent ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600">
                        <CheckCircle className="h-3.5 w-3.5" /> Sent
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <XCircle className="h-3.5 w-3.5" /> Not sent
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{o.date}</TableCell>
                  <TableCell>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-rose-500" onClick={(e) => { e.stopPropagation(); handleDelete(o.id); }} />
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
        {filtered.length === 0 && !loading && (
          <div className="py-12 text-center text-sm text-muted-foreground">No orders match your search.</div>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Order' : 'Add Order'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Input id="customer" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Input id="product" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₱)</Label>
                <Input id="amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {paymentOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
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
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editId ? 'Update' : 'Add Order'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
