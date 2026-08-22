'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

import {
  PhoneCall,
  Clock,
  Calendar,
  CheckCircle,
  FileText,
  Video,
  TrendingUp,
  DollarSign,
  Trash2,
  Mail,
  Phone,
  Building2,
  Globe,
  Target,
  MessageSquare,
} from 'lucide-react';

import { DashboardShell, PageHeader } from '@/components/dashboard-shell';
import { KpiCard, StatusBadge } from '@/components/shared';

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

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  fetchDiscoveryBookings,
  updateDiscoveryBooking,
  deleteDiscoveryBooking,
  type DiscoveryBooking,
} from '@/lib/api';

import { useFetch } from '@/hooks/use-fetch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

const statusOptions: BookingStatus[] = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
];

// ============================================================
// HELPERS
// ============================================================

function formatStatus(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pending';

    case 'confirmed':
      return 'Confirmed';

    case 'completed':
      return 'Completed';

    case 'cancelled':
      return 'Cancelled';

    default:
      return status;
  }
}

function getDuration(serviceName: string): string {
  switch (serviceName) {
    case 'Social Growth Sprint':
      return '30 min';

    case 'Brand Clarity Session':
      return '45 min';

    case 'Website Roadmap Call':
      return '60 min';

    default:
      return 'Discovery Call';
  }
}

function formatBookingDate(date: string, time: string) {
  if (!date) return 'No date';

  const combined = `${date}T${convertTimeTo24Hour(time)}`;

  const parsed = new Date(combined);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatBookingTime(time: string) {
  if (!time) return 'No time';

  return time;
}

function convertTimeTo24Hour(time: string): string {
  if (!time) {
    return '00:00';
  }

  // Already HH:mm
  if (/^\d{2}:\d{2}$/.test(time)) {
    return time;
  }

  const match = time.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
  );

  if (!match) {
    return '00:00';
  }

  let hour = Number(match[1]);
  const minute = match[2];
  const period = match[3].toUpperCase();

  if (period === 'PM' && hour !== 12) {
    hour += 12;
  }

  if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  return `${String(hour).padStart(2, '0')}:${minute}`;
}

function getGoals(booking: DiscoveryBooking): string {
  if (!booking.goals || booking.goals.length === 0) {
    return 'No goals provided';
  }

  return booking.goals.join(', ');
}

// ============================================================
// PAGE
// ============================================================

