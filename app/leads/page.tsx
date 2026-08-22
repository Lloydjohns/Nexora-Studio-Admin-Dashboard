'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Mail,
  TrendingUp,
  UserSearch,
  Target,
  Filter,
  ArrowRight,
  Trash2,
  RefreshCw,
} from 'lucide-react'

import {
  DashboardShell,
  PageHeader,
} from '@/components/dashboard-shell'

import {
  KpiCard,
  StatusBadge,
} from '@/components/shared'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Discovery Scheduled'
  | 'Proposal Sent'
  | 'Won'
  | 'Lost'

interface ContactSubmission {
  first_name: string
  last_name: string
  email: string
  brand: string | null
  service: string
  budget: string
  message: string
  status: string
  created_at: string
}

interface Lead {
  id: string
  name: string
  email: string
  business: string
  budgetRange: string
  interestedService: string
  message: string
  source: string
  status: LeadStatus
  date: string
  createdAt: string
}

const stages: LeadStatus[] = [
  'New',
  'Contacted',
  'Discovery Scheduled',
  'Proposal Sent',
  'Won',
  'Lost',
]

const statusToDatabase: Record<LeadStatus, string> = {
  New: 'new',
  Contacted: 'contacted',
  'Discovery Scheduled': 'discovery scheduled',
  'Proposal Sent': 'proposal sent',
  Won: 'won',
  Lost: 'lost',
}

function databaseStatusToLeadStatus(status: string): LeadStatus {
  switch (status.toLowerCase()) {
    case 'contacted':
      return 'Contacted'

    case 'discovery scheduled':
      return 'Discovery Scheduled'

    case 'proposal sent':
      return 'Proposal Sent'

    case 'won':
      return 'Won'

    case 'lost':
      return 'Lost'

    case 'new':
    default:
      return 'New'
  }
}

