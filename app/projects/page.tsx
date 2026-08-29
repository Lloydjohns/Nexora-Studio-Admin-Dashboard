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
  Users,
  Check,
  ChevronDown,
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
  fetchProjects,
  insertProject,
  updateProject,
  deleteProject,
  fetchTeam,
} from '@/lib/api';

import {
  type ProjectStage,
} from '@/lib/data';

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

const stageAccent: Record<string, string> = {
  Discovery: 'bg-blue-500',

  Planning:
    'bg-indigo-500',

  'Content Creation':
    'bg-violet-500',

  Design:
    'bg-purple-500',

  Development:
    'bg-amber-500',

  Review:
    'bg-orange-500',

  'Client Approval':
    'bg-teal-500',

  Completed:
    'bg-emerald-500',
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

  /*
   * Team contains the selected team-member names.
   *
   * Example:
   *
   * [
   *   "Andrea Lim",
   *   "Kai Santos"
   * ]
   */
  team: string[];

  priority:
    | 'Low'
    | 'Medium'
    | 'High';
}

/* ============================================================
   TEAM MEMBER
============================================================ */

interface TeamMember {
  id: string;

  name: string;

  role?: string;

  email?: string;

  availability?: string;

  activeProjects?: number;

  tasksAssigned?: number;

  tasksCompleted?: number;

  utilization?: number;
}

/* ============================================================
   DEFAULT DEADLINE
============================================================ */

function getDefaultDeadline() {
  return new Date(
    Date.now() +
      14 * 86400000,
  )
    .toISOString()
    .split('T')[0];
}

/* ============================================================
   EMPTY FORM
============================================================ */

const emptyForm: ProjectForm = {
  name: '',

  client: '',

  client_id: null,

  serviceType:
    'Social Media',

  stage:
    'Discovery',

  progress:
    0,

  deadline:
    getDefaultDeadline(),

  team: [],

  priority:
    'Medium',
};

/* ============================================================
   INITIALS
============================================================ */

