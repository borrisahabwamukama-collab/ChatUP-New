import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../Services/supabaseClient';

export default function CommunitiesScreen({ onSelectConversation, isDarkMode }) {
  const [communities, setCommunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Create Group Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [adminHandle, setAdminHandle] = useState('@borris_admin');
  const [selectedCategory, setSelectedCategory] = useState('General Fellowship');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['General Fellowship', 'Church & Prayer', 'Tech & Code', 'Kampala Node', 'Media & Creators'];

  // Automatically refresh communities every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchCommunities();
    }, [])
  );

  useEffect(() => {
    const channel = supabase
      .channel('community_groups_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_groups' },
        () => {
          fetchCommunities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('community_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase Fetch Error:', error.message);
        throw error;
      }
      if (data) {
        setCommunities(data);
      }
    } catch (err) {
      console.error('Error fetching communities:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCommunities();
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Missing Group Name ❌', 'Please enter a name for your group before creating it.');
      return;
    }

    if (!adminHandle.trim()) {
      Alert.alert('Missing Admin Handle ❌', 'Please assign an administrator or leader handle for this community.');
      return;
    }

    setIsSubmitting(true);

    const newGroupPayload = {
      name: groupName.trim(),
      description: groupDescription.trim() || 'A new community space for fellowship and collaboration.',
      category: selectedCategory,
      admin_handle: adminHandle.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('community_groups')
        .insert([newGroupPayload])
        .select();

      if (error) {
        // Displays exact database error (e.g. RLS policy violation or missing column)
        Alert.alert('Supabase Database Error 🛑', error.message || JSON.stringify(error));
        console.error('Supabase Group Creation Error Details:', error);
        return;
      }

      Alert.alert(
        'Group Created & Secured! 🚀',
        `"${groupName}" is now live on the network.`
      );
      setGroupName('');
      setGroupDescription('');
      setShowCreateModal(false);
      
      if (data && data.length > 0) {
        setCommunities((prev) => [data[0], ...prev]);
      } else {
        fetchCommunities();
      }
    } catch (err) {
      Alert.alert('Exception Caught ❌', err.message || String(err));
      console.error('Catch Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCommunityChat = (group) => {
    onSelectConversation({
      id: `community_group_${group.id}`,
      recipientId: group.id,
      recipientName: group.name,
      recipientHandle: group.admin_handle ? `Admin: ${group.admin_handle}` : '@Community_Leader',
      recipientAvatar: group.name?.[0]?.toUpperCase() || 'C',
      avatarUrl: null,
      isCommunity: true,
      category: group.category || 'General',
      description: group.description || '',
      adminHandle: group.admin_handle || '@Community_Leader',
    });
  };

  const filteredCommunities = communities.filter(
    (c) =>
      (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Communities & Groups</Text>
        <TouchableOpacity 
          style={styles.headerCreateBtn}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>＋ New Group</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, isDarkMode && styles.darkHeader]}>
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkInput]}
          placeholder="Search community hubs, categories, or leaders..."
          placeholderTextColor="#a0aec0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Communities List */}
      <FlatList
        data={filteredCommunities}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#2563eb" />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.groupCard, isDarkMode && styles.darkGroupCard]}
            onPress={() => handleOpenCommunityChat(item)}
            activeOpacity={0.8}
          >
            <View style={styles.groupCardHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || 'C'}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.groupName, isDarkMode && styles.darkText]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{item.category || 'General'}</Text>
                  </View>
                </View>
                <Text style={[styles.adminText, isDarkMode && styles.darkSubText]} numberOfLines={1}>
                  👑 Leader / Admin: <Text style={{ fontWeight: 'bold', color: '#2563eb' }}>{item.admin_handle || '@Community_Leader'}</Text>
                </Text>
              </View>
            </View>

            <Text style={[styles.groupDescription, isDarkMode && styles.darkSubText]} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.groupCardFooter}>
              <Text style={styles.footerInfoText}>Tap to open secure community room</Text>
              <Text style={styles.enterActionText}>Enter ➔</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#2563eb" style={{ marginBottom: 12 }} />
            ) : (
              <Text style={{ fontSize: 40, marginBottom: 10 }}>🏛️</Text>
            )}
            <Text style={[styles.emptyText, isDarkMode && styles.darkText]}>
              {loading ? 'Syncing Supabase community hubs...' : 'No community groups found.'}
            </Text>
            <Text style={{ fontSize: 12, color: '#a0aec0', marginTop: 4, textAlign: 'center', paddingHorizontal: 40 }}>
              Tap "＋ New Group" above to establish your first community hub.
            </Text>
          </View>
        }
      />

      {/* Integrated Group Creation Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={[styles.modalContent, isDarkMode && styles.darkGroupCard]}>
            <Text style={[styles.modalHeaderTitle, isDarkMode && styles.darkText]}>Create Community Hub 👥</Text>
            <Text style={styles.modalHeaderSub}>Establish a live community channel with standardized admin controls.</Text>

            <Text style={styles.label}>Group Name *</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              placeholder="e.g., Kampala Sunday Prayer Cell"
              placeholderTextColor="#94a3b8"
              value={groupName}
              onChangeText={setGroupName}
            />

            <Text style={styles.label}>Community Admin / Leader Handle *</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              placeholder="e.g., @Capt_Mugisha or @Borris"
              placeholderTextColor="#94a3b8"
              value={adminHandle}
              onChangeText={setAdminHandle}
            />

            <Text style={styles.label}>Group Purpose & Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, isDarkMode && styles.darkInput]}
              placeholder="What is the objective or fellowship goal?"
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
              value={groupDescription}
              onChangeText={setGroupDescription}
            />

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, selectedCategory === cat && styles.activeCategoryChip]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.categoryChipText, selectedCategory === cat && styles.activeCategoryChipText]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#cbd5e0' }]} 
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#111' }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: '#2563eb' }]} 
                onPress={handleCreateGroup} 
                disabled={isSubmitting}
              >
                <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#fff' }}>
                  {isSubmitting ? 'Creating...' : 'Launch Group 🚀'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10, backgroundColor: '#fff' },
  darkHeader: { backgroundColor: '#2d3748' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a202c' },
  headerCreateBtn: { backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  searchInput: { backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20, paddingHorizontal: 16, height: 38, fontSize: 13, color: '#2d3748' },
  darkInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  groupCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  darkGroupCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  groupCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  groupName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', flex: 1, marginRight: 8 },
  categoryBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#dbeafe' },
  categoryBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#1d4ed8' },
  adminText: { fontSize: 11, color: '#64748b', marginTop: 2 },
  groupDescription: { fontSize: 13, color: '#475569', lineHeight: 18, marginBottom: 12 },
  darkSubText: { color: '#a0aec0' },
  darkText: { color: '#fff' },
  groupCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  footerInfoText: { fontSize: 11, color: '#94a3b8', fontStyle: 'italic' },
  enterActionText: { fontSize: 12, fontWeight: 'bold', color: '#2563eb' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  modalHeaderTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  modalHeaderSub: { fontSize: 11, color: '#64748b', marginBottom: 16 },
  label: { fontSize: 11, fontWeight: 'bold', color: '#334155', marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 12, height: 40, backgroundColor: '#f8fafc', color: '#0f172a', fontSize: 12, marginBottom: 6 },
  textArea: { height: 70, textAlignVertical: 'top', paddingTop: 8 },
  categoryRow: { flexDirection: 'row', marginBottom: 10 },
  categoryChip: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  activeCategoryChip: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  categoryChipText: { fontSize: 10, fontWeight: 'bold', color: '#475569' },
  activeCategoryChipText: { color: '#ffffff' },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
});