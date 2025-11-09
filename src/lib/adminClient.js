import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
console.log('URL:', supabaseUrl);  // يطبع URL كامل
console.log('Key loaded:', !!supabaseAnonKey); // يطبع true

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);