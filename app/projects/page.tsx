'use client';

import * as React from 'react';
import {
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  FolderKanban,
  TrendingUp,
  Clock,
  AlertCircle,
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
  PriorityBadge,
  ProgressBar,
} from '@/components/shared';

import {
  Card,
  CardContent,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

import { Slider } from '@/components/ui/slider';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import {
  fetchProjects,
  insertProject,
  updateProject,
  deleteProject,
} from '@/lib/api';

import {
  type ProjectStage,
} from '@/lib/data';

import {
  useFetch,
} from '@/hooks/use-fetch';

import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/* ============================================================
   STAGES
============================================================ */

const stages: ProjectStage[] = [
  'Discovery',
  'Planning',
  'Content Creation',
  'Design',
  'Development',
  'Review',
  'Client Approval',
  'Completed',
];

const stageAccent: Record<
  string,
  string
> = {
  Discovery: 'bg-blue-500',
  Planning: 'bg-indigo-500',
  'Content Creation':
    'bg-violet-500',
  Design: 'bg-purple-500',
  Development: 'bg-amber-500',
  Review: 'bg-orange-500',
  'Client Approval':
    'bg-teal-500',
  Completed: 'bg-emerald-500',
};

const serviceTypeOptions = [
  'Social Media',
  'Web Development',
  'Web + Systems',
  'Social + Design',
  'Design',
  'Social + Strategy',
];

const priorityOptions = [
  'Low',
  'Medium',
  'High',
] as const;

/* ============================================================
   PROJECT FORM
============================================================ */

interface ProjectForm {
  name: string;
  client: string;
  client_id: string | null;
  serviceType: string;
  stage: ProjectStage;
  progress: number;
  deadline: string;
  team: string;
  priority:
    | 'Low'
    | 'Medium'
    | 'High';
}

function getDefaultDeadline() {
  return new Date(
    Date.now() +
      14 * 86400000,
  )
    .toISOString()
    .split('T')[0];
}

const emptyForm: ProjectForm = {
  name: '',
  client: '',
  client_id: null,
  serviceType:
    'Social Media',
  stage: 'Discovery',
  progress: 0,
  deadline:
    getDefaultDeadline(),
  team: '',
  priority: 'Medium',
};

function getInitials(
  name: string,
) {
  return name
    .split(/\s+/)
    .map(
      (part) => part[0],
    )
    .join('')
    .slice(0, 2);
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function ProjectsPage() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const clientId =
    searchParams.get(
      'clientId',
    );

  const clientName =
    searchParams.get(
      'client',
    ) || '';

  const [
    refreshKey,
    setRefreshKey,
  ] = React.useState(0);

  const {
    data: projects,
    loading,
  } = useFetch(
    fetchProjects,
    [refreshKey],
  );

  function refetch() {
    setRefreshKey(
      (key) => key + 1,
    );
  }

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
  ] = React.useState<ProjectForm>(
    emptyForm,
  );

  const [
    initializedFromClient,
    setInitializedFromClient,
  ] = React.useState(false);

  const allProjects =
    projects ?? [];

  /* ============================================================
     KPIs
  ============================================================ */

  const inProgress =
    allProjects.filter(
      (project) =>
        project.stage !==
        'Completed',
    ).length;

  const completed =
    allProjects.filter(
      (project) =>
        project.stage ===
        'Completed',
    ).length;

  const highPriority =
    allProjects.filter(
      (project) =>
        project.priority ===
          'High' &&
        project.stage !==
          'Completed',
    ).length;

  /* ============================================================
     AUTO OPEN NEW PROJECT
     
     THIS IS THE IMPORTANT FIX.
     
     When coming from:
     
     /projects?clientId=C-001&client=Bloom%20Skincare
     
     automatically:
     
     1. puts Bloom Skincare in Client
     2. stores C-001 in client_id
     3. opens New Project dialog
  ============================================================ */

  React.useEffect(() => {
    if (
      initializedFromClient
    ) {
      return;
    }

    if (
      clientId &&
      clientName
    ) {
      setEditId(null);

      setForm({
        ...emptyForm,
        client:
          clientName,
        client_id:
          clientId,
        deadline:
          getDefaultDeadline(),
      });

      setOpen(true);

      setInitializedFromClient(
        true,
      );
    }
  }, [
    clientId,
    clientName,
    initializedFromClient,
  ]);

  /* ============================================================
     ADD PROJECT
  ============================================================ */

  function openAdd() {
    setEditId(null);

    setForm({
      ...emptyForm,
      client:
        clientName || '',
      client_id:
        clientId || null,
      deadline:
        getDefaultDeadline(),
    });

    setOpen(true);
  }

  /* ============================================================
     EDIT PROJECT
  ============================================================ */

  function openEdit(
    id: string,
  ) {
    const project =
      allProjects.find(
        (item) =>
          item.id === id,
      );

    if (!project) {
      toast.error(
        'Project not found.',
      );
      return;
    }

    setEditId(id);

    setForm({
      name:
        project.name || '',
      client:
        project.client || '',
      client_id:
        project.client_id ??
        null,
      serviceType:
        project.serviceType ||
        'Social Media',
      stage:
        project.stage ||
        'Discovery',
      progress:
        Number(
          project.progress,
        ) || 0,
      deadline:
        project.deadline ||
        getDefaultDeadline(),
      team:
        Array.isArray(
          project.team,
        )
          ? project.team.join(
              ', ',
            )
          : '',
      priority:
        project.priority ||
        'Medium',
    });

    setOpen(true);
  }

  /* ============================================================
     SAVE PROJECT
  ============================================================ */

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error(
        'Project name is required.',
      );
      return;
    }

    if (!form.client.trim()) {
      toast.error(
        'Client is required.',
      );
      return;
    }

    /*
     * A NEW project created from a client must have client_id.
     */
    if (
      !editId &&
      !form.client_id
    ) {
      toast.error(
        'Client connection is missing.',
        {
          description:
            'Please create the project from the client workspace.',
        },
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name:
          form.name.trim(),

        client:
          form.client.trim(),

        /*
         * REAL DATABASE RELATIONSHIP
         */
        client_id:
          form.client_id,

        service_type:
          form.serviceType,

        stage:
          form.stage,

        progress:
          Number(
            form.progress,
          ) || 0,

        deadline:
          form.deadline,

        team:
          form.team
            .split(',')
            .map(
              (member) =>
                member.trim(),
            )
            .filter(
              Boolean,
            ),

        priority:
          form.priority,
      };

      if (editId) {
        /*
         * UPDATE
         */
        const updated =
          await updateProject(
            editId,
            payload,
          );

        toast.success(
          'Project updated successfully.',
        );

        /*
         * Keep the updated data
         * in the form.
         */
        setForm({
          name:
            updated.name ||
            '',
          client:
            updated.client ||
            '',
          client_id:
            updated.client_id ??
            null,
          serviceType:
            updated.serviceType ||
            'Social Media',
          stage:
            updated.stage ||
            'Discovery',
          progress:
            Number(
              updated.progress,
            ) || 0,
          deadline:
            updated.deadline ||
            '',
          team:
            Array.isArray(
              updated.team,
            )
              ? updated.team.join(
                  ', ',
                )
              : '',
          priority:
            updated.priority ||
            'Medium',
        });
      } else {
        /*
         * CREATE
         */
        const created =
          await insertProject(
            payload,
          );

        toast.success(
          'Project created successfully.',
          {
            description:
              `${created.name} is connected to ${created.client}.`,
          },
        );

        /*
         * After creating, immediately
         * open the Project File page.
         *
         * Example:
         * /projects/P-311
         */
        if (
          created?.id
        ) {
          setOpen(false);
          setEditId(null);

          refetch();

          router.push(
            `/projects/${encodeURIComponent(
              String(
                created.id,
              ),
            )}`,
          );

          return;
        }
      }

      setOpen(false);
      setEditId(null);

      refetch();
    } catch (
      error: any
    ) {
      console.error(
        'Project save error:',
        error,
      );

      toast.error(
        'Failed to save project.',
        {
          description:
            error?.message ||
            'Something went wrong while saving the project.',
        },
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ============================================================
     DELETE PROJECT
  ============================================================ */

  async function handleDelete(
    id: string,
  ) {
    if (!id) {
      toast.error(
        'Project ID is missing.',
      );
      return;
    }

    const project =
      allProjects.find(
        (item) =>
          item.id === id,
      );

    const confirmed =
      window.confirm(
        `Delete ${
          project?.name ||
          'this project'
        }?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProject(id);

      toast.success(
        'Project deleted successfully.',
      );

      /*
       * If deleting from the dialog,
       * close it.
       */
      setOpen(false);
      setEditId(null);

      refetch();
    } catch (
      error: any
    ) {
      console.error(
        'Project delete error:',
        error,
      );

      toast.error(
        'Failed to delete project.',
        {
          description:
            error?.message ||
            'Something went wrong while deleting the project.',
        },
      );
    }
  }

  /* ============================================================
     OPEN PROJECT FILE
  ============================================================ */

  function openProjectFile(
    id: string,
  ) {
    if (!id) {
      toast.error(
        'Project ID is missing.',
      );
      return;
    }

    router.push(
      `/projects/${encodeURIComponent(
        id,
      )}`,
    );
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <DashboardShell>
      <PageHeader
        title="Projects"
        description="Track project delivery across all stages"
      >
        <Button
          size="sm"
          onClick={
            openAdd
          }
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New Project
        </Button>
      </PageHeader>

      {/* ======================================================
         CONNECTED CLIENT NOTICE
      ====================================================== */}

      {clientId &&
        clientName && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div>
              <p className="text-sm font-medium">
                Creating project for{' '}
                {clientName}
              </p>

              <p className="text-xs text-muted-foreground">
                Client ID:{' '}
                {clientId}
              </p>
            </div>

            <Badge variant="secondary">
              Connected
            </Badge>
          </div>
        )}

      {/* ======================================================
         KPIs
      ====================================================== */}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total Projects"
          value={String(
            allProjects.length,
          )}
          icon={
            FolderKanban
          }
          index={0}
        />

        <KpiCard
          label="In Progress"
          value={String(
            inProgress,
          )}
          delta="+3"
          trend="up"
          icon={
            TrendingUp
          }
          accent="text-amber-600 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400"
          index={1}
        />

        <KpiCard
          label="Completed"
          value={String(
            completed,
          )}
          delta="+1"
          trend="up"
          icon={Clock}
          accent="text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400"
          index={2}
        />

        <KpiCard
          label="High Priority"
          value={String(
            highPriority,
          )}
          icon={
            AlertCircle
          }
          accent="text-rose-600 bg-rose-100 dark:bg-rose-500/15 dark:text-rose-400"
          index={3}
        />
      </div>

      {/* ======================================================
         TABS
      ====================================================== */}

      <Tabs
        defaultValue="board"
        className="mt-6"
      >
        <TabsList>
          <TabsTrigger value="board">
            Kanban Board
          </TabsTrigger>

          <TabsTrigger value="list">
            List View
          </TabsTrigger>
        </TabsList>

        {/* ====================================================
           KANBAN
        ==================================================== */}

        <TabsContent
          value="board"
          className="mt-4"
        >
          {loading ? (
            <div className="flex gap-3 overflow-x-auto pb-4">
              {stages.map(
                (stage) => (
                  <div
                    key={
                      stage
                    }
                    className="w-72 shrink-0 space-y-2"
                  >
                    <div className="h-8 animate-pulse rounded bg-muted" />

                    {Array.from({
                      length: 2,
                    }).map(
                      (
                        _,
                        index,
                      ) => (
                        <div
                          key={
                            index
                          }
                          className="h-24 animate-pulse rounded-lg bg-muted"
                        />
                      ),
                    )}
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-4">
              {stages.map(
                (stage) => {
                  const stageProjects =
                    allProjects.filter(
                      (project) =>
                        project.stage ===
                        stage,
                    );

                  return (
                    <div
                      key={
                        stage
                      }
                      className="w-72 shrink-0"
                    >
                      <div className="mb-2 flex items-center gap-2 px-1">
                        <span
                          className={cn(
                            'h-2.5 w-2.5 rounded-full',
                            stageAccent[
                              stage
                            ],
                          )}
                        />

                        <p className="text-sm font-semibold">
                          {
                            stage
                          }
                        </p>

                        <Badge
                          variant="secondary"
                          className="ml-auto text-[10px]"
                        >
                          {
                            stageProjects.length
                          }
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {stageProjects.map(
                          (
                            project,
                            index,
                          ) => (
                            <motion.div
                              key={
                                project.id
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
                                  index *
                                  0.05,
                              }}
                            >
                              <Card
                                className="cursor-pointer transition-shadow hover:shadow-md"
                                onClick={() =>
                                  openProjectFile(
                                    project.id,
                                  )
                                }
                              >
                                <CardContent className="p-3.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-semibold leading-snug">
                                      {
                                        project.name
                                      }
                                    </p>

                                    <Trash2
                                      className="h-3.5 w-3.5 shrink-0 cursor-pointer text-muted-foreground hover:text-rose-500"
                                      onClick={(
                                        event,
                                      ) => {
                                        event.stopPropagation();

                                        handleDelete(
                                          project.id,
                                        );
                                      }}
                                    />
                                  </div>

                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {
                                      project.client
                                    }
                                  </p>

                                  <div className="mt-2.5">
                                    <ProgressBar
                                      value={
                                        Number(
                                          project.progress,
                                        ) ||
                                        0
                                      }
                                    />
                                  </div>

                                  <div className="mt-3 flex items-center justify-between">
                                    <div className="flex -space-x-1.5">
                                      {Array.isArray(
                                        project.team,
                                      ) &&
                                        project.team
                                          .slice(
                                            0,
                                            3,
                                          )
                                          .map(
                                            (
                                              member,
                                            ) => (
                                              <Avatar
                                                key={
                                                  member
                                                }
                                                initials={getInitials(
                                                  member,
                                                )}
                                                className="h-6 w-6 border-2 border-card text-[9px]"
                                              />
                                            ),
                                          )}

                                      {Array.isArray(
                                        project.team,
                                      ) &&
                                        project.team.length >
                                          3 && (
                                          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] font-medium">
                                            +
                                            {
                                              project.team.length -
                                              3
                                            }
                                          </div>
                                        )}
                                    </div>

                                    <PriorityBadge
                                      priority={
                                        project.priority
                                      }
                                    />
                                  </div>

                                  <div className="mt-2.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <Clock className="h-3 w-3" />

                                    Due{' '}
                                    {
                                      project.deadline
                                    }
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ),
                        )}

                        {stageProjects.length ===
                          0 && (
                          <div className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
                            Empty
                          </div>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </TabsContent>

        {/* ====================================================
           LIST
        ==================================================== */}

        <TabsContent
          value="list"
          className="mt-4"
        >
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    Project
                  </TableHead>

                  <TableHead>
                    Client
                  </TableHead>

                  <TableHead>
                    Stage
                  </TableHead>

                  <TableHead className="w-32">
                    Progress
                  </TableHead>

                  <TableHead>
                    Team
                  </TableHead>

                  <TableHead>
                    Priority
                  </TableHead>

                  <TableHead>
                    Deadline
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  Array.from({
                    length: 4,
                  }).map(
                    (_, rowIndex) => (
                      <TableRow
                        key={
                          rowIndex
                        }
                      >
                        {Array.from({
                          length: 7,
                        }).map(
                          (
                            _,
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
                ) : (
                  allProjects.map(
                    (project) => (
                      <TableRow
                        key={
                          project.id
                        }
                        className="cursor-pointer"
                        onClick={() =>
                          openProjectFile(
                            project.id,
                          )
                        }
                      >
                        <TableCell className="font-medium">
                          {
                            project.name
                          }
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {
                            project.client
                          }
                        </TableCell>

                        <TableCell>
                          <StatusBadge
                            status={
                              project.stage
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <ProgressBar
                            value={
                              Number(
                                project.progress,
                              ) ||
                              0
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <div className="flex -space-x-1.5">
                            {Array.isArray(
                              project.team,
                            ) &&
                              project.team
                                .slice(
                                  0,
                                  3,
                                )
                                .map(
                                  (
                                    member,
                                  ) => (
                                    <Avatar
                                      key={
                                        member
                                      }
                                      initials={getInitials(
                                        member,
                                      )}
                                      className="h-6 w-6 border-2 border-card text-[9px]"
                                    />
                                  ),
                                )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <PriorityBadge
                            priority={
                              project.priority
                            }
                          />
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {
                            project.deadline
                          }
                        </TableCell>
                      </TableRow>
                    ),
                  )
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ======================================================
         PROJECT DIALOG
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
                ? 'Edit Project'
                : 'New Project'}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="project-name">
                Project Name
              </Label>

              <Input
                id="project-name"
                value={
                  form.name
                }
                onChange={(
                  event,
                ) =>
                  setForm({
                    ...form,
                    name:
                      event.target
                        .value,
                  })
                }
                placeholder="Bloom Skincare Website"
                required
              />
            </div>

            {/* ==================================================
               CLIENT
            ================================================== */}

            <div className="space-y-2">
              <Label htmlFor="project-client">
                Client
              </Label>

              <Input
                id="project-client"
                value={
                  form.client
                }
                onChange={(
                  event,
                ) =>
                  setForm({
                    ...form,
                    client:
                      event.target
                        .value,
                  })
                }
                required
              />

              {form.client_id ? (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  ✓ Connected to
                  client{' '}
                  {
                    form.client_id
                  }
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Create this project
                  from a client
                  workspace to
                  establish the
                  relationship.
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Service Type
                </Label>

                <Select
                  value={
                    form.serviceType
                  }
                  onValueChange={(
                    value,
                  ) =>
                    setForm({
                      ...form,
                      serviceType:
                        value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {serviceTypeOptions.map(
                      (
                        service,
                      ) => (
                        <SelectItem
                          key={
                            service
                          }
                          value={
                            service
                          }
                        >
                          {
                            service
                          }
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Stage
                </Label>

                <Select
                  value={
                    form.stage
                  }
                  onValueChange={(
                    value,
                  ) =>
                    setForm({
                      ...form,
                      stage:
                        value as ProjectStage,
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

              <div className="space-y-2">
                <Label>
                  Priority
                </Label>

                <Select
                  value={
                    form.priority
                  }
                  onValueChange={(
                    value,
                  ) =>
                    setForm({
                      ...form,
                      priority:
                        value as
                          | 'Low'
                          | 'Medium'
                          | 'High',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {priorityOptions.map(
                      (
                        priority,
                      ) => (
                        <SelectItem
                          key={
                            priority
                          }
                          value={
                            priority
                          }
                        >
                          {
                            priority
                          }
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Deadline
                </Label>

                <Input
                  type="date"
                  value={
                    form.deadline
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      deadline:
                        event.target
                          .value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Progress:{' '}
                {
                  form.progress
                }
                %
              </Label>

              <Slider
                value={[
                  Number(
                    form.progress,
                  ) || 0,
                ]}
                max={100}
                step={5}
                onValueChange={(
                  values,
                ) =>
                  setForm({
                    ...form,
                    progress:
                      values[0] ??
                      0,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-team">
                Team (comma-separated
                names)
              </Label>

              <Input
                id="project-team"
                value={
                  form.team
                }
                onChange={(
                  event,
                ) =>
                  setForm({
                    ...form,
                    team:
                      event.target
                        .value,
                  })
                }
                placeholder="Andrea Lim, Kai Santos"
              />
            </div>

            <DialogFooter>
              {editId && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    handleDelete(
                      editId,
                    )
                  }
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
                }}
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
                    : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}