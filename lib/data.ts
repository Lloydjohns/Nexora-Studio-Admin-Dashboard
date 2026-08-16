export const agency = {
  name: 'Nexora Studio',
  tagline: 'Digital Agency & Creative Studio',
  location: 'Manila, Philippines',
  email: 'hello@nexorastudio.ph',
  phone: '+63 917 555 0142',
};

export type ClientStatus = 'Active' | 'Onboarding' | 'Paused' | 'Churned';

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  servicePackage: string;
  status: ClientStatus;
  monthlyRetainer: number;
  accountManager: string;
  nextMeeting: string;
  lastActivity: string;
  industry: string;
  startDate: string;
  socials: { platform: string; handle: string }[];
  brandColors: string[];
}

export const clients: Client[] = [
  {
    id: 'C-001',
    name: 'Maya Santos',
    company: 'Bloom Skincare',
    email: 'maya@bloomskincare.ph',
    phone: '+63 917 123 4567',
    servicePackage: 'Social Growth Pro',
    status: 'Active',
    monthlyRetainer: 28000,
    accountManager: 'Andrea Lim',
    nextMeeting: '2026-08-09T10:00:00',
    lastActivity: '2 hours ago',
    industry: 'Beauty & Wellness',
    startDate: '2025-03-12',
    socials: [
      { platform: 'Instagram', handle: '@bloomskincare' },
      { platform: 'TikTok', handle: '@bloomskincare' },
    ],
    brandColors: ['#F5D5C5', '#6B8E7F', '#F9F5F0'],
  },
  {
    id: 'C-002',
    name: 'James Cruz',
    company: 'Urban Grind Coffee',
    email: 'james@urbangrind.ph',
    phone: '+63 918 234 5678',
    servicePackage: 'Social Starter',
    status: 'Active',
    monthlyRetainer: 15000,
    accountManager: 'Jen Reyes',
    nextMeeting: '2026-08-08T14:00:00',
    lastActivity: '1 day ago',
    industry: 'Food & Beverage',
    startDate: '2025-01-05',
    socials: [{ platform: 'Instagram', handle: '@urbangrindph' }],
    brandColors: ['#3D2B1F', '#C4A484', '#1A1A1A'],
  },
  {
    id: 'C-003',
    name: 'Sarah Villanueva',
    company: 'Vellamore Interiors',
    email: 'sarah@vellamore.com',
    phone: '+63 919 345 6789',
    servicePackage: 'Web + Social Pro',
    status: 'Active',
    monthlyRetainer: 42000,
    accountManager: 'Mike Tan',
    nextMeeting: '2026-08-10T09:00:00',
    lastActivity: '3 hours ago',
    industry: 'Interior Design',
    startDate: '2024-11-20',
    socials: [
      { platform: 'Instagram', handle: '@vellamore.interiors' },
      { platform: 'Facebook', handle: 'Vellamore Interiors' },
    ],
    brandColors: ['#D4C5B9', '#2C2C2C', '#E8E2DA'],
  },
  {
    id: 'C-004',
    name: 'Rafael Dela Cruz',
    company: 'FitForge Gym',
    email: 'raf@fitforge.ph',
    phone: '+63 920 456 7890',
    servicePackage: 'Social Growth Pro',
    status: 'Active',
    monthlyRetainer: 28000,
    accountManager: 'Andrea Lim',
    nextMeeting: '2026-08-12T11:00:00',
    lastActivity: '5 hours ago',
    industry: 'Fitness',
    startDate: '2025-05-01',
    socials: [
      { platform: 'Instagram', handle: '@fitforgeph' },
      { platform: 'TikTok', handle: '@fitforgeph' },
    ],
    brandColors: ['#1B1B1B', '#D4AF37', '#FF4500'],
  },
  {
    id: 'C-005',
    name: 'Liza Ong',
    company: 'Paper & Co. Stationery',
    email: 'liza@paperandco.ph',
    phone: '+63 921 567 8901',
    servicePackage: 'Social Starter',
    status: 'Paused',
    monthlyRetainer: 15000,
    accountManager: 'Jen Reyes',
    nextMeeting: '—',
    lastActivity: '1 week ago',
    industry: 'Retail',
    startDate: '2025-02-14',
    socials: [{ platform: 'Instagram', handle: '@paperandco.ph' }],
    brandColors: ['#F0E6D2', '#A67B5B', '#FFF8F0'],
  },
  {
    id: 'C-006',
    name: 'Carlos Mendoza',
    company: 'Mendoza Law Firm',
    email: 'carlos@mendozalaw.ph',
    phone: '+63 922 678 9012',
    servicePackage: 'Web + Systems',
    status: 'Active',
    monthlyRetainer: 35000,
    accountManager: 'Mike Tan',
    nextMeeting: '2026-08-15T13:00:00',
    lastActivity: '2 days ago',
    industry: 'Legal Services',
    startDate: '2025-04-10',
    socials: [{ platform: 'Facebook', handle: 'Mendoza Law Firm' }],
    brandColors: ['#1A2B4A', '#C5A572', '#F5F5F0'],
  },
  {
    id: 'C-007',
    name: 'Diana Chua',
    company: 'Glow Aesthetics',
    email: 'diana@glowaesthetics.ph',
    phone: '+63 923 789 0123',
    servicePackage: 'Social Growth Pro',
    status: 'Active',
    monthlyRetainer: 28000,
    accountManager: 'Andrea Lim',
    nextMeeting: '2026-08-11T15:00:00',
    lastActivity: '30 minutes ago',
    industry: 'Beauty & Wellness',
    startDate: '2025-06-01',
    socials: [
      { platform: 'Instagram', handle: '@glowaesthetics.ph' },
      { platform: 'TikTok', handle: '@glowaesthetics.ph' },
    ],
    brandColors: ['#E8B4C8', '#6C5B7B', '#FDF0F5'],
  },
  {
    id: 'C-008',
    name: 'Tony Fernandez',
    company: 'Fernandez Real Estate',
    email: 'tony@fernandezre.ph',
    phone: '+63 924 890 1234',
    servicePackage: 'Web + Social Pro',
    status: 'Onboarding',
    monthlyRetainer: 42000,
    accountManager: 'Mike Tan',
    nextMeeting: '2026-08-08T10:00:00',
    lastActivity: '1 hour ago',
    industry: 'Real Estate',
    startDate: '2026-08-01',
    socials: [{ platform: 'Facebook', handle: 'Fernandez Real Estate' }],
    brandColors: ['#0D2B4E', '#D4AF37', '#FFFFFF'],
  },
];

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Discovery Scheduled'
  | 'Proposal Sent'
  | 'Won'
  | 'Lost';

