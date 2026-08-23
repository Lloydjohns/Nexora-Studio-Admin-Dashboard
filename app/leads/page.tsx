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
  Trash2,
  Loader2,
} from 'lucide-react';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import {
  fetchLeads,
  insertLead,
  updateLead,
  deleteLead,
  insertClient,
} from '@/lib/api';

import type { LeadStatus } from '@/lib/data';

import { useFetch } from '@/hooks/use-fetch';

import { toast } from 'sonner';

import { cn } from '@/lib/utils';

// ============================================================
// LEAD STAGES
// ============================================================

const stages: LeadStatus[] = [
  'New',
  'Contacted',
  'Discovery Scheduled',
  'Proposal Sent',
  'Won',
  'Lost',
];

// ============================================================
// FORM OPTIONS
// ============================================================

const budgetOptions = [
  '₱15,000–₱30,000',
  '₱30,000–₱60,000',
  '₱60,000+',
];

interface LeadForm {
  name: string;
  email: string;
  business: string;
  budgetRange: string;
  interestedService: string;
  message: string;
  status: LeadStatus;
}

const emptyForm: LeadForm = {
  name: '',
  email: '',
  business: '',
  budgetRange: '₱15,000–₱30,000',
  interestedService: '',
  message: '',
  status: 'New',
};

// ============================================================
// PAGE
// ============================================================

