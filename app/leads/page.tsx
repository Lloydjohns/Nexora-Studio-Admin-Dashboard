'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Mail,
  TrendingUp,
  UserSearch,
  Target,
  Filter,
  ArrowRight,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import { DashboardShell, PageHeader } from '@/components/dashboard-shell';
import { KpiCard, StatusBadge } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { fetchLeads, insertLead, updateLead, deleteLead, insertClient } from '@/lib/api';
import { leadSourceData, type LeadStatus } from '@/lib/data';
import { useFetch } from '@/hooks/use-fetch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const stages: LeadStatus[] = [
  'New',
  'Contacted',
  'Discovery Scheduled',
  'Proposal Sent',
  'Won',
  'Lost',
];

const budgetOptions = ['₱15,000–₱30,000', '₱30,000–₱60,000', '₱60,000+'];
const sourceOptions = ['Instagram', 'Website', 'Referral', 'Facebook', 'TikTok'];

interface LeadForm {
  name: string;
  email: string;
  business: string;
  budgetRange: string;
  interestedService: string;
  message: string;
  source: string;
  status: LeadStatus;
}

const emptyForm: LeadForm = {
  name: '',
  email: '',
  business: '',
  budgetRange: '₱15,000–₱30,000',
  interestedService: '',
  message: '',
  source: 'Website',
  status: 'New',
};

