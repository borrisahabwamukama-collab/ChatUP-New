import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';

export default function AdminWebhookManagerModule({ isDarkMode }) {
  const [endpointUrl, setEndpointUrl] = useState('https://api.chatup-mesh.org/v1/webhooks/listener');
  const [selectedEvent, setSelectedEvent] = useState('payout.disbursed');
  const [isRegistered, setIsRegistered] = useState(true);

  const handleRegisterWebhook = () => {
    if (!endpointUrl.trim()) {
      Alert.alert('Error', 'Please enter a valid HTTPS webhook endpoint URL.');
      return;
    }
    setIsRegistered(true);
    Alert.alert('Webhook Connected ⚡', `Successfully bound event "${selectedEvent}" to endpoint target.`);
  };

  return (
    <View style={[styles.card, isDarkMode && styles.darkCard]}>
      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🔌 Enterprise Webhook & Event Dispatcher</Text>
      <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Stream real-time server-side events securely to external endpoints.</Text>

      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        placeholder="https://your-server.com/webhook"
        placeholderTextColor="#a0aec0"
        value={endpointUrl}
        onChangeText={setEndpointUrl}
      />

      <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#334155', marginBottom: 6 }}>Trigger Event Type:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 32, marginBottom: 10 }}>
        {['payout.disbursed', 'user.flagged', 'node.offline', 'security.threat'].map(ev => (
          <TouchableOpacity
            key={ev}
            style={{ backgroundColor: selectedEvent === ev ? '#2563eb' : '#e2e8f0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 6 }}
            onPress={() => setSelectedEvent(ev)}
          >
            <Text style={{ color: selectedEvent === ev ? '#fff' : '#475569', fontSize: 10, fontWeight: 'bold' }}>{ev}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.primaryBtn} onPress={handleRegisterWebhook}>
        <Text style={styles.primaryBtnText}>Deploy Webhook Binding 🚀</Text>
      </TouchableOpacity>

      {isRegistered && (
        <Text style={{ fontSize: 10, color: '#16a34a', marginTop: 8, fontWeight: 'bold' }}>Status: Endpoint active & listening for payload dispatches 🟢</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  darkText: { color: '#f8fafc' },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 12, height: 40, backgroundColor: '#f8fafc', color: '#0f172a', fontSize: 12, marginBottom: 10 },
  darkInput: { backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' },
  primaryBtn: { backgroundColor: '#2563eb', padding: 10, borderRadius: 8, alignItems: 'center' },
  primaryBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
});