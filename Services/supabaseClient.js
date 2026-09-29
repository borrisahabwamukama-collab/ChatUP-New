import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Self-contained polyfill for TextEncoder/TextDecoder using global scope
if (typeof global.TextEncoder === 'undefined') {
  try {
    const { TextEncoder, TextDecoder } = require('text-encoding');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
  } catch (e) {
    console.log('TextEncoder polyfill notice:', e);
  }
}

const supabaseUrl = 'https://kwktegtjowrurgdsvafv.supabase.co';
const supabaseAnonKey = 'sb_publishable_eNIi0Z0ZrsigF0Mo6DJQyg_XgtpKx1L';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});