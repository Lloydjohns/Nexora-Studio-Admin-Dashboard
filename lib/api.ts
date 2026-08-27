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

/* ============================================================
   HELPERS
============================================================ */

function isValidDate(
  value: unknown,
): value is string {
  if (
    !value ||
    typeof value !== 'string'
  ) {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(
    date.getTime(),
  );
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

function normalizeStringArray(
  value: unknown,
): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        safeString(item).trim(),
      )
      .filter(Boolean);
  }

  return [];
}

/* ============================================================
   BOOKING DATE HELPERS
============================================================ */

function combineBookingDateTime(
  dateValue: unknown,
  timeValue: unknown,
): string {
  if (!dateValue) {
    return new Date().toISOString();
  }

  const date =
    String(dateValue).trim();

  if (!timeValue) {
    return isValidDate(date)
      ? new Date(
          date,
        ).toISOString()
      : date;
  }

  const time =
    String(timeValue).trim();

  const combined =
    `${date} ${time}`;

  const parsed =
    new Date(combined);

  if (
    !Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return parsed.toISOString();
  }

  const fallback =
    new Date(
      `${date}T${time}`,
    );

  if (
    !Number.isNaN(
      fallback.getTime(),
    )
  ) {
    return fallback.toISOString();
  }

  return combined;
}

/* ============================================================
   DISCOVERY BOOKING HELPERS
============================================================ */

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
  const value =
    String(
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

  if (
    Number(
      servicePrice ?? 0,
    ) === 0
  ) {
    return 'Free';
  }

  return 'Pending';
}

function getBookingDuration(
  row: any,
): number {
  if (
    row?.duration !== null &&
    row?.duration !== undefined &&
    row?.duration !== ''
  ) {
    const duration =
      Number(row.duration);

    if (
      !Number.isNaN(duration)
    ) {
      return duration;
    }
  }

  switch (
    row?.service_id
  ) {
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
        serviceId:
          'brand-clarity',
        serviceName:
          'Brand Clarity Session',
        servicePrice: 500,
        duration: 45,
      };

    case 'Website Roadmap Call':
      return {
        serviceId:
          'website-roadmap',
        serviceName:
          'Website Roadmap Call',
        servicePrice: 800,
        duration: 60,
      };

    case 'Social Growth Sprint':
    default:
      return {
        serviceId:
          'social-growth',
        serviceName:
          'Social Growth Sprint',
        servicePrice: 300,
        duration: 30,
      };
  }
}

/* ============================================================
   LEAD HELPERS
============================================================ */

