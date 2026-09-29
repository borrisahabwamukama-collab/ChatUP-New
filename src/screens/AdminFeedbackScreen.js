import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../Services/supabaseClient';

export default function AdminFeedbackScreen({ isDarkMode, currentUser, onBack }) {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  
  // Tab filter: 'pending' or 'resolved'
  const [activeTab, setActiveTab] = useState('pending');

  // Reply Modal States
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, [activeTab]);

  const fetchFeedback = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('user_feedback')
        .select('*')
        .eq('status', activeTab)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbackList(data || []);
    } catch (err) {
      console.log('Error fetching feedback catch block:', err.message);
      setFetchError(err.message);
      Alert.alert('Database Error', err.message || 'Could not load user feedback.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeedback();
  };

  const handleOpenReply = (item) => {
    setSelectedFeedback(item);
    setReplyMessage('');
    setShowReplyModal(true);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedFeedback) {
      return Alert.alert('Error', 'Please enter a reply message.');
    }

    // 🌟 Strictly resolve recipient ID. If the feedback row has a NULL user_id, stop immediately.
    const targetRecipientId = 
      selectedFeedback.user_id || 
      selectedFeedback.profile_id || 
      selectedFeedback.sender_id;

    if (!targetRecipientId) {
      return Alert.alert(
        'Missing User ID ⚠️', 
        'This feedback record has no user ID attached in the database (it is currently NULL). Please submit fresh feedback from the app so the user ID is recorded properly.'
      );
    }

    const activeAdminName = (currentUser?.email ? currentUser.email.split('@')[0] : null) || 'SuperAdmin';
    setSendingReply(true);

    try {
      // 1. Send the notification strictly targeting the correct user's UUID
      const { error: notifError } = await supabase.from('notifications').insert([{
        recipient_id: targetRecipientId,
        actor_name: activeAdminName,
        title: `💬 Reply from Admin`,
        message: `Admin (${activeAdminName}) response to your feedback: ${replyMessage.trim()}`,
        body: `Admin response: ${replyMessage.trim()}`,
        is_read: false,
        created_at: new Date().toISOString()
      }]);

      if (notifError) throw notifError;

      // 2. Automatically mark this feedback as resolved so it leaves the active queue!
      const { error: updateError } = await supabase
        .from('user_feedback')
        .update({ status: 'resolved' })
        .eq('id', selectedFeedback.id);

      if (updateError) throw updateError;

      Alert.alert('Success! 🚀', `Reply sent and feedback archived!`);
      setShowReplyModal(false);
      setReplyMessage('');
      fetchFeedback(); // Refresh list to remove the resolved item
    } catch (err) {
      console.log('Reply error:', err);
      Alert.alert('Error', 'Could not dispatch reply or archive feedback.');
    } finally {
      setSendingReply(false);
    }
  };

  const renderFeedbackItem = ({ item }) => {
    const isBug = item.feedback_type === 'Bug';
    const isFeature = item.feedback_type === 'Feature';

    return (
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.avatarCircle}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                @{item.username ? item.username[0].toUpperCase() : 'U'}
              </Text>
            </View>
            <Text style={[styles.usernameText, isDarkMode && styles.darkText]}>
              @{item.username || 'Anonymous'}
            </Text>
          </View>

          <View style={[
            styles.badge, 
            isBug && { backgroundColor: '#fed7d7' },
            isFeature && { backgroundColor: '#c6f6d5' },
            !isBug && !isFeature && { backgroundColor: '#e2e8f0' }
          ]}>
            <Text style={[
              styles.badgeText,
              isBug && { color: '#9b2c2c' },
              isFeature && { color: '#22543d' },
            ]}>
              {item.feedback_type || 'General'}
            </Text>
          </View>
        </View>

        <Text style={[styles.messageText, isDarkMode && styles.darkText]}>
          {item.message}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            {item.created_at ? `${new Date(item.created_at).toLocaleDateString()} at ${new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Recent'}
          </Text>

          {activeTab === 'pending' ? (
            <TouchableOpacity style={styles.replyBtn} onPress={() => handleOpenReply(item)}>
              <Text style={styles.replyBtnText}>Reply & Archive 💬</Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ fontSize: 10, color: '#38a169', fontWeight: 'bold' }}>Resolved ✓</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      
      {/* Top Header */}
      <View style={[styles.headerBar, isDarkMode && styles.darkCard]}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={20} color={isDarkMode ? '#fff' : '#2d3748'} />
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
          🛠️ Admin Feedback Management
        </Text>
      </View>

      {/* Tab Selector: Pending vs Resolved */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'pending' && styles.activeTabBtn]} 
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>Active / Pending</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'resolved' && styles.activeTabBtn]} 
          onPress={() => setActiveTab('resolved')}
        >
          <Text style={[styles.tabText, activeTab === 'resolved' && styles.activeTabText]}>Resolved Archive</Text>
        </TouchableOpacity>
      </View>

      {fetchError && (
        <View style={{ backgroundColor: '#fff5f5', padding: 12, margin: 16, borderRadius: 8, borderWidth: 1, borderColor: '#feb2b2' }}>
          <Text style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: 12 }}>⚠️ Supabase Read Error:</Text>
          <Text style={{ color: '#c53030', fontSize: 11, marginTop: 2 }}>{fetchError}</Text>
        </View>
      )}

      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3182ce" />
          <Text style={{ marginTop: 10, color: '#718096', fontSize: 12 }}>Loading feedback records...</Text>
        </View>
      ) : (
        <FlatList
          data={feedbackList}
          renderItem={renderFeedbackItem}
          keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3182ce" />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 80 }}>
              <Text style={{ fontSize: 40 }}>📭</Text>
              <Text style={{ color: '#718096', fontSize: 13, marginTop: 10 }}>No {activeTab} feedback records found.</Text>
            </View>
          }
        />
      )}

      {/* REPLY MODAL */}
      <Modal visible={showReplyModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#edf2f7', paddingBottom: 8 }}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
                💬 Reply to @{selectedFeedback?.username}
              </Text>
              <TouchableOpacity onPress={() => setShowReplyModal(false)}>
                <Ionicons name="close" size={20} color="#718096" />
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 12 }}>
              <Text style={{ fontSize: 11, color: '#718096', fontWeight: 'bold' }}>Original Feedback:</Text>
              <Text style={{ fontSize: 12, color: '#2d3748', fontStyle: 'italic', marginTop: 2 }}>
                "{selectedFeedback?.message}"
              </Text>
            </View>

            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#718096', marginBottom: 6 }}>Your Admin Reply</Text>
            <TextInput
              style={[styles.textInput, isDarkMode && { color: '#fff', borderColor: '#4a5568', backgroundColor: '#1a202c' }]}
              placeholder="Type your response or update message..."
              placeholderTextColor="#a0aec0"
              multiline
              value={replyMessage}
              onChangeText={setReplyMessage}
            />

            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={handleSendReply}
              disabled={sendingReply}
            >
              {sendingReply ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Send Reply & Archive 🚀</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  headerBar: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTitle: { fontSize: 15, fontWeight: 'bold', color: '#2d3748' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#edf2f7', margin: 16, marginBottom: 4, borderRadius: 8, padding: 3 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activeTabBtn: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  tabText: { fontSize: 12, fontWeight: 'bold', color: '#718096' },
  activeTabText: { color: '#3182ce' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  avatarCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  usernameText: { fontSize: 12, fontWeight: 'bold', color: '#2d3748' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#2b6cb0' },
  messageText: { fontSize: 13, color: '#2d3748', lineHeight: 18, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 },
  dateText: { fontSize: 10, color: '#a0aec0' },
  replyBtn: { backgroundColor: '#3182ce', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  replyBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  darkText: { color: '#fff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, height: '45%' },
  modalTitle: { fontSize: 14, fontWeight: 'bold', color: '#2d3748' },
  textInput: { backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, padding: 12, height: 90, fontSize: 13, color: '#2d3748', textAlignVertical: 'top', marginBottom: 15 },
  submitBtn: { backgroundColor: '#3182ce', padding: 12, borderRadius: 10, alignItems: 'center' }
});