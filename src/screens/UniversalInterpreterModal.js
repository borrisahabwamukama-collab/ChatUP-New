import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';

export default function UniversalInterpreterModal({ isDarkMode, onClose }) {
  // Global Universal Interpretation Engine States
  const [globalEngineActive, setGlobalEngineActive] = useState(true);
  const [selectedSourceLang, setSelectedSourceLang] = useState('English / Swahili');
  const [selectedTargetLang, setSelectedTargetLang] = useState('Luganda 🇺🇬');
  const [voiceCloningSync, setVoiceCloningSync] = useState(true);
  const [autoDuckingActive, setAutoDuckingActive] = useState(true);
  const [handOffProtocol, setHandOffProtocol] = useState('Smart Queue & Auto-Approve');

  const languages = ['Luganda 🇺🇬', 'Swahili 🇹🇿', 'English 🇬🇧', 'Runyankole 🇺🇬', 'French 🇫🇷'];

  const handleSaveUniversalConfig = () => {
    Alert.alert(
      'Global Interpreter Protocol Updated 🌍',
      `Universal AI translation & audio routing now active across ChatRoom, Virtual TV, LiveStream, and Studio tabs.`
    );
    if (onClose) onClose();
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
      
      {/* Header Banner */}
      <View style={[styles.headerCard, isDarkMode && styles.darkCard]}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>🌐 Global AI Audio & Interpretation Protocol</Text>
        <Text style={styles.subtitle}>Universal background engine managing real-time translation, voice cloning, and speaker-audience hand-offs across all app tabs.</Text>
      </View>

      {/* Master Toggle */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>Master Global Engine</Text>
            <Text style={{ fontSize: 11, color: '#718096' }}>Automatically applies across ChatRooms, TV channels, and live stages.</Text>
          </View>
          <Switch 
            value={globalEngineActive} 
            onValueChange={setGlobalEngineActive} 
            trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
          />
        </View>
      </View>

      {/* Language Podiums Selector */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🗣️ In-Room AI Interpreter Channels & Podiums</Text>
        <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Select default target regional language for real-time neural speech dubbing:</Text>
        
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
          {languages.map(lang => (
            <TouchableOpacity
              key={lang}
              style={[styles.langChip, selectedTargetLang === lang && styles.activeLangChip]}
              onPress={() => setSelectedTargetLang(lang)}
            >
              <Text style={[styles.langChipText, selectedTargetLang === lang && { color: '#fff' }]}>{lang}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Advanced Audio Routing & Protocols */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>⚡ Cross-Tab Audio & Hand-Off Protocols</Text>

        <View style={styles.settingRow}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Real-Time AI Voice Cloning Sync</Text>
          <Switch value={voiceCloningSync} onValueChange={setVoiceCloningSync} />
        </View>

        <View style={styles.settingRow}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Auto-Ducking (Lower music when speaking)</Text>
          <Switch value={autoDuckingActive} onValueChange={setAutoDuckingActive} />
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText, { fontWeight: 'bold', marginBottom: 4 }]}>Speaker-Audience Hand-Off Protocol:</Text>
          <TouchableOpacity 
            style={styles.protocolSelectBtn} 
            onPress={() => setHandOffProtocol(prev => prev.includes('Smart') ? 'Moderated Director Queue 🎛️' : 'Smart Queue & Auto-Approve 🤖')}
          >
            <Text style={{ fontSize: 11, color: '#2b6cb0', fontWeight: 'bold' }}>Active: {handOffProtocol} (Tap to Switch)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSaveUniversalConfig}>
        <Text style={styles.saveBtnText}>Apply Global Protocol Across All Tabs 🚀</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  headerCard: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  darkCard: { backgroundColor: '#2d3748' },
  title: { fontSize: 15, fontWeight: 'bold', color: '#2d3748', marginBottom: 2 },
  subtitle: { fontSize: 11, color: '#718096' },
  darkText: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748', marginBottom: 6 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  settingText: { fontSize: 12, color: '#2d3748' },
  langChip: { backgroundColor: '#edf2f7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 6, marginBottom: 6 },
  activeLangChip: { backgroundColor: '#3182ce' },
  langChipText: { fontSize: 11, fontWeight: 'bold', color: '#4a5568' },
  protocolSelectBtn: { backgroundColor: '#ebf8ff', padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#bee3f8' },
  saveBtn: { backgroundColor: '#38a169', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
});