function mapLeadStatus(
  status: unknown,
): Lead['status'] {
  const value =
    String(
      status ?? 'New',
    )
      .trim()
      .toLowerCase()
      .replace(
        /[_-]+/g,
        ' ',
      );

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

function normalizeLeadStatus(
  status: unknown,
): string {
  const value =
    String(
      status ?? 'New',
    )
      .trim()
      .toLowerCase()
      .replace(
        /[_-]+/g,
        ' ',
      );

  switch (value) {
    case 'contacted':
      return 'contacted';

    case 'discovery scheduled':
    case 'discovery call':
    case 'discovery':
      return 'discovery_scheduled';

    case 'proposal sent':
    case 'proposal':
      return 'proposal_sent';

    case 'won':
    case 'converted':
      return 'won';

    case 'lost':
      return 'lost';

    case 'new':
    default:
      return 'new';
  }
}

function splitLeadName(
  name: string,
): {
  first_name: string;
  last_name: string;
} {
  const cleanName =
    name.trim();

  if (!cleanName) {
    return {
      first_name: '',
      last_name: '',
    };
  }

  const parts =
    cleanName.split(
      /\s+/,
    );

  if (
    parts.length === 1
  ) {
    return {
      first_name:
        parts[0],
      last_name: '',
    };
  }

  return {
    first_name:
      parts[0],
    last_name:
      parts
        .slice(1)
        .join(' '),
  };
}

/* ============================================================
   ROW MAPPERS
============================================================ */

function mapClient(
  row: any,
): Client {
  return {
    id: safeString(
      row.id,
    ),
    name: safeString(
      row.name,
    ),
    company: safeString(
      row.company,
    ),
    email: safeString(
      row.email,
    ),
    phone: safeString(
      row.phone,
    ),
    servicePackage:
      safeString(
        row.service_package,
      ),
    status:
      row.status,
    monthlyRetainer:
      Number(
        row.monthly_retainer ??
          0,
      ),
    accountManager:
      safeString(
        row.account_manager,
      ),
    nextMeeting:
      safeString(
        row.next_meeting,
      ),
    lastActivity:
      safeString(
        row.last_activity,
      ),
    industry:
      safeString(
        row.industry,
      ),
    startDate:
      safeString(
        row.start_date,
      ),
    socials:
      Array.isArray(
        row.socials,
      )
        ? row.socials
        : [],
    brandColors:
      Array.isArray(
        row.brand_colors,
      )
        ? row.brand_colors
        : [],
  };
}

function mapLead(
  row: any,
): Lead {
  const firstName =
    safeString(
      row.first_name,
    );

  const lastName =
    safeString(
      row.last_name,
    );

  const fullName =
    `${firstName} ${lastName}`
      .trim();

  const rawDate =
    row.created_at ??
    row.date ??
    row.createdAt ??
    new Date().toISOString();

  return {
    id: safeString(
      row.id,
    ),

    name:
      fullName ||
      safeString(
        row.name,
        'Unknown',
      ),

    email:
      safeString(
        row.email,
      ),

    business:
      safeString(
        row.brand ??
          row.business ??
          row.company,
        'Not specified',
      ),

    budgetRange:
      safeString(
        row.budget ??
          row.budget_range ??
          row.budgetRange,
        'Not specified',
      ),

    interestedService:
      safeString(
        row.service ??
          row.interested_service ??
          row.service_name ??
          row.interestedService,
        'Not specified',
      ),

    message:
      safeString(
        row.message ??
          row.goals ??
          row.notes,
      ),

    source:
      safeString(
        row.source,
        'Website',
      ),

    date:
      safeString(
        rawDate,
      ),

    status:
      mapLeadStatus(
        row.status,
      ),
  };
}

/* ============================================================
   PROJECT MAPPER
============================================================ */

function mapProject(
  row: any,
): Project {
  return {
    id: safeString(
      row.id,
    ),

    name: safeString(
      row.name,
    ),

    client: safeString(
      row.client,
    ),

    client_id:
      row.client_id !== null &&
      row.client_id !== undefined &&
      row.client_id !== ''
        ? String(
            row.client_id,
          )
        : null,

    serviceType:
      safeString(
        row.service_type,
      ),

    stage:
      row.stage,

    progress:
      Number(
        row.progress ?? 0,
      ),

    deadline:
      safeString(
        row.deadline,
      ),

    team:
      normalizeStringArray(
        row.team,
      ),

    priority:
      row.priority,
  } as Project;
}

function mapContentItem(
  row: any,
): ContentItem {
  return {
    id: row.id,
    platform:
      row.platform,
    caption:
      row.caption,
    status:
      row.status,
    scheduledDate:
      row.scheduled_date,
    designer:
      row.designer,
    copywriter:
      row.copywriter,
    client:
      row.client,
    reach:
      row.reach ??
      undefined,
    engagement:
      row.engagement ??
      undefined,
    saves:
      row.saves ??
      undefined,
    shares:
      row.shares ??
      undefined,
  };
}

function mapProduct(
  row: any,
): DigitalProduct {
  return {
    id: row.id,
    name: row.name,
    category:
      row.category,
    price:
      row.price,
    sku:
      row.sku,
    status:
      row.status,
    sales:
      row.sales,
    revenue:
      row.revenue,
    downloads:
      row.downloads,
    lastUpdated:
      row.last_updated,
  };
}

function mapOrder(
  row: any,
): Order {
  return {
    id: row.id,
    customer:
      row.customer,
    product:
      row.product,
    amount:
      row.amount,
    paymentMethod:
      row.payment_method,
    status:
      row.status,
    downloadSent:
      row.download_sent,
    date:
      row.date,
  };
}

function mapWebsiteRequest(
  row: any,
): WebsiteRequest {
  return {
    id: row.id,
    business:
      row.business,
    businessType:
      row.business_type,
    goals:
      row.goals ?? '',
    pagesRequested:
      row.pages_requested ??
      [],
    featuresRequested:
      row.features_requested ??
      [],
    budget:
      row.budget,
    timeline:
      row.timeline,
    proposalStatus:
      row.proposal_status,
    developmentStatus:
      row.development_status,
    date:
      row.date,
  };
}

function mapTeamMember(
  row: any,
): TeamMember {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    avatar:
      row.avatar,
    email:
      row.email,
    activeProjects:
      row.active_projects,
    tasksAssigned:
      row.tasks_assigned,
    tasksCompleted:
      row.tasks_completed,
    availability:
      row.availability,
    utilization:
      row.utilization,
  };
}

