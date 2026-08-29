'use client'

import * as React from 'react'
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
} from 'lucide-react'

import { motion, AnimatePresence } from 'framer-motion'

import { DashboardShell, PageHeader } from '@/components/dashboard-shell'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Badge } from '@/components/ui/badge'

import { supabase } from '@/lib/supabase'

import { toast } from 'sonner'

import { cn } from '@/lib/utils'

/* ============================================================
   TYPES
============================================================ */

type ContentType =
  | 'pages'
  | 'sections'
  | 'services'
  | 'products'
  | 'faqs'

type WebsiteContentRow = Record<string, any> & {
  id: string
}

/* ============================================================
   TABLE CONFIG
============================================================ */

const tableConfig: Record<
  ContentType,
  {
    table: string
    label: string
    singular: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
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
}

/* ============================================================
   EMPTY FORMS
============================================================ */

const emptyForms = {
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
}

/* ============================================================
   HELPERS
============================================================ */

function formatDate(value: unknown) {
  if (!value) return '—'

  try {
    return new Date(String(value)).toLocaleDateString(
      'en-PH',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
    )
  } catch {
    return '—'
  }
}

function getDisplayTitle(
  type: ContentType,
  item: WebsiteContentRow,
) {
  if (type === 'pages') {
    return item.title || item.name || item.slug || 'Untitled page'
  }

  if (type === 'sections') {
    return item.title || item.name || item.slug || 'Untitled section'
  }

  if (type === 'services') {
    return item.name || item.title || item.slug || 'Untitled service'
  }

  if (type === 'products') {
    return item.name || item.title || item.slug || 'Untitled product'
  }

  return item.question || item.title || 'Untitled FAQ'
}

function getSecondaryText(
  type: ContentType,
  item: WebsiteContentRow,
) {
  if (type === 'faqs') {
    return item.answer || ''
  }

  return (
    item.description ||
    item.content ||
    item.slug ||
    ''
  )
}

function isPublished(item: WebsiteContentRow) {
  return (
    item.is_published === true ||
    item.published === true ||
    item.status === 'published' ||
    item.status === 'Published'
  )
}

/* ============================================================
   PAGE
============================================================ */

