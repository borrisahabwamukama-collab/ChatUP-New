import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function AdminFraudRadarModule({ isDarkMode }) {
  const [fraudAlerts, setFraudAlerts] = useState([
    { id: 'f1', user: '@user_9921x', riskScore: '96/100 (Critical)', reason: 'Velocity Spike: 14 withdrawal requests in 12 minutes from same IP subnet.' },
    { id: 'f2', user: '@bot_kampala04', riskScore: '88/100 (High Risk)', reason: 'Referral ring detected: Circular self-referrals via simulated device IDs.' },
  ]);

  const handleBlockAndFreeze = (id, user) => {
    setFraudAlerts(prev => prev.filter(item => item.id !== id));
    Alert.alert('🚨 Account Neutralized & Frozen', `${user} has been globally blacklisted, wallet frozen, and flagged for manual compliance review.`);
  };

  return (
    <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#dc2626', borderWidth: 1.5 }]}>
      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { color: '#dc2626' }]}>🛡️ Automated Fraud Radar & Payout Risk Engine</Text>
      <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>AI heuristics actively intercept suspicious withdrawal rings and automated botnets.</Text>

      {fraudAlerts.length > 0 ? (
        fraudAlerts.map(alert => (
          <View key={alert.id} style={{ backgroundColor: isDarkMode ? '#0f172a' : '#fef2f2', padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#fca5a5' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>Target: {alert.user}</Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#dc2626' }}>Risk Score: {alert.riskScore}</Text>
            </View>
            <Text style={{ fontSize: 10, color: '#718096', marginBottom: 8 }}>{alert.reason}</Text>
            <TouchableOpacity style={styles.freezeBtn} onPress={() => handleBlockAndFreeze(alert.id, alert.user)}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Freeze Wallet & Blacklist User 🚫</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={{ fontSize: 11, color: '#16a34a', textAlign: 'center', padding: 10, fontWeight: 'bold' }}>Radar is clear. Zero fraudulent payout rings detected 🟢.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  darkText: { color: '#f8fafc' },
  freezeBtn: { backgroundColor: '#dc2626', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, alignSelf: 'flex-start' },
});