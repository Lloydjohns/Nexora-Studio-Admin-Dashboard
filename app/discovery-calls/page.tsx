'use client';

import * as React from 'react';

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
  Target,
  ArrowRight,
} from 'lucide-react';

import { motion } from 'framer-motion';

import {
  DashboardShell,
  PageHeader,
} from '@/components/dashboard-shell';

import {
  KpiCard,
  StatusBadge,
} from '@/components/shared';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

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

import {
  fetchDiscoveryCalls,
  insertDiscoveryCall,
  updateDiscoveryCall,
  deleteDiscoveryCall,
} from '@/lib/api';

import {
  type CallType,
  type DiscoveryCall,
} from '@/lib/data';

import { useFetch } from '@/hooks/use-fetch';

import { toast } from 'sonner';

import { cn } from '@/lib/utils';

// ============================================================
// CALL TYPES
// ============================================================

const callTypeMeta: Record<
  CallType,
  {
    duration: string;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  'Social Growth Sprint': {
    duration: '30 min',
    color: 'from-blue-500 to-indigo-500',
    icon: TrendingUp,
  },

  'Brand Clarity Session': {
    duration: '45 min',
    color: 'from-violet-500 to-purple-500',
    icon: PhoneCall,
  },

  'Website Roadmap Call': {
    duration: '60 min',
    color: 'from-emerald-500 to-teal-500',
    icon: Video,
  },
};

const callTypes: CallType[] = [
  'Social Growth Sprint',
  'Brand Clarity Session',
  'Website Roadmap Call',
];

// ============================================================
// DISCOVERY OUTCOMES
// ============================================================

const outcomeOptions = [
  {
    value: 'Proposal Sent — Awaiting Decision',
    label: 'Proposal Sent — Awaiting Decision',
    description: 'Client is interested and waiting to review the proposal.',
  },

  {
    value: 'Client Accepted — Project Won',
    label: 'Client Accepted — Project Won',
    description: 'Client accepted the offer and is ready to proceed.',
  },

  {
    value: 'Follow-up Required',
    label: 'Follow-up Required',
    description: 'Client needs another conversation before deciding.',
  },

  {
    value: 'Paid & Ready to Start',
    label: 'Paid & Ready to Start',
    description: 'Payment is complete and the project can begin.',
  },

  {
    value: 'Not Interested',
    label: 'Not Interested',
    description: 'Client decided not to proceed.',
  },

  {
    value: 'Not a Good Fit',
    label: 'Not a Good Fit',
    description: 'The service is not suitable for the client.',
  },

  {
    value: 'Call Rescheduled',
    label: 'Call Rescheduled',
    description: 'The discovery call needs to happen at another time.',
  },

  {
    value: 'No Show',
    label: 'No Show',
    description: 'Client did not attend the scheduled call.',
  },
];

// ============================================================
// PAGE
// ============================================================

