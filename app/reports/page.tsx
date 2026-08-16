'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Eye,
  Share2,
  Globe,
  FolderKanban,
  DollarSign,
  UsersRound,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { DashboardShell, PageHeader } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  lastGenerated: string;
  format: string;
  fields: string[];
  pages: number;
}

const templates: ReportTemplate[] = [
  {
    id: 'R-001',
    name: 'Monthly Social Media Report',
    description: 'Performance summary across all social platforms with reach, engagement, and growth metrics.',
    icon: Share2,
    color: 'from-rose-500 to-pink-500',
    lastGenerated: '2026-08-01',
    format: 'PDF',
    fields: ['Reach & impressions', 'Engagement rate', 'Follower growth', 'Top performing posts', 'Audience demographics'],
    pages: 8,
  },
  {
    id: 'R-002',
    name: 'Website Performance Report',
    description: 'Traffic, conversions, and technical health metrics for client websites.',
    icon: Globe,
    color: 'from-blue-500 to-indigo-500',
    lastGenerated: '2026-08-03',
    format: 'PDF',
    fields: ['Page views & sessions', 'Bounce rate', 'Conversion rate', 'Page load speed', 'SEO rankings'],
    pages: 6,
  },
  {
    id: 'R-003',
    name: 'Project Progress Report',
    description: 'Status update on all active projects with milestones, timeline, and deliverables.',
    icon: FolderKanban,
    color: 'from-amber-500 to-orange-500',
    lastGenerated: '2026-08-05',
    format: 'PDF',
    fields: ['Milestone status', 'Timeline & deadlines', 'Deliverables completed', 'Budget utilization', 'Risk items'],
    pages: 5,
  },
  {
    id: 'R-004',
    name: 'Revenue Report',
    description: 'Monthly revenue breakdown by service, client, and product with profit margins.',
    icon: DollarSign,
    color: 'from-emerald-500 to-teal-500',
    lastGenerated: '2026-08-01',
    format: 'PDF',
    fields: ['Revenue by service', 'Revenue by client', 'Outstanding invoices', 'Profit margins', 'MRR growth'],
    pages: 4,
  },
  {
    id: 'R-005',
    name: 'Team Productivity Report',
    description: 'Workload distribution, task completion rates, and utilization per team member.',
    icon: UsersRound,
    color: 'from-violet-500 to-purple-500',
    lastGenerated: '2026-08-06',
    format: 'PDF',
    fields: ['Task completion rate', 'Workload distribution', 'Billable hours', 'Utilization %', 'Bottlenecks'],
    pages: 3,
  },
];

const recentReports = [
  { id: 'RP-001', template: 'Monthly Social Media Report', client: 'Bloom Skincare', date: '2026-08-01', size: '2.4 MB' },
  { id: 'RP-002', template: 'Project Progress Report', client: 'Vellamore Interiors', date: '2026-08-05', size: '1.8 MB' },
  { id: 'RP-003', template: 'Revenue Report', client: 'Internal', date: '2026-08-01', size: '3.1 MB' },
  { id: 'RP-004', template: 'Website Performance Report', client: 'FitForge Gym', date: '2026-08-03', size: '1.2 MB' },
  { id: 'RP-005', template: 'Team Productivity Report', client: 'Internal', date: '2026-08-06', size: '0.9 MB' },
];

export default function ReportsPage() {
  const [previewReport, setPreviewReport] = React.useState<typeof templates[number] | null>(null);

  const generate = (name: string) => {
    toast.success(`${name} generated`, { description: 'The report is ready to download.' });
  };

  const downloadCSV = (reportName: string) => {
    const headers = ['Report', 'Client', 'Date', 'Size'];
    const rows = recentReports.map((r) => [r.template, r.client, r.date, r.size]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName.replace(/\s+/g, '_').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  return (
    <DashboardShell>
      <PageHeader title="Reports" description="Generate and download exportable client and internal reports" />

      {/* Templates */}
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold">Report Templates</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="group cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm', t.color)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Last: {t.lastGenerated}
                      </div>
                      <Badge variant="outline" className="text-[10px]">{t.format}</Badge>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setPreviewReport(t)}>
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Preview
                      </Button>
                      <Button size="sm" className="flex-1" onClick={() => generate(t.name)}>
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Generate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recently generated */}
      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Recently Generated Reports</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {recentReports.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{r.template}</p>
                <p className="text-xs text-muted-foreground">{r.client} · {r.date} · {r.size}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => downloadCSV(r.template)}>
                <Download className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Preview dialog */}
      <Dialog open={!!previewReport} onOpenChange={(open) => !open && setPreviewReport(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{previewReport?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{previewReport?.description}</p>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Report contents</p>
              <ul className="space-y-1.5 text-sm">
                {previewReport?.fields.map((f: string) => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{previewReport?.format}</Badge>
              <span>~{previewReport?.pages} pages</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewReport(null)}>Close</Button>
            <Button onClick={() => { if (previewReport) generate(previewReport.name); setPreviewReport(null); }}>
              <Download className="mr-1.5 h-4 w-4" />
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