function mapInvoice(
  row: any,
): Invoice {
  return {
    id: row.id,
    client:
      row.client,
    amount:
      Number(
        row.amount ?? 0,
      ),
    status:
      row.status,
    dueDate:
      row.due_date,
    issuedDate:
      row.issued_date,
    service:
      row.service,
  };
}

/* ============================================================
   CLIENTS - FETCH
============================================================ */

export async function fetchClients(): Promise<Client[]> {
  if (!supabaseConfigured) {
    return Promise.resolve(
      sample.clients,
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from('clients')
    .select('*')
    .order(
      'created_at',
      {
        ascending: false,
      },
    );

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

/* ============================================================
   LEADS - FETCH
============================================================ */

export async function fetchLeads(): Promise<Lead[]> {
  if (!supabaseConfigured) {
    return Promise.resolve(
      sample.leads,
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      'contact_submissions',
    )
    .select(
      `
        id,
        first_name,
        last_name,
        email,
        brand,
        service,
        budget,
        message,
        status,
        created_at
      `,
    )
    .order(
      'created_at',
      {
        ascending: false,
      },
    );

  if (error) {
    console.error(
      'Failed to fetch leads:',
      error,
    );

    throw error;
  }

  return (
    data ?? []
  ).map(mapLead);
}

/* ============================================================
   DISCOVERY BOOKINGS
============================================================ */

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
    .from(
      'discovery_bookings',
    )
    .select('*')
    .order(
      'created_at',
      {
        ascending: false,
      },
    );

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

function mapDiscoveryBooking(
  row: any,
): DiscoveryCall {
  const combinedDate =
    combineBookingDateTime(
      row.date,
      row.time,
    );

  return {
    id: String(
      row.id,
    ),

    clientName:
      row.name ?? '',

    type:
      row.service_name ??
      'Social Growth Sprint',

    duration:
      getBookingDuration(
        row,
      ),

    date:
      combinedDate,

    status:
      mapBookingStatus(
        row.status,
      ) as any,

    paymentStatus:
      mapPaymentStatus(
        row.payment_status,
        row.service_price,
      ) as any,

    notes:
      row.notes ?? '',

    outcome:
      row.outcome ?? '',
  };
}

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
    new Date(
      payload.date,
    );

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

    email: '',

    phone: null,

    company: null,

    website: null,

    contact_method:
      'Video call',

    budget:
      'Not specified',

    timeline:
      'Not specified',

    goals: [],

    notes:
      payload.notes?.trim() ||
      null,

    status:
      normalizeBookingStatus(
        payload.status,
      ),

    payment_status:
      normalizePaymentStatus(
        payload.payment_status,
      ),

    outcome:
      payload.outcome?.trim() ||
      null,
  };

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
    throw error;
  }

  return mapDiscoveryBooking(
    data,
  );
}

export async function updateDiscoveryCall(
  id: string,
  payload: Record<string, unknown>,
): Promise<DiscoveryCall> {
  const updatePayload: Record<
    string,
    unknown
  > = {};

  if (
    'status' in
    payload
  ) {
    updatePayload.status =
      normalizeBookingStatus(
        payload.status,
      );
  }

  if (
    'notes' in
    payload
  ) {
    updatePayload.notes =
      payload.notes ||
      null;
  }

  if (
    'outcome' in
    payload
  ) {
    updatePayload.outcome =
      payload.outcome ||
      null;
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
    .eq(
      'id',
      id,
    )
    .select('*')
    .single();

  if (error) {
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
    .eq(
      'id',
      id,
    );

  if (error) {
    throw error;
  }
}

/* ============================================================
   LEGACY DISCOVERY CALLS
============================================================ */

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

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ).map(
    (row) => ({
      id: String(
        row.id,
      ),
      clientName:
        row.client_name ??
        '',
      type:
        row.type ??
        'Social Growth Sprint',
      duration:
        Number(
          row.duration,
        ) || 30,
      date:
        row.date,
      status:
        row.status,
      paymentStatus:
        row.payment_status,
      notes:
        row.notes ??
        '',
      outcome:
        row.outcome ??
        '',
    }),
  );
}

/* ============================================================
   PROJECTS - FETCH
============================================================ */

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

  if (error) {
    console.error(
      'Failed to fetch projects:',
      error,
    );

    throw error;
  }

  return (
    data ?? []
  ).map(mapProject);
}

