import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VoiceAndTranslationScreen({ isDarkMode }) {
  // Architecture Tier State ('root', 'recorder', 'library', 'languages', 'settings')
  const [activeSubView, setActiveSubView] = useState('root');

  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  
  // Granular Engine & Noise Cancellation Settings (Level 3)
  const [autoDenoise, setAutoDenoise] = useState(true);
  const [realtimeCloudSync, setRealtimeCloudSync] = useState(true);
  const [offlineLocalCache, setOfflineLocalCache] = useState(true);
  const [aiSummaryDepth, setAiSummaryDepth] = useState('Detailed Action Items');

  const [audioNotes, setAudioNotes] = useState([
    {
      id: '1',
      author: 'Borris',
      duration: '0:42',
      transcript: 'We need to deploy the new security node updates across Kampala before evening patrol.',
      translations: {
        English: 'We need to deploy the new security node updates across Kampala before evening patrol.',
        Luganda: 'Twetaaga okuteekawo obubaka bw’eby’okwerinda obupya mu Kampala nga akawungeezi tekennatuuka.',
        Swahili: 'Tunahitaji kuweka taarifa mpya za usalama kote Kampala kabla ya doria ya jioni.',
      },
      summary: 'Action item: Deploy security node updates in Kampala prior to evening patrol.',
    },
  ]);

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      Alert.alert('Recording Voice Note 🎙️', 'Speak clearly. AI transcription is listening...');
    } else {
      setIsRecording(false);
      const newNote = {
        id: Date.now().toString(),
        author: 'You',
        duration: '0:18',
        transcript: 'Checking the wildlife camera feeds near the park boundary.',
        translations: {
          English: 'Checking the wildlife camera feeds near the park boundary.',
          Luganda: 'Nakeeta ebyuma ebifaananyi by’ensolo ok pembe y’ekifo.',
          Swahili: 'Kuangalia kamera za wanyamapori karibu na mpaka wa hifadhi.',
        },
        summary: 'Action item: Check wildlife camera feeds at park boundary.',
      };
      setAudioNotes(prev => [newNote, ...prev]);
      Alert.alert('Saved & Transcribed ✨', 'Voice note saved, summarized, and auto-translated successfully.');
      setActiveSubView('library');
    }
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 15, paddingBottom: 50 }}>
      
      {/* Dynamic Multi-Tier Header & Breadcrumb Navigation Bar */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.title, isDarkMode && styles.darkText]} numberOfLines={1}>
            {activeSubView === 'root' ? '🎙️ Voice & AI Translation Hub (Level 1)' :
             activeSubView === 'recorder' ? '🔴 Live Audio Recorder (Level 2)' :
             activeSubView === 'library' ? '📚 Transcripts & Archives (Level 2)' :
             activeSubView === 'languages' ? '🌐 Language Model Matrix (Level 2)' : '⚙️ Speech & Denoising Rules (Level 3)'}
          </Text>
          {activeSubView !== 'root' && (
            <TouchableOpacity onPress={() => setActiveSubView('root')} style={styles.backButton}>
              <Text style={{ color: '#3182ce', fontWeight: 'bold', fontSize: 12 }}>← Hub Root</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.subtitle}>
          {activeSubView === 'root' ? 'Manage sovereign voice notes, multilingual neural translation, and automated action summaries.' : `Active Sub-Path: VoiceHub / ${activeSubView.toUpperCase()}`}
        </Text>
      </View>

      {/* ================= LEVEL 1: VOICE HUB ROOT ================= */}
      {activeSubView === 'root' && (
        <>
          {/* Quick Recorder Action Card */}
          <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 2, alignItems: 'center', padding: 20 }]}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#718096', marginBottom: 4, letterSpacing: 1 }}>VOICE ENGINE STATUS</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#3182ce', marginBottom: 6 }}>🟢 Neural AI Listening</Text>
            <Text style={{ fontSize: 12, color: isDarkMode ? '#a0aec0' : '#4a5568', textAlign: 'center', marginBottom: 12 }}>
              Active Translation Target: <Text style={{ fontWeight: 'bold', color: '#3182ce' }}>{selectedLanguage}</Text>
            </Text>
            <TouchableOpacity style={[styles.sendButton, { backgroundColor: '#3182ce', width: '100%', paddingVertical: 12 }]} onPress={() => setActiveSubView('recorder')}>
              <Text style={styles.sendButtonText}>Open Live Recorder 🎙️</Text>
            </TouchableOpacity>
          </View>

          {/* Sub-Module Navigation Cards */}
          <TouchableOpacity style={[styles.navCard, isDarkMode && styles.darkCard]} onPress={() => setActiveSubView('recorder')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>🔴</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.navTitle, isDarkMode && styles.darkText]}>Live Audio Recorder</Text>
                <Text style={styles.navSub}>Sub-Modules: Real-time speech capture, active decibel meter, instant stop</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#a0aec0" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navCard, isDarkMode && styles.darkCard]} onPress={() => setActiveSubView('library')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>📚</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.navTitle, isDarkMode && styles.darkText]}>Transcripts & Audio Archives</Text>
                <Text style={styles.navSub}>Sub-Modules: Saved audio notes ({audioNotes.length}), AI summaries, localized logs</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#a0aec0" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navCard, isDarkMode && styles.darkCard]} onPress={() => setActiveSubView('languages')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>🌐</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.navTitle, isDarkMode && styles.darkText]}>Language Model Matrix</Text>
                <Text style={styles.navSub}>Sub-Modules: English, Luganda, Swahili neural mapping configurations</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#a0aec0" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navCard, isDarkMode && styles.darkCard]} onPress={() => setActiveSubView('settings')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>⚙️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.navTitle, isDarkMode && styles.darkText]}>Speech Engine & Denoising Rules</Text>
                <Text style={styles.navSub}>Sub-Modules: Ambient noise cancellation, offline local cache, AI depth</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#a0aec0" />
          </TouchableOpacity>
        </>
      )}

      {/* ================= LEVEL 2: LIVE AUDIO RECORDER SUB-MODULE ================= */}
      {activeSubView === 'recorder' && (
        <View style={[styles.card, isDarkMode && styles.darkCard, { alignItems: 'center', padding: 25 }]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { fontSize: 16 }]}>🔴 Level 2: Active Voice Recording Studio</Text>
          <Text style={{ fontSize: 12, color: '#718096', textAlign: 'center', marginBottom: 20 }}>
            Tap the button below to initiate high-fidelity voice capture with live neural translation formatting.
          </Text>

          <TouchableOpacity 
            style={[styles.recordStudioBtn, isRecording && styles.recordingActive]} 
            onPress={handleToggleRecord}
          >
            <Text style={{ fontSize: 32, marginBottom: 8 }}>{isRecording ? '⏹️' : '🎙️'}</Text>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
              {isRecording ? 'Stop & Transcribe' : 'Start Recording'}
            </Text>
          </TouchableOpacity>

          {isRecording && (
            <Text style={{ fontSize: 11, color: '#e53e3e', fontWeight: 'bold', marginTop: 15, fontStyle: 'italic' }}>
              Recording in progress... AI model streaming phonemes.
            </Text>
          )}
        </View>
      )}

      {/* ================= LEVEL 2: TRANSCRIPTS & ARCHIVES SUB-MODULE ================= */}
      {activeSubView === 'library' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📚 Level 2: Audio Note Library ({audioNotes.length})</Text>
          
          {audioNotes.map(note => (
            <View key={note.id} style={[styles.noteCard, isDarkMode && styles.darkSubCard]}>
              <View style={styles.noteHeaderRow}>
                <Text style={styles.authorText}>👤 {note.author} ({note.duration})</Text>
                <Text style={styles.aiBadge}>✨ AI Summarized</Text>
              </View>

              <View style={[styles.transcriptBox, isDarkMode && { backgroundColor: '#1a202c' }]}>
                <Text style={[styles.transcriptLabel, isDarkMode && styles.darkText]}>Transcript [{selectedLanguage}]:</Text>
                <Text style={[styles.transcriptText, isDarkMode && styles.darkText]}>
                  {note.translations[selectedLanguage] || note.transcript}
                </Text>
              </View>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryText}>⚡ Key Insight: {note.summary}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ================= LEVEL 2: LANGUAGE MODEL MATRIX ================= */}
      {activeSubView === 'languages' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🌐 Level 2: Neural Language Configurations</Text>
          <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Select the primary target dialect for real-time translation rendering across all active audio logs:</Text>

          {['English', 'Luganda', 'Swahili'].map(lang => (
            <TouchableOpacity 
              key={lang} 
              style={[styles.langSelectRow, selectedLanguage === lang && { borderColor: '#3182ce', backgroundColor: '#ebf8ff' }]}
              onPress={() => setSelectedLanguage(lang)}
            >
              <Text style={[{ fontSize: 13, fontWeight: 'bold' }, isDarkMode && styles.darkText]}>{lang}</Text>
              <Text style={{ fontSize: 11, color: selectedLanguage === lang ? '#3182ce' : '#718096', fontWeight: 'bold' }}>
                {selectedLanguage === lang ? 'Active ⚡' : 'Select'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ================= LEVEL 3: SPEECH & DENOISING RULES ================= */}
      {activeSubView === 'settings' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>⚙️ Level 3: Advanced Speech Engine Rules</Text>
          
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.toggleLabel, isDarkMode && styles.darkText]}>Ambient Denoising Filter</Text>
              <Text style={{ fontSize: 10, color: '#718096' }}>Automatically remove wind and background noise during recording.</Text>
            </View>
            <Switch value={autoDenoise} onValueChange={setAutoDenoise} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.toggleLabel, isDarkMode && styles.darkText]}>Realtime Cloud Sync</Text>
              <Text style={{ fontSize: 10, color: '#718096' }}>Upload and back up voice notes instantly over network.</Text>
            </View>
            <Switch value={realtimeCloudSync} onValueChange={setRealtimeCloudSync} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
          </View>

          <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.toggleLabel, isDarkMode && styles.darkText]}>Offline Local Cache Storage</Text>
              <Text style={{ fontSize: 10, color: '#718096' }}>Store raw WAV files locally when operating zero-net mesh.</Text>
            </View>
            <Switch value={offlineLocalCache} onValueChange={setOfflineLocalCache} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
          </View>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  darkSubCard: { backgroundColor: '#1a202c', borderColor: '#4a5568' },
  darkText: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  title: { fontSize: 14, fontWeight: 'bold', color: '#2d3748', flex: 1 },
  subtitle: { fontSize: 11, color: '#718096', marginTop: 2 },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748', marginBottom: 10 },
  backButton: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#ebf8ff', borderRadius: 6 },
  navCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  navSub: { fontSize: 10, color: '#718096', marginTop: 2 },
  sendButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  recordStudioBtn: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  recordingActive: { backgroundColor: '#e53e3e' },
  noteCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  noteHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  authorText: { fontSize: 11, fontWeight: 'bold', color: '#3182ce' },
  aiBadge: { fontSize: 9, fontStyle: 'italic', color: '#d69e2e', fontWeight: 'bold' },
  transcriptBox: { backgroundColor: '#f8f9fa', padding: 8, borderRadius: 6, marginBottom: 6 },
  transcriptLabel: { fontSize: 9, fontWeight: 'bold', color: '#718096', marginBottom: 2 },
  transcriptText: { fontSize: 12, color: '#2d3748', lineHeight: 16 },
  summaryBox: { backgroundColor: '#ebf8ff', padding: 6, borderRadius: 4 },
  summaryText: { fontSize: 10, color: '#2b6cb0', fontWeight: 'bold' },
  langSelectRow: { backgroundColor: '#f7fafc', padding: 12, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  toggleLabel: { fontSize: 12, color: '#2d3748', fontWeight: '500' }
});