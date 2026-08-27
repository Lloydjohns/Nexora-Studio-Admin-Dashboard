'use client'

import * as React from 'react'

import {
  Plus,
  PhoneCall,
  Clock,
  Calendar,
  CheckCircle,
  FileText,
  TrendingUp,
  DollarSign,
  Trash2,
  Target,
  ArrowRight,
  ExternalLink,
  Users,
  Mail,
  Send,
  Loader2,
  Eye,
  Sparkles,
  Building2,
  Globe,
  Phone,
  Wallet,
  Timer,
  User,
  Pencil,
  Save,
  Filter,
} from 'lucide-react'

import { motion } from 'framer-motion'

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
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

import { Label } from '@/components/ui/label'

import { Textarea } from '@/components/ui/textarea'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  fetchDiscoveryCalls,
  updateDiscoveryCall,
  deleteDiscoveryCall,
} from '@/lib/api'

import {
  type CallType,
  type DiscoveryCall,
} from '@/lib/data'

import { useFetch } from '@/hooks/use-fetch'

import { toast } from 'sonner'

import { cn } from '@/lib/utils'

import { supabase } from '@/lib/supabase'

// ============================================================
// CAL.COM EVENTS
// ============================================================

type CalEvent = {
  id: string
  name: string
  duration: string
  url: string
  price: number
  description: string
}

const calEvents: CalEvent[] = [
  {
    id: 'social-growth-sprint',
    name: 'Social Growth Sprint',
    duration: '30 min',
    url: 'https://cal.com/social-growth-sprint-30-min',
    price: 300,
    description:
      'Best for brands that want clearer content direction.',
  },

  {
    id: 'brand-clarity-session',
    name: 'Brand Clarity Session',
    duration: '45 min',
    url: 'https://cal.com/brand-clarity-session-45-min',
    price: 500,
    description:
      'A focused call for identity, messaging, and campaign angles.',
  },

  {
    id: 'website-roadmap-call',
    name: 'Website Roadmap Call',
    duration: '60 min',
    url: 'https://cal.com/website-roadmap-call-60-min',
    price: 800,
    description:
      'For businesses planning a new website or digital launch.',
  },
]

// ============================================================
// CALL TYPES
// ============================================================

const callTypeMeta: Record<
  CallType,
  {
    duration: string
    color: string
    icon: React.ComponentType<{ className?: string }>
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
    icon: PhoneCall,
  },
}

// ============================================================
// DISCOVERY OUTCOMES
// ============================================================

const outcomeOptions = [
  {
    value: 'Proposal Sent — Awaiting Decision',
    label: 'Proposal Sent — Awaiting Decision',
    description:
      'Client is interested and waiting to review the proposal.',
  },

  {
    value: 'Client Accepted — Project Won',
    label: 'Client Accepted — Project Won',
    description:
      'Client accepted the offer and is ready to proceed.',
  },

  {
    value: 'Follow-up Required',
    label: 'Follow-up Required',
    description:
      'Client needs another conversation before deciding.',
  },

  {
    value: 'Paid & Ready to Start',
    label: 'Paid & Ready to Start',
    description:
      'Payment is complete and the project can begin.',
  },

  {
    value: 'Not Interested',
    label: 'Not Interested',
    description:
      'Client decided not to proceed.',
  },

  {
    value: 'Not a Good Fit',
    label: 'Not a Good Fit',
    description:
      'The service is not suitable for the client.',
  },

  {
    value: 'Call Rescheduled',
    label: 'Call Rescheduled',
    description:
      'The discovery call needs to happen at another time.',
  },

  {
    value: 'No Show',
    label: 'No Show',
    description:
      'Client did not attend the scheduled call.',
  },
]

// ============================================================
// WEBSITE BOOKING TYPE
// ============================================================

type WebsiteBooking = {
  id: string

  name: string
  email: string

  phone?: string | null
  company?: string | null
  website?: string | null

  service_id?: string | null
  service_name?: string | null
  service_price?: number | null

  date?: string | null
  time?: string | null

  contact_method?: string | null

  budget?: string | null
  timeline?: string | null

  goals?: string[] | null
  notes?: string | null

  status?: string | null
  payment_status?: string | null

  created_at?: string | null
}

// ============================================================
// PAGE
// ============================================================

