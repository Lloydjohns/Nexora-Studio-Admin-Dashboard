/*
# Nexora Studio — Full Schema Creation

## Summary
Creates all core tables for the Nexora Studio admin dashboard: clients, leads, discovery_calls, projects, content_items, digital_products, orders, website_requests, team_members, invoices, activities, and notifications. Also creates chart aggregation tables (monthly_revenue, product_sales, call_bookings) for dashboard charts.

## Tables Created
1. clients — CRM records for agency clients
2. leads — Website inquiry / contact form submissions
3. discovery_calls — Booked strategy/consultation calls
4. projects — Kanban project management records
5. content_items — Social media content calendar entries
6. digital_products — Downloadable templates and products
7. orders — Digital product purchase records
8. website_requests — Website build inquiries
9. team_members — Internal team roster
10. invoices — Billing records
11. activities — Activity feed entries
12. notifications — In-app notification items
13. monthly_revenue — Monthly revenue/expense/profit for charts
14. product_sales — Monthly product sales trend for charts
15. call_bookings — Weekly call booking counts for charts

## Security
- Single-tenant app with no sign-in screen.
- RLS enabled on every table with anon+authenticated CRUD (data is intentionally shared).
- No user_id columns or auth.uid() references.
*/

-- 1. clients
CREATE TABLE IF NOT EXISTS clients (
  id text PRIMARY KEY,
  name text NOT NULL,
  company text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  service_package text NOT NULL,
  status text NOT NULL DEFAULT 'Active',
  monthly_retainer integer NOT NULL DEFAULT 0,
  account_manager text NOT NULL,
  next_meeting text,
  last_activity text,
  industry text,
  start_date text,
  socials jsonb NOT NULL DEFAULT '[]'::jsonb,
  brand_colors jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_clients" ON clients;
CREATE POLICY "anon_select_clients" ON clients FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_clients" ON clients;
CREATE POLICY "anon_insert_clients" ON clients FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_clients" ON clients;
CREATE POLICY "anon_update_clients" ON clients FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_clients" ON clients;
CREATE POLICY "anon_delete_clients" ON clients FOR DELETE TO anon, authenticated USING (true);

-- 2. leads
CREATE TABLE IF NOT EXISTS leads (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  business text NOT NULL,
  budget_range text,
  interested_service text,
  message text,
  source text,
  date text,
  status text NOT NULL DEFAULT 'New',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_leads" ON leads;
CREATE POLICY "anon_select_leads" ON leads FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_leads" ON leads;
CREATE POLICY "anon_update_leads" ON leads FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_leads" ON leads;
CREATE POLICY "anon_delete_leads" ON leads FOR DELETE TO anon, authenticated USING (true);

-- 3. discovery_calls
CREATE TABLE IF NOT EXISTS discovery_calls (
  id text PRIMARY KEY,
  client_name text NOT NULL,
  type text NOT NULL,
  duration integer NOT NULL DEFAULT 30,
  date text NOT NULL,
  status text NOT NULL DEFAULT 'Scheduled',
  payment_status text NOT NULL DEFAULT 'Free',
  notes text DEFAULT '',
  outcome text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE discovery_calls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_discovery_calls" ON discovery_calls;
CREATE POLICY "anon_select_discovery_calls" ON discovery_calls FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_discovery_calls" ON discovery_calls;
CREATE POLICY "anon_insert_discovery_calls" ON discovery_calls FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_discovery_calls" ON discovery_calls;
CREATE POLICY "anon_update_discovery_calls" ON discovery_calls FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_discovery_calls" ON discovery_calls;
CREATE POLICY "anon_delete_discovery_calls" ON discovery_calls FOR DELETE TO anon, authenticated USING (true);

-- 4. projects
CREATE TABLE IF NOT EXISTS projects (
  id text PRIMARY KEY,
  name text NOT NULL,
  client text NOT NULL,
  service_type text NOT NULL,
  stage text NOT NULL DEFAULT 'Discovery',
  progress integer NOT NULL DEFAULT 0,
  deadline text,
  team jsonb NOT NULL DEFAULT '[]'::jsonb,
  priority text NOT NULL DEFAULT 'Medium',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_projects" ON projects;
CREATE POLICY "anon_update_projects" ON projects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "anon_delete_projects" ON projects FOR DELETE TO anon, authenticated USING (true);

-- 5. content_items
CREATE TABLE IF NOT EXISTS content_items (
  id text PRIMARY KEY,
  platform text NOT NULL,
  caption text NOT NULL,
  status text NOT NULL DEFAULT 'Draft',
  scheduled_date text NOT NULL,
  designer text,
  copywriter text,
  client text NOT NULL,
  reach integer,
  engagement numeric,
  saves integer,
  shares integer,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_content_items" ON content_items;
CREATE POLICY "anon_select_content_items" ON content_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_content_items" ON content_items;
CREATE POLICY "anon_insert_content_items" ON content_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_content_items" ON content_items;
CREATE POLICY "anon_update_content_items" ON content_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_content_items" ON content_items;
CREATE POLICY "anon_delete_content_items" ON content_items FOR DELETE TO anon, authenticated USING (true);

-- 6. digital_products
CREATE TABLE IF NOT EXISTS digital_products (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  price integer NOT NULL DEFAULT 0,
  sku text NOT NULL,
  status text NOT NULL DEFAULT 'Active',
  sales integer NOT NULL DEFAULT 0,
  revenue integer NOT NULL DEFAULT 0,
  downloads integer NOT NULL DEFAULT 0,
  last_updated text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE digital_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_digital_products" ON digital_products;
CREATE POLICY "anon_select_digital_products" ON digital_products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_digital_products" ON digital_products;
CREATE POLICY "anon_insert_digital_products" ON digital_products FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_digital_products" ON digital_products;
CREATE POLICY "anon_update_digital_products" ON digital_products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_digital_products" ON digital_products;
CREATE POLICY "anon_delete_digital_products" ON digital_products FOR DELETE TO anon, authenticated USING (true);

-- 7. orders
CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  customer text NOT NULL,
  product text NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  payment_method text,
  status text NOT NULL DEFAULT 'Pending',
  download_sent boolean NOT NULL DEFAULT false,
  date text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_delete_orders" ON orders FOR DELETE TO anon, authenticated USING (true);

-- 8. website_requests
CREATE TABLE IF NOT EXISTS website_requests (
  id text PRIMARY KEY,
  business text NOT NULL,
  business_type text,
  goals text,
  pages_requested jsonb NOT NULL DEFAULT '[]'::jsonb,
  features_requested jsonb NOT NULL DEFAULT '[]'::jsonb,
  budget text,
  timeline text,
  proposal_status text NOT NULL DEFAULT 'Not Sent',
  development_status text NOT NULL DEFAULT 'Not Started',
  date text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE website_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_website_requests" ON website_requests;
CREATE POLICY "anon_select_website_requests" ON website_requests FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_website_requests" ON website_requests;
CREATE POLICY "anon_insert_website_requests" ON website_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_website_requests" ON website_requests;
CREATE POLICY "anon_update_website_requests" ON website_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_website_requests" ON website_requests;
CREATE POLICY "anon_delete_website_requests" ON website_requests FOR DELETE TO anon, authenticated USING (true);

-- 9. team_members
CREATE TABLE IF NOT EXISTS team_members (
  id text PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  avatar text NOT NULL,
  email text NOT NULL,
  active_projects integer NOT NULL DEFAULT 0,
  tasks_assigned integer NOT NULL DEFAULT 0,
  tasks_completed integer NOT NULL DEFAULT 0,
  availability text NOT NULL DEFAULT 'Available',
  utilization integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_team_members" ON team_members;
CREATE POLICY "anon_select_team_members" ON team_members FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_team_members" ON team_members;
CREATE POLICY "anon_insert_team_members" ON team_members FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_team_members" ON team_members;
CREATE POLICY "anon_update_team_members" ON team_members FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_team_members" ON team_members;
CREATE POLICY "anon_delete_team_members" ON team_members FOR DELETE TO anon, authenticated USING (true);

-- 10. invoices
CREATE TABLE IF NOT EXISTS invoices (
  id text PRIMARY KEY,
  client text NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Outstanding',
  due_date text,
  issued_date text,
  service text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_invoices" ON invoices;
CREATE POLICY "anon_select_invoices" ON invoices FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_invoices" ON invoices;
CREATE POLICY "anon_insert_invoices" ON invoices FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_invoices" ON invoices;
CREATE POLICY "anon_update_invoices" ON invoices FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_invoices" ON invoices;
CREATE POLICY "anon_delete_invoices" ON invoices FOR DELETE TO anon, authenticated USING (true);

-- 11. activities
CREATE TABLE IF NOT EXISTS activities (
  id text PRIMARY KEY,
  type text NOT NULL,
  text text NOT NULL,
  time text,
  icon text NOT NULL DEFAULT 'Mail',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_activities" ON activities;
CREATE POLICY "anon_select_activities" ON activities FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_activities" ON activities;
CREATE POLICY "anon_insert_activities" ON activities FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_activities" ON activities;
CREATE POLICY "anon_delete_activities" ON activities FOR DELETE TO anon, authenticated USING (true);

-- 12. notifications
CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  time text,
  unread boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
CREATE POLICY "anon_select_notifications" ON notifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
CREATE POLICY "anon_update_notifications" ON notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "anon_delete_notifications" ON notifications FOR DELETE TO anon, authenticated USING (true);

-- 13. monthly_revenue (chart data)
CREATE TABLE IF NOT EXISTS monthly_revenue (
  id serial PRIMARY KEY,
  month text NOT NULL,
  revenue integer NOT NULL DEFAULT 0,
  expenses integer NOT NULL DEFAULT 0,
  profit integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE monthly_revenue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_monthly_revenue" ON monthly_revenue;
CREATE POLICY "anon_select_monthly_revenue" ON monthly_revenue FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_monthly_revenue" ON monthly_revenue;
CREATE POLICY "anon_insert_monthly_revenue" ON monthly_revenue FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 14. product_sales (chart data)
CREATE TABLE IF NOT EXISTS product_sales (
  id serial PRIMARY KEY,
  month text NOT NULL,
  sales integer NOT NULL DEFAULT 0,
  revenue integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE product_sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_product_sales" ON product_sales;
CREATE POLICY "anon_select_product_sales" ON product_sales FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_product_sales" ON product_sales;
CREATE POLICY "anon_insert_product_sales" ON product_sales FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 15. call_bookings (chart data)
CREATE TABLE IF NOT EXISTS call_bookings (
  id serial PRIMARY KEY,
  week text NOT NULL,
  calls integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE call_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_call_bookings" ON call_bookings;
CREATE POLICY "anon_select_call_bookings" ON call_bookings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_call_bookings" ON call_bookings;
CREATE POLICY "anon_insert_call_bookings" ON call_bookings FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_projects_stage ON projects(stage);
CREATE INDEX IF NOT EXISTS idx_content_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
