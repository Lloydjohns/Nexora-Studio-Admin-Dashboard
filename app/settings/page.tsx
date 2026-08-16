'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Palette,
  Mail,
  CreditCard,
  CalendarDays,
  Shield,
  Bell,
  Plug,
  HardDrive,
  Save,
  Upload,
  Check,
} from 'lucide-react';
import { DashboardShell, PageHeader } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { agency } from '@/lib/data';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const emailTemplates: Record<string, string> = {
  'Welcome Email': "Hi {{client_name}},\n\nWelcome to Nexora Digital! We're thrilled to have you on board. Our team will be reaching out shortly to kick off your onboarding.\n\nBest regards,\nThe Nexora Team",
  'Invoice Reminder': "Hi {{client_name}},\n\nThis is a friendly reminder that invoice {{invoice_id}} for {{amount}} is due on {{due_date}}. Please settle your balance at your earliest convenience.\n\nThank you,\nNexora Finance",
  'Proposal Follow-up': "Hi {{client_name}},\n\nI wanted to follow up on the proposal we sent over. Let us know if you have any questions or if you'd like to proceed.\n\nBest,\nNexora Team",
  'Content Approval Request': "Hi {{client_name}},\n\nYour content for {{platform}} is ready for review. Please approve by {{deadline}} so we can publish on schedule.\n\nThanks,\nNexora Creative",
  'Onboarding Checklist': "Hi {{client_name}},\n\nHere's your onboarding checklist:\n1. Complete brand questionnaire\n2. Grant social media access\n3. Provide logo & brand assets\n4. Schedule kickoff call\n\nRegards,\nNexora Team",
};

const sections = [
  { id: 'profile', label: 'Agency Profile', icon: Building2 },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'email', label: 'Email Templates', icon: Mail },
  { id: 'payments', label: 'Payment Settings', icon: CreditCard },
  { id: 'calendar', label: 'Calendar Integration', icon: CalendarDays },
  { id: 'roles', label: 'User Roles & Permissions', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'api', label: 'API Integrations', icon: Plug },
  { id: 'storage', label: 'File Storage', icon: HardDrive },
];

const integrations = [
  { name: 'GCash', status: 'Connected', color: 'bg-blue-500' },
  { name: 'PayPal', status: 'Connected', color: 'bg-indigo-500' },
  { name: 'Stripe', status: 'Not connected', color: 'bg-violet-500' },
  { name: 'Google Calendar', status: 'Connected', color: 'bg-emerald-500' },
  { name: 'Mailchimp', status: 'Not connected', color: 'bg-amber-500' },
  { name: 'Meta Business', status: 'Connected', color: 'bg-sky-500' },
];

const roles = [
  { role: 'Admin', members: 1, permissions: 'Full access' },
  { role: 'Creative Director', members: 1, permissions: 'All except billing' },
  { role: 'Designer', members: 1, permissions: 'Projects, content, files' },
  { role: 'Video Editor', members: 1, permissions: 'Content, files' },
  { role: 'Copywriter', members: 1, permissions: 'Content, notes' },
  { role: 'Web Developer', members: 1, permissions: 'Projects, code, files' },
  { role: 'Social Media Manager', members: 1, permissions: 'Social, content' },
];

