import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

export default function VoiceAndTranslationScreen({ isDarkMode }) {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
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
      // Simulate saving new voice note
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
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>🎙️ Voice Notes & AI Translation Hub</Text>
        <Text style={styles.headerSub}>Record audio, read auto-generated transcripts, and switch languages instantly.</Text>
      </View>

      {/* Language Selector Bar */}
      <View style={styles.langBar}>
        <Text style={[styles.langLabel, isDarkMode && styles.darkText]}>Active Translation:</Text>
        {['English', 'Luganda', 'Swahili'].map(lang => (
          <TouchableOpacity 
            key={lang} 
            style={[styles.langChip, selectedLanguage === lang && styles.activeLangChip]}
            onPress={() => setSelectedLanguage(lang)}
          >
            <Text style={[styles.langChipText, selectedLanguage === lang && styles.activeLangChipText]}>{lang}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Voice Notes List */}
      <ScrollView contentContainerStyle={styles.scrollArea}>
        {audioNotes.map(note => (
          <View key={note.id} style={[styles.noteCard, isDarkMode && styles.darkCard]}>
            <View style={styles.noteHeaderRow}>
              <Text style={styles.authorText}>👤 {note.author} ({note.duration})</Text>
              <Text style={styles.aiBadge}>✨ AI Summarized</Text>
            </View>

            {/* Translated Transcript Box */}
            <View style={styles.transcriptBox}>
              <Text style={[styles.transcriptLabel, isDarkMode && styles.darkText]}>Transcript [{selectedLanguage}]:</Text>
              <Text style={[styles.transcriptText, isDarkMode && styles.darkText]}>
                {note.translations[selectedLanguage] || note.transcript}
              </Text>
            </View>

            {/* AI Summary Footer */}
            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>⚡ Key Insight: {note.summary}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Recorder Trigger Button */}
      <View style={styles.footerContainer}>
        <TouchableOpacity 
          style={[styles.recordButton, isRecording && styles.recordingActive]} 
          onPress={handleToggleRecord}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? '⏹️ Stop & Transcribe Recording' : '🎙️ Tap to Record Voice Note'}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  darkHeader: { backgroundColor: '#2d3748', borderBottomColor: '#4a5568' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#2d3748', marginBottom: 4 },
  headerSub: { fontSize: 12, color: '#718096' },
  langBar: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  langLabel: { fontSize: 11, fontWeight: 'bold', color: '#4a5568', marginRight: 8 },
  langChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#edf2f7', marginRight: 6 },
  activeLangChip: { backgroundColor: '#3182ce' },
  langChipText: { fontSize: 11, color: '#4a5568', fontWeight: 'bold' },
  activeLangChipText: { color: '#fff' },
  scrollArea: { padding: 16 },
  noteCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  noteHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  authorText: { fontSize: 12, fontWeight: 'bold', color: '#3182ce' },
  aiBadge: { fontSize: 10, fontStyle: 'italic', color: '#d69e2e', fontWeight: 'bold' },
  transcriptBox: { backgroundColor: '#f8f9fa', padding: 10, borderRadius: 8, marginBottom: 8 },
  transcriptLabel: { fontSize: 10, fontWeight: 'bold', color: '#718096', marginBottom: 2 },
  transcriptText: { fontSize: 13, color: '#2d3748', lineHeight: 18 },
  summaryBox: { backgroundColor: '#ebf8ff', padding: 8, borderRadius: 6 },
  summaryText: { fontSize: 11, color: '#2b6cb0', fontWeight: 'bold' },
  darkText: { color: '#fff' },
  footerContainer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  recordButton: { backgroundColor: '#3182ce', padding: 14, borderRadius: 25, alignItems: 'center' },
  recordingActive: { backgroundColor: '#e53e3e' },
  recordButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});