export interface Lead {
  id: string;
  name: string;
  email: string;
  business: string;
  budgetRange: string;
  interestedService: string;
  message: string;
  source: string;
  date: string;
  status: LeadStatus;
}

export const leads: Lead[] = [
  {
    id: 'L-101',
    name: 'Patricia Lim',
    email: 'patricia@limboutique.ph',
    business: 'Lim Boutique',
    budgetRange: '₱15,000–₱30,000',
    interestedService: 'Social Media Management',
    message: 'Looking for someone to manage our Instagram and run monthly campaigns.',
    source: 'Instagram',
    date: '2026-08-06',
    status: 'New',
  },
  {
    id: 'L-102',
    name: 'Eric Tan',
    email: 'eric@tansrestaurant.ph',
    business: "Tan's Ramen House",
    budgetRange: '₱30,000–₱60,000',
    interestedService: 'Web + Social Pro',
    message: 'We need a new website and ongoing social media support.',
    source: 'Website',
    date: '2026-08-05',
    status: 'Contacted',
  },
  {
    id: 'L-103',
    name: 'Michelle Reyes',
    email: 'mich@michellereyes.co',
    business: 'Michelle Reyes Coaching',
    budgetRange: '₱15,000–₱30,000',
    interestedService: 'Strategy Call',
    message: 'I want to scale my coaching business online.',
    source: 'Referral',
    date: '2026-08-04',
    status: 'Discovery Scheduled',
  },
  {
    id: 'L-104',
    name: 'Victor Sy',
    email: 'victor@sycapital.ph',
    business: 'Sy Capital',
    budgetRange: '₱60,000+',
    interestedService: 'Web & Systems Support',
    message: 'Need a professional financial services website with client portal.',
    source: 'Facebook',
    date: '2026-08-02',
    status: 'Proposal Sent',
  },
  {
    id: 'L-105',
    name: 'Anna Dela Pena',
    email: 'anna@delapenadental.ph',
    business: 'Dela Peña Dental Clinic',
    budgetRange: '₱30,000–₱60,000',
    interestedService: 'Social Media Management',
    message: 'We want to attract more patients through social media.',
    source: 'TikTok',
    date: '2026-08-01',
    status: 'Won',
  },
  {
    id: 'L-106',
    name: 'Rico Angeles',
    email: 'rico@angelesfitness.ph',
    business: 'Angeles Fitness',
    budgetRange: '₱15,000–₱30,000',
    interestedService: 'Social Media Management',
    message: 'Need help growing our fitness brand online.',
    source: 'Instagram',
    date: '2026-07-28',
    status: 'Lost',
  },
];

export type CallType =
  | 'Social Growth Sprint'
  | 'Brand Clarity Session'
  | 'Website Roadmap Call';

export interface DiscoveryCall {
  id: string;
  clientName: string;
  type: CallType;
  duration: number;
  date: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  paymentStatus: 'Paid' | 'Free' | 'Pending';
  notes: string;
  outcome: string;
}

