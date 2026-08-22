import { supabase, supabaseConfigured } from './supabase';
import * as sample from './data';

import type {
  Client,
  Lead,
  DiscoveryCall,
  Project,
  ContentItem,
  DigitalProduct,
  Order,
  WebsiteRequest,
  TeamMember,
  Invoice,
} from './data';

// ============================================================
// ROW MAPPERS
// ============================================================

function mapClient(r: any): Client {
  return {
    id: r.id,
    name: r.name,
    company: r.company,
    email: r.email,
    phone: r.phone,
    servicePackage: r.service_package,
    status: r.status,
    monthlyRetainer: r.monthly_retainer,
    accountManager: r.account_manager,
    nextMeeting: r.next_meeting,
    lastActivity: r.last_activity,
    industry: r.industry,
    startDate: r.start_date,
    socials: r.socials ?? [],
    brandColors: r.brand_colors ?? [],
  };
}

function mapLead(r: any): Lead {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    business: r.business,
    budgetRange: r.budget_range,
    interestedService: r.interested_service,
    message: r.message,
    source: r.source,
    date: r.date,
    status: r.status,
  };
}

/**
 * Converts discovery_bookings into the DiscoveryCall
 * structure used by the admin dashboard.
 */
function mapDiscoveryBooking(r: any): DiscoveryCall {
  let combinedDate = '';

  if (r.date && r.time) {
    const parsed = new Date(`${r.date} ${r.time}`);

    if (!Number.isNaN(parsed.getTime())) {
      combinedDate = parsed.toISOString();
    } else {
      combinedDate = `${r.date} ${r.time}`;
    }
  } else if (r.date) {
    combinedDate = r.date;
  } else {
    combinedDate = new Date().toISOString();
  }

  // Convert public booking status to admin status
  let status = 'Scheduled';

  switch (String(r.status ?? '').toLowerCase()) {
    case 'completed':
      status = 'Completed';
      break;

    case 'cancelled':
    case 'canceled':
      status = 'Cancelled';
      break;

    case 'scheduled':
      status = 'Scheduled';
      break;

    case 'pending':
    default:
      status = 'Scheduled';
      break;
  }

  // Payment status
  let paymentStatus = 'Pending';

  if (Number(r.service_price ?? 0) === 0) {
    paymentStatus = 'Free';
  }

  if (
    String(r.payment_status ?? '').toLowerCase() === 'paid'
  ) {
    paymentStatus = 'Paid';
  }

  if (
    String(r.payment_status ?? '').toLowerCase() === 'free'
  ) {
    paymentStatus = 'Free';
  }

  return {
    id: String(r.id),
    clientName: r.name ?? '',
    type: r.service_name ?? 'Social Growth Sprint',
    duration: getBookingDuration(r),
    date: combinedDate,
    status: status as any,
    paymentStatus: paymentStatus as any,
    notes: r.notes ?? '',
    outcome: r.outcome ?? '',
  };
}

/**
 * Get duration from the selected service.
 */
function getBookingDuration(r: any): number {
  if (r.duration) {
    const numericDuration = Number(r.duration);

    if (!Number.isNaN(numericDuration)) {
      return numericDuration;
    }
  }

  switch (r.service_id) {
    case 'social-growth':
      return 30;

    case 'brand-clarity':
      return 45;

    case 'website-roadmap':
      return 60;

    default:
      return 30;
  }
}

function mapProject(r: any): Project {
  return {
    id: r.id,
    name: r.name,
    client: r.client,
    serviceType: r.service_type,
    stage: r.stage,
    progress: r.progress,
    deadline: r.deadline,
    team: r.team ?? [],
    priority: r.priority,
  };
}

function mapContentItem(r: any): ContentItem {
  return {
    id: r.id,
    platform: r.platform,
    caption: r.caption,
    status: r.status,
    scheduledDate: r.scheduled_date,
    designer: r.designer,
    copywriter: r.copywriter,
    client: r.client,
    reach: r.reach ?? undefined,
    engagement: r.engagement ?? undefined,
    saves: r.saves ?? undefined,
    shares: r.shares ?? undefined,
  };
}

function mapProduct(r: any): DigitalProduct {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    price: r.price,
    sku: r.sku,
    status: r.status,
    sales: r.sales,
    revenue: r.revenue,
    downloads: r.downloads,
    lastUpdated: r.last_updated,
  };
}

function mapOrder(r: any): Order {
  return {
    id: r.id,
    customer: r.customer,
    product: r.product,
    amount: r.amount,
    paymentMethod: r.payment_method,
    status: r.status,
    downloadSent: r.download_sent,
    date: r.date,
  };
}

