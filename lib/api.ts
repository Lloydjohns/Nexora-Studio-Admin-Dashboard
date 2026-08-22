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
// HELPERS
// ============================================================

function isValidDate(value: unknown): value is string {
  if (!value || typeof value !== 'string') return false;

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
}

function safeString(
  value: unknown,
  fallback = '',
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  return String(value);
}

/**
 * Converts a database date + time into a single ISO date.
 *
 * discovery_bookings stores:
 *   date -> YYYY-MM-DD
 *   time -> HH:MM / HH:MM:SS
 */
function combineBookingDateTime(
  dateValue: unknown,
  timeValue: unknown,
): string {
  if (!dateValue) {
    return new Date().toISOString();
  }

  const date = String(dateValue).trim();

  if (!timeValue) {
    return isValidDate(date)
      ? new Date(date).toISOString()
      : date;
  }

  const time = String(timeValue).trim();

  const combined = `${date} ${time}`;

  const parsed = new Date(combined);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  const fallback = new Date(`${date}T${time}`);

  if (!Number.isNaN(fallback.getTime())) {
    return fallback.toISOString();
  }

  return combined;
}

// ============================================================
// DISCOVERY BOOKING HELPERS
// ============================================================

function normalizeBookingStatus(
  status: unknown,
): string {
  switch (
    String(status ?? '')
      .trim()
      .toLowerCase()
  ) {
    case 'completed':
      return 'completed';

    case 'cancelled':
    case 'canceled':
      return 'cancelled';

    case 'scheduled':
    case 'pending':
      return 'pending';

    default:
      return 'pending';
  }
}

function mapBookingStatus(
  status: unknown,
): string {
  switch (
    String(status ?? '')
      .trim()
      .toLowerCase()
  ) {
    case 'completed':
      return 'Completed';

    case 'cancelled':
    case 'canceled':
      return 'Cancelled';

    case 'scheduled':
    case 'pending':
    default:
      return 'Scheduled';
  }
}

function normalizePaymentStatus(
  paymentStatus: unknown,
): string {
  switch (
    String(paymentStatus ?? '')
      .trim()
      .toLowerCase()
  ) {
    case 'paid':
      return 'paid';

    case 'free':
      return 'free';

    case 'pending':
    default:
      return 'pending';
  }
}

function mapPaymentStatus(
  paymentStatus: unknown,
  servicePrice: unknown,
): string {
  const value = String(
    paymentStatus ?? '',
  )
    .trim()
    .toLowerCase();

  if (value === 'paid') {
    return 'Paid';
  }

  if (value === 'free') {
    return 'Free';
  }

  if (Number(servicePrice ?? 0) === 0) {
    return 'Free';
  }

  return 'Pending';
}

