'use client';

import * as React from 'react';
import {
  useParams,
  useRouter,
} from 'next/navigation';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Save,
  X,
  FolderKanban,
  CalendarDays,
  Users,
  Target,
  FileText,
  Upload,
  Plus,
  Clock,
} from 'lucide-react';

import {
  DashboardShell,
  PageHeader,
} from '@/components/dashboard-shell';

import {
  StatusBadge,
  Avatar,
  PriorityBadge,
  ProgressBar,
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

import { Badge } from '@/components/ui/badge';

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
  fetchProjects,
  updateProject,
  deleteProject,
} from '@/lib/api';

import {
  type ProjectStage,
} from '@/lib/data';

import { toast } from 'sonner';

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

const emptyForm: ProjectForm = {
  name: '',
  client: '',
  client_id: null,
  serviceType:
    'Social Media',
  stage: 'Discovery',
  progress: 0,
  deadline: '',
  team: '',
  priority: 'Medium',
};

/* ============================================================
   PROJECT FILE PAGE
============================================================ */

export default function ProjectFilePage() {
  const router = useRouter();
  const params = useParams();

  const projectId =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : '';

  const [
    project,
    setProject,
  ] = React.useState<any>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = React.useState(true);

  const [
    editMode,
    setEditMode,
  ] = React.useState(false);

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
    fileName,
    setFileName,
  ] = React.useState('');

  const [
    fileTitle,
    setFileTitle,
  ] = React.useState('');

  const [
    fileSummary,
    setFileSummary,
  ] = React.useState('');

  const [
    files,
    setFiles,
  ] = React.useState<
    {
      id: string;
      name: string;
      title: string;
      summary: string;
      createdAt: string;
    }[]
  >([]);

  /* ==========================================================
     LOAD PROJECT
  ========================================================== */

  React.useEffect(() => {
    async function loadProject() {
      if (!projectId) {
        toast.error(
          'Project ID is missing.',
        );

        router.push(
          '/projects',
        );

        return;
      }

      setLoading(true);

      try {
        const allProjects =
          await fetchProjects();

        const found =
          allProjects.find(
            (item) =>
              String(
                item.id,
              ) ===
              String(
                projectId,
              ),
          );

        if (!found) {
          toast.error(
            'Project not found.',
          );

          router.push(
            '/projects',
          );

          return;
        }

        setProject(found);

        setForm({
          name:
            found.name ||
            '',
          client:
            found.client ||
            '',
          client_id:
            found.client_id ??
            null,
          serviceType:
            found.serviceType ||
            'Social Media',
          stage:
            found.stage ||
            'Discovery',
          progress:
            Number(
              found.progress,
            ) || 0,
          deadline:
            found.deadline ||
            '',
          team:
            Array.isArray(
              found.team,
            )
              ? found.team.join(
                  ', ',
                )
              : '',
          priority:
            found.priority ||
            'Medium',
        });

        loadLocalFiles(
          String(
            found.id,
          ),
        );
      } catch (error: any) {
        console.error(
          'Project loading error:',
          error,
        );

        toast.error(
          'Failed to load project.',
          {
            description:
              error?.message ||
              'Something went wrong.',
          },
        );
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [
    projectId,
    router,
  ]);

  /* ==========================================================
     LOCAL PROJECT FILES
  ========================================================== */

  function projectStorageKey(
    id: string,
  ) {
    return `nexora_project_files_${id}`;
  }

  function loadLocalFiles(
    id: string,
  ) {
    if (
      typeof window ===
      'undefined'
    ) {
      return;
    }

    try {
      const raw =
        localStorage.getItem(
          projectStorageKey(id),
        );

      if (!raw) {
        setFiles([]);
        return;
      }

      const parsed =
        JSON.parse(raw);

      if (
        Array.isArray(parsed)
      ) {
        setFiles(parsed);
      } else {
        setFiles([]);
      }
    } catch {
      setFiles([]);
    }
  }

  function saveLocalFiles(
    value: typeof files,
  ) {
    setFiles(value);

    if (
      typeof window ===
      'undefined'
    ) {
      return;
    }

    try {
      localStorage.setItem(
        projectStorageKey(
          String(
            projectId,
          ),
        ),
        JSON.stringify(
          value,
        ),
      );
    } catch {
      // Ignore storage errors.
    }
  }

  /* ==========================================================
     UPDATE PROJECT
  ========================================================== */

  async function handleUpdateProject(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!projectId) {
      toast.error(
        'Project ID is missing.',
      );
      return;
    }

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

    setSubmitting(true);

    try {
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

      const updated =
        await updateProject(
          String(
            projectId,
          ),
          payload,
        );

      setProject(updated);

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

      setEditMode(false);

      toast.success(
        'Project updated successfully.',
      );
    } catch (
      error: any
    ) {
      console.error(
        'Project update error:',
        error,
      );

      toast.error(
        'Failed to update project.',
        {
          description:
            error?.message ||
            'Something went wrong.',
        },
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ==========================================================
     DELETE PROJECT
  ========================================================== */

  async function handleDeleteProject() {
    if (!projectId) {
      toast.error(
        'Project ID is missing.',
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Delete project "${project?.name || projectId}"? This action cannot be undone.`,
      );

    if (!confirmed) return;

    try {
      await deleteProject(
        String(
          projectId,
        ),
      );

      toast.success(
        'Project deleted successfully.',
      );

      router.push(
        '/projects',
      );
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
            'Something went wrong.',
        },
      );
    }
  }

  /* ==========================================================
     ADD PROJECT FILE
  ========================================================== */

  function handleAddFile() {
    if (!fileName.trim()) {
      toast.error(
        'File name is required.',
      );
      return;
    }

    if (!fileTitle.trim()) {
      toast.error(
        'File title is required.',
      );
      return;
    }

    const newFile = {
      id:
        crypto.randomUUID(),

      name:
        fileName.trim(),

      title:
        fileTitle.trim(),

      summary:
        fileSummary.trim(),

      createdAt:
        new Date().toISOString(),
    };

    saveLocalFiles([
      newFile,
      ...files,
    ]);

    setFileName('');
    setFileTitle('');
    setFileSummary('');

    toast.success(
      'Project file record added.',
    );
  }

  /* ==========================================================
     DELETE PROJECT FILE
  ========================================================== */

  function handleDeleteFile(
    id: string,
  ) {
    const confirmed =
      window.confirm(
        'Delete this file record?',
      );

    if (!confirmed) return;

    saveLocalFiles(
      files.filter(
        (file) =>
          file.id !== id,
      ),
    );

    toast.success(
      'File record deleted.',
    );
  }

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <DashboardShell>
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />

          <div className="h-32 animate-pulse rounded-xl bg-muted" />

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="h-48 animate-pulse rounded-xl bg-muted" />

            <div className="h-48 animate-pulse rounded-xl bg-muted" />

            <div className="h-48 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!project) {
    return (
      <DashboardShell>
        <div className="py-20 text-center">
          <FolderKanban className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />

          <h2 className="text-lg font-semibold">
            Project not found
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            The requested project
            does not exist.
          </p>

          <Button
            className="mt-4"
            onClick={() =>
              router.push(
                '/projects',
              )
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </div>
      </DashboardShell>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <DashboardShell>
      <button
        type="button"
        onClick={() =>
          router.push(
            '/projects',
          )
        }
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </button>

      <PageHeader
        title={project.name}
        description={`Project File · ${project.client}`}
      >
        <div className="flex flex-wrap gap-2">
          {editMode ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditMode(false);

                  setForm({
                    name:
                      project.name ||
                      '',
                    client:
                      project.client ||
                      '',
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
                      '',
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
                }}
                disabled={
                  submitting
                }
              >
                <X className="mr-1.5 h-4 w-4" />
                Cancel
              </Button>

              <Button
                size="sm"
                type="submit"
                form="project-edit-form"
                disabled={
                  submitting
                }
              >
                <Save className="mr-1.5 h-4 w-4" />
                {submitting
                  ? 'Saving...'
                  : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setEditMode(true)
                }
              >
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit Project
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={
                  handleDeleteProject
                }
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </PageHeader>

      {/* ======================================================
          PROJECT SUMMARY
      ====================================================== */}

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2.5">
                <FolderKanban className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Project
                </p>

                <p className="font-semibold">
                  {project.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2.5">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Client
                </p>

                <p className="font-semibold">
                  {project.client}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2.5">
                <Target className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Stage
                </p>

                <StatusBadge
                  status={
                    project.stage
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2.5">
                <CalendarDays className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Deadline
                </p>

                <p className="font-semibold">
                  {project.deadline ||
                    '—'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ======================================================
          EDIT FORM
      ====================================================== */}

      {editMode && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>
              Edit Project
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form
              id="project-edit-form"
              onSubmit={
                handleUpdateProject
              }
              className="space-y-5"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Project Name
                  </Label>

                  <Input
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
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Client
                  </Label>

                  <Input
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

                  {form.client_id && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      ✓ Linked to client ID{' '}
                      {
                        form.client_id
                      }
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
                        (
                          stage,
                        ) => (
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
                        values[0],
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Team
                </Label>

                <Input
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
            </form>
          </CardContent>
        </Card>
      )}

      {/* ======================================================
          CURRENT PROJECT STATUS
      ====================================================== */}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Project Progress
              </CardTitle>

              <Badge variant="secondary">
                {
                  project.progress
                }
                %
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <ProgressBar
              value={
                Number(
                  project.progress,
                ) || 0
              }
            />

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Current stage
              </span>

              <StatusBadge
                status={
                  project.stage
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Priority
            </CardTitle>
          </CardHeader>

          <CardContent>
            <PriorityBadge
              priority={
                project.priority
              }
            />

            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />

              <span>
                Due{' '}
                {
                  project.deadline ||
                  '—'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ======================================================
          TEAM
      ====================================================== */}

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>
            Project Team
          </CardTitle>
        </CardHeader>

        <CardContent>
          {Array.isArray(
            project.team,
          ) &&
          project.team.length >
            0 ? (
            <div className="flex flex-wrap gap-3">
              {project.team.map(
                (
                  member: string,
                ) => (
                  <div
                    key={
                      member
                    }
                    className="flex items-center gap-2 rounded-lg border px-3 py-2"
                  >
                    <Avatar
                      initials={member
                        .split(
                          ' ',
                        )
                        .map(
                          (
                            part,
                          ) =>
                            part[0],
                        )
                        .join('')
                        .slice(
                          0,
                          2,
                        )}
                      className="h-8 w-8"
                    />

                    <span className="text-sm font-medium">
                      {
                        member
                      }
                    </span>
                  </div>
                ),
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No team members
              assigned.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ======================================================
          PROJECT FILES
      ====================================================== */}

      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                Project Files
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Documents and assets
                associated with this
                project.
              </p>
            </div>

            <Badge variant="secondary">
              {files.length} file
              {files.length === 1
                ? ''
                : 's'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>
                File Name
              </Label>

              <Input
                value={
                  fileName
                }
                onChange={(
                  event,
                ) =>
                  setFileName(
                    event.target
                      .value,
                  )
                }
                placeholder="homepage-design.pdf"
              />
            </div>

            <div className="space-y-2">
              <Label>
                File Title
              </Label>

              <Input
                value={
                  fileTitle
                }
                onChange={(
                  event,
                ) =>
                  setFileTitle(
                    event.target
                      .value,
                  )
                }
                placeholder="Homepage Design"
              />
            </div>

            <div className="space-y-2">
              <Label>
                Summary
              </Label>

              <Input
                value={
                  fileSummary
                }
                onChange={(
                  event,
                ) =>
                  setFileSummary(
                    event.target
                      .value,
                  )
                }
                placeholder="Final approved homepage design"
              />
            </div>
          </div>

          <Button
            onClick={
              handleAddFile
            }
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add File Record
          </Button>

          <div className="rounded-lg border border-dashed">
            {files.length ===
            0 ? (
              <div className="py-12 text-center">
                <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                <p className="font-medium">
                  No project files
                  yet
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Add your first
                  project file record
                  above.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {files.map(
                  (file) => (
                    <div
                      key={
                        file.id
                      }
                      className="flex items-center justify-between gap-4 p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-lg bg-muted p-2">
                          <FileText className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {
                              file.title
                            }
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {
                              file.name
                            }
                          </p>

                          {file.summary && (
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {
                                file.summary
                              }
                            </p>
                          )}

                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {new Date(
                              file.createdAt,
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          handleDeleteFile(
                            file.id,
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}