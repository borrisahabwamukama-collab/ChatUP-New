import { createClient } from '@supabase/supabase-js';

// Supabase configuration for ChatUp Live & Talk With Nature
const SUPABASE_URL = 'https://kwktegtjowrurgdsvafv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3a3RlZ3Rqb3dydXJnZHN2YWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMzMwMjYsImV4cCI6MjEwMjgwOTAyNn0.wPoSxhVxBVB3hscvSW1osX5ucZUC0fYmilkTS0D-xZ0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Helper Service Functions for ChatUp Database & Realtime Channels
 */

// 1. Fetch live chat messages for a specific room or stream
export async function fetchChatMessages(roomId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error.message);
    return [];
  }
  return data;
}

// 2. Send a new message to Supabase database
export async function sendChatMessage(roomId, senderName, messageText) {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      { room_id: roomId, sender: senderName, text: messageText, created_at: new Date() }
    ]);

  if (error) {
    console.error('Error sending message:', error.message);
    return null;
  }
  return data;
}

// 3. Subscribe to Realtime socket changes for live chat or alerts
export function subscribeToRealtimeChat(roomId, onNewMessage) {
  return supabase
    .channel(`room:${roomId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, payload => {
      onNewMessage(payload.new);
    })
    .subscribe();
}