export default function LeadsPage() {
  // ==========================================================
  // LEADS STATE
  // ==========================================================

  const [
    refreshKey,
    setRefreshKey,
  ] = React.useState(0);

  const {
    data: leads,
    loading,
  } = useFetch(
    fetchLeads,
    [refreshKey],
  );

  const allLeads = leads ?? [];

  const refetch = () => {
    setRefreshKey(
      (k) => k + 1,
    );
  };

  // ==========================================================
  // SEARCH / FILTER
  // ==========================================================

  const [
    search,
    setSearch,
  ] = React.useState('');

  const [
    statusFilter,
    setStatusFilter,
  ] = React.useState('all');

  // ==========================================================
  // ADD / EDIT LEAD DIALOG
  // ==========================================================

  const [
    open,
    setOpen,
  ] = React.useState(false);

  const [
    editId,
    setEditId,
  ] = React.useState<string | null>(
    null,
  );

  const [
    submitting,
    setSubmitting,
  ] = React.useState(false);

  const [
    form,
    setForm,
  ] = React.useState<LeadForm>(
    emptyForm,
  );

  // ==========================================================
  // EMAIL COMPOSER STATE
  // ==========================================================

  const [
    emailOpen,
    setEmailOpen,
  ] = React.useState(false);

  const [
    emailLead,
    setEmailLead,
  ] = React.useState<
    (typeof allLeads)[number] | null
  >(null);

  const [
    emailSubject,
    setEmailSubject,
  ] = React.useState('');

  const [
    emailMessage,
    setEmailMessage,
  ] = React.useState('');

  const [
    sendingEmail,
    setSendingEmail,
  ] = React.useState(false);

  // ==========================================================
  // FILTERING
  // ==========================================================

  const filtered =
    allLeads.filter((l) => {
      const query =
        search
          .toLowerCase()
          .trim();

      const matchesSearch =
        !query ||
        l.name
          .toLowerCase()
          .includes(query) ||
        l.business
          .toLowerCase()
          .includes(query) ||
        l.email
          .toLowerCase()
          .includes(query) ||
        l.interestedService
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        l.status ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  // ==========================================================
  // KPI DATA
  // ==========================================================

  const won =
    allLeads.filter(
      (l) =>
        l.status ===
        'Won',
    ).length;

  const total =
    allLeads.length;

  const conversionRate =
    total > 0
      ? (
          (won / total) *
          100
        ).toFixed(1)
      : '0';

  const proposals =
    allLeads.filter(
      (l) =>
        l.status ===
        'Proposal Sent',
    ).length;

  // ==========================================================
  // ADD LEAD
  // ==========================================================

  function openAdd() {
    setEditId(null);

    setForm({
      ...emptyForm,
    });

    setOpen(true);
  }

  // ==========================================================
  // EDIT LEAD
  // ==========================================================

  function openEdit(
    id: string,
  ) {
    const lead =
      allLeads.find(
        (x) =>
          x.id === id,
      );

    if (!lead) {
      return;
    }

    setEditId(id);

    setForm({
      name:
        lead.name,

      email:
        lead.email,

      business:
        lead.business,

      budgetRange:
        lead.budgetRange,

      interestedService:
        lead.interestedService,

      message:
        lead.message,

      status:
        lead.status,
    });

    setOpen(true);
  }

  // ==========================================================
  // OPEN EMAIL COMPOSER
  // ==========================================================

  function openEmailComposer(
    lead: (typeof allLeads)[number],
  ) {
    setEmailLead(lead);

    setEmailSubject(
      'Regarding your inquiry - ' +
        (lead.interestedService ||
          'Our Services'),
    );

    setEmailMessage(
      'Hi ' +
        lead.name +
        ',\n\n' +
        'Thank you for reaching out to us regarding ' +
        (lead.interestedService ||
          'our services') +
        '.\n\n' +
        'We would be happy to discuss your project and how we can help.\n\n' +
        'Best regards,\n' +
        'Dev|withMe',
    );

    setEmailOpen(true);
  }

  // ==========================================================
  // SEND EMAIL
  // ==========================================================

  async function handleSendEmail() {
    if (!emailLead) {
      toast.error(
        'No lead selected.',
      );
      return;
    }

    if (!emailLead.email?.trim()) {
      toast.error(
        'This lead does not have an email address.',
      );
      return;
    }

    if (!emailSubject.trim()) {
      toast.error(
        'Email subject is required.',
      );
      return;
    }

    if (!emailMessage.trim()) {
      toast.error(
        'Email message is required.',
      );
      return;
    }

    setSendingEmail(true);

    try {
      const response =
        await fetch(
          '/api/send-email',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              to: emailLead.email,
              subject:
                emailSubject,
              message:
                emailMessage,
            }),
          },
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            'Failed to send email.',
        );
      }

      toast.success(
        'Email sent successfully!',
        {
          description:
            'Email sent to ' +
            emailLead.email,
        },
      );

      setEmailOpen(false);

      setEmailLead(null);

      setEmailSubject('');

      setEmailMessage('');
    } catch (
      err: any
    ) {
      console.error(
        'Send email error:',
        err,
      );

      toast.error(
        'Failed to send email',
        {
          description:
            err?.message ||
            'Something went wrong while sending the email.',
        },
      );
    } finally {
      setSendingEmail(false);
    }
  }

  // ==========================================================
  // SUBMIT LEAD
  // ==========================================================

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error(
        'Name is required',
      );
      return;
    }

    if (!form.email.trim()) {
      toast.error(
        'Email is required',
      );
      return;
    }

    if (!form.business.trim()) {
      toast.error(
        'Business is required',
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name:
          form.name,

        email:
          form.email,

        business:
          form.business,

        budget_range:
          form.budgetRange,

        interested_service:
          form.interestedService,

        message:
          form.message,

        status:
          form.status,

        source:
          'Website',
      };

      if (editId) {
        await updateLead(
          editId,
          payload,
        );

        toast.success(
          'Lead updated successfully',
        );
      } else {
        await insertLead(
          payload,
        );

        toast.success(
          'Lead added successfully',
        );
      }

      setOpen(false);

      setEditId(null);

      setForm({
        ...emptyForm,
      });

      refetch();
    } catch (
      err: any
    ) {
      console.error(
        'Lead save error:',
        err,
      );

      toast.error(
        'Failed to save lead',
        {
          description:
            err?.message ??
            'Unknown error',
        },
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================================
  // DELETE LEAD
  // ==========================================================

  async function handleDelete(
    id: string,
  ) {
    try {
      await deleteLead(id);

      toast.success(
        'Lead deleted',
      );

      refetch();
    } catch (
      err: any
    ) {
      console.error(
        'Delete lead error:',
        err,
      );

      toast.error(
        'Failed to delete lead',
        {
          description:
            err?.message ??
            'Unknown error',
        },
      );
    }
  }

  // ==========================================================
  // CONVERT TO CLIENT
  // ==========================================================

  async function convertToClient(
    lead: (typeof allLeads)[number],
  ) {
    try {
      await insertClient({
        name:
          lead.name,

        company:
          lead.business,

        email:
          lead.email,

        phone:
          '',

        service_package:
          lead.interestedService ||
          'Social Starter',

        status:
          'Onboarding',

        monthly_retainer:
          0,

        account_manager:
          '',

        industry:
          '',

        start_date:
          new Date()
            .toISOString()
            .split('T')[0],
      });

      await updateLead(
        lead.id,
        {
          status:
            'Won',
        },
      );

      toast.success(
        lead.name +
          ' converted to client',
      );

      refetch();
    } catch (
      err: any
    ) {
      console.error(
        'Convert lead error:',
        err,
      );

      toast.error(
        'Failed to convert lead',
        {
          description:
            err?.message ??
            'Unknown error',
        },
      );
    }
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <DashboardShell>
      <PageHeader
        title="Leads & Inquiries"
        description="Track contact form submissions and manage your sales pipeline"
      >
        <Button
          size="sm"
          onClick={openAdd}
        >
          <Plus className="mr-1.5 h-4 w-4" />

          Add Lead
        </Button>
      </PageHeader>

      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total Leads"
          value={String(total)}
          delta="+6"
          trend="up"
          icon={UserSearch}
          index={0}
        />

        <KpiCard
          label="Won This Month"
          value={String(won)}
          delta="+2"
          trend="up"
          icon={Target}
          accent="text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400"
          index={1}
        />

        <KpiCard
          label="Conversion Rate"
          value={
            conversionRate +
            '%'
          }
          delta="+4.2%"
          trend="up"
          icon={TrendingUp}
          accent="text-violet-600 bg-violet-100 dark:bg-violet-500/15 dark:text-violet-400"
          index={2}
        />

        <KpiCard
          label="Proposals Out"
          value={String(proposals)}
          icon={Mail}
          accent="text-amber-600 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400"
          index={3}
        />
      </div>

      {/* ======================================================
          TABS
      ====================================================== */}

      <Tabs
        defaultValue="pipeline"
        className="mt-6"
      >
        <TabsList>
          <TabsTrigger value="pipeline">
            Pipeline Board
          </TabsTrigger>

          <TabsTrigger value="list">
            All Leads
          </TabsTrigger>
        </TabsList>

        {/* ====================================================
            PIPELINE
        ==================================================== */}

        <TabsContent
          value="pipeline"
          className="mt-4"
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map(
              (stage) => {
                const stageLeads =
                  allLeads.filter(
                    (l) =>
                      l.status ===
                      stage,
                  );

                return (
                  <div
                    key={stage}
                    className="w-72 shrink-0"
                  >
                    <div
                      className={cn(
                        'rounded-t-lg border-t-2 bg-muted/30',
                      )}
                    >
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <p className="text-sm font-semibold">
                          {stage}
                        </p>

                        <Badge
                          variant="secondary"
                          className="text-[10px]"
                        >
                          {
                            stageLeads.length
                          }
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 p-2">
                      {stageLeads.length ===
                      0 ? (
                        <div className="rounded-lg border border-dashed py-8 text-center text-xs text-muted-foreground">
                          No leads
                        </div>
                      ) : (
                        stageLeads.map(
                          (
                            lead,
                            i,
                          ) => (
                            <motion.div
                              key={
                                lead.id
                              }
                              initial={{
                                opacity: 0,
                                y: 8,
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                              }}
                              transition={{
                                delay:
                                  i *
                                  0.05,
                              }}
                            >
                              <Card
                                className="cursor-pointer transition-shadow hover:shadow-md"
                                onClick={() =>
                                  openEdit(
                                    lead.id,
                                  )
                                }
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-start justify-between">
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold">
                                        {
                                          lead.name
                                        }
                                      </p>

                                      <p className="truncate text-xs text-muted-foreground">
                                        {
                                          lead.business
                                        }
                                      </p>
                                    </div>

                                    <Trash2
                                      className="h-3.5 w-3.5 shrink-0 cursor-pointer text-muted-foreground hover:text-rose-500"
                                      onClick={(
                                        e,
                                      ) => {
                                        e.stopPropagation();

                                        handleDelete(
                                          lead.id,
                                        );
                                      }}
                                    />
                                  </div>

                                  <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-[10px]"
                                    >
                                      Website
                                    </Badge>

                                    <span className="text-[10px] text-muted-foreground">
                                      {
                                        lead.budgetRange
                                      }
                                    </span>
                                  </div>

                                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                                    {
                                      lead.message
                                    }
                                  </p>

                                  {/* COMPOSE EMAIL */}

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 h-7 w-full text-xs"
                                    onClick={(
                                      e,
                                    ) => {
                                      e.stopPropagation();

                                      openEmailComposer(
                                        lead,
                                      );
                                    }}
                                  >
                                    <Mail className="mr-1 h-3 w-3" />

                                    Compose Email
                                  </Button>

                                  {/* CONVERT TO CLIENT */}

                                  {stage !==
                                    'Won' &&
                                    stage !==
                                      'Lost' && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mt-1 h-7 w-full text-xs"
                                        onClick={(
                                          e,
                                        ) => {
                                          e.stopPropagation();

                                          convertToClient(
                                            lead,
                                          );
                                        }}
                                      >
                                        Convert to Client

                                        <ArrowRight className="ml-1 h-3 w-3" />
                                      </Button>
                                    )}
                                </CardContent>
                              </Card>
                            </motion.div>
                          ),
                        )
                      )}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </TabsContent>

        {/* ====================================================
            LIST
        ==================================================== */}

        <TabsContent
          value="list"
          className="mt-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search leads..."
                className="pl-9"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value,
                  )
                }
              />
            </div>

            <Select
              value={
                statusFilter
              }
              onValueChange={
                setStatusFilter
              }
            >
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />

                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All statuses
                </SelectItem>

                {stages.map(
                  (stage) => (
                    <SelectItem
                      key={
                        stage
                      }
                      value={
                        stage
                      }
                    >
                      {
                        stage
                      }
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <Card className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    Name
                  </TableHead>

                  <TableHead>
                    Business
                  </TableHead>

                  <TableHead>
                    Service
                  </TableHead>

                  <TableHead>
                    Budget
                  </TableHead>

                  <TableHead>
                    Source
                  </TableHead>

                  <TableHead>
                    Date
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>

                  <TableHead className="text-right">
                    Email
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  Array.from({
                    length: 4,
                  }).map(
                    (_, i) => (
                      <TableRow
                        key={i}
                      >
                        {Array.from(
                          {
                            length: 8,
                          },
                        ).map(
                          (
                            __,
                            j,
                          ) => (
                            <TableCell
                              key={
                                j
                              }
                            >
                              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                            </TableCell>
                          ),
                        )}
                      </TableRow>
                    ),
                  )
                ) : (
                  filtered.map(
                    (lead) => (
                      <TableRow
                        key={
                          lead.id
                        }
                        className="cursor-pointer"
                        onClick={() =>
                          openEdit(
                            lead.id,
                          )
                        }
                      >
                        <TableCell>
                          <p className="font-medium">
                            {
                              lead.name
                            }
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {
                              lead.email
                            }
                          </p>
                        </TableCell>

                        <TableCell className="font-medium">
                          {
                            lead.business
                          }
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {
                            lead.interestedService
                          }
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {
                            lead.budgetRange
                          }
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[10px]"
                          >
                            Website
                          </Badge>
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {lead.date
                            ? new Date(
                                lead.date,
                              ).toLocaleDateString(
                                'en-PH',
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                },
                              )
                            : '—'}
                        </TableCell>

                        <TableCell>
                          <StatusBadge
                            status={
                              lead.status
                            }
                          />
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={(
                              e,
                            ) => {
                              e.stopPropagation();

                              openEmailComposer(
                                lead,
                              );
                            }}
                          >
                            <Mail className="mr-1.5 h-4 w-4" />

                            Email
                          </Button>
                        </TableCell>
                      </TableRow>
                    ),
                  )
                )}
              </TableBody>
            </Table>

            {filtered.length ===
              0 &&
              !loading && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No leads match your search.
                </div>
              )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* ======================================================
          LEAD SOURCES
      ====================================================== */}

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">
            Lead Sources Breakdown
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">
                Website
              </p>

              <p className="text-2xl font-bold tabular-nums">
                {
                  allLeads.length
                }
              </p>
            </div>

            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">
                Instagram
              </p>

              <p className="text-2xl font-bold tabular-nums">
                0
              </p>
            </div>

            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">
                Facebook
              </p>

              <p className="text-2xl font-bold tabular-nums">
                0
              </p>
            </div>

            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">
                TikTok
              </p>

              <p className="text-2xl font-bold tabular-nums">
                0
              </p>
            </div>

            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">
                Referral
              </p>

              <p className="text-2xl font-bold tabular-nums">
                0
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ======================================================
          ADD / EDIT LEAD DIALOG
      ====================================================== */}

      <Dialog
        open={open}
        onOpenChange={
          setOpen
        }
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editId
                ? 'Edit Lead'
                : 'Add Lead'}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {/* NAME */}

              <div className="space-y-2">
                <Label htmlFor="name">
                  Name
                </Label>

                <Input
                  id="name"
                  value={
                    form.name
                  }
                  onChange={(
                    e,
                  ) =>
                    setForm({
                      ...form,
                      name:
                        e.target
                          .value,
                    })
                  }
                  required
                />
              </div>

              {/* EMAIL */}

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email
                </Label>

                <Input
                  id="email"
                  type="email"
                  value={
                    form.email
                  }
                  onChange={(
                    e,
                  ) =>
                    setForm({
                      ...form,
                      email:
                        e.target
                          .value,
                    })
                  }
                  required
                />
              </div>

              {/* BUSINESS */}

              <div className="space-y-2">
                <Label htmlFor="business">
                  Business
                </Label>

                <Input
                  id="business"
                  value={
                    form.business
                  }
                  onChange={(
                    e,
                  ) =>
                    setForm({
                      ...form,
                      business:
                        e.target
                          .value,
                    })
                  }
                  required
                />
              </div>

              {/* SERVICE */}

              <div className="space-y-2">
                <Label htmlFor="service">
                  Interested Service
                </Label>

                <Input
                  id="service"
                  value={
                    form.interestedService
                  }
                  onChange={(
                    e,
                  ) =>
                    setForm({
                      ...form,
                      interestedService:
                        e.target
                          .value,
                    })
                  }
                />
              </div>

              {/* BUDGET */}

              <div className="space-y-2">
                <Label>
                  Budget Range
                </Label>

                <Select
                  value={
                    form.budgetRange
                  }
                  onValueChange={(
                    value,
                  ) =>
                    setForm({
                      ...form,
                      budgetRange:
                        value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {budgetOptions.map(
                      (budget) => (
                        <SelectItem
                          key={
                            budget
                          }
                          value={
                            budget
                          }
                        >
                          {
                            budget
                          }
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* STATUS */}

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
                        value as LeadStatus,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {stages.map(
                      (stage) => (
                        <SelectItem
                          key={
                            stage
                          }
                          value={
                            stage
                          }
                        >
                          {
                            stage
                          }
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* MESSAGE */}

            <div className="space-y-2">
              <Label htmlFor="message">
                Message
              </Label>

              <Textarea
                id="message"
                value={
                  form.message
                }
                onChange={(
                  e,
                ) =>
                  setForm({
                    ...form,
                    message:
                      e.target
                        .value,
                  })
                }
                rows={3}
              />
            </div>

            {/* FOOTER */}

            <DialogFooter>
              {editId && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    handleDelete(
                      editId,
                    );

                    setOpen(
                      false,
                    );
                  }}
                  className="mr-auto"
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />

                  Delete
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setOpen(
                    false,
                  )
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
                  ? 'Saving...'
                  : editId
                    ? 'Update'
                    : 'Add Lead'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================
          EMAIL COMPOSER DIALOG
      ====================================================== */}

      <Dialog
        open={emailOpen}
        onOpenChange={(value) => {
          if (!sendingEmail) {
            setEmailOpen(value);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />

              Compose Email
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* RECIPIENT */}

            <div className="space-y-2">
              <Label htmlFor="email-recipient">
                To
              </Label>

              <Input
                id="email-recipient"
                value={
                  emailLead?.email ||
                  ''
                }
                disabled
              />
            </div>

            {/* LEAD INFORMATION */}

            {emailLead && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">
                  Sending to
                </p>

                <p className="text-sm font-semibold">
                  {
                    emailLead.name
                  }
                </p>

                {emailLead.business && (
                  <p className="text-xs text-muted-foreground">
                    {
                      emailLead.business
                    }
                  </p>
                )}
              </div>
            )}

            {/* SUBJECT */}

            <div className="space-y-2">
              <Label htmlFor="email-subject">
                Subject
              </Label>

              <Input
                id="email-subject"
                placeholder="Enter email subject..."
                value={
                  emailSubject
                }
                onChange={(e) =>
                  setEmailSubject(
                    e.target.value,
                  )
                }
              />
            </div>

            {/* MESSAGE */}

            <div className="space-y-2">
              <Label htmlFor="email-message">
                Message
              </Label>

              <Textarea
                id="email-message"
                placeholder="Write your email..."
                value={
                  emailMessage
                }
                onChange={(e) =>
                  setEmailMessage(
                    e.target.value,
                  )
                }
                rows={10}
              />
            </div>
          </div>

          {/* EMAIL FOOTER */}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={
                sendingEmail
              }
              onClick={() => {
                setEmailOpen(
                  false,
                );
              }}
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={
                sendingEmail
              }
              onClick={
                handleSendEmail
              }
            >
              {sendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />

                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}