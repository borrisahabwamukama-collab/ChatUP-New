import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from './supabaseClient';

const OFFLINE_QUEUE_KEY = '@chatup_offline_message_queue';

/**
 * Adds an outgoing message/packet to the local queue when offline
 */
export async function queueOfflineMessage(messagePayload) {
  try {
    const existingQueueJson = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    const queue = existingQueueJson ? JSON.parse(existingQueueJson) : [];
    
    const newEntry = {
      ...messagePayload,
      localId: `local_${Date.now()}_${Math.random()}`,
      queuedAt: new Date().toISOString(),
    };

    queue.push(newEntry);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    console.log('📦 Message saved to local offline queue.');
    return newEntry;
  } catch (error) {
    console.error('Failed to queue offline message:', error);
    return null;
  }
}

/**
 * Automatically syncs queued offline items to Supabase when connection is restored
 */
export async function processOfflineQueue() {
  try {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      return { syncedCount: 0, online: false };
    }

    const existingQueueJson = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!existingQueueJson) return { syncedCount: 0, online: true };

    const queue = JSON.parse(existingQueueJson);
    if (queue.length === 0) return { syncedCount: 0, online: true };

    console.log(`🔄 Internet restored! Processing ${queue.length} offline messages...`);
    let syncedCount = 0;
    const remainingQueue = [];

    for (let item of queue) {
      const { localId, queuedAt, ...payload } = item;
      
      // Ensure room_id has a valid fallback value so it never violates the NOT-NULL constraint
      const resolvedRoomId = payload.room_id || payload.group_id || `fallback_room_${payload.sender_id || 'guest'}`;

      // Clean the payload to ensure only valid columns matching the database schema are sent (group_id removed)
      const cleanPayload = {
        sender: payload.sender || 'You',
        sender_id: payload.sender_id || 'guest_user',
        room_id: resolvedRoomId,
        recipient_id: payload.recipient_id || null,
        text: payload.text || '',
        image_url: payload.image_url || null,
        audio_url: payload.audio_url || null,
        is_read: false,
      };

      const { error } = await supabase.from('messages').insert([cleanPayload]);
      
      if (error) {
        console.error('Sync failed for item, keeping in queue:', error);
        // If it's a structural schema violation or missing column, drop it to unblock the queue, otherwise keep it
        if (error.code === '23502' || error.code === 'PGRST204') {
          console.warn('Dropping malformed offline message due to schema mismatch:', error.message);
        } else {
          remainingQueue.push(item);
        }
      } else {
        syncedCount++;
      }
    }

    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
    return { syncedCount, online: true };
  } catch (error) {
    console.error('Error processing offline queue:', error);
    return { syncedCount: 0, online: false };
  }
}