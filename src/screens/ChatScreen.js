import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMood, setChatMood] = useState('neutral');
  const [isOnline, setIsOnline] = useState(true);

  // Feature Toggles for Drawers & Panels
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState(null);

  // 1. Mobile Money & Bill Splitting Command Handler (/send and /split)
  const handleChatCommand = (text) => {
    if (text.startsWith('/send')) {
      const parts = text.split(' ');
      const amount = parts[1] || '0';
      const recipient = parts[3] || 'someone';
      alert(`Mobile Money Transfer Triggered: UGX ${amount} to ${recipient}`);
      return true; 
    } 
    
    if (text.startsWith('/split')) {
      const parts = text.split(' ');
      const totalAmount = parseFloat(parts[1]) || 0;
      const peopleCount = parseInt(parts[3]) || 1;
      const sharePerPerson = totalAmount / peopleCount;
      alert(`Bill Split Triggered: UGX ${totalAmount} among ${peopleCount} people = UGX ${sharePerPerson} each`);
      return true; 
    }
    
    return false; 
  };

  const handleTextChange = (text) => {
    setInputText(text);
    if (text.length > 0) {
      setIsTyping(true);
      if (text.includes('!') || text.toLowerCase().includes('awesome')) {
        setChatMood('excited');
      } else {
        setChatMood('neutral');
      }
    } else {
      setIsTyping(false);
      setChatMood('neutral');
    }
  };

  const onSendMessage = () => {
    if (!inputText.trim()) return;
    
    const isCommand = handleChatCommand(inputText);
    if (isCommand) {
      setInputText(''); 
      setIsTyping(false);
      return;
    }
    
    alert(`Message Sent [Mood: ${chatMood}]: ${inputText}`);
    setInputText('');
    setIsTyping(false);
  };

  return (
    <View style={styles.container}>
      {/* Top Header Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'wallet' && styles.activeTab]} onPress={() => setActiveTab('wallet')}>
          <Text style={[styles.tabText, activeTab === 'wallet' && styles.activeTabText]}>Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'chat' && styles.activeTab]} onPress={() => setActiveTab('chat')}>
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>ChatUP Live</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'notifications' && styles.activeTab]} onPress={() => setActiveTab('notifications')}>
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>Alerts</Text>
        </TouchableOpacity>
      </View>

      {/* Status Header */}
      <View style={styles.statusHeader}>
        <View style={styles.statusRow}>
          <View style={[styles.onlineDot, { backgroundColor: isOnline ? '#2ecc71' : '#95a5a6' }]} />
          <Text style={styles.statusText}>{isOnline ? 'Active Now' : 'Offline'}</Text>
        </View>
        <Text style={styles.moodIndicator}>Mood: {chatMood.toUpperCase()}</Text>
      </View>

      {/* Typing Indicator */}
      <View style={styles.indicatorContainer}>
        {isTyping && <Text style={styles.typingText}>Typing message...</Text>}
      </View>

      {/* Message Area */}
      <ScrollView style={styles.chatMessageArea}>
        <View style={styles.messageBubbleContainer}>
          <Text style={styles.messageBubbleText}>Jambo! Test commands like /send 50000 to John or /split 30000 among 3. 🇺🇬</Text>
          <View style={styles.reactionRow}>
            <TouchableOpacity onPress={() => setSelectedReaction('❤️')} style={styles.reactionBadge}>
              <Text>❤️ {selectedReaction === '❤️' ? '1' : ''}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedReaction('🔥')} style={styles.reactionBadge}>
              <Text>🔥 {selectedReaction === '🔥' ? '1' : ''}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* POPUP PANELS */}
      {isRecordingVoice && (
        <View style={styles.popupPanel}>
          <Text style={styles.recordingText}>🔴 Recording Voice Note (Auto-Transcript Active)...</Text>
          <TouchableOpacity onPress={() => setIsRecordingVoice(false)} style={styles.closePanelBtn}>
            <Text style={{color: '#fff', fontWeight: 'bold'}}>Close Recorder</Text>
          </TouchableOpacity>
        </View>
      )}

      {showEmojiPicker && (
        <View style={styles.popupPanel}>
          <Text style={styles.panelTitle}>Select Emoji:</Text>
          <View style={styles.emojiGrid}>
            {['😊', '😂', '🔥', '❤️', '👍', '🚀', '🇺🇬', '🙏'].map((emoji, index) => (
              <TouchableOpacity key={index} onPress={() => { setInputText(prev => prev + emoji); setShowEmojiPicker(false); }}>
                <Text style={styles.gridEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {showStickers && (
        <View style={styles.popupPanel}>
          <Text style={styles.panelTitle}>Stickers (Left Section):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['🦁 Wildlife', '🌿 Nature', ' Kampala Vibe', '⚽ Arsenal'].map((sticker, index) => (
              <TouchableOpacity key={index} style={styles.stickerItem} onPress={() => { alert(`Sent Sticker: ${sticker}`); setShowStickers(false); }}>
                <Text style={styles.stickerText}>{sticker}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* BOTTOM INPUT TOOLBAR */}
      <View style={styles.inputContainer}>
        {/* Stickers on the Left */}
        <TouchableOpacity style={styles.leftStickerButton} onPress={() => { setShowStickers(!showStickers); setShowEmojiPicker(false); setIsRecordingVoice(false); }}>
          <Text style={styles.stickerIconText}>⭐ Stickers</Text>
        </TouchableOpacity>

        {/* Emoji Toggle */}
        <TouchableOpacity style={styles.iconButton} onPress={() => { setShowEmojiPicker(!showEmojiPicker); setShowStickers(false); setIsRecordingVoice(false); }}>
          <Text style={styles.iconText}>😊</Text>
        </TouchableOpacity>

        {/* Typing Box with Mic inside on the right */}
        <View style={styles.textInputWrapper}>
          <TextInput 
            style={styles.textInputInside}
            placeholder="Type message or /send 50000..."
            placeholderTextColor="#888"
            value={inputText}
            onChangeText={handleTextChange}
            returnKeyType="send"
            onSubmitEditing={onSendMessage}
          />
          <TouchableOpacity style={styles.insideMicButton} onPress={() => { setIsRecordingVoice(!isRecordingVoice); setShowEmojiPicker(false); setShowStickers(false); }}>
            <Text style={styles.micIconText}>🎤</Text>
          </TouchableOpacity>
        </View>

        {/* Send Button */}
        <TouchableOpacity style={styles.sendButton} onPress={onSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, justifyContent: 'flex-end' },
  tabBar: { flexDirection: 'row', marginTop: 30, justifyContent: 'space-around' },
  tabButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  activeTab: { backgroundColor: '#007AFF' },
  tabText: { color: '#333', fontWeight: '600' },
  activeTabText: { color: '#fff' },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee', marginTop: 10 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  onlineDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  statusText: { fontSize: 12, color: '#666' },
  moodIndicator: { fontSize: 11, fontWeight: 'bold', color: '#007AFF' },
  indicatorContainer: { paddingHorizontal: 4, height: 20, marginTop: 5 },
  typingText: { color: '#888', fontStyle: 'italic', fontSize: 12 },
  chatMessageArea: { flex: 1, marginVertical: 10 },
  messageBubbleContainer: { backgroundColor: '#f1f2f6', padding: 12, borderRadius: 12, alignSelf: 'flex-start', maxWidth: '80%' },
  messageBubbleText: { fontSize: 14, color: '#333' },
  reactionRow: { flexDirection: 'row', marginTop: 8 },
  reactionBadge: { backgroundColor: '#dfe4ea', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 6 },
  popupPanel: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#e9ecef', borderRadius: 10, padding: 12, marginBottom: 10 },
  panelTitle: { fontSize: 12, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  recordingText: { color: '#c0392b', fontWeight: 'bold', fontSize: 12, marginBottom: 8 },
  closePanelBtn: { backgroundColor: '#e74c3c', padding: 6, borderRadius: 6, alignItems: 'center' },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridEmoji: { fontSize: 24, padding: 6 },
  stickerItem: { backgroundColor: '#007AFF', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginRight: 8 },
  stickerText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  leftStickerButton: { backgroundColor: '#e3f2fd', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, marginRight: 6, justifyContent: 'center' },
  stickerIconText: { fontSize: 12, fontWeight: 'bold', color: '#007AFF' },
  iconButton: { padding: 6, justifyContent: 'center', alignItems: 'center', marginRight: 4 },
  iconText: { fontSize: 18 },
  textInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#f9f9f9', marginHorizontal: 4, height: 46 },
  textInputInside: { flex: 1, color: '#000', paddingVertical: 8 },
  insideMicButton: { padding: 4, justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  micIconText: { fontSize: 18 },
  sendButton: { backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  sendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 }
});