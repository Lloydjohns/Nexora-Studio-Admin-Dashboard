'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Mail,
  Phone,
  ArrowLeft,
  Building2,
  Calendar,
  Palette,
  Instagram,
  Facebook,
  Users as UsersIcon,
  DollarSign,
  TrendingUp,
  FileText,
  MessageSquare,
  FolderKanban,
  CalendarDays,
  Paperclip,
  StickyNote,
  Filter,
  Trash2,
  Pencil,
  Save,
  X,
  Send,
  Upload,
  Globe,
  Linkedin,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
} from 'lucide-react';

import {
  DashboardShell,
  PageHeader,
} from '@/components/dashboard-shell';

import {
  KpiCard,
  StatusBadge,
  Avatar,
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
  fetchClients,
  fetchProjects,
  fetchContentItems,
  fetchInvoices,
  insertClient,
  updateClient,
  deleteClient,
} from '@/lib/api';

import {
  type ClientStatus,
  formatPeso,
} from '@/lib/data';

import { useFetch } from '@/hooks/use-fetch';
import { toast } from 'sonner';

/* ============================================================
   OPTIONS
============================================================ */

const packageOptions = [
  'Social Starter',
  'Social Growth Pro',
  'Web + Social Pro',
  'Web + Systems',
];

const statusOptions: ClientStatus[] = [
  'Active',
  'Onboarding',
  'Paused',
  'Churned',
];

const socialPlatforms = [
  'Instagram',
  'Facebook',
  'TikTok',
  'LinkedIn',
  'Website',
  'Other',
];

const invoiceStatuses = [
  'Draft',
  'Pending',
  'Paid',
  'Overdue',
  'Cancelled',
];

/* ============================================================
   CLIENT FORM
============================================================ */

interface ClientForm {
  name: string;
  company: string;
  email: string;
  phone: string;
  servicePackage: string;
  status: ClientStatus;
  monthlyRetainer: string;
  accountManager: string;
  industry: string;
  startDate: string;
}

const emptyForm: ClientForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  servicePackage: 'Social Starter',
  status: 'Onboarding',
  monthlyRetainer: '0',
  accountManager: '',
  industry: '',
  startDate: new Date().toISOString().split('T')[0],
};

/* ============================================================
   LOCAL CLIENT WORKSPACE TYPES
============================================================ */

interface SocialAccount {
  id: string;
  platform: string;
  handle: string;
  url: string;
}

interface BrandGuideline {
  colors: string[];
  typography: string;
  notes: string;
}

interface ClientNote {
  id: string;
  subject: string;
  body: string;
  date: string;
}

interface ProgressEntry {
  id: string;
  date: string;
  project: string;
  progress: string;
}

interface ClientFile {
  id: string;
  name: string;
  title: string;
  summary: string;
  uploadedAt: string;
}

interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  service: string;
  amount: number;
  status: string;
  date: string;
  dueDate: string;
}

interface Communication {
  id: string;
  date: string;
  subject: string;
  recipient: string;
  status: string;
}

/* ============================================================
   LOCAL STORAGE HELPERS
============================================================ */

function storageKey(clientId: string, section: string) {
  return `crm_client_${clientId}_${section}`;
}

