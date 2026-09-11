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
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

export default function VoiceAndTranslationScreen({ isDarkMode, coins, setCoins }) {
  // Architecture Tier State ('root', 'recorder', 'library', 'languages', 'settings', 'ttsStudio', 'analytics')
  const [activeSubView, setActiveSubView] = useState('root');

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState('0:00');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [targetTranslationLang, setTargetTranslationLang] = useState('Luganda 🇺🇬');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('All');

  // Granular Engine & Noise Cancellation Settings (Level 3)
  const [autoDenoise, setAutoDenoise] = useState(true);
  const [realtimeCloudSync, setRealtimeCloudSync] = useState(true);
  const [offlineLocalCache, setOfflineLocalCache] = useState(true);
  const [aiSummaryDepth, setAiSummaryDepth] = useState('Detailed Action Items');
  const [voiceBiometricsActive, setVoiceBiometricsActive] = useState(true);

  // Text-to-Speech (TTS) Studio States
  const [ttsInputText, setTtsInputText] = useState('Welcome to ChatUp Voice & Translation Studio in Kampala, Uganda.');
  const [selectedTtsVoice, setSelectedTtsVoice] = useState('Borris (Host Neural)');
  const [ttsSpeed, setTtsSpeed] = useState('1.0x (Normal)');
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);

  // Analytics & Insights States
  const [totalVoiceNotesCount, setTotalVoiceNotesCount] = useState(14);
  const [totalTranscriptionMinutes, setTotalTranscriptionMinutes] = useState(48);
  const [translationAccuracyRate, setTranslationAccuracyRate] = useState('98.4%');

  // Interactive Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  const [audioNotes, setAudioNotes] = useState([
    {
      id: '1',
      author: 'Borris',
      duration: '0:42',
      category: 'Security',
      timestamp: 'Today, 02:30 PM',
      transcript: 'We need to deploy the new security node updates across Kampala before evening patrol.',
      translations: {
        English: 'We need to deploy the new security node updates across Kampala before evening patrol.',
        Luganda: 'Twetaaga okuteekawo obubaka bw’eby’okwerinda obupya mu Kampala nga akawungeezi tekennatuuka.',
        Swahili: 'Tunahitaji kuweka taarifa mpya za usalama kote Kampala kabla ya doria ya jioni.',
      },
      summary: 'Action item: Deploy security node updates in Kampala prior to evening patrol.',
      sentiment: 'Urgent 🔴',
    },
    {
      id: '2',
      author: 'Nimusiima Asifa',
      duration: '1:15',
      category: 'Wildlife',
      timestamp: 'Yesterday, 10:15 AM',
      transcript: 'The wildlife camera feeds near Bwindi impenetrable forest boundary show active elephant herds.',
      translations: {
        English: 'The wildlife camera feeds near Bwindi impenetrable forest boundary show active elephant herds.',
        Luganda: 'Ebifaananyi by’ebisolo ebiri okumpi n’okumpi n’ekibira Bwindi biraga ebibinja by’enjovu.',
        Swahili: 'Kamera za wanyamapori karibu na mpaka wa msitu wa Bwindi zinaonyesha makundi ya tembo.',
      },
      summary: 'Wildlife alert: Elephant herds sighted near Bwindi park perimeter.',
      sentiment: 'Positive 🟢',
    },
  ]);

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      Alert.alert('Recording Voice Note 🎙️', 'Speak clearly. Neural AI transcription is listening...');
    } else {
      setIsRecording(false);
      const newNote = {
        id: Date.now().toString(),
        author: 'Borris (Host)',
        duration: '0:18',
        category: 'Field Note',
        timestamp: 'Just now',
        transcript: 'Checking the wildlife camera feeds and local mesh network signal strength near park boundary.',
        translations: {
          English: 'Checking the wildlife camera feeds and local mesh network signal strength near park boundary.',
          Luganda: 'Nakeeta ebyuma ebifaananyi by’ensolo n’obukuubo bw’ensonga z’omukutu mu kifo.',
          Swahili: 'Kuangalia kamera za wanyamapori na nguvu ya mtandao karibu na hifadhi.',
        },
        summary: 'Action item: Check wildlife cameras and mesh network signal at park boundary.',
        sentiment: 'Neutral 🟡',
      };
      setAudioNotes(prev => [newNote, ...prev]);
      setTotalVoiceNotesCount(c => c + 1);
      setTotalTranscriptionMinutes(m => m + 1);
      if (setCoins) setCoins(c => c + 20); // Wallet reward for recording and translating voice note
      Alert.alert('Saved & Transcribed ✨ (+20 🪙)', 'Voice note recorded, denoised, summarized, and auto-translated successfully.');
      setActiveSubView('library');
    }
  };

  const handlePickAndUploadAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', 'video/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      setIsUploadingAudio(true);
      setTimeout(() => {
        setIsUploadingAudio(false);
        setShowUploadModal(false);
        const importedNote = {
          id: 'imported_' + Date.now(),
          author: 'External File Upload',
          duration: '2:10',
          category: 'Imported',
          timestamp: 'Just now',
          transcript: `Successfully imported and transcribed audio file: ${file.name}. Audio clarity optimized via Denoise Engine.`,
          translations: {
            English: `Successfully imported and transcribed audio file: ${file.name}.`,
            Luganda: `Ffaayiro y’amaloboozi etekeddwaamu: ${file.name}.`,
            Swahili: `Faili la sauti limepakiwa: ${file.name}.`,
          },
          summary: `Imported audio archive processed from ${file.name}.`,
          sentiment: 'Neutral 🟡',
        };
        setAudioNotes(prev => [importedNote, ...prev]);
        setTotalVoiceNotesCount(c => c + 1);
        if (setCoins) setCoins(c => c + 35); // Wallet reward for file upload
        Alert.alert('Audio File Imported 📂 (+35 🪙)', `File "${file.name}" transcribed and added to library.`);
      }, 900);
    } catch (err) {
      setIsUploadingAudio(false);
      setShowUploadModal(false);
      Alert.alert('Import Error', 'Could not access local document picker.');
    }
  };

  const handleGenerateTts = () => {
    if (!ttsInputText.trim()) return Alert.alert('Error', 'Enter text to synthesize.');
    setIsGeneratingTts(true);
    setTimeout(() => {
      setIsGeneratingTts(false);
      if (setCoins) setCoins(c => c + 15); // Wallet reward for TTS generation
      Alert.alert('🔊 Voice Synthesized! (+15 🪙)', `Successfully generated neural speech using voice "${selectedTtsVoice}" at speed ${ttsSpeed}!`);
    }, 1000);
  };

  const filteredNotes = audioNotes.filter(note => {
    const matchesSearch = note.transcript.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedFilterCategory === 'All' || note.category === selectedFilterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 15, paddingBottom: 160 }}>
      
      {/* Header & Breadcrumb Navigation Bar */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.title, isDarkMode && styles.darkText]} numberOfLines={1}>
            {activeSubView === 'root' ? `🎙️ Voice & AI Translation Hub (Wallet: ${coins} 🪙)` :
             activeSubView === 'recorder' ? '🔴 Live Audio Recorder' :
             activeSubView === 'library' ? '📚 Transcripts & Archives' :
             activeSubView === 'languages' ? '🌐 Language Model Matrix' :
             activeSubView === 'ttsStudio' ? '🔊 Text-to-Speech (TTS) Studio' :
             activeSubView === 'analytics' ? '📊 Voice Analytics & Insights' : '⚙️ Speech & Denoising Rules'}
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
            <View style={{ flexDirection: 'row', width: '100%', gap: 8 }}>
              <TouchableOpacity style={[styles.sendButton, { backgroundColor: '#3182ce', flex: 1, paddingVertical: 12 }]} onPress={() => setActiveSubView('recorder')}>
                <Text style={styles.sendButtonText}>Open Live Recorder 🎙️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.sendButton, { backgroundColor: '#38a169', paddingHorizontal: 14, paddingVertical: 12 }]} onPress={() => setShowUploadModal(true)}>
                <Text style={styles.sendButtonText}>📁 Import</Text>
              </TouchableOpacity>
            </View>
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

          <TouchableOpacity style={[styles.navCard, isDarkMode && styles.darkCard]} onPress={() => setActiveSubView('ttsStudio')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>🔊</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.navTitle, isDarkMode && styles.darkText]}>Text-to-Speech (TTS) Studio</Text>
                <Text style={styles.navSub}>Sub-Modules: Neural voice cloning, pitch/speed controls, audio export</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#a0aec0" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navCard, isDarkMode && styles.darkCard]} onPress={() => setActiveSubView('analytics')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>📊</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.navTitle, isDarkMode && styles.darkText]}>Voice Analytics & Insights</Text>
                <Text style={styles.navSub}>Sub-Modules: Transcription volume, translation accuracy metrics, sentiment logs</Text>
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
            Tap the button below to initiate high-fidelity voice capture with live neural translation formatting (+20 🪙 reward).
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
            <View style={{ marginTop: 15, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#e53e3e', fontWeight: 'bold', fontStyle: 'italic' }}>
                Recording in progress... AI model streaming phonemes.
              </Text>
              <Text style={{ fontSize: 11, color: '#3182ce', fontWeight: 'bold', marginTop: 4 }}>
                Active Denoise Filter: {autoDenoise ? 'ENABLED 🛡️' : 'OFF'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ================= LEVEL 2: TRANSCRIPTS & ARCHIVES SUB-MODULE (WITH SEARCH & FILTER) ================= */}
      {activeSubView === 'library' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📚 Level 2: Audio Note Library ({filteredNotes.length}/{audioNotes.length})</Text>
          
          <TextInput
            style={[styles.chatInput, { marginBottom: 8 }, isDarkMode && styles.darkInput]}
            placeholder="Search transcripts or authors..."
            placeholderTextColor="#a0aec0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
            {['All', 'Security', 'Wildlife', 'Field Note', 'Imported'].map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, selectedFilterCategory === cat && styles.activeFilterChip]}
                onPress={() => setSelectedFilterCategory(cat)}
              >
                <Text style={[styles.filterChipText, selectedFilterCategory === cat && { color: '#fff' }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredNotes.length === 0 ? (
            <Text style={{ fontSize: 11, fontStyle: 'italic', color: '#718096', textAlign: 'center', padding: 15 }}>No audio notes match your search criteria.</Text>
          ) : (
            filteredNotes.map(note => (
              <View key={note.id} style={[styles.noteCard, isDarkMode && styles.darkSubCard]}>
                <View style={styles.noteHeaderRow}>
                  <Text style={styles.authorText}>👤 {note.author} ({note.duration}) • <Text style={{ color: '#d69e2e' }}>{note.category}</Text></Text>
                  <Text style={styles.aiBadge}>{note.sentiment}</Text>
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

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6 }}>
                  <TouchableOpacity onPress={() => {
                    setAudioNotes(prev => prev.filter(n => n.id !== note.id));
                    Alert.alert('Deleted', 'Audio note removed from local archive.');
                  }}>
                    <Text style={{ color: '#e53e3e', fontSize: 10, fontWeight: 'bold' }}>Delete Note 🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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

      {/* ================= TEXT-TO-SPEECH (TTS) STUDIO ================= */}
      {activeSubView === 'ttsStudio' && (
        <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 1 }]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🔊 Text-to-Speech (TTS) Neural Synthesis Studio</Text>
          <Text style={{ fontSize: 11, color: '#718096', marginBottom: 8 }}>Convert text scripts into natural neural voice audio files for broadcasts and voiceovers (+15 🪙):</Text>

          <TextInput
            style={[styles.chatInput, { height: 75, textAlignVertical: 'top', marginBottom: 8 }, isDarkMode && styles.darkInput]}
            multiline
            value={ttsInputText}
            onChangeText={setTtsInputText}
            placeholder="Type text script to synthesize..."
            placeholderTextColor="#a0aec0"
          />

          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#718096', marginBottom: 4 }}>Select Neural Voice Profile:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
            {['Borris (Host Neural)', 'Asifa (Warm Voice)', 'Ranger Brian (Deep)', 'Luganda AI Voice'].map(voice => (
              <TouchableOpacity
                key={voice}
                style={[styles.filterChip, selectedTtsVoice === voice && styles.activeFilterChip]}
                onPress={() => setSelectedTtsVoice(voice)}
              >
                <Text style={[styles.filterChipText, selectedTtsVoice === voice && { color: '#fff' }]}>{voice}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#718096', marginBottom: 4 }}>Speech Speed:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
            {['0.8x (Slow)', '1.0x (Normal)', '1.25x (Fast)', '1.5x (Turbo)'].map(sp => (
              <TouchableOpacity
                key={sp}
                style={[styles.filterChip, ttsSpeed === sp && styles.activeFilterChip]}
                onPress={() => setTtsSpeed(sp)}
              >
                <Text style={[styles.filterChipText, ttsSpeed === sp && { color: '#fff' }]}>{sp}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: '#38a169', paddingVertical: 12 }]} 
            onPress={handleGenerateTts}
            disabled={isGeneratingTts}
          >
            {isGeneratingTts ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendButtonText}>Synthesize & Export Audio (+15 🪙) 🔊</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* ================= VOICE ANALYTICS & INSIGHTS ================= */}
      {activeSubView === 'analytics' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📊 Voice Analytics & System Insights</Text>
          <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Performance metrics for speech recognition, translation accuracy, and archive usage.</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <View style={[styles.analyticsBox, isDarkMode && { backgroundColor: '#1a202c' }]}>
              <Text style={{ fontSize: 9, color: '#718096', fontWeight: 'bold' }}>TOTAL NOTES</Text>
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#3182ce', marginTop: 2 }}>{totalVoiceNotesCount}</Text>
            </View>
            <View style={[styles.analyticsBox, isDarkMode && { backgroundColor: '#1a202c' }]}>
              <Text style={{ fontSize: 9, color: '#718096', fontWeight: 'bold' }}>AUDIO MINUTES</Text>
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#38a169', marginTop: 2 }}>{totalTranscriptionMinutes}m</Text>
            </View>
            <View style={[styles.analyticsBox, isDarkMode && { backgroundColor: '#1a202c' }]}>
              <Text style={{ fontSize: 9, color: '#718096', fontWeight: 'bold' }}>TRANSLATE ACCURACY</Text>
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#d69e2e', marginTop: 2 }}>{translationAccuracyRate}</Text>
            </View>
          </View>

          <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { fontSize: 12, marginTop: 4 }]}>🌐 Language Breakdown Distribution</Text>
          {[
            { lang: 'English (EN)', share: '62%', count: '9 notes' },
            { lang: 'Luganda (LG)', share: '24%', count: '4 notes' },
            { lang: 'Swahili (SW)', share: '14%', count: '2 notes' },
          ].map(item => (
            <View key={item.lang} style={{ marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                <Text style={[{ fontSize: 11 }, isDarkMode && styles.darkText]}>{item.lang} ({item.count})</Text>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>{item.share}</Text>
              </View>
              <View style={styles.pollBarBg}>
                <View style={[styles.pollBarFill, { width: item.share, backgroundColor: '#3182ce' }]} />
              </View>
            </View>
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

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.toggleLabel, isDarkMode && styles.darkText]}>Offline Local Cache Storage</Text>
              <Text style={{ fontSize: 10, color: '#718096' }}>Store raw WAV files locally when operating zero-net mesh.</Text>
            </View>
            <Switch value={offlineLocalCache} onValueChange={setOfflineLocalCache} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
          </View>

          <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.toggleLabel, isDarkMode && styles.darkText]}>Voice Biometrics Speaker ID</Text>
              <Text style={{ fontSize: 10, color: '#718096' }}>Automatically identify speakers in multi-person audio transcripts.</Text>
            </View>
            <Switch value={voiceBiometricsActive} onValueChange={setVoiceBiometricsActive} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
          </View>
        </View>
      )}

      {/* AUDIO FILE IMPORT MODAL */}
      <Modal visible={showUploadModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 20 }}>
          <View style={{ backgroundColor: isDarkMode ? '#2d3748' : '#fff', padding: 20, borderRadius: 12, width: '100%', maxWidth: 340, alignItems: 'center' }}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>📁🎙️</Text>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { fontSize: 15, textAlign: 'center' }]}>Import External Audio / Video File</Text>
            <Text style={{ fontSize: 11, color: '#718096', textAlign: 'center', marginBottom: 15 }}>Select an audio recording (WAV, MP3, M4A) from your local device storage to transcribe and translate (+35 🪙).</Text>

            <TouchableOpacity 
              style={[styles.sendButton, { backgroundColor: '#3182ce', width: '100%', marginBottom: 8, paddingVertical: 12 }]} 
              onPress={handlePickAndUploadAudioFile}
              disabled={isUploadingAudio}
            >
              {isUploadingAudio ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendButtonText}>Browse Local Files 📂</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.sendButton, { backgroundColor: '#e53e3e', width: '100%', paddingVertical: 10 }]} onPress={() => setShowUploadModal(false)}>
              <Text style={styles.sendButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  toggleLabel: { fontSize: 12, color: '#2d3748', fontWeight: '500' },
  chatInput: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 10, height: 38, backgroundColor: '#f7fafc', color: '#2d3748', fontSize: 12 },
  darkInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  filterChip: { backgroundColor: '#edf2f7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 6, marginBottom: 6 },
  activeFilterChip: { backgroundColor: '#3182ce' },
  filterChipText: { fontSize: 11, color: '#4a5568', fontWeight: 'bold' },
  analyticsBox: { flex: 1, backgroundColor: '#f7fafc', padding: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 2, borderWidth: 1, borderColor: '#e2e8f0' },
  pollBarBg: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  pollBarFill: { height: '100%' },
});