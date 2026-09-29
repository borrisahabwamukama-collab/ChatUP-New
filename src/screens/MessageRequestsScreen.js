import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { supabase } from '../../Services/supabaseClient';

export default function MessageRequestsScreen({ isDarkMode, currentUser, navigation }) {
  const [requestsList, setRequestsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      fetchPendingRequests();
    }
  }, [currentUser]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);

      // 1. Get IDs of users current user is already following
      const { data: myFollows } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', currentUser.id);

      const followingIds = new Set((myFollows || []).map(f => f.following_id));

      // 2. Get users who are following current user, querying 'username' instead of 'handle'
      const { data: incomingFollowers, error } = await supabase
        .from('followers')
        .select(`
          id,
          created_at,
          follower:profiles!followers_follower_id_fkey(id, full_name, username, avatar_url, creator_role)
        `)
        .eq('following_id', currentUser.id);

      if (error) throw error;

      // 3. Filter to ONLY show followers whom you have NOT followed back yet (Pending Requests)
      const pending = (incomingFollowers || [])
        .filter(item => item.follower && !followingIds.has(item.follower.id))
        .map(item => ({
          id: item.id,
          user: item.follower,
          time: new Date(item.created_at).toLocaleDateString(),
        }));

      setRequestsList(pending);
    } catch (err) {
      console.warn('Error fetching message requests:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAndFollowBack = async (targetUser) => {
    if (!targetUser || !currentUser?.id) return;

    try {
      // 1. Follow them back in Supabase
      const { error } = await supabase
        .from('followers')
        .insert([{ follower_id: currentUser.id, following_id: targetUser.id }]);

      if (error) throw error;

      Alert.alert('Request Accepted 🤝', `You are now following ${targetUser.full_name || 'this user'} back. Chat unlocked!`);
      
      // 2. Remove from requests list
      setRequestsList(prev => prev.filter(req => req.user.id !== targetUser.id));

      // 3. Navigate directly to their unique chatroom
      const sortedIds = [currentUser.id, targetUser.id].sort();
      const standardizedRoomId = `room_${sortedIds[0]}_${sortedIds[1]}`;

      navigation.navigate('ChatRoom', {
        recipientId: targetUser.id,
        recipientName: targetUser.full_name || 'Peer',
        recipientHandle: targetUser.username || '@user',
        recipientAvatar: targetUser.avatar_url,
        id: standardizedRoomId,
      });
    } catch (e) {
      Alert.alert('Action Failed ❌', e.message);
    }
  };

  const handleDeleteRequest = async (targetUser) => {
    if (!targetUser || !currentUser?.id) return;

    try {
      // Remove their follow relationship so they can no longer ping or message you
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', targetUser.id)
        .eq('following_id', currentUser.id);

      if (error) throw error;

      setRequestsList(prev => prev.filter(req => req.user.id !== targetUser.id));
      Alert.alert('Request Cleared 🗑️', 'The message request has been removed.');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, isDarkMode && styles.darkContainer]}>
        <ActivityIndicator size="large" color="#3182ce" />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.headerCard, isDarkMode && styles.darkCard]}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>📥 Message Requests Inbox</Text>
        <Text style={styles.subtitle}>Messages from users you haven't followed back yet are filtered here for privacy.</Text>
      </View>

      <FlatList
        data={requestsList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={[styles.requestCard, isDarkMode && styles.darkCard]}>
            {item.user?.avatar_url ? (
              <Image source={{ uri: item.user.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
                  {item.user?.full_name ? item.user.full_name[0].toUpperCase() : 'U'}
                </Text>
              </View>
            )}

            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <Text style={[styles.userName, isDarkMode && styles.darkText]} numberOfLines={1}>
                {item.user?.full_name || 'Anonymous Creator'}
              </Text>
              <Text style={{ fontSize: 11, color: '#3182ce' }}>{item.user?.username || '@user'}</Text>
              <Text style={{ fontSize: 10, color: '#718096', marginTop: 2 }}>Wants to send you a direct message.</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TouchableOpacity 
                style={styles.acceptBtn}
                onPress={() => handleAcceptAndFollowBack(item.user)}
              >
                <Ionicons name="checkmark" size={14} color="#fff" />
                <Text style={styles.btnText}>Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.deleteBtn}
                onPress={() => handleDeleteRequest(item.user)}
              >
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Ionicons name="mail-open-outline" size={48} color="#a0aec0" />
            <Text style={{ fontSize: 13, color: '#718096', marginTop: 10 }}>No pending message requests.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  title: { fontSize: 15, fontWeight: 'bold', color: '#2d3748' },
  subtitle: { fontSize: 11, color: '#718096', marginTop: 2 },
  darkText: { color: '#fff' },
  requestCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 40, height: 40, borderRadius: 20 },
  userName: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  acceptBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#38a169', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, gap: 4 },
  deleteBtn: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e53e3e', width: 30, height: 30, borderRadius: 6 },
  btnText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});