function getBookingDuration(
  r: any,
): number {
  if (
    r?.duration !== null &&
    r?.duration !== undefined &&
    r?.duration !== ''
  ) {
    const numericDuration =
      Number(r.duration);

    if (
      !Number.isNaN(
        numericDuration,
      )
    ) {
      return numericDuration;
    }
  }

  switch (r?.service_id) {
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

function getServiceDetails(
  type: string,
) {
  switch (type) {
    case 'Brand Clarity Session':
      return {
        serviceId: 'brand-clarity',
        serviceName:
          'Brand Clarity Session',
        servicePrice: 500,
        duration: 45,
      };

    case 'Website Roadmap Call':
      return {
        serviceId: 'website-roadmap',
        serviceName:
          'Website Roadmap Call',
        servicePrice: 800,
        duration: 60,
      };

    case 'Social Growth Sprint':
    default:
      return {
        serviceId: 'social-growth',
        serviceName:
          'Social Growth Sprint',
        servicePrice: 300,
        duration: 30,
      };
  }
}

// ============================================================
// LEAD HELPERS
// ============================================================

/**
 * Converts database lead status to dashboard status.
 *
 * Supports both:
 *   New
 *   new
 *   Contacted
 *   contacted
 *   Discovery Scheduled
 *   discovery_scheduled
 *   Proposal Sent
 *   proposal_sent
 *   Won
 *   won
 *   Lost
 *   lost
 */
function mapLeadStatus(
  status: unknown,
): Lead['status'] {
  const value = String(
    status ?? 'New',
  )
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ');

  switch (value) {
    case 'contacted':
      return 'Contacted';

    case 'discovery scheduled':
    case 'discovery call':
    case 'discovery':
      return 'Discovery Scheduled';

    case 'proposal sent':
    case 'proposal':
      return 'Proposal Sent';

    case 'won':
    case 'converted':
      return 'Won';

    case 'lost':
      return 'Lost';

    case 'new':
    default:
      return 'New';
  }
}

/**
 * Converts dashboard lead status into
 * a database-friendly value.
 */
function normalizeLeadStatus(
  status: unknown,
): string {
  switch (
    String(status ?? 'New')
      .trim()
      .toLowerCase()
  ) {
    case 'contacted':
      return 'Contacted';

    case 'discovery scheduled':
      return 'Discovery Scheduled';

    case 'proposal sent':
      return 'Proposal Sent';

    case 'won':
      return 'Won';

    case 'lost':
      return 'Lost';

    case 'new':
    default:
      return 'New';
  }
}

// ============================================================
// ROW MAPPERS
// ============================================================

function mapClient(
  r: any,
): Client {
  return {
    id: safeString(r.id),
    name: safeString(r.name),
    company: safeString(r.company),
    email: safeString(r.email),
    phone: safeString(r.phone),
    servicePackage: safeString(
      r.service_package,
    ),
    status: r.status,
    monthlyRetainer:
      Number(
        r.monthly_retainer ?? 0,
      ),
    accountManager:
      safeString(
        r.account_manager,
      ),
    nextMeeting:
      safeString(
        r.next_meeting,
      ),
    lastActivity:
      safeString(
        r.last_activity,
      ),
    industry:
      safeString(r.industry),
    startDate:
      safeString(r.start_date),
    socials:
      r.socials ?? [],
    brandColors:
      r.brand_colors ?? [],
  };
}

/**
 * IMPORTANT LEAD MAPPER
 *
 * This mapper supports:
 *
 * budget_range
 * interested_service
 * created_at
 * date
 *
 * So the dashboard can still display
 * a lead even when `date` is not present.
 */
function mapLead(
  r: any,
): Lead {
  const rawDate =
    r.date ??
    r.created_at ??
    r.createdAt ??
    new Date().toISOString();

  return {
    id: safeString(r.id),

    name: safeString(
      r.name,
    ),

    email: safeString(
      r.email,
    ),

    business: safeString(
      r.business ??
        r.company,
    ),

    budgetRange:
      safeString(
        r.budget_range ??
          r.budget ??
          r.budgetRange,
        'Not specified',
      ),

    interestedService:
      safeString(
        r.interested_service ??
          r.service ??
          r.service_name ??
          r.interestedService,
        'Not specified',
      ),

    message:
      safeString(
        r.message ??
          r.goals ??
          r.notes,
      ),

    source:
      safeString(
        r.source,
        'Website',
      ),

    date:
      safeString(
        rawDate,
      ),

    status:
      mapLeadStatus(
        r.status,
      ),
  };
}

function mapDiscoveryBooking(
  r: any,
): DiscoveryCall {
  const combinedDate =
    combineBookingDateTime(
      r.date,
      r.time,
    );

  const status =
    mapBookingStatus(
      r.status,
    );

  const paymentStatus =
    mapPaymentStatus(
      r.payment_status,
      r.service_price,
    );

  return {
    id: String(r.id),

    clientName:
      r.name ?? '',

    type:
      r.service_name ??
      'Social Growth Sprint',

    duration:
      getBookingDuration(r),

    date:
      combinedDate,

    status:
      status as any,

    paymentStatus:
      paymentStatus as any,

    notes:
      r.notes ?? '',

    outcome:
      r.outcome ?? '',
  };
}

function mapProject(
  r: any,
): Project {
  return {
    id: r.id,
    name: r.name,
    client: r.client,
    serviceType:
      r.service_type,
    stage: r.stage,
    progress: r.progress,
    deadline: r.deadline,
    team: r.team ?? [],
    priority: r.priority,
  };
}

function mapContentItem(
  r: any,
): ContentItem {
  return {
    id: r.id,
    platform: r.platform,
    caption: r.caption,
    status: r.status,
    scheduledDate:
      r.scheduled_date,
    designer: r.designer,
    copywriter: r.copywriter,
    client: r.client,
    reach:
      r.reach ?? undefined,
    engagement:
      r.engagement ?? undefined,
    saves:
      r.saves ?? undefined,
    shares:
      r.shares ?? undefined,
  };
}

function mapProduct(
  r: any,
): DigitalProduct {
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
    lastUpdated:
      r.last_updated,
  };
}

function mapOrder(
  r: any,
): Order {
  return {
    id: r.id,
    customer: r.customer,
    product: r.product,
    amount: r.amount,
    paymentMethod:
      r.payment_method,
    status: r.status,
    downloadSent:
      r.download_sent,
    date: r.date,
  };
}

function mapWebsiteRequest(
  r: any,
): WebsiteRequest {
  return {
    id: r.id,
    business: r.business,
    businessType:
      r.business_type,
    goals:
      r.goals ?? '',
    pagesRequested:
      r.pages_requested ?? [],
    featuresRequested:
      r.features_requested ?? [],
    budget:
      r.budget,
    timeline:
      r.timeline,
    proposalStatus:
      r.proposal_status,
    developmentStatus:
      r.development_status,
    date:
      r.date,
  };
}

function mapTeamMember(
  r: any,
): TeamMember {
  return {
    id: r.id,
    name: r.name,
    role: r.role,
    avatar: r.avatar,
    email: r.email,
    activeProjects:
      r.active_projects,
    tasksAssigned:
      r.tasks_assigned,
    tasksCompleted:
      r.tasks_completed,
    availability:
      r.availability,
    utilization:
      r.utilization,
  };
}

function mapInvoice(
  r: any,
): Invoice {
  return {
    id: r.id,
    client: r.client,
    amount: r.amount,
    status: r.status,
    dueDate:
      r.due_date,
    issuedDate:
      r.issued_date,
    service:
      r.service,
  };
}

// ============================================================
// CLIENTS
// ============================================================

export async function fetchClients(): Promise<Client[]> {
  if (!supabaseConfigured) {
    return Promise.resolve(
      sample.clients,
    );
  }

  const { data, error } =
    await supabase
      .from('clients')
      .select('*')
      .order('created_at', {
        ascending: false,
      });

  if (error) {
    console.error(
      'Failed to fetch clients:',
      error,
    );

    throw error;
  }

  return (
    data ?? []
  ).map(mapClient);
}

// ============================================================
// LEADS
// ============================================================

export async function fetchLeads(): Promise<Lead[]> {
  /**
   * If Supabase is not configured,
   * use sample data.
   */
  if (!supabaseConfigured) {
    return Promise.resolve(
      sample.leads,
    );
  }

  /**
   * IMPORTANT:
   *
   * The `leads` table is the actual
   * source for the admin dashboard.
   *
   * We order by created_at so newly
   * submitted contact forms appear first.
   */
  const {
    data,
    error,
  } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    console.error(
      'Failed to fetch leads from Supabase:',
      error,
    );

    throw error;
  }

  console.log(
    'Fetched leads:',
    data,
  );

  return (
    data ?? []
  ).map(mapLead);
}