/* ============================================================
   PROJECTS - INSERT
============================================================ */

export async function insertProject(
  payload: {
    name: string;
    client: string;
    client_id?: string | null;
    service_type: string;
    stage: string;
    progress: number;
    deadline: string;
    team: string[];
    priority: string;
  },
): Promise<Project> {
  if (!supabaseConfigured) {
    throw new Error(
      'Supabase is not configured.',
    );
  }

  /*
   * Get all project IDs so we can
   * safely determine the next P-###.
   */
  const {
    data: existingProjects,
    error:
      existingProjectsError,
  } = await supabase
    .from('projects')
    .select('id');

  if (existingProjectsError) {
    console.error(
      'Failed to read existing project IDs:',
      existingProjectsError,
    );

    throw existingProjectsError;
  }

  let maxNumber = 0;

  for (
    const row of
      existingProjects ?? []
  ) {
    const match =
      String(
        row.id,
      ).match(
        /^P-(\d+)$/,
      );

    if (match) {
      maxNumber =
        Math.max(
          maxNumber,
          Number(
            match[1],
          ),
        );
    }
  }

  const projectId =
    `P-${String(
      maxNumber + 1,
    ).padStart(
      3,
      '0',
    )}`;

  /*
   * This is the real client relationship.
   */
  const clientId =
    payload.client_id
      ? String(
          payload.client_id,
        )
      : null;

  const insertPayload = {
    id:
      projectId,

    name:
      payload.name.trim(),

    /*
     * Existing company field.
     */
    client:
      payload.client.trim(),

    /*
     * Foreign key:
     * projects.client_id -> clients.id
     */
    client_id:
      clientId,

    service_type:
      payload.service_type,

    stage:
      payload.stage,

    progress:
      Number(
        payload.progress ?? 0,
      ),

    deadline:
      payload.deadline,

    team:
      normalizeStringArray(
        payload.team,
      ),

    priority:
      payload.priority,
  };

  console.log(
    'INSERT PROJECT PAYLOAD:',
    insertPayload,
  );

  /*
   * Optional auth debug.
   * This does NOT alter the request.
   */
  try {
    const {
      data: {
        session,
      },
    } =
      await supabase.auth.getSession();

    console.log(
      'PROJECT AUTH DEBUG:',
      {
        userId:
          session?.user?.id ??
          null,
        email:
          session?.user?.email ??
          null,
        hasSession:
          Boolean(session),
        role:
          session
            ? 'authenticated'
            : 'anon',
      },
    );
  } catch (authError) {
    console.warn(
      'Could not inspect Supabase auth session:',
      authError,
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from('projects')
    .insert(
      insertPayload,
    )
    .select('*')
    .single();

  if (error) {
    console.error(
      'Failed to insert project:',
      {
        message:
          error.message,
        details:
          error.details,
        hint:
          error.hint,
        code:
          error.code,
      },
    );

    throw error;
  }

  console.log(
    'PROJECT CREATED:',
    data,
  );

  return mapProject(
    data,
  );
}

/* ============================================================
   PROJECTS - UPDATE
============================================================ */

export async function updateProject(
  id: string,
  payload: Record<string, unknown>,
): Promise<Project> {
  if (!id) {
    throw new Error(
      'Project ID is missing.',
    );
  }

  const updatePayload: Record<
    string,
    unknown
  > = {};

  if (
    'name' in
    payload
  ) {
    updatePayload.name =
      safeString(
        payload.name,
      ).trim();
  }

  if (
    'client' in
    payload
  ) {
    updatePayload.client =
      safeString(
        payload.client,
      ).trim();
  }

  if (
    'client_id' in
    payload
  ) {
    updatePayload.client_id =
      payload.client_id
        ? String(
            payload.client_id,
          )
        : null;
  }

  if (
    'service_type' in
    payload
  ) {
    updatePayload.service_type =
      payload.service_type;
  }

  if (
    'stage' in
    payload
  ) {
    updatePayload.stage =
      payload.stage;
  }

  if (
    'progress' in
    payload
  ) {
    updatePayload.progress =
      Number(
        payload.progress ?? 0,
      );
  }

  if (
    'deadline' in
    payload
  ) {
    updatePayload.deadline =
      payload.deadline;
  }

  if (
    'team' in
    payload
  ) {
    updatePayload.team =
      normalizeStringArray(
        payload.team,
      );
  }

  if (
    'priority' in
    payload
  ) {
    updatePayload.priority =
      payload.priority;
  }

  if (
    Object.keys(
      updatePayload,
    ).length === 0
  ) {
    throw new Error(
      'No project fields were provided for update.',
    );
  }

  console.log(
    'UPDATE PROJECT:',
    id,
    updatePayload,
  );

  const {
    data,
    error,
  } = await supabase
    .from('projects')
    .update(
      updatePayload,
    )
    .eq(
      'id',
      id,
    )
    .select('*')
    .single();

  if (error) {
    console.error(
      'Failed to update project:',
      {
        message:
          error.message,
        details:
          error.details,
        hint:
          error.hint,
        code:
          error.code,
      },
    );

    throw error;
  }

  return mapProject(
    data,
  );
}

/* ============================================================
   PROJECTS - DELETE
============================================================ */

export async function deleteProject(
  id: string,
): Promise<void> {
  if (!id) {
    throw new Error(
      'Project ID is missing.',
    );
  }

  const {
    error,
  } = await supabase
    .from('projects')
    .delete()
    .eq(
      'id',
      id,
    );

  if (error) {
    console.error(
      'Failed to delete project:',
      {
        message:
          error.message,
        details:
          error.details,
        hint:
          error.hint,
        code:
          error.code,
      },
    );

    throw error;
  }
}

/* ============================================================
   CONTENT
============================================================ */

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

  if (error) {
    throw error;
  }

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

  if (error) {
    throw error;
  }

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
    .eq(
      'id',
      id,
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

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
    .eq(
      'id',
      id,
    );

  if (error) {
    throw error;
  }
}

/* ============================================================
   PRODUCTS
============================================================ */

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

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ).map(
    mapProduct,
  );
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

  if (error) {
    throw error;
  }

  return mapProduct(
    data,
  );
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
    .eq(
      'id',
      id,
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapProduct(
    data,
  );
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
    .eq(
      'id',
      id,
    );

  if (error) {
    throw error;
  }
}

/* ============================================================
   ORDERS
============================================================ */

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

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ).map(
    mapOrder,
  );
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

  if (error) {
    throw error;
  }

  return mapOrder(
    data,
  );
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
    .eq(
      'id',
      id,
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapOrder(
    data,
  );
}

