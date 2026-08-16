'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Package,
  DollarSign,
  Download,
  TrendingUp,
  Boxes,
  Trash2,
} from 'lucide-react';
import { DashboardShell, PageHeader } from '@/components/dashboard-shell';
import { KpiCard, StatusBadge } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { fetchProducts, insertProduct, updateProduct, deleteProduct } from '@/lib/api';
import { formatPeso } from '@/lib/data';
import { useFetch } from '@/hooks/use-fetch';
import { toast } from 'sonner';

const categoryColors: Record<string, string> = {
  'Canva Templates': 'hsl(var(--chart-1))',
  'Notion Systems': 'hsl(var(--chart-2))',
  Planners: 'hsl(var(--chart-3))',
  Printables: 'hsl(var(--chart-5))',
  'Content Calendars': 'hsl(var(--chart-4))',
  'Launch Kits': 'hsl(var(--chart-6))',
};

const categoryOptions = Object.keys(categoryColors);
const statusOptions = ['Active', 'Draft', 'Retired'] as const;

interface ProductForm {
  name: string;
  category: string;
  price: string;
  sku: string;
  status: 'Active' | 'Draft' | 'Retired';
  sales: string;
  revenue: string;
  downloads: string;
}

const emptyForm: ProductForm = {
  name: '',
  category: 'Printables',
  price: '0',
  sku: '',
  status: 'Draft',
  sales: '0',
  revenue: '0',
  downloads: '0',
};

export default function DigitalProductsPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const { data: products, loading } = useFetch(fetchProducts, [refreshKey]);
  const refetch = () => setRefreshKey((k) => k + 1);

  const [open, setOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<ProductForm>(emptyForm);

  const allProducts = products ?? [];
  const totalSales = allProducts.reduce((s, p) => s + p.sales, 0);
  const totalRevenue = allProducts.reduce((s, p) => s + p.revenue, 0);
  const totalDownloads = allProducts.reduce((s, p) => s + p.downloads, 0);
  const active = allProducts.filter((p) => p.status === 'Active').length;

  const categoryData = Object.entries(
    allProducts.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + p.revenue;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value, fill: categoryColors[name] }));

  function openAdd() {
    setEditId(null);
    setForm({ ...emptyForm, sku: 'SKU-' + Date.now() });
    setOpen(true);
  }

  function openEdit(id: string) {
    const p = allProducts.find((x) => x.id === id);
    if (!p) return;
    setEditId(id);
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      sku: p.sku,
      status: p.status,
      sales: String(p.sales),
      revenue: String(p.revenue),
      downloads: String(p.downloads),
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        price: Number(form.price) || 0,
        sku: form.sku,
        status: form.status,
        sales: Number(form.sales) || 0,
        revenue: Number(form.revenue) || 0,
        downloads: Number(form.downloads) || 0,
      };
      if (editId) {
        await updateProduct(editId, payload);
        toast.success('Product updated');
      } else {
        await insertProduct(payload);
        toast.success('Product added');
      }
      setOpen(false);
      refetch();
    } catch (err: any) {
      toast.error('Failed to save product', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      refetch();
    } catch (err: any) {
      toast.error('Failed to delete product', { description: err.message });
    }
  }

  return (
    <DashboardShell>
      <PageHeader title="Digital Products" description="Manage your templates, planners, and downloadable products">
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Product
        </Button>
      </PageHeader>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total Products" value={String(allProducts.length)} icon={Package} index={0} />
        <KpiCard label="Total Sales" value={String(totalSales)} delta="+15%" trend="up" icon={TrendingUp} accent="text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400" index={1} />
        <KpiCard label="Revenue" value={formatPeso(totalRevenue)} delta="+₱8K" trend="up" icon={DollarSign} accent="text-violet-600 bg-violet-100 dark:bg-violet-500/15 dark:text-violet-400" index={2} />
        <KpiCard label="Downloads" value={String(totalDownloads)} delta="+12" trend="up" icon={Download} accent="text-blue-600 bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400" index={3} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">All Products</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j}><div className="h-4 w-20 rounded bg-muted animate-pulse" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  allProducts.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="cursor-pointer border-b transition-colors hover:bg-muted/50"
                      onClick={() => openEdit(p.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.sku}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{p.category}</Badge></TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{formatPeso(p.price)}</TableCell>
                      <TableCell className="text-right tabular-nums">{p.sales}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{formatPeso(p.revenue)}</TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                      <TableCell>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-rose-500" onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} />
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Revenue by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => formatPeso(v)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-1.5">
              {categoryData.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.fill }} />
                    <span className="text-muted-foreground">{c.name}</span>
                  </div>
                  <span className="font-medium tabular-nums">{formatPeso(c.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <h3 className="mb-3 text-sm font-semibold">Product Categories</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Object.keys(categoryColors).map((cat) => {
            const count = allProducts.filter((p) => p.category === cat).length;
            return (
              <Card key={cat} className="cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="p-4 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${categoryColors[cat]}20` }}>
                    <Boxes className="h-5 w-5" style={{ color: categoryColors[cat] }} />
                  </div>
                  <p className="text-xs font-semibold">{cat}</p>
                  <p className="text-[10px] text-muted-foreground">{count} products</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (₱)</Label>
                <Input id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
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
              <div className="space-y-2">
                <Label htmlFor="sales">Sales Count</Label>
                <Input id="sales" type="number" value={form.sales} onChange={(e) => setForm({ ...form, sales: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenue">Revenue (₱)</Label>
                <Input id="revenue" type="number" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="downloads">Downloads</Label>
                <Input id="downloads" type="number" value={form.downloads} onChange={(e) => setForm({ ...form, downloads: e.target.value })} />
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
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editId ? 'Update' : 'Add Product'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
