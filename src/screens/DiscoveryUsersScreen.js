import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { supabase } from '../../Services/supabaseClient';

export default function DiscoveryUsersScreen({ isDarkMode, navigation, currentUser }) {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  
  const [friendIds, setFriendIds] = useState(new Set());
  const [incomingFollowerIds, setIncomingFollowerIds] = useState(new Set());
  const [incomingFollowerCount, setIncomingFollowerCount] = useState(0);
  const [showOnlyNew, setShowOnlyNew] = useState(false);

  // Creator profile uploads & likes state
  const [userUploads, setUserUploads] = useState([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [loadingUploads, setLoadingUploads] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      fetchRegisteredUsersAndFollows();
    }
  }, [currentUser]);

  const fetchRegisteredUsersAndFollows = async () => {
    try {
      setLoading(true);

      // 1. Fetch all profiles except current user
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });

      if (profilesError) throw profilesError;

      // 2. Fetch users that current user is following
      const { data: followsData, error: followsError } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', currentUser.id);

      if (followsError) throw followsError;

      const followingSet = new Set(followsData?.map(f => f.following_id) || []);
      setFriendIds(followingSet);

      // 3. Fetch users who are following current user (incoming requests/followers)
      const { data: incomingData, error: incomingError } = await supabase
        .from('followers')
        .select('follower_id')
        .eq('following_id', currentUser.id);

      if (!incomingError && incomingData) {
        setIncomingFollowerIds(new Set(incomingData.map(f => f.follower_id)));
        setIncomingFollowerCount(incomingData.length);
      }

      const otherUsers = profilesData?.filter(u => u.id !== currentUser?.id) || [];
      setUsersList(otherUsers);
    } catch (err) {
      console.warn('Error fetching users:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfile = async (user) => {
    setSelectedUser(user);
    setProfileModalVisible(true);
    fetchUserUploadsAndLikes(user.id);

    if (currentUser?.id && user.id !== currentUser.id) {
      try {
        await supabase.from('profile_views').insert([
          { profile_id: user.id, visitor_id: currentUser.id }
        ]);
      } catch (e) {
        console.warn('Could not log profile view:', e.message);
      }
    }
  };

  const fetchUserUploadsAndLikes = async (userId) => {
    try {
      setLoadingUploads(true);
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUserUploads(data);
        const sumLikes = data.reduce((acc, curr) => acc + (curr.likes_count || curr.likes || 0), 0);
        setTotalLikes(sumLikes);
      } else {
        setUserUploads([]);
        setTotalLikes(0);
      }
    } catch (err) {
      setUserUploads([]);
      setTotalLikes(0);
    } finally {
      setLoadingUploads(false);
    }
  };

  const handleToggleFollow = async (targetUser) => {
    const target = targetUser || selectedUser;
    if (!target || !currentUser?.id) return;

    const isCurrentlyFollowing = friendIds.has(target.id);
    const senderName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'A user';

    try {
      // 🛡️ Safeguard: Ensure current user profile row exists to prevent foreign key errors
      await supabase.from('profiles').upsert({
        id: currentUser.id,
        username: currentUser.user_metadata?.handle || `@${currentUser.email?.split('@')[0] || 'user'}`,
        full_name: senderName,
        avatar_url: currentUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      }, { onConflict: 'id' });

      if (isCurrentlyFollowing) {
        // Unfollow / Remove Friend
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', target.id);

        if (error) throw error;

        setFriendIds(prev => {
          const next = new Set(prev);
          next.delete(target.id);
          return next;
        });

        if (selectedUser?.id === target.id) {
          setSelectedUser(prev => ({ ...prev, followers_count: Math.max(0, (prev.followers_count || 1) - 1) }));
        }

        Alert.alert('Unfollowed ℹ️', `You are no longer following ${target.full_name || target.username || 'this user'}.`);
      } else {
        // Follow / Add Friend
        const { error } = await supabase
          .from('followers')
          .insert([
            { follower_id: currentUser.id, following_id: target.id }
          ]);

        if (error) throw error;

        // INSERT FOLLOW NOTIFICATION for recipient
        await supabase.from('notifications').insert([
          {
            recipient_id: target.id,
            sender_id: currentUser.id,
            title: 'New Follower 👤',
            body: `${senderName} started following you!`,
            type: 'follow',
            is_read: false,
            created_at: new Date().toISOString()
          }
        ]);

        setFriendIds(prev => {
          const next = new Set(prev);
          next.add(target.id);
          return next;
        });

        if (selectedUser?.id === target.id) {
          setSelectedUser(prev => ({ ...prev, followers_count: (prev.followers_count || 0) + 1 }));
        }

        Alert.alert('Friend Added 🤝', `You are now following ${target.full_name || target.username || 'this user'}.`);
      }
    } catch (err) {
      console.warn('Error updating follow status:', err.message);
      Alert.alert('Action Failed ❌', err.message);
    }
  };

  const handleStartChat = (user) => {
    setProfileModalVisible(false);
    
    // Standardized unique room ID specific to this pairing
    const sortedIds = [currentUser.id, user.id].sort();
    const standardizedRoomId = `room_${sortedIds[0]}_${sortedIds[1]}`;

    navigation.navigate('ChatRoom', {
      recipientId: user.id,
      recipientName: user.full_name || user.username || user.email?.split('@')[0] || 'Peer',
      recipientHandle: user.handle || `@${(user.username || 'user').toLowerCase()}`,
      recipientAvatar: user.full_name ? user.full_name[0].toUpperCase() : 'U',
      avatarUrl: user.avatar_url,
      id: standardizedRoomId,
    });
  };

  const displayedUsers = usersList.filter(u => {
    if (showOnlyNew && friendIds.has(u.id)) return false;
    return true;
  });

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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>🔍 Discover Registered Peers</Text>
          <TouchableOpacity 
            style={{ backgroundColor: showOnlyNew ? '#3182ce' : '#e2e8f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
            onPress={() => setShowOnlyNew(!showOnlyNew)}
          >
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: showOnlyNew ? '#fff' : '#4a5568' }}>
              {showOnlyNew ? 'Showing New Only' : 'Filter Added'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 🚀 Incoming Follower Count Notification Banner */}
        {incomingFollowerCount > 0 && (
          <View style={{ marginTop: 8, backgroundColor: '#feebc8', padding: 8, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#fbd38d' }}>
            <Text style={{ fontSize: 11, color: '#9c4221', fontWeight: 'bold' }}>
              🎉 {incomingFollowerCount} user{incomingFollowerCount > 1 ? 's' : ''} started following you!
            </Text>
            <TouchableOpacity onPress={() => setShowOnlyNew(false)}>
              <Text style={{ fontSize: 10, color: '#2b6cb0', fontWeight: 'bold' }}>View List ›</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={{ fontSize: 11, color: '#718096', marginTop: 6 }}>
          Tap any user card to inspect their profile, follow back, or chat directly.
        </Text>
      </View>

      <FlatList
        data={displayedUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => {
          const isAdded = friendIds.has(item.id);
          const isFollowingMe = incomingFollowerIds.has(item.id);
          const displayName = item.full_name || item.username || 'Anonymous User';

          return (
            <TouchableOpacity 
              style={[styles.userCard, isDarkMode && styles.darkCard]}
              onPress={() => handleOpenProfile(item)}
            >
              {item.avatar_url ? (
                <Image source={{ uri: item.avatar_url }} style={{ width: 42, height: 42, borderRadius: 21 }} cachePolicy="disk" />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                    {displayName[0].toUpperCase()}
                  </Text>
                </View>
              )}

              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.userName, isDarkMode && styles.darkText]} numberOfLines={1}>
                    {displayName}
                  </Text>
                  {isAdded && (
                    <View style={{ backgroundColor: '#c6f6d5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                      <Text style={{ fontSize: 9, color: '#22543d', fontWeight: 'bold' }}>Following ✓</Text>
                    </View>
                  )}
                  {!isAdded && isFollowingMe && (
                    <View style={{ backgroundColor: '#feebc8', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                      <Text style={{ fontSize: 9, color: '#9c4221', fontWeight: 'bold' }}>Follows You</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 11, color: '#3182ce' }}>{item.handle || `@${displayName.toLowerCase().replace(/\s+/g, '')}`}</Text>
                <Text style={{ fontSize: 10, color: '#718096', marginTop: 2 }}>
                  📍 {item.country || 'Uganda'} • 📡 {item.creator_role || 'Member'}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity 
                  style={[styles.addBtnSmall, isAdded ? { backgroundColor: '#4a5568' } : { backgroundColor: '#3182ce' }]}
                  onPress={() => handleToggleFollow(item)}
                >
                  <Ionicons name={isAdded ? "checkmark" : (isFollowingMe ? "return-down-back" : "person-add")} size={14} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.chatBtn} 
                  onPress={() => handleStartChat(item)}
                >
                  <Ionicons name="chatbubble-outline" size={14} color="#fff" />
                  <Text style={styles.chatBtnText}>Chat</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ fontSize: 13, color: '#718096' }}>No other registered users found.</Text>
          </View>
        }
      />

      {/* USER PROFILE MODAL */}
      <Modal visible={profileModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkContainer]}>
            {selectedUser && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ alignItems: 'center', marginBottom: 15 }}>
                  {selectedUser.avatar_url ? (
                    <Image source={{ uri: selectedUser.avatar_url }} style={{ width: 70, height: 70, borderRadius: 35 }} cachePolicy="disk" />
                  ) : (
                    <View style={[styles.avatarCircle, { width: 70, height: 70, borderRadius: 35 }]}>
                      <Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold' }}>
                        {(selectedUser.full_name || selectedUser.username || 'U')[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.modalName, isDarkMode && styles.darkText]}>
                    {selectedUser.full_name || selectedUser.username || 'User Profile'}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#3182ce', fontWeight: '600' }}>
                    {selectedUser.handle || `@${(selectedUser.username || 'user').toLowerCase()}`}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>
                    {selectedUser.creator_role || 'Creator'}
                  </Text>
                </View>

                {/* Stats Row */}
                <View style={[styles.statsRow, isDarkMode && styles.darkCard]}>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={[styles.statNum, isDarkMode && styles.darkText]}>
                      {selectedUser.followers_count || (friendIds.has(selectedUser.id) ? 1 : 0)}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#718096' }}>Followers</Text>
                  </View>
                  <View style={{ alignItems: 'center', flex: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#e2e8f0' }}>
                    <Text style={[styles.statNum, isDarkMode && styles.darkText]}>
                      {totalLikes} 💛
                    </Text>
                    <Text style={{ fontSize: 10, color: '#718096' }}>Total Likes</Text>
                  </View>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={[styles.statNum, isDarkMode && styles.darkText]}>
                      {userUploads.length} 🎬
                    </Text>
                    <Text style={{ fontSize: 10, color: '#718096' }}>Uploads</Text>
                  </View>
                </View>

                {/* Bio / Details */}
                <View style={[styles.infoBox, isDarkMode && styles.darkCard]}>
                  <Text style={[styles.infoTitle, isDarkMode && styles.darkText]}>Bio & Channel Description</Text>
                  <Text style={{ fontSize: 12, color: isDarkMode ? '#cbd5e0' : '#4a5568', lineHeight: 16 }}>
                    {selectedUser.bio || 'No bio provided yet.'}
                  </Text>

                  <Text style={[styles.infoTitle, isDarkMode && styles.darkText, { marginTop: 12 }]}>Hobbies & Interests</Text>
                  <Text style={{ fontSize: 12, color: isDarkMode ? '#cbd5e0' : '#4a5568' }}>
                    {selectedUser.hobbies || 'Not specified'}
                  </Text>
                </View>

                {/* Creator Videos & Reels Upload Feed */}
                <View style={{ marginTop: 15 }}>
                  <Text style={[styles.infoTitle, isDarkMode && styles.darkText, { marginBottom: 8 }]}>🎬 Creator Uploads & Video Views</Text>
                  {loadingUploads ? (
                    <ActivityIndicator size="small" color="#3182ce" style={{ marginVertical: 10 }} />
                  ) : userUploads.length > 0 ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {userUploads.map((vid, idx) => (
                        <View key={vid.id || idx} style={[styles.videoThumbnailCard, isDarkMode && styles.darkCard]}>
                          <View style={{ height: 90, backgroundColor: '#2d3748', justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="play-circle" size={32} color="#fff" />
                          </View>
                          <View style={{ padding: 6 }}>
                            <Text style={{ fontSize: 11, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }} numberOfLines={1}>
                              {vid.title || vid.caption || 'Creator Video'}
                            </Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                              <Text style={{ fontSize: 9, color: '#718096' }}>👁️ {vid.views_count || vid.views || 0}</Text>
                              <Text style={{ fontSize: 9, color: '#e53e3e' }}>❤️ {vid.likes_count || vid.likes || 0}</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={{ fontSize: 11, color: '#718096', fontStyle: 'italic', marginBottom: 10 }}>No video uploads posted yet.</Text>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
                  <TouchableOpacity 
                    style={[styles.modalActionBtn, { backgroundColor: friendIds.has(selectedUser.id) ? '#4a5568' : '#3182ce' }]} 
                    onPress={() => handleToggleFollow(null)}
                  >
                    <Ionicons name={friendIds.has(selectedUser.id) ? "checkmark-circle" : "person-add"} size={16} color="#fff" />
                    <Text style={styles.modalBtnText}>{friendIds.has(selectedUser.id) ? 'Following ✅' : (incomingFollowerIds.has(selectedUser.id) ? 'Follow Back ➕' : 'Follow ➕')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.modalActionBtn, { backgroundColor: '#38a169' }]} 
                    onPress={() => handleStartChat(selectedUser)}
                  >
                    <Ionicons name="chatbubble" size={16} color="#fff" />
                    <Text style={styles.modalBtnText}>Direct Chat 💬</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={styles.closeModalBtn} 
                  onPress={() => setProfileModalVisible(false)}
                >
                  <Text style={{ color: '#718096', fontWeight: 'bold', fontSize: 12 }}>Close Profile</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  headerTitle: { fontSize: 15, fontWeight: 'bold', color: '#2d3748', marginBottom: 2 },
  darkText: { color: '#fff' },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  avatarCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 13, fontWeight: 'bold', color: '#2d3748', maxWidth: 120 },
  addBtnSmall: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginRight: 4 },
  chatBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#38a169', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, gap: 4 },
  chatBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalName: { fontSize: 18, fontWeight: 'bold', color: '#2d3748', marginTop: 8 },
  statsRow: { flexDirection: 'row', backgroundColor: '#f7fafc', borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  statNum: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  infoBox: { backgroundColor: '#f7fafc', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  infoTitle: { fontSize: 11, fontWeight: 'bold', color: '#718096', marginBottom: 4 },
  videoThumbnailCard: { width: '48%', backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 8 },
  modalActionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 10, gap: 6 },
  modalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  closeModalBtn: { alignItems: 'center', marginTop: 15, padding: 8 },
});