function loadStorage<T>(
  clientId: string,
  section: string,
  fallback: T,
): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(
      storageKey(clientId, section),
    );

    if (!raw) return fallback;

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(
  clientId: string,
  section: string,
  value: T,
) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      storageKey(clientId, section),
      JSON.stringify(value),
    );
  } catch {
    // Ignore local storage errors.
  }
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function ClientsPage() {
  const router = useRouter();

  const [refreshKey, setRefreshKey] =
    React.useState(0);

  const {
    data: clients,
    loading,
  } = useFetch(
    fetchClients,
    [refreshKey],
  );

  const {
    data: projects,
  } = useFetch(
    fetchProjects,
    [refreshKey],
  );

  const {
    data: contentItems,
  } = useFetch(
    fetchContentItems,
    [refreshKey],
  );

  const {
    data: invoices,
  } = useFetch(
    fetchInvoices,
    [refreshKey],
  );

  const refetch = () =>
    setRefreshKey((k) => k + 1);

  const [
    selected,
    setSelected,
  ] = React.useState<string | null>(null);

  const [
    search,
    setSearch,
  ] = React.useState('');

  const [
    statusFilter,
    setStatusFilter,
  ] = React.useState('all');

  const [
    open,
    setOpen,
  ] = React.useState(false);

  const [
    editId,
    setEditId,
  ] = React.useState<string | null>(null);

  const [
    submitting,
    setSubmitting,
  ] = React.useState(false);

  const [
    form,
    setForm,
  ] = React.useState<ClientForm>(
    emptyForm,
  );

  const allClients = clients ?? [];
  const allProjects = projects ?? [];
  const allContent = contentItems ?? [];
  const allInvoices = invoices ?? [];

  // ============================================================
// RETAINER KPI CALCULATIONS
// ============================================================

const activeClients = allClients.filter(
  (client) => client.status === 'Active'
);

const activeRetainersTotal = activeClients.reduce(
  (total, client) => total + (Number(client.monthlyRetainer) || 0),
  0
);

const averageRetainer =
  activeClients.length > 0
    ? activeRetainersTotal / activeClients.length
    : 0;

function formatKpiPeso(amount: number) {
  if (amount >= 1_000_000) {
    return `₱${(amount / 1_000_000).toFixed(1)}M`;
  }

  if (amount >= 1_000) {
    return `₱${Math.round(amount / 1_000)}K`;
  }

  return `₱${Math.round(amount).toLocaleString()}`;
}

  const filtered = allClients.filter(
    (c) => {
      const query =
        search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        c.name
          .toLowerCase()
          .includes(query) ||
        c.company
          .toLowerCase()
          .includes(query) ||
        c.email
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        c.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    },
  );

  const selectedClient =
    allClients.find(
      (c) => c.id === selected,
    );

  const clientProjects =
    allProjects.filter(
      (p) =>
        p.client ===
        selectedClient?.company,
    );

  const clientContent =
    allContent.filter(
      (c) =>
        c.client ===
        selectedClient?.company,
    );

  const clientInvoices =
    allInvoices.filter(
      (i) =>
        i.client ===
        selectedClient?.company,
    );

  /* ==========================================================
     ADD CLIENT
  ========================================================== */

  function openAdd() {
    setEditId(null);

    setForm({
      ...emptyForm,
      startDate:
        new Date()
          .toISOString()
          .split('T')[0],
    });

    setOpen(true);
  }

  /* ==========================================================
     EDIT CLIENT
  ========================================================== */

  function openEdit(id: string) {
    const c =
      allClients.find(
        (x) => x.id === id,
      );

    if (!c) return;

    setEditId(id);

    setForm({
      name: c.name,
      company: c.company,
      email: c.email,
      phone: c.phone,
      servicePackage:
        c.servicePackage,
      status: c.status,
      monthlyRetainer:
        String(c.monthlyRetainer),
      accountManager:
        c.accountManager,
      industry: c.industry,
      startDate: c.startDate,
    });

    setOpen(true);
  }

  /* ==========================================================
     SAVE CLIENT
  ========================================================== */

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error(
        'Client name is required.',
      );
      return;
    }

    if (!form.email.trim()) {
      toast.error(
        'Client email is required.',
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        service_package:
          form.servicePackage,
        status: form.status,
        monthly_retainer:
          Number(
            form.monthlyRetainer,
          ) || 0,
        account_manager:
          form.accountManager.trim(),
        industry:
          form.industry.trim(),
        start_date:
          form.startDate,
      };

      if (editId) {
        await updateClient(
          editId,
          payload,
        );

        toast.success(
          'Client updated successfully.',
        );
      } else {
        await insertClient(
          payload,
        );

        toast.success(
          'Client added successfully.',
        );
      }

      setOpen(false);
      setEditId(null);
      setForm({
        ...emptyForm,
      });

      refetch();
    } catch (err: any) {
      toast.error(
        'Failed to save client.',
        {
          description:
            err?.message ||
            'Something went wrong.',
        },
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ==========================================================
     DELETE CLIENT
  ========================================================== */

  async function handleDelete(
    id: string,
  ) {
    const confirmed =
      window.confirm(
        'Delete this client? This will remove the client record.',
      );

    if (!confirmed) return;

    try {
      await deleteClient(id);

      toast.success(
        'Client deleted.',
      );

      setSelected(null);
      refetch();
    } catch (err: any) {
      toast.error(
        'Failed to delete client.',
        {
          description:
            err?.message ||
            'Something went wrong.',
        },
      );
    }
  }

  /* ==========================================================
     CLIENT PROFILE
  ========================================================== */

  if (selectedClient) {
    return (
      <ClientWorkspace
        client={selectedClient}
        clientProjects={clientProjects}
        clientContent={clientContent}
        clientInvoices={clientInvoices}
        onBack={() =>
          setSelected(null)
        }
        onEdit={() =>
          openEdit(
            selectedClient.id,
          )
        }
        onDelete={() =>
          handleDelete(
            selectedClient.id,
          )
        }
        onRefresh={refetch}
        router={router}
      >
        <ClientDialog
          open={open}
          onOpenChange={setOpen}
          editId={editId}
          form={form}
          setForm={setForm}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      </ClientWorkspace>
    );
  }

  /* ==========================================================
     CLIENT LIST
  ========================================================== */

  return (
    <DashboardShell>
      <PageHeader
        title="Clients"
        description="Manage your client relationships and retainers"
      >
        <Button
          size="sm"
          onClick={openAdd}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Client
        </Button>
      </PageHeader>

      {/* KPIs */}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total Clients"
          value={String(
            allClients.length,
          )}
          delta="+2"
          trend="up"
          icon={UsersIcon}
          index={0}
        />

        <KpiCard
          label="Active Retainers"
          value={formatKpiPeso(activeRetainersTotal)}
          delta="+₱20K"
          trend="up"
          icon={DollarSign}
          accent="text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400"
          index={1}
        />

        <KpiCard
          label="Avg. Retainer"
          value={formatKpiPeso(averageRetainer)}
          delta="+₱2K"
          trend="up"
          icon={TrendingUp}
          accent="text-violet-600 bg-violet-100 dark:bg-violet-500/15 dark:text-violet-400"
          index={2}
        />

        <KpiCard
          label="Onboarding"
          value={String(
            allClients.filter(
              (c) =>
                c.status ===
                'Onboarding',
            ).length,
          )}
          icon={UsersIcon}
          accent="text-blue-600 bg-blue-100 dark:bg-blue-500/15 dark:text-blue-400"
          index={3}
        />
      </div>

      {/* SEARCH / FILTER */}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search clients by name, company or email..."
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
          value={statusFilter}
          onValueChange={
            setStatusFilter
          }
        >
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All statuses
            </SelectItem>

            {statusOptions.map(
              (status) => (
                <SelectItem
                  key={status}
                  value={status}
                >
                  {status}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      {/* CLIENT TABLE */}

      <Card className="mt-4 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                Client
              </TableHead>

              <TableHead>
                Company
              </TableHead>

              <TableHead>
                Package
              </TableHead>

              <TableHead>
                Status
              </TableHead>

              <TableHead className="text-right">
                Retainer
              </TableHead>

              <TableHead>
                Account Mgr
              </TableHead>

              <TableHead>
                Next Meeting
              </TableHead>

              <TableHead>
                Last Activity
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({
                length: 4,
              }).map((_, i) => (
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
                        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                      </TableCell>
                    ),
                  )}
                </TableRow>
              ))
            ) : (
              <AnimatePresence>
                {filtered.map(
                  (c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      transition={{
                        delay:
                          i *
                          0.03,
                      }}
                      className="cursor-pointer border-b transition-colors hover:bg-muted/50"
                      onClick={() =>
                        setSelected(
                          c.id,
                        )
                      }
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            initials={c.name
                              .split(
                                ' ',
                              )
                              .map(
                                (
                                  n,
                                ) =>
                                  n[0],
                              )
                              .join(
                                '',
                              )}
                            className="h-9 w-9"
                          />

                          <div>
                            <p className="font-medium">
                              {c.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {c.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="font-medium">
                        {c.company}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {c.servicePackage}
                      </TableCell>

                      <TableCell>
                        <StatusBadge
                          status={
                            c.status
                          }
                        />
                      </TableCell>

                      <TableCell className="text-right font-medium tabular-nums">
                        {formatPeso(
                          c.monthlyRetainer,
                        )}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {c.accountManager}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {c.nextMeeting ===
                        '—'
                          ? '—'
                          : c.nextMeeting?.split(
                              'T',
                            )[0] ||
                            '—'}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {c.lastActivity}
                      </TableCell>
                    </motion.tr>
                  ),
                )}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>

        {filtered.length ===
          0 &&
          !loading && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No clients match
              your search.
            </div>
          )}
      </Card>

      <ClientDialog
        open={open}
        onOpenChange={setOpen}
        editId={editId}
        form={form}
        setForm={setForm}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </DashboardShell>
  );
}

/* ============================================================
   CLIENT WORKSPACE
============================================================ */

function ClientWorkspace({
  client,
  clientProjects,
  clientContent,
  clientInvoices,
  onBack,
  onEdit,
  onDelete,
  onRefresh,
  router,
  children,
}: {
  client: any;
  clientProjects: any[];
  clientContent: any[];
  clientInvoices: any[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  router: ReturnType<
    typeof useRouter
  >;
  children: React.ReactNode;
}) {
  const [
    activeTab,
    setActiveTab,
  ] = React.useState(
    'overview',
  );

  /* ==========================================================
     LOCAL WORKSPACE DATA
  ========================================================== */

  const [
    socials,
    setSocials,
  ] = React.useState<
    SocialAccount[]
  >([]);

  const [
    brand,
    setBrand,
  ] = React.useState<BrandGuideline>(
    {
      colors: [],
      typography: '',
      notes: '',
    },
  );

  const [
    notes,
    setNotes,
  ] = React.useState<
    ClientNote[]
  >([]);

  const [
    progressEntries,
    setProgressEntries,
  ] = React.useState<
    ProgressEntry[]
  >([]);

  const [
    files,
    setFiles,
  ] = React.useState<
    ClientFile[]
  >([]);

  const [
    workspaceInvoices,
    setWorkspaceInvoices,
  ] = React.useState<
    ClientInvoice[]
  >([]);

  const [
    communications,
    setCommunications,
  ] = React.useState<
    Communication[]
  >([]);

  React.useEffect(() => {
    setSocials(
      loadStorage(
        client.id,
        'socials',
        [],
      ),
    );

    setBrand(
      loadStorage(
        client.id,
        'brand',
        {
          colors:
            client.brandColors ||
            [],
          typography: '',
          notes: '',
        },
      ),
    );

    setNotes(
      loadStorage(
        client.id,
        'notes',
        [],
      ),
    );

    setProgressEntries(
      loadStorage(
        client.id,
        'progress',
        [],
      ),
    );

    setFiles(
      loadStorage(
        client.id,
        'files',
        [],
      ),
    );

    setWorkspaceInvoices(
      loadStorage(
        client.id,
        'invoices',
        [],
      ),
    );

    setCommunications(
      loadStorage(
        client.id,
        'communications',
        [],
      ),
    );
  }, [
    client.id,
    client.brandColors,
  ]);

  /* ==========================================================
     DIALOG STATES
  ========================================================== */

  const [
    socialOpen,
    setSocialOpen,
  ] = React.useState(false);

  const [
    socialEditId,
    setSocialEditId,
  ] = React.useState<
    string | null
  >(null);

  const [
    socialForm,
    setSocialForm,
  ] = React.useState({
    platform: 'Instagram',
    handle: '',
    url: '',
  });

  const [
    brandOpen,
    setBrandOpen,
  ] = React.useState(false);

  const [
    noteOpen,
    setNoteOpen,
  ] = React.useState(false);

  const [
    noteEditId,
    setNoteEditId,
  ] = React.useState<
    string | null
  >(null);

  const [
    noteForm,
    setNoteForm,
  ] = React.useState({
    subject: '',
    body: '',
  });

  const [
    progressOpen,
    setProgressOpen,
  ] = React.useState(false);

  const [
    progressForm,
    setProgressForm,
  ] = React.useState({
    date: new Date()
      .toISOString()
      .split('T')[0],
    project:
      clientProjects[0]?.name ||
      '',
    progress: '',
  });

  const [
    fileOpen,
    setFileOpen,
  ] = React.useState(false);

  const [
    fileForm,
    setFileForm,
  ] = React.useState({
    name: '',
    title: '',
    summary: '',
  });

  const [
    invoiceOpen,
    setInvoiceOpen,
  ] = React.useState(false);

  const [
    invoiceEditId,
    setInvoiceEditId,
  ] = React.useState<
    string | null
  >(null);

  const [
    invoiceForm,
    setInvoiceForm,
  ] = React.useState({
    invoiceNumber: '',
    service: '',
    amount: '',
    status: 'Pending',
    date: new Date()
      .toISOString()
      .split('T')[0],
    dueDate: '',
  });

  const [
    emailOpen,
    setEmailOpen,
  ] = React.useState(false);

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

  /* ==========================================================
     SAVE HELPERS
  ========================================================== */

  function saveSocials(
    value: SocialAccount[],
  ) {
    setSocials(value);
    saveStorage(
      client.id,
      'socials',
      value,
    );
  }

  function saveBrand(
    value: BrandGuideline,
  ) {
    setBrand(value);
    saveStorage(
      client.id,
      'brand',
      value,
    );
  }

  function saveNotes(
    value: ClientNote[],
  ) {
    setNotes(value);
    saveStorage(
      client.id,
      'notes',
      value,
    );
  }

  function saveProgress(
    value: ProgressEntry[],
  ) {
    setProgressEntries(value);
    saveStorage(
      client.id,
      'progress',
      value,
    );
  }

  function saveFiles(
    value: ClientFile[],
  ) {
    setFiles(value);
    saveStorage(
      client.id,
      'files',
      value,
    );
  }

  function saveInvoices(
    value: ClientInvoice[],
  ) {
    setWorkspaceInvoices(value);
    saveStorage(
      client.id,
      'invoices',
      value,
    );
  }

  function saveCommunications(
    value: Communication[],
  ) {
    setCommunications(value);
    saveStorage(
      client.id,
      'communications',
      value,
    );
  }

  /* ==========================================================
     SOCIAL ACCOUNTS
  ========================================================== */

  function openAddSocial() {
    setSocialEditId(null);

    setSocialForm({
      platform: 'Instagram',
      handle: '',
      url: '',
    });

    setSocialOpen(true);
  }

  function openEditSocial(
    social: SocialAccount,
  ) {
    setSocialEditId(
      social.id,
    );

    setSocialForm({
      platform:
        social.platform,
      handle:
        social.handle,
      url: social.url,
    });

    setSocialOpen(true);
  }

  function saveSocial() {
    if (
      !socialForm.handle.trim()
    ) {
      toast.error(
        'Social handle is required.',
      );
      return;
    }

    if (socialEditId) {
      saveSocials(
        socials.map((s) =>
          s.id ===
          socialEditId
            ? {
                ...s,
                ...socialForm,
              }
            : s,
        ),
      );

      toast.success(
        'Social account updated.',
      );
    } else {
      saveSocials([
        ...socials,
        {
          id:
            crypto.randomUUID(),
          ...socialForm,
        },
      ]);

      toast.success(
        'Social account added.',
      );
    }

    setSocialOpen(false);
  }

  function deleteSocial(
    id: string,
  ) {
    saveSocials(
      socials.filter(
        (s) => s.id !== id,
      ),
    );
  }

  /* ==========================================================
     BRAND
  ========================================================== */

  function openBrand() {
    setBrandOpen(true);
  }

  /* ==========================================================
     NOTES
  ========================================================== */

  function openAddNote() {
    setNoteEditId(null);

    setNoteForm({
      subject: '',
      body: '',
    });

    setNoteOpen(true);
  }

  function openEditNote(
    note: ClientNote,
  ) {
    setNoteEditId(
      note.id,
    );

    setNoteForm({
      subject:
        note.subject,
      body: note.body,
    });

    setNoteOpen(true);
  }

  function saveNote() {
    if (
      !noteForm.subject.trim() ||
      !noteForm.body.trim()
    ) {
      toast.error(
        'Subject and note are required.',
      );
      return;
    }

    if (noteEditId) {
      saveNotes(
        notes.map((n) =>
          n.id ===
          noteEditId
            ? {
                ...n,
                subject:
                  noteForm.subject,
                body:
                  noteForm.body,
              }
            : n,
        ),
      );
    } else {
      saveNotes([
        {
          id:
            crypto.randomUUID(),
          subject:
            noteForm.subject,
          body:
            noteForm.body,
          date: new Date().toISOString(),
        },
        ...notes,
      ]);
    }

    toast.success(
      noteEditId
        ? 'Note updated.'
        : 'Note added.',
    );

    setNoteOpen(false);
  }

  function deleteNote(
    id: string,
  ) {
    saveNotes(
      notes.filter(
        (n) => n.id !== id,
      ),
    );
  }

  /* ==========================================================
     PROGRESS
  ========================================================== */

  function openAddProgress() {
    setProgressForm({
      date: new Date()
        .toISOString()
        .split('T')[0],
      project:
        clientProjects[0]?.name ||
        '',
      progress: '',
    });

    setProgressOpen(true);
  }

  function saveProgressEntry() {
    if (
      !progressForm.progress.trim()
    ) {
      toast.error(
        'Progress note is required.',
      );
      return;
    }

    saveProgress([
      {
        id:
          crypto.randomUUID(),
        date:
          progressForm.date,
        project:
          progressForm.project ||
          'General',
        progress:
          progressForm.progress,
      },
      ...progressEntries,
    ]);

    toast.success(
      'Progress added to calendar.',
    );

    setProgressOpen(false);
  }

  function deleteProgress(
    id: string,
  ) {
    saveProgress(
      progressEntries.filter(
        (p) => p.id !== id,
      ),
    );
  }

  /* ==========================================================
     FILES
  ========================================================== */

  function saveFile() {
    if (
      !fileForm.name.trim() ||
      !fileForm.title.trim()
    ) {
      toast.error(
        'File name and title are required.',
      );
      return;
    }

    saveFiles([
      {
        id:
          crypto.randomUUID(),
        name: fileForm.name,
        title: fileForm.title,
        summary:
          fileForm.summary,
        uploadedAt:
          new Date().toISOString(),
      },
      ...files,
    ]);

    toast.success(
      'File record added.',
    );

    setFileForm({
      name: '',
      title: '',
      summary: '',
    });

    setFileOpen(false);
  }

  function deleteFile(
    id: string,
  ) {
    saveFiles(
      files.filter(
        (f) => f.id !== id,
      ),
    );
  }

  /* ==========================================================
     INVOICES
  ========================================================== */

  function openAddInvoice() {
    setInvoiceEditId(null);

    setInvoiceForm({
      invoiceNumber:
        `INV-${String(
          workspaceInvoices.length +
            clientInvoices.length +
            1,
        ).padStart(3, '0')}`,
      service:
        client.servicePackage ||
        '',
      amount: '',
      status: 'Pending',
      date: new Date()
        .toISOString()
        .split('T')[0],
      dueDate: '',
    });

    setInvoiceOpen(true);
  }

  function openEditInvoice(
    invoice: ClientInvoice,
  ) {
    setInvoiceEditId(
      invoice.id,
    );

    setInvoiceForm({
      invoiceNumber:
        invoice.invoiceNumber,
      service:
        invoice.service,
      amount:
        String(invoice.amount),
      status:
        invoice.status,
      date:
        invoice.date,
      dueDate:
        invoice.dueDate,
    });

    setInvoiceOpen(true);
  }

  function saveInvoice() {
    if (
      !invoiceForm.invoiceNumber.trim() ||
      !invoiceForm.service.trim()
    ) {
      toast.error(
        'Invoice number and service are required.',
      );
      return;
    }

    const invoice: ClientInvoice =
      {
        id:
          invoiceEditId ||
          crypto.randomUUID(),
        invoiceNumber:
          invoiceForm.invoiceNumber,
        service:
          invoiceForm.service,
        amount:
          Number(
            invoiceForm.amount,
          ) || 0,
        status:
          invoiceForm.status,
        date:
          invoiceForm.date,
        dueDate:
          invoiceForm.dueDate,
      };

    if (invoiceEditId) {
      saveInvoices(
        workspaceInvoices.map(
          (item) =>
            item.id ===
            invoiceEditId
              ? invoice
              : item,
        ),
      );
    } else {
      saveInvoices([
        invoice,
        ...workspaceInvoices,
      ]);
    }

    toast.success(
      invoiceEditId
        ? 'Invoice updated.'
        : 'Invoice added.',
    );

    setInvoiceOpen(false);
  }

  function deleteInvoice(
    id: string,
  ) {
    saveInvoices(
      workspaceInvoices.filter(
        (i) => i.id !== id,
      ),
    );
  }

  /* ==========================================================
     EMAIL
  ========================================================== */

  function openEmailComposer() {
    setEmailSubject(
      `Project Update - ${client.company}`,
    );

    setEmailMessage(
      `Hi ${client.name},

I wanted to give you a quick update regarding our work for ${client.company}.

Please let us know if you have any questions or additional feedback.

Best regards,
Dev|withMe`,
    );

    setEmailOpen(true);
  }

  async function handleSendEmail() {
    if (!client.email?.trim()) {
      toast.error(
        'This client does not have an email address.',
      );
      return;
    }

    if (
      !emailSubject.trim()
    ) {
      toast.error(
        'Email subject is required.',
      );
      return;
    }

    if (
      !emailMessage.trim()
    ) {
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
            body: JSON.stringify(
              {
                to: client.email,
                subject:
                  emailSubject,
                message:
                  emailMessage,
              },
            ),
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

      saveCommunications([
        {
          id:
            crypto.randomUUID(),
          date:
            new Date().toISOString(),
          subject:
            emailSubject,
          recipient:
            client.email,
          status: 'Sent',
        },
        ...communications,
      ]);

      toast.success(
        'Email sent successfully!',
        {
          description:
            `Email sent to ${client.email}`,
        },
      );

      setEmailOpen(false);
      setEmailSubject('');
      setEmailMessage('');
    } catch (err: any) {
      console.error(
        'Client email error:',
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

  /* ==========================================================
     COMBINED DATA
  ========================================================== */

  const combinedInvoices = [
    ...workspaceInvoices,
    ...clientInvoices.map(
      (inv: any) => ({
        id: `api-${inv.id}`,
        invoiceNumber:
          inv.id,
        service:
          inv.service,
        amount:
          inv.amount,
        status:
          inv.status,
        date: '',
        dueDate: '',
      }),
    ),
  ];

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <DashboardShell>
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to clients
      </button>

      {/* ======================================================
         CLIENT PROFILE HEADER
      ====================================================== */}

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                initials={client.name
                  .split(' ')
                  .map(
                    (n: string) =>
                      n[0],
                  )
                  .join('')}
                className="h-16 w-16 text-lg"
              />

              <div>
                <h2 className="text-xl font-bold">
                  {client.name}
                </h2>

                <p className="text-sm text-muted-foreground">
                  {client.company}
                  {client.industry
                    ? ` · ${client.industry}`
                    : ''}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge
                    status={
                      client.status
                    }
                  />

                  <Badge variant="secondary">
                    {
                      client.servicePackage
                    }
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
              >
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={
                  openEmailComposer
                }
              >
                <Mail className="mr-1.5 h-4 w-4" />
                Email
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  router.push(
                    `/projects?clientId=${encodeURIComponent(
                      client.id,
                    )}&client=${encodeURIComponent(
                      client.company,
                    )}`,
                  );
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                New Project
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">
                Monthly Retainer
              </p>

              <p className="text-lg font-bold tabular-nums">
                {formatPeso(
                  client.monthlyRetainer,
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Account Manager
              </p>

              <p className="text-sm font-semibold">
                {client.accountManager ||
                  'Not assigned'}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Start Date
              </p>

              <p className="text-sm font-semibold">
                {client.startDate ||
                  '—'}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Last Activity
              </p>

              <p className="text-sm font-semibold">
                {client.lastActivity ||
                  '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ======================================================
         TABS
      ====================================================== */}

      <Tabs
        value={activeTab}
        onValueChange={
          setActiveTab
        }
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">
            Overview
          </TabsTrigger>

          <TabsTrigger value="projects">
            Projects
          </TabsTrigger>

          <TabsTrigger value="calendar">
            Content Calendar
          </TabsTrigger>

          <TabsTrigger value="files">
            Files
          </TabsTrigger>

          <TabsTrigger value="invoices">
            Invoices
          </TabsTrigger>

          <TabsTrigger value="notes">
            Notes
          </TabsTrigger>

          <TabsTrigger value="communications">
            Communications
          </TabsTrigger>
        </TabsList>

        {/* ====================================================
           OVERVIEW
        ==================================================== */}

        <TabsContent
          value="overview"
          className="mt-4"
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {/* CONTACT */}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Contact Details
                  </CardTitle>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onEdit}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />

                  <a
                    href={`mailto:${client.email}`}
                    className="truncate hover:underline"
                  >
                    {client.email ||
                      'No email'}
                  </a>
                </div>

                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />

                  <span>
                    {client.phone ||
                      'No phone'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />

                  <span>
                    {client.industry ||
                      'Industry not specified'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* SOCIAL */}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Social Accounts
                  </CardTitle>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={
                      openAddSocial
                    }
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {socials.length ===
                0 ? (
                  <div className="rounded-lg border border-dashed p-5 text-center">
                    <Globe className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />

                    <p className="text-sm text-muted-foreground">
                      No social accounts
                      added yet.
                    </p>
                  </div>
                ) : (
                  socials.map(
                    (social) => (
                      <div
                        key={
                          social.id
                        }
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {social.platform ===
                          'Instagram' ? (
                            <Instagram className="h-4 w-4 shrink-0" />
                          ) : social.platform ===
                            'Facebook' ? (
                            <Facebook className="h-4 w-4 shrink-0" />
                          ) : social.platform ===
                            'LinkedIn' ? (
                            <Linkedin className="h-4 w-4 shrink-0" />
                          ) : (
                            <Globe className="h-4 w-4 shrink-0" />
                          )}

                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">
                              {
                                social.platform
                              }
                            </p>

                            <p className="truncate text-sm font-medium">
                              {
                                social.handle
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          {social.url && (
                            <Button
                              size="icon"
                              variant="ghost"
                              asChild
                            >
                              <a
                                href={
                                  social.url
                                }
                                target="_blank"
                                rel="noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              openEditSocial(
                                social,
                              )
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              deleteSocial(
                                social.id,
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ),
                  )
                )}
              </CardContent>
            </Card>

            {/* BRAND */}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Brand Guidelines
                  </CardTitle>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={
                      openBrand
                    }
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {brand.colors
                  .length ===
                0 ? (
                  <div className="rounded-lg border border-dashed p-5 text-center">
                    <Palette className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />

                    <p className="text-sm text-muted-foreground">
                      No brand colors
                      added yet.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {brand.colors.map(
                      (color) => (
                        <div
                          key={
                            color
                          }
                          className="flex flex-col items-center gap-1.5"
                        >
                          <div
                            className="h-12 w-12 rounded-lg border"
                            style={{
                              background:
                                color,
                            }}
                          />

                          <span className="text-[10px] text-muted-foreground">
                            {color}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                )}

                {brand.typography && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground">
                      Typography
                    </p>

                    <p className="text-sm font-medium">
                      {
                        brand.typography
                      }
                    </p>
                  </div>
                )}

                {brand.notes && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground">
                      Brand Notes
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {
                        brand.notes
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ====================================================
           PROJECTS
        ==================================================== */}

        <TabsContent
          value="projects"
          className="mt-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                Client Projects
              </h3>

              <p className="text-sm text-muted-foreground">
                Projects connected to{' '}
                {client.company}.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() =>
                router.push(
                  `/projects?clientId=${encodeURIComponent(
                    client.id,
                  )}&client=${encodeURIComponent(
                    client.company,
                  )}`,
                )
              }
            >
              <Plus className="mr-1.5 h-4 w-4" />
              New Project
            </Button>
          </div>

          <div className="space-y-3">
            {clientProjects.length ===
            0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FolderKanban className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                  <p className="font-medium">
                    No projects yet
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Create the first
                    project for this
                    client.
                  </p>
                </CardContent>
              </Card>
            ) : (
              clientProjects.map(
                (project: any) => (
                  <Card
                    key={
                      project.id
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <FolderKanban className="h-4 w-4 text-muted-foreground" />

                            <p className="truncate font-semibold">
                              {
                                project.name
                              }
                            </p>
                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {
                              project.serviceType
                            }{' '}
                            · Due{' '}
                            {
                              project.deadline
                            }
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="hidden w-32 sm:block">
                            <ProgressBar
                              value={
                                project.progress ||
                                0
                              }
                            />
                          </div>

                          <StatusBadge
                            status={
                              project.stage
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ),
              )
            )}
          </div>
        </TabsContent>

        {/* ====================================================
           CONTENT CALENDAR
        ==================================================== */}

        <TabsContent
          value="calendar"
          className="mt-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                Content Calendar
              </h3>

              <p className="text-sm text-muted-foreground">
                Track content and
                project progress by
                date.
              </p>
            </div>

            <Button
              size="sm"
              onClick={
                openAddProgress
              }
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Progress
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* EXISTING CONTENT */}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Scheduled Content
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {clientContent.length ===
                0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No content scheduled
                    yet.
                  </p>
                ) : (
                  clientContent.map(
                    (content: any) => (
                      <div
                        key={
                          content.id
                        }
                        className="rounded-lg border p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">
                              {
                                content.caption
                              }
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {
                                content.platform
                              }{' '}
                              ·{' '}
                              {
                                content.scheduledDate
                              }
                            </p>
                          </div>

                          <StatusBadge
                            status={
                              content.status
                            }
                          />
                        </div>
                      </div>
                    ),
                  )
                )}
              </CardContent>
            </Card>

            {/* PROGRESS */}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Progress Timeline
                </CardTitle>
              </CardHeader>

              <CardContent>
                {progressEntries.length ===
                0 ? (
                  <div className="py-8 text-center">
                    <CalendarDays className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />

                    <p className="text-sm text-muted-foreground">
                      No progress entries
                      yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[
                      ...progressEntries,
                    ]
                      .sort(
                        (a, b) =>
                          b.date.localeCompare(
                            a.date,
                          ),
                      )
                      .map(
                        (
                          entry,
                        ) => (
                          <div
                            key={
                              entry.id
                            }
                            className="relative border-l pl-4"
                          >
                            <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-primary" />

                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-medium text-primary">
                                  {
                                    entry.date
                                  }
                                </p>

                                <p className="mt-1 text-sm font-semibold">
                                  {
                                    entry.project
                                  }
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                  {
                                    entry.progress
                                  }
                                </p>
                              </div>

                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  deleteProgress(
                                    entry.id,
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ),
                      )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ====================================================
           FILES
        ==================================================== */}

        <TabsContent
          value="files"
          className="mt-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                Client Files
              </h3>

              <p className="text-sm text-muted-foreground">
                Keep client documents
                and asset records
                organized.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() =>
                setFileOpen(true)
              }
            >
              <Upload className="mr-1.5 h-4 w-4" />
              Add File
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {files.length ===
              0 ? (
                <div className="py-14 text-center">
                  <Paperclip className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                  <p className="font-medium">
                    No files recorded
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Add your client
                    documents here.
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
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <span className="hidden text-xs text-muted-foreground sm:block">
                            {new Date(
                              file.uploadedAt,
                            ).toLocaleDateString()}
                          </span>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              deleteFile(
                                file.id,
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====================================================
           INVOICES
        ==================================================== */}

        <TabsContent
          value="invoices"
          className="mt-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                Client Invoices
              </h3>

              <p className="text-sm text-muted-foreground">
                Track billing for this
                client.
              </p>
            </div>

            <Button
              size="sm"
              onClick={
                openAddInvoice
              }
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Invoice
            </Button>
          </div>

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    Invoice
                  </TableHead>

                  <TableHead>
                    Service
                  </TableHead>

                  <TableHead>
                    Amount
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>

                  <TableHead>
                    Date
                  </TableHead>

                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {combinedInvoices.length ===
                0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center"
                    >
                      <FileText className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />

                      <p className="text-sm text-muted-foreground">
                        No invoices yet.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  combinedInvoices.map(
                    (invoice) => {
                      const editable =
                        !invoice.id.startsWith(
                          'api-',
                        );

                      return (
                        <TableRow
                          key={
                            invoice.id
                          }
                        >
                          <TableCell className="font-medium">
                            {
                              invoice.invoiceNumber
                            }
                          </TableCell>

                          <TableCell>
                            {
                              invoice.service
                            }
                          </TableCell>

                          <TableCell className="tabular-nums">
                            {formatPeso(
                              invoice.amount,
                            )}
                          </TableCell>

                          <TableCell>
                            <Badge variant="secondary">
                              {
                                invoice.status
                              }
                            </Badge>
                          </TableCell>

                          <TableCell className="text-muted-foreground">
                            {
                              invoice.date ||
                              '—'
                            }
                          </TableCell>

                          <TableCell className="text-right">
                            {editable && (
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() =>
                                    openEditInvoice(
                                      invoice,
                                    )
                                  }
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>

                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() =>
                                    deleteInvoice(
                                      invoice.id,
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
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
           NOTES
        ==================================================== */}

        <TabsContent
          value="notes"
          className="mt-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                Client Notes
              </h3>

              <p className="text-sm text-muted-foreground">
                Store meeting notes,
                requests and internal
                reminders.
              </p>
            </div>

            <Button
              size="sm"
              onClick={
                openAddNote
              }
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Note
            </Button>
          </div>

          {notes.length ===
          0 ? (
            <Card>
              <CardContent className="py-14 text-center">
                <StickyNote className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                <p className="font-medium">
                  No notes recorded
                  yet.
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Add your first
                  client note.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {notes.map(
                (note) => (
                  <Card
                    key={
                      note.id
                    }
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-base">
                            {
                              note.subject
                            }
                          </CardTitle>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(
                              note.date,
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              openEditNote(
                                note,
                              )
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              deleteNote(
                                note.id,
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                        {
                          note.body
                        }
                      </p>
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          )}
        </TabsContent>

        {/* ====================================================
           COMMUNICATIONS
        ==================================================== */}

        <TabsContent
          value="communications"
          className="mt-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                Communications
              </h3>

              <p className="text-sm text-muted-foreground">
                Keep a history of your
                client emails.
              </p>
            </div>

            <Button
              size="sm"
              onClick={
                openEmailComposer
              }
            >
              <Mail className="mr-1.5 h-4 w-4" />
              Compose Email
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {communications.length ===
              0 ? (
                <div className="py-14 text-center">
                  <MessageSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                  <p className="font-medium">
                    No communication
                    history yet.
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Emails sent from
                    this client workspace
                    will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {communications.map(
                    (
                      communication,
                    ) => (
                      <div
                        key={
                          communication.id
                        }
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-muted p-2">
                            <Mail className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="font-medium">
                              {
                                communication.subject
                              }
                            </p>

                            <p className="text-sm text-muted-foreground">
                              {
                                communication.recipient
                              }
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(
                                communication.date,
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <Badge variant="secondary">
                          {
                            communication.status
                          }
                        </Badge>
                      </div>
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ======================================================
         SOCIAL DIALOG
      ====================================================== */}

      <Dialog
        open={socialOpen}
        onOpenChange={
          setSocialOpen
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {socialEditId
                ? 'Edit Social Account'
                : 'Add Social Account'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Platform
              </Label>

              <Select
                value={
                  socialForm.platform
                }
                onValueChange={(
                  value,
                ) =>
                  setSocialForm(
                    {
                      ...socialForm,
                      platform:
                        value,
                    },
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {socialPlatforms.map(
                    (
                      platform,
                    ) => (
                      <SelectItem
                        key={
                          platform
                        }
                        value={
                          platform
                        }
                      >
                        {platform}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Handle / Account
              </Label>

              <Input
                value={
                  socialForm.handle
                }
                onChange={(e) =>
                  setSocialForm(
                    {
                      ...socialForm,
                      handle:
                        e.target
                          .value,
                    },
                  )
                }
                placeholder="@brandname"
              />
            </div>

            <div className="space-y-2">
              <Label>
                Profile URL
              </Label>

              <Input
                value={
                  socialForm.url
                }
                onChange={(e) =>
                  setSocialForm(
                    {
                      ...socialForm,
                      url: e.target
                        .value,
                    },
                  )
                }
                placeholder="https://"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setSocialOpen(
                  false,
                )
              }
            >
              Cancel
            </Button>

            <Button
              onClick={
                saveSocial
              }
            >
              <Save className="mr-1.5 h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================
         BRAND DIALOG
      ====================================================== */}

      <BrandDialog
        open={brandOpen}
        onOpenChange={
          setBrandOpen
        }
        brand={brand}
        onSave={(value) => {
          saveBrand(value);
          setBrandOpen(false);

          toast.success(
            'Brand guidelines updated.',
          );
        }}
      />

      {/* ======================================================
         NOTE DIALOG
      ====================================================== */}

      <Dialog
        open={noteOpen}
        onOpenChange={
          setNoteOpen
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {noteEditId
                ? 'Edit Note'
                : 'Add Client Note'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Subject
              </Label>

              <Input
                value={
                  noteForm.subject
                }
                onChange={(e) =>
                  setNoteForm(
                    {
                      ...noteForm,
                      subject:
                        e.target
                          .value,
                    },
                  )
                }
                placeholder="Meeting Notes"
              />
            </div>

            <div className="space-y-2">
              <Label>
                Note
              </Label>

              <textarea
                value={
                  noteForm.body
                }
                onChange={(e) =>
                  setNoteForm(
                    {
                      ...noteForm,
                      body:
                        e.target
                          .value,
                    },
                  )
                }
                rows={7}
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Write your client note..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setNoteOpen(
                  false,
                )
              }
            >
              Cancel
            </Button>

            <Button
              onClick={
                saveNote
              }
            >
              <Save className="mr-1.5 h-4 w-4" />
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================
         PROGRESS DIALOG
      ====================================================== */}

      <Dialog
        open={progressOpen}
        onOpenChange={
          setProgressOpen
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Progress Entry
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Date
              </Label>

              <Input
                type="date"
                value={
                  progressForm.date
                }
                onChange={(e) =>
                  setProgressForm(
                    {
                      ...progressForm,
                      date: e.target
                        .value,
                    },
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Project
              </Label>

              <Input
                value={
                  progressForm.project
                }
                onChange={(e) =>
                  setProgressForm(
                    {
                      ...progressForm,
                      project:
                        e.target
                          .value,
                    },
                  )
                }
                placeholder="ABC Website"
              />
            </div>

            <div className="space-y-2">
              <Label>
                Progress
              </Label>

              <textarea
                value={
                  progressForm.progress
                }
                onChange={(e) =>
                  setProgressForm(
                    {
                      ...progressForm,
                      progress:
                        e.target
                          .value,
                    },
                  )
                }
                rows={5}
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Homepage completed, waiting for client feedback..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setProgressOpen(
                  false,
                )
              }
            >
              Cancel
            </Button>

            <Button
              onClick={
                saveProgressEntry
              }
            >
              <CalendarDays className="mr-1.5 h-4 w-4" />
              Add Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================
         FILE DIALOG
      ====================================================== */}

      <Dialog
        open={fileOpen}
        onOpenChange={
          setFileOpen
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Client File
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                File Name
              </Label>

              <Input
                value={
                  fileForm.name
                }
                onChange={(e) =>
                  setFileForm(
                    {
                      ...fileForm,
                      name: e.target
                        .value,
                    },
                  )
                }
                placeholder="Brand Guidelines.pdf"
              />
            </div>

            <div className="space-y-2">
              <Label>
                File Title
              </Label>

              <Input
                value={
                  fileForm.title
                }
                onChange={(e) =>
                  setFileForm(
                    {
                      ...fileForm,
                      title:
                        e.target
                          .value,
                    },
                  )
                }
                placeholder="Brand Guidelines"
              />
            </div>

            <div className="space-y-2">
              <Label>
                Short Summary
              </Label>

              <textarea
                value={
                  fileForm.summary
                }
                onChange={(e) =>
                  setFileForm(
                    {
                      ...fileForm,
                      summary:
                        e.target
                          .value,
                    },
                  )
                }
                rows={4}
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Official brand colors, typography and usage rules."
              />
            </div>

            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              <Paperclip className="mx-auto mb-2 h-5 w-5" />

              File upload storage
              will be connected to
              Supabase Storage in the
              next backend phase.
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setFileOpen(
                  false,
                )
              }
            >
              Cancel
            </Button>

            <Button
              onClick={
                saveFile
              }
            >
              <Save className="mr-1.5 h-4 w-4" />
              Save File Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================
         INVOICE DIALOG
      ====================================================== */}

      <Dialog
        open={invoiceOpen}
        onOpenChange={
          setInvoiceOpen
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {invoiceEditId
                ? 'Edit Invoice'
                : 'Add Invoice'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Invoice Number
              </Label>

              <Input
                value={
                  invoiceForm.invoiceNumber
                }
                onChange={(e) =>
                  setInvoiceForm(
                    {
                      ...invoiceForm,
                      invoiceNumber:
                        e.target
                          .value,
                    },
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Service
              </Label>

              <Input
                value={
                  invoiceForm.service
                }
                onChange={(e) =>
                  setInvoiceForm(
                    {
                      ...invoiceForm,
                      service:
                        e.target
                          .value,
                    },
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Amount (₱)
              </Label>

              <Input
                type="number"
                value={
                  invoiceForm.amount
                }
                onChange={(e) =>
                  setInvoiceForm(
                    {
                      ...invoiceForm,
                      amount:
                        e.target
                          .value,
                    },
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Status
              </Label>

              <Select
                value={
                  invoiceForm.status
                }
                onValueChange={(
                  value,
                ) =>
                  setInvoiceForm(
                    {
                      ...invoiceForm,
                      status:
                        value,
                    },
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {invoiceStatuses.map(
                    (status) => (
                      <SelectItem
                        key={
                          status
                        }
                        value={
                          status
                        }
                      >
                        {status}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Invoice Date
              </Label>

              <Input
                type="date"
                value={
                  invoiceForm.date
                }
                onChange={(e) =>
                  setInvoiceForm(
                    {
                      ...invoiceForm,
                      date: e.target
                        .value,
                    },
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Due Date
              </Label>

              <Input
                type="date"
                value={
                  invoiceForm.dueDate
                }
                onChange={(e) =>
                  setInvoiceForm(
                    {
                      ...invoiceForm,
                      dueDate:
                        e.target
                          .value,
                    },
                  )
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setInvoiceOpen(
                  false,
                )
              }
            >
              Cancel
            </Button>

            <Button
              onClick={
                saveInvoice
              }
            >
              <Save className="mr-1.5 h-4 w-4" />
              Save Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================================
         EMAIL DIALOG
      ====================================================== */}

      <Dialog
        open={emailOpen}
        onOpenChange={
          setEmailOpen
        }
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Compose Email
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                To
              </p>

              <p className="mt-1 text-sm font-medium">
                {client.name}
              </p>

              <p className="text-sm text-muted-foreground">
                {client.email}
              </p>
            </div>

            <div className="space-y-2">
              <Label>
                Subject
              </Label>

              <Input
                value={
                  emailSubject
                }
                onChange={(e) =>
                  setEmailSubject(
                    e.target
                      .value,
                  )
                }
                placeholder="Project Update"
              />
            </div>

            <div className="space-y-2">
              <Label>
                Message
              </Label>

              <textarea
                value={
                  emailMessage
                }
                onChange={(e) =>
                  setEmailMessage(
                    e.target
                      .value,
                  )
                }
                rows={12}
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Write your email..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setEmailOpen(
                  false,
                )
              }
            >
              Cancel
            </Button>

            <Button
              onClick={
                handleSendEmail
              }
              disabled={
                sendingEmail
              }
            >
              <Send className="mr-1.5 h-4 w-4" />

              {sendingEmail
                ? 'Sending...'
                : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {children}
    </DashboardShell>
  );
}

/* ============================================================
   BRAND DIALOG
============================================================ */

function BrandDialog({
  open,
  onOpenChange,
  brand,
  onSave,
}: {
  open: boolean;
  onOpenChange: (
    value: boolean,
  ) => void;
  brand: BrandGuideline;
  onSave: (
    value: BrandGuideline,
  ) => void;
}) {
  const [
    colors,
    setColors,
  ] = React.useState(
    brand.colors.join(', '),
  );

  const [
    typography,
    setTypography,
  ] = React.useState(
    brand.typography,
  );

  const [
    notes,
    setNotes,
  ] = React.useState(
    brand.notes,
  );

  React.useEffect(() => {
    setColors(
      brand.colors.join(', '),
    );

    setTypography(
      brand.typography,
    );

    setNotes(
      brand.notes,
    );
  }, [brand, open]);

  function handleSave() {
    const parsedColors =
      colors
        .split(',')
        .map((c) =>
          c.trim(),
        )
        .filter(Boolean);

    onSave({
      colors:
        parsedColors,
      typography,
      notes,
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Brand Guidelines
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              Brand Colors
            </Label>

            <Input
              value={colors}
              onChange={(e) =>
                setColors(
                  e.target.value,
                )
              }
              placeholder="#111111, #FFFFFF, #FF6600"
            />

            <p className="text-xs text-muted-foreground">
              Separate multiple
              colors with commas.
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              Typography
            </Label>

            <Input
              value={
                typography
              }
              onChange={(e) =>
                setTypography(
                  e.target.value,
                )
              }
              placeholder="Inter / Playfair Display"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Brand Notes
            </Label>

            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value,
                )
              }
              rows={5}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Tone, visual direction, brand rules..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              onOpenChange(
                false,
              )
            }
          >
            Cancel
          </Button>

          <Button
            onClick={
              handleSave
            }
          >
            <Save className="mr-1.5 h-4 w-4" />
            Save Guidelines
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   CLIENT ADD / EDIT DIALOG
============================================================ */

function ClientDialog({
  open,
  onOpenChange,
  editId,
  form,
  setForm,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (
    value: boolean,
  ) => void;
  editId: string | null;
  form: ClientForm;
  setForm: React.Dispatch<
    React.SetStateAction<ClientForm>
  >;
  submitting: boolean;
  onSubmit: (
    e: React.FormEvent,
  ) => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editId
              ? 'Edit Client'
              : 'Add Client'}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client-name">
                Name
              </Label>

              <Input
                id="client-name"
                value={form.name}
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

            <div className="space-y-2">
              <Label htmlFor="client-company">
                Company
              </Label>

              <Input
                id="client-company"
                value={
                  form.company
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    company:
                      e.target
                        .value,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-email">
                Email
              </Label>

              <Input
                id="client-email"
                type="email"
                value={
                  form.email
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target
                      .value,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-phone">
                Phone
              </Label>

              <Input
                id="client-phone"
                value={
                  form.phone
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target
                      .value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Service Package
              </Label>

              <Select
                value={
                  form.servicePackage
                }
                onValueChange={(
                  value,
                ) =>
                  setForm({
                    ...form,
                    servicePackage:
                      value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {packageOptions.map(
                    (pkg) => (
                      <SelectItem
                        key={pkg}
                        value={pkg}
                      >
                        {pkg}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

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
                      value as ClientStatus,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {statusOptions.map(
                    (status) => (
                      <SelectItem
                        key={
                          status
                        }
                        value={
                          status
                        }
                      >
                        {status}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-retainer">
                Monthly Retainer (₱)
              </Label>

              <Input
                id="client-retainer"
                type="number"
                value={
                  form.monthlyRetainer
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    monthlyRetainer:
                      e.target
                        .value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-manager">
                Account Manager
              </Label>

              <Input
                id="client-manager"
                value={
                  form.accountManager
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    accountManager:
                      e.target
                        .value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-industry">
                Industry
              </Label>

              <Input
                id="client-industry"
                value={
                  form.industry
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    industry:
                      e.target
                        .value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-start">
                Start Date
              </Label>

              <Input
                id="client-start"
                type="date"
                value={
                  form.startDate
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    startDate:
                      e.target
                        .value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(
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
                  ? 'Update Client'
                  : 'Add Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}