function getInitials(
  name: string,
) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .map(
      (part) =>
        part[0],
    )
    .join('')
    .slice(0, 2)
    .toUpperCase();
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

  /* ==========================================================
     PROJECT DATA
  ========================================================== */

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

  /* ==========================================================
     TEAM DATA
     
     fetchTeam() reads from the existing Team page data source:
     
     public.team_members
     
     The same records are used by:
     
     Edit Project
        ↓
     Project Team
        ↓
     Select team members
  ========================================================== */

  const {
    data: team,
    loading: teamLoading,
  } = useFetch(
    fetchTeam,
    [],
  );

  const allTeamMembers =
    React.useMemo(
      () =>
        (team ?? []) as TeamMember[],
      [team],
    );

  function refetch() {
    setRefreshKey(
      (key) =>
        key + 1,
    );
  }

  /* ==========================================================
     DIALOG STATE
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
  ] = React.useState<ProjectForm>(
    emptyForm,
  );

  /* ==========================================================
     TEAM DROPDOWN STATE
  ========================================================== */

  const [
    teamMenuOpen,
    setTeamMenuOpen,
  ] = React.useState(false);

  /* ==========================================================
     CLIENT INITIALIZATION
  ========================================================== */

  const [
    initializedFromClient,
    setInitializedFromClient,
  ] = React.useState(false);

  const allProjects =
    projects ?? [];

  /* ==========================================================
     KPI DATA
  ========================================================== */

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

  /* ==========================================================
     NORMALIZE PROJECT TEAM
     
     Supports:
     
     1. New array:
        ["Andrea Lim", "Kai Santos"]
     
     2. Existing string:
        "Andrea Lim, Kai Santos"
     
     This keeps existing projects compatible.
  ========================================================== */

  function normalizeProjectTeam(
    value: unknown,
  ): string[] {
    if (
      Array.isArray(value)
    ) {
      return value
        .map(
          (member) =>
            String(
              member,
            ).trim(),
        )
        .filter(Boolean);
    }

    if (
      typeof value ===
      'string'
    ) {
      return value
        .split(',')
        .map(
          (member) =>
            member.trim(),
        )
        .filter(Boolean);
    }

    return [];
  }

  /* ==========================================================
     NORMALIZE TEAM MEMBER NAME
  ========================================================== */

  function normalizeTeamMemberName(
    name: string,
  ) {
    return String(
      name || '',
    )
      .trim()
      .toLowerCase();
  }

  /* ==========================================================
     FIND CURRENT TEAM MEMBER
     
     Matches by name so existing project data can be
     connected to the current team_members records.
  ========================================================== */

  function findTeamMemberByName(
    name: string,
  ) {
    const normalized =
      normalizeTeamMemberName(
        name,
      );

    return allTeamMembers.find(
      (member) =>
        normalizeTeamMemberName(
          member.name,
        ) === normalized,
    );
  }

  /* ==========================================================
     NORMALIZE EXISTING PROJECT TEAM
     
     IMPORTANT FOR EDIT PROJECT:
     
     If the project already contains:
     
     ["Andrea Lim", "Kai Santos"]
     
     those exact existing Team members will be automatically
     selected in the Team selector.
     
     If the old project contains:
     
     "Andrea Lim, Kai Santos"
     
     it is also converted correctly.
  ========================================================== */

  function normalizeExistingTeamSelection(
    value: unknown,
  ): string[] {
    const existing =
      normalizeProjectTeam(
        value,
      );

    if (
      existing.length ===
      0
    ) {
      return [];
    }

    const selectedNames: string[] =
      [];

    existing.forEach(
      (savedName) => {
        const matchedMember =
          findTeamMemberByName(
            savedName,
          );

        const finalName =
          matchedMember?.name ||
          savedName;

        if (
          finalName &&
          !selectedNames.some(
            (name) =>
              normalizeTeamMemberName(
                name,
              ) ===
              normalizeTeamMemberName(
                finalName,
              ),
          )
        ) {
          selectedNames.push(
            finalName,
          );
        }
      },
    );

    return selectedNames;
  }

  /* ==========================================================
     AUTO OPEN NEW PROJECT FROM CLIENT
  ========================================================== */

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

        team: [],
      });

      setTeamMenuOpen(false);

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

  /* ==========================================================
     OPEN ADD PROJECT
  ========================================================== */

  function openAdd() {
    setEditId(null);

    setTeamMenuOpen(false);

    setForm({
      ...emptyForm,

      client:
        clientName || '',

      client_id:
        clientId || null,

      deadline:
        getDefaultDeadline(),

      team: [],
    });

    setOpen(true);
  }

  /* ==========================================================
     OPEN EDIT PROJECT
     
     IMPORTANT:
     
     Existing project.team is loaded into form.team.
     
     That means:
     
     Edit Project
          ↓
     Project Team
          ↓
     Existing members are already CHECKED
  ========================================================== */

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

    const existingTeam =
      normalizeExistingTeamSelection(
        project.team,
      );

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

      /*
       * Existing team members are selected here.
       */
      team:
        existingTeam,

      priority:
        project.priority ||
        'Medium',
    });

    setTeamMenuOpen(false);

    setOpen(true);
  }

  /* ==========================================================
     TOGGLE TEAM MEMBER
     
     Selecting:
     
     Andrea Lim
     
     adds:
     
     ["Andrea Lim"]
     
     Clicking again removes:
     
     []
  ========================================================== */

  function toggleTeamMember(
    memberName: string,
  ) {
    setForm(
      (currentForm) => {
        const alreadySelected =
          currentForm.team.some(
            (name) =>
              normalizeTeamMemberName(
                name,
              ) ===
              normalizeTeamMemberName(
                memberName,
              ),
          );

        if (
          alreadySelected
        ) {
          return {
            ...currentForm,

            team:
              currentForm.team.filter(
                (name) =>
                  normalizeTeamMemberName(
                    name,
                  ) !==
                  normalizeTeamMemberName(
                    memberName,
                  ),
              ),
          };
        }

        return {
          ...currentForm,

          team: [
            ...currentForm.team,
            memberName,
          ],
        };
      },
    );
  }

  /* ==========================================================
     REMOVE TEAM MEMBER CHIP
  ========================================================== */

  function removeTeamMember(
    memberName: string,
  ) {
    setForm(
      (currentForm) => ({
        ...currentForm,

        team:
          currentForm.team.filter(
            (name) =>
              normalizeTeamMemberName(
                name,
              ) !==
              normalizeTeamMemberName(
                memberName,
              ),
          ),
      }),
    );
  }

  /* ==========================================================
     GET TEAM MEMBER
  ========================================================== */

  function getTeamMember(
    name: string,
  ) {
    return findTeamMemberByName(
      name,
    );
  }

  /* ==========================================================
     CLOSE PROJECT DIALOG
  ========================================================== */

  function closeProjectDialog() {
    if (submitting) {
      return;
    }

    setOpen(false);

    setEditId(null);

    setTeamMenuOpen(false);

    setForm({
      ...emptyForm,

      deadline:
        getDefaultDeadline(),

      team: [],
    });
  }

  /* ==========================================================
     SAVE / UPDATE PROJECT
  ========================================================== */

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    /* ========================================================
       VALIDATION
    ======================================================== */

    if (
      !form.name.trim()
    ) {
      toast.error(
        'Project name is required.',
      );

      return;
    }

    if (
      !form.client.trim()
    ) {
      toast.error(
        'Client is required.',
      );

      return;
    }

    /*
     * New projects created from a client workspace
     * require client_id.
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
      /* ======================================================
         CLEAN TEAM ARRAY
         
         Example:
         
         [
           "Andrea Lim",
           "Andrea Lim",
           "",
           " Kai Santos "
         ]
         
         becomes:
         
         [
           "Andrea Lim",
           "Kai Santos"
         ]
      ====================================================== */

      const cleanedTeam =
        Array.from(
          new Set(
            form.team
              .map(
                (name) =>
                  name.trim(),
              )
              .filter(Boolean),
          ),
        );

      /* ======================================================
         DATABASE PAYLOAD
         
         IMPORTANT:
         
         The existing project.team field is preserved.
         
         We are NOT creating a new team table relation here.
         
         The selected Team page members are saved to:
         
         project.team
         
         Example:
         
         [
           "Andrea Lim",
           "Kai Santos"
         ]
      ====================================================== */

      const payload = {
        name:
          form.name.trim(),

        client:
          form.client.trim(),

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
          cleanedTeam,

        priority:
          form.priority,
      };

      /* ======================================================
         UPDATE EXISTING PROJECT
      ====================================================== */

      if (editId) {
        const updated =
          await updateProject(
            editId,
            payload,
          );

        toast.success(
          'Project updated successfully.',
          {
            description:
              `${
                updated?.name ||
                form.name
              } has been updated.`,
          },
        );

        /*
         * Synchronize form with returned database data.
         */
        setForm({
          name:
            updated?.name ||
            form.name,

          client:
            updated?.client ||
            form.client,

          client_id:
            updated?.client_id ??
            form.client_id ??
            null,

          serviceType:
            updated?.serviceType ||
            form.serviceType,

          stage:
            updated?.stage ||
            form.stage,

          progress:
            Number(
              updated?.progress,
            ) || 0,

          deadline:
            updated?.deadline ||
            form.deadline,

          team:
            normalizeProjectTeam(
              updated?.team ??
                cleanedTeam,
            ),

          priority:
            updated?.priority ||
            form.priority,
        });

        /*
         * Refresh Projects page.
         */
        refetch();

        /*
         * Close edit dialog after successful save.
         */
        setOpen(false);

        setEditId(null);

        setTeamMenuOpen(false);

        return;
      }

      /* ======================================================
         CREATE NEW PROJECT
      ====================================================== */

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
       * Open Project File after creation.
       */
      if (
        created?.id
      ) {
        setOpen(false);

        setEditId(null);

        setTeamMenuOpen(
          false,
        );

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

      setOpen(false);

      setEditId(null);

      setTeamMenuOpen(false);

      refetch();
    } catch (
      error: any
    ) {
      console.error(
        'Project save error:',
        error,
      );

      toast.error(
        editId
          ? 'Failed to update project.'
          : 'Failed to create project.',
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

  /* ==========================================================
     DELETE PROJECT
  ========================================================== */

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
      setSubmitting(true);

      await deleteProject(
        id,
      );

      toast.success(
        'Project deleted successfully.',
      );

      setOpen(false);

      setEditId(null);

      setTeamMenuOpen(false);

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
    } finally {
      setSubmitting(false);
    }
  }

  /* ==========================================================
     OPEN PROJECT FILE
  ========================================================== */

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

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <DashboardShell>

      {/* ======================================================
         HEADER
      ====================================================== */}

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
           KANBAN BOARD
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
                          ) => {

                            const projectTeam =
                              normalizeProjectTeam(
                                project.team,
                              );

                            return (

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

                                      {/* TEAM AVATARS */}

                                      <div className="flex -space-x-1.5">

                                        {projectTeam
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

                                        {projectTeam.length >
                                          3 && (

                                          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] font-medium">

                                            +
                                            {
                                              projectTeam.length -
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

                            );
                          },
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
           LIST VIEW
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
                    (
                      _,
                      rowIndex,
                    ) => (

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
                    (project) => {

                      const projectTeam =
                        normalizeProjectTeam(
                          project.team,
                        );

                      return (

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

                              {projectTeam
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

                              {projectTeam.length >
                                3 && (

                                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] font-medium">

                                  +
                                  {
                                    projectTeam.length -
                                    3
                                  }

                                </div>

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

                      );
                    },
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
        onOpenChange={(
          value,
        ) => {

          if (
            submitting &&
            !value
          ) {
            return;
          }

          setOpen(
            value,
          );

          if (!value) {
            setEditId(
              null,
            );

            setTeamMenuOpen(
              false,
            );

            setForm({
              ...emptyForm,

              deadline:
                getDefaultDeadline(),

              team: [],
            });
          }

        }}
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

            {/* ==================================================
               PROJECT NAME
            ================================================== */}

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
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,

                      name:
                        event
                          .target
                          .value,
                    }),
                  )
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
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,

                      client:
                        event
                          .target
                          .value,
                    }),
                  )
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

            {/* ==================================================
               SERVICE / STAGE / PRIORITY / DEADLINE
            ================================================== */}

            <div className="grid gap-4 sm:grid-cols-2">

              {/* SERVICE */}

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
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,

                        serviceType:
                          value,
                      }),
                    )
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

              {/* STAGE */}

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
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,

                        stage:
                          value as ProjectStage,
                      }),
                    )
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

              {/* PRIORITY */}

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
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,

                        priority:
                          value as
                            | 'Low'
                            | 'Medium'
                            | 'High',
                      }),
                    )
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

              {/* DEADLINE */}

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
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,

                        deadline:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                />

              </div>

            </div>

            {/* ==================================================
               PROGRESS
            ================================================== */}

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
                  setForm(
                    (
                      current,
                    ) => ({
                      ...current,

                      progress:
                        values[0] ??
                        0,
                    }),
                  )
                }
              />

            </div>

            {/* ==================================================
               PROJECT TEAM
               
               SAME SELECTOR FOR:
               
               New Project
               +
               Edit Project
               
               Data source:
               
               fetchTeam()
                    ↓
               public.team_members
               
               Edit Project:
               
               project.team
                    ↓
               match against team_members
                    ↓
               automatically checked
            ================================================== */}

            <div className="space-y-2">

              <Label>
                Project Team
              </Label>

              <div className="relative">

                {/* ==================================================
                   SELECT MEMBERS BUTTON
                ================================================== */}

                <button
                  type="button"
                  onClick={() =>
                    setTeamMenuOpen(
                      (
                        current,
                      ) =>
                        !current,
                    )
                  }
                  disabled={
                    submitting
                  }
                  className={cn(
                    'flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    submitting &&
                      'cursor-not-allowed opacity-60',
                  )}
                >

                  <div className="flex min-w-0 items-center gap-2">

                    <Users className="h-4 w-4 shrink-0 text-muted-foreground" />

                    {form.team.length ===
                    0 ? (

                      <span className="text-muted-foreground">
                        Select team members...
                      </span>

                    ) : (

                      <span className="truncate">

                        {
                          form.team.length
                        }{' '}

                        team member
                        {form.team.length !==
                        1
                          ? 's'
                          : ''}{' '}

                        selected

                      </span>

                    )}

                  </div>

                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform',
                      teamMenuOpen &&
                        'rotate-180',
                    )}
                  />

                </button>

                {/* ==================================================
                   SELECTED MEMBER CHIPS
                ================================================== */}

                {form.team.length >
                  0 && (

                  <div className="mt-2 flex flex-wrap gap-1.5">

                    {form.team.map(
                      (
                        memberName,
                      ) => {

                        const member =
                          getTeamMember(
                            memberName,
                          );

                        return (

                          <Badge
                            key={
                              memberName
                            }
                            variant="secondary"
                            className="gap-1.5 pr-1"
                          >

                            <Avatar
                              initials={getInitials(
                                member?.name ||
                                  memberName,
                              )}
                              className="h-5 w-5 text-[8px]"
                            />

                            <span>
                              {
                                member?.name ||
                                memberName
                              }
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                removeTeamMember(
                                  memberName,
                                )
                              }
                              disabled={
                                submitting
                              }
                              className="ml-0.5 rounded-full p-0.5 hover:bg-background disabled:pointer-events-none disabled:opacity-50"
                              aria-label={`Remove ${memberName}`}
                            >
                              ×
                            </button>

                          </Badge>

                        );
                      },
                    )}

                  </div>

                )}

                {/* ==================================================
                   TEAM MEMBER DROPDOWN
                ================================================== */}

                {teamMenuOpen && (

                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">

                    {teamLoading ? (

                      <div className="p-4 text-center text-sm text-muted-foreground">

                        Loading team members...

                      </div>

                    ) : allTeamMembers.length ===
                      0 ? (

                      <div className="p-4 text-center">

                        <Users className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />

                        <p className="text-sm font-medium">
                          No team members found
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Add members from the Team page first.
                        </p>

                      </div>

                    ) : (

                      allTeamMembers.map(
                        (
                          member,
                        ) => {

                          /*
                           * Determine whether this member is
                           * currently selected.
                           *
                           * This is what makes existing
                           * Project Team members appear checked
                           * when Edit Project is opened.
                           */
                          const selected =
                            form.team.some(
                              (name) =>
                                normalizeTeamMemberName(
                                  name,
                                ) ===
                                normalizeTeamMemberName(
                                  member.name,
                                ),
                            );

                          return (

                            <button
                              type="button"
                              key={
                                member.id
                              }
                              onClick={() =>
                                toggleTeamMember(
                                  member.name,
                                )
                              }
                              disabled={
                                submitting
                              }
                              className={cn(
                                'flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-sm transition-colors',
                                'hover:bg-accent hover:text-accent-foreground',
                                selected &&
                                  'bg-accent',
                                submitting &&
                                  'cursor-not-allowed opacity-60',
                              )}
                            >

                              {/* CHECKBOX */}

                              <div
                                className={cn(
                                  'flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                                  selected
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-input',
                                )}
                              >

                                {selected && (
                                  <Check className="h-3.5 w-3.5" />
                                )}

                              </div>

                              {/* AVATAR */}

                              <Avatar
                                initials={getInitials(
                                  member.name,
                                )}
                                className="h-8 w-8"
                              />

                              {/* NAME + ROLE */}

                              <div className="min-w-0 flex-1">

                                <p className="truncate font-medium">
                                  {
                                    member.name
                                  }
                                </p>

                                {member.role && (

                                  <p className="truncate text-xs text-muted-foreground">
                                    {
                                      member.role
                                    }
                                  </p>

                                )}

                              </div>

                              {/* AVAILABILITY */}

                              {member.availability && (

                                <span
                                  className={cn(
                                    'hidden text-[10px] sm:block',

                                    member.availability ===
                                      'Available'
                                      ? 'text-emerald-600'
                                      : member.availability ===
                                          'On Leave'
                                        ? 'text-rose-600'
                                        : 'text-amber-600',
                                  )}
                                >
                                  {
                                    member.availability
                                  }
                                </span>

                              )}

                            </button>

                          );
                        },
                      )

                    )}

                  </div>

                )}

              </div>

              <p className="text-[11px] text-muted-foreground">

                Select one or multiple members from your Team page.

              </p>

            </div>

            {/* ==================================================
               FOOTER
            ================================================== */}

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
                onClick={
                  closeProjectDialog
                }
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
                    ? 'Update Project'
                    : 'Create Project'}

              </Button>

            </DialogFooter>

          </form>

        </DialogContent>

      </Dialog>

    </DashboardShell>
  );
}