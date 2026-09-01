import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

export default function ReactionsAndBubbles({ isDarkMode }) {
  const [messages, setMessages] = useState([
    { id: '1', sender: 'Nimusiima Asifa', text: 'We reached the wildlife reserve safely! 🐘', mood: 'excited', reaction: '❤️' },
    { id: '2', sender: 'Borris', text: 'That is fantastic news. Let us review the conservation ledger.', mood: 'professional', reaction: '👍' },
    { id: '3', sender: 'Stella', text: 'Watch out for the afternoon rain storm coming through!', mood: 'urgent', reaction: '⚠️' },
  ]);

  const [pinnedMessage, setPinnedMessage] = useState('📌 Pinned Notice: All community chat guidelines apply.');

  // Handle long press to open reaction picker
  const handleLongPressMessage = (id, sender) => {
    Alert.alert(
      `Reactions & Moods (${sender})`,
      'Choose an action for this message:',
      [
        { text: '❤️ Love', onPress: () => updateReaction(id, '❤️') },
        { text: '🔥 Fire', onPress: () => updateReaction(id, '🔥') },
        { text: '📌 Pin Message', onPress: () => setPinnedMessage(`📌 Pinned: "${messages.find(m => m.id === id)?.text}"`) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const updateReaction = (id, emoji) => {
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, reaction: emoji } : msg));
  };

  // Helper to return style based on AI sentiment mood
  const getMoodStyle = (mood) => {
    switch (mood) {
      case 'excited': return styles.excitedBubble;
      case 'urgent': return styles.urgentBubble;
      case 'professional': return styles.professionalBubble;
      default: return styles.defaultBubble;
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      
      {/* Top Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>✨ AI Sentiment & Reactions Hub</Text>
        <Text style={styles.headerSub}>Long-press any message to react, pin, or trigger sentiment adaptations.</Text>
      </View>

      {/* Pinned Message Banner */}
      <View style={styles.pinnedBanner}>
        <Text style={styles.pinnedText}>{pinnedMessage}</Text>
      </View>

      {/* Message List with Mood Bubbles */}
      <ScrollView contentContainerStyle={styles.scrollArea}>
        {messages.map(msg => (
          <TouchableOpacity 
            key={msg.id} 
            activeOpacity={0.8}
            onLongPress={() => handleLongPressMessage(msg.id, msg.sender)}
            style={styles.messageWrapper}
          >
            <View style={[styles.bubbleBase, getMoodStyle(msg.mood), isDarkMode && styles.darkBubbleOverride]}>
              <View style={styles.bubbleHeaderRow}>
                <Text style={styles.senderLabel}>{msg.sender}</Text>
                <Text style={styles.moodTag}>[{msg.mood}]</Text>
              </View>
              <Text style={[styles.messageContent, isDarkMode && styles.darkText]}>{msg.text}</Text>
              
              {/* Floating Reaction Badge */}
              {msg.reaction ? (
                <View style={styles.reactionBadge}>
                  <Text style={{ fontSize: 12 }}>{msg.reaction}</Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footerInfoBox}>
        <Text style={styles.footerInfoText}>💡 Tip: Long-press chat bubbles to test reactions and pinning.</Text>
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
  pinnedBanner: { backgroundColor: '#ebf8ff', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#bee3f8' },
  pinnedText: { fontSize: 11, fontWeight: 'bold', color: '#2b6cb0' },
  scrollArea: { padding: 16 },
  messageWrapper: { marginBottom: 14, position: 'relative' },
  bubbleBase: { padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
  defaultBubble: { backgroundColor: '#fff', borderColor: '#e2e8f0' },
  excitedBubble: { backgroundColor: '#fffaf0', borderColor: '#feebc8' }, // Warm tone for excitement
  urgentBubble: { backgroundColor: '#fff5f5', borderColor: '#fed7d7' },  // Red tint for urgent storm alerts
  professionalBubble: { backgroundColor: '#f0fff4', borderColor: '#c6f6d5' }, // Green tint for official logs
  darkBubbleOverride: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  bubbleHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  senderLabel: { fontSize: 11, fontWeight: 'bold', color: '#3182ce' },
  moodTag: { fontSize: 9, fontStyle: 'italic', color: '#a0aec0' },
  messageContent: { fontSize: 13, color: '#2d3748' },
  darkText: { color: '#fff' },
  reactionBadge: { position: 'absolute', bottom: -8, right: 12, backgroundColor: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e0', elevation: 2 },
  footerInfoBox: { padding: 12, alignItems: 'center', backgroundColor: 'transparent' },
  footerInfoText: { fontSize: 11, color: '#718096', fontStyle: 'italic' },
});