function mapWebsiteRequest(r: any): WebsiteRequest {
  return {
    id: r.id,
    business: r.business,
    businessType: r.business_type,
    goals: r.goals ?? '',
    pagesRequested: r.pages_requested ?? [],
    featuresRequested: r.features_requested ?? [],
    budget: r.budget,
    timeline: r.timeline,
    proposalStatus: r.proposal_status,
    developmentStatus: r.development_status,
    date: r.date,
  };
}

function mapTeamMember(r: any): TeamMember {
  return {
    id: r.id,
    name: r.name,
    role: r.role,
    avatar: r.avatar,
    email: r.email,
    activeProjects: r.active_projects,
    tasksAssigned: r.tasks_assigned,
    tasksCompleted: r.tasks_completed,
    availability: r.availability,
    utilization: r.utilization,
  };
}

function mapInvoice(r: any): Invoice {
  return {
    id: r.id,
    client: r.client,
    amount: r.amount,
    status: r.status,
    dueDate: r.due_date,
    issuedDate: r.issued_date,
    service: r.service,
  };
}

// ============================================================
// FETCH FUNCTIONS
// ============================================================

export async function fetchClients(): Promise<Client[]> {
  if (!supabaseConfigured) {
    return Promise.resolve(sample.clients);
  }

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at');

  if (error) throw error;

  return (data ?? []).map(mapClient);
}

export async function fetchLeads(): Promise<Lead[]> {
  if (!supabaseConfigured) {
    return Promise.resolve(sample.leads);
  }

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at');

  if (error) throw error;

  return (data ?? []).map(mapLead);
}

// ============================================================
// DISCOVERY BOOKINGS
// ============================================================

/**
 * IMPORTANT:
 *
 * The public website saves bookings into:
 *
 * discovery_bookings
 *
 * Therefore the admin dashboard must also read from:
 *
 * discovery_bookings
 */
export async function fetchDiscoveryCalls(): Promise<DiscoveryCall[]> {
  if (!supabaseConfigured) {
    return Promise.resolve(sample.discoveryCalls);
  }

  const { data, error } = await supabase
    .from('discovery_bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch discovery bookings:', error);
    throw error;
  }

  return (data ?? []).map(mapDiscoveryBooking);
}

/**
 * Admin manually creates a booking.
 *
 * This now writes to discovery_bookings instead of discovery_calls.
 */
export async function insertDiscoveryCall(payload: {
  client_name: string;
  type: string;
  duration: number;
  date: string;
  status: string;
  payment_status: string;
  notes: string;
  outcome: string;
}) {
  const parsedDate = new Date(payload.date);

  const dateValue = Number.isNaN(parsedDate.getTime())
    ? new Date().toISOString().split('T')[0]
    : parsedDate.toISOString().split('T')[0];

  const timeValue = Number.isNaN(parsedDate.getTime())
    ? '09:00 AM'
    : parsedDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

  const serviceId =
    payload.type === 'Brand Clarity Session'
      ? 'brand-clarity'
      : payload.type === 'Website Roadmap Call'
        ? 'website-roadmap'
        : 'social-growth';

  const servicePrice =
    payload.type === 'Brand Clarity Session'
      ? 500
      : payload.type === 'Website Roadmap Call'
        ? 800
        : 300;

  const bookingStatus =
    payload.status === 'Completed'
      ? 'completed'
      : payload.status === 'Cancelled'
        ? 'cancelled'
        : 'pending';

  const { data, error } = await supabase
    .from('discovery_bookings')
    .insert({
      service_id: serviceId,
      service_name: payload.type,
      service_price: servicePrice,

      date: dateValue,
      time: timeValue,

      name: payload.client_name,

      email: '',

      phone: null,
      company: null,
      website: null,

      contact_method: 'Video call',

      budget: 'Not specified',
      timeline: 'Not specified',

      goals: [],

      notes: payload.notes || null,

      status: bookingStatus,

      payment_status:
        payload.payment_status === 'Paid'
          ? 'paid'
          : payload.payment_status === 'Free'
            ? 'free'
            : 'pending',

      outcome: payload.outcome || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to insert discovery booking:', error);
    throw error;
  }

  return mapDiscoveryBooking(data);
}

export async function updateDiscoveryCall(
  id: string,
  payload: Record<string, unknown>,
) {
  const updatePayload: Record<string, unknown> = {};

  if ('status' in payload) {
    const status = String(payload.status);

    updatePayload.status =
      status === 'Completed'
        ? 'completed'
        : status === 'Cancelled'
          ? 'cancelled'
          : 'pending';
  }

  if ('notes' in payload) {
    updatePayload.notes = payload.notes;
  }

  if ('outcome' in payload) {
    updatePayload.outcome = payload.outcome;
  }

  if ('payment_status' in payload) {
    updatePayload.payment_status = payload.payment_status;
  }

  const { data, error } = await supabase
    .from('discovery_bookings')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update discovery booking:', error);
    throw error;
  }

  return mapDiscoveryBooking(data);
}

