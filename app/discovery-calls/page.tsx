'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  PhoneCall,
  Clock,
  Calendar,
  CheckCircle,
  FileText,
  Video,
  TrendingUp,
  DollarSign,
  Trash2,
} from 'lucide-react';
import { DashboardShell, PageHeader } from '@/components/dashboard-shell';
import { KpiCard, StatusBadge } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchDiscoveryCalls, insertDiscoveryCall, updateDiscoveryCall, deleteDiscoveryCall } from '@/lib/api';
import { type CallType, type DiscoveryCall } from '@/lib/data';
import { useFetch } from '@/hooks/use-fetch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const callTypeMeta: Record<CallType, { duration: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  'Social Growth Sprint': { duration: '30 min', color: 'from-blue-500 to-indigo-500', icon: TrendingUp },
  'Brand Clarity Session': { duration: '45 min', color: 'from-violet-500 to-purple-500', icon: PhoneCall },
  'Website Roadmap Call': { duration: '60 min', color: 'from-emerald-500 to-teal-500', icon: Video },
};

const callTypes: CallType[] = ['Social Growth Sprint', 'Brand Clarity Session', 'Website Roadmap Call'];

export default function DiscoveryCallsPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const { data: discoveryCalls, loading } = useFetch(fetchDiscoveryCalls, [refreshKey]);
  const refetch = () => setRefreshKey((k) => k + 1);

  const [open, setOpen] = React.useState(false);
  const [notesOpen, setNotesOpen] = React.useState(false);
  const [editingCall, setEditingCall] = React.useState<DiscoveryCall | null>(null);
  const [notesText, setNotesText] = React.useState('');
  const [savingNotes, setSavingNotes] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    clientName: '',
    type: 'Social Growth Sprint' as CallType,
    duration: '30',
    date: '',
    status: 'Scheduled',
    paymentStatus: 'Free',
    notes: '',
    outcome: '',
  });

  const calls = discoveryCalls ?? [];
  const upcoming = calls.filter((c) => c.status === 'Scheduled');
  const completed = calls.filter((c) => c.status === 'Completed');
  const paidCount = calls.filter((c) => c.paymentStatus === 'Paid').length;

  function resetForm() {
    setForm({
      clientName: '',
      type: 'Social Growth Sprint',
      duration: '30',
      date: '',
      status: 'Scheduled',
      paymentStatus: 'Free',
      notes: '',
      outcome: '',
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await insertDiscoveryCall({
        client_name: form.clientName,
        type: form.type,
        duration: Number(form.duration) || 30,
        date: form.date || new Date().toISOString().slice(0, 16),
        status: form.status,
        payment_status: form.paymentStatus,
        notes: form.notes,
        outcome: form.outcome,
      });
      toast.success('Discovery call booked');
      setOpen(false);
      resetForm();
      refetch();
    } catch (err: any) {
      toast.error('Failed to book call', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  function openNotes(call: DiscoveryCall) {
    setEditingCall(call);
    setNotesText(call.notes || '');
    setNotesOpen(true);
  }

  async function handleSaveNotes(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCall) return;
    setSavingNotes(true);
    try {
      await updateDiscoveryCall(editingCall.id, { notes: notesText });
      toast.success('Notes saved');
      setNotesOpen(false);
      setEditingCall(null);
      refetch();
    } catch (err: any) {
      toast.error('Failed to save notes', { description: err.message });
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleGenerateProposal(call: DiscoveryCall) {
    try {
      await updateDiscoveryCall(call.id, { status: 'Completed', outcome: 'Proposal generated and sent to client' });
      toast.success('Proposal generated', { description: `${call.clientName}'s call marked as completed with a draft proposal.` });
      refetch();
    } catch (err: any) {
      toast.error('Failed to generate proposal', { description: err.message });
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDiscoveryCall(id);
      toast.success('Call deleted');
      refetch();
    } catch (err: any) {
      toast.error('Failed to delete call', { description: err.message });
    }
  }

  return (
    <DashboardShell>
      <PageHeader title="Discovery Calls" description="Manage booked strategy sessions and website roadmap calls">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Book Call
        </Button>
      </PageHeader>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total Calls" value={String(calls.length)} delta="+5" trend="up" icon={PhoneCall} index={0} />
        <KpiCard label="Upcoming" value={String(upcoming.length)} icon={Calendar} accent="text-blue-600 bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400" index={1} />
        <KpiCard label="Completed" value={String(completed.length)} delta="+2" trend="up" icon={CheckCircle} accent="text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400" index={2} />
        <KpiCard label="Paid Sessions" value={String(paidCount)} icon={DollarSign} accent="text-violet-600 bg-violet-100 dark:bg-violet-500/15 dark:text-violet-400" index={3} />
      </div>

      {/* Call types */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {(Object.keys(callTypeMeta) as CallType[]).map((type) => {
          const meta = callTypeMeta[type];
          const Icon = meta.icon;
          const count = calls.filter((c) => c.type === type).length;
          return (
            <Card key={type}>
              <CardContent className="p-5">
                <div className={cn('mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white', meta.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold">{type}</p>
                <div className="mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {meta.duration}
                  </span>
                  <span className="text-xs text-muted-foreground">{count} booked</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="upcoming" className="mt-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {loading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                          <div className="h-2 w-24 rounded bg-muted animate-pulse" />
                        </div>
                      </div>
                      <div className="h-5 w-12 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="mt-4 h-3 w-40 rounded bg-muted animate-pulse" />
                    <div className="mt-3 h-16 rounded-lg bg-muted/50 animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {upcoming.map((call, i) => {
                const meta = callTypeMeta[call.type];
                return (
                  <motion.div key={call.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white', meta.color)}>
                              <PhoneCall className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{call.clientName}</p>
                              <p className="text-xs text-muted-foreground">{call.type} · {call.duration} min</p>
                            </div>
                          </div>
                          <StatusBadge status={call.paymentStatus} />
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{new Date(call.date).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          <span className="text-muted-foreground">at {new Date(call.date).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}</span>
                        </div>

                        <div className="mt-3 rounded-lg bg-muted/50 p-3">
                          <p className="text-xs font-medium text-muted-foreground">Notes</p>
                          <p className="mt-1 text-sm">{call.notes}</p>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => openNotes(call)}>
                            <FileText className="mr-1.5 h-3.5 w-3.5" />
                            Add Notes
                          </Button>
                          <Button size="sm" className="flex-1" onClick={() => handleGenerateProposal(call)}>
                            Generate Proposal
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(call.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {loading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                        <div className="h-2 w-24 rounded bg-muted animate-pulse" />
                      </div>
                      <div className="h-5 w-12 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="mt-3 h-16 rounded-lg bg-muted/50 animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {completed.map((call, i) => (
                <motion.div key={call.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold">{call.clientName}</p>
                          <p className="text-xs text-muted-foreground">{call.type} · {new Date(call.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</p>
                        </div>
                        <StatusBadge status={call.status} />
                      </div>
                      <div className="mt-3 rounded-lg bg-emerald-500/5 p-3">
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Outcome</p>
                        <p className="mt-1 text-sm">{call.outcome}</p>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleDelete(call.id)}>
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Book Discovery Call</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                placeholder="e.g. Patricia Lim"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Call Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as CallType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {callTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date & Time</Label>
              <Input
                id="date"
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={form.paymentStatus} onValueChange={(v) => setForm({ ...form, paymentStatus: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Call context and goals..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outcome">Outcome</Label>
              <Textarea
                id="outcome"
                value={form.outcome}
                onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                placeholder="Result of the call (optional)..."
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Booking...' : 'Book Call'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Notes dialog */}
      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Call Notes — {editingCall?.clientName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveNotes} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Meeting notes</Label>
              <Textarea
                id="notes"
                rows={6}
                placeholder="Key discussion points, action items, next steps..."
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNotesOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={savingNotes}>{savingNotes ? 'Saving...' : 'Save Notes'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
