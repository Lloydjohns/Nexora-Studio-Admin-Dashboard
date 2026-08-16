'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Globe,
  FileText,
  CheckCircle,
  Settings2,
  Trash2,
} from 'lucide-react';
import { DashboardShell, PageHeader } from '@/components/dashboard-shell';
import { KpiCard, StatusBadge } from '@/components/shared';
import { Card, CardContent } from '@/components/ui/card';
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
import { fetchWebsiteRequests, insertWebsiteRequest, updateWebsiteRequest, deleteWebsiteRequest } from '@/lib/api';
import { useFetch } from '@/hooks/use-fetch';
import { toast } from 'sonner';

const budgetOptions = ['₱15,000–₱40,000', '₱40,000–₱80,000', '₱80,000+'];
const timelineOptions = ['2–4 weeks', '4–6 weeks', '8–12 weeks'];
const pageOptions = ['Home', 'Services', 'About', 'Contact', 'Menu', 'Listings', 'Team', 'FAQ', 'Blog', 'Book Now', 'Reservations', 'Client Portal', 'Agents'];
const featureOptions = ['Contact Form', 'Online Menu', 'Reservation System', 'Gallery', 'Google Maps', 'Client Login', 'Newsletter', 'Property Search', 'Map Integration', 'Lead Capture', 'Agent Profiles', 'Appointment Booking', 'FAQ Section'];
const proposalStatusOptions = ['Not Sent', 'Sent', 'Accepted', 'Rejected'] as const;
const devStatusOptions = ['Not Started', 'In Progress', 'Review', 'Live'] as const;

interface RequestForm {
  business: string;
  businessType: string;
  goals: string;
  pagesRequested: string[];
  featuresRequested: string[];
  budget: string;
  timeline: string;
  proposalStatus: typeof proposalStatusOptions[number];
  developmentStatus: typeof devStatusOptions[number];
}

const emptyForm: RequestForm = {
  business: '',
  businessType: '',
  goals: '',
  pagesRequested: [],
  featuresRequested: [],
  budget: '₱15,000–₱40,000',
  timeline: '4–6 weeks',
  proposalStatus: 'Not Sent',
  developmentStatus: 'Not Started',
};

