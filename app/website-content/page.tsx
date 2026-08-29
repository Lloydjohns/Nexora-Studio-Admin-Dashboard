'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Globe,
  Layers3,
  BriefcaseBusiness,
  Package,
  HelpCircle,
  Save,
} from 'lucide-react';

import { DashboardShell, PageHeader } from '@/components/dashboard-shell';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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

import { Badge } from '@/components/ui/badge';

import { supabase } from '@/lib/supabase';

import { toast } from 'sonner';

/* ============================================================
   TYPES
============================================================ */

type ContentType =
  | 'pages'
  | 'sections'
  | 'services'
  | 'products'
  | 'faqs';

type WebsiteContentRow = {
  id: string;
  [key: string]: any;
};

type TableConfig = {
  table: string;
  label: string;
  singular: string;
  icon: React.ComponentType<{ className?: string }>;
};

/* ============================================================
   TABLE CONFIG
============================================================ */

const tableConfig: Record<ContentType, TableConfig> = {
  pages: {
    table: 'website_pages',
    label: 'Pages',
    singular: 'Page',
    icon: Globe,
  },

  sections: {
    table: 'website_sections',
    label: 'Sections',
    singular: 'Section',
    icon: Layers3,
  },

  services: {
    table: 'website_services',
    label: 'Services',
    singular: 'Service',
    icon: BriefcaseBusiness,
  },

  products: {
    table: 'website_products',
    label: 'Products',
    singular: 'Product',
    icon: Package,
  },

  faqs: {
    table: 'website_faqs',
    label: 'FAQs',
    singular: 'FAQ',
    icon: HelpCircle,
  },
};

/* ============================================================
   EMPTY FORMS
============================================================ */

const emptyForms: Record<ContentType, Record<string, any>> = {
  pages: {
    title: '',
    slug: '',
    description: '',
    content: '',
    is_published: false,
  },

  sections: {
    page_id: '',
    title: '',
    slug: '',
    content: '',
    image_url: '',
    sort_order: '0',
    is_published: false,
  },

  services: {
    name: '',
    slug: '',
    description: '',
    price: '',
    features: '',
    image_url: '',
    is_published: false,
  },

  products: {
    name: '',
    slug: '',
    description: '',
    price: '',
    image_url: '',
    download_url: '',
    is_published: false,
  },

  faqs: {
    question: '',
    answer: '',
    sort_order: '0',
    is_published: false,
  },
};

/* ============================================================
   HELPERS
============================================================ */