export const discoveryCalls: DiscoveryCall[] = [
  {
    id: 'DC-201',
    clientName: 'Patricia Lim',
    type: 'Social Growth Sprint',
    duration: 30,
    date: '2026-08-08T11:00:00',
    status: 'Scheduled',
    paymentStatus: 'Free',
    notes: 'Wants to grow IG from 2K to 10K followers in 6 months.',
    outcome: '',
  },
  {
    id: 'DC-202',
    clientName: 'Michelle Reyes',
    type: 'Brand Clarity Session',
    duration: 45,
    date: '2026-08-09T14:00:00',
    status: 'Scheduled',
    paymentStatus: 'Paid',
    notes: 'Needs brand positioning for a coaching pivot.',
    outcome: '',
  },
  {
    id: 'DC-203',
    clientName: 'Victor Sy',
    type: 'Website Roadmap Call',
    duration: 60,
    date: '2026-08-10T10:00:00',
    status: 'Scheduled',
    paymentStatus: 'Paid',
    notes: 'Financial services site with client portal requirements.',
    outcome: '',
  },
  {
    id: 'DC-204',
    clientName: 'Anna Dela Peña',
    type: 'Social Growth Sprint',
    duration: 30,
    date: '2026-08-05T09:00:00',
    status: 'Completed',
    paymentStatus: 'Free',
    notes: 'Local dental clinic, wants appointment bookings via IG.',
    outcome: 'Converted to client — Social Starter package.',
  },
  {
    id: 'DC-205',
    clientName: 'Eric Tan',
    type: 'Website Roadmap Call',
    duration: 60,
    date: '2026-08-06T13:00:00',
    status: 'Completed',
    paymentStatus: 'Paid',
    notes: 'Ramen restaurant, needs online menu + reservation system.',
    outcome: 'Proposal sent — Web + Social Pro.',
  },
];

export type ProjectStage =
  | 'Discovery'
  | 'Planning'
  | 'Content Creation'
  | 'Design'
  | 'Development'
  | 'Review'
  | 'Client Approval'
  | 'Completed';

export interface Project {
  id: string;
  name: string;
  client: string;
  serviceType: string;
  stage: ProjectStage;
  progress: number;
  deadline: string;
  team: string[];
  priority: 'Low' | 'Medium' | 'High';
}

export const projects: Project[] = [
  {
    id: 'P-301',
    name: 'Bloom Skincare — Rebrand Launch',
    client: 'Bloom Skincare',
    serviceType: 'Social + Design',
    stage: 'Content Creation',
    progress: 45,
    deadline: '2026-08-20',
    team: ['Andrea Lim', 'Kai Santos', 'Mara Lopez'],
    priority: 'High',
  },
  {
    id: 'P-302',
    name: 'Vellamore — Portfolio Website',
    client: 'Vellamore Interiors',
    serviceType: 'Web Development',
    stage: 'Development',
    progress: 72,
    deadline: '2026-08-15',
    team: ['Mike Tan', 'Rico Cruz'],
    priority: 'High',
  },
  {
    id: 'P-303',
    name: 'FitForge — Q3 Content Sprint',
    client: 'FitForge Gym',
    serviceType: 'Social Media',
    stage: 'Content Creation',
    progress: 38,
    deadline: '2026-08-30',
    team: ['Andrea Lim', 'Kai Santos', 'Mara Lopez', 'Jen Reyes'],
    priority: 'Medium',
  },
  {
    id: 'P-304',
    name: 'Mendoza Law — Website + Client Portal',
    client: 'Mendoza Law Firm',
    serviceType: 'Web + Systems',
    stage: 'Design',
    progress: 55,
    deadline: '2026-09-05',
    team: ['Mike Tan', 'Rico Cruz', 'Jen Reyes'],
    priority: 'High',
  },
  {
    id: 'P-305',
    name: 'Glow Aesthetics — Launch Campaign',
    client: 'Glow Aesthetics',
    serviceType: 'Social + Strategy',
    stage: 'Planning',
    progress: 20,
    deadline: '2026-08-25',
    team: ['Andrea Lim', 'Mara Lopez'],
    priority: 'Medium',
  },
  {
    id: 'P-306',
    name: 'Urban Grind — Menu Refresh',
    client: 'Urban Grind Coffee',
    serviceType: 'Design',
    stage: 'Review',
    progress: 85,
    deadline: '2026-08-10',
    team: ['Kai Santos'],
    priority: 'Low',
  },
  {
    id: 'P-307',
    name: 'Fernandez RE — Website Build',
    client: 'Fernandez Real Estate',
    serviceType: 'Web Development',
    stage: 'Discovery',
    progress: 10,
    deadline: '2026-09-20',
    team: ['Mike Tan', 'Rico Cruz'],
    priority: 'Medium',
  },
  {
    id: 'P-308',
    name: 'Paper & Co. — Holiday Collection',
    client: 'Paper & Co. Stationery',
    serviceType: 'Social + Design',
    stage: 'Client Approval',
    progress: 92,
    deadline: '2026-08-12',
    team: ['Jen Reyes', 'Kai Santos'],
    priority: 'Low',
  },
  {
    id: 'P-309',
    name: 'Glow Aesthetics — IG Growth Sprint',
    client: 'Glow Aesthetics',
    serviceType: 'Social Media',
    stage: 'Completed',
    progress: 100,
    deadline: '2026-07-30',
    team: ['Andrea Lim', 'Mara Lopez'],
    priority: 'Medium',
  },
  {
    id: 'P-310',
    name: 'Bloom Skincare — TikTok Launch',
    client: 'Bloom Skincare',
    serviceType: 'Social Media',
    stage: 'Design',
    progress: 60,
    deadline: '2026-08-18',
    team: ['Kai Santos', 'Mara Lopez'],
    priority: 'High',
  },
];