export default function DiscoveryCallsPage() {
  const [refreshKey, setRefreshKey] =
    React.useState(0);

  const {
    data: discoveryCalls,
    loading,
  } = useFetch(
    fetchDiscoveryCalls,
    [refreshKey],
  );

  const refetch = () =>
    setRefreshKey((current) => current + 1);

  // ==========================================================
  // BOOKING DIALOG
  // ==========================================================

  const [open, setOpen] =
    React.useState(false);

  // ==========================================================
  // NOTES DIALOG
  // ==========================================================

  const [notesOpen, setNotesOpen] =
    React.useState(false);

  // ==========================================================
  // COMPLETE CALL DIALOG
  // ==========================================================

  const [completeOpen, setCompleteOpen] =
    React.useState(false);

  const [editingCall, setEditingCall] =
    React.useState<DiscoveryCall | null>(null);

  const [notesText, setNotesText] =
    React.useState('');

  const [outcome, setOutcome] =
    React.useState('');

  const [nextStep, setNextStep] =
    React.useState('');

  const [savingNotes, setSavingNotes] =
    React.useState(false);

  const [savingOutcome, setSavingOutcome] =
    React.useState(false);

  const [submitting, setSubmitting] =
    React.useState(false);

  // ==========================================================
  // BOOKING FORM
  // ==========================================================

  const [form, setForm] =
    React.useState({
      clientName: '',
      type: 'Social Growth Sprint' as CallType,
      duration: '30',
      date: '',
      status: 'Scheduled',
      paymentStatus: 'Pending',
      notes: '',
      outcome: '',
    });

  const calls = discoveryCalls ?? [];

  const upcoming = calls.filter(
    (call) =>
      call.status === 'Scheduled',
  );

  const completed = calls.filter(
    (call) =>
      call.status === 'Completed',
  );

  const paidCount = calls.filter(
    (call) =>
      call.paymentStatus === 'Paid',
  ).length;

  // ==========================================================
  // RESET FORM
  // ==========================================================

  function resetForm() {
    setForm({
      clientName: '',
      type: 'Social Growth Sprint',
      duration: '30',
      date: '',
      status: 'Scheduled',
      paymentStatus: 'Pending',
      notes: '',
      outcome: '',
    });
  }

  // ==========================================================
  // ADMIN BOOKING
  // ==========================================================

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    if (!form.clientName.trim()) {
      toast.error(
        'Please enter the client name.',
      );

      return;
    }

    setSubmitting(true);

    try {
      await insertDiscoveryCall({
        client_name:
          form.clientName.trim(),

        type: form.type,

        duration:
          Number(form.duration) || 30,

        date:
          form.date ||
          new Date().toISOString(),

        status: form.status,

        payment_status:
          form.paymentStatus,

        notes: form.notes,

        outcome: form.outcome,
      });

      toast.success(
        'Discovery call booked successfully.',
      );

      setOpen(false);

      resetForm();

      refetch();
    } catch (err: any) {
      console.error(
        'BOOKING ERROR:',
        err,
      );

      toast.error(
        'Failed to book call',
        {
          description:
            err?.message ||
            'Unable to save booking.',
        },
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================================
  // NOTES
  // ==========================================================

  function openNotes(
    call: DiscoveryCall,
  ) {
    setEditingCall(call);

    setNotesText(
      call.notes || '',
    );

    setNotesOpen(true);
  }

  async function handleSaveNotes(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    if (!editingCall) return;

    setSavingNotes(true);

    try {
      await updateDiscoveryCall(
        editingCall.id,
        {
          notes: notesText,
        },
      );

      toast.success(
        'Notes saved.',
      );

      setNotesOpen(false);

      setEditingCall(null);

      refetch();
    } catch (err: any) {
      toast.error(
        'Failed to save notes',
        {
          description:
            err?.message ||
            'Unable to save notes.',
        },
      );
    } finally {
      setSavingNotes(false);
    }
  }

  // ==========================================================
  // COMPLETE CALL
  // ==========================================================

  function openCompleteCall(
    call: DiscoveryCall,
  ) {
    setEditingCall(call);

    setOutcome(
      call.outcome || '',
    );

    setNextStep('');

    setCompleteOpen(true);
  }

  async function handleCompleteCall(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    if (!editingCall) return;

    if (!outcome) {
      toast.error(
        'Please select an outcome.',
      );

      return;
    }

    setSavingOutcome(true);

    try {
      const finalOutcome =
        nextStep.trim()
          ? `${outcome} | Next Step: ${nextStep.trim()}`
          : outcome;

      await updateDiscoveryCall(
        editingCall.id,
        {
          status: 'Completed',
          outcome: finalOutcome,
        },
      );

      toast.success(
        'Discovery call completed.',
        {
          description:
            `${editingCall.clientName}'s call has been updated.`,
        },
      );

      setCompleteOpen(false);

      setEditingCall(null);

      setOutcome('');

      setNextStep('');

      refetch();
    } catch (err: any) {
      console.error(
        'COMPLETE CALL ERROR:',
        err,
      );

      toast.error(
        'Failed to complete call',
        {
          description:
            err?.message ||
            'Unable to save call outcome.',
        },
      );
    } finally {
      setSavingOutcome(false);
    }
  }

  // ==========================================================
  // DELETE
  // ==========================================================

  async function handleDelete(
    id: string,
  ) {
    try {
      await deleteDiscoveryCall(id);

      toast.success(
        'Booking deleted.',
      );

      refetch();
    } catch (err: any) {
      toast.error(
        'Failed to delete booking',
        {
          description:
            err?.message ||
            'Unable to delete booking.',
        },
      );
    }
  }

  // ==========================================================
  // DATE FORMAT
  // ==========================================================

  function formatDate(
    value: string,
  ) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      'en-PH',
      {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      },
    );
  }

  function formatTime(
    value: string,
  ) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleTimeString(
      'en-PH',
      {
        hour: 'numeric',
        minute: '2-digit',
      },
    );
  }

  // ==========================================================
  // OUTCOME DISPLAY
  // ==========================================================

  function formatOutcome(
    value: string,
  ) {
    if (!value) {
      return {
        outcome: 'No outcome recorded.',
        nextStep: '',
      };
    }

    const separator =
      ' | Next Step: ';

    if (
      value.includes(separator)
    ) {
      const parts =
        value.split(separator);

      return {
        outcome: parts[0],
        nextStep:
          parts.slice(1).join(separator),
      };
    }

    return {
      outcome: value,
      nextStep: '',
    };
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <DashboardShell>
      <PageHeader
        title="Discovery Calls"
        description="Manage booked strategy sessions, client consultations, and discovery outcomes"
      >
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Book Call
        </Button>
      </PageHeader>

      {/* ======================================================
          KPI
      ====================================================== */}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total Calls"
          value={String(calls.length)}
          icon={PhoneCall}
          index={0}
        />

        <KpiCard
          label="Upcoming"
          value={String(upcoming.length)}
          icon={Calendar}
          accent="text-blue-600 bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400"
          index={1}
        />

        <KpiCard
          label="Completed"
          value={String(completed.length)}
          icon={CheckCircle}
          accent="text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400"
          index={2}
        />

        <KpiCard
          label="Paid Sessions"
          value={String(paidCount)}
          icon={DollarSign}
          accent="text-violet-600 bg-violet-100 dark:bg-violet-500/15 dark:text-violet-400"
          index={3}
        />
      </div>

      {/* ======================================================
          CALL TYPES
      ====================================================== */}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {(
          Object.keys(
            callTypeMeta,
          ) as CallType[]
        ).map((type) => {
          const meta =
            callTypeMeta[type];

          const Icon =
            meta.icon;

          const count =
            calls.filter(
              (call) =>
                call.type === type,
            ).length;

          return (
            <Card key={type}>
              <CardContent className="p-5">
                <div
                  className={cn(
                    'mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white',
                    meta.color,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <p className="text-sm font-semibold">
                  {type}
                </p>

                <div className="mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {meta.duration}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {count} booked
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ======================================================
          TABS
      ====================================================== */}

      <Tabs
        defaultValue="upcoming"
        className="mt-6"
      >
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcoming.length})
          </TabsTrigger>

          <TabsTrigger value="completed">
            Completed ({completed.length})
          </TabsTrigger>
        </TabsList>

        {/* ====================================================
            UPCOMING
        ==================================================== */}

        <TabsContent
          value="upcoming"
          className="mt-4"
        >
          {loading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-5">
                    <div className="h-5 w-40 animate-pulse rounded bg-muted" />

                    <div className="mt-4 h-4 w-56 animate-pulse rounded bg-muted" />

                    <div className="mt-4 h-20 animate-pulse rounded-lg bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />

                <h3 className="mt-4 text-lg font-semibold">
                  No upcoming bookings
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  New booking requests from your website will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {upcoming.map(
                (call, index) => {
                  const meta =
                    callTypeMeta[
                      call.type as CallType
                    ] ??
                    callTypeMeta[
                      'Social Growth Sprint'
                    ];

                  return (
                    <motion.div
                      key={call.id}
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          index * 0.05,
                      }}
                    >
                      <Card>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white',
                                  meta.color,
                                )}
                              >
                                <PhoneCall className="h-4 w-4" />
                              </div>

                              <div>
                                <p className="text-sm font-semibold">
                                  {call.clientName}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {call.type} ·{' '}
                                  {call.duration} min
                                </p>
                              </div>
                            </div>

                            <StatusBadge
                              status={
                                call.paymentStatus
                              }
                            />
                          </div>

                          {/* DATE */}

                          <div className="mt-4 flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />

                            <span className="font-medium">
                              {formatDate(
                                call.date,
                              )}
                            </span>

                            <span className="text-muted-foreground">
                              at{' '}
                              {formatTime(
                                call.date,
                              )}
                            </span>
                          </div>

                          {/* NOTES */}

                          <div className="mt-3 rounded-lg bg-muted/50 p-3">
                            <p className="text-xs font-medium text-muted-foreground">
                              Notes
                            </p>

                            <p className="mt-1 text-sm">
                              {call.notes ||
                                'No notes provided.'}
                            </p>
                          </div>

                          {/* ACTIONS */}

                          <div className="mt-4 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() =>
                                openNotes(
                                  call,
                                )
                              }
                            >
                              <FileText className="mr-1.5 h-3.5 w-3.5" />

                              Add Notes
                            </Button>

                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() =>
                                openCompleteCall(
                                  call,
                                )
                              }
                            >
                              <CheckCircle className="mr-1.5 h-3.5 w-3.5" />

                              Complete Call
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDelete(
                                  call.id,
                                )
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                },
              )}
            </div>
          )}
        </TabsContent>

        {/* ====================================================
            COMPLETED
        ==================================================== */}

        <TabsContent
          value="completed"
          className="mt-4"
        >
          {completed.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <CheckCircle className="mx-auto h-10 w-10 text-muted-foreground" />

                <h3 className="mt-4 text-lg font-semibold">
                  No completed calls
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Completed discovery calls will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {completed.map(
                (call, index) => {
                  const result =
                    formatOutcome(
                      call.outcome ||
                        '',
                    );

                  return (
                    <motion.div
                      key={call.id}
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          index * 0.05,
                      }}
                    >
                      <Card>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold">
                                {call.clientName}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {call.type} ·{' '}
                                {formatDate(
                                  call.date,
                                )}
                              </p>
                            </div>

                            <StatusBadge
                              status={
                                call.status
                              }
                            />
                          </div>

                          {/* OUTCOME */}

                          <div className="mt-3 rounded-lg bg-emerald-500/5 p-3">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />

                              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                Outcome
                              </p>
                            </div>

                            <p className="mt-1 text-sm font-medium">
                              {result.outcome}
                            </p>
                          </div>

                          {/* NEXT STEP */}

                          {result.nextStep && (
                            <div className="mt-3 rounded-lg bg-blue-500/5 p-3">
                              <div className="flex items-center gap-2">
                                <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />

                                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                  Next Step
                                </p>
                              </div>

                              <p className="mt-1 text-sm">
                                {result.nextStep}
                              </p>
                            </div>
                          )}

                          {/* NOTES */}

                          {call.notes && (
                            <div className="mt-3 rounded-lg bg-muted/50 p-3">
                              <p className="text-xs font-medium text-muted-foreground">
                                Notes
                              </p>

                              <p className="mt-1 text-sm">
                                {call.notes}
                              </p>
                            </div>
                          )}

                          {/* ACTIONS */}

                          <div className="mt-4 flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDelete(
                                  call.id,
                                )
                              }
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" />

                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                },
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ======================================================
          ADMIN BOOKING DIALOG
      ====================================================== */}

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Book Discovery Call
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* CLIENT */}

            <div className="space-y-2">
              <Label htmlFor="clientName">
                Client Name
              </Label>

              <Input
                id="clientName"
                value={
                  form.clientName
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    clientName:
                      e.target.value,
                  })
                }
                placeholder="e.g. Patricia Lim"
                required
              />
            </div>

            {/* TYPE + DURATION */}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Call Type
                </Label>

                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm({
                      ...form,
                      type:
                        value as CallType,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {callTypes.map(
                      (type) => (
                        <SelectItem
                          key={type}
                          value={type}
                        >
                          {type}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">
                  Duration (min)
                </Label>

                <Input
                  id="duration"
                  type="number"
                  value={
                    form.duration
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      duration:
                        e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            {/* DATE */}

            <div className="space-y-2">
              <Label htmlFor="date">
                Date & Time
              </Label>

              <Input
                id="date"
                type="datetime-local"
                value={form.date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    date:
                      e.target.value,
                  })
                }
              />
            </div>

            {/* STATUS + PAYMENT */}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Status
                </Label>

                <Select
                  value={
                    form.status
                  }
                  onValueChange={(
                    value,
                  ) =>
                    setForm({
                      ...form,
                      status:
                        value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Scheduled">
                      Scheduled
                    </SelectItem>

                    <SelectItem value="Completed">
                      Completed
                    </SelectItem>

                    <SelectItem value="Cancelled">
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Payment Status
                </Label>

                <Select
                  value={
                    form.paymentStatus
                  }
                  onValueChange={(
                    value,
                  ) =>
                    setForm({
                      ...form,
                      paymentStatus:
                        value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Paid">
                      Paid
                    </SelectItem>

                    <SelectItem value="Free">
                      Free
                    </SelectItem>

                    <SelectItem value="Pending">
                      Pending
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* NOTES */}

            <div className="space-y-2">
              <Label htmlFor="notes">
                Notes
              </Label>

              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    notes:
                      e.target.value,
                  })
                }
                placeholder="Call context and goals..."
                rows={3}
              />
            </div>

            {/* OUTCOME */}

            <div className="space-y-2">
              <Label>
                Initial Outcome
              </Label>

              <Select
                value={
                  form.outcome || ''
                }
                onValueChange={(
                  value,
                ) =>
                  setForm({
                    ...form,
                    outcome:
                      value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome (optional)" />
                </SelectTrigger>

                <SelectContent>
                  {outcomeOptions.map(
                    (option) => (
                      <SelectItem
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {option.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>

              <p className="text-xs text-muted-foreground">
                You can also record the final outcome after the call using "Complete Call".
              </p>
            </div>

            {/* FOOTER */}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setOpen(false)
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  submitting
                }
              >
                {submitting
                  ? 'Booking...'
                  : 'Book Call'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================
          NOTES DIALOG
      ====================================================== */}

      <Dialog
        open={notesOpen}
        onOpenChange={
          setNotesOpen
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Call Notes —{' '}
              {
                editingCall?.clientName
              }
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={
              handleSaveNotes
            }
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="meeting-notes">
                Meeting notes
              </Label>

              <Textarea
                id="meeting-notes"
                rows={6}
                placeholder="Key discussion points, action items, client needs..."
                value={notesText}
                onChange={(e) =>
                  setNotesText(
                    e.target.value,
                  )
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setNotesOpen(
                    false,
                  )
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  savingNotes
                }
              >
                {savingNotes
                  ? 'Saving...'
                  : 'Save Notes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================
          COMPLETE CALL DIALOG
      ====================================================== */}

      <Dialog
        open={completeOpen}
        onOpenChange={
          setCompleteOpen
        }
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Complete Discovery Call
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={
              handleCompleteCall
            }
            className="space-y-5"
          >
            {/* CLIENT */}

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold">
                {
                  editingCall?.clientName
                }
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {editingCall?.type}
                {' · '}
                {editingCall?.duration}
                {' min'}
              </p>
            </div>

            {/* OUTCOME */}

            <div className="space-y-2">
              <Label>
                Call Outcome
              </Label>

              <Select
                value={outcome}
                onValueChange={
                  setOutcome
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="What happened after the call?" />
                </SelectTrigger>

                <SelectContent>
                  {outcomeOptions.map(
                    (option) => (
                      <SelectItem
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        <div>
                          <p>
                            {
                              option.label
                            }
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {
                              option.description
                            }
                          </p>
                        </div>
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* NEXT STEP */}

            <div className="space-y-2">
              <Label htmlFor="next-step">
                Next Step / Follow-up
              </Label>

              <Textarea
                id="next-step"
                rows={3}
                value={
                  nextStep
                }
                onChange={(e) =>
                  setNextStep(
                    e.target.value,
                  )
                }
                placeholder="e.g. Send proposal and follow up with client after 3 days."
              />

              <p className="text-xs text-muted-foreground">
                This will be saved together with the outcome.
              </p>
            </div>

            {/* SUMMARY */}

            {outcome && (
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-600" />

                  <p className="text-sm font-medium">
                    Outcome Preview
                  </p>
                </div>

                <p className="mt-2 text-sm">
                  {outcome}
                </p>

                {nextStep.trim() && (
                  <div className="mt-2 flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 text-blue-600" />

                    <p className="text-sm text-muted-foreground">
                      {nextStep}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* FOOTER */}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setCompleteOpen(
                    false,
                  )
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  savingOutcome ||
                  !outcome
                }
              >
                {savingOutcome
                  ? 'Saving...'
                  : 'Complete Call'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}