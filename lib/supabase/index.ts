// Re-exported so existing `@/lib/supabase` imports keep resolving to the
// browser client. Server code should import `@/lib/supabase/server` directly.
export { supabase, supabaseConfigured } from './client';
