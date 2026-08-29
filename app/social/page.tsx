'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Share2,
  Instagram,
  Facebook,
  Eye,
  Bookmark,
  Repeat2,
  Heart,
  CalendarDays,
  LayoutGrid,
  List,
  Trash2,
} from 'lucide-react';

import {
  DashboardShell,
  PageHeader,
} from '@/components/dashboard-shell';

import {
  KpiCard,
  StatusBadge,
  Avatar,
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
  fetchContentItems,
  insertContentItem,
  updateContentItem,
  deleteContentItem,
  fetchTeam,
} from '@/lib/api';

import {
  type ContentStatus,
  type TeamMember,
} from '@/lib/data';

import { useFetch } from '@/hooks/use-fetch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/* ============================================================
   PLATFORM CONFIG
============================================================ */

const platformIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Instagram,
  TikTok: Share2,
  Facebook,
};

const platformColors: Record<
  string,
  string
> = {
  Instagram:
    'bg-gradient-to-br from-purple-500 to-pink-500',

  TikTok:
    'bg-black',

  Facebook:
    'bg-blue-600',
};

/* ============================================================
   OPTIONS
============================================================ */

const statuses: ContentStatus[] = [
  'Draft',
  'In Review',
  'Approved',
  'Scheduled',
  'Published',
];

const platformOptions = [
  'Instagram',
  'TikTok',
  'Facebook',
];

/* ============================================================
   FORM TYPE
============================================================ */

interface ContentForm {
  platform: string;
  caption: string;
  status: ContentStatus;
  scheduledDate: string;
  designer: string;
  copywriter: string;
  client: string;
}

/* ============================================================
   EMPTY FORM
============================================================ */

const emptyForm: ContentForm = {
  platform: 'Instagram',
  caption: '',
  status: 'Draft',
  scheduledDate:
    new Date()
      .toISOString()
      .slice(0, 16),
  designer: '',
  copywriter: '',
  client: '',
};

/* ============================================================
   HELPERS
============================================================ */

function getInitials(
  name: string,
) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);
}

/* ============================================================
   PAGE
============================================================ */