export default function DiscoveryCallsPage() {
  // ==========================================================
  // DISCOVERY CALLS
  // ==========================================================

  const [refreshKey, setRefreshKey] =
    React.useState(0)

  const {
    data: discoveryCalls,
    loading,
  } = useFetch(
    fetchDiscoveryCalls,
    [refreshKey],
  )

  const refetch = () =>
    setRefreshKey(
      (current) => current + 1,
    )

  // ==========================================================
  // WEBSITE BOOKING REQUESTS
  // ==========================================================

  const [bookingRequests, setBookingRequests] =
    React.useState<WebsiteBooking[]>([])

  const [bookingRequestsLoading, setBookingRequestsLoading] =
    React.useState(true)

  const [bookingRequestsError, setBookingRequestsError] =
    React.useState('')

  const [bookingFilter, setBookingFilter] =
    React.useState<
      'pending' | 'all' | 'upcoming' | 'completed' | 'paid'
    >('pending')

  const [bookingEditOpen, setBookingEditOpen] =
    React.useState(false)

  const [editingBooking, setEditingBooking] =
    React.useState<WebsiteBooking | null>(null)

  const [savingBooking, setSavingBooking] =
    React.useState(false)

  const emptyBookingForm = {
    name: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    service_name: 'Social Growth Sprint',
    service_price: '300',
    date: '',
    time: '',
    contact_method: 'Video call',
    budget: '',
    timeline: '',
    goals: '',
    notes: '',
    status: 'pending',
    payment_status: 'Unpaid',
  }

  const [bookingForm, setBookingForm] =
    React.useState(emptyBookingForm)

  // ==========================================================
  // SELECTED CLIENT
  // ==========================================================

  const [selectedClient, setSelectedClient] =
    React.useState<WebsiteBooking | null>(null)

  const [clientDetailsOpen, setClientDetailsOpen] =
    React.useState(false)

  const [proceedOpen, setProceedOpen] =
    React.useState(false)

  // ==========================================================
  // SELECTED CAL EVENT
  // ==========================================================

  const [selectedCalEvent, setSelectedCalEvent] =
    React.useState<CalEvent>(
      calEvents[0],
    )

  const [sendingBookingEmail, setSendingBookingEmail] =
    React.useState(false)

  const [emailSubject, setEmailSubject] =
    React.useState('')

  const [emailMessage, setEmailMessage] =
    React.useState('')

  // ==========================================================
  // NOTES DIALOG
  // ==========================================================

  const [notesOpen, setNotesOpen] =
    React.useState(false)

  // ==========================================================
  // COMPLETE CALL DIALOG
  // ==========================================================

  const [completeOpen, setCompleteOpen] =
    React.useState(false)

  const [editingCall, setEditingCall] =
    React.useState<DiscoveryCall | null>(
      null,
    )

  const [notesText, setNotesText] =
    React.useState('')

  const [outcome, setOutcome] =
    React.useState('')

  const [nextStep, setNextStep] =
    React.useState('')

  const [savingNotes, setSavingNotes] =
    React.useState(false)

  const [savingOutcome, setSavingOutcome] =
    React.useState(false)

  // ==========================================================
  // FETCH WEBSITE BOOKING REQUESTS
  // ==========================================================

  async function fetchBookingRequests() {
    setBookingRequestsLoading(true)
    setBookingRequestsError('')

    try {
      const {
        data,
        error,
      } = await supabase
        .from('discovery_bookings')
        .select('*')
        .order('created_at', {
          ascending: false,
        })

      if (error) {
        console.error(
          'FETCH BOOKING REQUESTS ERROR:',
          error,
        )

        setBookingRequestsError(
          error.message ||
            'Unable to load booking requests.',
        )

        setBookingRequests([])

        return
      }

      setBookingRequests(
        (data || []) as WebsiteBooking[],
      )
    } catch (err: any) {
      console.error(
        'UNEXPECTED BOOKING REQUEST ERROR:',
        err,
      )

      setBookingRequestsError(
        err?.message ||
          'Unable to load booking requests.',
      )
    } finally {
      setBookingRequestsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchBookingRequests()
  }, [])

  // ==========================================================
  // ALL CALL DATA
  // ==========================================================

  const calls =
    discoveryCalls ?? []

  const upcoming =
    calls.filter(
      (call) =>
        call.status === 'Scheduled',
    )

  const completed =
    calls.filter(
      (call) =>
        call.status === 'Completed',
    )

  const paidCount =
    calls.filter(
      (call) =>
        call.paymentStatus === 'Paid',
    ).length

  // ==========================================================
  // BOOKING STATUS HELPERS
  // ==========================================================

  const normalizeBookingStatus = (
    status?: string | null,
  ) =>
    (status || 'pending')
      .toLowerCase()
      .replace(/\s+/g, '_')

  const isCompletedBooking = (
    booking: WebsiteBooking,
  ) => {
    const status =
      normalizeBookingStatus(
        booking.status,
      )

    return (
      status === 'completed' ||
      status === 'paid' ||
      status === 'paid_ready'
    )
  }

  const isPaidBooking = (
    booking: WebsiteBooking,
  ) => {
    const paymentStatus =
      normalizeBookingStatus(
        booking.payment_status,
      )

    const status =
      normalizeBookingStatus(
        booking.status,
      )

    return (
      isCompletedBooking(booking) &&
      (
        paymentStatus === 'paid' ||
        status === 'paid' ||
        status === 'paid_ready'
      )
    )
  }

  // ==========================================================
  // WEBSITE BOOKING PIPELINE
  // ==========================================================

  const pendingBookingRequests =
    bookingRequests.filter(
      (booking) => {
        const status =
          normalizeBookingStatus(
            booking.status,
          )

        return (
          status === 'pending' ||
          status === 'booking_requested'
        )
      },
    )

  const upcomingBookingRequests =
    bookingRequests.filter(
      (booking) => {
        const status =
          normalizeBookingStatus(
            booking.status,
          )

        return (
          status === 'scheduled' ||
          status === 'upcoming' ||
          status === 'booking_confirmed'
        )
      },
    )

  const completedBookingRequests =
    bookingRequests.filter(
      (booking) =>
        isCompletedBooking(booking),
    )

  const paidBookingRequests =
    bookingRequests.filter(
      (booking) =>
        isPaidBooking(booking),
    )

  const totalPaidAmount =
    paidBookingRequests.reduce(
      (total, booking) =>
        total +
        Number(
          booking.service_price || 0,
        ),
      0,
    )

  const filteredBookingRequests =
    bookingRequests.filter(
      (booking) => {
        const status =
          normalizeBookingStatus(
            booking.status,
          )

        if (
          bookingFilter === 'all'
        ) {
          return ![
            'cancelled',
            'canceled',
            'rejected',
          ].includes(status)
        }

        if (
          bookingFilter === 'pending'
        ) {
          return (
            status === 'pending' ||
            status === 'booking_requested'
          )
        }

        if (
          bookingFilter === 'upcoming'
        ) {
          return (
            status === 'scheduled' ||
            status === 'upcoming' ||
            status === 'booking_confirmed'
          )
        }

        if (
          bookingFilter === 'completed'
        ) {
          return isCompletedBooking(
            booking,
          )
        }

        if (
          bookingFilter === 'paid'
        ) {
          return isPaidBooking(
            booking,
          )
        }

        return true
      },
    )

  const bookingPipelineCounts = {
    requests:
      pendingBookingRequests.length,

    total:
      bookingRequests.filter(
        (booking) => {
          const status =
            normalizeBookingStatus(
              booking.status,
            )

          return ![
            'cancelled',
            'canceled',
            'rejected',
          ].includes(status)
        },
      ).length,

    upcoming:
      upcomingBookingRequests.length,

    completed:
      completedBookingRequests.length,

    paid:
      paidBookingRequests.length,
  }

  // ==========================================================
  // BOOKING STATUS UPDATE
  // ==========================================================

  async function updateBookingPipelineStatus(
    booking: WebsiteBooking,
    newStatus: string,
  ) {
    try {
      let paymentStatus =
        booking.payment_status ||
        'Unpaid'

      /*
       * Paid Session means:
       *
       * 1. The booking is completed.
       * 2. Payment is Paid.
       *
       * Selecting Completed does NOT automatically
       * mark the client as paid.
       */

      if (
        newStatus === 'paid'
      ) {
        paymentStatus = 'Paid'
      }

      const { error } =
        await supabase
          .from('discovery_bookings')
          .update({
            status: newStatus,
            payment_status:
              paymentStatus,
          })
          .eq(
            'id',
            booking.id,
          )

      if (error) {
        throw error
      }

      toast.success(
        'Booking stage updated.',
        {
          description:
            getBookingStatusLabel(
              newStatus,
            ),
        },
      )

      await fetchBookingRequests()
    } catch (err: any) {
      console.error(
        'UPDATE BOOKING STATUS ERROR:',
        err,
      )

      toast.error(
        'Failed to update booking status',
        {
          description:
            err?.message ||
            'Unable to update the booking stage.',
        },
      )
    }
  }

  // ==========================================================
  // BOOKING STATUS LABEL
  // ==========================================================

  function getBookingStatusLabel(
    status?: string | null,
  ) {
    const normalized =
      normalizeBookingStatus(
        status,
      )

    const labels: Record<
      string,
      string
    > = {
      pending: 'Booking Request',
      booking_requested:
        'Booking Request',
      booking_sent:
        'Booking Email Sent',
      scheduled: 'Upcoming',
      upcoming: 'Upcoming',
      booking_confirmed:
        'Upcoming',
      completed: 'Completed',
      paid: 'Paid Session',
      paid_ready:
        'Paid Session',
      cancelled: 'Cancelled',
      canceled: 'Cancelled',
      rejected: 'Rejected',
    }

    return (
      labels[normalized] ||
      (status || 'Pending')
        .replace(/_/g, ' ')
    )
  }

  // ==========================================================
  // WEBSITE BOOKING CRUD
  // ==========================================================

  function openAddBooking() {
    setEditingBooking(null)

    setBookingForm({
      ...emptyBookingForm,
    })

    setBookingEditOpen(true)
  }

  function openEditBooking(
    booking: WebsiteBooking,
  ) {
    setEditingBooking(booking)

    setBookingForm({
      name: booking.name || '',
      email: booking.email || '',
      phone: booking.phone || '',
      company: booking.company || '',
      website: booking.website || '',
      service_name:
        booking.service_name ||
        'Social Growth Sprint',
      service_price: String(
        booking.service_price ??
          300,
      ),
      date: booking.date || '',
      time: booking.time || '',
      contact_method:
        booking.contact_method ||
        'Video call',
      budget: booking.budget || '',
      timeline:
        booking.timeline || '',
      goals:
        Array.isArray(
          booking.goals,
        )
          ? booking.goals.join(', ')
          : '',
      notes:
        booking.notes || '',
      status:
        booking.status ||
        'pending',
      payment_status:
        booking.payment_status ||
        'Unpaid',
    })

    setBookingEditOpen(true)
  }

  async function handleSaveBooking(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault()

    if (
      !bookingForm.name.trim() ||
      !bookingForm.email.trim()
    ) {
      toast.error(
        'Name and email are required.',
      )

      return
    }

    setSavingBooking(true)

    try {
      const payload = {
        name:
          bookingForm.name.trim(),

        email:
          bookingForm.email.trim(),

        phone:
          bookingForm.phone.trim() ||
          null,

        company:
          bookingForm.company.trim() ||
          null,

        website:
          bookingForm.website.trim() ||
          null,

        service_name:
          bookingForm.service_name,

        service_price:
          Number(
            bookingForm.service_price,
          ) || 0,

        date:
          bookingForm.date ||
          null,

        time:
          bookingForm.time ||
          null,

        contact_method:
          bookingForm.contact_method ||
          null,

        budget:
          bookingForm.budget ||
          null,

        timeline:
          bookingForm.timeline ||
          null,

        goals:
          bookingForm.goals
            .split(',')
            .map(
              (item) =>
                item.trim(),
            )
            .filter(Boolean),

        notes:
          bookingForm.notes.trim() ||
          null,

        status:
          bookingForm.status,

        payment_status:
          bookingForm.payment_status,
      }

      const { error } =
        editingBooking
          ? await supabase
              .from(
                'discovery_bookings',
              )
              .update(payload)
              .eq(
                'id',
                editingBooking.id,
              )
          : await supabase
              .from(
                'discovery_bookings',
              )
              .insert(payload)

      if (error) {
        throw error
      }

      toast.success(
        editingBooking
          ? 'Booking request updated successfully.'
          : 'Booking request added successfully.',
      )

      setBookingEditOpen(false)

      setEditingBooking(null)

      setBookingForm({
        ...emptyBookingForm,
      })

      await fetchBookingRequests()
    } catch (err: any) {
      console.error(
        'SAVE BOOKING REQUEST ERROR:',
        err,
      )

      toast.error(
        'Failed to save booking request',
        {
          description:
            err?.message ||
            'Unable to save the booking request.',
        },
      )
    } finally {
      setSavingBooking(false)
    }
  }

  async function handleDeleteBookingRequest(
    id: string,
  ) {
    if (
      !window.confirm(
        'Delete this booking request? This cannot be undone.',
      )
    ) {
      return
    }

    try {
      const { error } =
        await supabase
          .from(
            'discovery_bookings',
          )
          .delete()
          .eq(
            'id',
            id,
          )

      if (error) {
        throw error
      }

      toast.success(
        'Booking request deleted.',
      )

      await fetchBookingRequests()
    } catch (err: any) {
      console.error(
        'DELETE BOOKING REQUEST ERROR:',
        err,
      )

      toast.error(
        'Failed to delete booking request',
        {
          description:
            err?.message ||
            'Unable to delete the booking request.',
        },
      )
    }
  }

  // ==========================================================
  // CLIENT DETAILS
  // ==========================================================

  function openClientDetails(
    booking: WebsiteBooking,
  ) {
    setSelectedClient(booking)
    setClientDetailsOpen(true)
  }

  // ==========================================================
  // PROCEED FOR BOOKING
  // ==========================================================

  function openProceedToBooking(
    booking: WebsiteBooking,
  ) {
    setSelectedClient(booking)

    const matchingEvent =
      calEvents.find(
        (event) =>
          event.name ===
          booking.service_name,
      )

    const event =
      matchingEvent ||
      calEvents[0]

    setSelectedCalEvent(event)

    setEmailSubject(
      'Your Discovery Call Is Ready to Book — Nexora Studio',
    )

    setEmailMessage(
      `Hi ${booking.name},

Thank you for reaching out to Nexora Studio.

We've reviewed your discovery call request and we're happy to invite you to schedule your ${event.name}.

Session: ${event.name}
Duration: ${event.duration}

Please choose the date and time that works best for you using the booking link below.

BOOK YOUR DISCOVERY CALL
${event.url}

Once you've selected your schedule, Cal.com will automatically send your calendar confirmation.

We look forward to speaking with you!

Best regards,
Nexora Studio`,
    )

    setProceedOpen(true)
  }

  // ==========================================================
  // SEND BOOKING EMAIL
  // ==========================================================

  async function handleSendBookingEmail() {
    if (!selectedClient) {
      toast.error(
        'Please select a client first.',
      )

      return
    }

    if (!selectedCalEvent) {
      toast.error(
        'Please select a Cal.com event.',
      )

      return
    }

    setSendingBookingEmail(true)

    try {
      const response =
        await fetch(
          '/api/email/send-booking',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              client: {
                id:
                  selectedClient.id,

                name:
                  selectedClient.name,

                email:
                  selectedClient.email,

                phone:
                  selectedClient.phone,

                company:
                  selectedClient.company,

                website:
                  selectedClient.website,
              },

              booking: {
                serviceName:
                  selectedClient.service_name ||
                  selectedCalEvent.name,

                servicePrice:
                  selectedClient.service_price ||
                  selectedCalEvent.price,

                requestedDate:
                  selectedClient.date,

                requestedTime:
                  selectedClient.time,

                contactMethod:
                  selectedClient.contact_method,

                budget:
                  selectedClient.budget,

                timeline:
                  selectedClient.timeline,

                goals:
                  selectedClient.goals,

                notes:
                  selectedClient.notes,
              },

              email: {
                subject:
                  emailSubject,

                message:
                  emailMessage,
              },

              calEvent: {
                id:
                  selectedCalEvent.id,

                name:
                  selectedCalEvent.name,

                duration:
                  selectedCalEvent.duration,

                url:
                  selectedCalEvent.url,

                price:
                  selectedCalEvent.price,
              },
            }),
          },
        )

      const result =
        await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error ||
            'Unable to send booking email.',
        )
      }

      const {
        error: updateError,
      } = await supabase
        .from(
          'discovery_bookings',
        )
        .update({
          status:
            'booking_sent',
        })
        .eq(
          'id',
          selectedClient.id,
        )

      if (updateError) {
        console.error(
          'BOOKING STATUS UPDATE ERROR:',
          updateError,
        )
      }

      toast.success(
        'Booking email sent successfully!',
        {
          description:
            `${selectedClient.name} can now choose their Cal.com schedule.`,
        },
      )

      setProceedOpen(false)

      setSelectedClient(null)

      await fetchBookingRequests()
    } catch (err: any) {
      console.error(
        'SEND BOOKING EMAIL ERROR:',
        err,
      )

      toast.error(
        'Failed to send booking email',
        {
          description:
            err?.message ||
            'Please check your email API configuration.',
        },
      )
    } finally {
      setSendingBookingEmail(false)
    }
  }

  // ==========================================================
  // NOTES
  // ==========================================================

  function openNotes(
    call: DiscoveryCall,
  ) {
    setEditingCall(call)

    setNotesText(
      call.notes || '',
    )

    setNotesOpen(true)
  }

  async function handleSaveNotes(
    e: React.FormEvent,
  ) {
    e.preventDefault()

    if (!editingCall) {
      return
    }

    setSavingNotes(true)

    try {
      await updateDiscoveryCall(
        editingCall.id,
        {
          notes: notesText,
        },
      )

      toast.success(
        'Notes saved.',
      )

      setNotesOpen(false)

      setEditingCall(null)

      refetch()
    } catch (err: any) {
      console.error(
        'SAVE NOTES ERROR:',
        err,
      )

      toast.error(
        'Failed to save notes',
        {
          description:
            err?.message ||
            'Unable to save notes.',
        },
      )
    } finally {
      setSavingNotes(false)
    }
  }

  // ==========================================================
  // COMPLETE CALL
  // ==========================================================

  function openCompleteCall(
    call: DiscoveryCall,
  ) {
    setEditingCall(call)

    setOutcome(
      call.outcome || '',
    )

    setNextStep('')

    setCompleteOpen(true)
  }

  async function handleCompleteCall(
    e: React.FormEvent,
  ) {
    e.preventDefault()

    if (!editingCall) {
      return
    }

    if (!outcome) {
      toast.error(
        'Please select an outcome.',
      )

      return
    }

    setSavingOutcome(true)

    try {
      const finalOutcome =
        nextStep.trim()
          ? `${outcome} | Next Step: ${nextStep.trim()}`
          : outcome

      await updateDiscoveryCall(
        editingCall.id,
        {
          status: 'Completed',
          outcome: finalOutcome,
        },
      )

      toast.success(
        'Discovery call completed.',
        {
          description:
            `${editingCall.clientName}'s call has been updated.`,
        },
      )

      setCompleteOpen(false)

      setEditingCall(null)

      setOutcome('')

      setNextStep('')

      refetch()
    } catch (err: any) {
      console.error(
        'COMPLETE CALL ERROR:',
        err,
      )

      toast.error(
        'Failed to complete call',
        {
          description:
            err?.message ||
            'Unable to save call outcome.',
        },
      )
    } finally {
      setSavingOutcome(false)
    }
  }

  // ==========================================================
  // DELETE DISCOVERY CALL
  // ==========================================================

  async function handleDelete(
    id: string,
  ) {
    if (
      !window.confirm(
        'Delete this discovery call? This cannot be undone.',
      )
    ) {
      return
    }

    try {
      await deleteDiscoveryCall(id)

      toast.success(
        'Booking deleted.',
      )

      refetch()
    } catch (err: any) {
      console.error(
        'DELETE BOOKING ERROR:',
        err,
      )

      toast.error(
        'Failed to delete booking',
        {
          description:
            err?.message ||
            'Unable to delete booking.',
        },
      )
    }
  }

  // ==========================================================
  // DATE FORMAT
  // ==========================================================

  function formatDate(
    value?: string | null,
  ) {
    if (!value) {
      return 'Not selected'
    }

    const date =
      new Date(value)

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return value
    }

    return date.toLocaleDateString(
      'en-PH',
      {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      },
    )
  }

  function formatTime(
    value?: string | null,
  ) {
    if (!value) {
      return ''
    }

    /*
     * Website booking time may already be
     * a normal time string such as 10:00 AM.
     *
     * Do not try to convert it through Date
     * unless it actually looks like a date.
     */

    if (
      value.includes(':') &&
      !value.includes('T') &&
      !value.includes('-')
    ) {
      return value
    }

    const date =
      new Date(value)

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return value
    }

    return date.toLocaleTimeString(
      'en-PH',
      {
        hour: 'numeric',
        minute: '2-digit',
      },
    )
  }

  // ==========================================================
  // OUTCOME DISPLAY
  // ==========================================================

  function formatOutcome(
    value: string,
  ) {
    if (!value) {
      return {
        outcome:
          'No outcome recorded.',
        nextStep: '',
      }
    }

    const separator =
      ' | Next Step: '

    if (
      value.includes(
        separator,
      )
    ) {
      const parts =
        value.split(
          separator,
        )

      return {
        outcome:
          parts[0],

        nextStep:
          parts
            .slice(1)
            .join(separator),
      }
    }

    return {
      outcome: value,
      nextStep: '',
    }
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <DashboardShell>
      <PageHeader
        title="Discovery Calls"
        description="Manage website booking requests from the initial request through scheduling, completion, and payment."
      >
        <Button
          size="sm"
          onClick={
            openAddBooking
          }
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Booking
        </Button>
      </PageHeader>

      {/* ======================================================
          WEBSITE BOOKING PIPELINE KPI
      ====================================================== */}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          {
            key: 'pending' as const,
            label: 'Booking Requests',
            value:
              bookingPipelineCounts.requests,
            icon: Users,
            accent:
              'text-orange-600 bg-orange-100 dark:bg-orange-500/15 dark:text-orange-400',
          },

          {
            key: 'all' as const,
            label: 'Total Calls',
            value:
              bookingPipelineCounts.total,
            icon: PhoneCall,
            accent:
              undefined,
          },

          {
            key: 'upcoming' as const,
            label: 'Upcoming',
            value:
              bookingPipelineCounts.upcoming,
            icon: Calendar,
            accent:
              'text-blue-600 bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400',
          },

          {
            key: 'completed' as const,
            label: 'Completed',
            value:
              bookingPipelineCounts.completed,
            icon: CheckCircle,
            accent:
              'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400',
          },

          {
            key: 'paid' as const,
            label: 'Paid Sessions',
            value:
              bookingPipelineCounts.paid,
            icon: DollarSign,
            accent:
              'text-violet-600 bg-violet-100 dark:bg-violet-500/15 dark:text-violet-400',
          },
        ].map(
          (
            item,
            index,
          ) => {
            const Icon =
              item.icon

            return (
              <button
                key={
                  item.key
                }
                type="button"
                className={cn(
                  'rounded-2xl text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary/30',
                  bookingFilter ===
                    item.key &&
                    'ring-2 ring-primary/40',
                )}
                onClick={() =>
                  setBookingFilter(
                    item.key,
                  )
                }
              >
                <KpiCard
                  label={
                    item.label
                  }
                  value={String(
                    item.value,
                  )}
                  icon={Icon}
                  accent={
                    item.accent
                  }
                  index={
                    index
                  }
                />
              </button>
            )
          },
        )}
      </div>

      {/* ======================================================
          PAID SESSION SUMMARY
      ====================================================== */}

      {bookingFilter ===
        'paid' && (
        <Card className="mt-4 overflow-hidden border-violet-500/20">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">
                  Paid Sessions Summary
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Completed sessions that have been marked as paid.
                </p>
              </div>

              <div className="rounded-2xl bg-violet-500/10 px-5 py-3 text-right">
                <p className="text-xs font-medium text-violet-600 dark:text-violet-400">
                  Total Amount Collected
                </p>

                <p className="mt-1 text-2xl font-bold text-violet-700 dark:text-violet-300">
                  ₱
                  {totalPaidAmount.toLocaleString(
                    'en-PH',
                    {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    },
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ======================================================
          WEBSITE BOOKING REQUESTS
      ====================================================== */}

      <Card className="mt-6 overflow-hidden">
        <CardContent className="p-0">
          <div className="border-b border-border p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 text-white">
                  <Users className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-semibold">
                    Website Booking Requests
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Manage every website booking from request through scheduled, completed, and paid.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
                  {
                    pendingBookingRequests.length
                  }{' '}
                  waiting for review
                </div>

                <Button
                  size="sm"
                  onClick={
                    openAddBooking
                  }
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Booking
                </Button>
              </div>
            </div>
          </div>

          {/* ====================================================
              FILTERS
          ==================================================== */}

          <div className="border-b border-border px-5 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />

              <span className="text-xs font-medium text-muted-foreground">
                Filter:
              </span>

              {(
                [
                  [
                    'pending',
                    'Booking Requests',
                  ],
                  [
                    'all',
                    'All Booked',
                  ],
                  [
                    'upcoming',
                    'Upcoming',
                  ],
                  [
                    'completed',
                    'Completed',
                  ],
                  [
                    'paid',
                    'Paid Sessions',
                  ],
                ] as const
              ).map(
                ([
                  value,
                  label,
                ]) => (
                  <Button
                    key={
                      value
                    }
                    size="sm"
                    variant={
                      bookingFilter ===
                      value
                        ? 'default'
                        : 'outline'
                    }
                    className="h-8"
                    onClick={() =>
                      setBookingFilter(
                        value,
                      )
                    }
                  >
                    {label}
                  </Button>
                ),
              )}
            </div>
          </div>

          {/* ====================================================
              REQUEST CONTENT
          ==================================================== */}

          <div className="p-5">
            {bookingRequestsLoading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {Array.from(
                  {
                    length: 2,
                  },
                ).map(
                  (
                    _,
                    index,
                  ) => (
                    <div
                      key={
                        index
                      }
                      className="animate-pulse rounded-2xl border border-border p-5"
                    >
                      <div className="h-5 w-40 rounded bg-muted" />

                      <div className="mt-3 h-4 w-64 rounded bg-muted" />

                      <div className="mt-5 h-20 rounded-lg bg-muted" />
                    </div>
                  ),
                )}
              </div>
            ) : bookingRequestsError ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center">
                <p className="font-semibold text-destructive">
                  Unable to load booking requests
                </p>

                <p className="mt-2 text-sm text-destructive/80">
                  {
                    bookingRequestsError
                  }
                </p>

                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={
                    fetchBookingRequests
                  }
                >
                  Try Again
                </Button>
              </div>
            ) : filteredBookingRequests.length ===
              0 ? (
              <div className="py-12 text-center">
                <Users className="mx-auto h-10 w-10 text-muted-foreground" />

                <h3 className="mt-4 text-lg font-semibold">
                  No booking records in this stage
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
                  Use the filter above or add a booking request to begin the pipeline.
                </p>

                <Button
                  className="mt-5"
                  onClick={
                    openAddBooking
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Booking
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredBookingRequests.map(
                  (
                    booking,
                    index,
                  ) => {
                    const status =
                      normalizeBookingStatus(
                        booking.status,
                      )

                    const displayStatus =
                      getBookingStatusLabel(
                        booking.status,
                      )

                    const paid =
                      isPaidBooking(
                        booking,
                      )

                    const completed =
                      isCompletedBooking(
                        booking,
                      )

                    return (
                      <motion.div
                        key={
                          booking.id
                        }
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
                            index *
                            0.05,
                        }}
                      >
                        <Card className="h-full border-border">
                          <CardContent className="p-5">
                            {/* HEADER */}

                            <div className="flex items-start justify-between gap-4">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                  <Users className="h-5 w-5" />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold">
                                    {
                                      booking.name
                                    }
                                  </p>

                                  <p className="truncate text-xs text-muted-foreground">
                                    {
                                      booking.email
                                    }
                                  </p>
                                </div>
                              </div>

                              <div className="flex shrink-0 flex-col items-end gap-1">
                                <span
                                  className={cn(
                                    'rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
                                    completed &&
                                      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                                    !completed &&
                                      status ===
                                        'pending' &&
                                      'bg-orange-500/10 text-orange-600 dark:text-orange-400',
                                    !completed &&
                                      status !==
                                        'pending' &&
                                      'bg-muted',
                                  )}
                                >
                                  {
                                    displayStatus
                                  }
                                </span>

                                {paid && (
                                  <span className="text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                                    PAID
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* BOOKING INFORMATION */}

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                              <InfoItem
                                icon={
                                  Sparkles
                                }
                                label="Service"
                                value={
                                  booking.service_name ||
                                  'Not specified'
                                }
                              />

                              <InfoItem
                                icon={
                                  DollarSign
                                }
                                label="Session Fee"
                                value={
                                  booking.service_price
                                    ? `₱${Number(
                                        booking.service_price,
                                      ).toLocaleString(
                                        'en-PH',
                                      )}`
                                    : 'Not specified'
                                }
                              />

                              <InfoItem
                                icon={
                                  Calendar
                                }
                                label="Preferred Date"
                                value={formatDate(
                                  booking.date,
                                )}
                              />

                              <InfoItem
                                icon={
                                  Clock
                                }
                                label="Preferred Time"
                                value={
                                  booking.time ||
                                  'Not specified'
                                }
                              />
                            </div>

                            {/* PAYMENT INFO */}

                            {completed && (
                              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl bg-emerald-500/5 p-3">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />

                                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                      Session Status
                                    </p>
                                  </div>

                                  <p className="mt-1 text-sm font-semibold">
                                    Completed
                                  </p>
                                </div>

                                <div className="rounded-xl bg-violet-500/5 p-3">
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-violet-600 dark:text-violet-400" />

                                    <p className="text-xs font-medium text-violet-600 dark:text-violet-400">
                                      Payment
                                    </p>
                                  </div>

                                  <p className="mt-1 text-sm font-semibold">
                                    {
                                      paid
                                        ? 'Paid'
                                        : 'Unpaid'
                                    }
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* PIPELINE */}

                            <div className="mt-4 rounded-xl bg-muted/40 p-3">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Pipeline Stage
                                  </p>

                                  <p className="mt-1 text-sm font-semibold capitalize">
                                    {
                                      displayStatus
                                    }
                                  </p>
                                </div>

                                <Select
                                  value={
                                    status ===
                                      'paid_ready'
                                      ? 'paid'
                                      : status
                                  }
                                  onValueChange={(
                                    value,
                                  ) =>
                                    updateBookingPipelineStatus(
                                      booking,
                                      value,
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Update stage" />
                                  </SelectTrigger>

                                  <SelectContent>
                                    <SelectItem value="pending">
                                      Booking Request
                                    </SelectItem>

                                    <SelectItem value="booking_sent">
                                      Booking Email Sent
                                    </SelectItem>

                                    <SelectItem value="scheduled">
                                      Upcoming
                                    </SelectItem>

                                    <SelectItem value="completed">
                                      Completed
                                    </SelectItem>

                                    <SelectItem value="paid">
                                      Paid Session
                                    </SelectItem>

                                    <SelectItem value="cancelled">
                                      Cancelled
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* COMPANY */}

                            {booking.company && (
                              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                <Building2 className="h-4 w-4" />

                                <span>
                                  {
                                    booking.company
                                  }
                                </span>
                              </div>
                            )}

                            {/* NOTES */}

                            {booking.notes && (
                              <div className="mt-4 rounded-xl bg-muted/50 p-3">
                                <p className="text-xs font-medium text-muted-foreground">
                                  Client Notes
                                </p>

                                <p className="mt-1 line-clamp-3 text-sm">
                                  {
                                    booking.notes
                                  }
                                </p>
                              </div>
                            )}

                            {/* ACTION BUTTONS */}

                            <div className="mt-5 flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  openClientDetails(
                                    booking,
                                  )
                                }
                              >
                                <Eye className="mr-1.5 h-3.5 w-3.5" />
                                View Details
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  openEditBooking(
                                    booking,
                                  )
                                }
                              >
                                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                Edit
                              </Button>

                              {!completed && (
                                <Button
                                  size="sm"
                                  className="flex-1"
                                  onClick={() =>
                                    openProceedToBooking(
                                      booking,
                                    )
                                  }
                                >
                                  <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                  Proceed for Booking
                                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                </Button>
                              )}

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDeleteBookingRequest(
                                    booking.id,
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
                    )
                  },
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ======================================================
          EXISTING DISCOVERY CALLS
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
              {Array.from(
                {
                  length: 4,
                },
              ).map(
                (
                  _,
                  index,
                ) => (
                  <Card
                    key={
                      index
                    }
                  >
                    <CardContent className="p-5">
                      <div className="h-5 w-40 animate-pulse rounded bg-muted" />

                      <div className="mt-4 h-4 w-56 animate-pulse rounded bg-muted" />

                      <div className="mt-4 h-20 animate-pulse rounded-lg bg-muted" />
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          ) : upcoming.length ===
            0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />

                <h3 className="mt-4 text-lg font-semibold">
                  No upcoming bookings
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Confirmed discovery calls will appear here once connected to your database.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {upcoming.map(
                (
                  call,
                  index,
                ) => {
                  const meta =
                    callTypeMeta[
                      call.type as CallType
                    ] ??
                    callTypeMeta[
                      'Social Growth Sprint'
                    ]

                  return (
                    <motion.div
                      key={
                        call.id
                      }
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
                          index *
                          0.05,
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
                                  {
                                    call.clientName
                                  }
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {
                                    call.type
                                  }{' '}
                                  ·{' '}
                                  {
                                    call.duration
                                  }{' '}
                                  min
                                </p>
                              </div>
                            </div>

                            <StatusBadge
                              status={
                                call.paymentStatus
                              }
                            />
                          </div>

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

                          <div className="mt-3 rounded-lg bg-muted/50 p-3">
                            <p className="text-xs font-medium text-muted-foreground">
                              Notes
                            </p>

                            <p className="mt-1 text-sm">
                              {call.notes ||
                                'No notes provided.'}
                            </p>
                          </div>

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
                  )
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
          {completed.length ===
          0 ? (
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
                (
                  call,
                  index,
                ) => {
                  const result =
                    formatOutcome(
                      call.outcome ||
                        '',
                    )

                  return (
                    <motion.div
                      key={
                        call.id
                      }
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
                          index *
                          0.05,
                      }}
                    >
                      <Card>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold">
                                {
                                  call.clientName
                                }
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {
                                  call.type
                                }{' '}
                                ·{' '}
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

                          <div className="mt-3 rounded-lg bg-emerald-500/5 p-3">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />

                              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                Outcome
                              </p>
                            </div>

                            <p className="mt-1 text-sm font-medium">
                              {
                                result.outcome
                              }
                            </p>
                          </div>

                          {result.nextStep && (
                            <div className="mt-3 rounded-lg bg-blue-500/5 p-3">
                              <div className="flex items-center gap-2">
                                <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />

                                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                  Next Step
                                </p>
                              </div>

                              <p className="mt-1 text-sm">
                                {
                                  result.nextStep
                                }
                              </p>
                            </div>
                          )}

                          {call.notes && (
                            <div className="mt-3 rounded-lg bg-muted/50 p-3">
                              <p className="text-xs font-medium text-muted-foreground">
                                Notes
                              </p>

                              <p className="mt-1 text-sm">
                                {
                                  call.notes
                                }
                              </p>
                            </div>
                          )}

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
                  )
                },
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ======================================================
          ADD / EDIT WEBSITE BOOKING DIALOG
      ====================================================== */}

      <Dialog
        open={
          bookingEditOpen
        }
        onOpenChange={
          setBookingEditOpen
        }
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingBooking
                ? 'Edit Booking Request'
                : 'Add Booking Request'}
            </DialogTitle>

            <p className="text-sm text-muted-foreground">
              Update the client details and move the request through the booking pipeline.
            </p>
          </DialogHeader>

          <form
            onSubmit={
              handleSaveBooking
            }
            className="space-y-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                [
                  'name',
                  'Name',
                  'text',
                ],
                [
                  'email',
                  'Email',
                  'email',
                ],
                [
                  'phone',
                  'Phone',
                  'text',
                ],
                [
                  'company',
                  'Company',
                  'text',
                ],
                [
                  'website',
                  'Website',
                  'text',
                ],
                [
                  'service_price',
                  'Session Fee',
                  'number',
                ],
                [
                  'date',
                  'Date',
                  'date',
                ],
                [
                  'time',
                  'Time',
                  'text',
                ],
                [
                  'contact_method',
                  'Contact Method',
                  'text',
                ],
                [
                  'budget',
                  'Budget',
                  'text',
                ],
                [
                  'timeline',
                  'Timeline',
                  'text',
                ],
              ].map(
                ([
                  field,
                  label,
                  type,
                ]) => (
                  <div
                    key={
                      field
                    }
                    className="space-y-2"
                  >
                    <Label
                      htmlFor={`booking-${field}`}
                    >
                      {
                        label
                      }
                    </Label>

                    <Input
                      id={`booking-${field}`}
                      type={
                        type
                      }
                      value={
                        bookingForm[
                          field as keyof typeof bookingForm
                        ]
                      }
                      onChange={(
                        e,
                      ) =>
                        setBookingForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            [field]:
                              e
                                .target
                                .value,
                          }),
                        )
                      }
                    />
                  </div>
                ),
              )}

              {/* SERVICE */}

              <div className="space-y-2">
                <Label>
                  Service
                </Label>

                <Select
                  value={
                    bookingForm.service_name
                  }
                  onValueChange={(
                    value,
                  ) => {
                    const event =
                      calEvents.find(
                        (
                          item,
                        ) =>
                          item.name ===
                          value,
                      )

                    setBookingForm(
                      (
                        current,
                      ) => ({
                        ...current,

                        service_name:
                          value,

                        service_price:
                          String(
                            event?.price ??
                              current.service_price,
                          ),
                      }),
                    )
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {calEvents.map(
                      (
                        event,
                      ) => (
                        <SelectItem
                          key={
                            event.id
                          }
                          value={
                            event.name
                          }
                        >
                          {
                            event.name
                          }
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* BOOKING STATUS */}

              <div className="space-y-2">
                <Label>
                  Booking Status
                </Label>

                <Select
                  value={
                    bookingForm.status
                  }
                  onValueChange={(
                    value,
                  ) =>
                    setBookingForm(
                      (
                        current,
                      ) => ({
                        ...current,

                        status:
                          value,

                        payment_status:
                          value ===
                          'paid'
                            ? 'Paid'
                            : current.payment_status,
                      }),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="pending">
                      Booking Request
                    </SelectItem>

                    <SelectItem value="booking_sent">
                      Booking Email Sent
                    </SelectItem>

                    <SelectItem value="scheduled">
                      Upcoming
                    </SelectItem>

                    <SelectItem value="completed">
                      Completed
                    </SelectItem>

                    <SelectItem value="paid">
                      Paid Session
                    </SelectItem>

                    <SelectItem value="cancelled">
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* PAYMENT STATUS */}

              <div className="space-y-2">
                <Label>
                  Payment Status
                </Label>

                <Select
                  value={
                    bookingForm.payment_status
                  }
                  onValueChange={(
                    value,
                  ) =>
                    setBookingForm(
                      (
                        current,
                      ) => ({
                        ...current,

                        payment_status:
                          value,

                        status:
                          value ===
                          'Paid'
                            ? 'paid'
                            : current.status,
                      }),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Unpaid">
                      Unpaid
                    </SelectItem>

                    <SelectItem value="Paid">
                      Paid
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* GOALS */}

            <div className="space-y-2">
              <Label htmlFor="booking-goals">
                Goals{' '}
                <span className="text-muted-foreground">
                  (comma separated)
                </span>
              </Label>

              <Input
                id="booking-goals"
                value={
                  bookingForm.goals
                }
                onChange={(
                  e,
                ) =>
                  setBookingForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      goals:
                        e.target
                          .value,
                    }),
                  )
                }
                placeholder="Increase brand awareness, Improve lead generation"
              />
            </div>

            {/* NOTES */}

            <div className="space-y-2">
              <Label htmlFor="booking-notes">
                Notes
              </Label>

              <Textarea
                id="booking-notes"
                rows={4}
                value={
                  bookingForm.notes
                }
                onChange={(
                  e,
                ) =>
                  setBookingForm(
                    (
                      current,
                    ) => ({
                      ...current,
                      notes:
                        e.target
                          .value,
                    }),
                  )
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setBookingEditOpen(
                    false,
                  )
                }
                disabled={
                  savingBooking
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  savingBooking
                }
              >
                {savingBooking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />

                    {editingBooking
                      ? 'Update Booking'
                      : 'Add Booking'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================
          CLIENT DETAILS
      ====================================================== */}

      <Dialog
        open={
          clientDetailsOpen
        }
        onOpenChange={
          setClientDetailsOpen
        }
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Client Booking Request
            </DialogTitle>

            <p className="text-sm text-muted-foreground">
              Review the complete information submitted from your business website.
            </p>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-muted/50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Users className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {
                        selectedClient.name
                      }
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {
                        selectedClient.email
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={
                    Mail
                  }
                  label="Email"
                  value={
                    selectedClient.email
                  }
                />

                <InfoItem
                  icon={
                    Phone
                  }
                  label="Phone"
                  value={
                    selectedClient.phone ||
                    'Not provided'
                  }
                />

                <InfoItem
                  icon={
                    Building2
                  }
                  label="Company"
                  value={
                    selectedClient.company ||
                    'Not provided'
                  }
                />

                <InfoItem
                  icon={
                    Globe
                  }
                  label="Website"
                  value={
                    selectedClient.website ||
                    'Not provided'
                  }
                />

                <InfoItem
                  icon={
                    Sparkles
                  }
                  label="Service"
                  value={
                    selectedClient.service_name ||
                    'Not specified'
                  }
                />

                <InfoItem
                  icon={
                    DollarSign
                  }
                  label="Service Price"
                  value={
                    selectedClient.service_price
                      ? `₱${Number(
                          selectedClient.service_price,
                        ).toLocaleString(
                          'en-PH',
                        )}`
                      : 'Not specified'
                  }
                />

                <InfoItem
                  icon={
                    Calendar
                  }
                  label="Preferred Date"
                  value={formatDate(
                    selectedClient.date,
                  )}
                />

                <InfoItem
                  icon={
                    Clock
                  }
                  label="Preferred Time"
                  value={
                    selectedClient.time ||
                    'Not specified'
                  }
                />

                <InfoItem
                  icon={
                    Wallet
                  }
                  label="Budget"
                  value={
                    selectedClient.budget ||
                    'Not specified'
                  }
                />

                <InfoItem
                  icon={
                    Timer
                  }
                  label="Timeline"
                  value={
                    selectedClient.timeline ||
                    'Not specified'
                  }
                />

                <InfoItem
                  icon={
                    CheckCircle
                  }
                  label="Booking Status"
                  value={getBookingStatusLabel(
                    selectedClient.status,
                  )}
                />

                <InfoItem
                  icon={
                    DollarSign
                  }
                  label="Payment Status"
                  value={
                    selectedClient.payment_status ||
                    'Unpaid'
                  }
                />
              </div>

              {Array.isArray(
                selectedClient.goals,
              ) &&
                selectedClient.goals
                  .length >
                  0 && (
                  <div>
                    <Label>
                      Goals
                    </Label>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedClient.goals.map(
                        (
                          goal,
                          index,
                        ) => (
                          <span
                            key={`${String(
                              goal,
                            )}-${index}`}
                            className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                          >
                            {String(
                              goal,
                            )}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {selectedClient.notes && (
                <div>
                  <Label>
                    Client Notes
                  </Label>

                  <div className="mt-2 rounded-xl bg-muted/50 p-4 text-sm leading-relaxed">
                    {
                      selectedClient.notes
                    }
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() =>
                    setClientDetailsOpen(
                      false,
                    )
                  }
                >
                  Close
                </Button>

                {!isCompletedBooking(
                  selectedClient,
                ) && (
                  <Button
                    onClick={() => {
                      setClientDetailsOpen(
                        false,
                      )

                      openProceedToBooking(
                        selectedClient,
                      )
                    }}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Proceed for Booking
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ======================================================
          PROCEED FOR BOOKING
      ====================================================== */}

      <Dialog
        open={
          proceedOpen
        }
        onOpenChange={
          setProceedOpen
        }
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Proceed Client to Cal.com
            </DialogTitle>

            <p className="text-sm text-muted-foreground">
              Select the discovery session you want to send to this client.
            </p>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-5">
              {/* CLIENT */}

              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold">
                      {
                        selectedClient.name
                      }
                    </p>

                    <p className="truncate text-sm text-muted-foreground">
                      {
                        selectedClient.email
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* SERVICE */}

              <div className="space-y-2">
                <Label>
                  Cal.com Event
                </Label>

                <Select
                  value={
                    selectedCalEvent.id
                  }
                  onValueChange={(
                    value,
                  ) => {
                    const event =
                      calEvents.find(
                        (
                          item,
                        ) =>
                          item.id ===
                          value,
                      )

                    if (
                      event
                    ) {
                      setSelectedCalEvent(
                        event,
                      )
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {calEvents.map(
                      (
                        event,
                      ) => (
                        <SelectItem
                          key={
                            event.id
                          }
                          value={
                            event.id
                          }
                        >
                          <div>
                            <p>
                              {
                                event.name
                              }
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {
                                event.duration
                              }{' '}
                              · ₱
                              {
                                event.price
                              }
                            </p>
                          </div>
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* EVENT */}

              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Calendar className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold">
                      {
                        selectedCalEvent.name
                      }
                    </p>

                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>
                        {
                          selectedCalEvent.duration
                        }
                      </span>

                      <span>
                        ₱
                        {
                          selectedCalEvent.price
                        }
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-muted-foreground">
                      {
                        selectedCalEvent.description
                      }
                    </p>

                    <div className="mt-4 rounded-xl bg-background p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Cal.com Booking Link
                      </p>

                      <p className="mt-1 break-all text-sm font-medium">
                        {
                          selectedCalEvent.url
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* EMAIL */}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="booking-email-subject">
                    Email Subject
                  </Label>

                  <Input
                    id="booking-email-subject"
                    className="mt-2"
                    value={
                      emailSubject
                    }
                    onChange={(
                      e,
                    ) =>
                      setEmailSubject(
                        e.target
                          .value,
                      )
                    }
                    placeholder="Email subject"
                  />
                </div>

                <div>
                  <Label htmlFor="booking-email-message">
                    Email Message
                  </Label>

                  <Textarea
                    id="booking-email-message"
                    className="mt-2 min-h-[280px]"
                    value={
                      emailMessage
                    }
                    onChange={(
                      e,
                    ) =>
                      setEmailMessage(
                        e.target
                          .value,
                      )
                    }
                    placeholder="Write the booking email you want to send..."
                  />

                  <p className="mt-2 text-xs text-muted-foreground">
                    You can edit the subject and entire message before sending.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Recipient
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {
                      selectedClient.email
                    }
                  </p>
                </div>
              </div>

              {/* ACTIONS */}

              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setProceedOpen(
                      false,
                    )
                  }
                  disabled={
                    sendingBookingEmail
                  }
                >
                  Cancel
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(
                      selectedCalEvent.url,
                      '_blank',
                      'noopener,noreferrer',
                    )
                  }
                  disabled={
                    sendingBookingEmail
                  }
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Preview Cal.com
                </Button>

                <Button
                  onClick={
                    handleSendBookingEmail
                  }
                  disabled={
                    sendingBookingEmail
                  }
                >
                  {sendingBookingEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Booking Email
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ======================================================
          NOTES DIALOG
      ====================================================== */}

      <Dialog
        open={
          notesOpen
        }
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
                value={
                  notesText
                }
                onChange={(
                  e,
                ) =>
                  setNotesText(
                    e.target
                      .value,
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
        open={
          completeOpen
        }
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
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold">
                {
                  editingCall?.clientName
                }
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {
                  editingCall?.type
                }
                {' · '}
                {
                  editingCall?.duration
                }
                {' min'}
              </p>
            </div>

            <div className="space-y-2">
              <Label>
                Call Outcome
              </Label>

              <Select
                value={
                  outcome
                }
                onValueChange={
                  setOutcome
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="What happened after the call?" />
                </SelectTrigger>

                <SelectContent>
                  {outcomeOptions.map(
                    (
                      option,
                    ) => (
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
                onChange={(
                  e,
                ) =>
                  setNextStep(
                    e.target
                      .value,
                  )
                }
                placeholder="e.g. Send proposal and follow up with client after 3 days."
              />

              <p className="text-xs text-muted-foreground">
                This will be saved together with the outcome.
              </p>
            </div>

            {outcome && (
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-600" />

                  <p className="text-sm font-medium">
                    Outcome Preview
                  </p>
                </div>

                <p className="mt-2 text-sm">
                  {
                    outcome
                  }
                </p>

                {nextStep.trim() && (
                  <div className="mt-2 flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 text-blue-600" />

                    <p className="text-sm text-muted-foreground">
                      {
                        nextStep
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

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
  )
}

// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />

        <p className="text-xs font-medium text-muted-foreground">
          {label}
        </p>
      </div>

      <p className="mt-1 break-words text-sm font-medium">
        {value}
      </p>
    </div>
  )
}