export type ContentStatus =
  | 'Draft'
  | 'In Review'
  | 'Approved'
  | 'Scheduled'
  | 'Published';

export interface ContentItem {
  id: string;
  platform: 'Instagram' | 'TikTok' | 'Facebook';
  caption: string;
  status: ContentStatus;
  scheduledDate: string;
  designer: string;
  copywriter: string;
  client: string;
  reach?: number;
  engagement?: number;
  saves?: number;
  shares?: number;
}

export const contentItems: ContentItem[] = [
  {
    id: 'S-401',
    platform: 'Instagram',
    caption: 'Glow up your AM routine ✨ New arrivals dropping this week',
    status: 'Approved',
    scheduledDate: '2026-08-08T09:00:00',
    designer: 'Kai Santos',
    copywriter: 'Mara Lopez',
    client: 'Glow Aesthetics',
  },
  {
    id: 'S-402',
    platform: 'TikTok',
    caption: 'POV: your skincare finally works 🧴',
    status: 'Scheduled',
    scheduledDate: '2026-08-09T18:00:00',
    designer: 'Kai Santos',
    copywriter: 'Mara Lopez',
    client: 'Bloom Skincare',
  },
  {
    id: 'S-403',
    platform: 'Instagram',
    caption: 'Monday grind starts here ☕️ #UrbanGrind',
    status: 'Published',
    scheduledDate: '2026-08-04T08:00:00',
    designer: 'Kai Santos',
    copywriter: 'Jen Reyes',
    client: 'Urban Grind Coffee',
    reach: 12400,
    engagement: 8.4,
    saves: 320,
    shares: 89,
  },
  {
    id: 'S-404',
    platform: 'Instagram',
    caption: 'Transform your space with our latest project reveal',
    status: 'In Review',
    scheduledDate: '2026-08-10T10:00:00',
    designer: 'Kai Santos',
    copywriter: 'Mara Lopez',
    client: 'Vellamore Interiors',
  },
  {
    id: 'S-405',
    platform: 'TikTok',
    caption: '5 exercises you are doing wrong 🏋️',
    status: 'Draft',
    scheduledDate: '2026-08-11T17:00:00',
    designer: 'Kai Santos',
    copywriter: 'Jen Reyes',
    client: 'FitForge Gym',
  },
  {
    id: 'S-406',
    platform: 'Facebook',
    caption: 'Book your free consultation today!',
    status: 'Scheduled',
    scheduledDate: '2026-08-08T12:00:00',
    designer: 'Kai Santos',
    copywriter: 'Jen Reyes',
    client: 'Mendoza Law Firm',
  },
  {
    id: 'S-407',
    platform: 'Instagram',
    caption: 'Behind the scenes of our newest design system',
    status: 'Published',
    scheduledDate: '2026-08-03T15:00:00',
    designer: 'Kai Santos',
    copywriter: 'Mara Lopez',
    client: 'Vellamore Interiors',
    reach: 8700,
    engagement: 6.2,
    saves: 210,
    shares: 45,
  },
  {
    id: 'S-408',
    platform: 'Instagram',
    caption: 'Client spotlight: 6 months of growth 📈',
    status: 'Approved',
    scheduledDate: '2026-08-12T10:00:00',
    designer: 'Kai Santos',
    copywriter: 'Mara Lopez',
    client: 'Bloom Skincare',
  },
  {
    id: 'S-409',
    platform: 'TikTok',
    caption: 'Why your aesthetic clinic needs TikTok 🩺',
    status: 'Draft',
    scheduledDate: '2026-08-13T19:00:00',
    designer: 'Kai Santos',
    copywriter: 'Jen Reyes',
    client: 'Glow Aesthetics',
  },
  {
    id: 'S-410',
    platform: 'Instagram',
    caption: 'New collection preview — coming soon 💌',
    status: 'In Review',
    scheduledDate: '2026-08-14T11:00:00',
    designer: 'Kai Santos',
    copywriter: 'Mara Lopez',
    client: 'Paper & Co. Stationery',
  },
];