// ============================================================
// DISCOVERY BOOKINGS
// ============================================================

/**
 * IMPORTANT:
 *
 * The Discovery Calls dashboard uses:
 *
 * public.discovery_bookings
 *
 * Do NOT use discovery_calls here.
 */
export async function fetchDiscoveryCalls(): Promise<
  DiscoveryCall[]
> {
  if (!supabaseConfigured) {
    return Promise.resolve(
      sample.discoveryCalls,
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from('discovery_bookings')
    .select('*')
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    console.error(
      'Failed to fetch discovery bookings:',
      error,
    );

    throw error;
  }

  return (
    data ?? []
  ).map(
    mapDiscoveryBooking,
  );
}

/**
 * Admin creates a new discovery booking.
 */
export async function insertDiscoveryCall(
  payload: {
    client_name: string;
    type: string;
    duration: number;
    date: string;
    status: string;
    payment_status: string;
    notes: string;
    outcome: string;
  },
): Promise<DiscoveryCall> {
  const service =
    getServiceDetails(
      payload.type,
    );

  const parsedDate =
    new Date(payload.date);

  let dateValue: string;
  let timeValue: string;

  if (
    !Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    dateValue =
      parsedDate
        .toISOString()
        .split('T')[0];

    timeValue =
      parsedDate
        .toTimeString()
        .split(' ')[0];
  } else {
    const now =
      new Date();

    dateValue =
      now
        .toISOString()
        .split('T')[0];

    timeValue =
      '09:00:00';
  }

  const bookingStatus =
    normalizeBookingStatus(
      payload.status,
    );

  const paymentStatus =
    normalizePaymentStatus(
      payload.payment_status,
    );

  const insertPayload = {
    service_id:
      service.serviceId,

    service_name:
      service.serviceName,

    service_price:
      service.servicePrice,

    date:
      dateValue,

    time:
      timeValue,

    name:
      payload.client_name.trim(),

    email:
      '',

    phone:
      null,

    company:
      null,

    website:
      null,

    contact_method:
      'Video call',

    budget:
      'Not specified',

    timeline:
      'Not specified',

    goals:
      [],

    notes:
      payload.notes?.trim() ||
      null,

    status:
      bookingStatus,

    payment_status:
      paymentStatus,

    outcome:
      payload.outcome?.trim() ||
      null,
  };

  console.log(
    'Creating discovery booking:',
    insertPayload,
  );

  const {
    data,
    error,
  } = await supabase
    .from(
      'discovery_bookings',
    )
    .insert(
      insertPayload,
    )
    .select('*')
    .single();

  if (error) {
    console.error(
      'Failed to insert discovery booking:',
      error,
    );

    throw error;
  }

  return mapDiscoveryBooking(
    data,
  );
}

/**
 * Update a discovery booking.
 */
export async function updateDiscoveryCall(
  id: string,
  payload: Record<string, unknown>,
): Promise<DiscoveryCall> {
  const updatePayload: Record<
    string,
    unknown
  > = {};

  if ('status' in payload) {
    updatePayload.status =
      normalizeBookingStatus(
        payload.status,
      );
  }

  if ('notes' in payload) {
    updatePayload.notes =
      payload.notes || null;
  }

  if ('outcome' in payload) {
    updatePayload.outcome =
      payload.outcome || null;
  }

  if (
    'payment_status' in
    payload
  ) {
    updatePayload.payment_status =
      normalizePaymentStatus(
        payload.payment_status,
      );
  }

  if (
    Object.keys(
      updatePayload,
    ).length === 0
  ) {
    throw new Error(
      'No valid fields were provided for update.',
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      'discovery_bookings',
    )
    .update(
      updatePayload,
    )
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error(
      'Failed to update discovery booking:',
      error,
    );

    throw error;
  }

  return mapDiscoveryBooking(
    data,
  );
}

export async function deleteDiscoveryCall(
  id: string,
): Promise<void> {
  const {
    error,
  } = await supabase
    .from(
      'discovery_bookings',
    )
    .delete()
    .eq('id', id);

  if (error) {
    console.error(
      'Failed to delete discovery booking:',
      error,
    );

    throw error;
  }
}

// ============================================================
// LEGACY DISCOVERY CALLS
// ============================================================

export async function fetchLegacyDiscoveryCalls(): Promise<
  DiscoveryCall[]
> {
  if (!supabaseConfigured) {
    return Promise.resolve(
      sample.discoveryCalls,
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      'discovery_calls',
    )
    .select('*')
    .order(
      'created_at',
      {
        ascending: false,
      },
    );

  if (error) throw error;

  return (
    data ?? []
  ).map(
    (r) => ({
      id: String(r.id),
      clientName:
        r.client_name ?? '',
      type:
        r.type ??
        'Social Growth Sprint',
      duration:
        Number(r.duration) ||
        30,
      date:
        r.date,
      status:
        r.status,
      paymentStatus:
        r.payment_status,
      notes:
        r.notes ?? '',
      outcome:
        r.outcome ?? '',
    }),
  );
}

// ============================================================
// PROJECTS
// ============================================================

export async function fetchProjects(): Promise<Project[]> {
  if (!supabaseConfigured) {
    return Promise.resolve(
      sample.projects,
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from('projects')
    .select('*')
    .order(
      'created_at',
      {
        ascending: false,
      },
    );

  if (error) throw error;

  return (
    data ?? []
  ).map(mapProject);
}

export async function insertProject(
  payload: {
    name: string;
    client: string;
    service_type: string;
    stage: string;
    progress: number;
    deadline: string;
    team: string[];
    priority: string;
  },
) {
  const {
    data,
    error,
  } = await supabase
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
  const {
    data,
    error,
  } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapProject(data);
}

export async function deleteProject(
  id: string,
) {
  const {
    error,
  } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================
// CONTENT
// ============================================================

export async function fetchContentItems(): Promise<
  ContentItem[]
> {
  if (!supabaseConfigured) {
    return Promise.resolve(
      sample.contentItems,
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      'content_items',
    )
    .select('*')
    .order(
      'created_at',
      {
        ascending: false,
      },
    );

  if (error) throw error;

  return (
    data ?? []
  ).map(
    mapContentItem,
  );
}

export async function insertContentItem(
  payload: {
    platform: string;
    caption: string;
    status: string;
    scheduled_date: string;
    designer: string;
    copywriter: string;
    client: string;
  },
) {
  const {
    data,
    error,
  } = await supabase
    .from(
      'content_items',
    )
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return mapContentItem(
    data,
  );
}

export async function updateContentItem(
  id: string,
  payload: Record<string, unknown>,
) {
  const {
    data,
    error,
  } = await supabase
    .from(
      'content_items',
    )
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapContentItem(
    data,
  );
}

export async function deleteContentItem(
  id: string,
) {
  const {
    error,
  } = await supabase
    .from(
      'content_items',
    )
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================
// PRODUCTS
// ============================================================

export async function fetchProducts(): Promise<
  DigitalProduct[]
> {
  if (!supabaseConfigured) {
    return Promise.resolve(
      sample.digitalProducts,
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      'digital_products',
    )
    .select('*')
    .order(
      'created_at',
      {
        ascending: false,
      },
    );

  if (error) throw error;

  return (
    data ?? []
  ).map(mapProduct);
}

export async function insertProduct(
  payload: {
    name: string;
    category: string;
    price: number;
    sku: string;
    status: string;
    sales: number;
    revenue: number;
    downloads: number;
  },
) {
  const {
    data,
    error,
  } = await supabase
    .from(
      'digital_products',
    )
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
  const {
    data,
    error,
  } = await supabase
    .from(
      'digital_products',
    )
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapProduct(data);
}

export async function deleteProduct(
  id: string,
) {
  const {
    error,
  } = await supabase
    .from(
      'digital_products',
    )
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================
// ORDERS
// ============================================================

export async function fetchOrders(): Promise<Order[]> {
  if (!supabaseConfigured) {
    return Promise.resolve(
      sample.orders,
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from('orders')
    .select('*')
    .order(
      'created_at',
      {
        ascending: false,
      },
    );

  if (error) throw error;

  return (
    data ?? []
  ).map(mapOrder);
}

export async function insertOrder(
  payload: {
    customer: string;
    product: string;
    amount: number;
    payment_method: string;
    status: string;
    download_sent: boolean;
    date: string;
  },
) {
  const {
    data,
    error,
  } = await supabase
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
  const {
    data,
    error,
  } = await supabase
    .from('orders')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapOrder(data);
}

export async function deleteOrder(
  id: string,
) {
  const {
    error,
  } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================
// WEBSITE REQUESTS
// ============================================================

export async function fetchWebsiteRequests(): Promise<
  WebsiteRequest[]
> {
  if (!supabaseConfigured) {
    return Promise.resolve([]);
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      'website_requests',
    )
    .select('*')
    .order(
      'created_at',
      {
        ascending: false,
      },
    );

  if (error) throw error;

  return (
    data ?? []
  ).map(
    mapWebsiteRequest,
  );
}

export async function insertWebsiteRequest(
  payload: {
    business: string;
    business_type: string;
    goals: string;
    pages_requested: string[];
    features_requested: string[];
    budget: string;
    timeline: string;
    proposal_status: string;
    development_status: string;
  },
) {
  const {
    data,
    error,
  } = await supabase
    .from(
      'website_requests',
    )
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return mapWebsiteRequest(
    data,
  );
}

export async function updateWebsiteRequest(
  id: string,
  payload: Record<string, unknown>,
) {
  const {
    data,
    error,
  } = await supabase
    .from(
      'website_requests',
    )
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapWebsiteRequest(
    data,
  );
}

export async function deleteWebsiteRequest(
  id: string,
) {
  const {
    error,
  } = await supabase
    .from(
      'website_requests',
    )
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================
// TEAM
// ============================================================

export async function fetchTeam(): Promise<
  TeamMember[]
> {
  if (!supabaseConfigured) {
    return Promise.resolve([]);
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      'team_members',
    )
    .select('*')
    .order(
      'created_at',
      {
        ascending: false,
      },
    );

  if (error) throw error;

  return (
    data ?? []
  ).map(
    mapTeamMember,
  );
}

export async function insertTeamMember(
  payload: {
    name: string;
    role: string;
    email: string;
    active_projects: number;
    tasks_assigned: number;
    tasks_completed: number;
    availability: string;
    utilization: number;
  },
) {
  const {
    data,
    error,
  } = await supabase
    .from(
      'team_members',
    )
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
  const {
    data,
    error,
  } = await supabase
    .from(
      'team_members',
    )
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapTeamMember(data);
}

export async function deleteTeamMember(
  id: string,
) {
  const {
    error,
  } = await supabase
    .from(
      'team_members',
    )
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================
// INVOICES
// ============================================================

export async function fetchInvoices(): Promise<
  Invoice[]
> {
  if (!supabaseConfigured) {
    return Promise.resolve([]);
  }

  const {
    data,
    error,
  } = await supabase
    .from('invoices')
    .select('*')
    .order(
      'created_at',
      {
        ascending: false,
      },
    );

  if (error) throw error;

  return (
    data ?? []
  ).map(mapInvoice);
}

export async function insertInvoice(
  payload: {
    client: string;
    amount: number;
    status: string;
    due_date: string;
    issued_date: string;
    service: string;
  },
) {
  const {
    data,
    error,
  } = await supabase
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
  const {
    data,
    error,
  } = await supabase
    .from('invoices')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapInvoice(data);
}

export async function deleteInvoice(
  id: string,
) {
  const {
    error,
  } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) throw error;
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

export async function fetchActivities(): Promise<
  Activity[]
> {
  if (!supabaseConfigured) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from('activities')
    .select('*')
    .order(
      'created_at',
      {
        ascending: false,
      },
    );

  if (error) throw error;

  return (
    data ?? []
  ) as Activity[];
}

export async function fetchNotifications(): Promise<
  Notification[]
> {
  if (!supabaseConfigured) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from('notifications')
    .select('*')
    .order(
      'created_at',
      {
        ascending: false,
      },
    );

  if (error) throw error;

  return (
    data ?? []
  ) as Notification[];
}

export async function fetchMonthlyRevenue(): Promise<
  MonthlyRevenue[]
> {
  if (!supabaseConfigured) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from('monthly_revenue')
    .select(
      'month, revenue, expenses, profit',
    )
    .order('id');

  if (error) throw error;

  return (
    data ?? []
  ) as MonthlyRevenue[];
}

export async function fetchProductSales(): Promise<
  ProductSale[]
> {
  if (!supabaseConfigured) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from('product_sales')
    .select(
      'month, sales, revenue',
    )
    .order('id');

  if (error) throw error;

  return (
    data ?? []
  ) as ProductSale[];
}

export async function fetchCallBookings(): Promise<
  CallBooking[]
> {
  if (!supabaseConfigured) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from('call_bookings')
    .select(
      'week, calls',
    )
    .order('id');

  if (error) throw error;

  return (
    data ?? []
  ) as CallBooking[];
}

// ============================================================
// CLIENT MUTATIONS
// ============================================================

export async function insertClient(
  payload: {
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
  },
) {
  const {
    data,
    error,
  } = await supabase
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
  const {
    data,
    error,
  } = await supabase
    .from('clients')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapClient(data);
}

export async function deleteClient(
  id: string,
) {
  const {
    error,
  } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================
// LEAD MUTATIONS
// ============================================================

export async function insertLead(
  payload: {
    name: string;
    email: string;
    business: string;
    budget_range: string;
    interested_service: string;
    message: string;
    source: string;
    status?: string;
  },
): Promise<Lead> {
  /**
   * Make sure the database always receives
   * a valid dashboard status.
   */
  const insertPayload = {
    name:
      payload.name.trim(),

    email:
      payload.email.trim(),

    business:
      payload.business.trim(),

    budget_range:
      payload.budget_range?.trim() ||
      'Not specified',

    interested_service:
      payload.interested_service?.trim() ||
      'Not specified',

    message:
      payload.message?.trim() ||
      '',

    source:
      payload.source?.trim() ||
      'Website',

    status:
      normalizeLeadStatus(
        payload.status ??
          'New',
      ),
  };

  console.log(
    'Creating lead:',
    insertPayload,
  );

  const {
    data,
    error,
  } = await supabase
    .from('leads')
    .insert(
      insertPayload,
    )
    .select('*')
    .single();

  if (error) {
    console.error(
      'Failed to insert lead:',
      error,
    );

    throw error;
  }

  console.log(
    'Lead created:',
    data,
  );

  return mapLead(data);
}

export async function updateLead(
  id: string,
  payload: Record<string, unknown>,
): Promise<Lead> {
  const updatePayload: Record<
    string,
    unknown
  > = {};

  if ('name' in payload) {
    updatePayload.name =
      safeString(
        payload.name,
      ).trim();
  }

  if ('email' in payload) {
    updatePayload.email =
      safeString(
        payload.email,
      ).trim();
  }

  if ('business' in payload) {
    updatePayload.business =
      safeString(
        payload.business,
      ).trim();
  }

  if (
    'budget_range' in
    payload
  ) {
    updatePayload.budget_range =
      safeString(
        payload.budget_range,
      ).trim();
  }

  if (
    'interested_service' in
    payload
  ) {
    updatePayload.interested_service =
      safeString(
        payload.interested_service,
      ).trim();
  }

  if ('message' in payload) {
    updatePayload.message =
      safeString(
        payload.message,
      ).trim();
  }

  if ('source' in payload) {
    updatePayload.source =
      safeString(
        payload.source,
      ).trim();
  }

  if ('status' in payload) {
    updatePayload.status =
      normalizeLeadStatus(
        payload.status,
      );
  }

  if (
    Object.keys(
      updatePayload,
    ).length === 0
  ) {
    throw new Error(
      'No valid lead fields were provided for update.',
    );
  }

  console.log(
    'Updating lead:',
    id,
    updatePayload,
  );

  const {
    data,
    error,
  } = await supabase
    .from('leads')
    .update(
      updatePayload,
    )
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error(
      'Failed to update lead:',
      error,
    );

    throw error;
  }

  return mapLead(data);
}

export async function deleteLead(
  id: string,
): Promise<void> {
  const {
    error,
  } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(
      'Failed to delete lead:',
      error,
    );

    throw error;
  }
}