export async function deleteOrder(
  id: string,
) {
  const {
    error,
  } = await supabase
    .from('orders')
    .delete()
    .eq(
      'id',
      id,
    );

  if (error) {
    throw error;
  }
}

/* ============================================================
   WEBSITE REQUESTS
============================================================ */

export async function fetchWebsiteRequests(): Promise<
  WebsiteRequest[]
> {
  if (!supabaseConfigured) {
    return Promise.resolve(
      [],
    );
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

  if (error) {
    throw error;
  }

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

  if (error) {
    throw error;
  }

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
    .eq(
      'id',
      id,
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

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
    .eq(
      'id',
      id,
    );

  if (error) {
    throw error;
  }
}

/* ============================================================
   TEAM
============================================================ */

export async function fetchTeam(): Promise<
  TeamMember[]
> {
  if (!supabaseConfigured) {
    return Promise.resolve(
      [],
    );
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

  if (error) {
    throw error;
  }

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

  if (error) {
    throw error;
  }

  return mapTeamMember(
    data,
  );
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
    .eq(
      'id',
      id,
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapTeamMember(
    data,
  );
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
    .eq(
      'id',
      id,
    );

  if (error) {
    throw error;
  }
}

/* ============================================================
   INVOICES
============================================================ */

export async function fetchInvoices(): Promise<
  Invoice[]
> {
  if (!supabaseConfigured) {
    return Promise.resolve(
      [],
    );
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

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ).map(
    mapInvoice,
  );
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

  if (error) {
    throw error;
  }

  return mapInvoice(
    data,
  );
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
    .eq(
      'id',
      id,
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapInvoice(
    data,
  );
}

export async function deleteInvoice(
  id: string,
) {
  const {
    error,
  } = await supabase
    .from('invoices')
    .delete()
    .eq(
      'id',
      id,
    );

  if (error) {
    throw error;
  }
}

/* ============================================================
   ACTIVITY / NOTIFICATIONS / ANALYTICS
============================================================ */

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
    .from(
      'activities',
    )
    .select('*')
    .order(
      'created_at',
      {
        ascending: false,
      },
    );

  if (error) {
    throw error;
  }

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
    .from(
      'notifications',
    )
    .select('*')
    .order(
      'created_at',
      {
        ascending: false,
      },
    );

  if (error) {
    throw error;
  }

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
    .from(
      'monthly_revenue',
    )
    .select(
      'month, revenue, expenses, profit',
    )
    .order('id');

  if (error) {
    throw error;
  }

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
    .from(
      'product_sales',
    )
    .select(
      'month, sales, revenue',
    )
    .order('id');

  if (error) {
    throw error;
  }

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
    .from(
      'call_bookings',
    )
    .select(
      'week, calls',
    )
    .order('id');

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ) as CallBooking[];
}

/* ============================================================
   CLIENT MUTATIONS
============================================================ */

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
): Promise<Client> {
  if (!supabaseConfigured) {
    throw new Error(
      'Supabase is not configured.',
    );
  }

  const {
    data: existingClients,
    error:
      existingClientsError,
  } = await supabase
    .from('clients')
    .select('id');

  if (existingClientsError) {
    console.error(
      'Failed to read existing client IDs:',
      existingClientsError,
    );

    throw existingClientsError;
  }

  let maxNumber = 0;

  for (
    const row of
      existingClients ?? []
  ) {
    const match =
      String(
        row.id,
      ).match(
        /^C-(\d+)$/,
      );

    if (match) {
      maxNumber =
        Math.max(
          maxNumber,
          Number(
            match[1],
          ),
        );
    }
  }

  const clientId =
    `C-${String(
      maxNumber + 1,
    ).padStart(
      3,
      '0',
    )}`;

  const insertPayload = {
    id:
      clientId,

    name:
      payload.name.trim(),

    company:
      payload.company.trim(),

    email:
      payload.email.trim(),

    phone:
      payload.phone.trim(),

    service_package:
      payload.service_package,

    status:
      payload.status,

    monthly_retainer:
      Number(
        payload.monthly_retainer ??
          0,
      ),

    account_manager:
      payload.account_manager.trim(),

    industry:
      payload.industry.trim(),

    start_date:
      payload.start_date,
  };

  console.log(
    'INSERT CLIENT PAYLOAD:',
    insertPayload,
  );

  const {
    data,
    error,
  } = await supabase
    .from('clients')
    .insert(
      insertPayload,
    )
    .select('*')
    .single();

  if (error) {
    console.error(
      'Failed to insert client:',
      error,
    );

    throw error;
  }

  return mapClient(
    data,
  );
}

export async function updateClient(
  id: string,
  payload: Record<string, unknown>,
): Promise<Client> {
  if (!id) {
    throw new Error(
      'Client ID is missing.',
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from('clients')
    .update(payload)
    .eq(
      'id',
      id,
    )
    .select('*')
    .single();

  if (error) {
    console.error(
      'Failed to update client:',
      error,
    );

    throw error;
  }

  return mapClient(
    data,
  );
}

export async function deleteClient(
  id: string,
): Promise<void> {
  if (!id) {
    throw new Error(
      'Client ID is missing.',
    );
  }

  const {
    error,
  } = await supabase
    .from('clients')
    .delete()
    .eq(
      'id',
      id,
    );

  if (error) {
    console.error(
      'Failed to delete client:',
      error,
    );

    throw error;
  }
}

/* ============================================================
   LEAD MUTATIONS
============================================================ */

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
  const {
    first_name,
    last_name,
  } = splitLeadName(
    payload.name,
  );

  const insertPayload = {
    first_name,

    last_name,

    email:
      payload.email.trim(),

    brand:
      payload.business.trim(),

    service:
      payload.interested_service?.trim() ||
      'Not specified',

    budget:
      payload.budget_range?.trim() ||
      'Not specified',

    message:
      payload.message?.trim() ||
      '',

    status:
      normalizeLeadStatus(
        payload.status ??
          'New',
      ),
  };

  const {
    data,
    error,
  } = await supabase
    .from(
      'contact_submissions',
    )
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

  return mapLead(
    data,
  );
}

export async function updateLead(
  id: string,
  payload: Record<string, unknown>,
): Promise<Lead> {
  const updatePayload: Record<
    string,
    unknown
  > = {};

  if (
    'name' in
    payload
  ) {
    const {
      first_name,
      last_name,
    } = splitLeadName(
      safeString(
        payload.name,
      ),
    );

    updatePayload.first_name =
      first_name;

    updatePayload.last_name =
      last_name;
  }

  if (
    'email' in
    payload
  ) {
    updatePayload.email =
      safeString(
        payload.email,
      ).trim();
  }

  if (
    'business' in
    payload
  ) {
    updatePayload.brand =
      safeString(
        payload.business,
      ).trim();
  }

  if (
    'budget_range' in
    payload
  ) {
    updatePayload.budget =
      safeString(
        payload.budget_range,
      ).trim();
  }

  if (
    'interested_service' in
    payload
  ) {
    updatePayload.service =
      safeString(
        payload.interested_service,
      ).trim();
  }

  if (
    'message' in
    payload
  ) {
    updatePayload.message =
      safeString(
        payload.message,
      ).trim();
  }

  if (
    'status' in
    payload
  ) {
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

  const {
    data,
    error,
  } = await supabase
    .from(
      'contact_submissions',
    )
    .update(
      updatePayload,
    )
    .eq(
      'id',
      id,
    )
    .select('*')
    .single();

  if (error) {
    console.error(
      'Failed to update lead:',
      error,
    );

    throw error;
  }

  return mapLead(
    data,
  );
}

export async function deleteLead(
  id: string,
): Promise<void> {
  const {
    error,
  } = await supabase
    .from(
      'contact_submissions',
    )
    .delete()
    .eq(
      'id',
      id,
    );

  if (error) {
    console.error(
      'Failed to delete lead:',
      error,
    );

    throw error;
  }
}