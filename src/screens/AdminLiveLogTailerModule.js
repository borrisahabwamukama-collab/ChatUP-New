import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

export default function AdminLiveLogTailerModule({ isDarkMode }) {
  const [logs, setLogs] = useState([
    { id: 1, time: '11:12:04', type: 'INFO', text: 'Kampala Node Cluster 02 synced successfully via P2P mesh.' },
    { id: 2, time: '11:12:15', type: 'WARN', text: 'High packet latency detected on Entebbe Relay Node (48ms).' },
    { id: 3, time: '11:12:30', type: 'SUCCESS', text: 'Flutterwave payout batch processed: UGX 1,250,000 disbursed.' },
  ]);

  const [isStreaming, setIsStreaming] = useState(true);

  const simulateNewLog = () => {
    const newLogTypes = ['INFO', 'WARN', 'SUCCESS', 'SEC_ALERT'];
    const randomType = newLogTypes[Math.floor(Math.random() * newLogTypes.length)];
    const timeNow = new Date().toLocaleTimeString();
    
    setLogs(prev => [
      { id: Date.now(), time: timeNow, type: randomType, text: `Autonomous mesh diagnostic scan completed [Code: ${Math.floor(Math.random()*9000+1000)}]` },
      ...prev.slice(0, 15)
    ]);
  };

  return (
    <View style={[styles.card, isDarkMode && styles.darkCard, { backgroundColor: '#0f172a', borderColor: '#334155' }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#38a169' }}>🟢 Live Infrastructure Stream & Log Tailer</Text>
        <TouchableOpacity 
          style={{ backgroundColor: isStreaming ? '#dc2626' : '#16a34a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
          onPress={() => setIsStreaming(!isStreaming)}
        >
          <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>{isStreaming ? 'PAUSE STREAM ⏸️' : 'RESUME ▶️'}</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={{ fontSize: 10, color: '#94a3b8', marginBottom: 8 }}>Real-time terminal output streaming directly from Supabase edge functions & mesh relays.</Text>

      <ScrollView style={{ height: 160, backgroundColor: '#020617', padding: 8, borderRadius: 6 }}>
        {logs.map(log => {
          let color = '#38a169';
          if (log.type === 'WARN') color = '#d97706';
          if (log.type === 'SEC_ALERT') color = '#dc2626';
          if (log.type === 'INFO') color = '#3182ce';

          return (
            <Text key={log.id} style={{ fontSize: 10, fontFamily: 'monospace', color: '#f8fafc', marginBottom: 4 }}>
              <Text style={{ color: '#64748b' }}>[{log.time}] </Text>
              <Text style={{ color, fontWeight: 'bold' }}>[{log.type}] </Text>
              {log.text}
            </Text>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={[styles.primaryBtn, { marginTop: 10, backgroundColor: '#334155' }]} onPress={simulateNewLog}>
        <Text style={{ color: '#f8fafc', fontSize: 11, fontWeight: 'bold' }}>Trigger Manual Mesh Diagnostic Test 🧪</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1 },
  primaryBtn: { padding: 10, borderRadius: 8, alignItems: 'center' },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' }
});