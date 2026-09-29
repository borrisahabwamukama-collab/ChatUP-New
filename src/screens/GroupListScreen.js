import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../Services/supabaseClient';

export default function GroupListScreen({ navigation, currentUser, isDarkMode }) {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal & Membership State
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingMembership, setLoadingMembership] = useState(false);

  // TOGGLE CONTROLS
  const [pinFilterActive, setPinFilterActive] = useState(false);
  const [meshStatusIndicatorActive, setMeshStatusIndicatorActive] = useState(true);
  const [showArchivedFolder, setShowArchivedFolder] = useState(false);
  const [archivedCount] = useState(4);
  const [unreadOnlyFilter, setUnreadOnlyFilter] = useState(false);
  const [biometricEnclaveLocked, setBiometricEnclaveLocked] = useState(false);

  // FETCH REAL LIVE GROUPS FROM SUPABASE ON LOAD
  useEffect(() => {
    fetchLiveGroups();
  }, []);

  const fetchLiveGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('community_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedGroups = data.map((grp, index) => ({
          id: grp.id,
          name: grp.name,
          category: grp.category || 'General Fellowship',
          avatar: grp.category === 'Tech & Code' ? '💻' : grp.category === 'Church & Prayer' ? '🙏' : '👥',
          lastMessage: grp.description || 'Welcome to the official community hub!',
          time: 'Just now',
          unread: 0,
          isPining: index === 0,
          created_by: grp.created_by, // Track creator ID securely
        }));

        setChats(formattedGroups);
      }
    } catch (err) {
      console.warn('Could not fetch live community groups:', err.message);
    }
  };

  // SEARCH & FILTER LOGIC
  const filteredChats = chats.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    if (pinFilterActive && !item.isPining) return false;
    if (unreadOnlyFilter && item.unread === 0) return false;
    return matchesSearch;
  });

  // Tapping a group opens its official Modal Hub and checks membership securely
  const handleOpenGroup = async (item) => {
    if (biometricEnclaveLocked) {
      return Alert.alert('Enclave Locked 🔒', 'Please authenticate with biometrics to open this secure group hub.');
    }
    
    setSelectedGroup(item);
    setGroupModalVisible(true);
    setLoadingMembership(true);

    if (currentUser?.id) {
      try {
        // 1. Check if the current user created this group
        const isCreator = item.created_by && item.created_by === currentUser.id;

        // 2. Check membership table in Supabase
        const { data, error } = await supabase
          .from('chat_group_members')
          .select('group_id, role')
          .eq('group_id', item.id)
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (isCreator || (!error && data)) {
          setIsMember(true);
          setIsAdmin(isCreator || data?.role === 'admin');
        } else {
          setIsMember(false);
          setIsAdmin(false);
        }
      } catch (err) {
        console.warn('Error checking membership:', err);
      }
    }
    setLoadingMembership(false);
  };

  // Join the Community Group using clean UUID strings
  const handleJoinGroup = async () => {
    if (!currentUser?.id) {
      return Alert.alert('Authentication Required 🛑', 'Please log in to join community groups.');
    }

    setLoadingMembership(true);
    try {
      const { error } = await supabase
        .from('chat_group_members')
        .insert([{ 
          group_id: selectedGroup.id, 
          user_id: currentUser.id,
          role: 'member'
        }]);

      if (error) throw error;

      setIsMember(true);
      Alert.alert('Joined Successfully! 🚀', `You are now a member of "${selectedGroup.name}".`);
    } catch (err) {
      Alert.alert('Error Joining Group ❌', err.message);
    } finally {
      setLoadingMembership(false);
    }
  };

  // Jump into the live Chat Room
  const handleEnterChatRoom = () => {
    setGroupModalVisible(false);
    if (!selectedGroup) return;

    try {
      navigation.navigate('ChatRoomScreen', {
        groupId: selectedGroup.id,
        groupName: selectedGroup.name,
        groupAvatar: selectedGroup.avatar,
      });
    } catch (error) {
      try {
        navigation.navigate('ChatRoom', {
          groupId: selectedGroup.id,
          groupName: selectedGroup.name,
        });
      } catch (e) {
        Alert.alert('Navigation Error 🚫', 'ChatRoomScreen is not registered in your Stack Navigator.');
      }
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.chatItem, isDarkMode && styles.darkChatItem]}
      onPress={() => handleOpenGroup(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
        {item.isPining && (
          <View style={styles.pinBadge}>
            <Text style={{ fontSize: 9 }}>📌</Text>
          </View>
        )}
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.topRow}>
          <Text style={[styles.name, isDarkMode && styles.darkText]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.time, isDarkMode && { color: '#a0aec0' }]}>{item.time}</Text>
        </View>
        
        <View style={styles.bottomRow}>
          <Text style={[styles.lastMsg, isDarkMode && { color: '#94a3b8' }]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      
      {/* Search Bar & Tools Header */}
      <View style={[styles.headerContainer, isDarkMode && styles.darkHeader]}>
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkSearchInput]}
          placeholder="Search Kampala chats, groups, or messages..."
          placeholderTextColor="#a0aec0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* TOGGLE CONTROLS BAR */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollRow}>
          <TouchableOpacity 
            style={[styles.filterChip, pinFilterActive && styles.activeFilterChip, isDarkMode && styles.darkFilterChip]}
            onPress={() => setPinFilterActive(!pinFilterActive)}
          >
            <Text style={[styles.filterChipText, pinFilterActive && { color: '#fff' }, isDarkMode && !pinFilterActive && { color: '#cbd5e0' }]}>📌 Pinned</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, unreadOnlyFilter && styles.activeFilterChip, isDarkMode && styles.darkFilterChip]}
            onPress={() => setUnreadOnlyFilter(!unreadOnlyFilter)}
          >
            <Text style={[styles.filterChipText, unreadOnlyFilter && { color: '#fff' }, isDarkMode && !unreadOnlyFilter && { color: '#cbd5e0' }]}>💬 Unread</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, showArchivedFolder && styles.activeFilterChip, isDarkMode && styles.darkFilterChip]}
            onPress={() => setShowArchivedFolder(!showArchivedFolder)}
          >
            <Text style={[styles.filterChipText, showArchivedFolder && { color: '#fff' }, isDarkMode && !showArchivedFolder && { color: '#cbd5e0' }]}>📁 Archived ({archivedCount})</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, biometricEnclaveLocked && { backgroundColor: '#e53e3e', borderColor: '#e53e3e' }, isDarkMode && !biometricEnclaveLocked && styles.darkFilterChip]}
            onPress={() => {
              setBiometricEnclaveLocked(!biometricEnclaveLocked);
              Alert.alert('Enclave Lock', !biometricEnclaveLocked ? '🔒 Biometric chat enclave locked.' : 'Enclave unlocked.');
            }}
          >
            <Text style={[styles.filterChipText, biometricEnclaveLocked && { color: '#fff' }, isDarkMode && !biometricEnclaveLocked && { color: '#cbd5e0' }]}>
              {biometricEnclaveLocked ? '🔒 Enclave Locked' : '🔓 Enclave Open'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* OFFLINE MESH BANNER */}
        {meshStatusIndicatorActive && (
          <View style={[styles.meshBanner, isDarkMode && { backgroundColor: '#064e3b', borderColor: '#065f46' }]}>
            <Text style={[styles.meshBannerText, isDarkMode && { color: '#6ee7b7' }]}>🛰️ Mesh Node Active: 3 offline peers connected in Kampala</Text>
          </View>
        )}
      </View>

      <FlatList
        data={filteredChats}
        renderItem={renderItem}
        keyExtractor={item => String(item.id)}
        ItemSeparatorComponent={() => <View style={[styles.separator, isDarkMode && styles.darkSeparator]} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ fontSize: 13, color: '#718096' }}>No community groups found. Tap '+' to create one!</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {
          try {
            navigation.navigate('CreateGroupScreen');
          } catch (error) {
            Alert.alert('Navigation Error', 'Target screen "CreateGroupScreen" is not registered in your Stack Navigator.');
          }
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* 🚀 OFFICIAL GROUP HUB MODAL WITH MEMBERSHIP & ADMIN CONTROLS */}
      <Modal visible={groupModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkContainer]}>
            {selectedGroup && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <View style={styles.modalAvatarCircle}>
                    <Text style={{ fontSize: 36 }}>{selectedGroup.avatar}</Text>
                  </View>
                  <Text style={[styles.modalGroupName, isDarkMode && styles.darkText]}>{selectedGroup.name}</Text>
                  <Text style={styles.modalCategoryBadge}>{selectedGroup.category}</Text>
                  {isAdmin && (
                    <Text style={styles.adminBadge}>👑 Admin Privileges Active</Text>
                  )}
                </View>

                <View style={[styles.infoBox, isDarkMode && styles.darkHeader]}>
                  <Text style={[styles.infoTitle, isDarkMode && styles.darkText]}>📖 Group Purpose & Guidelines</Text>
                  <Text style={{ fontSize: 13, color: isDarkMode ? '#cbd5e0' : '#4a5568', lineHeight: 18, marginTop: 4 }}>
                    {selectedGroup.lastMessage}
                  </Text>
                </View>

                {loadingMembership ? (
                  <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 20 }} />
                ) : isMember ? (
                  <TouchableOpacity 
                    style={styles.enterChatBtn}
                    onPress={handleEnterChatRoom}
                  >
                    <Ionicons name="chatbubbles" size={18} color="#fff" />
                    <Text style={styles.enterChatBtnText}>Enter Group Discussion 💬</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.joinBtn}
                    onPress={handleJoinGroup}
                  >
                    <Ionicons name="person-add" size={18} color="#fff" />
                    <Text style={styles.joinBtnText}>Join Community 🤝</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={styles.closeModalBtn}
                  onPress={() => setGroupModalVisible(false)}
                >
                  <Text style={{ color: '#718096', fontWeight: 'bold', fontSize: 12 }}>Close Hub</Text>
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
  container: { flex: 1, backgroundColor: '#ffffff' },
  darkContainer: { backgroundColor: '#1a202c' },
  headerContainer: { padding: 12, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  darkHeader: { backgroundColor: '#2d3748', borderBottomColor: '#4a5568' },
  searchInput: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 12, height: 38, fontSize: 12, color: '#0f172a', marginBottom: 8 },
  darkSearchInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  filterScrollRow: { flexDirection: 'row', marginBottom: 4 },
  filterChip: { backgroundColor: '#edf2f7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginRight: 6, borderWidth: 1, borderColor: '#cbd5e0' },
  darkFilterChip: { backgroundColor: '#1a202c', borderColor: '#4a5568' },
  activeFilterChip: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterChipText: { fontSize: 11, fontWeight: 'bold', color: '#475569' },
  meshBanner: { backgroundColor: '#f0fdf4', padding: 6, borderRadius: 6, marginTop: 6, borderWidth: 1, borderColor: '#bbf7d0', alignItems: 'center' },
  meshBannerText: { fontSize: 10, fontWeight: 'bold', color: '#15803d' },
  chatItem: { flexDirection: 'row', padding: 12, alignItems: 'center', backgroundColor: '#ffffff' },
  darkChatItem: { backgroundColor: '#1a202c' },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginRight: 12, position: 'relative' },
  pinBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e0' },
  avatarText: { fontSize: 22 },
  chatInfo: { flex: 1, justifyContent: 'center' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 17, fontWeight: '600', color: '#0f172a', flex: 1, marginRight: 8 },
  darkText: { color: '#ffffff' },
  time: { fontSize: 12, color: 'gray' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMsg: { fontSize: 14, color: 'gray', flex: 1, marginRight: 8 },
  unreadBadge: { backgroundColor: '#2563eb', borderRadius: 12, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  unreadText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  separator: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 76 },
  darkSeparator: { backgroundColor: '#2d3748' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  fabText: { color: 'white', fontSize: 28, fontWeight: 'bold', marginTop: -2 },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalAvatarCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#ebf8ff', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  modalGroupName: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', textAlign: 'center', marginBottom: 4 },
  modalCategoryBadge: { fontSize: 10, fontWeight: 'bold', color: '#2563eb', backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden', marginBottom: 6 },
  adminBadge: { fontSize: 10, fontWeight: 'bold', color: '#d97706', backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  infoBox: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  infoTitle: { fontSize: 12, fontWeight: 'bold', color: '#475569' },
  enterChatBtn: { flexDirection: 'row', backgroundColor: '#2563eb', padding: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 10 },
  enterChatBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  joinBtn: { flexDirection: 'row', backgroundColor: '#16a34a', padding: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 10 },
  joinBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  closeModalBtn: { alignItems: 'center', padding: 10 },
});