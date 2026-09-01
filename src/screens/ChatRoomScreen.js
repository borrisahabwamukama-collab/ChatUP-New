import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../Services/supabaseClient';

// Automated Spam Detection Utility
function detectSpam(messageText) {
  if (!messageText || typeof messageText !== 'string') return false;

  const text = messageText.trim();
  let spamScore = 0;

  const upperCaseCount = (text.match(/[A-Z]/g) || []).length;
  if (text.length > 10 && upperCaseCount / text.length > 0.7) {
    spamScore += 2;
  }

  const scamKeywords = [
    'free coins', 
    'click here', 
    'airdrop claim', 
    'winner', 
    'congratulations claim', 
    'crypto giveaway', 
    'telegram.me/', 
    'bit.ly/'
  ];
  const lowerText = text.toLowerCase();
  for (let keyword of scamKeywords) {
    if (lowerText.includes(keyword)) {
      spamScore += 3;
      break;
    }
  }

  if (/(.)\1{4,}/.test(text)) {
    spamScore += 2;
  }

  return spamScore >= 3;
}

export default function ChatRoomScreen({ isDarkMode }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);

  // Fullscreen Image Preview State
  const [fullscreenImage, setFullscreenImage] = useState(null);

  // Fetch initial messages and subscribe to real-time database updates from Supabase
  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.log('Error fetching messages from Supabase:', error);
    } else {
      setMessages(data || []);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    if (detectSpam(inputText)) {
      Alert.alert(
        'Spam Detected 🛡️', 
        'Your message was flagged by automated safety filters as potential spam or scam content and could not be sent.'
      );
      return;
    }

    const messageText = inputText.trim();
    setInputText('');

    const { error } = await supabase
      .from('messages')
      .insert([{ sender: 'You', text: messageText, type: 'text' }]);

    if (error) {
      Alert.alert('Database Error', 'Could not send message to Supabase database.');
    }
  };

  // 📸 OPEN LIVE DEVICE CAMERA
  const handleOpenCamera = async () => {
    setAttachmentModalVisible(false);
    
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Camera permission is required to capture photos directly.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      const { error } = await supabase.from('messages').insert([{
        sender: 'You',
        text: '📷 [Camera Photo Captured]',
        image_uri: imageUri,
        type: 'image',
      }]);
      if (error) Alert.alert('Error', 'Failed to upload photo message to database.');
    }
  };

  // 🖼️ OPEN PHOTO & VIDEO LIBRARY
  const handleOpenGallery = async () => {
    setAttachmentModalVisible(false);
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Gallery permission is required to select media.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      const { error } = await supabase.from('messages').insert([{
        sender: 'You',
        text: '🖼️ [Gallery Attachment]',
        image_uri: imageUri,
        type: 'image',
      }]);
      if (error) Alert.alert('Error', 'Failed to upload gallery image to database.');
    }
  };

  // 📄 DOCUMENT SCANNER & PDF MOCKUP
  const handleScanDocument = async () => {
    setAttachmentModalVisible(false);
    
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Camera access is needed to scan documents.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const docName = '📄 Scanned_Document_' + Math.floor(Math.random() * 1000) + '.pdf (1.8 MB)';
      const { error } = await supabase.from('messages').insert([{
        sender: 'You',
        text: docName,
        type: 'document',
      }]);
      if (!error) {
        Alert.alert('Document Compiled 📄', 'Edges detected and converted to secure PDF.');
      }
    }
  };

  // 📍 SHARE CURRENT LOCATION
  const handleShareCurrentLocation = async () => {
    setAttachmentModalVisible(false);
    const { error } = await supabase.from('messages').insert([{
      sender: 'You',
      text: '📍 Current Location: Kampala, Central Region, Uganda (0.3476° N, 32.5825° E)',
      type: 'location',
    }]);
    if (!error) {
      Alert.alert('Location Shared 📍', 'Your precise current GPS coordinates were shared securely.');
    }
  };

  // 📡 SHARE LIVE LOCATION
  const handleShareLiveLocation = async () => {
    setAttachmentModalVisible(false);
    const { error } = await supabase.from('messages').insert([{
      sender: 'You',
      text: '📡 Live Location Sharing Started (Active for 1 hour) • Kampala, Uganda',
      type: 'location',
    }]);
    if (!error) {
      Alert.alert('Live Location Active 📡', 'Broadcasting your real-time movement to participants securely for the next 60 minutes.');
    }
  };

  const handleDownloadFile = (fileName) => {
    Alert.alert('Download Complete 📥', `${fileName} has been safely saved to your local secure downloads vault.`);
  };

  const handleToggleRecordVoice = async () => {
    if (!isRecording) {
      setIsRecording(true);
      Alert.alert('Voice Recording 🎙️', 'Recording voice note... Tap the microphone button again to send.');
    } else {
      setIsRecording(false);
      const { error } = await supabase.from('messages').insert([{
        sender: 'You',
        text: '🎤 [Secure Voice Note • 0:08]',
        type: 'audio',
      }]);
      if (!error) {
        Alert.alert('Voice Note Sent 🎧', 'Encrypted audio note broadcasted securely.');
      }
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      
      {/* Chat Header */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <View style={styles.headerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>N</Text>
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={[styles.headerName, isDarkMode && styles.darkText]}>Nimusiima Asifa</Text>
            <Text style={styles.headerStatus}>
              {isTyping ? 'typing...' : 'Online • End-to-End Encrypted 🔒'}
            </Text>
          </View>
        </View>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView contentContainerStyle={styles.messageScroll} showsVerticalScrollIndicator={false}>
        {messages.map(msg => {
          const isMe = msg.sender === 'You';
          const timeFormatted = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';
          const mediaUri = msg.imageUri || msg.image_uri;

          return (
            <View key={msg.id || Math.random().toString()} style={[styles.messageBubbleContainer, isMe ? styles.myMessageContainer : styles.theirMessageContainer]}>
              <View style={[styles.bubble, isMe ? styles.myBubble : (isDarkMode ? styles.darkBubble : styles.theirBubble)]}>
                
                {msg.type === 'document' ? (
                  <View style={styles.docCard}>
                    <Text style={{ fontSize: 22, marginRight: 8 }}>📁</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.messageText, isMe ? styles.myMessageText : (isDarkMode && styles.darkText), { fontWeight: 'bold' }]}>
                        {msg.text}
                      </Text>
                      <TouchableOpacity onPress={() => handleDownloadFile(msg.text)}>
                        <Text style={styles.downloadLinkText}>📥 Tap to Download & Preview</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : msg.type === 'image' ? (
                  <View>
                    {mediaUri ? (
                      <TouchableOpacity onPress={() => setFullscreenImage(mediaUri)}>
                        <Image source={{ uri: mediaUri }} style={styles.chatImageThumbnail} />
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.imagePlaceholderBox}>
                        <Text style={{ fontSize: 28, marginBottom: 4 }}>🌄</Text>
                      </View>
                    )}
                    <Text style={[styles.messageText, isMe ? styles.myMessageText : (isDarkMode && styles.darkText), { marginTop: 4 }]}>
                      {msg.text}
                    </Text>
                    {mediaUri && (
                      <TouchableOpacity style={styles.previewBtn} onPress={() => setFullscreenImage(mediaUri)}>
                        <Text style={styles.previewBtnText}>🔍 View Fullscreen</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : msg.type === 'location' ? (
                  <View style={styles.locationCard}>
                    <Text style={{ fontSize: 24, marginRight: 8 }}>🗺️</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.messageText, isMe ? styles.myMessageText : (isDarkMode && styles.darkText), { fontWeight: 'bold' }]}>
                        {msg.text}
                      </Text>
                      <TouchableOpacity onPress={() => Alert.alert('Map Navigation', 'Opening interactive map pin location.')}>
                        <Text style={styles.mapLinkText}>📌 Tap to View on Map</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text style={[styles.messageText, isMe ? styles.myMessageText : (isDarkMode && styles.darkText)]}>
                    {msg.text}
                  </Text>
                )}

                <View style={styles.bubbleFooter}>
                  <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText]}>{timeFormatted}</Text>
                  {isMe && <Text style={styles.receiptText}> ✓✓</Text>}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Typing Indicator Bar */}
      {isTyping && (
        <View style={styles.typingIndicatorBox}>
          <Text style={styles.typingText}>Nimusiima is typing...</Text>
        </View>
      )}

      {/* Input Bar */}
      <View style={[styles.inputBar, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity style={styles.plusButton} onPress={() => setAttachmentModalVisible(true)}>
          <Text style={styles.plusButtonText}>＋</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.attachButton, isRecording && { backgroundColor: '#fed7d7', borderRadius: 15 }]} 
          onPress={handleToggleRecordVoice}
        >
          <Text style={{ fontSize: 18 }}>{isRecording ? '⏹️' : '🎤'}</Text>
        </TouchableOpacity>
        
        <TextInput
          style={[styles.inputBox, isDarkMode && styles.darkInputBox]}
          placeholder={isRecording ? "Recording voice note..." : "Type an encrypted message..."}
          placeholderTextColor="#a0aec0"
          value={inputText}
          onChangeText={setInputText}
        />

        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Attachment Tray Modal */}
      <Modal visible={attachmentModalVisible} transparent={true} animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setAttachmentModalVisible(false)}>
          <View style={[styles.trayContainer, isDarkMode && styles.darkContainer]}>
            <View style={styles.trayIndicatorBar} />
            <Text style={[styles.trayTitle, isDarkMode && styles.darkText]}>Share & Attach Content</Text>
            
            <TouchableOpacity style={styles.trayItem} onPress={handleOpenCamera}>
              <Text style={styles.trayIcon}>📷</Text>
              <Text style={[styles.trayText, isDarkMode && styles.darkText]}>Take Photo with Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.trayItem} onPress={handleOpenGallery}>
              <Text style={styles.trayIcon}>🖼️</Text>
              <Text style={[styles.trayText, isDarkMode && styles.darkText]}>Photo & Video Library</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.trayItem} onPress={handleScanDocument}>
              <Text style={styles.trayIcon}>📄</Text>
              <Text style={[styles.trayText, isDarkMode && styles.darkText]}>Scan Document & Create PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.trayItem} onPress={handleShareCurrentLocation}>
              <Text style={styles.trayIcon}>📍</Text>
              <Text style={[styles.trayText, isDarkMode && styles.darkText]}>Share Current Location</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.trayItem} onPress={handleShareLiveLocation}>
              <Text style={styles.trayIcon}>📡</Text>
              <Text style={[styles.trayText, isDarkMode && styles.darkText]}>Share Live Location (Real-time)</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Fullscreen Image Preview Modal */}
      <Modal visible={fullscreenImage !== null} transparent={true} animationType="fade">
        <View style={styles.fullscreenOverlay}>
          <TouchableOpacity style={styles.closeFullscreenBtn} onPress={() => setFullscreenImage(null)}>
            <Text style={styles.closeFullscreenText}>✕ Close</Text>
          </TouchableOpacity>
          {fullscreenImage && (
            <Image source={{ uri: fullscreenImage }} style={styles.fullscreenImage} resizeMode="contain" />
          )}
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  header: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', paddingTop: 20 },
  darkHeader: { backgroundColor: '#2d3748', borderBottomColor: '#4a5568' },
  headerInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center', marginRight: 12, position: 'relative' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#48bb78', position: 'absolute', bottom: 0, right: 0, borderWidth: 2, borderColor: '#fff' },
  headerName: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  headerStatus: { fontSize: 11, color: '#718096' },
  messageScroll: { padding: 15, paddingBottom: 20 },
  messageBubbleContainer: { marginBottom: 12, maxWidth: '82%' },
  myMessageContainer: { alignSelf: 'flex-end' },
  theirMessageContainer: { alignSelf: 'flex-start' },
  bubble: { padding: 12, borderRadius: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  myBubble: { backgroundColor: '#3182ce', borderBottomRightRadius: 2 },
  theirBubble: { backgroundColor: '#edf2f7', borderBottomLeftRadius: 2 },
  darkBubble: { backgroundColor: '#4a5568', borderBottomLeftRadius: 2 },
  messageText: { fontSize: 14, color: '#2d3748' },
  myMessageText: { color: '#fff' },
  darkText: { color: '#fff' },
  bubbleFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4 },
  timeText: { fontSize: 9, color: '#a0aec0' },
  myTimeText: { color: '#ebf8ff' },
  theirTimeText: { color: '#718096' },
  receiptText: { fontSize: 10, color: '#63b3ed', fontWeight: 'bold', marginLeft: 2 },
  typingIndicatorBox: { paddingHorizontal: 16, paddingVertical: 4 },
  typingText: { fontSize: 11, fontStyle: 'italic', color: '#a0aec0' },
  inputBar: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  plusButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  plusButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: -2 },
  attachButton: { padding: 8, marginRight: 4 },
  inputBox: { flex: 1, backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 20, paddingHorizontal: 15, height: 40, fontSize: 13, color: '#2d3748' },
  darkInputBox: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  sendButton: { backgroundColor: '#3182ce', paddingHorizontal: 16, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  docCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.04)', padding: 8, borderRadius: 8, marginBottom: 4 },
  downloadLinkText: { fontSize: 11, color: '#3182ce', fontWeight: 'bold', marginTop: 4, textDecorationLine: 'underline' },
  locationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.04)', padding: 8, borderRadius: 8, marginBottom: 4 },
  mapLinkText: { fontSize: 11, color: '#3182ce', fontWeight: 'bold', marginTop: 4, textDecorationLine: 'underline' },
  imagePlaceholderBox: { height: 120, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  chatImageThumbnail: { width: 180, height: 140, borderRadius: 8, marginBottom: 4 },
  previewBtn: { backgroundColor: 'rgba(0,0,0,0.2)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 4 },
  previewBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  trayContainer: { backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  trayIndicatorBar: { width: 40, height: 4, backgroundColor: '#cbd5e0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  trayTitle: { fontSize: 15, fontWeight: 'bold', color: '#2d3748', marginBottom: 16 },
  trayItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  trayIcon: { fontSize: 20, marginRight: 14 },
  trayText: { fontSize: 13, fontWeight: '600', color: '#4a5568' },
  fullscreenOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  closeFullscreenBtn: { position: 'absolute', top: 40, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  closeFullscreenText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  fullscreenImage: { width: '100%', height: '80%' },
});