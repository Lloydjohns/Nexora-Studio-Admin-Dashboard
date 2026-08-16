'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  UsersRound,
  Briefcase,
  CheckSquare,
  TrendingUp,
  Trash2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { DashboardShell, PageHeader } from '@/components/dashboard-shell';
import { KpiCard, Avatar, StatusBadge } from '@/components/shared';
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
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { fetchTeam, insertTeamMember, updateTeamMember, deleteTeamMember } from '@/lib/api';
import { useFetch } from '@/hooks/use-fetch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const roleOptions = ['Admin', 'Creative Director', 'Designer', 'Video Editor', 'Copywriter', 'Web Developer', 'Social Media Manager'];
const availabilityOptions = ['Available', 'Busy', 'On Leave'] as const;

interface MemberForm {
  name: string;
  role: string;
  email: string;
  activeProjects: string;
  tasksAssigned: string;
  tasksCompleted: string;
  availability: typeof availabilityOptions[number];
  utilization: number;
}

const emptyForm: MemberForm = {
  name: '',
  role: 'Designer',
  email: '',
  activeProjects: '0',
  tasksAssigned: '0',
  tasksCompleted: '0',
  availability: 'Available',
  utilization: 50,
};

export default function TeamPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const { data: team, loading } = useFetch(fetchTeam, [refreshKey]);
  const refetch = () => setRefreshKey((k) => k + 1);

  const [open, setOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<MemberForm>(emptyForm);

  const allMembers = team ?? [];
  const totalProjects = allMembers.reduce((s, t) => s + t.activeProjects, 0);
  const totalTasks = allMembers.reduce((s, t) => s + t.tasksAssigned, 0);
  const activeMembers = allMembers.filter((t) => t.availability !== 'On Leave');
  const avgUtilization = activeMembers.length > 0
    ? Math.round(activeMembers.reduce((s, t) => s + t.utilization, 0) / activeMembers.length)
    : 0;

  const utilizationData = activeMembers.map((t) => ({
    name: t.name.split(' ')[0],
    utilization: t.utilization,
    fill: t.utilization > 85 ? 'hsl(0, 72%, 51%)' : t.utilization > 70 ? 'hsl(38, 92%, 50%)' : 'hsl(142, 71%, 45%)',
  }));

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(id: string) {
    const m = allMembers.find((x) => x.id === id);
    if (!m) return;
    setEditId(id);
    setForm({
      name: m.name,
      role: m.role,
      email: m.email,
      activeProjects: String(m.activeProjects),
      tasksAssigned: String(m.tasksAssigned),
      tasksCompleted: String(m.tasksCompleted),
      availability: m.availability,
      utilization: m.utilization,
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        role: form.role,
        email: form.email,
        active_projects: Number(form.activeProjects) || 0,
        tasks_assigned: Number(form.tasksAssigned) || 0,
        tasks_completed: Number(form.tasksCompleted) || 0,
        availability: form.availability,
        utilization: form.utilization,
      };
      if (editId) {
        await updateTeamMember(editId, payload);
        toast.success('Team member updated');
      } else {
        await insertTeamMember(payload);
        toast.success('Team member added');
      }
      setOpen(false);
      refetch();
    } catch (err: any) {
      toast.error('Failed to save team member', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTeamMember(id);
      toast.success('Team member removed');
      refetch();
    } catch (err: any) {
      toast.error('Failed to remove team member', { description: err.message });
    }
  }

  function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  }

  return (
    <DashboardShell>
      <PageHeader title="Team Management" description="Track workload, availability, and performance across the team">
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Member
        </Button>
      </PageHeader>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Team Members" value={String(allMembers.length)} icon={UsersRound} index={0} />
        <KpiCard label="Active Projects" value={String(totalProjects)} delta="+3" trend="up" icon={Briefcase} accent="text-amber-600 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400" index={1} />
        <KpiCard label="Tasks Assigned" value={String(totalTasks)} delta="+8" trend="up" icon={CheckSquare} accent="text-blue-600 bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400" index={2} />
        <KpiCard label="Avg Utilization" value={`${avgUtilization}%`} delta="+4%" trend="up" icon={TrendingUp} accent="text-violet-600 bg-violet-100 dark:bg-violet-500/15 dark:text-violet-400" index={3} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Team Members</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-center">Projects</TableHead>
                  <TableHead className="text-center">Tasks</TableHead>
                  <TableHead>Workload</TableHead>
                  <TableHead>Availability</TableHead>
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
                  allMembers.map((m, i) => (
                    <motion.tr
                      key={m.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="cursor-pointer border-b transition-colors hover:bg-muted/50"
                      onClick={() => openEdit(m.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar initials={getInitials(m.name)} className="h-9 w-9" />
                          <div>
                            <p className="text-sm font-medium">{m.name}</p>
                            <p className="text-xs text-muted-foreground">{m.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{m.role}</Badge></TableCell>
                      <TableCell className="text-center tabular-nums">{m.activeProjects}</TableCell>
                      <TableCell className="text-center tabular-nums">{m.tasksAssigned}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                m.utilization > 85 ? 'bg-rose-500' : m.utilization > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                              )}
                              style={{ width: `${m.utilization}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground">{m.utilization}%</span>
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={m.availability} /></TableCell>
                      <TableCell>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-rose-500" onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }} />
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Workload Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={utilizationData} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={50} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                <Bar dataKey="utilization" radius={[0, 4, 4, 0]}>
                  {utilizationData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <h3 className="mb-3 text-sm font-semibold">Performance Summary</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {allMembers.map((m) => (
            <Card key={m.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => openEdit(m.id)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar initials={getInitials(m.name)} className="h-10 w-10" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.role}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold tabular-nums">{m.tasksCompleted}</p>
                    <p className="text-[10px] text-muted-foreground">Completed</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold tabular-nums">{m.activeProjects}</p>
                    <p className="text-[10px] text-muted-foreground">Projects</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold tabular-nums">{m.utilization}%</p>
                    <p className="text-[10px] text-muted-foreground">Utilization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
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
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select value={form.availability} onValueChange={(v) => setForm({ ...form, availability: v as MemberForm['availability'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="activeProjects">Active Projects</Label>
                <Input id="activeProjects" type="number" value={form.activeProjects} onChange={(e) => setForm({ ...form, activeProjects: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tasksAssigned">Tasks Assigned</Label>
                <Input id="tasksAssigned" type="number" value={form.tasksAssigned} onChange={(e) => setForm({ ...form, tasksAssigned: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tasksCompleted">Tasks Completed</Label>
                <Input id="tasksCompleted" type="number" value={form.tasksCompleted} onChange={(e) => setForm({ ...form, tasksCompleted: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Utilization: {form.utilization}%</Label>
                <Slider value={[form.utilization]} max={100} step={5} onValueChange={(v) => setForm({ ...form, utilization: v[0] })} />
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
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editId ? 'Update' : 'Add Member'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