export type ProductCategory =
  | 'Canva Templates'
  | 'Notion Systems'
  | 'Planners'
  | 'Printables'
  | 'Content Calendars'
  | 'Launch Kits';

export interface DigitalProduct {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  sku: string;
  status: 'Active' | 'Draft' | 'Retired';
  sales: number;
  revenue: number;
  downloads: number;
  lastUpdated: string;
}

export const digitalProducts: DigitalProduct[] = [
  {
    id: 'D-501',
    name: 'Social Media Content Planner',
    category: 'Content Calendars',
    price: 899,
    sku: 'NX-CC-001',
    status: 'Active',
    sales: 64,
    revenue: 57536,
    downloads: 61,
    lastUpdated: '2026-07-28',
  },
  {
    id: 'D-502',
    name: 'Notion Business OS',
    category: 'Notion Systems',
    price: 1499,
    sku: 'NX-NS-002',
    status: 'Active',
    sales: 38,
    revenue: 56962,
    downloads: 35,
    lastUpdated: '2026-07-20',
  },
  {
    id: 'D-503',
    name: 'Canva Brand Kit Bundle',
    category: 'Canva Templates',
    price: 699,
    sku: 'NX-CT-003',
    status: 'Active',
    sales: 52,
    revenue: 36348,
    downloads: 50,
    lastUpdated: '2026-08-01',
  },
  {
    id: 'D-504',
    name: 'Launch Kit Pro',
    category: 'Launch Kits',
    price: 2499,
    sku: 'NX-LK-004',
    status: 'Active',
    sales: 18,
    revenue: 44982,
    downloads: 18,
    lastUpdated: '2026-07-15',
  },
  {
    id: 'D-505',
    name: 'Daily Productivity Planner',
    category: 'Planners',
    price: 499,
    sku: 'NX-PL-005',
    status: 'Active',
    sales: 47,
    revenue: 23453,
    downloads: 46,
    lastUpdated: '2026-07-30',
  },
  {
    id: 'D-506',
    name: 'Wedding Stationery Printables',
    category: 'Printables',
    price: 599,
    sku: 'NX-PR-006',
    status: 'Active',
    sales: 29,
    revenue: 17371,
    downloads: 28,
    lastUpdated: '2026-07-22',
  },
  {
    id: 'D-507',
    name: 'Q4 Content Calendar',
    category: 'Content Calendars',
    price: 799,
    sku: 'NX-CC-007',
    status: 'Draft',
    sales: 0,
    revenue: 0,
    downloads: 0,
    lastUpdated: '2026-08-05',
  },
];

export type OrderStatus = 'Pending' | 'Paid' | 'Refunded' | 'Failed';

export interface Order {
  id: string;
  customer: string;
  product: string;
  amount: number;
  paymentMethod: string;
  status: OrderStatus;
  downloadSent: boolean;
  date: string;
}

export const orders: Order[] = [
  {
    id: 'O-601',
    customer: 'Bea Salvador',
    product: 'Notion Business OS',
    amount: 1499,
    paymentMethod: 'GCash',
    status: 'Paid',
    downloadSent: true,
    date: '2026-08-06',
  },
  {
    id: 'O-602',
    customer: 'Marcus Tan',
    product: 'Launch Kit Pro',
    amount: 2499,
    paymentMethod: 'Credit Card',
    status: 'Paid',
    downloadSent: true,
    date: '2026-08-06',
  },
  {
    id: 'O-603',
    customer: 'Lara Villanueva',
    product: 'Social Media Content Planner',
    amount: 899,
    paymentMethod: 'GCash',
    status: 'Paid',
    downloadSent: true,
    date: '2026-08-05',
  },
  {
    id: 'O-604',
    customer: 'Diego Reyes',
    product: 'Canva Brand Kit Bundle',
    amount: 699,
    paymentMethod: 'PayPal',
    status: 'Pending',
    downloadSent: false,
    date: '2026-08-05',
  },
  {
    id: 'O-605',
    customer: 'Nina Cruz',
    product: 'Daily Productivity Planner',
    amount: 499,
    paymentMethod: 'GCash',
    status: 'Paid',
    downloadSent: true,
    date: '2026-08-04',
  },
  {
    id: 'O-606',
    customer: 'Alex Sy',
    product: 'Launch Kit Pro',
    amount: 2499,
    paymentMethod: 'Credit Card',
    status: 'Failed',
    downloadSent: false,
    date: '2026-08-03',
  },
  {
    id: 'O-607',
    customer: 'Joy Mendoza',
    product: 'Wedding Stationery Printables',
    amount: 599,
    paymentMethod: 'GCash',
    status: 'Refunded',
    downloadSent: true,
    date: '2026-08-02',
  },
  {
    id: 'O-608',
    customer: 'Ken Dela Cruz',
    product: 'Notion Business OS',
    amount: 1499,
    paymentMethod: 'PayMaya',
    status: 'Paid',
    downloadSent: true,
    date: '2026-08-01',
  },
];

