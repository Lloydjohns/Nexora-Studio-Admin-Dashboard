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
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';

import {
  DashboardShell,
  PageHeader,
} from '@/components/dashboard-shell';

import {
  KpiCard,
  Avatar,
  StatusBadge,
} from '@/components/shared';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Button,
} from '@/components/ui/button';

import {
  Input,
} from '@/components/ui/input';

import {
  Label,
} from '@/components/ui/label';

import {
  Badge,
} from '@/components/ui/badge';

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
  Slider,
} from '@/components/ui/slider';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import {
  fetchTeam,
  updateTeamMember,
  deleteTeamMember,
} from '@/lib/api';

import {
  useFetch,
} from '@/hooks/use-fetch';

import {
  toast,
} from 'sonner';

import {
  cn,
} from '@/lib/utils';

/* ============================================================
   OPTIONS
============================================================ */

const roleOptions = [
  'Admin',
  'Creative Director',
  'Designer',
  'Video Editor',
  'Copywriter',
  'Web Developer',
  'Social Media Manager',
];

const availabilityOptions = [
  'Available',
  'Busy',
  'On Leave',
] as const;

/* ============================================================
   MEMBER FORM
============================================================ */

interface MemberForm {
  name: string;
  role: string;
  email: string;
  password: string;
  activeProjects: string;
  tasksAssigned: string;
  tasksCompleted: string;
  availability: typeof availabilityOptions[number];
  utilization: number;
}

const emptyForm: MemberForm = {
  name: '',
  role: 'Admin',
  email: '',
  password: '',
  activeProjects: '0',
  tasksAssigned: '0',
  tasksCompleted: '0',
  availability: 'Available',
  utilization: 50,
};

/* ============================================================
   CREATED CREDENTIALS
============================================================ */

interface CreatedCredentials {
  name: string;
  email: string;
  password: string;
  dashboardUrl: string | null;
  emailSent: boolean;
  emailError: string | null;
}

/* ============================================================
   PAGE
============================================================ */

