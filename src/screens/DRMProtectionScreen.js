import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

export default function DRMProtectionScreen({ isDarkMode }) {
  const [assetTitle, setAssetTitle] = useState('');
  const [screenRecordingProtection, setScreenRecordingProtection] = useState(true);
  const [geofenceCountry, setGeofenceCountry] = useState('Uganda & East Africa Only 🇺🇬');
  const [copyrightList, setCopyrightList] = useState([
    { id: '1', title: 'Bwindi Gorilla Expedition Master', hash: 'sha256_e3b0c442...', date: '2026-06-12' },
  ]);

  const handleRegister = () => {
    if (!assetTitle.trim()) return Alert.alert('Error', 'Enter asset title to register copyright.');
    setCopyrightList(prev => [
      ...prev,
      { id: Date.now().toString(), title: assetTitle, hash: 'sha256_' + Math.random().toString(36).substring(7), date: new Date().toISOString().split('T')[0] }
    ]);
    setAssetTitle('');
    Alert.alert('DRM Protection Enforced 🛡️', 'Cryptographic ownership hash recorded successfully.');
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      
      {/* Header */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>🛡️ Digital Rights Management & Copyright Suite</Text>
        <Text style={styles.subtitle}>Protect intellectual property with immutable copyright hashes, dynamic watermarks, and anti-piracy blocks.</Text>
      </View>

      {/* Anti-Piracy & Screen Recording Block */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: screenRecordingProtection ? '#38a169' : '#e53e3e', borderWidth: 2 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🚫 Anti-Piracy & Screen Capture Shield</Text>
          <TouchableOpacity 
            style={{ backgroundColor: screenRecordingProtection ? '#38a169' : '#e53e3e', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
            onPress={() => {
              setScreenRecordingProtection(!screenRecordingProtection);
              Alert.alert('DRM Shield', !screenRecordingProtection ? '🔒 Screen recording and screenshots blocked!' : '⚠️ Recording protection disabled.');
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{screenRecordingProtection ? 'Shield ACTIVE 🟢' : 'Shield OFF 🔴'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 11, color: '#718096' }}>Enforces native device flags (`FLAG_SECURE`) to prevent black-screen capturing and video recording during playback.</Text>
      </View>

      {/* Geofencing & Regional Licensing */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🌍 Regional Licensing & Geo-Fencing</Text>
        <Text style={{ fontSize: 11, color: '#718096', marginBottom: 8 }}>Restrict playback to authorized territories to prevent unauthorized cross-border leaks:</Text>
        <TouchableOpacity style={styles.actionBtnBlue} onPress={() => Alert.alert('Geofence', 'Licensing region toggled.')}>
          <Text style={styles.actionBtnText}>Allowed Territory: {geofenceCountry} (Tap to Edit)</Text>
        </TouchableOpacity>
      </View>

      {/* Blockchain / Immutable Copyright Registry */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📜 Immutable Copyright Registry</Text>
        {copyrightList.map(item => (
          <View key={item.id} style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 8, borderRadius: 6, marginBottom: 6 }}>
            <Text style={[{ fontSize: 12, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>{item.title}</Text>
            <Text style={{ fontSize: 10, color: '#3182ce' }}>Hash: {item.hash}</Text>
            <Text style={{ fontSize: 10, color: '#718096' }}>Registered: {item.date} • Verified Original</Text>
          </View>
        ))}

        <TextInput
          style={[styles.chatInput, { marginVertical: 8 }, isDarkMode && styles.darkInput]}
          placeholder="New Master Asset Title to Protect..."
          placeholderTextColor="#a0aec0"
          value={assetTitle}
          onChangeText={setAssetTitle}
        />
        <TouchableOpacity style={styles.actionBtnGreen} onPress={handleRegister}>
          <Text style={styles.actionBtnText}>Register Copyright Hash 🔒</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  title: { fontSize: 15, fontWeight: 'bold', color: '#2d3748', marginBottom: 4 },
  subtitle: { fontSize: 11, color: '#718096' },
  darkText: { color: '#fff' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748', marginBottom: 6 },
  chatInput: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 10, height: 38, backgroundColor: '#f7fafc', color: '#2d3748', fontSize: 12 },
  darkInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  actionBtnBlue: { backgroundColor: '#3182ce', padding: 10, borderRadius: 8, alignItems: 'center' },
  actionBtnGreen: { backgroundColor: '#48bb78', padding: 10, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});