export default function SocialMediaPage() {
  /* ==========================================================
     CONTENT DATA
  ========================================================== */

  const [
    refreshKey,
    setRefreshKey,
  ] = React.useState(0);

  const {
    data: contentItems,
    loading,
  } = useFetch(
    fetchContentItems,
    [refreshKey],
  );

  const refetch = () =>
    setRefreshKey(
      (k) => k + 1,
    );

  /* ==========================================================
     TEAM DATA
  ========================================================== */

  const {
    data: teamMembers,
    loading: teamLoading,
  } = useFetch(
    fetchTeam,
    [],
  );

  const team: TeamMember[] =
    teamMembers ?? [];

  /* ==========================================================
     DIALOG / FORM STATE
  ========================================================== */

  const [
    open,
    setOpen,
  ] = React.useState(false);

  const [
    editId,
    setEditId,
  ] = React.useState<
    string | null
  >(null);

  const [
    submitting,
    setSubmitting,
  ] = React.useState(false);

  const [
    form,
    setForm,
  ] = React.useState<ContentForm>(
    emptyForm,
  );

  /* ==========================================================
     CONTENT CALCULATIONS
  ========================================================== */

  const items =
    contentItems ?? [];

  const scheduled =
    items.filter(
      (c) =>
        c.status ===
        'Scheduled',
    ).length;

  const published =
    items.filter(
      (c) =>
        c.status ===
        'Published',
    ).length;

  const totalReach =
    items.reduce(
      (sum, c) =>
        sum +
        (c.reach ?? 0),
      0,
    );

  const engagementItems =
    items.filter(
      (c) =>
        c.engagement,
    );

  const avgEngagement =
    engagementItems.reduce(
      (sum, c) =>
        sum +
        (c.engagement ?? 0),
      0,
    ) /
    (engagementItems.length ||
      1);

  /* ==========================================================
     CALENDAR DATA
  ========================================================== */

  const byDate =
    items.reduce(
      (acc, item) => {
        const date =
          item.scheduledDate.split(
            'T',
          )[0];

        if (!acc[date]) {
          acc[date] = [];
        }

        acc[date].push(item);

        return acc;
      },
      {} as Record<
        string,
        typeof items
      >,
    );

  const weekDays = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ];

  const [
    weekOffset,
    setWeekOffset,
  ] = React.useState(0);

  const today =
    new Date();

  const weekStart =
    new Date(today);

  weekStart.setDate(
    today.getDate() -
      today.getDay() +
      weekOffset * 7,
  );

  const weekEnd =
    new Date(
      weekStart,
    );

  weekEnd.setDate(
    weekStart.getDate() +
      6,
  );

  const weekDates =
    Array.from(
      {
        length: 7,
      },
      (_, i) => {
        const d =
          new Date(
            weekStart,
          );

        d.setDate(
          weekStart.getDate() +
            i,
        );

        return d
          .toISOString()
          .split('T')[0];
      },
    );

  const todayStr =
    today
      .toISOString()
      .split('T')[0];

  const weekLabel = `${weekStart.toLocaleDateString(
    'en-PH',
    {
      month: 'short',
      day: 'numeric',
    },
  )}–${weekEnd.toLocaleDateString(
    'en-PH',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  )}`;

  /* ==========================================================
     ADD CONTENT
  ========================================================== */

  function openAdd() {
    setEditId(null);

    setForm({
      ...emptyForm,
      scheduledDate:
        new Date()
          .toISOString()
          .slice(0, 16),
    });

    setOpen(true);
  }

  /* ==========================================================
     EDIT CONTENT
  ========================================================== */

  function openEdit(
    id: string,
  ) {
    const c =
      items.find(
        (x) =>
          x.id === id,
      );

    if (!c) {
      return;
    }

    setEditId(id);

    setForm({
      platform:
        c.platform,

      caption:
        c.caption,

      status:
        c.status,

      scheduledDate:
        c.scheduledDate.slice(
          0,
          16,
        ),

      designer:
        c.designer,

      copywriter:
        c.copywriter,

      client:
        c.client,
    });

    setOpen(true);
  }

  /* ==========================================================
     SAVE CONTENT
  ========================================================== */

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    setSubmitting(true);

    try {
      const payload = {
        platform:
          form.platform,

        caption:
          form.caption,

        status:
          form.status,

        scheduled_date:
          form.scheduledDate,

        designer:
          form.designer,

        copywriter:
          form.copywriter,

        client:
          form.client,
      };

      if (editId) {
        await updateContentItem(
          editId,
          payload,
        );

        toast.success(
          'Content updated',
        );
      } else {
        await insertContentItem(
          payload,
        );

        toast.success(
          'Content scheduled',
        );
      }

      setOpen(false);

      refetch();
    } catch (err: any) {
      toast.error(
        'Failed to save content',
        {
          description:
            err?.message ??
            'Something went wrong.',
        },
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ==========================================================
     DELETE CONTENT
  ========================================================== */

  async function handleDelete(
    id: string,
  ) {
    try {
      await deleteContentItem(
        id,
      );

      toast.success(
        'Content deleted',
      );

      refetch();
    } catch (err: any) {
      toast.error(
        'Failed to delete content',
        {
          description:
            err?.message ??
            'Something went wrong.',
        },
      );
    }
  }

  /* ==========================================================
     TEAM MEMBER HELPERS
  ========================================================== */

  const selectedDesignerExists =
    !form.designer ||
    team.some(
      (member) =>
        member.name ===
        form.designer,
    );

  const selectedCopywriterExists =
    !form.copywriter ||
    team.some(
      (member) =>
        member.name ===
        form.copywriter,
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <DashboardShell>

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <PageHeader
        title="Social Media Management"
        description="Plan, approve, and publish content across all client accounts"
      >
        <Button
          size="sm"
          onClick={openAdd}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Schedule Content
        </Button>
      </PageHeader>

      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

        <KpiCard
          label="Content Scheduled"
          value={String(
            scheduled,
          )}
          delta="+24"
          trend="up"
          icon={CalendarDays}
          index={0}
        />

        <KpiCard
          label="Published This Week"
          value={String(
            published,
          )}
          icon={Share2}
          accent="text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400"
          index={1}
        />

        <KpiCard
          label="Total Reach"
          value={`${(
            totalReach /
            1000
          ).toFixed(1)}K`}
          delta="+18%"
          trend="up"
          icon={Eye}
          accent="text-blue-600 bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400"
          index={2}
        />

        <KpiCard
          label="Avg Engagement"
          value={`${avgEngagement.toFixed(
            1,
          )}%`}
          delta="+1.2%"
          trend="up"
          icon={Heart}
          accent="text-rose-600 bg-rose-100 dark:bg-rose-500/15 dark:text-rose-400"
          index={3}
        />

      </div>

      {/* ======================================================
          TABS
      ====================================================== */}

      <Tabs
        defaultValue="calendar"
        className="mt-6"
      >

        <TabsList>

          <TabsTrigger value="calendar">
            <LayoutGrid className="mr-1.5 h-4 w-4" />
            Calendar
          </TabsTrigger>

          <TabsTrigger value="list">
            <List className="mr-1.5 h-4 w-4" />
            Content List
          </TabsTrigger>

          <TabsTrigger value="analytics">
            Analytics
          </TabsTrigger>

        </TabsList>

        {/* ====================================================
            CALENDAR
        ==================================================== */}

        <TabsContent
          value="calendar"
          className="mt-4"
        >

          <Card>

            <CardHeader className="flex-row items-center justify-between space-y-0">

              <CardTitle className="text-base">
                {weekLabel}
              </CardTitle>

              <div className="flex gap-1.5">

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() =>
                    setWeekOffset(
                      (w) =>
                        w - 1,
                    )
                  }
                >
                  ‹
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() =>
                    setWeekOffset(
                      0,
                    )
                  }
                >
                  Today
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() =>
                    setWeekOffset(
                      (w) =>
                        w + 1,
                    )
                  }
                >
                  ›
                </Button>

              </div>

            </CardHeader>

            <CardContent>

              {loading ? (

                <div className="grid grid-cols-7 gap-2">

                  {Array.from({
                    length: 7,
                  }).map(
                    (_, i) => (
                      <div
                        key={i}
                        className="min-h-[180px] rounded-lg border p-2 bg-muted/30 animate-pulse"
                      />
                    ),
                  )}

                </div>

              ) : (

                <div className="grid grid-cols-7 gap-2">

                  {weekDates.map(
                    (
                      date,
                      i,
                    ) => {

                      const dayItems =
                        byDate[
                          date
                        ] || [];

                      const dayNum =
                        new Date(
                          date,
                        ).getDate();

                      const isToday =
                        date ===
                        todayStr;

                      return (
                        <div
                          key={date}
                          className="min-h-[180px] rounded-lg border p-2"
                        >

                          <div className="mb-2 flex items-center justify-between">

                            <span className="text-[10px] font-medium text-muted-foreground">
                              {
                                weekDays[
                                  i
                                ]
                              }
                            </span>

                            <span
                              className={cn(
                                'text-xs font-bold',
                                isToday
                                  ? 'flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground'
                                  : '',
                              )}
                            >
                              {
                                dayNum
                              }
                            </span>

                          </div>

                          <div className="space-y-1.5">

                            {dayItems.map(
                              (
                                item,
                              ) => {

                                const Icon =
                                  platformIcons[
                                    item
                                      .platform
                                  ] ??
                                  Instagram;

                                return (
                                  <motion.div
                                    key={
                                      item.id
                                    }
                                    initial={{
                                      opacity: 0,
                                      scale: 0.95,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      scale: 1,
                                    }}
                                    className="cursor-pointer rounded-md border p-1.5 text-[10px] transition-shadow hover:shadow-sm"
                                    onClick={() =>
                                      openEdit(
                                        item.id,
                                      )
                                    }
                                  >

                                    <div className="flex items-center gap-1">

                                      <div
                                        className={cn(
                                          'flex h-4 w-4 items-center justify-center rounded text-white',
                                          platformColors[
                                            item
                                              .platform
                                          ],
                                        )}
                                      >
                                        <Icon className="h-2.5 w-2.5" />
                                      </div>

                                      <span className="font-medium">
                                        {new Date(
                                          item.scheduledDate,
                                        ).toLocaleTimeString(
                                          'en-PH',
                                          {
                                            hour: 'numeric',
                                            minute:
                                              '2-digit',
                                          },
                                        )}
                                      </span>

                                    </div>

                                    <p className="mt-1 line-clamp-2 text-muted-foreground">
                                      {
                                        item.caption
                                      }
                                    </p>

                                  </motion.div>
                                );
                              },
                            )}

                          </div>

                        </div>
                      );
                    },
                  )}

                </div>
              )}

            </CardContent>

          </Card>

        </TabsContent>

        {/* ====================================================
            CONTENT LIST
        ==================================================== */}

        <TabsContent
          value="list"
          className="mt-4"
        >

          <div className="mb-4 flex flex-wrap gap-2">

            {statuses.map(
              (s) => {

                const count =
                  items.filter(
                    (c) =>
                      c.status ===
                      s,
                  ).length;

                return (
                  <div
                    key={s}
                    className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium"
                  >

                    {s}

                    <Badge
                      variant="secondary"
                      className="text-[10px]"
                    >
                      {count}
                    </Badge>

                  </div>
                );
              },
            )}

          </div>

          <Card>

            <Table>

              <TableHeader>

                <TableRow>

                  <TableHead>
                    Platform
                  </TableHead>

                  <TableHead className="min-w-[200px]">
                    Caption
                  </TableHead>

                  <TableHead>
                    Client
                  </TableHead>

                  <TableHead>
                    Designer
                  </TableHead>

                  <TableHead>
                    Copywriter
                  </TableHead>

                  <TableHead>
                    Scheduled
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>

                  <TableHead />

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

                        {Array.from({
                          length: 8,
                        }).map(
                          (
                            __,
                            j,
                          ) => (
                            <TableCell
                              key={j}
                            >
                              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                            </TableCell>
                          ),
                        )}

                      </TableRow>
                    ),
                  )

                ) : (

                  items.map(
                    (c) => {

                      const Icon =
                        platformIcons[
                          c.platform
                        ] ??
                        Instagram;

                      return (
                        <TableRow
                          key={
                            c.id
                          }
                          className="cursor-pointer"
                          onClick={() =>
                            openEdit(
                              c.id,
                            )
                          }
                        >

                          <TableCell>

                            <div className="flex items-center gap-2">

                              <div
                                className={cn(
                                  'flex h-7 w-7 items-center justify-center rounded-md text-white',
                                  platformColors[
                                    c.platform
                                  ],
                                )}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </div>

                              <span className="text-xs font-medium">
                                {
                                  c.platform
                                }
                              </span>

                            </div>

                          </TableCell>

                          <TableCell className="max-w-[280px]">

                            <p className="truncate text-sm">
                              {
                                c.caption
                              }
                            </p>

                          </TableCell>

                          <TableCell className="text-muted-foreground">
                            {
                              c.client
                            }
                          </TableCell>

                          <TableCell>

                            <div className="flex items-center gap-1.5">

                              <Avatar
                                initials={getInitials(
                                  c.designer ||
                                    '',
                                )}
                                className="h-6 w-6 text-[9px]"
                              />

                              <span className="text-xs">
                                {
                                  c.designer ||
                                    '—'
                                }
                              </span>

                            </div>

                          </TableCell>

                          <TableCell>

                            <div className="flex items-center gap-1.5">

                              <Avatar
                                initials={getInitials(
                                  c.copywriter ||
                                    '',
                                )}
                                className="h-6 w-6 text-[9px]"
                              />

                              <span className="text-xs">
                                {
                                  c.copywriter ||
                                    '—'
                                }
                              </span>

                            </div>

                          </TableCell>

                          <TableCell className="text-muted-foreground text-sm">
                            {
                              c.scheduledDate.split(
                                'T',
                              )[0]
                            }
                          </TableCell>

                          <TableCell>
                            <StatusBadge
                              status={
                                c.status
                              }
                            />
                          </TableCell>

                          <TableCell>

                            <Trash2
                              className="h-3.5 w-3.5 text-muted-foreground hover:text-rose-500"
                              onClick={(
                                e,
                              ) => {
                                e.stopPropagation();
                                handleDelete(
                                  c.id,
                                );
                              }}
                            />

                          </TableCell>

                        </TableRow>
                      );
                    },
                  )

                )}

              </TableBody>

            </Table>

          </Card>

        </TabsContent>

        {/* ====================================================
            ANALYTICS
        ==================================================== */}

        <TabsContent
          value="analytics"
          className="mt-4"
        >

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {items
              .filter(
                (c) =>
                  c.status ===
                  'Published',
              )
              .map(
                (c) => (

                  <Card
                    key={c.id}
                  >

                    <CardContent className="p-5">

                      <div className="flex items-center justify-between">

                        <Badge
                          variant="outline"
                          className="text-[10px]"
                        >
                          {
                            c.platform
                          }
                        </Badge>

                        <span className="text-xs text-muted-foreground">
                          {
                            c.client
                          }
                        </span>

                      </div>

                      <p className="mt-3 text-sm font-medium line-clamp-2">
                        {
                          c.caption
                        }
                      </p>

                      <div className="mt-4 grid grid-cols-4 gap-2">

                        {[
                          {
                            label:
                              'Reach',
                            value:
                              c.reach?.toLocaleString() ??
                              '—',
                            icon: Eye,
                          },
                          {
                            label:
                              'Engage',
                            value:
                              c.engagement
                                ? `${c.engagement}%`
                                : '—',
                            icon: Heart,
                          },
                          {
                            label:
                              'Saves',
                            value:
                              c.saves?.toString() ??
                              '—',
                            icon: Bookmark,
                          },
                          {
                            label:
                              'Shares',
                            value:
                              c.shares?.toString() ??
                              '—',
                            icon: Repeat2,
                          },
                        ].map(
                          (m) => {

                            const Icon =
                              m.icon;

                            return (
                              <div
                                key={
                                  m.label
                                }
                                className="text-center"
                              >

                                <Icon className="mx-auto h-4 w-4 text-muted-foreground" />

                                <p className="mt-1 text-xs font-bold tabular-nums">
                                  {
                                    m.value
                                  }
                                </p>

                                <p className="text-[9px] text-muted-foreground">
                                  {
                                    m.label
                                  }
                                </p>

                              </div>
                            );
                          },
                        )}

                      </div>

                    </CardContent>

                  </Card>

                ),
              )}

          </div>

        </TabsContent>

      </Tabs>

      {/* ======================================================
          ADD / EDIT DIALOG
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
                ? 'Edit Content'
                : 'Schedule Content'}
            </DialogTitle>

          </DialogHeader>

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-4"
          >

            <div className="grid gap-4 sm:grid-cols-2">

              {/* ==================================================
                  PLATFORM
              ================================================== */}

              <div className="space-y-2">

                <Label>
                  Platform
                </Label>

                <Select
                  value={
                    form.platform
                  }
                  onValueChange={(
                    v,
                  ) =>
                    setForm({
                      ...form,
                      platform:
                        v,
                    })
                  }
                >

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>

                    {platformOptions.map(
                      (p) => (
                        <SelectItem
                          key={p}
                          value={p}
                        >
                          {p}
                        </SelectItem>
                      ),
                    )}

                  </SelectContent>

                </Select>

              </div>

              {/* ==================================================
                  STATUS
              ================================================== */}

              <div className="space-y-2">

                <Label>
                  Status
                </Label>

                <Select
                  value={
                    form.status
                  }
                  onValueChange={(
                    v,
                  ) =>
                    setForm({
                      ...form,
                      status:
                        v as ContentStatus,
                    })
                  }
                >

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>

                    {statuses.map(
                      (s) => (
                        <SelectItem
                          key={s}
                          value={s}
                        >
                          {s}
                        </SelectItem>
                      ),
                    )}

                  </SelectContent>

                </Select>

              </div>

              {/* ==================================================
                  CLIENT
              ================================================== */}

              <div className="space-y-2">

                <Label htmlFor="client">
                  Client
                </Label>

                <Input
                  id="client"
                  value={
                    form.client
                  }
                  onChange={(
                    e,
                  ) =>
                    setForm({
                      ...form,
                      client:
                        e.target.value,
                    })
                  }
                  required
                />

              </div>

              {/* ==================================================
                  SCHEDULED DATE
              ================================================== */}

              <div className="space-y-2">

                <Label htmlFor="scheduledDate">
                  Scheduled Date
                </Label>

                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={
                    form.scheduledDate
                  }
                  onChange={(
                    e,
                  ) =>
                    setForm({
                      ...form,
                      scheduledDate:
                        e.target.value,
                    })
                  }
                />

              </div>

              {/* ==================================================
                  DESIGNER
              ================================================== */}

              <div className="space-y-2">

                <Label>
                  Designer
                </Label>

                <Select
                  value={
                    form.designer ||
                    '__none__'
                  }
                  onValueChange={(
                    value,
                  ) =>
                    setForm({
                      ...form,
                      designer:
                        value ===
                        '__none__'
                          ? ''
                          : value,
                    })
                  }
                >

                  <SelectTrigger>

                    <SelectValue
                      placeholder={
                        teamLoading
                          ? 'Loading team...'
                          : 'Select designer'
                      }
                    />

                  </SelectTrigger>

                  <SelectContent>

                    <SelectItem value="__none__">
                      No designer
                    </SelectItem>

                    {teamLoading ? (

                      <SelectItem
                        value="__loading__"
                        disabled
                      >
                        Loading team members...
                      </SelectItem>

                    ) : team.length >
                      0 ? (

                      team.map(
                        (
                          member,
                        ) => (
                          <SelectItem
                            key={
                              member.id
                            }
                            value={
                              member.name
                            }
                          >
                            <div className="flex items-center gap-2">

                              <Avatar
                                initials={getInitials(
                                  member.name ||
                                    '',
                                )}
                                className="h-6 w-6 text-[9px]"
                              />

                              <div className="flex flex-col">

                                <span>
                                  {
                                    member.name
                                  }
                                </span>

                                {member.role && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {
                                      member.role
                                    }
                                  </span>
                                )}

                              </div>

                            </div>
                          </SelectItem>
                        ),
                      )

                    ) : (

                      <SelectItem
                        value="__empty__"
                        disabled
                      >
                        No team members found
                      </SelectItem>

                    )}

                    {/* Preserve old assigned designer */}
                    {!selectedDesignerExists &&
                      form.designer && (
                        <SelectItem
                          value={
                            form.designer
                          }
                        >
                          {
                            form.designer
                          }{' '}
                          (Current)
                        </SelectItem>
                      )}

                  </SelectContent>

                </Select>

              </div>

              {/* ==================================================
                  COPYWRITER
              ================================================== */}

              <div className="space-y-2">

                <Label>
                  Copywriter
                </Label>

                <Select
                  value={
                    form.copywriter ||
                    '__none__'
                  }
                  onValueChange={(
                    value,
                  ) =>
                    setForm({
                      ...form,
                      copywriter:
                        value ===
                        '__none__'
                          ? ''
                          : value,
                    })
                  }
                >

                  <SelectTrigger>

                    <SelectValue
                      placeholder={
                        teamLoading
                          ? 'Loading team...'
                          : 'Select copywriter'
                      }
                    />

                  </SelectTrigger>

                  <SelectContent>

                    <SelectItem value="__none__">
                      No copywriter
                    </SelectItem>

                    {teamLoading ? (

                      <SelectItem
                        value="__loading__"
                        disabled
                      >
                        Loading team members...
                      </SelectItem>

                    ) : team.length >
                      0 ? (

                      team.map(
                        (
                          member,
                        ) => (
                          <SelectItem
                            key={
                              member.id
                            }
                            value={
                              member.name
                            }
                          >
                            <div className="flex items-center gap-2">

                              <Avatar
                                initials={getInitials(
                                  member.name ||
                                    '',
                                )}
                                className="h-6 w-6 text-[9px]"
                              />

                              <div className="flex flex-col">

                                <span>
                                  {
                                    member.name
                                  }
                                </span>

                                {member.role && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {
                                      member.role
                                    }
                                  </span>
                                )}

                              </div>

                            </div>
                          </SelectItem>
                        ),
                      )

                    ) : (

                      <SelectItem
                        value="__empty__"
                        disabled
                      >
                        No team members found
                      </SelectItem>

                    )}

                    {/* Preserve old assigned copywriter */}
                    {!selectedCopywriterExists &&
                      form.copywriter && (
                        <SelectItem
                          value={
                            form.copywriter
                          }
                        >
                          {
                            form.copywriter
                          }{' '}
                          (Current)
                        </SelectItem>
                      )}

                  </SelectContent>

                </Select>

              </div>

            </div>

            {/* ==================================================
                CAPTION
            ================================================== */}

            <div className="space-y-2">

              <Label htmlFor="caption">
                Caption
              </Label>

              <Textarea
                id="caption"
                value={
                  form.caption
                }
                onChange={(
                  e,
                ) =>
                  setForm({
                    ...form,
                    caption:
                      e.target.value,
                  })
                }
                rows={3}
                required
              />

            </div>

            {/* ==================================================
                FOOTER
            ================================================== */}

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
                    : 'Schedule'}
              </Button>

            </DialogFooter>

          </form>

        </DialogContent>

      </Dialog>

    </DashboardShell>
  );
}