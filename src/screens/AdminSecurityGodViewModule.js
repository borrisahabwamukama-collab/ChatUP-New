import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function AdminSecurityGodViewModule({
  searchQuery,
  setSearchQuery,
  handleGodViewInspect,
  searchedUserResult,
  threatLogs,
  isDarkMode
}) {
  return (
    <View>
      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🛡️ God-View Global Database & Evidence Inspector</Text>
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Search username, email, or user UUID..."
          placeholderTextColor="#a0aec0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.primaryBtn} onPress={handleGodViewInspect}>
          <Text style={styles.primaryBtnText}>Inspect Complete User Record 🔍</Text>
        </TouchableOpacity>

        {searchedUserResult && (
          <View style={{ marginTop: 12, padding: 12, backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e0' }}>
            {searchedUserResult.isDetailed ? (
              <>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2563eb', marginBottom: 4 }}>👤 User Profile Metadata Found:</Text>
                <Text style={{ fontSize: 11, color: isDarkMode ? '#f8fafc' : '#0f172a', marginBottom: 2 }}>• Username: <Text style={{ fontWeight: 'bold' }}>{searchedUserResult.username}</Text></Text>
                <Text style={{ fontSize: 11, color: isDarkMode ? '#f8fafc' : '#0f172a', marginBottom: 2 }}>• Email Address: <Text style={{ fontWeight: 'bold' }}>{searchedUserResult.email}</Text></Text>
                <Text style={{ fontSize: 11, color: isDarkMode ? '#f8fafc' : '#0f172a', marginBottom: 2 }}>• Account Status: <Text style={{ fontWeight: 'bold', color: '#16a34a' }}>{searchedUserResult.status}</Text></Text>
                <Text style={{ fontSize: 11, color: isDarkMode ? '#f8fafc' : '#0f172a', marginBottom: 2 }}>• Role / Tier: <Text style={{ fontWeight: 'bold' }}>{searchedUserResult.role}</Text></Text>
                <Text style={{ fontSize: 11, color: isDarkMode ? '#f8fafc' : '#0f172a', marginBottom: 2 }}>• Wallet Balance: <Text style={{ fontWeight: 'bold', color: '#38a169' }}>{searchedUserResult.balance}</Text></Text>
                <Text style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>• Joined Date: {searchedUserResult.joined} • ID: {searchedUserResult.id}</Text>
              </>
            ) : (
              <Text style={{ fontSize: 11, color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: 'bold' }}>{searchedUserResult.info}</Text>
            )}
          </View>
        )}
      </View>

      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginTop: 10 }]}>🚨 Predictive Threat & Fraud Detection Analytics</Text>
      {threatLogs.map(th => (
        <View key={th.id} style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>{th.type}</Text>
          <Text style={{ fontSize: 11, color: '#718096', marginVertical: 2 }}>Target: {th.target}</Text>
          <Text style={{ fontSize: 10, color: '#38a169', fontWeight: 'bold' }}>{th.status}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  itemTitle: { fontSize: 12, fontWeight: '700', color: '#0f172a' },
  darkText: { color: '#f8fafc' },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 12, height: 40, backgroundColor: '#f8fafc', color: '#0f172a', fontSize: 12, marginBottom: 10 },
  darkInput: { backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' },
  primaryBtn: { backgroundColor: '#2563eb', padding: 10, borderRadius: 8, alignItems: 'center' },
  primaryBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
});