function formatDate(value: unknown): string {
  if (!value) {
    return '—';
  }

  try {
    const date = new Date(String(value));

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

function getDisplayTitle(
  type: ContentType,
  item: WebsiteContentRow,
): string {
  if (type === 'pages') {
    return (
      item.title ||
      item.name ||
      item.slug ||
      'Untitled page'
    );
  }

  if (type === 'sections') {
    return (
      item.title ||
      item.name ||
      item.slug ||
      'Untitled section'
    );
  }

  if (type === 'services') {
    return (
      item.name ||
      item.title ||
      item.slug ||
      'Untitled service'
    );
  }

  if (type === 'products') {
    return (
      item.name ||
      item.title ||
      item.slug ||
      'Untitled product'
    );
  }

  return (
    item.question ||
    item.title ||
    'Untitled FAQ'
  );
}

function getSecondaryText(
  type: ContentType,
  item: WebsiteContentRow,
): string {
  if (type === 'faqs') {
    return item.answer || '';
  }

  return (
    item.description ||
    item.content ||
    item.slug ||
    ''
  );
}

function isPublished(
  item: WebsiteContentRow,
): boolean {
  return (
    item.is_published === true ||
    item.published === true ||
    item.status === 'published' ||
    item.status === 'Published'
  );
}

function createEmptyForm(
  type: ContentType,
): Record<string, any> {
  return {
    ...emptyForms[type],
  };
}

/* ============================================================
   PAGE
============================================================ */

export default function WebsiteContentPage() {
  const [activeTab, setActiveTab] =
    React.useState<ContentType>('pages');

  const [data, setData] = React.useState<
    Record<ContentType, WebsiteContentRow[]>
  >({
    pages: [],
    sections: [],
    services: [],
    products: [],
    faqs: [],
  });

  const [loading, setLoading] =
    React.useState<boolean>(false);

  const [search, setSearch] =
    React.useState<string>('');

  const [dialogOpen, setDialogOpen] =
    React.useState<boolean>(false);

  const [editingItem, setEditingItem] =
    React.useState<WebsiteContentRow | null>(null);

  const [saving, setSaving] =
    React.useState<boolean>(false);

  const [deletingId, setDeletingId] =
    React.useState<string | null>(null);

  const [publishingId, setPublishingId] =
    React.useState<string | null>(null);

  const [form, setForm] =
    React.useState<Record<string, any>>(
      createEmptyForm('pages'),
    );

  /* ==========================================================
     FETCH ONE TABLE
  ========================================================== */

  async function fetchTable(
    type: ContentType,
  ): Promise<void> {
    const config = tableConfig[type];

    const { data: rows, error } =
      await supabase
        .from(config.table)
        .select('*')
        .order('created_at', {
          ascending: false,
        });

    if (error) {
      throw error;
    }

    setData((current) => ({
      ...current,
      [type]: (rows || []) as WebsiteContentRow[],
    }));
  }

  /* ==========================================================
     FETCH ALL
  ========================================================== */

  async function fetchAll(): Promise<void> {
    setLoading(true);

    try {
      const types = Object.keys(
        tableConfig,
      ) as ContentType[];

      await Promise.all(
        types.map((type) =>
          fetchTable(type),
        ),
      );
    } catch (error: any) {
      console.error(
        'WEBSITE CONTENT FETCH ERROR:',
        error,
      );

      toast.error(
        'Failed to load website content',
        {
          description:
            error?.message ||
            'Unable to load content from Supabase.',
        },
      );
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void fetchAll();
  }, []);

  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredItems =
    React.useMemo<WebsiteContentRow[]>(() => {
      const items = data[activeTab];

      const query =
        search.trim().toLowerCase();

      if (!query) {
        return items;
      }

      return items.filter((item) => {
        return Object.values(item).some(
          (value) => {
            if (
              value === null ||
              value === undefined
            ) {
              return false;
            }

            if (
              typeof value === 'object'
            ) {
              try {
                return JSON.stringify(value)
                  .toLowerCase()
                  .includes(query);
              } catch {
                return false;
              }
            }

            return String(value)
              .toLowerCase()
              .includes(query);
          },
        );
      });
    }, [data, activeTab, search]);

  /* ==========================================================
     OPEN ADD
  ========================================================== */

  function openAdd(): void {
    setEditingItem(null);

    setForm(
      createEmptyForm(activeTab),
    );

    setDialogOpen(true);
  }

  /* ==========================================================
     OPEN EDIT
  ========================================================== */

  function openEdit(
    item: WebsiteContentRow,
  ): void {
    setEditingItem(item);

    if (activeTab === 'pages') {
      setForm({
        title: item.title || '',
        slug: item.slug || '',
        description:
          item.description || '',
        content:
          item.content || '',
        is_published:
          item.is_published === true,
      });
    } else if (
      activeTab === 'sections'
    ) {
      setForm({
        page_id:
          item.page_id || '',
        title:
          item.title || '',
        slug:
          item.slug || '',
        content:
          item.content || '',
        image_url:
          item.image_url || '',
        sort_order:
          String(item.sort_order ?? 0),
        is_published:
          item.is_published === true,
      });
    } else if (
      activeTab === 'services'
    ) {
      setForm({
        name:
          item.name || '',
        slug:
          item.slug || '',
        description:
          item.description || '',
        price:
          item.price !== null &&
          item.price !== undefined
            ? String(item.price)
            : '',
        features:
          Array.isArray(item.features)
            ? item.features.join('\n')
            : item.features || '',
        image_url:
          item.image_url || '',
        is_published:
          item.is_published === true,
      });
    } else if (
      activeTab === 'products'
    ) {
      setForm({
        name:
          item.name || '',
        slug:
          item.slug || '',
        description:
          item.description || '',
        price:
          item.price !== null &&
          item.price !== undefined
            ? String(item.price)
            : '',
        image_url:
          item.image_url || '',
        download_url:
          item.download_url || '',
        is_published:
          item.is_published === true,
      });
    } else {
      setForm({
        question:
          item.question || '',
        answer:
          item.answer || '',
        sort_order:
          String(item.sort_order ?? 0),
        is_published:
          item.is_published === true,
      });
    }

    setDialogOpen(true);
  }

  /* ==========================================================
     FORM CHANGE
  ========================================================== */

  function updateForm(
    key: string,
    value: any,
  ): void {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  /* ==========================================================
     SAVE
  ========================================================== */

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (saving) {
      return;
    }

    setSaving(true);

    try {
      let payload: Record<string, any> = {};

      /* ------------------------------------------------------
         PAGES
      ------------------------------------------------------ */

      if (activeTab === 'pages') {
        const title =
          String(form.title || '').trim();

        if (!title) {
          toast.error(
            'Page title is required.',
          );
          return;
        }

        payload = {
          title,
          slug:
            String(
              form.slug || '',
            ).trim(),
          description:
            String(
              form.description || '',
            ).trim() || null,
          content:
            String(
              form.content || '',
            ).trim() || null,
          is_published:
            Boolean(form.is_published),
        };
      }

      /* ------------------------------------------------------
         SECTIONS
      ------------------------------------------------------ */

      else if (
        activeTab === 'sections'
      ) {
        const title =
          String(form.title || '').trim();

        if (!title) {
          toast.error(
            'Section title is required.',
          );
          return;
        }

        payload = {
          page_id:
            String(
              form.page_id || '',
            ).trim() || null,
          title,
          slug:
            String(
              form.slug || '',
            ).trim(),
          content:
            String(
              form.content || '',
            ).trim() || null,
          image_url:
            String(
              form.image_url || '',
            ).trim() || null,
          sort_order:
            Number(form.sort_order) || 0,
          is_published:
            Boolean(form.is_published),
        };
      }

      /* ------------------------------------------------------
         SERVICES
      ------------------------------------------------------ */

      else if (
        activeTab === 'services'
      ) {
        const name =
          String(form.name || '').trim();

        if (!name) {
          toast.error(
            'Service name is required.',
          );
          return;
        }

        payload = {
          name,
          slug:
            String(
              form.slug || '',
            ).trim(),
          description:
            String(
              form.description || '',
            ).trim() || null,
          price:
            form.price === '' ||
            form.price === null ||
            form.price === undefined
              ? 0
              : Number(form.price),
          features:
            String(
              form.features || '',
            )
              .split('\n')
              .map(
                (value: string) =>
                  value.trim(),
              )
              .filter(Boolean),
          image_url:
            String(
              form.image_url || '',
            ).trim() || null,
          is_published:
            Boolean(form.is_published),
        };
      }

      /* ------------------------------------------------------
         PRODUCTS
      ------------------------------------------------------ */

      else if (
        activeTab === 'products'
      ) {
        const name =
          String(form.name || '').trim();

        if (!name) {
          toast.error(
            'Product name is required.',
          );
          return;
        }

        payload = {
          name,
          slug:
            String(
              form.slug || '',
            ).trim(),
          description:
            String(
              form.description || '',
            ).trim() || null,
          price:
            form.price === '' ||
            form.price === null ||
            form.price === undefined
              ? 0
              : Number(form.price),
          image_url:
            String(
              form.image_url || '',
            ).trim() || null,
          download_url:
            String(
              form.download_url || '',
            ).trim() || null,
          is_published:
            Boolean(form.is_published),
        };
      }

      /* ------------------------------------------------------
         FAQS
      ------------------------------------------------------ */

      else {
        const question =
          String(
            form.question || '',
          ).trim();

        const answer =
          String(
            form.answer || '',
          ).trim();

        if (!question) {
          toast.error(
            'Question is required.',
          );
          return;
        }

        if (!answer) {
          toast.error(
            'Answer is required.',
          );
          return;
        }

        payload = {
          question,
          answer,
          sort_order:
            Number(form.sort_order) || 0,
          is_published:
            Boolean(form.is_published),
        };
      }

      const table =
        tableConfig[activeTab].table;

      /* ------------------------------------------------------
         UPDATE
      ------------------------------------------------------ */

      if (editingItem) {
        const { error } =
          await supabase
            .from(table)
            .update(payload)
            .eq(
              'id',
              editingItem.id,
            );

        if (error) {
          throw error;
        }

        toast.success(
          `${tableConfig[activeTab].singular} updated successfully.`,
        );
      }

      /* ------------------------------------------------------
         INSERT
      ------------------------------------------------------ */

      else {
        const { error } =
          await supabase
            .from(table)
            .insert(payload);

        if (error) {
          throw error;
        }

        toast.success(
          `${tableConfig[activeTab].singular} added successfully.`,
        );
      }

      setDialogOpen(false);
      setEditingItem(null);

      setForm(
        createEmptyForm(activeTab),
      );

      await fetchTable(activeTab);
    } catch (error: any) {
      console.error(
        'SAVE WEBSITE CONTENT ERROR:',
        error,
      );

      toast.error(
        `Failed to save ${tableConfig[activeTab].singular.toLowerCase()}`,
        {
          description:
            error?.message ||
            'Unable to save the record.',
        },
      );
    } finally {
      setSaving(false);
    }
  }

  /* ==========================================================
     DELETE
  ========================================================== */

  async function handleDelete(
    item: WebsiteContentRow,
  ): Promise<void> {
    const title =
      getDisplayTitle(
        activeTab,
        item,
      );

    const confirmed =
      window.confirm(
        `Delete "${title}"?\n\nThis action cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    if (deletingId) {
      return;
    }

    setDeletingId(item.id);

    try {
      const { error } =
        await supabase
          .from(
            tableConfig[activeTab]
              .table,
          )
          .delete()
          .eq(
            'id',
            item.id,
          );

      if (error) {
        throw error;
      }

      toast.success(
        `${tableConfig[activeTab].singular} deleted successfully.`,
      );

      setData((current) => ({
        ...current,
        [activeTab]:
          current[activeTab].filter(
            (row) =>
              row.id !== item.id,
          ),
      }));

      if (
        editingItem?.id === item.id
      ) {
        setEditingItem(null);
        setDialogOpen(false);
      }
    } catch (error: any) {
      console.error(
        'DELETE WEBSITE CONTENT ERROR:',
        error,
      );

      toast.error(
        `Failed to delete ${tableConfig[activeTab].singular.toLowerCase()}`,
        {
          description:
            error?.message ||
            'Unable to delete the record.',
        },
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* ==========================================================
     PUBLISH / UNPUBLISH
  ========================================================== */

  async function togglePublished(
    item: WebsiteContentRow,
  ): Promise<void> {
    if (publishingId) {
      return;
    }

    setPublishingId(item.id);

    const nextValue =
      !isPublished(item);

    try {
      const { error } =
        await supabase
          .from(
            tableConfig[activeTab]
              .table,
          )
          .update({
            is_published:
              nextValue,
          })
          .eq(
            'id',
            item.id,
          );

      if (error) {
        throw error;
      }

      toast.success(
        nextValue
          ? `${tableConfig[activeTab].singular} published.`
          : `${tableConfig[activeTab].singular} unpublished.`,
      );

      setData((current) => ({
        ...current,
        [activeTab]:
          current[activeTab].map(
            (row) =>
              row.id === item.id
                ? {
                    ...row,
                    is_published:
                      nextValue,
                  }
                : row,
          ),
      }));
    } catch (error: any) {
      console.error(
        'PUBLISH WEBSITE CONTENT ERROR:',
        error,
      );

      toast.error(
        'Failed to change publish status',
        {
          description:
            error?.message ||
            'Unable to update publish status.',
        },
      );
    } finally {
      setPublishingId(null);
    }
  }

  /* ==========================================================
     RENDER PUBLISH TOGGLE
  ========================================================== */

  function renderPublishToggle(): React.ReactNode {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">
              Publish on website
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {form.is_published
                ? 'This content is visible on the public website.'
                : 'This content is saved as a draft.'}
            </p>
          </div>

          <Button
            type="button"
            variant={
              form.is_published
                ? 'default'
                : 'outline'
            }
            size="sm"
            onClick={() =>
              updateForm(
                'is_published',
                !form.is_published,
              )
            }
          >
            {form.is_published ? (
              <>
                <Eye className="mr-1.5 h-4 w-4" />
                Published
              </>
            ) : (
              <>
                <EyeOff className="mr-1.5 h-4 w-4" />
                Draft
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  /* ==========================================================
     RENDER FORM
  ========================================================== */

  function renderForm(): React.ReactNode {
    /* --------------------------------------------------------
       PAGES
    -------------------------------------------------------- */

    if (activeTab === 'pages') {
      return (
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>
              Page Title
            </Label>

            <Input
              value={
                form.title || ''
              }
              onChange={(event) =>
                updateForm(
                  'title',
                  event.target.value,
                )
              }
              placeholder="Home"
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Slug
            </Label>

            <Input
              value={
                form.slug || ''
              }
              onChange={(event) =>
                updateForm(
                  'slug',
                  event.target.value,
                )
              }
              placeholder="home"
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Description
            </Label>

            <Textarea
              value={
                form.description || ''
              }
              onChange={(event) =>
                updateForm(
                  'description',
                  event.target.value,
                )
              }
              placeholder="Page description..."
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Content
            </Label>

            <Textarea
              value={
                form.content || ''
              }
              onChange={(event) =>
                updateForm(
                  'content',
                  event.target.value,
                )
              }
              placeholder="Page content..."
              rows={8}
            />
          </div>

          {renderPublishToggle()}
        </div>
      );
    }

    /* --------------------------------------------------------
       SECTIONS
    -------------------------------------------------------- */

    if (
      activeTab === 'sections'
    ) {
      return (
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>
              Page ID
            </Label>

            <Input
              value={
                form.page_id || ''
              }
              onChange={(event) =>
                updateForm(
                  'page_id',
                  event.target.value,
                )
              }
              placeholder="Page UUID"
            />

            <p className="text-xs text-muted-foreground">
              Enter the UUID of the website page this section belongs to.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>
              Section Title
            </Label>

            <Input
              value={
                form.title || ''
              }
              onChange={(event) =>
                updateForm(
                  'title',
                  event.target.value,
                )
              }
              placeholder="Hero Section"
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Slug
            </Label>

            <Input
              value={
                form.slug || ''
              }
              onChange={(event) =>
                updateForm(
                  'slug',
                  event.target.value,
                )
              }
              placeholder="hero"
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Content
            </Label>

            <Textarea
              value={
                form.content || ''
              }
              onChange={(event) =>
                updateForm(
                  'content',
                  event.target.value,
                )
              }
              placeholder="Section content..."
              rows={8}
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Image URL
            </Label>

            <Input
              value={
                form.image_url || ''
              }
              onChange={(event) =>
                updateForm(
                  'image_url',
                  event.target.value,
                )
              }
              placeholder="/images/hero.jpg"
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Sort Order
            </Label>

            <Input
              type="number"
              value={
                form.sort_order ??
                '0'
              }
              onChange={(event) =>
                updateForm(
                  'sort_order',
                  event.target.value,
                )
              }
            />
          </div>

          {renderPublishToggle()}
        </div>
      );
    }

    /* --------------------------------------------------------
       SERVICES
    -------------------------------------------------------- */

    if (
      activeTab === 'services'
    ) {
      return (
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>
              Service Name
            </Label>

            <Input
              value={
                form.name || ''
              }
              onChange={(event) =>
                updateForm(
                  'name',
                  event.target.value,
                )
              }
              placeholder="Social Media Management"
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Slug
            </Label>

            <Input
              value={
                form.slug || ''
              }
              onChange={(event) =>
                updateForm(
                  'slug',
                  event.target.value,
                )
              }
              placeholder="social-media-management"
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Description
            </Label>

            <Textarea
              value={
                form.description || ''
              }
              onChange={(event) =>
                updateForm(
                  'description',
                  event.target.value,
                )
              }
              placeholder="Describe this service..."
              rows={5}
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Price
            </Label>

            <Input
              type="number"
              value={
                form.price ?? ''
              }
              onChange={(event) =>
                updateForm(
                  'price',
                  event.target.value,
                )
              }
              placeholder="15000"
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Features
            </Label>

            <Textarea
              value={
                form.features || ''
              }
              onChange={(event) =>
                updateForm(
                  'features',
                  event.target.value,
                )
              }
              placeholder={
                'Content planning\nMonthly reports\nCommunity management'
              }
              rows={6}
            />

            <p className="text-xs text-muted-foreground">
              Put one feature per line.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>
              Image URL
            </Label>

            <Input
              value={
                form.image_url || ''
              }
              onChange={(event) =>
                updateForm(
                  'image_url',
                  event.target.value,
                )
              }
              placeholder="/images/services/social.jpg"
            />
          </div>

          {renderPublishToggle()}
        </div>
      );
    }

    /* --------------------------------------------------------
       PRODUCTS
    -------------------------------------------------------- */

    if (
      activeTab === 'products'
    ) {
      return (
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>
              Product Name
            </Label>

            <Input
              value={
                form.name || ''
              }
              onChange={(event) =>
                updateForm(
                  'name',
                  event.target.value,
                )
              }
              placeholder="Social Media Content Planner"
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Slug
            </Label>

            <Input
              value={
                form.slug || ''
              }
              onChange={(event) =>
                updateForm(
                  'slug',
                  event.target.value,
                )
              }
              placeholder="social-media-content-planner"
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Description
            </Label>

            <Textarea
              value={
                form.description || ''
              }
              onChange={(event) =>
                updateForm(
                  'description',
                  event.target.value,
                )
              }
              placeholder="Describe this product..."
              rows={5}
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Price
            </Label>

            <Input
              type="number"
              value={
                form.price ?? ''
              }
              onChange={(event) =>
                updateForm(
                  'price',
                  event.target.value,
                )
              }
              placeholder="899"
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Image URL
            </Label>

            <Input
              value={
                form.image_url || ''
              }
              onChange={(event) =>
                updateForm(
                  'image_url',
                  event.target.value,
                )
              }
              placeholder="/images/products/planner.jpg"
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Download URL
            </Label>

            <Input
              value={
                form.download_url || ''
              }
              onChange={(event) =>
                updateForm(
                  'download_url',
                  event.target.value,
                )
              }
              placeholder="https://..."
            />
          </div>

          {renderPublishToggle()}
        </div>
      );
    }

    /* --------------------------------------------------------
       FAQS
    -------------------------------------------------------- */

    return (
      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label>
            Question
          </Label>

          <Input
            value={
              form.question || ''
            }
            onChange={(event) =>
              updateForm(
                'question',
                event.target.value,
              )
            }
            placeholder="How long does a website take?"
          />
        </div>

        <div className="grid gap-2">
          <Label>
            Answer
          </Label>

          <Textarea
            value={
              form.answer || ''
            }
            onChange={(event) =>
              updateForm(
                'answer',
                event.target.value,
              )
            }
            placeholder="Most websites take..."
            rows={8}
          />
        </div>

        <div className="grid gap-2">
          <Label>
            Sort Order
          </Label>

          <Input
            type="number"
            value={
              form.sort_order ??
              '0'
            }
            onChange={(event) =>
              updateForm(
                'sort_order',
                event.target.value,
              )
            }
          />
        </div>

        {renderPublishToggle()}
      </div>
    );
  }

  /* ==========================================================
     ACTIVE CONFIG
  ========================================================== */

  const activeConfig =
    tableConfig[activeTab];

  const ActiveIcon =
    activeConfig.icon;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <DashboardShell>
      <PageHeader
        title="Website Content"
        description="Manage your website pages, sections, services, products, and FAQs from one place."
      />

      <div className="mt-6 space-y-6">
        {/* ====================================================
            HEADER CARD
        ==================================================== */}

        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Globe className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Website Content Manager
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    All website content is managed from this page.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() =>
                    void fetchAll()
                  }
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}

                  Refresh
                </Button>

                <Button
                  onClick={openAdd}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add {activeConfig.singular}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ====================================================
            TABS
        ==================================================== */}

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(
              value as ContentType,
            );

            setSearch('');
          }}
        >
          <div className="overflow-x-auto">
            <TabsList className="inline-flex min-w-full justify-start">
              <TabsTrigger value="pages">
                <Globe className="mr-2 h-4 w-4" />
                Pages
              </TabsTrigger>

              <TabsTrigger value="sections">
                <Layers3 className="mr-2 h-4 w-4" />
                Sections
              </TabsTrigger>

              <TabsTrigger value="services">
                <BriefcaseBusiness className="mr-2 h-4 w-4" />
                Services
              </TabsTrigger>

              <TabsTrigger value="products">
                <Package className="mr-2 h-4 w-4" />
                Products
              </TabsTrigger>

              <TabsTrigger value="faqs">
                <HelpCircle className="mr-2 h-4 w-4" />
                FAQs
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ==================================================
              TAB CONTENT
          ================================================== */}

          {(
            Object.keys(
              tableConfig,
            ) as ContentType[]
          ).map((type) => {
            const config =
              tableConfig[type];

            const Icon =
              config.icon;

            const items =
              type === activeTab
                ? filteredItems
                : data[type];

            return (
              <TabsContent
                key={type}
                value={type}
                className="mt-5"
              >
                {/* Search */}

                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                          value={
                            activeTab === type
                              ? search
                              : ''
                          }
                          onChange={(event) =>
                            setSearch(
                              event.target.value,
                            )
                          }
                          placeholder={`Search ${config.label.toLowerCase()}...`}
                          className="pl-9"
                        />
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {items.length}{' '}
                        {config.label.toLowerCase()}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Content */}

                <div className="mt-4">
                  {loading ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                      {Array.from({
                        length: 4,
                      }).map(
                        (_, index) => (
                          <Card
                            key={index}
                          >
                            <CardContent className="p-5">
                              <div className="animate-pulse space-y-4">
                                <div className="h-5 w-1/2 rounded bg-muted" />

                                <div className="h-4 w-full rounded bg-muted" />

                                <div className="h-4 w-3/4 rounded bg-muted" />

                                <div className="h-9 w-full rounded bg-muted" />
                              </div>
                            </CardContent>
                          </Card>
                        ),
                      )}
                    </div>
                  ) : items.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                          <Icon className="h-6 w-6 text-muted-foreground" />
                        </div>

                        <h3 className="mt-4 font-semibold">
                          No{' '}
                          {config.label.toLowerCase()}{' '}
                          found
                        </h3>

                        <p className="mt-1 max-w-md text-sm text-muted-foreground">
                          Add your first{' '}
                          {config.singular.toLowerCase()}{' '}
                          to start managing this section of your website.
                        </p>

                        <Button
                          className="mt-5"
                          onClick={openAdd}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add{' '}
                          {config.singular}
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                      <AnimatePresence>
                        {items.map(
                          (
                            item,
                            index,
                          ) => {
                            const published =
                              isPublished(
                                item,
                              );

                            return (
                              <motion.div
                                key={
                                  item.id
                                }
                                initial={{
                                  opacity: 0,
                                  y: 10,
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                }}
                                exit={{
                                  opacity: 0,
                                  y: -10,
                                }}
                                transition={{
                                  delay:
                                    index *
                                    0.025,
                                }}
                              >
                                <Card className="h-full">
                                  <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                          <Icon className="h-5 w-5" />
                                        </div>

                                        <div className="min-w-0">
                                          <h3 className="truncate font-semibold">
                                            {getDisplayTitle(
                                              type,
                                              item,
                                            )}
                                          </h3>

                                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                            {getSecondaryText(
                                              type,
                                              item,
                                            )}
                                          </p>
                                        </div>
                                      </div>

                                      <Badge
                                        variant={
                                          published
                                            ? 'default'
                                            : 'secondary'
                                        }
                                        className="shrink-0"
                                      >
                                        {published
                                          ? 'Published'
                                          : 'Draft'}
                                      </Badge>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                      {item.slug && (
                                        <span className="rounded-full bg-muted px-2.5 py-1">
                                          /
                                          {
                                            item.slug
                                          }
                                        </span>
                                      )}

                                      {item.price !==
                                        undefined &&
                                        item.price !==
                                          null && (
                                          <span className="rounded-full bg-muted px-2.5 py-1">
                                            ₱
                                            {Number(
                                              item.price,
                                            ).toLocaleString(
                                              'en-PH',
                                            )}
                                          </span>
                                        )}

                                      {item.created_at && (
                                        <span className="rounded-full bg-muted px-2.5 py-1">
                                          {formatDate(
                                            item.created_at,
                                          )}
                                        </span>
                                      )}
                                    </div>

                                    <div className="mt-5 flex flex-wrap justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          void togglePublished(
                                            item,
                                          )
                                        }
                                        disabled={
                                          publishingId ===
                                          item.id
                                        }
                                      >
                                        {publishingId ===
                                        item.id ? (
                                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                        ) : published ? (
                                          <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                                        ) : (
                                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                                        )}

                                        {published
                                          ? 'Unpublish'
                                          : 'Publish'}
                                      </Button>

                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          openEdit(
                                            item,
                                          )
                                        }
                                      >
                                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                        Edit
                                      </Button>

                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() =>
                                          void handleDelete(
                                            item,
                                          )
                                        }
                                        disabled={
                                          deletingId ===
                                          item.id
                                        }
                                      >
                                        {deletingId ===
                                        item.id ? (
                                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                        )}

                                        Delete
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            );
                          },
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* ======================================================
          ADD / EDIT DIALOG
      ====================================================== */}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (saving) {
            return;
          }

          setDialogOpen(open);

          if (!open) {
            setEditingItem(null);

            setForm(
              createEmptyForm(
                activeTab,
              ),
            );
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ActiveIcon className="h-5 w-5 text-primary" />

              {editingItem
                ? `Edit ${activeConfig.singular}`
                : `Add ${activeConfig.singular}`}
            </DialogTitle>

            <p className="text-sm text-muted-foreground">
              Manage this content directly from the Admin Dashboard.
            </p>
          </DialogHeader>

          <form
            onSubmit={(event) =>
              void handleSave(event)
            }
          >
            <div className="py-4">
              {renderForm()}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (saving) {
                    return;
                  }

                  setDialogOpen(false);
                  setEditingItem(null);

                  setForm(
                    createEmptyForm(
                      activeTab,
                    ),
                  );
                }}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}

                {editingItem
                  ? 'Save Changes'
                  : `Add ${activeConfig.singular}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}