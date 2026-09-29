import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../Services/supabaseClient';

export default function ConversationsListScreen({ currentUser, onSelectConversation, isDarkMode, navigation }) {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Status / Story State
  const [myStatus, setMyStatus] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [myProfilePhoto, setMyProfilePhoto] = useState(null);

  // Logged-in User Info
  const myUserId = currentUser?.id || '';
  const myEmail = currentUser?.email || '';
  const myUsername = myEmail ? myEmail.split('@')[0] : (currentUser?.user_metadata?.full_name || 'My Profile');

  const isMe = (identifier) => {
    if (!identifier) return false;
    const clean = String(identifier).toLowerCase().trim();
    return (
      (myUserId && clean.includes(String(myUserId).toLowerCase())) ||
      (myEmail && clean.includes(String(myEmail).toLowerCase())) ||
      (myUsername && clean.includes(String(myUsername).toLowerCase())) ||
      clean === 'borris' ||
      clean === 'borrisahabwamukama'
    );
  };

  const getOtherParticipantId = (roomId, msg) => {
    if (!roomId) return null;
    
    // If msg provides a direct recipient_id that isn't me, use it!
    if (msg?.recipient_id && !isMe(msg.recipient_id)) {
      return msg.recipient_id;
    }

    const parts = roomId.split(/_chat_room_|_private_room_|_private_workspace_/);
    if (parts.length >= 2) {
      const p1 = parts[0].trim();
      const p2 = parts[1].trim();
      if (!isMe(p1)) return p1;
      if (!isMe(p2)) return p2;
    }

    const genericParts = roomId.split('_');
    const other = genericParts.find((p) => p && !isMe(p) && p !== 'chat' && p !== 'room' && p !== 'private' && p !== 'workspace');
    if (other) return other;

    // Fallback: if I am the sender, return recipient_id or msg.sender
    if (msg) {
      const senderVal = msg.sender_id || msg.sender;
      if (isMe(senderVal)) {
        return msg.recipient_id || null;
      } else {
        return senderVal;
      }
    }

    return null;
  };

  useEffect(() => {
    fetchMyProfilePhoto();
    fetchConversations();

    const channel = supabase
      .channel('inbox_realtime_v2')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myUserId, myEmail]);

  // Fetch logged-in user's profile photo from Supabase 'profiles' table
  const fetchMyProfilePhoto = async () => {
    if (!myUserId) return;
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url, username, full_name')
      .eq('id', myUserId)
      .maybeSingle();

    if (data?.avatar_url) {
      setMyProfilePhoto(data.avatar_url);
    } else if (currentUser?.user_metadata?.avatar_url) {
      setMyProfilePhoto(currentUser.user_metadata.avatar_url);
    }
  };

  const fetchConversations = async () => {
    setLoading(true);
    
    let query = supabase.from('messages').select('*');
    if (myUserId || myEmail) {
      query = query.or(`room_id.ilike.%${myUserId}%,room_id.ilike.%${myEmail}%,sender_id.eq.${myUserId},recipient_id.eq.${myUserId}`);
    }

    const { data: msgData, error } = await query.order('created_at', { ascending: false });

    if (!error && msgData) {
      const recipientMap = {};
      const userIdsToFetch = new Set();

      msgData.forEach((msg) => {
        const roomId = msg.room_id || '';
        const otherId = getOtherParticipantId(roomId, msg);

        if (!otherId || isMe(otherId)) {
          return;
        }

        const isUnread = !isMe(msg.sender_id) && !isMe(msg.sender) && msg.is_read === false;
        const msgTime = msg.created_at ? new Date(msg.created_at).getTime() : Date.now();

        if (!recipientMap[otherId]) {
          if (otherId.length > 5) {
            userIdsToFetch.add(otherId);
          }

          let initialName = otherId;
          if (initialName.includes('@')) {
            initialName = initialName.split('@')[0];
          }

          recipientMap[otherId] = {
            id: roomId,
            recipientId: otherId,
            recipientName: initialName,
            recipientHandle: `@${initialName.slice(0, 8)}`,
            recipientAvatar: initialName[0] ? initialName[0].toUpperCase() : 'U',
            avatarUrl: null, 
            lastMessage: msg.text || msg.content || 'Attachment',
            rawTimestamp: msgTime,
            lastTime: msg.created_at
              ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Recent',
            unreadCount: isUnread ? 1 : 0,
          };
        } else {
          // Keep the newest message (since data is sorted descending, first encountered is latest)
          if (msgTime > recipientMap[otherId].rawTimestamp) {
            recipientMap[otherId].lastMessage = msg.text || msg.content || 'Attachment';
            recipientMap[otherId].rawTimestamp = msgTime;
            recipientMap[otherId].lastTime = msg.created_at
              ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Recent';
          }
          if (isUnread) {
            recipientMap[otherId].unreadCount += 1;
          }
        }
      });

      // Batch fetch avatar photos and profile details for all participants
      if (userIdsToFetch.size > 0 || Object.keys(recipientMap).length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url');

        if (profileData && profileData.length > 0) {
          profileData.forEach((p) => {
            Object.keys(recipientMap).forEach((otherKey) => {
              const item = recipientMap[otherKey];
              const matchesId = p.id === item.recipientId || p.id === otherKey;
              const matchesName = (p.username && p.username.toLowerCase() === item.recipientName.toLowerCase()) ||
                                  (p.full_name && p.full_name.toLowerCase() === item.recipientName.toLowerCase());

              if (matchesId || matchesName) {
                const cleanName = p.username || p.full_name || item.recipientName;
                item.recipientName = cleanName;
                item.recipientHandle = `@${cleanName.toLowerCase().replace(/\s+/g, '')}`;
                item.recipientAvatar = cleanName[0] ? cleanName[0].toUpperCase() : 'U';
                if (p.avatar_url) {
                  item.avatarUrl = p.avatar_url;
                }
              }
            });
          });
        }
      }

      // Sort chats so the user who was just messaged floats straight to the TOP
      const sortedConversations = Object.values(recipientMap).sort((a, b) => b.rawTimestamp - a.rawTimestamp);

      setConversations(sortedConversations);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const handleAddStatus = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Gallery access is needed to post status updates.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setMyStatus({
          uri: result.assets[0].uri,
          createdAt: new Date().toISOString(),
        });
        Alert.alert('Status Posted 🌟', 'Your 24-hour status update is now live for your contacts.');
      }
    } catch (err) {
      console.error('Status picker error:', err);
    }
  };

  const handleOpenConversation = (item) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.recipientId === item.recipientId || c.id === item.id
          ? { ...c, unreadCount: 0 }
          : c
      )
    );

    const sortedIds = [myUserId, item.recipientId].sort();
    const standardizedRoomId = item.recipientId && item.recipientId.length > 5 && myUserId 
      ? `${sortedIds[0]}_chat_room_${sortedIds[1]}` 
      : item.id;

    onSelectConversation({
      ...item,
      id: standardizedRoomId,
      recipientId: item.recipientId,
      recipientName: item.recipientName,
      recipientHandle: item.recipientHandle,
      recipientAvatar: item.recipientAvatar,
      recipientAvatarUrl: item.avatarUrl,
    });
  };

  const filteredConversations = conversations.filter(
    (c) =>
      (c.recipientName && c.recipientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Messenger Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Messages</Text>
        <View style={styles.headerIconsRow}>
          <TouchableOpacity 
            style={[styles.headerIconButton, isDarkMode && styles.darkIconButton]}
            onPress={() => navigation?.navigate('Settings')}
          >
            <Text style={{ fontSize: 18 }}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerIconButton, isDarkMode && styles.darkIconButton]}
            onPress={() => navigation?.navigate('DiscoveryUsers')}
          >
            <Text style={{ fontSize: 18 }}>✏️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile & Status Header Bar */}
      <View style={[styles.myStatusSection, isDarkMode && styles.darkHeader]}>
        <View style={styles.myStatusRow}>
          <TouchableOpacity 
            style={styles.myStatusAvatarContainer} 
            onPress={() => {
              if (myStatus) {
                setStatusModalVisible(true);
              } else {
                navigation?.navigate('Profile');
              }
            }}
          >
            {myProfilePhoto ? (
              <Image source={{ uri: myProfilePhoto }} style={styles.myStatusAvatar} cachePolicy="disk" />
            ) : (
              <View style={styles.myStatusAvatarCircle}>
                <Text style={styles.myStatusAvatarText}>{myUsername[0]?.toUpperCase() || 'M'}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.addStatusBadge} onPress={handleAddStatus}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>＋</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity style={styles.myStatusInfo} onPress={() => navigation?.navigate('Profile')}>
            <Text style={[styles.myStatusTitle, isDarkMode && styles.darkText]}>{myUsername} (My Profile)</Text>
            <Text style={styles.myStatusSubtext}>
              {myStatus ? 'Active 24h Story • Tap photo to view' : 'Tap ＋ to post status story or tap text to edit page'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, isDarkMode && styles.darkHeader]}>
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkInput]}
          placeholder="Search Messenger inbox..."
          placeholderTextColor="#a0aec0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item, index) => item.recipientId || item.id || index.toString()}
        contentContainerStyle={{ paddingVertical: 8 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => (
          <View style={[styles.chatRow, isDarkMode && styles.darkChatRow]}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => {
                navigation?.navigate('DiscoveryUsers', { targetUserId: item.recipientId });
              }}
              activeOpacity={0.8}
            >
              {item.avatarUrl ? (
                <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} cachePolicy="disk" />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{item.recipientAvatar}</Text>
                </View>
              )}
              <View style={styles.onlineDot} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chatDetails}
              onPress={() => handleOpenConversation(item)}
              activeOpacity={0.7}
            >
              <View style={styles.chatRowTop}>
                <Text style={[styles.contactName, isDarkMode && styles.darkText]} numberOfLines={1}>
                  {item.recipientName}
                </Text>
                <Text style={[styles.timeText, item.unreadCount > 0 ? { color: '#3182ce', fontWeight: 'bold' } : styles.darkSubText]}>
                  {item.lastTime}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.lastMessageText, item.unreadCount > 0 ? { fontWeight: 'bold', color: isDarkMode ? '#fff' : '#1a202c' } : styles.darkSubText]} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
                {item.unreadCount > 0 && (
                  <View style={styles.unreadBadgePill}>
                    <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>💬</Text>
            <Text style={[styles.emptyText, isDarkMode && styles.darkText]}>
              {loading ? 'Loading conversations...' : 'No conversations found yet.'}
            </Text>
            <Text style={{ fontSize: 12, color: '#a0aec0', marginTop: 4, textAlign: 'center', paddingHorizontal: 40 }}>
              Tap the ✏️ pencil icon to search users and start a chat.
            </Text>
          </View>
        }
      />

      {/* Status Story Modal */}
      <Modal visible={statusModalVisible} transparent={true} animationType="fade">
        <View style={styles.statusOverlay}>
          <TouchableOpacity style={styles.closeStatusBtn} onPress={() => setStatusModalVisible(false)}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>✕ Close Story</Text>
          </TouchableOpacity>

          {myStatus && (
            <View style={styles.statusCard}>
              <Image source={{ uri: myStatus.uri }} style={styles.statusImage} contentFit="contain" />
              <View style={styles.statusFooter}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>👁️ Active Story (Expires in 24h)</Text>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  darkContainer: { backgroundColor: '#1a202c' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
  darkHeader: { backgroundColor: '#2d3748' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a202c' },
  headerIconsRow: { flexDirection: 'row', gap: 10 },
  headerIconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#edf2f7', justifyContent: 'center', alignItems: 'center' },
  darkIconButton: { backgroundColor: '#4a5568' },
  myStatusSection: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  myStatusRow: { flexDirection: 'row', alignItems: 'center' },
  myStatusAvatarContainer: { position: 'relative', marginRight: 12 },
  myStatusAvatar: { width: 50, height: 50, borderRadius: 25 },
  myStatusAvatarCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center' },
  myStatusAvatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  addStatusBadge: { position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderRadius: 9, backgroundColor: '#38a169', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  myStatusInfo: { flex: 1 },
  myStatusTitle: { fontSize: 15, fontWeight: 'bold', color: '#2d3748' },
  myStatusSubtext: { fontSize: 12, color: '#718096' },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 10 },
  searchInput: { backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20, paddingHorizontal: 16, height: 38, fontSize: 13, color: '#2d3748' },
  darkInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  chatRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
  darkChatRow: { borderBottomColor: '#2d3748' },
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatarCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 52, height: 52, borderRadius: 26 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  onlineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#48bb78', position: 'absolute', bottom: 0, right: 0, borderWidth: 2, borderColor: '#fff' },
  chatDetails: { flex: 1, justifyContent: 'center' },
  chatRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  contactName: { fontSize: 15, fontWeight: 'bold', color: '#2d3748', flex: 1, marginRight: 8 },
  timeText: { fontSize: 11, color: '#718096' },
  lastMessageText: { fontSize: 13, color: '#4a5568', flex: 1 },
  darkSubText: { color: '#a0aec0' },
  darkText: { color: '#fff' },
  unreadBadgePill: {
    backgroundColor: '#3182ce',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  statusOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  closeStatusBtn: { position: 'absolute', top: 40, right: 20, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, zIndex: 10 },
  statusCard: { width: '100%', height: '75%', justifyContent: 'center', alignItems: 'center' },
  statusImage: { width: '100%', height: '80%', borderRadius: 12 },
  statusFooter: { marginTop: 15, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
});