import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../Services/supabaseClient';

export default function GroupDetailScreen({ route, navigation, currentUser, isDarkMode }) {
  const { group } = route.params || {}; // Expects the group object passed from the list

  const handleOpenChat = () => {
    navigation.navigate('ChatRoomScreen', {
      groupId: group.id,
      groupName: group.name,
      groupAvatar: group.avatar || '👥',
    });
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Official Header Banner */}
      <View style={[styles.headerCard, isDarkMode && styles.darkCard]}>
        <View style={styles.largeAvatar}>
          <Text style={{ fontSize: 36 }}>{group?.avatar || '👥'}</Text>
        </View>
        <Text style={[styles.groupName, isDarkMode && styles.darkText]}>{group?.name || 'Community Group'}</Text>
        <Text style={styles.categoryBadge}>{group?.category || 'General Fellowship'}</Text>
      </View>

      {/* Description & Purpose Card */}
      <View style={[styles.infoCard, isDarkMode && styles.darkCard]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>📖 Group Purpose & Guidelines</Text>
        <Text style={[styles.descriptionText, isDarkMode && { color: '#cbd5e0' }]}>
          {group?.lastMessage || group?.description || 'No description provided for this official group yet.'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.chatBtn}
          onPress={handleOpenChat}
        >
          <Ionicons name="chatbubbles" size={18} color="#fff" />
          <Text style={styles.chatBtnText}>Enter Group Discussion 💬</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8fafc', flexGrow: 1 },
  darkContainer: { backgroundColor: '#1a202c' },
  headerCard: { alignItems: 'center', backgroundColor: '#fff', padding: 24, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  largeAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#ebf8ff', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  groupName: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', textAlign: 'center', marginBottom: 6 },
  darkText: { color: '#fff' },
  categoryBadge: { fontSize: 11, fontWeight: 'bold', color: '#2563eb', backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  infoCard: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#475569', marginBottom: 8 },
  descriptionText: { fontSize: 13, color: '#334155', lineHeight: 20 },
  actionRow: { marginTop: 10 },
  chatBtn: { flexDirection: 'row', backgroundColor: '#2563eb', padding: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  chatBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});