export interface WebsiteRequest {
  id: string;
  business: string;
  businessType: string;
  goals: string;
  pagesRequested: string[];
  featuresRequested: string[];
  budget: string;
  timeline: string;
  proposalStatus: 'Not Sent' | 'Sent' | 'Accepted' | 'Rejected';
  developmentStatus: 'Not Started' | 'In Progress' | 'Review' | 'Live';
  date: string;
}

export const websiteRequests: WebsiteRequest[] = [
  {
    id: 'W-701',
    business: 'Sy Capital',
    businessType: 'Financial Services',
    goals: 'Build trust and capture leads online',
    pagesRequested: ['Home', 'Services', 'About', 'Contact', 'Client Portal'],
    featuresRequested: ['Client Login', 'Contact Form', 'Newsletter', 'Blog'],
    budget: '₱80,000+',
    timeline: '8–12 weeks',
    proposalStatus: 'Sent',
    developmentStatus: 'Not Started',
    date: '2026-08-02',
  },
  {
    id: 'W-702',
    business: "Tan's Ramen House",
    businessType: 'Restaurant',
    goals: 'Online menu and reservation system',
    pagesRequested: ['Home', 'Menu', 'About', 'Reservations', 'Contact'],
    featuresRequested: ['Online Menu', 'Reservation System', 'Gallery', 'Google Maps'],
    budget: '₱40,000–₱80,000',
    timeline: '4–6 weeks',
    proposalStatus: 'Sent',
    developmentStatus: 'Not Started',
    date: '2026-08-05',
  },
  {
    id: 'W-703',
    business: 'Fernandez Real Estate',
    businessType: 'Real Estate',
    goals: 'Showcase property listings with search',
    pagesRequested: ['Home', 'Listings', 'Agents', 'About', 'Contact'],
    featuresRequested: ['Property Search', 'Map Integration', 'Lead Capture', 'Agent Profiles'],
    budget: '₱80,000+',
    timeline: '8–12 weeks',
    proposalStatus: 'Accepted',
    developmentStatus: 'In Progress',
    date: '2026-07-28',
  },
  {
    id: 'W-704',
    business: 'Dela Peña Dental Clinic',
    businessType: 'Healthcare',
    goals: 'Online appointment booking and patient education',
    pagesRequested: ['Home', 'Services', 'Team', 'Book Now', 'FAQ'],
    featuresRequested: ['Appointment Booking', 'FAQ Section', 'Contact Form'],
    budget: '₱40,000–₱80,000',
    timeline: '4–6 weeks',
    proposalStatus: 'Not Sent',
    developmentStatus: 'Not Started',
    date: '2026-08-06',
  },
];

export type TeamRole =
  | 'Admin'
  | 'Creative Director'
  | 'Designer'
  | 'Video Editor'
  | 'Copywriter'
  | 'Web Developer'
  | 'Social Media Manager';

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  avatar: string;
  email: string;
  activeProjects: number;
  tasksAssigned: number;
  tasksCompleted: number;
  availability: 'Available' | 'Busy' | 'On Leave';
  utilization: number;
}

export const team: TeamMember[] = [
  {
    id: 'T-01',
    name: 'Andrea Lim',
    role: 'Admin',
    avatar: 'AL',
    email: 'andrea@nexorastudio.ph',
    activeProjects: 4,
    tasksAssigned: 12,
    tasksCompleted: 48,
    availability: 'Available',
    utilization: 78,
  },
  {
    id: 'T-02',
    name: 'Mike Tan',
    role: 'Creative Director',
    avatar: 'MT',
    email: 'mike@nexorastudio.ph',
    activeProjects: 3,
    tasksAssigned: 8,
    tasksCompleted: 35,
    availability: 'Busy',
    utilization: 92,
  },
  {
    id: 'T-03',
    name: 'Kai Santos',
    role: 'Designer',
    avatar: 'KS',
    email: 'kai@nexorastudio.ph',
    activeProjects: 5,
    tasksAssigned: 18,
    tasksCompleted: 62,
    availability: 'Available',
    utilization: 88,
  },
  {
    id: 'T-04',
    name: 'Mara Lopez',
    role: 'Copywriter',
    avatar: 'ML',
    email: 'mara@nexorastudio.ph',
    activeProjects: 4,
    tasksAssigned: 15,
    tasksCompleted: 54,
    availability: 'Available',
    utilization: 81,
  },
  {
    id: 'T-05',
    name: 'Rico Cruz',
    role: 'Web Developer',
    avatar: 'RC',
    email: 'rico@nexorastudio.ph',
    activeProjects: 3,
    tasksAssigned: 10,
    tasksCompleted: 28,
    availability: 'Busy',
    utilization: 90,
  },
  {
    id: 'T-06',
    name: 'Jen Reyes',
    role: 'Social Media Manager',
    avatar: 'JR',
    email: 'jen@nexorastudio.ph',
    activeProjects: 4,
    tasksAssigned: 14,
    tasksCompleted: 47,
    availability: 'Available',
    utilization: 75,
  },
  {
    id: 'T-07',
    name: 'Sam Dela Torre',
    role: 'Video Editor',
    avatar: 'SD',
    email: 'sam@nexorastudio.ph',
    activeProjects: 2,
    tasksAssigned: 6,
    tasksCompleted: 22,
    availability: 'On Leave',
    utilization: 0,
  },
];

