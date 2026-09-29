import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../../Services/supabaseClient';

export default function UniversalInterpreterModal({ isDarkMode, currentUser = { id: 'borris_01', name: 'Borris', role: 'admin' }, onClose, coins, setCoins }) {
  const [globalEngineActive, setGlobalEngineActive] = useState(true);
  const [selectedSourceLang] = useState('English / Swahili');
  const [selectedTargetLang, setSelectedTargetLang] = useState('Luganda 🇺🇬');
  const [voiceCloningSync, setVoiceCloningSync] = useState(true);
  const [autoDuckingActive, setAutoDuckingActive] = useState(true);
  const [handOffProtocol, setHandOffProtocol] = useState('Smart Queue & Auto-Approve');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const languages = ['Luganda 🇺🇬', 'Swahili 🇹🇿', 'English 🇬🇧', 'Runyankole 🇺🇬', 'French 🇫🇷'];

  const isAdminOrHost = currentUser?.role === 'admin' || currentUser?.id === 'borris_01';

  useEffect(() => {
    let isMounted = true;
    if (isAdminOrHost) {
      const loadConfig = async () => {
        try {
          const { data, error } = await supabase
            .from('universal_interpreter_settings')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle();

          if (isMounted) {
            if (!error && data) {
              setGlobalEngineActive(data.global_engine_active ?? true);
              setSelectedTargetLang(data.selected_target_lang ?? 'Luganda 🇺🇬');
              setVoiceCloningSync(data.voice_cloning_sync ?? true);
              setAutoDuckingActive(data.auto_ducking_active ?? true);
              setHandOffProtocol(data.hand_off_protocol ?? 'Smart Queue & Auto-Approve');
            }
          }
        } catch (err) {
          console.log('Notice:', err.message);
        } finally {
          if (isMounted) setLoading(false);
        }
      };
      loadConfig();
    } else {
      setLoading(false);
    }
    return () => { isMounted = false; };
  }, [currentUser?.id]);

  // Stable handlers to prevent re-render thrashing & shaking
  const handleSelectLuganda = useCallback(() => setSelectedTargetLang('Luganda 🇺🇬'), []);
  const handleSelectSwahili = useCallback(() => setSelectedTargetLang('Swahili 🇹🇿'), []);
  const handleSelectEnglish = useCallback(() => setSelectedTargetLang('English 🇬🇧'), []);
  const handleSelectRunyankole = useCallback(() => setSelectedTargetLang('Runyankole 🇺🇬'), []);
  const handleSelectFrench = useCallback(() => setSelectedTargetLang('French 🇫🇷'), []);

  const handleToggleProtocol = useCallback(() => {
    setHandOffProtocol(prev => prev.includes('Smart') ? 'Moderated Director Queue 🎛️' : 'Smart Queue & Auto-Approve 🤖');
  }, []);

  const handleSaveUniversalConfig = async () => {
    setIsSaving(true);
    try {
      const payload = {
        user_id: currentUser.id,
        global_engine_active: globalEngineActive,
        selected_source_lang: selectedSourceLang,
        selected_target_lang: selectedTargetLang,
        voice_cloning_sync: voiceCloningSync,
        auto_ducking_active: autoDuckingActive,
        hand_off_protocol: handOffProtocol,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from('universal_interpreter_settings')
        .upsert(payload);

      if (error) throw error;

      if (setCoins) setCoins(c => c + 15);
      Alert.alert(
        'Global Interpreter Protocol Updated 🌍 (+15 🪙)',
        'Universal AI translation & audio routing active across all app streams.'
      );
      if (onClose) onClose();
    } catch (err) {
      Alert.alert('Sync Error', 'Failed to save configuration to Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAdminOrHost) return null;

  if (loading) {
    return (
      <View style={[styles.container, isDarkMode && styles.darkContainer, { justifyContent: 'center', alignItems: 'center', height: 200 }]}>
        <ActivityIndicator size="large" color="#3182ce" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, isDarkMode && styles.darkContainer]} 
      contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      
      {/* Header Banner */}
      <View style={[styles.headerCard, isDarkMode && styles.darkCard]}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>🌐 Global AI Audio & Interpretation Protocol (Wallet: {coins} 🪙)</Text>
        <Text style={styles.subtitle}>Admin Control Panel: Universal background engine managing real-time translation, voice cloning, and audio routing.</Text>
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

      {/* Language Podiums Selector (Static Stable Buttons) */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🗣️ In-Room AI Interpreter Channels & Podiums</Text>
        <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Select default target regional language for real-time neural speech dubbing:</Text>
        
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
          <TouchableOpacity
            style={[styles.langChip, selectedTargetLang === 'Luganda 🇺🇬' && styles.activeLangChip]}
            onPress={handleSelectLuganda}
            activeOpacity={0.8}
          >
            <Text style={[styles.langChipText, selectedTargetLang === 'Luganda 🇺🇬' && { color: '#fff' }]}>Luganda 🇺🇬</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langChip, selectedTargetLang === 'Swahili 🇹🇿' && styles.activeLangChip]}
            onPress={handleSelectSwahili}
            activeOpacity={0.8}
          >
            <Text style={[styles.langChipText, selectedTargetLang === 'Swahili 🇹🇿' && { color: '#fff' }]}>Swahili 🇹🇿</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langChip, selectedTargetLang === 'English 🇬🇧' && styles.activeLangChip]}
            onPress={handleSelectEnglish}
            activeOpacity={0.8}
          >
            <Text style={[styles.langChipText, selectedTargetLang === 'English 🇬🇧' && { color: '#fff' }]}>English 🇬🇧</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langChip, selectedTargetLang === 'Runyankole 🇺🇬' && styles.activeLangChip]}
            onPress={handleSelectRunyankole}
            activeOpacity={0.8}
          >
            <Text style={[styles.langChipText, selectedTargetLang === 'Runyankole 🇺🇬' && { color: '#fff' }]}>Runyankole 🇺🇬</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langChip, selectedTargetLang === 'French 🇫🇷' && styles.activeLangChip]}
            onPress={handleSelectFrench}
            activeOpacity={0.8}
          >
            <Text style={[styles.langChipText, selectedTargetLang === 'French 🇫🇷' && { color: '#fff' }]}>French 🇫🇷</Text>
          </TouchableOpacity>
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
            onPress={handleToggleProtocol}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 11, color: '#2b6cb0', fontWeight: 'bold' }}>Active: {handOffProtocol} (Tap to Switch)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSaveUniversalConfig} disabled={isSaving} activeOpacity={0.8}>
        {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Apply Global Protocol Across All Tabs (+15 🪙) 🚀</Text>}
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc', overflow: 'hidden' },
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