export default function TeamPage() {
  const [
    refreshKey,
    setRefreshKey,
  ] = React.useState(0);

  const {
    data: team,
    loading,
  } = useFetch(
    fetchTeam,
    [refreshKey],
  );

  const refetch = () =>
    setRefreshKey(
      (k) => k + 1,
    );

  /* ==========================================================
     DIALOG STATE
  ========================================================== */

  const [
    open,
    setOpen,
  ] = React.useState(false);

  const [
    credentialsOpen,
    setCredentialsOpen,
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
  ] = React.useState<MemberForm>(
    emptyForm,
  );

  const [
    showPassword,
    setShowPassword,
  ] = React.useState(false);

  const [
    showCreatedPassword,
    setShowCreatedPassword,
  ] = React.useState(false);

  const [
    copiedField,
    setCopiedField,
  ] = React.useState<string | null>(
    null,
  );

  const [
    createdCredentials,
    setCreatedCredentials,
  ] = React.useState<CreatedCredentials | null>(
    null,
  );

  /* ==========================================================
     DATA
  ========================================================== */

  const allMembers = team ?? [];

  /*
   * Members on leave are excluded from the average utilization.
   */
  const activeMembers =
    allMembers.filter(
      (member) =>
        member.availability !==
        'On Leave',
    );

  /* ==========================================================
     KPI CALCULATIONS
  ========================================================== */

  const totalProjects =
    allMembers.reduce(
      (total, member) =>
        total +
        (Number(
          member.activeProjects,
        ) || 0),
      0,
    );

  const totalTasks =
    allMembers.reduce(
      (total, member) =>
        total +
        (Number(
          member.tasksAssigned,
        ) || 0),
      0,
    );

  const avgUtilization =
    activeMembers.length > 0
      ? Math.round(
          activeMembers.reduce(
            (total, member) =>
              total +
              (Number(
                member.utilization,
              ) || 0),
            0,
          ) /
            activeMembers.length,
        )
      : 0;

  /* ==========================================================
     WORKLOAD DISTRIBUTION DATA
     
     IMPORTANT:
     This uses ALL team members.
     
     Available → shown
     Busy → shown
     On Leave → shown
     
     The visualization below does NOT depend on Recharts.
     It uses regular divs + Framer Motion, which makes it
     much more reliable inside the dashboard grid.
  ========================================================== */

  const utilizationData =
    React.useMemo(() => {
      if (
        !allMembers ||
        allMembers.length === 0
      ) {
        return [];
      }

      return allMembers
        .map((member) => {
          const rawUtilization =
            Number(
              member.utilization,
            ) || 0;

          const safeUtilization =
            Math.min(
              100,
              Math.max(
                0,
                rawUtilization,
              ),
            );

          return {
            id: member.id,

            name:
              member.name ||
              'Unknown',

            utilization:
              safeUtilization,

            availability:
              member.availability ||
              'Unknown',

            role:
              member.role ||
              'Team Member',

            activeProjects:
              Number(
                member.activeProjects,
              ) || 0,

            tasksAssigned:
              Number(
                member.tasksAssigned,
              ) || 0,
          };
        })
        .sort(
          (a, b) =>
            b.utilization -
            a.utilization,
        );
    }, [allMembers]);

  /* ==========================================================
     HELPERS
  ========================================================== */

  function getInitials(
    name: string,
  ) {
    return name
      .split(' ')
      .filter(Boolean)
      .map(
        (part) =>
          part[0],
      )
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  function getWorkloadColor(
    utilization: number,
  ) {
    if (utilization > 85) {
      return 'bg-rose-500';
    }

    if (utilization > 70) {
      return 'bg-amber-500';
    }

    return 'bg-emerald-500';
  }

  function getWorkloadTextColor(
    utilization: number,
  ) {
    if (utilization > 85) {
      return 'text-rose-600 dark:text-rose-400';
    }

    if (utilization > 70) {
      return 'text-amber-600 dark:text-amber-400';
    }

    return 'text-emerald-600 dark:text-emerald-400';
  }

  function getWorkloadLabel(
    utilization: number,
  ) {
    if (utilization > 85) {
      return 'High';
    }

    if (utilization > 70) {
      return 'Moderate';
    }

    return 'Healthy';
  }

  async function copyToClipboard(
    value: string,
    field: string,
  ) {
    try {
      await navigator.clipboard.writeText(
        value,
      );

      setCopiedField(field);

      toast.success(
        `${field} copied.`,
      );

      setTimeout(() => {
        setCopiedField(null);
      }, 1500);
    } catch {
      toast.error(
        'Unable to copy to clipboard.',
      );
    }
  }

  /* ==========================================================
     ADD MEMBER
  ========================================================== */

  function openAdd() {
    setEditId(null);

    setShowPassword(false);

    setForm({
      ...emptyForm,
    });

    setOpen(true);
  }

  /* ==========================================================
     EDIT MEMBER
  ========================================================== */

  function openEdit(
    id: string,
  ) {
    const member =
      allMembers.find(
        (item) =>
          item.id === id,
      );

    if (!member) {
      toast.error(
        'Team member not found.',
      );
      return;
    }

    setEditId(id);

    setShowPassword(false);

    setForm({
      name:
        member.name,

      role:
        member.role,

      email:
        member.email,

      password: '',

      activeProjects:
        String(
          member.activeProjects ?? 0,
        ),

      tasksAssigned:
        String(
          member.tasksAssigned ?? 0,
        ),

      tasksCompleted:
        String(
          member.tasksCompleted ?? 0,
        ),

      availability:
        member.availability,

      utilization:
        Number(
          member.utilization,
        ) || 0,
    });

    setOpen(true);
  }

  /* ==========================================================
     SAVE MEMBER
  ========================================================== */

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error(
        'Name is required.',
      );
      return;
    }

    if (!form.email.trim()) {
      toast.error(
        'Email is required.',
      );
      return;
    }

    if (
      !editId &&
      form.password.length < 8
    ) {
      toast.error(
        'Password must contain at least 8 characters.',
      );
      return;
    }

    setSubmitting(true);

    try {
      /* ======================================================
         EDIT
      ====================================================== */

      if (editId) {
        const payload = {
          name:
            form.name.trim(),

          role:
            form.role,

          email:
            form.email
              .trim()
              .toLowerCase(),

          active_projects:
            Number(
              form.activeProjects,
            ) || 0,

          tasks_assigned:
            Number(
              form.tasksAssigned,
            ) || 0,

          tasks_completed:
            Number(
              form.tasksCompleted,
            ) || 0,

          availability:
            form.availability,

          utilization:
            Number(
              form.utilization,
            ) || 0,
        };

        await updateTeamMember(
          editId,
          payload,
        );

        toast.success(
          'Team member updated successfully.',
        );

        setOpen(false);

        setEditId(null);

        setForm({
          ...emptyForm,
        });

        refetch();

        return;
      }

      /* ======================================================
         CREATE AUTH ACCOUNT
      ====================================================== */

      const response =
        await fetch(
          '/api/team/create-user',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              name:
                form.name.trim(),

              email:
                form.email
                  .trim()
                  .toLowerCase(),

              password:
                form.password,

              role:
                form.role,

              availability:
                form.availability,

              activeProjects:
                Number(
                  form.activeProjects,
                ) || 0,

              tasksAssigned:
                Number(
                  form.tasksAssigned,
                ) || 0,

              tasksCompleted:
                Number(
                  form.tasksCompleted,
                ) || 0,

              utilization:
                Number(
                  form.utilization,
                ) || 0,
            }),
          },
        );

      let result:
        | any
        | null = null;

      try {
        result =
          await response.json();
      } catch {
        result = null;
      }

      if (!response.ok) {
        throw new Error(
          result?.error ||
            'Failed to create team account.',
        );
      }

      /* ======================================================
         STORE CREATED CREDENTIALS
      ====================================================== */

      if (
        result?.credentials
      ) {
        setCreatedCredentials({
          name:
            result.credentials
              .name,

          email:
            result.credentials
              .email,

          password:
            result.credentials
              .password,

          dashboardUrl:
            result.dashboardUrl ??
            null,

          emailSent:
            Boolean(
              result.emailSent,
            ),

          emailError:
            result.emailError ??
            null,
        });

        setShowCreatedPassword(
          false,
        );

        setCredentialsOpen(
          true,
        );
      }

      /* ======================================================
         CLOSE FORM
      ====================================================== */

      setOpen(false);

      setEditId(null);

      setForm({
        ...emptyForm,
      });

      setShowPassword(false);

      refetch();

      if (
        result?.emailSent
      ) {
        toast.success(
          'Team account created and email sent.',
        );
      } else {
        toast.warning(
          'Team account created, but the email was not sent.',
          {
            description:
              result?.emailError ||
              'Check your Resend configuration.',
          },
        );
      }
    } catch (
      error: any
    ) {
      console.error(
        'Team member save error:',
        error,
      );

      toast.error(
        'Failed to save team member.',
        {
          description:
            error?.message ||
            'Something went wrong while saving the team member.',
        },
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ==========================================================
     DELETE MEMBER
  ========================================================== */

  async function handleDelete(
    id: string,
  ) {
    const confirmed =
      window.confirm(
        'Remove this team member?',
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTeamMember(
        id,
      );

      toast.success(
        'Team member removed.',
      );

      if (
        editId === id
      ) {
        setOpen(false);

        setEditId(null);

        setForm({
          ...emptyForm,
        });
      }

      refetch();
    } catch (
      error: any
    ) {
      console.error(
        'Team member delete error:',
        error,
      );

      toast.error(
        'Failed to remove team member.',
        {
          description:
            error?.message ||
            'Something went wrong while removing the team member.',
        },
      );
    }
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <DashboardShell>
      <PageHeader
        title="Team Management"
        description="Track workload, availability, and performance across the team"
      >
        <Button
          size="sm"
          onClick={openAdd}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Member
        </Button>
      </PageHeader>

      {/* ======================================================
         KPI
      ====================================================== */}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Team Members"
          value={String(
            allMembers.length,
          )}
          icon={UsersRound}
          index={0}
        />

        <KpiCard
          label="Active Projects"
          value={String(
            totalProjects,
          )}
          delta="+3"
          trend="up"
          icon={Briefcase}
          accent="text-amber-600 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400"
          index={1}
        />

        <KpiCard
          label="Tasks Assigned"
          value={String(
            totalTasks,
          )}
          delta="+8"
          trend="up"
          icon={CheckSquare}
          accent="text-blue-600 bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400"
          index={2}
        />

        <KpiCard
          label="Avg Utilization"
          value={`${avgUtilization}%`}
          delta="+4%"
          trend="up"
          icon={TrendingUp}
          accent="text-violet-600 bg-violet-100 dark:bg-violet-500/15 dark:text-violet-400"
          index={3}
        />
      </div>

      {/* ======================================================
         TEAM + WORKLOAD
      ====================================================== */}

      <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-3">

        {/* ====================================================
           TEAM MEMBERS
        ==================================================== */}

        <Card className="min-w-0 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Team Members
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    Member
                  </TableHead>

                  <TableHead>
                    Role
                  </TableHead>

                  <TableHead className="text-center">
                    Projects
                  </TableHead>

                  <TableHead className="text-center">
                    Tasks
                  </TableHead>

                  <TableHead>
                    Workload
                  </TableHead>

                  <TableHead>
                    Availability
                  </TableHead>

                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  Array.from({
                    length: 4,
                  }).map(
                    (_, index) => (
                      <TableRow
                        key={
                          index
                        }
                      >
                        {Array.from({
                          length: 7,
                        }).map(
                          (
                            __,
                            cellIndex,
                          ) => (
                            <TableCell
                              key={
                                cellIndex
                              }
                            >
                              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                            </TableCell>
                          ),
                        )}
                      </TableRow>
                    ),
                  )
                ) : allMembers.length ===
                  0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      No team members found.
                    </TableCell>
                  </TableRow>
                ) : (
                  allMembers.map(
                    (
                      member,
                      index,
                    ) => (
                      <motion.tr
                        key={
                          member.id
                        }
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        transition={{
                          delay:
                            index *
                            0.03,
                        }}
                        className="cursor-pointer border-b transition-colors hover:bg-muted/50"
                        onClick={() =>
                          openEdit(
                            member.id,
                          )
                        }
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              initials={getInitials(
                                member.name,
                              )}
                              className="h-9 w-9"
                            />

                            <div>
                              <p className="text-sm font-medium">
                                {
                                  member.name
                                }
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {
                                  member.email
                                }
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[10px]"
                          >
                            {
                              member.role
                            }
                          </Badge>
                        </TableCell>

                        <TableCell className="text-center tabular-nums">
                          {
                            member.activeProjects
                          }
                        </TableCell>

                        <TableCell className="text-center tabular-nums">
                          {
                            member.tasksAssigned
                          }
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                              <div
                                className={cn(
                                  'h-full rounded-full',
                                  getWorkloadColor(
                                    Number(
                                      member.utilization,
                                    ) || 0,
                                  ),
                                )}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      Number(
                                        member.utilization,
                                      ) ||
                                        0,
                                    ),
                                  )}%`,
                                }}
                              />
                            </div>

                            <span className="text-xs tabular-nums text-muted-foreground">
                              {
                                member.utilization
                              }%
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <StatusBadge
                            status={
                              member.availability
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={(
                              event,
                            ) => {
                              event.stopPropagation();

                              handleDelete(
                                member.id,
                              );
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-rose-500" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ),
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ====================================================
           WORKLOAD DISTRIBUTION
        ==================================================== */}

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">
                Workload Distribution
              </CardTitle>

              {!loading &&
                utilizationData.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-[10px]"
                  >
                    {utilizationData.length}{' '}
                    {utilizationData.length ===
                    1
                      ? 'Member'
                      : 'Members'}
                  </Badge>
                )}
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-5 py-4">
                {Array.from({
                  length: 4,
                }).map(
                  (_, index) => (
                    <div
                      key={
                        index
                      }
                      className="space-y-2"
                    >
                      <div className="flex justify-between">
                        <div className="h-3 w-24 animate-pulse rounded bg-muted" />

                        <div className="h-3 w-10 animate-pulse rounded bg-muted" />
                      </div>

                      <div className="h-2.5 w-full animate-pulse rounded-full bg-muted" />
                    </div>
                  ),
                )}
              </div>
            ) : utilizationData.length ===
              0 ? (
              <div className="flex min-h-[280px] items-center justify-center text-center text-sm text-muted-foreground">
                <div>
                  <p>
                    No workload data available.
                  </p>

                  <p className="mt-1 text-xs">
                    Add a team member or update
                    utilization to see workload.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5 py-2">
                {utilizationData.map(
                  (
                    member,
                  ) => {
                    const utilization =
                      Math.min(
                        100,
                        Math.max(
                          0,
                          Number(
                            member.utilization,
                          ) || 0,
                        ),
                      );

                    return (
                      <div
                        key={
                          member.id
                        }
                        className="space-y-2"
                      >
                        {/* MEMBER HEADER */}

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <Avatar
                              initials={getInitials(
                                member.name,
                              )}
                              className="h-8 w-8 shrink-0"
                            />

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {
                                  member.name
                                }
                              </p>

                              <p className="truncate text-[10px] text-muted-foreground">
                                {
                                  member.role
                                }
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p
                              className={cn(
                                'text-sm font-semibold tabular-nums',
                                getWorkloadTextColor(
                                  utilization,
                                ),
                              )}
                            >
                              {
                                utilization
                              }%
                            </p>

                            <p className="text-[10px] text-muted-foreground">
                              {
                                getWorkloadLabel(
                                  utilization,
                                )
                              }
                            </p>
                          </div>
                        </div>

                        {/* PROGRESS BAR */}

                        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
                          <motion.div
                            initial={{
                              width: 0,
                            }}
                            animate={{
                              width: `${utilization}%`,
                            }}
                            transition={{
                              duration:
                                0.6,
                              ease: 'easeOut',
                            }}
                            className={cn(
                              'h-full rounded-full',
                              getWorkloadColor(
                                utilization,
                              ),
                            )}
                          />
                        </div>

                        {/* DETAILS */}

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>
                            {
                              member.activeProjects
                            }{' '}
                            {member.activeProjects ===
                            1
                              ? 'project'
                              : 'projects'}
                          </span>

                          <span>
                            {
                              member.tasksAssigned
                            }{' '}
                            {member.tasksAssigned ===
                            1
                              ? 'task'
                              : 'tasks'}
                          </span>

                          <span>
                            {
                              member.availability
                            }
                          </span>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}

            {/* LEGEND */}

            {!loading &&
              utilizationData.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />

                      <span className="text-[10px] text-muted-foreground">
                        Healthy ≤ 70%
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />

                      <span className="text-[10px] text-muted-foreground">
                        Moderate 71–85%
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />

                      <span className="text-[10px] text-muted-foreground">
                        High &gt; 85%
                      </span>
                    </div>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      {/* ======================================================
         PERFORMANCE SUMMARY
      ====================================================== */}

      <div className="mt-4">
        <h3 className="mb-3 text-sm font-semibold">
          Performance Summary
        </h3>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {allMembers.map(
            (
              member,
            ) => (
              <Card
                key={
                  member.id
                }
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() =>
                  openEdit(
                    member.id,
                  )
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      initials={getInitials(
                        member.name,
                      )}
                      className="h-10 w-10"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {
                          member.name
                        }
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {
                          member.role
                        }
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold tabular-nums">
                        {
                          member.tasksCompleted
                        }
                      </p>

                      <p className="text-[10px] text-muted-foreground">
                        Completed
                      </p>
                    </div>

                    <div>
                      <p className="text-lg font-bold tabular-nums">
                        {
                          member.activeProjects
                        }
                      </p>

                      <p className="text-[10px] text-muted-foreground">
                        Projects
                      </p>
                    </div>

                    <div>
                      <p className="text-lg font-bold tabular-nums">
                        {
                          member.utilization
                        }
                        %
                      </p>

                      <p className="text-[10px] text-muted-foreground">
                        Utilization
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      </div>

      {/* ======================================================
         ADD / EDIT DIALOG
      ====================================================== */}

      <Dialog
        open={open}
        onOpenChange={(
          value,
        ) => {
          setOpen(value);

          if (!value) {
            setEditId(null);

            setForm({
              ...emptyForm,
            });

            setShowPassword(false);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editId
                ? 'Edit Team Member'
                : 'Add Team Member'}
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
                <Label htmlFor="team-name">
                  Name
                </Label>

                <Input
                  id="team-name"
                  value={
                    form.name
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      name:
                        event
                          .target
                          .value,
                    })
                  }
                  placeholder="Juan Dela Cruz"
                  required
                />
              </div>

              {/* EMAIL */}

              <div className="space-y-2">
                <Label htmlFor="team-email">
                  Email
                </Label>

                <Input
                  id="team-email"
                  type="email"
                  value={
                    form.email
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      email:
                        event
                          .target
                          .value,
                    })
                  }
                  placeholder="member@nexorastudio.ph"
                  required
                />
              </div>

              {/* PASSWORD */}

              {!editId && (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="team-password">
                    Initial Password
                  </Label>

                  <div className="relative">
                    <Input
                      id="team-password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      value={
                        form.password
                      }
                      onChange={(
                        event,
                      ) =>
                        setForm({
                          ...form,
                          password:
                            event
                              .target
                              .value,
                        })
                      }
                      placeholder="Create initial password"
                      minLength={8}
                      required
                      className="pr-10"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10"
                      onClick={() =>
                        setShowPassword(
                          (
                            value,
                          ) =>
                            !value,
                        )
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    Minimum 8 characters.
                    You can click the eye icon
                    to see the password you created.
                  </p>
                </div>
              )}

              {/* ROLE */}

              <div className="space-y-2">
                <Label>
                  Role
                </Label>

                <Select
                  value={
                    form.role
                  }
                  onValueChange={(
                    value,
                  ) =>
                    setForm({
                      ...form,
                      role:
                        value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {roleOptions.map(
                      (
                        role,
                      ) => (
                        <SelectItem
                          key={
                            role
                          }
                          value={
                            role
                          }
                        >
                          {
                            role
                          }
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* AVAILABILITY */}

              <div className="space-y-2">
                <Label>
                  Availability
                </Label>

                <Select
                  value={
                    form.availability
                  }
                  onValueChange={(
                    value,
                  ) =>
                    setForm({
                      ...form,
                      availability:
                        value as MemberForm['availability'],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {availabilityOptions.map(
                      (
                        availability,
                      ) => (
                        <SelectItem
                          key={
                            availability
                          }
                          value={
                            availability
                          }
                        >
                          {
                            availability
                          }
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* ACTIVE PROJECTS */}

              <div className="space-y-2">
                <Label htmlFor="active-projects">
                  Active Projects
                </Label>

                <Input
                  id="active-projects"
                  type="number"
                  min="0"
                  value={
                    form.activeProjects
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      activeProjects:
                        event
                          .target
                          .value,
                    })
                  }
                />
              </div>

              {/* TASKS ASSIGNED */}

              <div className="space-y-2">
                <Label htmlFor="tasks-assigned">
                  Tasks Assigned
                </Label>

                <Input
                  id="tasks-assigned"
                  type="number"
                  min="0"
                  value={
                    form.tasksAssigned
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      tasksAssigned:
                        event
                          .target
                          .value,
                    })
                  }
                />
              </div>

              {/* TASKS COMPLETED */}

              <div className="space-y-2">
                <Label htmlFor="tasks-completed">
                  Tasks Completed
                </Label>

                <Input
                  id="tasks-completed"
                  type="number"
                  min="0"
                  value={
                    form.tasksCompleted
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      tasksCompleted:
                        event
                          .target
                          .value,
                    })
                  }
                />
              </div>

              {/* UTILIZATION */}

              <div className="space-y-2 sm:col-span-2">
                <Label>
                  Utilization:{' '}
                  {
                    form.utilization
                  }
                  %
                </Label>

                <Slider
                  value={[
                    form.utilization,
                  ]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(
                    values,
                  ) =>
                    setForm({
                      ...form,
                      utilization:
                        values[0] ??
                        0,
                    })
                  }
                />

                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* ==================================================
               FOOTER
            ================================================== */}

            <DialogFooter>
              {editId && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={async () => {
                    const id =
                      editId;

                    if (!id) {
                      return;
                    }

                    await handleDelete(
                      id,
                    );
                  }}
                  className="mr-auto"
                  disabled={
                    submitting
                  }
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);

                  setEditId(null);

                  setForm({
                    ...emptyForm,
                  });

                  setShowPassword(
                    false,
                  );
                }}
                disabled={
                  submitting
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
                  ? editId
                    ? 'Updating...'
                    : 'Creating...'
                  : editId
                    ? 'Update Member'
                    : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================
         CREATED ACCOUNT / CREDENTIALS DIALOG
      ====================================================== */}

      <Dialog
        open={
          credentialsOpen
        }
        onOpenChange={(
          value,
        ) => {
          setCredentialsOpen(
            value,
          );

          if (!value) {
            setCreatedCredentials(
              null,
            );

            setShowCreatedPassword(
              false,
            );
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Account Created Successfully
            </DialogTitle>
          </DialogHeader>

          {createdCredentials && (
            <div className="space-y-5">

              {/* SUCCESS MESSAGE */}

              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium">
                  {
                    createdCredentials.name
                  }
                  's account is ready.
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  The credentials below are the
                  initial login credentials you created.
                </p>
              </div>

              {/* EMAIL STATUS */}

              {createdCredentials.emailSent ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" />

                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      Email sent successfully
                    </p>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    The team member has been sent
                    their account credentials.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Account created, but email was not sent.
                  </p>

                  {createdCredentials.emailError && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {
                        createdCredentials.emailError
                      }
                    </p>
                  )}
                </div>
              )}

              {/* EMAIL */}

              <div className="space-y-2">
                <Label>
                  Email
                </Label>

                <div className="flex gap-2">
                  <Input
                    value={
                      createdCredentials.email
                    }
                    readOnly
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      copyToClipboard(
                        createdCredentials.email,
                        'Email',
                      )
                    }
                  >
                    {copiedField ===
                    'Email' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* PASSWORD */}

              <div className="space-y-2">
                <Label>
                  Initial Password
                </Label>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={
                        showCreatedPassword
                          ? 'text'
                          : 'password'
                      }
                      value={
                        createdCredentials.password
                      }
                      readOnly
                      className="pr-10"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10"
                      onClick={() =>
                        setShowCreatedPassword(
                          (
                            value,
                          ) =>
                            !value,
                        )
                      }
                    >
                      {showCreatedPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      copyToClipboard(
                        createdCredentials.password,
                        'Password',
                      )
                    }
                  >
                    {copiedField ===
                    'Password' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  This password is not stored in the
                  team_members table.
                </p>
              </div>

              {/* DASHBOARD */}

              {createdCredentials.dashboardUrl && (
                <div className="space-y-2">
                  <Label>
                    Dashboard
                  </Label>

                  <Button
                    type="button"
                    className="w-full"
                    onClick={() =>
                      window.open(
                        createdCredentials.dashboardUrl!,
                        '_blank',
                        'noopener,noreferrer',
                      )
                    }
                  >
                    Open Nexora Dashboard
                  </Button>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => {
                    setCredentialsOpen(
                      false,
                    );

                    setCreatedCredentials(
                      null,
                    );

                    setShowCreatedPassword(
                      false,
                    );
                  }}
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}