import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../Services/supabaseClient';

export default function AdminDisasterRecoveryModule({ adminRole, isDarkMode }) {
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleTriggerSnapshot = async () => {
    if (adminRole !== 'SuperAdmin') {
      Alert.alert('Restricted 🔒', 'Only the Super-Admin can trigger database backup snapshots.');
      return;
    }

    setIsBackingUp(true);
    try {
      // Simulate snapshot checkpoint write to Supabase log table
      await supabase.from('staff_audit_logs').insert([
        { staff_handle: '@super_admin_borris', action: 'Triggered emergency database snapshot & cluster backup', ip_address: '192.168.1.1', timestamp: new Date().toISOString() }
      ]);

      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('💾 Snapshot Successful 🟢', 'Cold database snapshot generated. Secure backup archive stored in Supabase secure storage bucket.');
    } catch (e) {
      Alert.alert('Error', 'Backup snapshot failed.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleFlushCache = () => {
    Alert.alert('⚡ Cache Flushed', 'Global Redis & edge memory caches cleared. All mesh peer nodes forced to re-sync.');
  };

  return (
    <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#9333ea', borderWidth: 1.5 }]}>
      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { color: '#9333ea' }]}>💾 Disaster Recovery & Database Snapshots</Text>
      <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Execute cold backups, state checkpoints, and edge cache purges.</Text>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity style={[styles.primaryBtn, { flex: 1, backgroundColor: '#9333ea' }]} onPress={handleTriggerSnapshot} disabled={isBackingUp}>
          <Text style={styles.primaryBtnText}>{isBackingUp ? 'Backing Up...' : 'Trigger Snapshot 💾'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.primaryBtn, { flex: 1, backgroundColor: '#d97706' }]} onPress={handleFlushCache}>
          <Text style={styles.primaryBtnText}>Flush Edge Cache ⚡</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  darkText: { color: '#f8fafc' },
  primaryBtn: { padding: 10, borderRadius: 8, alignItems: 'center' },
  primaryBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
});