/*
# Update RLS Policies to Authenticated-Only

## Summary
The dashboard now has a sign-in/sign-up screen using Supabase Auth.
All RLS policies are updated from `anon, authenticated` (public) to `authenticated`-only,
so only signed-in users can read and write data.

## Changes
- Drops all existing `anon_*` policies on every table.
- Creates new `authenticated`-only SELECT/INSERT/UPDATE/DELETE policies on all tables.
- Data is intentionally shared among all authenticated users (single-tenant agency app).

## Tables Updated
1. clients
2. leads
3. discovery_calls
4. projects
5. content_items
6. digital_products
7. orders
8. website_requests
9. team_members
10. invoices
11. activities
12. notifications
13. monthly_revenue
14. product_sales
15. call_bookings

## Security
- All policies scoped to `TO authenticated`.
- No user_id columns needed — data is shared among all authenticated users (agency staff).
- `USING (true)` is acceptable here because access is controlled by authentication, not per-row ownership.
*/

-- Helper: for each table, drop old anon policies and create authenticated ones

-- 1. clients
DROP POLICY IF EXISTS "anon_select_clients" ON clients;
DROP POLICY IF EXISTS "anon_insert_clients" ON clients;
DROP POLICY IF EXISTS "anon_update_clients" ON clients;
DROP POLICY IF EXISTS "anon_delete_clients" ON clients;

CREATE POLICY "auth_select_clients" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_clients" ON clients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_clients" ON clients FOR DELETE TO authenticated USING (true);

-- 2. leads
DROP POLICY IF EXISTS "anon_select_leads" ON leads;
DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
DROP POLICY IF EXISTS "anon_update_leads" ON leads;
DROP POLICY IF EXISTS "anon_delete_leads" ON leads;

CREATE POLICY "auth_select_leads" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_leads" ON leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_leads" ON leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_leads" ON leads FOR DELETE TO authenticated USING (true);

-- 3. discovery_calls
DROP POLICY IF EXISTS "anon_select_discovery_calls" ON discovery_calls;
DROP POLICY IF EXISTS "anon_insert_discovery_calls" ON discovery_calls;
DROP POLICY IF EXISTS "anon_update_discovery_calls" ON discovery_calls;
DROP POLICY IF EXISTS "anon_delete_discovery_calls" ON discovery_calls;

CREATE POLICY "auth_select_discovery_calls" ON discovery_calls FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_discovery_calls" ON discovery_calls FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_discovery_calls" ON discovery_calls FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_discovery_calls" ON discovery_calls FOR DELETE TO authenticated USING (true);

-- 4. projects
DROP POLICY IF EXISTS "anon_select_projects" ON projects;
DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
DROP POLICY IF EXISTS "anon_update_projects" ON projects;
DROP POLICY IF EXISTS "anon_delete_projects" ON projects;

CREATE POLICY "auth_select_projects" ON projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_projects" ON projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_projects" ON projects FOR DELETE TO authenticated USING (true);

-- 5. content_items
DROP POLICY IF EXISTS "anon_select_content_items" ON content_items;
DROP POLICY IF EXISTS "anon_insert_content_items" ON content_items;
DROP POLICY IF EXISTS "anon_update_content_items" ON content_items;
DROP POLICY IF EXISTS "anon_delete_content_items" ON content_items;

CREATE POLICY "auth_select_content_items" ON content_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_content_items" ON content_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_content_items" ON content_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_content_items" ON content_items FOR DELETE TO authenticated USING (true);

-- 6. digital_products
DROP POLICY IF EXISTS "anon_select_digital_products" ON digital_products;
DROP POLICY IF EXISTS "anon_insert_digital_products" ON digital_products;
DROP POLICY IF EXISTS "anon_update_digital_products" ON digital_products;
DROP POLICY IF EXISTS "anon_delete_digital_products" ON digital_products;

