import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase Project URL and Anon/Public API Key
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);