function formatDate(date: string) {
  if (!date) return '—'

  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function mapSubmissionToLead(
  submission: ContactSubmission
): Lead {
  const fullName =
    `${submission.first_name} ${submission.last_name}`.trim()

  return {
    id: submission.id,
    name: fullName || 'Unnamed Lead',
    email: submission.email,
    business: submission.brand || 'No business provided',
    budgetRange: submission.budget || 'Not specified',
    interestedService:
      submission.service || 'Not specified',
    message: submission.message || '',
    source: 'Website',
    status: databaseStatusToLeadStatus(
      submission.status
    ),
    date: formatDate(submission.created_at),
    createdAt: submission.created_at,
  }
}

export default function LeadsPage() {
  const [leads, setLeads] = React.useState<Lead[]>([])
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)

  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] =
    React.useState('all')

  const [open, setOpen] = React.useState(false)
  const [selectedLead, setSelectedLead] =
    React.useState<Lead | null>(null)

  const [submitting, setSubmitting] =
    React.useState(false)

  // ============================================
  // FETCH CONTACT SUBMISSIONS
  // ============================================

  async function fetchContactSubmissions(
    showRefresh = false
  ) {
    try {
      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const {
        data,
        error,
      } = await supabase
        .from('contact_submissions')
        .select(
          `
            id,
            first_name,
            last_name,
            email,
            brand,
            service,
            budget,
            message,
            status,
            created_at
          `
        )
        .order('created_at', {
          ascending: false,
        })

      if (error) {
        console.error(
          'Failed to fetch contact submissions:',
          error
        )

        toast.error(
          'Failed to load contact submissions',
          {
            description: error.message,
          }
        )

        setLeads([])
        return
      }

      const mappedLeads =
        (data as ContactSubmission[]).map(
          mapSubmissionToLead
        )

      setLeads(mappedLeads)
    } catch (error: any) {
      console.error(error)

      toast.error(
        'Something went wrong loading leads',
        {
          description: error?.message,
        }
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  React.useEffect(() => {
    fetchContactSubmissions()
  }, [])

  // ============================================
  // REFRESH
  // ============================================

  function handleRefresh() {
    fetchContactSubmissions(true)
  }

  // ============================================
  // FILTER
  // ============================================

  const filtered = leads.filter((lead) => {
    const query = search.toLowerCase()

    const matchesSearch =
      lead.name.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.business.toLowerCase().includes(query) ||
      lead.interestedService
        .toLowerCase()
        .includes(query) ||
      lead.message.toLowerCase().includes(query)

    const matchesStatus =
      statusFilter === 'all' ||
      lead.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // ============================================
  // KPI
  // ============================================

  const won = leads.filter(
    (lead) => lead.status === 'Won'
  ).length

  const total = leads.length

  const conversionRate =
    total > 0
      ? ((won / total) * 100).toFixed(1)
      : '0'

  const proposals = leads.filter(
    (lead) => lead.status === 'Proposal Sent'
  ).length

  const newLeads = leads.filter(
    (lead) => lead.status === 'New'
  ).length

  // ============================================
  // OPEN LEAD
  // ============================================

  function openLead(lead: Lead) {
    setSelectedLead(lead)
    setOpen(true)
  }

  // ============================================
  // UPDATE STATUS
  // ============================================

  async function updateStatus(
    lead: Lead,
    newStatus: LeadStatus
  ) {
    try {
      setSubmitting(true)

      const databaseStatus =
        statusToDatabase[newStatus]

      const { error } = await supabase
        .from('contact_submissions')
        .update({
          status: databaseStatus,
        })
        .eq('id', lead.id)

      if (error) {
        throw error
      }

      toast.success('Lead status updated')

      setLeads((current) =>
        current.map((item) =>
          item.id === lead.id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      )

      setSelectedLead((current) =>
        current
          ? {
              ...current,
              status: newStatus,
            }
          : null
      )
    } catch (error: any) {
      console.error(error)

      toast.error(
        'Failed to update lead',
        {
          description: error.message,
        }
      )
    } finally {
      setSubmitting(false)
    }
  }

  // ============================================
  // DELETE LEAD
  // ============================================

  async function handleDelete(
    lead: Lead
  ) {
    const confirmed = window.confirm(
      `Delete ${lead.name}'s inquiry? This cannot be undone.`
    )

    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', lead.id)

      if (error) {
        throw error
      }

      toast.success('Lead deleted')

      setLeads((current) =>
        current.filter(
          (item) => item.id !== lead.id
        )
      )

      setOpen(false)
      setSelectedLead(null)
    } catch (error: any) {
      console.error(error)

      toast.error(
        'Failed to delete lead',
        {
          description: error.message,
        }
      )
    }
  }

  // ============================================
  // CONVERT TO CLIENT
  // ============================================

  async function convertToClient(
    lead: Lead
  ) {
    try {
      setSubmitting(true)

      const { error } = await supabase
        .from('clients')
        .insert({
          name: lead.name,
          company: lead.business ===
            'No business provided'
            ? ''
            : lead.business,
          email: lead.email,
          phone: '',
          service_package:
            lead.interestedService,
          status: 'Onboarding',
          monthly_retainer: 0,
          account_manager: '',
          industry: '',
          start_date:
            new Date()
              .toISOString()
              .split('T')[0],
        })

      if (error) {
        throw error
      }

      await updateStatus(
        lead,
        'Won'
      )

      toast.success(
        `${lead.name} converted to client`
      )

      setOpen(false)
    } catch (error: any) {
      console.error(error)

      toast.error(
        'Failed to convert lead',
        {
          description: error.message,
        }
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Leads & Inquiries"
        description="Track contact form submissions and manage your sales pipeline"
      >
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            className={cn(
              'mr-1.5 h-4 w-4',
              refreshing &&
                'animate-spin'
            )}
          />

          {refreshing
            ? 'Refreshing...'
            : 'Refresh'}
        </Button>
      </PageHeader>

      {/* ============================================
          KPI CARDS
      ============================================ */}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total Leads"
          value={String(total)}
          delta={undefined}
          icon={UserSearch}
          index={0}
        />

        <KpiCard
          label="New Inquiries"
          value={String(newLeads)}
          delta={undefined}
          trend="up"
          icon={Mail}
          accent="text-blue-600 bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400"
          index={1}
        />

        <KpiCard
          label="Won Leads"
          value={String(won)}
          delta={undefined}
          trend="up"
          icon={Target}
          accent="text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400"
          index={2}
        />

        <KpiCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          delta={undefined}
          trend="up"
          icon={TrendingUp}
          accent="text-violet-600 bg-violet-100 dark:bg-violet-500/15 dark:text-violet-400"
          index={3}
        />
      </div>

      {/* ============================================
          TABS
      ============================================ */}

      <Tabs
        defaultValue="pipeline"
        className="mt-6"
      >
        <div className="flex items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="pipeline">
              Pipeline Board
            </TabsTrigger>

            <TabsTrigger value="list">
              All Leads
            </TabsTrigger>
          </TabsList>

          <div className="text-xs text-muted-foreground">
            {leads.length}{' '}
            submission
            {leads.length === 1
              ? ''
              : 's'}
          </div>
        </div>

        {/* ============================================
            PIPELINE
        ============================================ */}

        <TabsContent
          value="pipeline"
          className="mt-4"
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => {
              const stageLeads =
                leads.filter(
                  (lead) =>
                    lead.status === stage
                )

              return (
                <div
                  key={stage}
                  className="w-72 shrink-0"
                >
                  <div
                    className={cn(
                      'rounded-t-lg border-t-2 bg-muted/30'
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
                        {stageLeads.length}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 p-2">
                    {loading ? (
                      <div className="rounded-lg border border-dashed py-8 text-center text-xs text-muted-foreground">
                        Loading...
                      </div>
                    ) : stageLeads.length ===
                      0 ? (
                      <div className="rounded-lg border border-dashed py-8 text-center text-xs text-muted-foreground">
                        No leads
                      </div>
                    ) : (
                      stageLeads.map(
                        (lead, index) => (
                          <motion.div
                            key={lead.id}
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
                                index * 0.05,
                            }}
                          >
                            <Card
                              className="cursor-pointer transition-shadow hover:shadow-md"
                              onClick={() =>
                                openLead(
                                  lead
                                )
                              }
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold">
                                      {lead.name}
                                    </p>

                                    <p className="truncate text-xs text-muted-foreground">
                                      {lead.business}
                                    </p>
                                  </div>

                                  <Trash2
                                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground hover:text-rose-500"
                                    onClick={(
                                      e
                                    ) => {
                                      e.stopPropagation()
                                      handleDelete(
                                        lead
                                      )
                                    }}
                                  />
                                </div>

                                <div className="mt-2 flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="text-[10px]"
                                  >
                                    Website
                                  </Badge>

                                  <span className="text-[10px] text-muted-foreground">
                                    {lead.budgetRange}
                                  </span>
                                </div>

                                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                                  {lead.message}
                                </p>

                                {stage !==
                                  'Won' &&
                                  stage !==
                                    'Lost' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="mt-2 h-7 w-full text-xs"
                                      onClick={(
                                        e
                                      ) => {
                                        e.stopPropagation()

                                        convertToClient(
                                          lead
                                        )
                                      }}
                                    >
                                      Convert to Client

                                      <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                  )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        {/* ============================================
            LIST
        ============================================ */}

        <TabsContent
          value="list"
          className="mt-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search leads, email, business..."
                className="pl-9"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />
            </div>

            <Select
              value={statusFilter}
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
                      key={stage}
                      value={stage}
                    >
                      {stage}
                    </SelectItem>
                  )
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
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  Array.from({
                    length: 5,
                  }).map((_, index) => (
                    <TableRow
                      key={index}
                    >
                      {Array.from({
                        length: 7,
                      }).map(
                        (
                          __,
                          cellIndex
                        ) => (
                          <TableCell
                            key={
                              cellIndex
                            }
                          >
                            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  ))
                ) : (
                  filtered.map(
                    (lead) => (
                      <TableRow
                        key={lead.id}
                        className="cursor-pointer"
                        onClick={() =>
                          openLead(
                            lead
                          )
                        }
                      >
                        <TableCell>
                          <p className="font-medium">
                            {lead.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {lead.email}
                          </p>
                        </TableCell>

                        <TableCell className="font-medium">
                          {lead.business}
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
                          {lead.date}
                        </TableCell>

                        <TableCell>
                          <StatusBadge
                            status={
                              lead.status
                            }
                          />
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
              </TableBody>
            </Table>

            {!loading &&
              filtered.length ===
                0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No contact submissions
                  match your search.
                </div>
              )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* ============================================
          LEAD DETAILS
      ============================================ */}

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Lead Details
            </DialogTitle>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-5">
              {/* NAME */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Name
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {selectedLead.name}
                </p>
              </div>

              {/* EMAIL */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Email
                </p>

                <a
                  href={`mailto:${selectedLead.email}`}
                  className="mt-1 block text-sm text-primary hover:underline"
                >
                  {selectedLead.email}
                </a>
              </div>

              {/* BUSINESS */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Business / Brand
                </p>

                <p className="mt-1 text-sm">
                  {selectedLead.business}
                </p>
              </div>

              {/* SERVICE + BUDGET */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Service
                  </p>

                  <p className="mt-1 text-sm">
                    {
                      selectedLead.interestedService
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Budget
                  </p>

                  <p className="mt-1 text-sm">
                    {
                      selectedLead.budgetRange
                    }
                  </p>
                </div>
              </div>

              {/* DATE */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Submitted
                </p>

                <p className="mt-1 text-sm">
                  {selectedLead.date}
                </p>
              </div>

              {/* MESSAGE */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Message
                </p>

                <div className="mt-2 rounded-lg border bg-muted/30 p-3 text-sm leading-relaxed">
                  {selectedLead.message ||
                    'No message provided.'}
                </div>
              </div>

              {/* STATUS */}
              <div className="space-y-2">
                <Label>
                  Lead Status
                </Label>

                <Select
                  value={
                    selectedLead.status
                  }
                  onValueChange={(
                    value
                  ) =>
                    updateStatus(
                      selectedLead,
                      value as LeadStatus
                    )
                  }
                  disabled={
                    submitting
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {stages.map(
                      (stage) => (
                        <SelectItem
                          key={stage}
                          value={stage}
                        >
                          {stage}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            {selectedLead && (
              <>
                {selectedLead.status !==
                  'Won' &&
                  selectedLead.status !==
                    'Lost' && (
                    <Button
                      type="button"
                      onClick={() =>
                        convertToClient(
                          selectedLead
                        )
                      }
                      disabled={
                        submitting
                      }
                    >
                      <ArrowRight className="mr-1.5 h-4 w-4" />
                      Convert to Client
                    </Button>
                  )}

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    handleDelete(
                      selectedLead
                    )
                  }
                  disabled={
                    submitting
                  }
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setOpen(false)
              }
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================
          LEAD SOURCE
      ============================================ */}

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">
            Lead Source
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">
              Website Contact Form
            </p>

            <p className="mt-1 text-2xl font-bold tabular-nums">
              {leads.length}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              submissions received
            </p>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}