CREATE POLICY "auth_select_digital_products" ON digital_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_digital_products" ON digital_products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_digital_products" ON digital_products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_digital_products" ON digital_products FOR DELETE TO authenticated USING (true);

-- 7. orders
DROP POLICY IF EXISTS "anon_select_orders" ON orders;
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
DROP POLICY IF EXISTS "anon_update_orders" ON orders;
DROP POLICY IF EXISTS "anon_delete_orders" ON orders;

CREATE POLICY "auth_select_orders" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_orders" ON orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_orders" ON orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_orders" ON orders FOR DELETE TO authenticated USING (true);

-- 8. website_requests
DROP POLICY IF EXISTS "anon_select_website_requests" ON website_requests;
DROP POLICY IF EXISTS "anon_insert_website_requests" ON website_requests;
DROP POLICY IF EXISTS "anon_update_website_requests" ON website_requests;
DROP POLICY IF EXISTS "anon_delete_website_requests" ON website_requests;

CREATE POLICY "auth_select_website_requests" ON website_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_website_requests" ON website_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_website_requests" ON website_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_website_requests" ON website_requests FOR DELETE TO authenticated USING (true);

-- 9. team_members
DROP POLICY IF EXISTS "anon_select_team_members" ON team_members;
DROP POLICY IF EXISTS "anon_insert_team_members" ON team_members;
DROP POLICY IF EXISTS "anon_update_team_members" ON team_members;
DROP POLICY IF EXISTS "anon_delete_team_members" ON team_members;

CREATE POLICY "auth_select_team_members" ON team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_team_members" ON team_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_team_members" ON team_members FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_team_members" ON team_members FOR DELETE TO authenticated USING (true);

-- 10. invoices
DROP POLICY IF EXISTS "anon_select_invoices" ON invoices;
DROP POLICY IF EXISTS "anon_insert_invoices" ON invoices;
DROP POLICY IF EXISTS "anon_update_invoices" ON invoices;
DROP POLICY IF EXISTS "anon_delete_invoices" ON invoices;

CREATE POLICY "auth_select_invoices" ON invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_invoices" ON invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_invoices" ON invoices FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_invoices" ON invoices FOR DELETE TO authenticated USING (true);

-- 11. activities
DROP POLICY IF EXISTS "anon_select_activities" ON activities;
DROP POLICY IF EXISTS "anon_insert_activities" ON activities;
DROP POLICY IF EXISTS "anon_delete_activities" ON activities;

CREATE POLICY "auth_select_activities" ON activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_activities" ON activities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_delete_activities" ON activities FOR DELETE TO authenticated USING (true);

-- 12. notifications
DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;

CREATE POLICY "auth_select_notifications" ON notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_notifications" ON notifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_notifications" ON notifications FOR DELETE TO authenticated USING (true);

-- 13. monthly_revenue
DROP POLICY IF EXISTS "anon_select_monthly_revenue" ON monthly_revenue;
DROP POLICY IF EXISTS "anon_insert_monthly_revenue" ON monthly_revenue;

CREATE POLICY "auth_select_monthly_revenue" ON monthly_revenue FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_monthly_revenue" ON monthly_revenue FOR INSERT TO authenticated WITH CHECK (true);

-- 14. product_sales
DROP POLICY IF EXISTS "anon_select_product_sales" ON product_sales;
DROP POLICY IF EXISTS "anon_insert_product_sales" ON product_sales;

CREATE POLICY "auth_select_product_sales" ON product_sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_product_sales" ON product_sales FOR INSERT TO authenticated WITH CHECK (true);

-- 15. call_bookings
DROP POLICY IF EXISTS "anon_select_call_bookings" ON call_bookings;
DROP POLICY IF EXISTS "anon_insert_call_bookings" ON call_bookings;

CREATE POLICY "auth_select_call_bookings" ON call_bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_call_bookings" ON call_bookings FOR INSERT TO authenticated WITH CHECK (true);