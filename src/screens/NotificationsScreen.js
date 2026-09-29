import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { supabase } from '../../Services/supabaseClient';

export default function NotificationsScreen({ isDarkMode, coins, setCoins, currentUser, navigation, onUnreadCountChange }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [liveAlerts, setLiveAlerts] = useState(true);
  const [walletAlerts, setWalletAlerts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [notificationsList, setNotificationsList] = useState([]);
  const [followingMap, setFollowingMap] = useState({});

  // DND & Quiet Hours Preferences
  const [dndModeActive, setDndModeActive] = useState(false);
  const [dndScheduleTime, setDndScheduleTime] = useState('10:00 PM - 06:00 AM');

  useEffect(() => {
    if (currentUser?.id) {
      fetchActivityNotifications();

      // Realtime listener for incoming activity & admin notifications
      const channel = supabase
        .channel('public:user_notifications_all')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
          if (payload.new && payload.new.recipient_id === currentUser.id) {
            fetchActivityNotifications();
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchActivityNotifications = async () => {
    if (!currentUser?.id) return;
    try {
      let formattedViews = [];
      let formattedFollows = [];
      let formattedGeneralNotifs = [];

      // 1. Fetch who current user is following
      const { data: myFollows } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', currentUser.id);

      const currentFollowingSet = {};
      (myFollows || []).forEach(f => {
        currentFollowingSet[f.following_id] = true;
      });
      setFollowingMap(currentFollowingSet);

      // 2. Fetch real profile visits
      try {
        const { data: viewsData } = await supabase
          .from('profile_views')
          .select(`
            id,
            visited_at,
            is_read,
            visitor:profiles!profile_views_visitor_id_fkey(id, full_name, handle, avatar_url, creator_role)
          `)
          .eq('profile_id', currentUser.id)
          .order('visited_at', { ascending: false })
          .limit(15);

        if (viewsData) {
          formattedViews = viewsData.map(item => ({
            id: `view_${item.id}`,
            rawId: item.id,
            sourceTable: 'profile_views',
            type: 'profile_view',
            user: item.visitor,
            title: '👀 Profile Visit',
            desc: `${item.visitor?.full_name || 'Someone'} viewed your profile.`,
            time: new Date(item.visited_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: item.visited_at,
            unread: item.is_read === false ? true : false,
          }));
        }
      } catch (e) {}

      // 3. Fetch real followers
      try {
        const { data: followsData } = await supabase
          .from('followers')
          .select(`
            id,
            created_at,
            is_read,
            follower:profiles!followers_follower_id_fkey(id, full_name, handle, avatar_url, creator_role)
          `)
          .eq('following_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(15);

        if (followsData) {
          formattedFollows = followsData.map(item => ({
            id: `follow_${item.id}`,
            rawId: item.id,
            sourceTable: 'followers',
            type: 'new_follower',
            user: item.follower,
            title: '🤝 New Follower',
            desc: `${item.follower?.full_name || 'Someone'} started following you.`,
            time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: item.created_at,
            unread: item.is_read === false ? true : false,
          }));
        }
      } catch (e) {}

      // 4. Fetch incoming direct notifications & Admin Feedback Replies strictly filtered by recipient_id
      try {
        const { data: notifData, error: notifError } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (!notifError && notifData) {
          formattedGeneralNotifs = notifData.map(item => ({
            id: `notif_${item.id}`,
            rawId: item.id,
            sourceTable: 'notifications',
            type: item.type || 'admin_response',
            user: null,
            title: item.actor_name ? `💬 Reply from ${item.actor_name}` : (item.title || 'Notification 🔔'),
            desc: item.message || item.body || '',
            time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: item.created_at,
            unread: item.is_read === false ? true : false,
          }));
        }
      } catch (e) {
        console.warn('Notifications fetch warning:', e.message);
      }

      // Combine and sort
      const combined = [...formattedViews, ...formattedFollows, ...formattedGeneralNotifs].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setNotificationsList(combined);

      // Calculate unread count and update parent tab badge immediately
      const unreadCount = combined.filter(n => n.unread).length;
      if (onUnreadCountChange) {
        onUnreadCountChange(unreadCount);
      }

    } catch (err) {
      console.warn('Error fetching notifications:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivityNotifications();
  };

  // 🌟 MARK INDIVIDUAL NOTIFICATION AS READ UPON TAPPING
  const handleOpenNotification = async (item) => {
    setNotificationsList(prev => {
      const updated = prev.map(n => n.id === item.id ? { ...n, unread: false } : n);
      const unreadCount = updated.filter(n => n.unread).length;
      if (onUnreadCountChange) onUnreadCountChange(unreadCount);
      return updated;
    });

    try {
      if (item.sourceTable === 'notifications') {
        await supabase.from('notifications').update({ is_read: true }).eq('id', item.rawId);
      } else if (item.sourceTable === 'profile_views') {
        await supabase.from('profile_views').update({ is_read: true }).eq('id', item.rawId);
      } else if (item.sourceTable === 'followers') {
        await supabase.from('followers').update({ is_read: true }).eq('id', item.rawId);
      }
    } catch (e) {
      console.log('Error updating notification read state in DB:', e);
    }
  };

  const handleFollowBack = async (targetUser) => {
    if (!targetUser || !currentUser?.id) return;
    const isAlreadyFollowing = followingMap[targetUser.id];

    try {
      if (isAlreadyFollowing) {
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', targetUser.id);

        setFollowingMap(prev => ({ ...prev, [targetUser.id]: false }));
        Alert.alert('Unfollowed ℹ️', `You are no longer following ${targetUser.full_name || 'this user'}.`);
      } else {
        await supabase
          .from('followers')
          .insert([{ follower_id: currentUser.id, following_id: targetUser.id }]);

        await supabase.from('notifications').insert([
          {
            recipient_id: targetUser.id,
            actor_name: currentUser?.user_metadata?.full_name || 'Peer',
            message: `${currentUser?.user_metadata?.full_name || 'A peer'} followed you back!`,
            created_at: new Date().toISOString()
          }
        ]);

        setFollowingMap(prev => ({ ...prev, [targetUser.id]: true }));
        Alert.alert('Connected 🤝', `You are now following ${targetUser.full_name || 'this user'} back!`);
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDismissNotification = (notifId) => {
    setNotificationsList(prev => {
      const updated = prev.filter(item => item.id !== notifId);
      const unreadCount = updated.filter(n => n.unread).length;
      if (onUnreadCountChange) onUnreadCountChange(unreadCount);
      return updated;
    });
  };

  const handleMarkAllAsRead = async () => {
    setNotificationsList(prev => prev.map(item => ({ ...item, unread: false })));
    if (onUnreadCountChange) onUnreadCountChange(0);

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', currentUser.id);

      await supabase
        .from('profile_views')
        .update({ is_read: true })
        .eq('profile_id', currentUser.id);

      await supabase
        .from('followers')
        .update({ is_read: true })
        .eq('following_id', currentUser.id);
    } catch (e) {}

    Alert.alert('Inbox Updated 📬', 'All notifications marked as read.');
  };

  const handleClearAllHistory = () => {
    setNotificationsList([]);
    if (onUnreadCountChange) onUnreadCountChange(0);
    Alert.alert('History Cleared 🗑️', 'All activity logs have been successfully scrubbed.');
  };

  const handleOpenUserChat = (user) => {
    if (!user || !navigation) return;
    const isFollowingBack = followingMap[user.id];

    if (!isFollowingBack) {
      Alert.alert(
        '🔒 Message Requests Restricted',
        `${user.full_name || 'This user'} is following you, but you have not followed them back yet.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Follow Back Now ➕', onPress: () => handleFollowBack(user) }
        ]
      );
      return;
    }

    const sortedIds = [currentUser.id, user.id].sort();
    const standardizedRoomId = `${sortedIds[0]}_chat_room_${sortedIds[1]}`;

    navigation.navigate('ChatRoom', {
      recipientId: user.id,
      recipientName: user.full_name || 'Peer',
      recipientHandle: user.handle || '@user',
      recipientAvatar: user.full_name ? user.full_name[0].toUpperCase() : 'U',
      avatarUrl: user.avatar_url,
      id: standardizedRoomId,
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.centerContainer, isDarkMode && styles.darkContainer]}>
        <ActivityIndicator size="large" color="#3182ce" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, isDarkMode && styles.darkContainer]} 
      contentContainerStyle={{ paddingBottom: 40, padding: 12 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3182ce" />}
    >
      <View style={[styles.headerCard, isDarkMode && styles.darkCard]}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>🔔 Notifications & Profile Hub</Text>
        <Text style={styles.subtitle}>Real-time admin feedback responses, profile visits, and follower alerts.</Text>
      </View>

      {/* QUIET HOURS & DND */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 1.5 }]}>
        <View style={styles.settingRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 2 }]}>🌙 Quiet Hours & DND Scheduler</Text>
            <Text style={{ fontSize: 11, color: isDarkMode ? '#94a3b8' : '#718096' }}>Automatically suppress non-urgent notification pings during night hours ({dndScheduleTime}).</Text>
          </View>
          <Switch 
            value={dndModeActive} 
            onValueChange={(val) => {
              setDndModeActive(val);
              Alert.alert('Quiet Hours', val ? '🌙 DND mode active.' : 'DND mode disabled.');
            }} 
            trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
          />
        </View>
      </View>

      {/* NOTIFICATION PREFERENCES */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>⚙️ Standard Notification Preferences</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Push Notifications</Text>
          <Switch value={pushEnabled} onValueChange={setPushEnabled} />
        </View>
        <View style={styles.settingRow}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Live Stream Alerts</Text>
          <Switch value={liveAlerts} onValueChange={setLiveAlerts} />
        </View>
        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Wallet & Super-Gift Pings</Text>
          <Switch value={walletAlerts} onValueChange={setWalletAlerts} />
        </View>
      </View>

      {/* REAL ACTIVITY STREAM */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 0 }]}>📋 Activity Log ({notificationsList.length})</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity onPress={handleMarkAllAsRead}>
              <Text style={{ fontSize: 11, color: '#3182ce', fontWeight: 'bold' }}>Mark Read ✓</Text>
            </TouchableOpacity>
            <Text style={{ color: '#cbd5e0' }}>•</Text>
            <TouchableOpacity onPress={handleClearAllHistory}>
              <Text style={{ fontSize: 11, color: '#e53e3e', fontWeight: 'bold' }}>Clear All 🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {notificationsList.length > 0 ? (
          notificationsList.map(item => {
            const isFollowing = item.user ? followingMap[item.user.id] : false;

            return (
              <View 
                key={item.id} 
                style={[styles.notifItem, item.unread && styles.unreadItem, isDarkMode && styles.darkNotifItem]}
              >
                {/* Independent tappable area to open / mark read */}
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                  activeOpacity={0.8}
                  onPress={() => handleOpenNotification(item)}
                >
                  {/* PROFILE AVATAR OR INITIALS */}
                  {item.user?.avatar_url ? (
                    <Image source={{ uri: item.user.avatar_url }} style={styles.avatarImage} cachePolicy="disk" />
                  ) : (
                    <View style={[styles.avatarCircle, item.type === 'admin_response' && { backgroundColor: '#2b6cb0' }]}>
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>
                        {item.user?.full_name ? item.user.full_name[0].toUpperCase() : (item.type === 'admin_response' ? '🛡️' : '❤️')}
                      </Text>
                    </View>
                  )}

                  <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={[styles.notifTitle, isDarkMode && styles.darkText]} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.notifTime}>{item.time}</Text>
                    </View>
                    <Text style={[styles.notifDesc, isDarkMode && { color: '#cbd5e0' }]} numberOfLines={3}>{item.desc}</Text>
                  </View>
                </TouchableOpacity>

                {/* ACTION BUTTONS (Isolated outside main text click) */}
                {item.user ? (
                  <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginLeft: 4 }}>
                    <TouchableOpacity 
                      style={[styles.smallBtn, isFollowing ? { backgroundColor: '#4a5568' } : { backgroundColor: '#3182ce' }]}
                      onPress={() => handleFollowBack(item.user)}
                    >
                      <Ionicons name={isFollowing ? "checkmark" : "person-add"} size={12} color="#fff" />
                      <Text style={styles.smallBtnText}>{isFollowing ? 'Following' : 'Follow Back'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.smallBtnIconOnly, { backgroundColor: '#38a169' }]}
                      onPress={() => handleOpenUserChat(item.user)}
                    >
                      <Ionicons name="chatbubble" size={12} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.smallBtnIconOnly, { backgroundColor: '#e53e3e' }]}
                      onPress={() => handleDismissNotification(item.id)}
                    >
                      <Ionicons name="close" size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={[styles.smallBtnIconOnly, { backgroundColor: '#cbd5e0', marginLeft: 6 }]}
                    onPress={() => handleDismissNotification(item.id)}
                  >
                    <Ionicons name="trash-outline" size={12} color="#4a5568" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        ) : (
          <Text style={{ fontSize: 11, color: isDarkMode ? '#94a3b8' : '#718096', textAlign: 'center', padding: 20, fontStyle: 'italic' }}>No admin feedback replies, likes, or follower alerts recorded yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  darkCard: { backgroundColor: '#2d3748' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  subtitle: { fontSize: 11, color: '#718096' },
  darkText: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748', marginBottom: 8 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  settingText: { fontSize: 12, color: '#2d3748' },
  notifItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f7fafc', padding: 8, borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  darkNotifItem: { backgroundColor: '#1a202c', borderColor: '#4a5568' },
  unreadItem: { borderLeftWidth: 4, borderLeftColor: '#3182ce' },
  avatarCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 34, height: 34, borderRadius: 17 },
  notifTitle: { fontSize: 11, fontWeight: 'bold', color: '#2d3748', maxWidth: 120 },
  notifTime: { fontSize: 9, color: '#718096' },
  notifDesc: { fontSize: 10, color: '#4a5568', marginTop: 2, maxWidth: 130 },
  smallBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 5, borderRadius: 6, gap: 2 },
  smallBtnIconOnly: { width: 26, height: 26, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  smallBtnText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
});