export default function SettingsPage() {
  const [active, setActive] = React.useState('profile');
  const [notifications, setNotifications] = React.useState({
    newLead: true,
    callBooked: true,
    invoicePaid: true,
    contentApproval: true,
    deadlineAlert: true,
    weeklyDigest: false,
  });
  const [templateOpen, setTemplateOpen] = React.useState(false);
  const [templateName, setTemplateName] = React.useState('');
  const [templateBody, setTemplateBody] = React.useState('');
  const [permsOpen, setPermsOpen] = React.useState(false);
  const [permsRole, setPermsRole] = React.useState('');

  const save = () => toast.success('Settings saved successfully');

  const openTemplate = (name: string) => {
    setTemplateName(name);
    setTemplateBody(emailTemplates[name] ?? '');
    setTemplateOpen(true);
  };

  const openPerms = (role: string) => {
    setPermsRole(role);
    setPermsOpen(true);
  };

  return (
    <DashboardShell>
      <PageHeader title="Settings" description="Manage your agency profile, integrations, and preferences">
        <Button size="sm" onClick={save}>
          <Save className="mr-1.5 h-4 w-4" />
          Save Changes
        </Button>
      </PageHeader>

      <div className="mt-6 grid gap-6 lg:grid-cols-[200px_1fr]">
        {/* Section nav */}
        <nav className="space-y-0.5">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active === s.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {s.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {active === 'profile' && (
            <Card>
              <CardHeader><CardTitle className="text-base">Agency Profile</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 text-white">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-1.5 h-4 w-4" />
                    Upload Logo
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label className="mb-1.5 block text-xs">Business Name</Label><Input defaultValue={agency.name} /></div>
                  <div><Label className="mb-1.5 block text-xs">Tagline</Label><Input defaultValue={agency.tagline} /></div>
                  <div><Label className="mb-1.5 block text-xs">Email</Label><Input defaultValue={agency.email} /></div>
                  <div><Label className="mb-1.5 block text-xs">Phone</Label><Input defaultValue={agency.phone} /></div>
                  <div className="sm:col-span-2"><Label className="mb-1.5 block text-xs">Location</Label><Input defaultValue={agency.location} /></div>
                </div>
              </CardContent>
            </Card>
          )}

          {active === 'branding' && (
            <Card>
              <CardHeader><CardTitle className="text-base">Branding</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block text-xs">Accent Color</Label>
                  <div className="flex gap-2">
                    {['hsl(243, 75%, 59%)', 'hsl(262, 83%, 58%)', 'hsl(199, 89%, 48%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)'].map((c, i) => (
                      <button key={c} className={cn('h-10 w-10 rounded-lg border-2', i === 0 ? 'border-foreground' : 'border-transparent')} style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="mb-2 block text-xs">Theme</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 cursor-pointer rounded-lg border-2 border-foreground p-3">
                      <div className="mb-2 h-12 rounded bg-white border" />
                      <p className="text-xs font-medium">Light</p>
                    </div>
                    <div className="flex-1 cursor-pointer rounded-lg border-2 border-transparent p-3">
                      <div className="mb-2 h-12 rounded bg-slate-900 border border-slate-700" />
                      <p className="text-xs font-medium">Dark</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {active === 'email' && (
            <Card>
              <CardHeader><CardTitle className="text-base">Email Templates</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {['Welcome Email', 'Invoice Reminder', 'Proposal Follow-up', 'Content Approval Request', 'Onboarding Checklist'].map((t) => (
                  <div key={t} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{t}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => openTemplate(t)}>Edit</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {active === 'payments' && (
            <Card>
              <CardHeader><CardTitle className="text-base">Payment Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label className="mb-1.5 block text-xs">Currency</Label><Input defaultValue="PHP (₱)" /></div>
                  <div><Label className="mb-1.5 block text-xs">Default Payment Terms</Label><Input defaultValue="Net 15" /></div>
                </div>
                <Separator />
                <p className="text-xs font-semibold">Payment Methods</p>
                {integrations.slice(0, 3).map((int) => (
                  <div key={int.name} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className={cn('h-8 w-8 rounded-lg', int.color)} />
                      <span className="text-sm font-medium">{int.name}</span>
                    </div>
                    <Badge variant={int.status === 'Connected' ? 'default' : 'secondary'}>
                      {int.status === 'Connected' && <Check className="mr-1 h-3 w-3" />}
                      {int.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {active === 'calendar' && (
            <Card>
              <CardHeader><CardTitle className="text-base">Calendar Integration</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Google Calendar</p>
                      <p className="text-xs text-emerald-600">Connected · syncing</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Outlook Calendar</p>
                      <p className="text-xs text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {active === 'roles' && (
            <Card>
              <CardHeader><CardTitle className="text-base">User Roles & Permissions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {roles.map((r) => (
                  <div key={r.role} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{r.role}</p>
                      <p className="text-xs text-muted-foreground">{r.permissions}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-[10px]">{r.members} member{r.members > 1 ? 's' : ''}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => openPerms(r.role)}>Manage</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {active === 'notifications' && (
            <Card>
              <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                {[
                  { key: 'newLead', label: 'New lead received', desc: 'Get notified when a website inquiry comes in' },
                  { key: 'callBooked', label: 'Discovery call booked', desc: 'Alert when a call is scheduled' },
                  { key: 'invoicePaid', label: 'Invoice paid', desc: 'Notification when a payment is received' },
                  { key: 'contentApproval', label: 'Content needs approval', desc: 'Alert when content is ready for review' },
                  { key: 'deadlineAlert', label: 'Project deadline approaching', desc: 'Reminder before project deadlines' },
                  { key: 'weeklyDigest', label: 'Weekly digest', desc: 'Summary of all activity every Monday' },
                ].map((n) => (
                  <div key={n.key} className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                    </div>
                    <Switch
                      checked={notifications[n.key as keyof typeof notifications]}
                      onCheckedChange={(v) => setNotifications((prev) => ({ ...prev, [n.key]: v }))}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {active === 'api' && (
            <Card>
              <CardHeader><CardTitle className="text-base">API Integrations</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {integrations.map((int) => (
                  <div key={int.name} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className={cn('h-9 w-9 rounded-lg', int.color)} />
                      <div>
                        <p className="text-sm font-medium">{int.name}</p>
                        <p className="text-xs text-muted-foreground">{int.status}</p>
                      </div>
                    </div>
                    {int.status === 'Connected' ? (
                      <Button variant="outline" size="sm" onClick={() => toast.info(`${int.name} settings opened`, { description: 'Configure your integration preferences.' })}>Manage</Button>
                    ) : (
                      <Button size="sm" onClick={() => toast.success(`${int.name} connected`, { description: 'Authorization complete. You can now use this integration.' })}>Connect</Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {active === 'storage' && (
            <Card>
              <CardHeader><CardTitle className="text-base">File Storage</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Storage Used</p>
                    <p className="text-sm font-semibold tabular-nums">42.8 GB / 100 GB</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[43%] rounded-full bg-primary" />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Client Files', size: '18.2 GB' },
                    { label: 'Content Assets', size: '15.4 GB' },
                    { label: 'Project Attachments', size: '9.2 GB' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="text-lg font-bold tabular-nums">{s.size}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Template editor dialog */}
      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Template — {templateName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea rows={10} value={templateBody} onChange={(e) => setTemplateBody(e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground">Use placeholders like {'{{client_name}}'}, {'{{invoice_id}}'}, {'{{amount}}'} for dynamic content.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              emailTemplates[templateName] = templateBody;
              setTemplateOpen(false);
              toast.success('Template saved');
            }}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions dialog */}
      <Dialog open={permsOpen} onOpenChange={setPermsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Permissions — {permsRole}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { label: 'View dashboard', on: true },
              { label: 'Manage clients', on: permsRole !== 'Viewer' },
              { label: 'Manage finances', on: permsRole === 'Owner' || permsRole === 'Accountant' },
              { label: 'Publish content', on: permsRole === 'Owner' || permsRole === 'Content Manager' },
              { label: 'Manage team', on: permsRole === 'Owner' },
              { label: 'Access settings', on: permsRole === 'Owner' },
            ].map((p) => (
              <div key={p.label} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">{p.label}</span>
                <Switch defaultChecked={p.on} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermsOpen(false)}>Cancel</Button>
            <Button onClick={() => { setPermsOpen(false); toast.success('Permissions updated'); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