export default function DiscoveryCallsPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);

  const {
    data: bookings,
    loading,
  } = useFetch(fetchDiscoveryBookings, [refreshKey]);

  const refetch = () => {
    setRefreshKey((current) => current + 1);
  };

  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [editingBooking, setEditingBooking] =
    React.useState<DiscoveryBooking | null>(null);

  const [notesText, setNotesText] = React.useState('');
  const [outcomeText, setOutcomeText] = React.useState('');

  const [saving, setSaving] = React.useState(false);

  const allBookings = bookings ?? [];

  const pending = allBookings.filter(
    (booking) => booking.status === 'pending',
  );

  const confirmed = allBookings.filter(
    (booking) => booking.status === 'confirmed',
  );

  const completed = allBookings.filter(
    (booking) => booking.status === 'completed',
  );

  const cancelled = allBookings.filter(
    (booking) => booking.status === 'cancelled',
  );

  const upcoming = allBookings.filter(
    (booking) =>
      booking.status === 'pending' ||
      booking.status === 'confirmed',
  );

  const paidCount = allBookings.filter(
    (booking) =>
      Number(booking.service_price ?? 0) > 0,
  ).length;

  // ============================================================
  // OPEN DETAILS
  // ============================================================

  function openBooking(booking: DiscoveryBooking) {
    setEditingBooking(booking);

    setNotesText(booking.notes ?? '');

    setOutcomeText(
      booking.status === 'completed'
        ? 'Call completed'
        : '',
    );

    setDetailsOpen(true);
  }

  // ============================================================
  // UPDATE STATUS
  // ============================================================

  async function handleStatusChange(status: string) {
    if (!editingBooking) return;

    setSaving(true);

    try {
      await updateDiscoveryBooking(
        editingBooking.id,
        {
          status,
        },
      );

      toast.success('Booking status updated');

      setEditingBooking({
        ...editingBooking,
        status,
      });

      refetch();
    } catch (error: any) {
      toast.error(
        'Failed to update booking status',
        {
          description:
            error?.message ||
            'Something went wrong.',
        },
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // SAVE NOTES
  // ============================================================

  async function handleSaveDetails(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!editingBooking) return;

    setSaving(true);

    try {
      await updateDiscoveryBooking(
        editingBooking.id,
        {
          notes: notesText,
          status:
            editingBooking.status === 'completed'
              ? 'completed'
              : editingBooking.status,
        },
      );

      toast.success('Booking details saved');

      setDetailsOpen(false);

      setEditingBooking(null);

      refetch();
    } catch (error: any) {
      toast.error(
        'Failed to save booking',
        {
          description:
            error?.message ||
            'Something went wrong.',
        },
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // COMPLETE CALL
  // ============================================================

  async function handleComplete(
    booking: DiscoveryBooking,
  ) {
    try {
      await updateDiscoveryBooking(
        booking.id,
        {
          status: 'completed',
        },
      );

      toast.success(
        `${booking.name}'s call marked as completed`,
      );

      refetch();
    } catch (error: any) {
      toast.error(
        'Failed to complete call',
        {
          description:
            error?.message ||
            'Something went wrong.',
        },
      );
    }
  }

  // ============================================================
  // DELETE
  // ============================================================

  async function handleDelete(
    booking: DiscoveryBooking,
  ) {
    const confirmed = window.confirm(
      `Delete the booking from ${booking.name}?`,
    );

    if (!confirmed) return;

    try {
      await deleteDiscoveryBooking(
        booking.id,
      );

      toast.success('Booking deleted');

      if (
        editingBooking?.id === booking.id
      ) {
        setDetailsOpen(false);
        setEditingBooking(null);
      }

      refetch();
    } catch (error: any) {
      toast.error(
        'Failed to delete booking',
        {
          description:
            error?.message ||
            'Something went wrong.',
        },
      );
    }
  }

  // ============================================================
  // BOOKING CARD
  // ============================================================

  function BookingCard({
    booking,
    index,
  }: {
    booking: DiscoveryBooking;
    index: number;
  }) {
    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: index * 0.05,
        }}
      >
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <PhoneCall className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {booking.name}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {booking.service_name}
                  </p>
                </div>
              </div>

              <Badge variant="outline">
                {formatStatus(booking.status)}
              </Badge>
            </div>

            {/* DATE */}
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />

              <span className="font-medium">
                {formatBookingDate(
                  booking.date,
                  booking.time,
                )}
              </span>

              <span className="text-muted-foreground">
                at {formatBookingTime(booking.time)}
              </span>
            </div>

            {/* CONTACT */}
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {booking.email}
                </span>
              </div>

              {booking.phone && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>
                    {booking.phone}
                  </span>
                </div>
              )}
            </div>

            {/* COMPANY */}
            {booking.company && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span>
                  {booking.company}
                </span>
              </div>
            )}

            {/* DETAILS */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Budget
                </p>

                <p className="mt-1 text-xs font-medium">
                  {booking.budget || 'Not specified'}
                </p>
              </div>

              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Timeline
                </p>

                <p className="mt-1 text-xs font-medium">
                  {booking.timeline || 'Not specified'}
                </p>
              </div>
            </div>

            {/* GOALS */}
            <div className="mt-3 rounded-lg bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-muted-foreground" />

                <p className="text-xs font-medium text-muted-foreground">
                  Goals
                </p>
              </div>

              <p className="mt-1 text-sm">
                {getGoals(booking)}
              </p>
            </div>

            {/* NOTES */}
            {booking.notes && (
              <div className="mt-3 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />

                  <p className="text-xs font-medium text-muted-foreground">
                    Notes
                  </p>
                </div>

                <p className="mt-1 line-clamp-3 text-sm">
                  {booking.notes}
                </p>
              </div>
            )}

            {/* ACTIONS */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() =>
                  openBooking(booking)
                }
              >
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                View Details
              </Button>

              {booking.status !== 'completed' &&
                booking.status !== 'cancelled' && (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      handleComplete(booking)
                    }
                  >
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    Complete
                  </Button>
                )}

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleDelete(booking)
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <DashboardShell>
      <PageHeader
        title="Discovery Calls"
        description="Manage booking requests submitted from your public booking form"
      />

      {/* ======================================================
          KPI
      ====================================================== */}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total Bookings"
          value={String(allBookings.length)}
          icon={PhoneCall}
          index={0}
        />

        <KpiCard
          label="Pending"
          value={String(pending.length)}
          icon={Clock}
          accent="text-amber-600 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400"
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
          SERVICE SUMMARY
      ====================================================== */}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          {
            name: 'Social Growth Sprint',
            duration: '30 min',
            icon: TrendingUp,
          },
          {
            name: 'Brand Clarity Session',
            duration: '45 min',
            icon: PhoneCall,
          },
          {
            name: 'Website Roadmap Call',
            duration: '60 min',
            icon: Video,
          },
        ].map((service) => {
          const Icon = service.icon;

          const count =
            allBookings.filter(
              (booking) =>
                booking.service_name ===
                service.name,
            ).length;

          return (
            <Card key={service.name}>
              <CardContent className="p-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>

                <p className="text-sm font-semibold">
                  {service.name}
                </p>

                <div className="mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {service.duration}
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

          <TabsTrigger value="pending">
            Pending ({pending.length})
          </TabsTrigger>

          <TabsTrigger value="completed">
            Completed ({completed.length})
          </TabsTrigger>

          <TabsTrigger value="cancelled">
            Cancelled ({cancelled.length})
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
            <LoadingCards />
          ) : upcoming.length === 0 ? (
            <EmptyState text="No upcoming discovery calls." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {upcoming.map(
                (booking, index) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    index={index}
                  />
                ),
              )}
            </div>
          )}
        </TabsContent>

        {/* ====================================================
            PENDING
        ==================================================== */}

        <TabsContent
          value="pending"
          className="mt-4"
        >
          {loading ? (
            <LoadingCards />
          ) : pending.length === 0 ? (
            <EmptyState text="No pending booking requests." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {pending.map(
                (booking, index) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    index={index}
                  />
                ),
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
          {loading ? (
            <LoadingCards />
          ) : completed.length === 0 ? (
            <EmptyState text="No completed calls yet." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {completed.map(
                (booking, index) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    index={index}
                  />
                ),
              )}
            </div>
          )}
        </TabsContent>

        {/* ====================================================
            CANCELLED
        ==================================================== */}

        <TabsContent
          value="cancelled"
          className="mt-4"
        >
          {loading ? (
            <LoadingCards />
          ) : cancelled.length === 0 ? (
            <EmptyState text="No cancelled bookings." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {cancelled.map(
                (booking, index) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    index={index}
                  />
                ),
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ======================================================
          DETAILS DIALOG
      ====================================================== */}

      <Dialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Discovery Booking
            </DialogTitle>
          </DialogHeader>

          {editingBooking && (
            <form
              onSubmit={handleSaveDetails}
              className="space-y-5"
            >
              {/* CLIENT */}
              <div className="rounded-xl border p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Client
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {editingBooking.name}
                </p>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {editingBooking.email}
                  </div>

                  {editingBooking.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {editingBooking.phone}
                    </div>
                  )}

                  {editingBooking.company && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      {editingBooking.company}
                    </div>
                  )}

                  {editingBooking.website && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      {editingBooking.website}
                    </div>
                  )}
                </div>
              </div>

              {/* SERVICE */}
              <div className="rounded-xl border p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Booking
                </p>

                <p className="mt-1 text-base font-semibold">
                  {editingBooking.service_name}
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {getDuration(
                      editingBooking.service_name,
                    )}
                  </Badge>

                  {editingBooking.service_price !==
                    null && (
                    <Badge variant="outline">
                      ₱
                      {editingBooking.service_price}
                    </Badge>
                  )}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Date
                    </p>

                    <p className="text-sm font-medium">
                      {formatBookingDate(
                        editingBooking.date,
                        editingBooking.time,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Time
                    </p>

                    <p className="text-sm font-medium">
                      {formatBookingTime(
                        editingBooking.time,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Contact Method
                    </p>

                    <p className="text-sm font-medium">
                      {editingBooking.contact_method ||
                        'Not specified'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Budget
                    </p>

                    <p className="text-sm font-medium">
                      {editingBooking.budget ||
                        'Not specified'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Timeline
                    </p>

                    <p className="text-sm font-medium">
                      {editingBooking.timeline ||
                        'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* GOALS */}
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />

                  <p className="text-sm font-semibold">
                    Goals
                  </p>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {getGoals(editingBooking)}
                </p>
              </div>

              {/* STATUS */}
              <div className="space-y-2">
                <Label>
                  Booking Status
                </Label>

                <Select
                  value={editingBooking.status}
                  onValueChange={
                    handleStatusChange
                  }
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {statusOptions.map(
                      (status) => (
                        <SelectItem
                          key={status}
                          value={status}
                        >
                          {formatStatus(status)}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* NOTES */}
              <div className="space-y-2">
                <Label htmlFor="booking-notes">
                  Notes
                </Label>

                <Textarea
                  id="booking-notes"
                  rows={5}
                  value={notesText}
                  onChange={(event) =>
                    setNotesText(
                      event.target.value,
                    )
                  }
                  placeholder="Add internal notes about this discovery call..."
                />
              </div>

              {/* OUTCOME */}
              <div className="space-y-2">
                <Label htmlFor="booking-outcome">
                  Outcome
                </Label>

                <Textarea
                  id="booking-outcome"
                  rows={3}
                  value={outcomeText}
                  onChange={(event) =>
                    setOutcomeText(
                      event.target.value,
                    )
                  }
                  placeholder="Record the outcome of the call..."
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    handleDelete(
                      editingBooking,
                    )
                  }
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setDetailsOpen(false)
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

// ============================================================
// LOADING
// ============================================================

function LoadingCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }).map(
        (_, index) => (
          <Card key={index}>
            <CardContent className="p-5">
              <div className="space-y-4">
                <div className="h-5 w-48 animate-pulse rounded bg-muted" />

                <div className="h-4 w-64 animate-pulse rounded bg-muted" />

                <div className="h-16 animate-pulse rounded-lg bg-muted/50" />

                <div className="h-10 animate-pulse rounded-lg bg-muted/50" />
              </div>
            </CardContent>
          </Card>
        ),
      )}
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <Card>
      <CardContent className="py-16 text-center">
        <PhoneCall className="mx-auto h-8 w-8 text-muted-foreground/50" />

        <p className="mt-3 text-sm text-muted-foreground">
          {text}
        </p>
      </CardContent>
    </Card>
  );
}