'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Mail,
  Phone,
  ArrowLeft,
  Building2,
  Calendar,
  Palette,
  Instagram,
  Facebook,
  Users as UsersIcon,
  DollarSign,
  TrendingUp,
  FileText,
  MessageSquare,
  FolderKanban,
  CalendarDays,
  Paperclip,
  StickyNote,
  Filter,
  Trash2,
} from 'lucide-react';
import { DashboardShell, PageHeader } from '@/components/dashboard-shell';
import { KpiCard, StatusBadge, Avatar, ProgressBar } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { fetchClients, fetchProjects, fetchContentItems, fetchInvoices, insertClient, updateClient, deleteClient } from '@/lib/api';
import { type ClientStatus } from '@/lib/data';
import { formatPeso } from '@/lib/data';
import { useFetch } from '@/hooks/use-fetch';
import { toast } from 'sonner';

const packageOptions = ['Social Starter', 'Social Growth Pro', 'Web + Social Pro', 'Web + Systems'];
const statusOptions: ClientStatus[] = ['Active', 'Onboarding', 'Paused', 'Churned'];

interface ClientForm {
  name: string;
  company: string;
  email: string;
  phone: string;
  servicePackage: string;
  status: ClientStatus;
  monthlyRetainer: string;
  accountManager: string;
  industry: string;
  startDate: string;
}

const emptyForm: ClientForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  servicePackage: 'Social Starter',
  status: 'Onboarding',
  monthlyRetainer: '0',
  accountManager: '',
  industry: '',
  startDate: new Date().toISOString().split('T')[0],
};