export interface Invoice {
  id: string;
  client: string;
  amount: number;
  status: 'Paid' | 'Outstanding' | 'Overdue';
  dueDate: string;
  issuedDate: string;
  service: string;
}

export const invoices: Invoice[] = [
  {
    id: 'INV-2026-045',
    client: 'Bloom Skincare',
    amount: 28000,
    status: 'Paid',
    dueDate: '2026-08-01',
    issuedDate: '2026-07-01',
    service: 'Social Growth Pro — August',
  },
  {
    id: 'INV-2026-046',
    client: 'Urban Grind Coffee',
    amount: 15000,
    status: 'Paid',
    dueDate: '2026-08-01',
    issuedDate: '2026-07-01',
    service: 'Social Starter — August',
  },
  {
    id: 'INV-2026-047',
    client: 'Vellamore Interiors',
    amount: 42000,
    status: 'Outstanding',
    dueDate: '2026-08-15',
    issuedDate: '2026-08-01',
    service: 'Web + Social Pro — August',
  },
  {
    id: 'INV-2026-048',
    client: 'FitForge Gym',
    amount: 28000,
    status: 'Outstanding',
    dueDate: '2026-08-20',
    issuedDate: '2026-08-05',
    service: 'Social Growth Pro — August',
  },
  {
    id: 'INV-2026-049',
    client: 'Mendoza Law Firm',
    amount: 17500,
    status: 'Overdue',
    dueDate: '2026-07-25',
    issuedDate: '2026-06-25',
    service: 'Web & Systems — July milestone',
  },
  {
    id: 'INV-2026-050',
    client: 'Glow Aesthetics',
    amount: 28000,
    status: 'Paid',
    dueDate: '2026-08-01',
    issuedDate: '2026-07-01',
    service: 'Social Growth Pro — August',
  },
  {
    id: 'INV-2026-051',
    client: 'Fernandez Real Estate',
    amount: 21000,
    status: 'Outstanding',
    dueDate: '2026-08-18',
    issuedDate: '2026-08-01',
    service: 'Web + Social Pro — Onboarding',
  },
];

export const revenueData = [
  { month: 'Sep', revenue: 128000, expenses: 78000, profit: 50000 },
  { month: 'Oct', revenue: 142000, expenses: 82000, profit: 60000 },
  { month: 'Nov', revenue: 155000, expenses: 85000, profit: 70000 },
  { month: 'Dec', revenue: 168000, expenses: 91000, profit: 77000 },
  { month: 'Jan', revenue: 152000, expenses: 88000, profit: 64000 },
  { month: 'Feb', revenue: 165000, expenses: 90000, profit: 75000 },
  { month: 'Mar', revenue: 178000, expenses: 95000, profit: 83000 },
  { month: 'Apr', revenue: 172000, expenses: 93000, profit: 79000 },
  { month: 'May', revenue: 185000, expenses: 98000, profit: 87000 },
  { month: 'Jun', revenue: 195000, expenses: 102000, profit: 93000 },
  { month: 'Jul', revenue: 210000, expenses: 108000, profit: 102000 },
  { month: 'Aug', revenue: 185000, expenses: 96000, profit: 89000 },
];

export const leadSourceData = [
  { source: 'Instagram', count: 34, fill: 'hsl(var(--chart-1))' },
  { source: 'Facebook', count: 22, fill: 'hsl(var(--chart-3))' },
  { source: 'Website', count: 18, fill: 'hsl(var(--chart-2))' },
  { source: 'TikTok', count: 14, fill: 'hsl(var(--chart-5))' },
  { source: 'Referral', count: 12, fill: 'hsl(var(--chart-4))' },
];

export const projectPipelineData = [
  { stage: 'Discovery', count: 2 },
  { stage: 'Planning', count: 1 },
  { stage: 'Content', count: 2 },
  { stage: 'Design', count: 2 },
  { stage: 'Development', count: 1 },
  { stage: 'Review', count: 1 },
  { stage: 'Approval', count: 1 },
];

