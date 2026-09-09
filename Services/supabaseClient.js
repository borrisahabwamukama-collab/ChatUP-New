import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kwktegtjowrurgdsvafv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3a3RlZ3Rqb3dydXJnZHN2YWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMzMwMjYsImV4cCI6MjEwMjgwOTAyNn0.wPoSxhVxBVB3hscvSW1osX5ucZUC0fYmilkTS0D-xZ0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});