import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in environment variables.');
}

// This client has admin privileges and should only be used on the server-side.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
