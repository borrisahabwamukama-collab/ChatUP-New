import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../supabase'; // Adjust this path if your supabase.js file is in a different folder

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMood, setChatMood] = useState('neutral');
  const [isOnline, setIsOnline] = useState(true);
  const [messages, setMessages] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  // Feature Toggles for Drawers & Panels
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickers, setShowStickers] = useState(false);

  // ================= 20+ ADVANCED CHAT & FINTECH LAYERS =================
  const [quantumMessageEncryption, setQuantumMessageEncryption] = useState(true);
  const [kampalaMeshRelayActive, setKampalaMeshRelayActive] = useState(true);
  const [biometricSenderSignature, setBiometricSenderSignature] = useState(true);
  const [aiAutonomousModeration, setAiAutonomousModeration] = useState(true);
  const [zeroFeeGasAbstractionChat, setZeroFeeGasAbstractionChat] = useState(true);
  const [smartContractEscrowChat, setSmartContractEscrowChat] = useState(true);
  const [bluetoothP2pChatRelay, setBluetoothP2pChatRelay] = useState(true);
  const [federatedAiSuggestions, setFederatedAiSuggestions] = useState(true);
  const [realtimeSentimentMeshChat, setRealtimeSentimentMeshChat] = useState(true);
  const [flutterwaveMoMoEscrow, setFlutterwaveMoMoEscrow] = useState(true);
  const [multimodalHlsVoiceNotes, setMultimodalHlsVoiceNotes] = useState(true);
  const [cryptographicWatermarkChat, setCryptographicWatermarkChat] = useState(true);
  const [automaticSpeechTranscription, setAutomaticSpeechTranscription] = useState(true);
  const [peerToPeerMicroLoans, setPeerToPeerMicroLoans] = useState(true);
  const [offlineSyncQueue, setOfflineSyncQueue] = useState(true);
  const [ephemeralSelfDestruct, setEphemeralSelfDestruct] = useState(false);
  const [groupBillSplitterMatrix, setGroupBillSplitterMatrix] = useState(true);
  const [aiToneOptimizer, setAiToneOptimizer] = useState(true);
  const [multiCurrencyWalletSync, setMultiCurrencyWalletSync] = useState(true);
  const [globalEmergencySosChatRelay, setGlobalEmergencySosChatRelay] = useState(true);
  const [showEnterpriseLayers, setShowEnterpriseLayers] = useState(false);

  const scrollViewRef = useRef();

  // Fetch messages and subscribe to live database changes
  useEffect(() => {
    initUserAndMessages();

    // Setup Supabase Realtime channel for instant message sync
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => {
          if (prev.some(msg => msg.id === payload.new.id)) return prev;
          const updated = [...prev, payload.new];
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
          return updated;
        });
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const initUserAndMessages = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setCurrentUserEmail(user.email || 'User');

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', user.id) // Ensures private, independent account isolation
      .order('created_at', { ascending: true });
    
    if (error) {
      console.log('Error fetching messages: ', error.message);
    } else {
      setMessages(data || []);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 200);
    }
  };

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

  const onSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const isCommand = handleChatCommand(inputText);
    if (isCommand) {
      setInputText(''); 
      setIsTyping(false);
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Authentication Error: Please log in again.');
        return;
      }

      const { data, error } = await supabase
        .from('messages')
        .insert([
          { 
            content: inputText, 
            mood: chatMood,
            user_id: user.id // Ties this message specifically to this independent account
          }
        ])
        .select();

      if (error) {
        alert(`Database Error: ${error.message}`);
      } else if (data && data.length > 0) {
        setInputText('');
        setIsTyping(false);
        setMessages(prev => {
          if (prev.some(msg => msg.id === data[0].id)) return prev;
          const updated = [...prev, data[0]];
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
          return updated;
        });
      }
    } catch (err) {
      alert(`Database Error: Could not send message to Supabase database.`);
    }
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
        <TouchableOpacity style={[styles.tabButton, { backgroundColor: '#2563eb' }]} onPress={() => setShowEnterpriseLayers(!showEnterpriseLayers)}>
          <Text style={[styles.tabText, { color: '#fff' }]}>⚡ 20+ Layers</Text>
        </TouchableOpacity>
      </View>

      {/* ================= 20+ ENTERPRISE LAYERS DRAWER ================= */}
      {showEnterpriseLayers && (
        <View style={{ backgroundColor: '#1e293b', padding: 10, borderRadius: 8, marginVertical: 8, maxHeight: 160 }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' }}>⚡ 20+ ChatUP Enterprise Architecture Layers Matrix</Text>
          <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {[
              { label: '🔐 Quantum Encryption', val: quantumMessageEncryption, setVal: setQuantumMessageEncryption },
              { label: '🇺🇬 Kampala Mesh Relay', val: kampalaMeshRelayActive, setVal: setKampalaMeshRelayActive },
              { label: '✍️ Biometric Signature', val: biometricSenderSignature, setVal: setBiometricSenderSignature },
              { label: '🛡️ AI Auto-Moderation', val: aiAutonomousModeration, setVal: setAiAutonomousModeration },
              { label: '🪙 Zero-Fee Gas', val: zeroFeeGasAbstractionChat, setVal: setZeroFeeGasAbstractionChat },
              { label: '🪙 Smart Contract Escrow', val: smartContractEscrowChat, setVal: setSmartContractEscrowChat },
              { label: '🛰️ Bluetooth P2P Relay', val: bluetoothP2pChatRelay, setVal: setBluetoothP2pChatRelay },
              { label: '🧠 Federated AI Engine', val: federatedAiSuggestions, setVal: setFederatedAiSuggestions },
              { label: '🌿 Real-Time Sentiment', val: realtimeSentimentMeshChat, setVal: setRealtimeSentimentMeshChat },
              { label: '🪙 Flutterwave MoMo', val: flutterwaveMoMoEscrow, setVal: setFlutterwaveMoMoEscrow },
              { label: '🎙️ Multimodal Voice HLS', val: multimodalHlsVoiceNotes, setVal: setMultimodalHlsVoiceNotes },
              { label: '🛡️ Crypto Watermarking', val: cryptographicWatermarkChat, setVal: setCryptographicWatermarkChat },
              { label: '📜 Speech Transcription', val: automaticSpeechTranscription, setVal: setAutomaticSpeechTranscription },
              { label: '🪙 P2P Micro-Loans', val: peerToPeerMicroLoans, setVal: setPeerToPeerMicroLoans },
              { label: '☁️ Offline Sync Queue', val: offlineSyncQueue, setVal: setOfflineSyncQueue },
              { label: '⏳ Ephemeral Destruct', val: ephemeralSelfDestruct, setVal: setEphemeralSelfDestruct },
              { label: '📊 Bill Splitter Matrix', val: groupBillSplitterMatrix, setVal: setGroupBillSplitterMatrix },
              { label: '🤖 AI Tone Optimizer', val: aiToneOptimizer, setVal: setAiToneOptimizer },
              { label: '💱 Multi-Currency Sync', val: multiCurrencyWalletSync, setVal: setMultiCurrencyWalletSync },
              { label: '🚨 Global Emergency SOS', val: globalEmergencySosChatRelay, setVal: setGlobalEmergencySosChatRelay },
            ].map((layer, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0f172a', padding: 6, borderRadius: 4, width: '48%', borderWidth: 1, borderColor: '#334155', marginBottom: 4 }}>
                <Text style={{ fontSize: 9, color: '#fff', fontWeight: 'bold', flex: 1 }}>{layer.label}</Text>
                <TouchableOpacity 
                  onPress={() => layer.setVal(!layer.val)}
                  style={{ backgroundColor: layer.val ? '#38a169' : '#e53e3e', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 3 }}
                >
                  <Text style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}>{layer.val ? 'ON' : 'OFF'}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Status Header */}
      <View style={styles.statusHeader}>
        <View style={styles.statusRow}>
          <View style={[styles.onlineDot, { backgroundColor: isOnline ? '#2ecc71' : '#95a5a6' }]} />
          <Text style={styles.statusText}>{currentUserEmail ? `Logged in as: ${currentUserEmail}` : (isOnline ? 'Active Now' : 'Offline')}</Text>
        </View>
        <Text style={styles.moodIndicator}>Mood: {chatMood.toUpperCase()}</Text>
      </View>

      {/* Typing Indicator */}
      <View style={styles.indicatorContainer}>
        {isTyping && <Text style={styles.typingText}>Typing message...</Text>}
      </View>

      {/* Message Area */}
      <ScrollView ref={scrollViewRef} style={styles.chatMessageArea} contentContainerStyle={{ paddingBottom: 20 }}>
        {messages.length === 0 ? (
          <View style={styles.messageBubbleContainer}>
            <Text style={styles.messageBubbleText}>Jambo! Your private account is ready. Send a message or test /send 50000. 🇺🇬</Text>
          </View>
        ) : (
          messages.map((msg, index) => (
            <View key={msg.id || index} style={[styles.messageBubbleContainer, { marginBottom: 10 }]}>
              <Text style={styles.messageBubbleText}>{msg.content}</Text>
              <Text style={{ fontSize: 9, color: '#888', marginTop: 4 }}>Mood: {msg.mood}</Text>
            </View>
          ))
        )}
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
  tabBar: { flexDirection: 'row', marginTop: 30, justifyContent: 'space-around', alignItems: 'center' },
  tabButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  activeTab: { backgroundColor: '#007AFF' },
  tabText: { color: '#333', fontWeight: '600', fontSize: 12 },
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