export default function LeadsPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const { data: leads, loading } = useFetch(fetchLeads, [refreshKey]);
  const refetch = () => setRefreshKey((k) => k + 1);

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [open, setOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<LeadForm>(emptyForm);

  const allLeads = leads ?? [];

  const filtered = allLeads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.business.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const won = allLeads.filter((l) => l.status === 'Won').length;
  const total = allLeads.length;
  const conversionRate = total > 0 ? ((won / total) * 100).toFixed(1) : '0';

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(id: string) {
    const l = allLeads.find((x) => x.id === id);
    if (!l) return;
    setEditId(id);
    setForm({
      name: l.name,
      email: l.email,
      business: l.business,
      budgetRange: l.budgetRange,
      interestedService: l.interestedService,
      message: l.message,
      source: l.source,
      status: l.status,
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        business: form.business,
        budget_range: form.budgetRange,
        interested_service: form.interestedService,
        message: form.message,
        source: form.source,
        status: form.status,
      };
      if (editId) {
        await updateLead(editId, payload);
        toast.success('Lead updated');
      } else {
        await insertLead(payload);
        toast.success('Lead added');
      }
      setOpen(false);
      refetch();
    } catch (err: any) {
      toast.error('Failed to save lead', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteLead(id);
      toast.success('Lead deleted');
      refetch();
    } catch (err: any) {
      toast.error('Failed to delete lead', { description: err.message });
    }
  }

  async function convertToClient(lead: typeof allLeads[0]) {
    try {
      await insertClient({
        name: lead.name,
        company: lead.business,
        email: lead.email,
        phone: '',
        service_package: 'Social Starter',
        status: 'Onboarding',
        monthly_retainer: 0,
        account_manager: '',
        industry: '',
        start_date: new Date().toISOString().split('T')[0],
      });
      await updateLead(lead.id, { status: 'Won' });
      toast.success(`${lead.name} converted to client`);
      refetch();
    } catch (err: any) {
      toast.error('Failed to convert lead', { description: err.message });
    }
  }

  return (
    <DashboardShell>
      <PageHeader title="Leads & Inquiries" description="Track contact form submissions and manage your sales pipeline">
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Lead
        </Button>
      </PageHeader>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total Leads" value={String(total)} delta="+6" trend="up" icon={UserSearch} index={0} />
        <KpiCard label="Won This Month" value={String(won)} delta="+2" trend="up" icon={Target} accent="text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400" index={1} />
        <KpiCard label="Conversion Rate" value={`${conversionRate}%`} delta="+4.2%" trend="up" icon={TrendingUp} accent="text-violet-600 bg-violet-100 dark:bg-violet-500/15 dark:text-violet-400" index={2} />
        <KpiCard label="Proposals Out" value={String(allLeads.filter((l) => l.status === 'Proposal Sent').length)} icon={Mail} accent="text-amber-600 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400" index={3} />
      </div>

      <Tabs defaultValue="pipeline" className="mt-6">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline Board</TabsTrigger>
          <TabsTrigger value="list">All Leads</TabsTrigger>
        </TabsList>

        {/* Pipeline board */}
        <TabsContent value="pipeline" className="mt-4">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => {
              const stageLeads = allLeads.filter((l) => l.status === stage);
              return (
                <div key={stage} className="w-72 shrink-0">
                  <div className={cn('rounded-t-lg border-t-2 bg-muted/30')}>
                    <div className="flex items-center justify-between px-3 py-2.5">
                      <p className="text-sm font-semibold">{stage}</p>
                      <Badge variant="secondary" className="text-[10px]">{stageLeads.length}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2 p-2">
                    {stageLeads.length === 0 ? (
                      <div className="rounded-lg border border-dashed py-8 text-center text-xs text-muted-foreground">
                        No leads
                      </div>
                    ) : (
                      stageLeads.map((l, i) => (
                        <motion.div
                          key={l.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => openEdit(l.id)}>
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold truncate">{l.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{l.business}</p>
                                </div>
                                <Trash2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground hover:text-rose-500" onClick={(e) => { e.stopPropagation(); handleDelete(l.id); }} />
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px]">{l.source}</Badge>
                                <span className="text-[10px] text-muted-foreground">{l.budgetRange}</span>
                              </div>
                              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{l.message}</p>
                              {stage !== 'Won' && stage !== 'Lost' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-2 h-7 w-full text-xs"
                                  onClick={(e) => { e.stopPropagation(); convertToClient(l); }}
                                >
                                  Convert to Client
                                  <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* List view */}
        <TabsContent value="list" className="mt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
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
                {stages.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
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
                  filtered.map((l) => (
                    <TableRow key={l.id} className="cursor-pointer" onClick={() => openEdit(l.id)}>
                      <TableCell>
                        <p className="font-medium">{l.name}</p>
                        <p className="text-xs text-muted-foreground">{l.email}</p>
                      </TableCell>
                      <TableCell className="font-medium">{l.business}</TableCell>
                      <TableCell className="text-muted-foreground">{l.interestedService}</TableCell>
                      <TableCell className="text-muted-foreground">{l.budgetRange}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{l.source}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{l.date? new Date(l.date).toLocaleDateString('en-PH',{year: 'numeric',month: 'short',day: 'numeric',},): '—'}</TableCell>
                      <TableCell><StatusBadge status={l.status} /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {filtered.length === 0 && !loading && (
              <div className="py-12 text-center text-sm text-muted-foreground">No leads match your search.</div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lead sources summary */}
      <Card className="mt-4">
        <CardHeader><CardTitle className="text-base">Lead Sources Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {leadSourceData.map((s) => (
              <div key={s.source} className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">{s.source}</p>
                <p className="text-2xl font-bold tabular-nums">{s.count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Lead' : 'Add Lead'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business">Business</Label>
                <Input id="business" value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service">Interested Service</Label>
                <Input id="service" value={form.interestedService} onChange={(e) => setForm({ ...form, interestedService: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Budget Range</Label>
                <Select value={form.budgetRange} onValueChange={(v) => setForm({ ...form, budgetRange: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {budgetOptions.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {sourceOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as LeadStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {stages.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} />
            </div>
            <DialogFooter>
              {editId && (
                <Button type="button" variant="destructive" onClick={() => { handleDelete(editId); setOpen(false); }} className="mr-auto">
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editId ? 'Update' : 'Add Lead'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