export default function WebsiteRequestsPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const { data: requests, loading } = useFetch(fetchWebsiteRequests, [refreshKey]);
  const refetch = () => setRefreshKey((k) => k + 1);

  const [open, setOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<RequestForm>(emptyForm);

  const allRequests = requests ?? [];
  const inProgress = allRequests.filter((w) => w.developmentStatus === 'In Progress').length;
  const proposalsSent = allRequests.filter((w) => w.proposalStatus === 'Sent').length;
  const accepted = allRequests.filter((w) => w.proposalStatus === 'Accepted').length;

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(id: string) {
    const r = allRequests.find((x) => x.id === id);
    if (!r) return;
    setEditId(id);
    setForm({
      business: r.business,
      businessType: r.businessType,
      goals: r.goals,
      pagesRequested: r.pagesRequested,
      featuresRequested: r.featuresRequested,
      budget: r.budget,
      timeline: r.timeline,
      proposalStatus: r.proposalStatus,
      developmentStatus: r.developmentStatus,
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        business: form.business,
        business_type: form.businessType,
        goals: form.goals,
        pages_requested: form.pagesRequested,
        features_requested: form.featuresRequested,
        budget: form.budget,
        timeline: form.timeline,
        proposal_status: form.proposalStatus,
        development_status: form.developmentStatus,
      };
      if (editId) {
        await updateWebsiteRequest(editId, payload);
        toast.success('Request updated');
      } else {
        await insertWebsiteRequest(payload);
        toast.success('Request added');
      }
      setOpen(false);
      refetch();
    } catch (err: any) {
      toast.error('Failed to save request', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteWebsiteRequest(id);
      toast.success('Request deleted');
      refetch();
    } catch (err: any) {
      toast.error('Failed to delete request', { description: err.message });
    }
  }

  function toggleArrayItem(arr: string[], item: string): string[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
  }

  return (
    <DashboardShell>
      <PageHeader title="Website & Systems Requests" description="Manage website inquiries, proposals, and development builds">
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Request
        </Button>
      </PageHeader>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total Requests" value={String(allRequests.length)} delta="+2" trend="up" icon={Globe} index={0} />
        <KpiCard label="In Development" value={String(inProgress)} icon={Settings2} accent="text-blue-600 bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400" index={1} />
        <KpiCard label="Proposals Sent" value={String(proposalsSent)} icon={FileText} accent="text-amber-600 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400" index={2} />
        <KpiCard label="Accepted" value={String(accepted)} delta="+1" trend="up" icon={CheckCircle} accent="text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400" index={3} />
      </div>

      <Tabs defaultValue="cards" className="mt-6">
        <TabsList>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><CardContent className="h-48 animate-pulse bg-muted/30" /></Card>
              ))
            ) : (
              allRequests.map((w, i) => (
                <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold">{w.business}</p>
                          <p className="text-xs text-muted-foreground">{w.businessType} · {w.date}</p>
                        </div>
                        <Trash2 className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-rose-500" onClick={() => handleDelete(w.id)} />
                      </div>

                      <p className="mt-3 text-sm text-muted-foreground">{w.goals}</p>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] font-medium uppercase text-muted-foreground">Budget</p>
                          <p className="text-sm font-medium">{w.budget}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium uppercase text-muted-foreground">Timeline</p>
                          <p className="text-sm font-medium">{w.timeline}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="mb-1.5 text-[10px] font-medium uppercase text-muted-foreground">Pages Requested</p>
                        <div className="flex flex-wrap gap-1.5">
                          {w.pagesRequested.map((p) => (
                            <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="mb-1.5 text-[10px] font-medium uppercase text-muted-foreground">Features</p>
                        <div className="flex flex-wrap gap-1.5">
                          {w.featuresRequested.map((f) => (
                            <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t pt-4">
                        <div className="flex gap-4">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Proposal</p>
                            <StatusBadge status={w.proposalStatus} />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Development</p>
                            <StatusBadge status={w.developmentStatus} />
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openEdit(w.id)}>
                          <FileText className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Proposal</TableHead>
                  <TableHead>Development</TableHead>
                  <TableHead>Date</TableHead>
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
                  allRequests.map((w) => (
                    <TableRow key={w.id} className="cursor-pointer" onClick={() => openEdit(w.id)}>
                      <TableCell className="font-medium">{w.business}</TableCell>
                      <TableCell className="text-muted-foreground">{w.businessType}</TableCell>
                      <TableCell className="text-muted-foreground">{w.budget}</TableCell>
                      <TableCell className="text-muted-foreground">{w.timeline}</TableCell>
                      <TableCell><StatusBadge status={w.proposalStatus} /></TableCell>
                      <TableCell><StatusBadge status={w.developmentStatus} /></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{w.date}</TableCell>
                      <TableCell>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-rose-500" onClick={(e) => { e.stopPropagation(); handleDelete(w.id); }} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Request' : 'Add Request'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="business">Business Name</Label>
                <Input id="business" value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Input id="businessType" value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goals">Goals</Label>
              <Textarea id="goals" value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} rows={2} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Budget</Label>
                <Select value={form.budget} onValueChange={(v) => setForm({ ...form, budget: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {budgetOptions.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timeline</Label>
                <Select value={form.timeline} onValueChange={(v) => setForm({ ...form, timeline: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {timelineOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Proposal Status</Label>
                <Select value={form.proposalStatus} onValueChange={(v) => setForm({ ...form, proposalStatus: v as RequestForm['proposalStatus'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {proposalStatusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Development Status</Label>
                <Select value={form.developmentStatus} onValueChange={(v) => setForm({ ...form, developmentStatus: v as RequestForm['developmentStatus'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {devStatusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pages Requested</Label>
              <div className="flex flex-wrap gap-1.5">
                {pageOptions.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, pagesRequested: toggleArrayItem(form.pagesRequested, p) })}
                    className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                      form.pagesRequested.includes(p) ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Features Requested</Label>
              <div className="flex flex-wrap gap-1.5">
                {featureOptions.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setForm({ ...form, featuresRequested: toggleArrayItem(form.featuresRequested, f) })}
                    className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                      form.featuresRequested.includes(f) ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'
                    }`}
                  >
                    {f}
                  </button>
                ))}
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
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editId ? 'Update' : 'Add Request'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