export default function ClientsPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = React.useState(0);
  const { data: clients, loading } = useFetch(fetchClients, [refreshKey]);
  const { data: projects } = useFetch(fetchProjects, [refreshKey]);
  const { data: contentItems } = useFetch(fetchContentItems, [refreshKey]);
  const { data: invoices } = useFetch(fetchInvoices, [refreshKey]);
  const refetch = () => setRefreshKey((k) => k + 1);

  const [selected, setSelected] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [open, setOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<ClientForm>(emptyForm);

  const allClients = clients ?? [];
  const allProjects = projects ?? [];
  const allContent = contentItems ?? [];
  const allInvoices = invoices ?? [];

  const filtered = allClients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedClient = allClients.find((c) => c.id === selected);
  const clientProjects = allProjects.filter((p) => p.client === selectedClient?.company);
  const clientContent = allContent.filter((c) => c.client === selectedClient?.company);
  const clientInvoices = allInvoices.filter((i) => i.client === selectedClient?.company);

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(id: string) {
    const c = allClients.find((x) => x.id === id);
    if (!c) return;
    setEditId(id);
    setForm({
      name: c.name,
      company: c.company,
      email: c.email,
      phone: c.phone,
      servicePackage: c.servicePackage,
      status: c.status,
      monthlyRetainer: String(c.monthlyRetainer),
      accountManager: c.accountManager,
      industry: c.industry,
      startDate: c.startDate,
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone,
        service_package: form.servicePackage,
        status: form.status,
        monthly_retainer: Number(form.monthlyRetainer) || 0,
        account_manager: form.accountManager,
        industry: form.industry,
        start_date: form.startDate,
      };
      if (editId) {
        await updateClient(editId, payload);
        toast.success('Client updated');
      } else {
        await insertClient(payload);
        toast.success('Client added');
      }
      setOpen(false);
      refetch();
    } catch (err: any) {
      toast.error('Failed to save client', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteClient(id);
      toast.success('Client deleted');
      setSelected(null);
      refetch();
    } catch (err: any) {
      toast.error('Failed to delete client', { description: err.message });
    }
  }

  if (selectedClient) {
    return (
      <DashboardShell>
        <button
          onClick={() => setSelected(null)}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to clients
        </button>

        {/* Profile header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar initials={selectedClient.name.split(' ').map((n) => n[0]).join('')} className="h-16 w-16 text-lg" />
                <div>
                  <h2 className="text-xl font-bold">{selectedClient.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedClient.company} · {selectedClient.industry}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={selectedClient.status} />
                    <Badge variant="secondary">{selectedClient.servicePackage}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(selectedClient.id)}>
                  <FileText className="mr-1.5 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(selectedClient.id)}>
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete
                </Button>
                <Button size="sm" onClick={() => router.push('/projects')}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  New Project
                </Button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Monthly Retainer</p>
                <p className="text-lg font-bold tabular-nums">{formatPeso(selectedClient.monthlyRetainer)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Account Manager</p>
                <p className="text-sm font-semibold">{selectedClient.accountManager}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Start Date</p>
                <p className="text-sm font-semibold">{selectedClient.startDate}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Activity</p>
                <p className="text-sm font-semibold">{selectedClient.lastActivity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="calendar">Content Calendar</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <CardHeader><CardTitle className="text-base">Contact Details</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2.5 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {selectedClient.email}
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selectedClient.phone}
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {selectedClient.industry}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Social Accounts</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {selectedClient.socials.map((s) => (
                    <div key={s.platform} className="flex items-center gap-2.5 text-sm">
                      {s.platform === 'Instagram' ? (
                        <Instagram className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Facebook className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-muted-foreground">{s.platform}</span>
                      <span className="font-medium">{s.handle}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Brand Guidelines</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {selectedClient.brandColors.map((c) => (
                      <div key={c} className="flex flex-col items-center gap-1.5">
                        <div className="h-12 w-12 rounded-lg border border-border" style={{ background: c }} />
                        <span className="text-[10px] text-muted-foreground">{c}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground">Next Meeting</p>
                    <p className="text-sm font-semibold">{selectedClient.nextMeeting === '—' ? 'Not scheduled' : selectedClient.nextMeeting}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="mt-4">
            <div className="space-y-3">
              {clientProjects.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No projects yet for this client.</CardContent></Card>
              ) : (
                clientProjects.map((p) => (
                  <Card key={p.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.serviceType} · Due {p.deadline}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden w-32 sm:block"><ProgressBar value={p.progress} /></div>
                        <StatusBadge status={p.stage} />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <div className="space-y-3">
              {clientContent.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No content scheduled yet.</CardContent></Card>
              ) : (
                clientContent.map((c) => (
                  <Card key={c.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{c.caption}</p>
                        <p className="text-xs text-muted-foreground">{c.platform} · {c.scheduledDate}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="files" className="mt-4">
            <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No files uploaded yet for this client.</CardContent></Card>
          </TabsContent>

          <TabsContent value="invoices" className="mt-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientInvoices.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No invoices yet.</TableCell></TableRow>
                  ) : (
                    clientInvoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.id}</TableCell>
                        <TableCell className="text-muted-foreground">{inv.service}</TableCell>
                        <TableCell className="tabular-nums">{formatPeso(inv.amount)}</TableCell>
                        <TableCell><StatusBadge status={inv.status} /></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                No notes recorded yet.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communications" className="mt-4">
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                No communication log entries yet.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ClientDialog
          open={open}
          onOpenChange={setOpen}
          editId={editId}
          form={form}
          setForm={setForm}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PageHeader title="Clients" description="Manage your client relationships and retainers">
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Client
        </Button>
      </PageHeader>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total Clients" value={String(allClients.length)} delta="+2" trend="up" icon={UsersIcon} index={0} />
        <KpiCard label="Active Retainers" value="₱185K" delta="+₱20K" trend="up" icon={DollarSign} accent="text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400" index={1} />
        <KpiCard label="Avg. Retainer" value="₱28K" delta="+₱2K" trend="up" icon={TrendingUp} accent="text-violet-600 bg-violet-100 dark:bg-violet-500/15 dark:text-violet-400" index={2} />
        <KpiCard label="Onboarding" value={String(allClients.filter((c) => c.status === 'Onboarding').length)} icon={UsersIcon} accent="text-blue-600 bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400" index={3} />
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients by name or company..."
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
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Onboarding">Onboarding</SelectItem>
            <SelectItem value="Paused">Paused</SelectItem>
            <SelectItem value="Churned">Churned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Retainer</TableHead>
              <TableHead>Account Mgr</TableHead>
              <TableHead>Next Meeting</TableHead>
              <TableHead>Last Activity</TableHead>
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
              <AnimatePresence>
                {filtered.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="cursor-pointer border-b transition-colors hover:bg-muted/50"
                    onClick={() => setSelected(c.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar initials={c.name.split(' ').map((n) => n[0]).join('')} className="h-9 w-9" />
                        <div>
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{c.company}</TableCell>
                    <TableCell className="text-muted-foreground">{c.servicePackage}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{formatPeso(c.monthlyRetainer)}</TableCell>
                    <TableCell className="text-muted-foreground">{c.accountManager}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{c.nextMeeting === '—' ? '—' : c.nextMeeting.split('T')[0]}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{c.lastActivity}</TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
        {filtered.length === 0 && !loading && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No clients match your search.
          </div>
        )}
      </Card>

      <ClientDialog
        open={open}
        onOpenChange={setOpen}
        editId={editId}
        form={form}
        setForm={setForm}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </DashboardShell>
  );
}

function ClientDialog({
  open,
  onOpenChange,
  editId,
  form,
  setForm,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editId: string | null;
  form: ClientForm;
  setForm: React.Dispatch<React.SetStateAction<ClientForm>>;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editId ? 'Edit Client' : 'Add Client'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Service Package</Label>
              <Select value={form.servicePackage} onValueChange={(v) => setForm({ ...form, servicePackage: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {packageOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ClientStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="retainer">Monthly Retainer (₱)</Label>
              <Input id="retainer" type="number" value={form.monthlyRetainer} onChange={(e) => setForm({ ...form, monthlyRetainer: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager">Account Manager</Label>
              <Input id="manager" value={form.accountManager} onChange={(e) => setForm({ ...form, accountManager: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editId ? 'Update' : 'Add Client'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
