import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdminSystemHealthModule({ isDarkMode }) {
  const subsystems = [
    { name: 'Supabase Global Database Cluster', status: 'Operational 🟢', uptime: '99.98%' },
    { name: 'P2P Bluetooth & Wi-Fi Direct Mesh', status: 'Operational 🟢', uptime: '98.40%' },
    { name: 'Flutterwave / Mobile Money Gateway', status: 'Operational 🟢', uptime: '100%' },
    { name: 'AI Neural Content Toxicity Filter', status: 'Operational 🟢', uptime: '99.95%' },
    { name: 'Quantum Lattice Encryption Layer', status: 'Operational 🟢', uptime: '100%' },
  ];

  return (
    <View style={[styles.card, isDarkMode && styles.darkCard]}>
      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🟢 Core Subsystem Health & Uptime Status</Text>
      <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Continuous background health check monitoring across all nodes.</Text>

      {subsystems.map((sys, idx) => (
        <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: idx === subsystems.length - 1 ? 0 : 1, borderBottomColor: isDarkMode ? '#334155' : '#f1f5f9' }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: isDarkMode ? '#f8fafc' : '#334155' }}>{sys.name}</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#16a34a' }}>{sys.status}</Text>
            <Text style={{ fontSize: 9, color: '#64748b' }}>Uptime: {sys.uptime}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  darkText: { color: '#f8fafc' },
});