export default function WebsiteContentPage() {
  const [activeTab, setActiveTab] =
    React.useState<ContentType>('pages')

  const [data, setData] = React.useState<
    Record<ContentType, WebsiteContentRow[]>
  >({
    pages: [],
    sections: [],
    services: [],
    products: [],
    faqs: [],
  })

  const [loading, setLoading] =
    React.useState(false)

  const [search, setSearch] =
    React.useState('')

  const [dialogOpen, setDialogOpen] =
    React.useState(false)

  const [editingItem, setEditingItem] =
    React.useState<WebsiteContentRow | null>(null)

  const [saving, setSaving] =
    React.useState(false)

  const [deletingId, setDeletingId] =
    React.useState<string | null>(null)

  const [publishingId, setPublishingId] =
    React.useState<string | null>(null)

  const [form, setForm] =
    React.useState<any>({
      ...emptyForms.pages,
    })

  /* ==========================================================
     FETCH
  ========================================================== */

  async function fetchTable(
    type: ContentType,
  ) {
    const config = tableConfig[type]

    const { data: rows, error } =
      await supabase
        .from(config.table)
        .select('*')
        .order('created_at', {
          ascending: false,
        })

    if (error) {
      throw error
    }

    setData((current) => ({
      ...current,
      [type]: rows || [],
    }))
  }

  async function fetchAll() {
    setLoading(true)

    try {
      await Promise.all(
        (
          Object.keys(
            tableConfig,
          ) as ContentType[]
        ).map(fetchTable),
      )
    } catch (error: any) {
      console.error(
        'WEBSITE CONTENT FETCH ERROR:',
        error,
      )

      toast.error(
        'Failed to load website content',
        {
          description:
            error?.message ||
            'Unable to load content from Supabase.',
        },
      )
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchAll()
  }, [])

  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredItems = React.useMemo(() => {
    const items = data[activeTab]

    const query =
      search.trim().toLowerCase()

    if (!query) {
      return items
    }

    return items.filter((item) => {
      return Object.values(item).some(
        (value) => {
          if (
            value === null ||
            value === undefined
          ) {
            return false
          }

          if (
            typeof value === 'object'
          ) {
            return JSON.stringify(value)
              .toLowerCase()
              .includes(query)
          }

          return String(value)
            .toLowerCase()
            .includes(query)
        },
      )
    })
  }, [
    data,
    activeTab,
    search,
  ])

  /* ==========================================================
     OPEN ADD
  ========================================================== */

  function openAdd() {
    setEditingItem(null)

    setForm({
      ...emptyForms[activeTab],
    })

    setDialogOpen(true)
  }

  /* ==========================================================
     OPEN EDIT
  ========================================================== */

  function openEdit(
    item: WebsiteContentRow,
  ) {
    setEditingItem(item)

    if (activeTab === 'pages') {
      setForm({
        title: item.title || '',
        slug: item.slug || '',
        description:
          item.description || '',
        content: item.content || '',
        is_published:
          item.is_published === true,
      })
    }

    if (activeTab === 'sections') {
      setForm({
        page_id: item.page_id || '',
        title: item.title || '',
        slug: item.slug || '',
        content: item.content || '',
        image_url:
          item.image_url || '',
        sort_order:
          String(item.sort_order ?? 0),
        is_published:
          item.is_published === true,
      })
    }

    if (activeTab === 'services') {
      setForm({
        name: item.name || '',
        slug: item.slug || '',
        description:
          item.description || '',
        price:
          item.price !== null &&
          item.price !== undefined
            ? String(item.price)
            : '',
        features:
          Array.isArray(
            item.features,
          )
            ? item.features.join('\n')
            : item.features || '',
        image_url:
          item.image_url || '',
        is_published:
          item.is_published === true,
      })
    }

    if (activeTab === 'products') {
      setForm({
        name: item.name || '',
        slug: item.slug || '',
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
      })
    }

    if (activeTab === 'faqs') {
      setForm({
        question:
          item.question || '',
        answer:
          item.answer || '',
        sort_order:
          String(item.sort_order ?? 0),
        is_published:
          item.is_published === true,
      })
    }

    setDialogOpen(true)
  }

  /* ==========================================================
     FORM CHANGE
  ========================================================== */

  function updateForm(
    key: string,
    value: any,
  ) {
    setForm((current: any) => ({
      ...current,
      [key]: value,
    }))
  }

  /* ==========================================================
     SAVE
  ========================================================== */

  async function handleSave(
    event: React.FormEvent,
  ) {
    event.preventDefault()

    setSaving(true)

    try {
      let payload: Record<
        string,
        any
      > = {}

      /* ------------------------------------------------------
         PAGES
      ------------------------------------------------------ */

      if (activeTab === 'pages') {
        if (!form.title.trim()) {
          toast.error(
            'Page title is required.',
          )
          setSaving(false)
          return
        }

        payload = {
          title: form.title.trim(),
          slug: form.slug.trim(),
          description:
            form.description.trim() ||
            null,
          content:
            form.content.trim() ||
            null,
          is_published:
            form.is_published,
        }
      }

      /* ------------------------------------------------------
         SECTIONS
      ------------------------------------------------------ */

      if (activeTab === 'sections') {
        if (!form.title.trim()) {
          toast.error(
            'Section title is required.',
          )
          setSaving(false)
          return
        }

        payload = {
          page_id:
            form.page_id.trim() ||
            null,
          title: form.title.trim(),
          slug: form.slug.trim(),
          content:
            form.content.trim() ||
            null,
          image_url:
            form.image_url.trim() ||
            null,
          sort_order:
            Number(form.sort_order) || 0,
          is_published:
            form.is_published,
        }
      }

      /* ------------------------------------------------------
         SERVICES
      ------------------------------------------------------ */

      if (activeTab === 'services') {
        if (!form.name.trim()) {
          toast.error(
            'Service name is required.',
          )
          setSaving(false)
          return
        }

        payload = {
          name: form.name.trim(),
          slug: form.slug.trim(),
          description:
            form.description.trim() ||
            null,
          price:
            form.price === ''
              ? 0
              : Number(form.price),
          features: form.features
            .split('\n')
            .map(
              (value: string) =>
                value.trim(),
            )
            .filter(Boolean),
          image_url:
            form.image_url.trim() ||
            null,
          is_published:
            form.is_published,
        }
      }

      /* ------------------------------------------------------
         PRODUCTS
      ------------------------------------------------------ */

      if (activeTab === 'products') {
        if (!form.name.trim()) {
          toast.error(
            'Product name is required.',
          )
          setSaving(false)
          return
        }

        payload = {
          name: form.name.trim(),
          slug: form.slug.trim(),
          description:
            form.description.trim() ||
            null,
          price:
            form.price === ''
              ? 0
              : Number(form.price),
          image_url:
            form.image_url.trim() ||
            null,
          download_url:
            form.download_url.trim() ||
            null,
          is_published:
            form.is_published,
        }
      }

      /* ------------------------------------------------------
         FAQS
      ------------------------------------------------------ */

      if (activeTab === 'faqs') {
        if (!form.question.trim()) {
          toast.error(
            'Question is required.',
          )
          setSaving(false)
          return
        }

        if (!form.answer.trim()) {
          toast.error(
            'Answer is required.',
          )
          setSaving(false)
          return
        }

        payload = {
          question:
            form.question.trim(),
          answer:
            form.answer.trim(),
          sort_order:
            Number(form.sort_order) || 0,
          is_published:
            form.is_published,
        }
      }

      /* ------------------------------------------------------
         UPDATE / INSERT
      ------------------------------------------------------ */

      if (editingItem) {
        const { error } =
          await supabase
            .from(
              tableConfig[activeTab]
                .table,
            )
            .update(payload)
            .eq(
              'id',
              editingItem.id,
            )

        if (error) {
          throw error
        }

        toast.success(
          `${tableConfig[activeTab].singular} updated successfully.`,
        )
      } else {
        const { error } =
          await supabase
            .from(
              tableConfig[activeTab]
                .table,
            )
            .insert(payload)

        if (error) {
          throw error
        }

        toast.success(
          `${tableConfig[activeTab].singular} added successfully.`,
        )
      }

      setDialogOpen(false)
      setEditingItem(null)

      setForm({
        ...emptyForms[activeTab],
      })

      await fetchTable(activeTab)
    } catch (error: any) {
      console.error(
        'SAVE WEBSITE CONTENT ERROR:',
        error,
      )

      toast.error(
        `Failed to save ${tableConfig[activeTab].singular.toLowerCase()}`,
        {
          description:
            error?.message ||
            'Unable to save the record.',
        },
      )
    } finally {
      setSaving(false)
    }
  }

  /* ==========================================================
     DELETE
  ========================================================== */

  async function handleDelete(
    item: WebsiteContentRow,
  ) {
    const title =
      getDisplayTitle(
        activeTab,
        item,
      )

    if (
      !window.confirm(
        `Delete "${title}"?\n\nThis action cannot be undone.`,
      )
    ) {
      return
    }

    setDeletingId(item.id)

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
          )

      if (error) {
        throw error
      }

      toast.success(
        `${tableConfig[activeTab].singular} deleted successfully.`,
      )

      await fetchTable(
        activeTab,
      )
    } catch (error: any) {
      console.error(
        'DELETE WEBSITE CONTENT ERROR:',
        error,
      )

      toast.error(
        `Failed to delete ${tableConfig[activeTab].singular.toLowerCase()}`,
        {
          description:
            error?.message ||
            'Unable to delete the record.',
        },
      )
    } finally {
      setDeletingId(null)
    }
  }

  /* ==========================================================
     PUBLISH / UNPUBLISH
  ========================================================== */

  async function togglePublished(
    item: WebsiteContentRow,
  ) {
    setPublishingId(item.id)

    const nextValue =
      !isPublished(item)

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
          )

      if (error) {
        throw error
      }

      toast.success(
        nextValue
          ? `${tableConfig[activeTab].singular} published.`
          : `${tableConfig[activeTab].singular} unpublished.`,
      )

      await fetchTable(
        activeTab,
      )
    } catch (error: any) {
      console.error(
        'PUBLISH WEBSITE CONTENT ERROR:',
        error,
      )

      toast.error(
        'Failed to change publish status',
        {
          description:
            error?.message ||
            'Unable to update publish status.',
        },
      )
    } finally {
      setPublishingId(null)
    }
  }

  /* ==========================================================
     RENDER FORM
  ========================================================== */

  function renderForm() {
    if (activeTab === 'pages') {
      return (
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>
              Page Title
            </Label>

            <Input
              value={form.title}
              onChange={(e) =>
                updateForm(
                  'title',
                  e.target.value,
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
              value={form.slug}
              onChange={(e) =>
                updateForm(
                  'slug',
                  e.target.value,
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
                form.description
              }
              onChange={(e) =>
                updateForm(
                  'description',
                  e.target.value,
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
              value={form.content}
              onChange={(e) =>
                updateForm(
                  'content',
                  e.target.value,
                )
              }
              placeholder="Page content..."
              rows={8}
            />
          </div>

          <PublishToggle
            value={
              form.is_published
            }
            onChange={(value) =>
              updateForm(
                'is_published',
                value,
              )
            }
          />
        </div>
      )
    }

    if (activeTab === 'sections') {
      return (
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>
              Page ID
            </Label>

            <Input
              value={form.page_id}
              onChange={(e) =>
                updateForm(
                  'page_id',
                  e.target.value,
                )
              }
              placeholder="Page UUID"
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Section Title
            </Label>

            <Input
              value={form.title}
              onChange={(e) =>
                updateForm(
                  'title',
                  e.target.value,
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
              value={form.slug}
              onChange={(e) =>
                updateForm(
                  'slug',
                  e.target.value,
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
              value={form.content}
              onChange={(e) =>
                updateForm(
                  'content',
                  e.target.value,
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
              value={form.image_url}
              onChange={(e) =>
                updateForm(
                  'image_url',
                  e.target.value,
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
                form.sort_order
              }
              onChange={(e) =>
                updateForm(
                  'sort_order',
                  e.target.value,
                )
              }
            />
          </div>

          <PublishToggle
            value={
              form.is_published
            }
            onChange={(value) =>
              updateForm(
                'is_published',
                value,
              )
            }
          />
        </div>
      )
    }

    if (activeTab === 'services') {
      return (
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>
              Service Name
            </Label>

            <Input
              value={form.name}
              onChange={(e) =>
                updateForm(
                  'name',
                  e.target.value,
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
              value={form.slug}
              onChange={(e) =>
                updateForm(
                  'slug',
                  e.target.value,
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
                form.description
              }
              onChange={(e) =>
                updateForm(
                  'description',
                  e.target.value,
                )
              }
              rows={5}
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Price
            </Label>

            <Input
              type="number"
              value={form.price}
              onChange={(e) =>
                updateForm(
                  'price',
                  e.target.value,
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
                form.features
              }
              onChange={(e) =>
                updateForm(
                  'features',
                  e.target.value,
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
                form.image_url
              }
              onChange={(e) =>
                updateForm(
                  'image_url',
                  e.target.value,
                )
              }
              placeholder="/images/services/social.jpg"
            />
          </div>

          <PublishToggle
            value={
              form.is_published
            }
            onChange={(value) =>
              updateForm(
                'is_published',
                value,
              )
            }
          />
        </div>
      )
    }

    if (activeTab === 'products') {
      return (
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label>
              Product Name
            </Label>

            <Input
              value={form.name}
              onChange={(e) =>
                updateForm(
                  'name',
                  e.target.value,
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
              value={form.slug}
              onChange={(e) =>
                updateForm(
                  'slug',
                  e.target.value,
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
                form.description
              }
              onChange={(e) =>
                updateForm(
                  'description',
                  e.target.value,
                )
              }
              rows={5}
            />
          </div>

          <div className="grid gap-2">
            <Label>
              Price
            </Label>

            <Input
              type="number"
              value={form.price}
              onChange={(e) =>
                updateForm(
                  'price',
                  e.target.value,
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
                form.image_url
              }
              onChange={(e) =>
                updateForm(
                  'image_url',
                  e.target.value,
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
                form.download_url
              }
              onChange={(e) =>
                updateForm(
                  'download_url',
                  e.target.value,
                )
              }
              placeholder="https://..."
            />
          </div>

          <PublishToggle
            value={
              form.is_published
            }
            onChange={(value) =>
              updateForm(
                'is_published',
                value,
              )
            }
          />
        </div>
      )
    }

    return (
      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label>
            Question
          </Label>

          <Input
            value={
              form.question
            }
            onChange={(e) =>
              updateForm(
                'question',
                e.target.value,
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
            value={form.answer}
            onChange={(e) =>
              updateForm(
                'answer',
                e.target.value,
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
              form.sort_order
            }
            onChange={(e) =>
              updateForm(
                'sort_order',
                e.target.value,
              )
            }
          />
        </div>

        <PublishToggle
          value={
            form.is_published
          }
          onChange={(value) =>
            updateForm(
              'is_published',
              value,
            )
          }
        />
      </div>
    )
  }

  /* ==========================================================
     MAIN UI
  ========================================================== */

  const activeConfig =
    tableConfig[activeTab]

  const ActiveIcon =
    activeConfig.icon

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Website"
        title="Website Content"
        description="Manage your website pages, sections, services, products, and FAQs from one place."
      />

      <div className="space-y-6 p-5 lg:p-8">
        {/* =====================================================
            HEADER CARD
        ===================================================== */}

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
                  onClick={fetchAll}
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

        {/* =====================================================
            TABS
        ===================================================== */}

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(
              value as ContentType,
            )
            setSearch('')
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

          {/* ===================================================
              ALL TAB CONTENTS
          =================================================== */}

          {(
            Object.keys(
              tableConfig,
            ) as ContentType[]
          ).map((type) => {
            const config =
              tableConfig[type]

            const Icon =
              config.icon

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
                          onChange={(e) =>
                            setSearch(
                              e.target.value,
                            )
                          }
                          placeholder={`Search ${config.label.toLowerCase()}...`}
                          className="pl-9"
                        />
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {activeTab ===
                        type
                          ? filteredItems.length
                          : data[type]
                              .length}{' '}
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
                  ) : (
                    <>
                      {(
                        activeTab ===
                        type
                          ? filteredItems
                          : data[type]
                      ).length ===
                      0 ? (
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
                              onClick={
                                openAdd
                              }
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add{' '}
                              {
                                config.singular
                              }
                            </Button>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid gap-4 lg:grid-cols-2">
                          <AnimatePresence>
                            {(
                              activeTab ===
                              type
                                ? filteredItems
                                : data[type]
                            ).map(
                              (
                                item,
                                index,
                              ) => {
                                const published =
                                  isPublished(
                                    item,
                                  )

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
                                              /{item.slug}
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
                                              togglePublished(
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
                                              handleDelete(
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
                                )
                              },
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </div>

      {/* =======================================================
          ADD / EDIT DIALOG
      ======================================================= */}

      <Dialog
        open={dialogOpen}
        onOpenChange={
          setDialogOpen
        }
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
            onSubmit={
              handleSave
            }
          >
            <div className="py-4">
              {renderForm()}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDialogOpen(
                    false,
                  )
                }
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
  )
}

/* ============================================================
   PUBLISH TOGGLE
============================================================ */

function PublishToggle({
  value,
  onChange,
}: {
  value: boolean
  onChange: (
    value: boolean,
  ) => void
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">
            Publish on website
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {value
              ? 'This content is visible on the public website.'
              : 'This content is saved as a draft.'}
          </p>
        </div>

        <Button
          type="button"
          variant={
            value
              ? 'default'
              : 'outline'
          }
          size="sm"
          onClick={() =>
            onChange(!value)
          }
        >
          {value ? (
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
  )
}