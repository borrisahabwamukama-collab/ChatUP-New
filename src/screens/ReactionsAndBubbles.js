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
import { supabase } from '../../Services/supabaseClient';

export default function ReactionsAndBubbles({ isDarkMode, coins, setCoins }) {
  const [messages, setMessages] = useState([
    { id: '1', sender: 'Nimusiima Asifa', text: 'We reached the wildlife reserve safely! 🐘', mood: 'excited', reaction: '❤️' },
    { id: '2', sender: 'Borris', text: 'That is fantastic news. Let us review the conservation ledger.', mood: 'professional', reaction: '👍' },
    { id: '3', sender: 'Stella', text: 'Watch out for the afternoon rain storm coming through!', mood: 'urgent', reaction: '⚠️' },
  ]);

  const [pinnedMessage, setPinnedMessage] = useState('📌 Pinned Notice: All community chat guidelines apply.');
  const [newMessageText, setNewMessageText] = useState('');

  // LAYER 1: AI SENTIMENT AUTO-TAGGER TOGGLE
  const [aiSentimentAutoTagEnabled, setAiSentimentAutoTagEnabled] = useState(true);

  // LAYER 2: CUSTOM EMOJI REACTION TRAY EXPANSION
  const [customEmojiTrayOpen, setCustomEmojiTrayOpen] = useState(false);
  const [selectedActiveTrayItem, setSelectedActiveTrayItem] = useState(null);

  // LAYER 3: MESSAGE THREAD THREADING & REPLY DRAFTING
  const [replyTargetMessage, setReplyTargetMessage] = useState(null);

  // LAYER 4: LIVE REACTION RAIN / CONFETTI EFFECT TRIGGER
  const [reactionRainActive, setReactionRainActive] = useState(true);

  // Handle long press to open reaction picker
  const handleLongPressMessage = (id, sender, currentText) => {
    Alert.alert(
      `Reactions & Moods (${sender})`,
      'Choose an action for this message:',
      [
        { text: '❤️ Love (+10 🪙)', onPress: () => updateReactionWithBonus(id, '❤️', 10) },
        { text: '🔥 Fire (+10 🪙)', onPress: () => updateReactionWithBonus(id, '🔥', 10) },
        { text: '💬 Reply Thread', onPress: () => { setReplyTargetMessage(currentText); Alert.alert('Thread Reply', `Replying to ${sender}'s message.`); } },
        { text: '📌 Pin Message', onPress: () => setPinnedMessage(`📌 Pinned: "${messages.find(m => m.id === id)?.text}"`) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const updateReaction = (id, emoji) => {
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, reaction: emoji } : msg));
    if (reactionRainActive) {
      setSelectedActiveTrayItem(emoji);
    }
  };

  const updateReactionWithBonus = (id, emoji, bonusCoins) => {
    updateReaction(id, emoji);
    if (setCoins) {
      setCoins(prev => prev + bonusCoins);
    }
    Alert.alert('🪙 Coin Reward Credited!', `Successfully earned +${bonusCoins} coins for community engagement!`);
  };

  const handleSendMessage = () => {
    if (!newMessageText.trim()) return;

    // Simple sentiment analyzer simulation
    let detectedMood = 'professional';
    const lower = newMessageText.toLowerCase();
    if (lower.includes('!') || lower.includes('excited') || lower.includes('safe') || lower.includes('safari')) {
      detectedMood = 'excited';
    } else if (lower.includes('storm') || lower.includes('urgent') || lower.includes('sos') || lower.includes('warning')) {
      detectedMood = 'urgent';
    }

    const newMsg = {
      id: Date.now().toString(),
      sender: 'Borris (You)',
      text: newMessageText,
      mood: detectedMood,
      reaction: null,
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessageText('');
    setReplyTargetMessage(null);
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
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>✨ AI Sentiment & Reactions Hub (Wallet: {coins} 🪙)</Text>
        <Text style={styles.headerSub}>Long-press any message to react, pin, or trigger sentiment adaptations.</Text>
      </View>

      {/* NEW LAYER 1: AI SENTIMENT AUTO-TAGGER STATUS BAR */}
      <View style={[styles.layerBar, isDarkMode && styles.darkHeader]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: 14, paddingVertical: 6 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: isDarkMode ? '#90cdf4' : '#2b6cb0' }}>🤖 AI Sentiment Auto-Tagger: {aiSentimentAutoTagEnabled ? 'Active 🟢' : 'Off ⚪'}</Text>
          <Switch
            value={aiSentimentAutoTagEnabled}
            onValueChange={setAiSentimentAutoTagEnabled}
            trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
          />
        </View>
      </View>

      {/* Pinned Message Banner */}
      <View style={[styles.pinnedBanner, isDarkMode && { backgroundColor: '#1e3a8a', borderBottomColor: '#3b82f6' }]}>
        <Text style={[styles.pinnedText, isDarkMode && { color: '#93c5fd' }]}>{pinnedMessage}</Text>
      </View>

      {/* Message List with Mood Bubbles */}
      <ScrollView contentContainerStyle={styles.scrollArea}>
        {messages.map(msg => (
          <TouchableOpacity 
            key={msg.id} 
            activeOpacity={0.8}
            onLongPress={() => handleLongPressMessage(msg.id, msg.sender, msg.text)}
            style={styles.messageWrapper}
          >
            <View style={[styles.bubbleBase, getMoodStyle(msg.mood), isDarkMode && styles.darkBubbleOverride]}>
              <View style={styles.bubbleHeaderRow}>
                <Text style={styles.senderLabel}>{msg.sender}</Text>
                <Text style={styles.moodTag}>[{aiSentimentAutoTagEnabled ? msg.mood : 'standard'}]</Text>
              </View>
              <Text style={[styles.messageContent, isDarkMode && styles.darkText]}>{msg.text}</Text>
              
              {/* Floating Reaction Badge */}
              {msg.reaction ? (
                <View style={[styles.reactionBadge, isDarkMode && { backgroundColor: '#1e293b', borderColor: '#475569' }]}>
                  <Text style={{ fontSize: 12 }}>{msg.reaction}</Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}

        {/* NEW LAYER 2 & 3: ACTIVE THREAD REPLY PREVIEW */}
        {replyTargetMessage && (
          <View style={[styles.threadReplyBox, isDarkMode && styles.darkHeader]}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#3182ce' }}>💬 Replying to thread:</Text>
            <Text style={[{ fontSize: 11, fontStyle: 'italic' }, isDarkMode && styles.darkText]} numberOfLines={1}>"{replyTargetMessage}"</Text>
            <TouchableOpacity onPress={() => setReplyTargetMessage(null)} style={{ alignSelf: 'flex-end', marginTop: 2 }}>
              <Text style={{ fontSize: 10, color: '#e53e3e', fontWeight: 'bold' }}>Cancel Reply</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* DYNAMIC MESSAGE INPUT BAR */}
      <View style={[styles.inputBar, isDarkMode && styles.darkHeader]}>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Type a message (mood auto-tagged)..."
          placeholderTextColor="#a0aec0"
          value={newMessageText}
          onChangeText={setNewMessageText}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Send 🚀</Text>
        </TouchableOpacity>
      </View>

      {/* NEW LAYER 4: QUICK CUSTOM EMOJI REACTION TRAY */}
      <View style={[styles.emojiTrayBar, isDarkMode && styles.darkHeader]}>
        <Text style={{ fontSize: 10, fontWeight: 'bold', color: isDarkMode ? '#94a3b8' : '#718096', marginBottom: 4 }}>Quick Reaction Tray (Earns +10 Coins):</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['❤️', '🔥', '👍', '🐘', '🌿', '🪙', '⚠️', '🚀', '🎉'].map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={[styles.emojiChip, isDarkMode && styles.darkChip]}
              onPress={() => updateReactionWithBonus('1', emoji, 10)}
            >
              <Text style={{ fontSize: 14 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
  layerBar: { backgroundColor: '#ebf8ff', borderBottomWidth: 1, borderBottomColor: '#bee3f8' },
  pinnedBanner: { backgroundColor: '#ebf8ff', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#bee3f8' },
  pinnedText: { fontSize: 11, fontWeight: 'bold', color: '#2b6cb0' },
  scrollArea: { padding: 16 },
  messageWrapper: { marginBottom: 14, position: 'relative' },
  bubbleBase: { padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
  defaultBubble: { backgroundColor: '#fff', borderColor: '#e2e8f0' },
  excitedBubble: { backgroundColor: '#fffaf0', borderColor: '#feebc8' }, // Warm tone for excitement
  urgentBubble: { backgroundColor: '#fff5f5', borderColor: '#fed7d7' },  // Red tint for urgent storm alerts
  professionalBubble: { backgroundColor: '#f0fff4', borderColor: '#c6f6d5' }, // Green tint for official logs
  darkBubbleOverride: { backgroundColor: '#1e293b', borderColor: '#334155' },
  bubbleHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  senderLabel: { fontSize: 11, fontWeight: 'bold', color: '#3182ce' },
  moodTag: { fontSize: 9, fontStyle: 'italic', color: '#a0aec0' },
  messageContent: { fontSize: 13, color: '#2d3748' },
  darkText: { color: '#fff' },
  reactionBadge: { position: 'absolute', bottom: -8, right: 12, backgroundColor: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e0', elevation: 2 },
  threadReplyBox: { backgroundColor: '#edf2f7', padding: 8, borderRadius: 8, marginTop: 4, marginBottom: 10, borderWidth: 1, borderColor: '#cbd5e0' },
  inputBar: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0', alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 10, height: 38, backgroundColor: '#f7fafc', color: '#2d3748', fontSize: 12, marginRight: 8 },
  darkInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  sendBtn: { backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  emojiTrayBar: { backgroundColor: '#fff', padding: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0', alignItems: 'center' },
  emojiChip: { backgroundColor: '#f7fafc', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  darkChip: { backgroundColor: '#1a202c', borderColor: '#4a5568' },
  footerInfoBox: { padding: 12, alignItems: 'center', backgroundColor: 'transparent' },
  footerInfoText: { fontSize: 11, color: '#718096', fontStyle: 'italic' },
});