export async function deleteDiscoveryCall(id: string) {
  const { error } = await supabase
    .from('discovery_bookings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete discovery booking:', error);
    throw error;
  }
}

// ============================================================
// OTHER DISCOVERY CALLS LEGACY FUNCTION
// ============================================================

export async function fetchLegacyDiscoveryCalls(): Promise<DiscoveryCall[]> {
  if (!supabaseConfigured) {
    return Promise.resolve(sample.discoveryCalls);
  }

  const { data, error } = await supabase
    .from('discovery_calls')
    .select('*')
    .order('created_at');

  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    clientName: r.client_name,
    type: r.type,
    duration: r.duration,
    date: r.date,
    status: r.status,
    paymentStatus: r.payment_status,
    notes: r.notes ?? '',
    outcome: r.outcome ?? '',
  }));
}

// ============================================================
// PROJECTS
// ============================================================

export async function fetchProjects(): Promise<Project[]> {
  if (!supabaseConfigured) {
    return Promise.resolve(sample.projects);
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at');

  if (error) throw error;

  return (data ?? []).map(mapProject);
}

// ============================================================
// CONTENT
// ============================================================

export async function fetchContentItems(): Promise<ContentItem[]> {
  if (!supabaseConfigured) {
    return Promise.resolve(sample.contentItems);
  }

  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .order('created_at');

  if (error) throw error;

  return (data ?? []).map(mapContentItem);
}

// ============================================================
// PRODUCTS
// ============================================================

export async function fetchProducts(): Promise<DigitalProduct[]> {
  if (!supabaseConfigured) {
    return Promise.resolve(sample.digitalProducts);
  }

  const { data, error } = await supabase
    .from('digital_products')
    .select('*')
    .order('created_at');

  if (error) throw error;

  return (data ?? []).map(mapProduct);
}

// ============================================================
// ORDERS
// ============================================================

export async function fetchOrders(): Promise<Order[]> {
  if (!supabaseConfigured) {
    return Promise.resolve(sample.orders);
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at');

  if (error) throw error;

  return (data ?? []).map(mapOrder);
}

// ============================================================
// WEBSITE REQUESTS
// ============================================================

export async function fetchWebsiteRequests(): Promise<WebsiteRequest[]> {
  if (!supabaseConfigured) {
    return Promise.resolve([]);
  }

  const { data, error } = await supabase
    .from('website_requests')
    .select('*')
    .order('created_at');

  if (error) throw error;

  return (data ?? []).map(mapWebsiteRequest);
}

// ============================================================
// TEAM
// ============================================================

export async function fetchTeam(): Promise<TeamMember[]> {
  if (!supabaseConfigured) {
    return Promise.resolve([]);
  }

  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('created_at');

  if (error) throw error;

  return (data ?? []).map(mapTeamMember);
}

// ============================================================
// INVOICES
// ============================================================

export async function fetchInvoices(): Promise<Invoice[]> {
  if (!supabaseConfigured) {
    return Promise.resolve([]);
  }

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at');

  if (error) throw error;

  return (data ?? []).map(mapInvoice);
}

// ============================================================
// ACTIVITY / NOTIFICATIONS / ANALYTICS
// ============================================================

export interface Activity {
  id: string;
  type: string;
  text: string;
  time: string | null;
  icon: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string | null;
  time: string | null;
  unread: boolean;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ProductSale {
  month: string;
  sales: number;
  revenue: number;
}

export interface CallBooking {
  week: string;
  calls: number;
}

export async function fetchActivities(): Promise<Activity[]> {
  if (!supabaseConfigured) return [];

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('created_at');

  if (error) throw error;

  return (data ?? []) as Activity[];
}

export async function fetchNotifications(): Promise<Notification[]> {
  if (!supabaseConfigured) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at');

  if (error) throw error;

  return (data ?? []) as Notification[];
}

export async function fetchMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  if (!supabaseConfigured) return [];

  const { data, error } = await supabase
    .from('monthly_revenue')
    .select('month, revenue, expenses, profit')
    .order('id');

  if (error) throw error;

  return (data ?? []) as MonthlyRevenue[];
}

export async function fetchProductSales(): Promise<ProductSale[]> {
  if (!supabaseConfigured) return [];

  const { data, error } = await supabase
    .from('product_sales')
    .select('month, sales, revenue')
    .order('id');

  if (error) throw error;

  return (data ?? []) as ProductSale[];
}

export async function fetchCallBookings(): Promise<CallBooking[]> {
  if (!supabaseConfigured) return [];

  const { data, error } = await supabase
    .from('call_bookings')
    .select('week, calls')
    .order('id');

  if (error) throw error;

  return (data ?? []) as CallBooking[];
}

// ============================================================
// CLIENT MUTATIONS
// ============================================================

export async function insertClient(payload: {
  name: string;
  company: string;
  email: string;
  phone: string;
  service_package: string;
  status: string;
  monthly_retainer: number;
  account_manager: string;
  industry: string;
  start_date: string;
}) {
  const { data, error } = await supabase
    .from('clients')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return mapClient(data);
}

export async function updateClient(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from('clients')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapClient(data);
}

export async function deleteClient(id: string) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================
// LEAD MUTATIONS
// ============================================================

export async function insertLead(payload: {
  name: string;
  email: string;
  business: string;
  budget_range: string;
  interested_service: string;
  message: string;
  source: string;
  status: string;
}) {
  const { data, error } = await supabase
    .from('leads')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return mapLead(data);
}

export async function updateLead(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from('leads')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapLead(data);
}

export async function deleteLead(id: string) {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================
// PROJECT MUTATIONS
// ============================================================

export async function insertProject(payload: {
  name: string;
  client: string;
  service_type: string;
  stage: string;
  progress: number;
  deadline: string;
  team: string[];
  priority: string;
}) {
  const { data, error } = await supabase
    .from('projects')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return mapProject(data);
}

export async function updateProject(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapProject(data);
}

export async function deleteProject(id: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================
// INVOICE MUTATIONS
// ============================================================

export async function insertInvoice(payload: {
  client: string;
  amount: number;
  status: string;
  due_date: string;
  issued_date: string;
  service: string;
}) {
  const { data, error } = await supabase
    .from('invoices')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return mapInvoice(data);
}

export async function updateInvoice(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from('invoices')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapInvoice(data);
}

export async function deleteInvoice(id: string) {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================
// ORDER MUTATIONS
// ============================================================

export async function insertOrder(payload: {
  customer: string;
  product: string;
  amount: number;
  payment_method: string;
  status: string;
  download_sent: boolean;
  date: string;
}) {
  const { data, error } = await supabase
    .from('orders')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return mapOrder(data);
}

export async function updateOrder(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from('orders')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapOrder(data);
}

export async function deleteOrder(id: string) {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================
// PRODUCT MUTATIONS
// ============================================================

export async function insertProduct(payload: {
  name: string;
  category: string;
  price: number;
  sku: string;
  status: string;
  sales: number;
  revenue: number;
  downloads: number;
}) {
  const { data, error } = await supabase
    .from('digital_products')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return mapProduct(data);
}

export async function updateProduct(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from('digital_products')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapProduct(data);
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('digital_products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================
// CONTENT MUTATIONS
// ============================================================

export async function insertContentItem(payload: {
  platform: string;
  caption: string;
  status: string;
  scheduled_date: string;
  designer: string;
  copywriter: string;
  client: string;
}) {
  const { data, error } = await supabase
    .from('content_items')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return mapContentItem(data);
}

export async function updateContentItem(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from('content_items')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapContentItem(data);
}

export async function deleteContentItem(id: string) {
  const { error } = await supabase
    .from('content_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================
// WEBSITE REQUEST MUTATIONS
// ============================================================

export async function insertWebsiteRequest(payload: {
  business: string;
  business_type: string;
  goals: string;
  pages_requested: string[];
  features_requested: string[];
  budget: string;
  timeline: string;
  proposal_status: string;
  development_status: string;
}) {
  const { data, error } = await supabase
    .from('website_requests')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return mapWebsiteRequest(data);
}

export async function updateWebsiteRequest(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from('website_requests')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapWebsiteRequest(data);
}

export async function deleteWebsiteRequest(id: string) {
  const { error } = await supabase
    .from('website_requests')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================
// TEAM MUTATIONS
// ============================================================

export async function insertTeamMember(payload: {
  name: string;
  role: string;
  email: string;
  active_projects: number;
  tasks_assigned: number;
  tasks_completed: number;
  availability: string;
  utilization: number;
}) {
  const { data, error } = await supabase
    .from('team_members')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return mapTeamMember(data);
}

export async function updateTeamMember(
  id: string,
  payload: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from('team_members')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapTeamMember(data);
}

export async function deleteTeamMember(id: string) {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id);

  if (error) throw error;
}