export const callBookingsData = [
  { week: 'W1', calls: 4 },
  { week: 'W2', calls: 6 },
  { week: 'W3', calls: 8 },
  { week: 'W4', calls: 9 },
];

export const productSalesData = [
  { month: 'Mar', sales: 8, revenue: 12000 },
  { month: 'Apr', sales: 12, revenue: 18500 },
  { month: 'May', sales: 15, revenue: 22400 },
  { month: 'Jun', sales: 18, revenue: 28100 },
  { month: 'Jul', sales: 22, revenue: 34600 },
  { month: 'Aug', sales: 19, revenue: 31050 },
];

export const revenueByService = [
  { service: 'Social Media', revenue: 96000, fill: 'hsl(var(--chart-1))' },
  { service: 'Web & Systems', revenue: 54000, fill: 'hsl(var(--chart-2))' },
  { service: 'Digital Products', revenue: 31050, fill: 'hsl(var(--chart-3))' },
  { service: 'Strategy Calls', revenue: 4200, fill: 'hsl(var(--chart-5))' },
];

export const revenueByClient = [
  { client: 'Vellamore', revenue: 42000 },
  { client: 'Fernandez RE', revenue: 42000 },
  { client: 'Mendoza Law', revenue: 35000 },
  { client: 'Bloom', revenue: 28000 },
  { client: 'FitForge', revenue: 28000 },
  { client: 'Glow', revenue: 28000 },
  { client: 'Urban Grind', revenue: 15000 },
];

export const activities = [
  {
    id: 'A1',
    type: 'inquiry',
    text: 'New inquiry from Patricia Lim — Lim Boutique',
    time: '12 minutes ago',
    icon: 'Mail',
  },
  {
    id: 'A2',
    type: 'call',
    text: 'Strategy call booked with Michelle Reyes',
    time: '1 hour ago',
    icon: 'Calendar',
  },
  {
    id: 'A3',
    type: 'payment',
    text: 'Invoice INV-2026-050 paid by Glow Aesthetics',
    time: '2 hours ago',
    icon: 'CreditCard',
  },
  {
    id: 'A4',
    type: 'content',
    text: 'Content piece S-401 approved for Glow Aesthetics',
    time: '3 hours ago',
    icon: 'CheckCircle',
  },
  {
    id: 'A5',
    type: 'project',
    text: 'Vellamore Portfolio Website moved to Development',
    time: '5 hours ago',
    icon: 'FolderKanban',
  },
  {
    id: 'A6',
    type: 'order',
    text: 'Digital product order O-602 completed — Launch Kit Pro',
    time: '6 hours ago',
    icon: 'ShoppingBag',
  },
  {
    id: 'A7',
    type: 'client',
    text: 'Fernandez Real Estate onboarded as new client',
    time: '1 day ago',
    icon: 'UserPlus',
  },
  {
    id: 'A8',
    type: 'payment',
    text: 'Invoice INV-2026-046 paid by Urban Grind Coffee',
    time: '1 day ago',
    icon: 'CreditCard',
  },
];

export const notifications = [
  {
    id: 'N1',
    title: 'Invoice overdue',
    description: 'INV-2026-049 — Mendoza Law Firm is 13 days overdue',
    time: '1h ago',
    unread: true,
  },
  {
    id: 'N2',
    title: 'New lead',
    description: 'Patricia Lim submitted a website inquiry',
    time: '12m ago',
    unread: true,
  },
  {
    id: 'N3',
    title: 'Content approval needed',
    description: 'S-410 awaiting approval for Paper & Co.',
    time: '3h ago',
    unread: true,
  },
  {
    id: 'N4',
    title: 'Project deadline approaching',
    description: 'Vellamore Portfolio Website due in 8 days',
    time: '5h ago',
    unread: false,
  },
];

export const navItems = [
  { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
  { label: 'Clients', href: '/clients', icon: 'Users' },
  { label: 'Leads & Inquiries', href: '/leads', icon: 'UserSearch' },
  { label: 'Discovery Calls', href: '/discovery-calls', icon: 'PhoneCall' },
  { label: 'Projects', href: '/projects', icon: 'FolderKanban' },
  { label: 'Social Media', href: '/social', icon: 'Share2' },
  { label: 'Digital Products', href: '/products', icon: 'Package' },
  { label: 'Orders', href: '/orders', icon: 'ShoppingBag' },
  { label: 'Website Requests', href: '/website-requests', icon: 'Globe' },
  { label: 'Calendar', href: '/calendar', icon: 'CalendarDays' },
  { label: 'Team', href: '/team', icon: 'UsersRound' },
  { label: 'Finance', href: '/finance', icon: 'Wallet' },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3' },
  { label: 'Reports', href: '/reports', icon: 'FileText' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
];

export const formatPeso = (n: number) =>
  '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export const formatPesoK = (n: number) => {
  if (n >= 1000) return '₱' + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K';
  return '₱' + n.toLocaleString('en-PH');
};
