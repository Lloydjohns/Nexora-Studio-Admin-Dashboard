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

const emptyForm: ProjectForm =
  {
    name: '',
    client: '',
    serviceType:
      'Social Media',
    stage: 'Discovery',
    progress: 0,
    deadline: new Date(
      Date.now() +
        14 *
          86400000,
    )
      .toISOString()
      .split('T')[0],
    team: '',
    priority: 'Medium',
  };

function getInitials(
  name: string,
) {
  return name
    .split(' ')
    .map(
      (n) => n[0],
    )
    .join('')
    .slice(0, 2);
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  /*
   * These are supplied from Clients page:
   *
   * /projects?clientId=CLIENT_ID&client=COMPANY
   */
  const clientId =
    searchParams.get(
      'clientId',
    );

  const clientName =
    searchParams.get(
      'client',
    ) || '';

  const [refreshKey, setRefreshKey] =
    React.useState(0);

  const {
    data: projects,
    loading,
  } = useFetch(
    fetchProjects,
    [refreshKey],
  );

  const refetch = () =>
    setRefreshKey(
      (k) => k + 1,
    );

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
    {
      ...emptyForm,
      client:
        clientName,
    },
  );

  const allProjects =
    projects ?? [];

  const inProgress =
    allProjects.filter(
      (p) =>
        p.stage !==
        'Completed',
    ).length;

  const completed =
    allProjects.filter(
      (p) =>
        p.stage ===
        'Completed',
    ).length;

  const highPriority =
    allProjects.filter(
      (p) =>
        p.priority ===
          'High' &&
        p.stage !==
          'Completed',
    ).length;

  /* ============================================================
     UPDATE FORM WHEN URL CLIENT CHANGES
  ============================================================ */

  React.useEffect(() => {
    if (!editId) {
      setForm((current) => ({
        ...current,
        client:
          clientName,
      }));
    }
  }, [
    clientName,
    editId,
  ]);

  /* ============================================================
     ADD PROJECT
  ============================================================ */

  function openAdd() {
    setEditId(null);

    setForm({
      ...emptyForm,
      client:
        clientName,
    });

    setOpen(true);
  }

  /* ============================================================
     EDIT PROJECT
  ============================================================ */

  function openEdit(
    id: string,
  ) {
    const p =
      allProjects.find(
        (x) =>
          x.id === id,
      );

    if (!p) return;

    setEditId(id);

    setForm({
      name: p.name,
      client: p.client,
      serviceType:
        p.serviceType,
      stage: p.stage,
      progress:
        p.progress,
      deadline:
        p.deadline,
      team:
        p.team.join(
          ', ',
        ),
      priority:
        p.priority,
    });

    setOpen(true);
  }

  /* ============================================================
     SAVE PROJECT
  ============================================================ */

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

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
     * A new project coming from a client should have
     * clientId available.
     */
    if (
      !editId &&
      !clientId
    ) {
      toast.error(
        'This project is not connected to a client.',
        {
          description:
            'Create the project from the client workspace so the client ID can be attached.',
        },
      );

      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name:
          form.name.trim(),

        /*
         * Keep existing field for compatibility.
         */
        client:
          form.client.trim(),

        /*
         * THIS is the database relationship.
         */
        client_id:
          clientId || null,

        service_type:
          form.serviceType,

        stage:
          form.stage,

        progress:
          form.progress,

        deadline:
          form.deadline,

        team:
          form.team
            .split(',')
            .map(
              (t) =>
                t.trim(),
            )
            .filter(
              Boolean,
            ),

        priority:
          form.priority,
      };

      if (editId) {
        await updateProject(
          editId,
          payload,
        );

        toast.success(
          'Project updated.',
        );
      } else {
        await insertProject(
          payload,
        );

        toast.success(
          'Project created and connected to the client.',
        );
      }

      setOpen(false);
      setEditId(null);

      /*
       * Return to project list and reload the data.
       */
      refetch();
    } catch (
      err: any
    ) {
      console.error(
        'Project save error:',
        err,
      );

      toast.error(
        'Failed to save project.',
        {
          description:
            err?.message ||
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
    try {
      await deleteProject(
        id,
      );

      toast.success(
        'Project deleted.',
      );

      refetch();
    } catch (
      err: any
    ) {
      toast.error(
        'Failed to delete project.',
        {
          description:
            err?.message ||
            'Something went wrong while deleting the project.',
        },
      );
    }
  }

  /* ============================================================
     PROJECT FILE PAGE
  ============================================================ */

  function openProjectFile(
    id: string,
  ) {
    router.push(
      `/projects/${id}`,
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

        {/* KANBAN */}

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
                        i,
                      ) => (
                        <div
                          key={
                            i
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
                      (
                        p,
                      ) =>
                        p.stage ===
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
                            p,
                            i,
                          ) => (
                            <motion.div
                              key={
                                p.id
                              }
                              initial={{
                                opacity:
                                  0,
                                y: 8,
                              }}
                              animate={{
                                opacity:
                                  1,
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
                                  openProjectFile(
                                    p.id,
                                  )
                                }
                              >
                                <CardContent className="p-3.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-semibold leading-snug">
                                      {
                                        p.name
                                      }
                                    </p>

                                    <Trash2
                                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground hover:text-rose-500"
                                      onClick={(
                                        e,
                                      ) => {
                                        e.stopPropagation();

                                        handleDelete(
                                          p.id,
                                        );
                                      }}
                                    />
                                  </div>

                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {
                                      p.client
                                    }
                                  </p>

                                  <div className="mt-2.5">
                                    <ProgressBar
                                      value={
                                        p.progress
                                      }
                                    />
                                  </div>

                                  <div className="mt-3 flex items-center justify-between">
                                    <div className="flex -space-x-1.5">
                                      {p.team
                                        .slice(
                                          0,
                                          3,
                                        )
                                        .map(
                                          (
                                            m,
                                          ) => (
                                            <Avatar
                                              key={
                                                m
                                              }
                                              initials={getInitials(
                                                m,
                                              )}
                                              className="h-6 w-6 border-2 border-card text-[9px]"
                                            />
                                          ),
                                        )}

                                      {p.team
                                        .length >
                                        3 && (
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] font-medium">
                                          +
                                          {
                                            p
                                              .team
                                              .length -
                                              3
                                          }
                                        </div>
                                      )}
                                    </div>

                                    <PriorityBadge
                                      priority={
                                        p.priority
                                      }
                                    />
                                  </div>

                                  <div className="mt-2.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <Clock className="h-3 w-3" />

                                    Due{' '}
                                    {
                                      p.deadline
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

        {/* LIST */}

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
                    (_, i) => (
                      <TableRow
                        key={
                          i
                        }
                      >
                        {Array.from({
                          length: 7,
                        }).map(
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
                  allProjects.map(
                    (p) => (
                      <TableRow
                        key={
                          p.id
                        }
                        className="cursor-pointer"
                        onClick={() =>
                          openProjectFile(
                            p.id,
                          )
                        }
                      >
                        <TableCell className="font-medium">
                          {
                            p.name
                          }
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {
                            p.client
                          }
                        </TableCell>

                        <TableCell>
                          <StatusBadge
                            status={
                              p.stage
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <ProgressBar
                            value={
                              p.progress
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <div className="flex -space-x-1.5">
                            {p.team
                              .slice(
                                0,
                                3,
                              )
                              .map(
                                (
                                  m,
                                ) => (
                                  <Avatar
                                    key={
                                      m
                                    }
                                    initials={getInitials(
                                      m,
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
                              p.priority
                            }
                          />
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {
                            p.deadline
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

      {/* PROJECT DIALOG */}

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
              <Label htmlFor="name">
                Project Name
              </Label>

              <Input
                id="name"
                value={
                  form.name
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target
                      .value,
                  })
                }
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client">
                  Client
                </Label>

                <Input
                  id="client"
                  value={
                    form.client
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      client:
                        e.target
                          .value,
                    })
                  }
                  required
                />

                {clientId && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    ✓ Connected to
                    selected client
                  </p>
                )}

                {!clientId &&
                  !editId && (
                    <p className="text-[11px] text-muted-foreground">
                      Open New Project
                      from a client
                      workspace to link
                      this project.
                    </p>
                  )}
              </div>

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

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="deadline">
                  Deadline
                </Label>

                <Input
                  id="deadline"
                  type="date"
                  value={
                    form.deadline
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      deadline:
                        e.target
                          .value,
                    })
                  }
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>
                  Progress:{' '}
                  {
                    form.progress
                  }
                  %
                </Label>

                <Slider
                  value={[
                    form.progress,
                  ]}
                  max={100}
                  step={5}
                  onValueChange={(
                    value,
                  ) =>
                    setForm({
                      ...form,
                      progress:
                        value[0],
                    })
                  }
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="team">
                  Team (comma-separated
                  names)
                </Label>

                <Input
                  id="team"
                  value={
                    form.team
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      team:
                        e.target
                          .value,
                    })
                  }
                  placeholder="Andrea Lim, Kai Santos"
                />
              </div>
            </div>

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
                    : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}