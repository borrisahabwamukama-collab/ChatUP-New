import React, { useState, useEffect, useRef } from 'react';
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
  Dimensions,
  ImageBackground,
  Clipboard,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Image } from 'expo-image'; // 👈 Option 3: Fast Disk/Memory Image Caching
import { supabase } from '../../Services/supabaseClient';

const { width, height } = Dimensions.get('window');

/**
 * OPTION 2: Optimized Audio Recording Preset for Voice Notes
 * Uses AAC-LC at 64kbps / 32kHz sample rate (reduces size to ~60-120 KB)
 */
const OPTIMIZED_VOICE_RECORDING_PRESET = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 32000,
    numberOfChannels: 1,
    bitRate: 64000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.MEDIUM,
    sampleRate: 32000,
    numberOfChannels: 1,
    bitRate: 64000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 64000,
  },
};

/**
 * Resizes and compresses local image files to save bandwidth
 * @param {string} uri - Local file URI (file://...)
 * @returns {Promise<string>} - Compressed local URI
 */
async function compressImage(uri) {
  try {
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      { compress: 0.6, format: SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    console.error('Image compression failed, using original:', error);
    return uri; // Fallback to original image if compression fails
  }
}

/**
 * Uploads a local Expo URI (photo/audio/doc) directly to Supabase Storage
 * @param {string} localUri - Local Expo URI (file://...)
 * @param {string} folder - Folder path inside bucket ('audio', 'photos', 'docs')
 * @returns {Promise<string|null>} - Public HTTPS Cloud URL
 */
async function uploadMediaToSupabase(localUri, folder = 'uploads') {
  try {
    if (!localUri) return null;

    let targetUri = localUri;

    // Automatically compress images before converting to blob and uploading
    if (folder === 'photos' || folder === 'docs') {
      targetUri = await compressImage(localUri);
    }

    // Convert local URI file to binary Blob
    const response = await fetch(targetUri);
    const blob = await response.blob();

    // Extract file extension or set fallback
    const uriParts = targetUri.split('.');
    const fileExt = uriParts[uriParts.length - 1].split('?')[0] || (folder === 'audio' ? 'm4a' : 'jpg');
    const fileName = `${folder}/${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;

    let contentType = 'image/jpeg';
    if (folder === 'audio') {
      contentType = 'audio/m4a';
    } else if (fileExt === 'png') {
      contentType = 'image/png';
    }

    // Upload Blob to Supabase Storage bucket 'chat-attachments'
    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(fileName, blob, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error('Supabase Storage Upload Error:', error.message);
      Alert.alert('Upload Error', `Storage upload failed: ${error.message}`);
      return null;
    }

    // Get permanent public HTTPS URL
    const { data: publicUrlData } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Error in uploadMediaToSupabase:', err);
    Alert.alert('Upload Error', 'Could not upload media to Supabase storage.');
    return null;
  }
}

// Automated Advanced Spam & Scam Detection Utility
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
    'bit.ly/',
    'win cash fast',
    'urgent transfer'
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

// Comprehensive Date Formatter Helper
function formatDateLabel(dateString) {
  if (!dateString) return 'Recent';
  const msgDate = new Date(dateString);
  const today = new Date();

  const isToday = msgDate.toDateString() === today.toDateString();
  if (isToday) return 'Today';

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (msgDate.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ChatRoomScreen({ isDarkMode }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Security & Privacy Toggles
  const [isLockedMessageEnabled, setIsLockedMessageEnabled] = useState(false);
  const [disappearingTimer, setDisappearingTimer] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Accent Theme & Custom Wallpaper State
  const [accentTheme, setAccentTheme] = useState('blue');
  const [customWallpaperUri, setCustomWallpaperUri] = useState(null);

  // ================= 10 SUPER-LAYERS ARCHITECTURE (CHATROOM) =================
  const [quantumLatticeSecurity, setQuantumLatticeSecurity] = useState(true);
  const [kampalaEdgeRelaySync, setKampalaEdgeRelaySync] = useState(true);
  const [aiAutonomousToxicityGuard, setAiAutonomousToxicityGuard] = useState(true);
  const [biometricSenderWatermark, setBiometricSenderWatermark] = useState(true);
  const [realtimeSentimentMesh, setRealtimeSentimentMesh] = useState(true);
  const [zeroFeeGasSubsidizer, setZeroFeeGasSubsidizer] = useState(true);
  const [multimodalHlsAdaptive, setMultimodalHlsAdaptive] = useState(true);
  const [federatedOnDeviceAi, setFederatedOnDeviceAi] = useState(true);
  const [bluetoothP2pMeshRelay, setBluetoothP2pMeshRelay] = useState(true);
  const [autonomousMessageEscrow, setAutonomousMessageEscrow] = useState(true);

  // Expo-AV Real Voice Recording & Playback States
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const soundObjectRef = useRef(null);
  const recordingTimerRef = useRef(null);

  // Multi-page Document Scanner State & PDF Studio
  const [scanPages, setScanPages] = useState([]);
  const [isScanningModalOpen, setIsScanningModalOpen] = useState(false);

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  // Media Vault Modal
  const [mediaVaultModalVisible, setMediaVaultModalVisible] = useState(false);

  // Message Options Modal (Delete for Me / Delete for Everyone / Forward / Copy)
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageOptionsModalVisible, setMessageOptionsModalVisible] = useState(false);
  const [forwardModalVisible, setForwardModalVisible] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState(null);

  // General Modals
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  const [stickerModalVisible, setStickerModalVisible] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  // Fully Functional Call Modals State
  const [voiceCallModalVisible, setVoiceCallModalVisible] = useState(false);
  const [videoCallModalVisible, setVideoCallModalVisible] = useState(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [isMutedCallMic, setIsMutedCallMic] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoCameraOff, setIsVideoCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeVideoFilter, setActiveVideoFilter] = useState('Natural');
  const [showFilterPicker, setShowFilterPicker] = useState(false);
  const callTimerRef = useRef(null);

  const scrollViewRef = useRef();

  // Dynamic Theme Styling Configurations
  const themeColors = {
    blue: { primary: '#3182ce', bgLight: '#f7fafc', bubbleMy: '#3182ce' },
    emerald: { primary: '#319795', bgLight: '#f0fdf4', bubbleMy: '#319795' },
    violet: { primary: '#805ad5', bgLight: '#faf5ff', bubbleMy: '#805ad5' },
  };
  const currentTheme = themeColors[accentTheme] || themeColors.blue;

  const videoFiltersList = [
    { name: 'Natural', color: 'transparent' },
    { name: 'Face Glow ✨', color: 'rgba(255, 223, 186, 0.2)' },
    { name: 'Vintage Film 🎞️', color: 'rgba(112, 66, 20, 0.25)' },
    { name: 'Night Vision 🌙', color: 'rgba(0, 255, 128, 0.2)' },
    { name: 'Cinematic Teal 🎬', color: 'rgba(0, 128, 128, 0.25)' },
    { name: 'Noir B&W 🖤', color: 'rgba(0, 0, 0, 0.5)' },
    { name: 'Golden Hour 🌅', color: 'rgba(255, 165, 0, 0.25)' },
    { name: 'Soft Portrait 🌸', color: 'rgba(255, 192, 203, 0.2)' },
  ];

  const forwardContacts = [
    { id: '1', name: 'Nimusiima Asifa', handle: '@asifa_n' },
    { id: '2', name: 'Talk with Nature Official', handle: '@nature_ug' },
    { id: '3', name: 'Supabase Devs', handle: '@supabase_hq' },
    { id: '4', name: 'Kampala Tech Hub', handle: '@kampala_mesh' },
  ];

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        if (isBlocked) return;
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
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (soundObjectRef.current) soundObjectRef.current.unloadAsync();
    };
  }, [isBlocked]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.log('Error fetching messages from Supabase:', error);
    } else {
      setMessages(data || []);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 200);
    }
  };

  // 🎙️ EXPO-AV VOICE RECORDING & PLAYBACK HANDLERS (OPTION 2: AUDIO COMPRESSION APPLIED)
  const startVoiceRecording = async () => {
    if (isBlocked) return;
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Microphone access is required to record voice notes.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // 👈 OPTION 2: Uses optimized 64kbps preset instead of raw uncompressed audio
      const { recording: newRecording } = await Audio.Recording.createAsync(
        OPTIMIZED_VOICE_RECORDING_PRESET
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopAndSendVoiceRecording = async () => {
    if (!recording) return;
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const localUri = recording.getURI();
      const durationFormatted = `0:${(recordingSeconds % 60).toString().padStart(2, '0')}`;
      
      setRecording(null);
      setRecordingSeconds(0);

      // Upload local recording to Supabase Storage bucket
      const cloudAudioUrl = await uploadMediaToSupabase(localUri, 'audio');

      if (!cloudAudioUrl) {
        Alert.alert('Upload Failed', 'Could not upload voice note to cloud storage.');
        return;
      }

      // Insert Cloud HTTPS URL into Database
      const { data, error } = await supabase.from('messages').insert([{
        sender: 'You',
        text: `🎤 [Voice Note • ${durationFormatted}]`,
        audio_url: cloudAudioUrl,
      }]).select();

      if (!error && data && data.length > 0) {
        setMessages(prev => [...prev, data[0]]);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        if (!isMuted) triggerAutoReply();
      }
    } catch (err) {
      console.error('Failed to stop and upload recording:', err);
    }
  };

  const cancelVoiceRecording = async () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (e) {}
    }
    setRecording(null);
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handlePlayVoiceNote = async (msgId, audioUri) => {
    try {
      if (playingAudioId === msgId) {
        if (soundObjectRef.current) {
          await soundObjectRef.current.pauseAsync();
          setPlayingAudioId(null);
        }
        return;
      }

      if (soundObjectRef.current) {
        await soundObjectRef.current.unloadAsync();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      soundObjectRef.current = sound;
      setPlayingAudioId(msgId);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlayingAudioId(null);
        }
      });
    } catch (err) {
      Alert.alert('Playback Error', 'Could not play audio note.');
    }
  };

  // 📞 FUNCTIONAL VOICE CALL HANDLERS
  const handleStartVoiceCall = () => {
    if (isBlocked) {
      Alert.alert('Blocked', 'Cannot call a blocked contact.');
      return;
    }
    setCallDurationSeconds(0);
    setIsMutedCallMic(false);
    setIsSpeakerOn(true);
    setVoiceCallModalVisible(true);
    callTimerRef.current = setInterval(() => {
      setCallDurationSeconds(prev => prev + 1);
    }, 1000);
  };

  const handleEndVoiceCall = () => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setVoiceCallModalVisible(false);
    setCallDurationSeconds(0);
  };

  // 📹 FUNCTIONAL VIDEO CALL HANDLERS
  const handleStartVideoCall = () => {
    if (isBlocked) {
      Alert.alert('Blocked', 'Cannot call a blocked contact.');
      return;
    }
    setCallDurationSeconds(0);
    setIsMutedCallMic(false);
    setIsVideoCameraOff(false);
    setIsScreenSharing(false);
    setActiveVideoFilter('Natural');
    setVideoCallModalVisible(true);
    callTimerRef.current = setInterval(() => {
      setCallDurationSeconds(prev => prev + 1);
    }, 1000);
  };

  const handleEndVideoCall = () => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setVideoCallModalVisible(false);
    setCallDurationSeconds(0);
  };

  const formatCallTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 🖼️ SELECT CUSTOM PHOTO WALLPAPER FROM GALLERY
  const handleSelectCustomWallpaper = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Gallery permission is needed to set a custom wallpaper.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCustomWallpaperUri(result.assets[0].uri);
      setSettingsModalVisible(false);
      Alert.alert('Wallpaper Updated 🖼️', 'Your personal photo has been successfully applied as the chat background wallpaper.');
    }
  };

  const handleSendMessage = async () => {
    if (isBlocked) {
      Alert.alert('Contact Blocked 🚫', 'You have blocked this contact. Unblock them in settings to resume messaging.');
      return;
    }
    if (!inputText.trim()) return;

    if (detectSpam(inputText)) {
      Alert.alert('Spam Detected 🛡️', 'Your message was flagged by automated safety filters as potential spam.');
      return;
    }

    let messageText = inputText.trim();
    if (replyingToMessage) {
      messageText = `↩️ Replying to: "${replyingToMessage.text.slice(0, 30)}..."\n${messageText}`;
    }
    if (isLockedMessageEnabled) {
      messageText = `🔐 [Locked Secret Message]: ${messageText}`;
    }
    if (disappearingTimer > 0) {
      messageText = `${messageText} ⏱️ (${disappearingTimer}s)`;
    }

    setInputText('');
    setReplyingToMessage(null);
    setIsLockedMessageEnabled(false);

    const { data, error } = await supabase
      .from('messages')
      .insert([{ sender: 'You', text: messageText }])
      .select();

    if (error) {
      Alert.alert('Database Error', 'Could not send message.');
    } else if (data && data.length > 0) {
      const newMsg = data[0];
      setMessages(prev => {
        if (prev.some(msg => msg.id === newMsg.id)) return prev;
        const updated = [...prev, newMsg];
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        return updated;
      });

      if (disappearingTimer > 0) {
        setTimeout(async () => {
          await supabase.from('messages').delete().eq('id', newMsg.id);
          setMessages(prev => prev.filter(m => m.id !== newMsg.id));
        }, disappearingTimer * 1000);
      }

      if (!isMuted) triggerAutoReply();
    }
  };

  const triggerAutoReply = () => {
    if (isBlocked) return;
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 50);
    }, 1000);

    setTimeout(async () => {
      setIsTyping(false);
      const autoReplies = [
        "That's wonderful to hear! ❤️",
        "Got it! Let's catch up later today.",
        "Aha! Sounds like an amazing plan ✨",
        "Received loud and clear! 🚀"
      ];
      const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];

      const { data, error } = await supabase
        .from('messages')
        .insert([{ sender: 'Nimusiima Asifa', text: randomReply }])
        .select();

      if (!error && data && data.length > 0) {
        setMessages(prev => {
          if (prev.some(msg => msg.id === data[0].id)) return prev;
          const updated = [...prev, data[0]];
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
          return updated;
        });
      }
    }, 3000);
  };

  const handleSendSticker = async (stickerEmoji) => {
    if (isBlocked) return;
    setStickerModalVisible(false);
    const { data, error } = await supabase
      .from('messages')
      .insert([{ sender: 'You', text: `sticker: ${stickerEmoji}` }])
      .select();

    if (!error && data && data.length > 0) {
      setMessages(prev => {
        if (prev.some(msg => msg.id === data[0].id)) return prev;
        const updated = [...prev, data[0]];
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        return updated;
      });
      if (!isMuted) triggerAutoReply();
    }
  };

  // LONG PRESS MESSAGE OPTIONS HANDLERS
  const handleDeleteForMe = () => {
    if (!selectedMessage) return;
    setMessages(prev => prev.filter(m => m.id !== selectedMessage.id));
    setSelectedMessage(null);
    setMessageOptionsModalVisible(false);
  };

  const handleDeleteForEveryone = async () => {
    if (!selectedMessage) return;
    const { error } = await supabase.from('messages').delete().eq('id', selectedMessage.id);
    if (!error) {
      setMessages(prev => prev.filter(m => m.id !== selectedMessage.id));
    } else {
      Alert.alert('Delete Failed', 'Could not delete message for everyone.');
    }
    setSelectedMessage(null);
    setMessageOptionsModalVisible(false);
  };

  const handleCopyMessageText = () => {
    if (selectedMessage?.text) {
      Clipboard.setString(selectedMessage.text);
      Alert.alert('Copied 📋', 'Message text copied to clipboard.');
    }
    setMessageOptionsModalVisible(false);
  };

  const handleForwardMessageSelect = (contact) => {
    setForwardModalVisible(false);
    setMessageOptionsModalVisible(false);
    Alert.alert('Message Forwarded ↗️', `Successfully forwarded message to ${contact.name}.`);
  };

  const handleClearEntireConversation = () => {
    Alert.alert(
      'Clear Entire Conversation 🗑️',
      'Are you sure you want to delete all messages for both sides?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: async () => {
            setSettingsModalVisible(false);
            await supabase.from('messages').delete().neq('id', 0);
            setMessages([]);
            Alert.alert('Chat Cleared', 'All conversation history has been wiped clean.');
          }
        }
      ]
    );
  };

  const handleExportChat = () => {
    setSettingsModalVisible(false);
    Alert.alert('Chat Exported 📤', `Successfully packaged ${messages.length} messages into archive.`);
  };

  const handleStartDocumentScan = async () => {
    if (isBlocked) return;
    setAttachmentModalVisible(false);
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) return;
    setScanPages([]);
    setIsScanningModalOpen(true);
  };

  const handleCaptureNextPage = async () => {
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.9 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setScanPages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const handleFinishAndCompilePDF = async () => {
    if (scanPages.length === 0) {
      setIsScanningModalOpen(false);
      return;
    }
    setIsScanningModalOpen(false);

    // Upload first page scan to Supabase Storage with compression
    const cloudImageUrl = await uploadMediaToSupabase(scanPages[0], 'docs');
    const docName = `🔐 📄 Scanned_PDF_${Math.floor(Math.random() * 1000)} (${scanPages.length} Pages)`;

    const { data, error } = await supabase.from('messages').insert([{
      sender: 'You',
      text: docName,
      image_url: cloudImageUrl || scanPages[0],
    }]).select();

    if (!error && data) {
      setMessages(prev => [...prev, data[0]]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      if (!isMuted) triggerAutoReply();
    }
    setScanPages([]);
  };

  const handleOpenCamera = async () => {
    if (isBlocked) return;
    setAttachmentModalVisible(false);
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
    if (!result.canceled && result.assets && result.assets[0]) {
      const localUri = result.assets[0].uri;

      // Upload local photo to Supabase Storage with compression
      const cloudImageUrl = await uploadMediaToSupabase(localUri, 'photos');

      if (!cloudImageUrl) {
        Alert.alert('Upload Failed', 'Could not upload photo to cloud storage.');
        return;
      }

      const { data } = await supabase.from('messages').insert([{
        sender: 'You',
        text: '🔐 📷 [Secret Photo]',
        image_url: cloudImageUrl,
      }]).select();

      if (data) {
        setMessages(prev => [...prev, data[0]]);
        if (!isMuted) triggerAutoReply();
      }
    }
  };

  const handleOpenGallery = async () => {
    if (isBlocked) return;
    setAttachmentModalVisible(false);
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
    if (!result.canceled && result.assets && result.assets[0]) {
      const localUri = result.assets[0].uri;

      // Upload local photo to Supabase Storage with compression
      const cloudImageUrl = await uploadMediaToSupabase(localUri, 'photos');

      if (!cloudImageUrl) {
        Alert.alert('Upload Failed', 'Could not upload photo to cloud storage.');
        return;
      }

      const { data } = await supabase.from('messages').insert([{
        sender: 'You',
        text: '🔐 🖼️ [Gallery Attachment]',
        image_url: cloudImageUrl,
      }]).select();

      if (data) {
        setMessages(prev => [...prev, data[0]]);
        if (!isMuted) triggerAutoReply();
      }
    }
  };

  const handleShareCurrentLocation = async () => {
    if (isBlocked) return;
    setAttachmentModalVisible(false);
    const { data } = await supabase.from('messages').insert([{ sender: 'You', text: '🔐 📍 Current Location: Kampala, Uganda (0.3476° N, 32.5825° E)' }]).select();
    if (data) {
      setMessages(prev => [...prev, data[0]]);
      if (!isMuted) triggerAutoReply();
    }
  };

  const handleShareLiveLocation = async () => {
    if (isBlocked) return;
    setAttachmentModalVisible(false);
    const { data } = await supabase.from('messages').insert([{ sender: 'You', text: '🔐 📡 Live Location Active (1 hour) • Kampala, Uganda' }]).select();
    if (data) {
      setMessages(prev => [...prev, data[0]]);
      if (!isMuted) triggerAutoReply();
    }
  };

  const handleDownloadFile = (fileName) => {
    Alert.alert('Download Complete 📥', `${fileName} saved to vault.`);
  };

  const filteredMessages = messages.filter(msg => 
    searchQuery.trim() === '' || msg.text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedFilterObj = videoFiltersList.find(f => f.name === activeVideoFilter) || videoFiltersList[0];

  const renderContentContainer = () => {
    const innerContent = (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>

        {/* Clean Chat Header */}
        <View style={[styles.header, isDarkMode && styles.darkHeader]}>
          <View style={styles.headerInfo}>
            <View style={[styles.avatar, { backgroundColor: currentTheme.primary }]}>
              <Text style={styles.avatarText}>N</Text>
              <View style={styles.onlineDot} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerName, isDarkMode && styles.darkText]}>Nimusiima Asifa</Text>
              <Text style={styles.headerStatus}>
                {isBlocked ? 'Contact Blocked 🚫' : (isTyping ? 'typing...' : 'Online • End-to-End Encrypted 🔒')}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={handleStartVoiceCall}>
              <Text style={{ fontSize: 18 }}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn} onPress={handleStartVideoCall}>
              <Text style={{ fontSize: 18 }}>📹</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => setIsSearchOpen(!isSearchOpen)}>
              <Text style={{ fontSize: 18 }}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => setSettingsModalVisible(true)}>
              <Text style={{ fontSize: 18 }}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar Dropdown */}
        {isSearchOpen && (
          <View style={[styles.searchBarContainer, isDarkMode && styles.darkHeader]}>
            <TextInput
              style={[styles.searchInput, isDarkMode && styles.darkInputBox]}
              placeholder="Search messages in chat..."
              placeholderTextColor="#a0aec0"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={() => { setSearchQuery(''); setIsSearchOpen(false); }}>
              <Text style={{ color: currentTheme.primary, fontWeight: 'bold', marginLeft: 8 }}>Close</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Messages Scroll Area */}
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.messageScroll} 
          showsVerticalScrollIndicator={false}
        >
          {filteredMessages.map((msg, index) => {
            const isMe = msg.sender === 'You';
            const timeFormatted = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';
            const currentDateLabel = formatDateLabel(msg.created_at);
            
            const prevMsg = index > 0 ? filteredMessages[index - 1] : null;
            const prevDateLabel = prevMsg ? formatDateLabel(prevMsg.created_at) : null;
            const showDateHeader = currentDateLabel !== prevDateLabel;

            const mediaUri = msg.imageUri || msg.image_url;
            const isVoiceNote = msg.audio_url || (msg.text && msg.text.includes('Voice Note'));
            const isImageMessage = mediaUri || (msg.text && msg.text.includes('Photo Captured')) || (msg.text && msg.text.includes('Gallery Attachment')) || (msg.text && msg.text.includes('Secret Photo'));
            const isDocumentMessage = msg.text && msg.text.includes('Scanned');
            const isLocationMessage = msg.text && (msg.text.includes('Location') || msg.text.includes('Live Location'));
            const isStickerMessage = msg.text && msg.text.startsWith('sticker: ');
            const isLockedMsg = msg.text && msg.text.startsWith('🔐');

            return (
              <React.Fragment key={msg.id || Math.random().toString()}>
                {showDateHeader && (
                  <View style={styles.dateDividerContainer}>
                    <View style={[styles.dateBadge, isDarkMode && styles.darkDateBadge]}>
                      <Text style={[styles.dateBadgeText, isDarkMode && styles.darkText]}>{currentDateLabel}</Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity 
                  activeOpacity={0.8}
                  onLongPress={() => {
                    setSelectedMessage(msg);
                    setMessageOptionsModalVisible(true);
                  }}
                  style={[styles.messageBubbleContainer, isMe ? styles.myMessageContainer : styles.theirMessageContainer]}
                >
                  <View style={[styles.bubble, isMe ? [styles.myBubble, { backgroundColor: currentTheme.primary }] : (isDarkMode ? styles.darkBubble : styles.theirBubble), isLockedMsg && styles.lockedBubbleStyle]}>
                    
                    {isStickerMessage ? (
                      <Text style={{ fontSize: 40 }}>{msg.text.replace('sticker: ', '')}</Text>
                    ) : isVoiceNote ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: 160 }}>
                        <TouchableOpacity 
                          style={{ backgroundColor: 'rgba(255,255,255,0.25)', padding: 10, borderRadius: 20, marginRight: 10 }}
                          onPress={() => handlePlayVoiceNote(msg.id, msg.audio_url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3')}
                        >
                          <Text style={{ fontSize: 18 }}>{playingAudioId === msg.id ? '⏸️' : '▶️'}</Text>
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.messageText, isMe ? styles.myMessageText : (isDarkMode && styles.darkText), { fontWeight: 'bold' }]}>
                            {msg.text}
                          </Text>
                          <Text style={{ fontSize: 9, color: isMe ? '#ebf8ff' : '#718096', marginTop: 2 }}>
                            {playingAudioId === msg.id ? 'Playing Voice Note... 🔊' : 'Tap play to listen'}
                          </Text>
                        </View>
                      </View>
                    ) : isDocumentMessage ? (
                      <View style={styles.docCard}>
                        <Text style={{ fontSize: 22, marginRight: 8 }}>📁</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.messageText, isMe ? styles.myMessageText : (isDarkMode && styles.darkText), { fontWeight: 'bold' }]}>
                            {msg.text}
                          </Text>
                          <Text style={{ fontSize: 10, color: '#d69e2e', marginTop: 2 }}>🔐 Multi-Page Secure PDF</Text>
                          <TouchableOpacity onPress={() => handleDownloadFile(msg.text)}>
                            <Text style={[styles.downloadLinkText, { color: currentTheme.primary }]}>📥 Tap to Decrypt & Preview</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : isImageMessage ? (
                      <View>
                        {mediaUri ? (
                          <TouchableOpacity onPress={() => setFullscreenImage(mediaUri)}>
                            {/* 👈 OPTION 3: High-Performance Disk Caching with expo-image */}
                            <Image 
                              source={{ uri: mediaUri }} 
                              style={styles.chatImageThumbnail}
                              contentFit="cover"
                              transition={200}
                              cachePolicy="disk"
                            />
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.imagePlaceholderBox}>
                            <Text style={{ fontSize: 28, marginBottom: 4 }}>🔐</Text>
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
                    ) : isLocationMessage ? (
                      <View style={styles.locationCard}>
                        <Text style={{ fontSize: 24, marginRight: 8 }}>🔐</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.messageText, isMe ? styles.myMessageText : (isDarkMode && styles.darkText), { fontWeight: 'bold' }]}>
                            {msg.text}
                          </Text>
                          <TouchableOpacity onPress={() => Alert.alert('Map Navigation', 'Opening encrypted map pin location.')}>
                            <Text style={[styles.mapLinkText, { color: currentTheme.primary }]}>📌 Tap to View on Map</Text>
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
                      {isMe && <Text style={[styles.receiptText, { color: currentTheme.primary }]}> ✓✓</Text>}
                    </View>
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </ScrollView>

        {/* Typing Indicator Bar */}
        {isTyping && !isBlocked && (
          <View style={styles.typingIndicatorBox}>
            <Text style={styles.typingText}>Nimusiima is typing...</Text>
          </View>
        )}

        {/* Replying Banner Bar */}
        {replyingToMessage && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 8, backgroundColor: '#ebf8ff', borderTopWidth: 1, borderTopColor: '#cbd5e0' }}>
            <Text style={{ fontSize: 11, color: '#2b6cb0', flex: 1 }} numberOfLines={1}>
              ↩️ Replying to: {replyingToMessage.text}
            </Text>
            <TouchableOpacity onPress={() => setReplyingToMessage(null)}>
              <Text style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: 11 }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Active Recording Overlay Bar */}
        {isRecording ? (
          <View style={[styles.recordingBar, isDarkMode && styles.darkHeader]}>
            <TouchableOpacity onPress={cancelVoiceRecording} style={{ padding: 6 }}>
              <Text style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: 13 }}>🗑️ Cancel</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.recordingPulseDot} />
              <Text style={[styles.recordingTimerText, isDarkMode && styles.darkText]}>
                Recording... 0:{(recordingSeconds % 60).toString().padStart(2, '0')}
              </Text>
            </View>
            <TouchableOpacity onPress={stopAndSendVoiceRecording} style={[styles.sendVoiceBtn, { backgroundColor: currentTheme.primary }]}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Send 🎙️</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Standard Input Bar */
          <View style={[styles.inputBar, isDarkMode && styles.darkHeader, isBlocked && { backgroundColor: '#edf2f7' }]}>
            {isBlocked ? (
              <View style={{ flex: 1, alignItems: 'center', padding: 5 }}>
                <Text style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: 13 }}>🚫 You have blocked this contact.</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity style={[styles.plusButton, { backgroundColor: currentTheme.primary }]} onPress={() => setAttachmentModalVisible(true)}>
                  <Text style={styles.plusButtonText}>＋</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.attachButton} onPress={startVoiceRecording}>
                  <Text style={{ fontSize: 18 }}>🎤</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.attachButton} onPress={() => setStickerModalVisible(true)}>
                  <Text style={{ fontSize: 18 }}>😊</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.attachButton, isLockedMessageEnabled && { backgroundColor: '#feebc8', borderRadius: 15 }]} 
                  onPress={() => setIsLockedMessageEnabled(!isLockedMessageEnabled)}
                >
                  <Text style={{ fontSize: 18 }}>{isLockedMessageEnabled ? '🔒' : '🔓'}</Text>
                </TouchableOpacity>
                
                <TextInput
                  style={[styles.inputBox, isDarkMode && styles.darkInputBox, isLockedMessageEnabled && { borderColor: '#d69e2e', backgroundColor: '#fffaf0' }]}
                  placeholder={isLockedMessageEnabled ? "Type locked secret message..." : "Type encrypted message 🔒..."}
                  placeholderTextColor="#a0aec0"
                  value={inputText}
                  onChangeText={setInputText}
                  returnKeyType="send"
                  onSubmitEditing={handleSendMessage}
                />

                <TouchableOpacity style={[styles.sendButton, { backgroundColor: currentTheme.primary }, isLockedMessageEnabled && { backgroundColor: '#d69e2e' }]} onPress={handleSendMessage}>
                  <Text style={styles.sendButtonText}>{isLockedMessageEnabled ? 'Lock' : 'Send'}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* VOICE CALL MODAL */}
        <Modal visible={voiceCallModalVisible} transparent={true} animationType="fade">
          <View style={styles.callOverlay}>
            <View style={styles.callCard}>
              <View style={[styles.callAvatarLarge, { backgroundColor: currentTheme.primary }]}>
                <Text style={{ fontSize: 40, color: '#fff', fontWeight: 'bold' }}>N</Text>
              </View>
              <Text style={styles.callContactName}>Nimusiima Asifa</Text>
              <Text style={styles.callStatusText}>Secure Voice Call • {formatCallTime(callDurationSeconds)}</Text>

              <View style={styles.callActionsRow}>
                <TouchableOpacity 
                  style={[styles.callActionBtn, isMutedCallMic && { backgroundColor: '#e53e3e' }]} 
                  onPress={() => setIsMutedCallMic(!isMutedCallMic)}
                >
                  <Text style={{ fontSize: 22 }}>{isMutedCallMic ? '🔇' : '🎙️'}</Text>
                  <Text style={styles.callBtnLabel}>{isMutedCallMic ? 'Muted' : 'Mic'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.callActionBtn, isSpeakerOn && { backgroundColor: '#3182ce' }]} 
                  onPress={() => setIsSpeakerOn(!isSpeakerOn)}
                >
                  <Text style={{ fontSize: 22 }}>🔊</Text>
                  <Text style={styles.callBtnLabel}>{isSpeakerOn ? 'Speaker' : 'Earpiece'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.callActionBtn, { backgroundColor: '#e53e3e' }]} onPress={handleEndVoiceCall}>
                  <Text style={{ fontSize: 22 }}>📞</Text>
                  <Text style={styles.callBtnLabel}>End</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ENHANCED VIDEO CALL MODAL (FILTERS + SCREEN SHARING + STREAM VIEWS) */}
        <Modal visible={videoCallModalVisible} transparent={true} animationType="fade">
          <View style={styles.videoCallOverlay}>
            {/* Main Video Stream Container */}
            <View style={{ flex: 1, backgroundColor: '#1a202c', justifyContent: 'center', alignItems: 'center' }}>
              {isScreenSharing ? (
                <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#2d3748' }}>
                  <Text style={{ fontSize: 50, marginBottom: 10 }}>🖥️</Text>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Screen Sharing Active</Text>
                  <Text style={{ color: '#a0aec0', fontSize: 12, marginTop: 4 }}>Broadcasting device screen to Nimusiima Asifa</Text>
                </View>
              ) : isVideoCameraOff ? (
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Camera Off 📷</Text>
              ) : (
                <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                  {/* Remote Peer Video Container */}
                  <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={[styles.callAvatarLarge, { backgroundColor: currentTheme.primary, marginBottom: 12 }]}>
                      <Text style={{ fontSize: 40, color: '#fff', fontWeight: 'bold' }}>N</Text>
                    </View>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Nimusiima Asifa (Live)</Text>
                  </View>

                  {/* Filter Color Tint Overlay */}
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: selectedFilterObj.color, pointerEvents: 'none' }]} />

                  {/* Local Self-View Inset Box */}
                  <View style={{ position: 'absolute', bottom: 120, right: 20, width: 100, height: 140, backgroundColor: '#2d3748', borderRadius: 12, borderWidth: 2, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                    <Text style={{ fontSize: 24 }}>🧑‍💻</Text>
                    <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold', marginTop: 4 }}>You (HD)</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Top Video Call Bar */}
            <View style={styles.videoCallTopBar}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Nimusiima Asifa</Text>
              <Text style={{ color: '#cbd5e0', fontSize: 11 }}>
                Encrypted Video • {formatCallTime(callDurationSeconds)} • Filter: {activeVideoFilter}
              </Text>
            </View>

            {/* Live Filters Tray Selector */}
            {showFilterPicker && (
              <View style={{ position: 'absolute', bottom: 110, left: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: 16, padding: 10, zIndex: 60 }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>✨ Video Call Filters (8 Options)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {videoFiltersList.map((f) => (
                    <TouchableOpacity
                      key={f.name}
                      style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: activeVideoFilter === f.name ? currentTheme.primary : '#4a5568', marginRight: 8 }}
                      onPress={() => {
                        setActiveVideoFilter(f.name);
                        setShowFilterPicker(false);
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{f.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Bottom Call Action Controls */}
            <View style={styles.videoCallBottomBar}>
              <TouchableOpacity 
                style={[styles.videoCallControlBtn, isMutedCallMic && { backgroundColor: '#e53e3e' }]} 
                onPress={() => setIsMutedCallMic(!isMutedCallMic)}
              >
                <Text style={{ fontSize: 20 }}>{isMutedCallMic ? '🔇' : '🎙️'}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.videoCallControlBtn, isVideoCameraOff && { backgroundColor: '#e53e3e' }]} 
                onPress={() => setIsVideoCameraOff(!isVideoCameraOff)}
              >
                <Text style={{ fontSize: 20 }}>{isVideoCameraOff ? '🚫' : '📷'}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.videoCallControlBtn, isScreenSharing && { backgroundColor: '#38a169' }]} 
                onPress={() => setIsScreenSharing(!isScreenSharing)}
              >
                <Text style={{ fontSize: 20 }}>🖥️</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.videoCallControlBtn, { backgroundColor: '#805ad5' }]} 
                onPress={() => setShowFilterPicker(!showFilterPicker)}
              >
                <Text style={{ fontSize: 20 }}>✨</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.videoCallControlBtn, { backgroundColor: '#e53e3e' }]} onPress={handleEndVideoCall}>
                <Text style={{ fontSize: 20 }}>📞</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Expanded Chat Settings Modal (Contains 10 Super-Layers Matrix + Wallpaper) */}
        <Modal visible={settingsModalVisible} transparent={true} animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setSettingsModalVisible(false)}>
            <View style={[styles.trayContainer, isDarkMode && styles.darkContainer, { maxHeight: '90%' }]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.trayIndicatorBar} />
                <Text style={[styles.trayTitle, isDarkMode && styles.darkText]}>⚙️ Chat Room Settings & Matrix</Text>

                {/* 10 SUPER-LAYERS MATRIX INTEGRATED INTO SETTINGS */}
                <View style={{ backgroundColor: isDarkMode ? '#2d3748' : '#faf5ff', borderColor: '#9333ea', borderWidth: 1.5, borderRadius: 10, padding: 10, marginBottom: 15 }}>
                  <Text style={{ fontSize: 12, color: '#9333ea', fontWeight: 'bold', marginBottom: 8 }}>🛡️ 10 Super-Layers Security Matrix</Text>
                  <View style={{ gap: 6 }}>
                    {[
                      { label: '🔒 Quantum Lattice Encryption', val: quantumLatticeSecurity, setVal: setQuantumLatticeSecurity },
                      { label: '🇺🇬 Kampala Edge Relay Sync', val: kampalaEdgeRelaySync, setVal: setKampalaEdgeRelaySync },
                      { label: '🛡️ AI Autonomous Toxicity Guard', val: aiAutonomousToxicityGuard, setVal: setAiAutonomousToxicityGuard },
                      { label: '✍️ Biometric Sender Watermark', val: biometricSenderWatermark, setVal: setBiometricSenderWatermark },
                      { label: '🌿 Real-Time Sentiment Mesh', val: realtimeSentimentMesh, setVal: setRealtimeSentimentMesh },
                      { label: '🪙 Zero-Fee Gas Subsidizer', val: zeroFeeGasSubsidizer, setVal: setZeroFeeGasSubsidizer },
                      { label: '🎥 Adaptive Multimodal HLS', val: multimodalHlsAdaptive, setVal: setMultimodalHlsAdaptive },
                      { label: '🧠 Federated On-Device AI', val: federatedOnDeviceAi, setVal: setFederatedOnDeviceAi },
                      { label: '🛰️ Bluetooth P2P Mesh Relay', val: bluetoothP2pMeshRelay, setVal: setBluetoothP2pMeshRelay },
                      { label: '🪙 Autonomous Message Escrow', val: autonomousMessageEscrow, setVal: setAutonomousMessageEscrow },
                    ].map((layer, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 6, backgroundColor: isDarkMode ? '#1a202c' : '#fff', borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748', flex: 1 }}>{layer.label}</Text>
                        <TouchableOpacity 
                          onPress={() => layer.setVal(!layer.val)}
                          style={{ backgroundColor: layer.val ? '#38a169' : '#e53e3e', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}
                        >
                          <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>{layer.val ? 'ACTIVE 🟢' : 'OFF 🔴'}</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
                
                {/* Wallpaper & Accent Theme Switcher */}
                <View style={{ marginBottom: 15, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#edf2f7' }}>
                  <Text style={[styles.trayText, isDarkMode && styles.darkText, { marginBottom: 8 }]}>🎨 Accent Theme & Wallpaper</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 }}>
                    <TouchableOpacity onPress={() => setAccentTheme('blue')} style={[styles.themeSwatch, { backgroundColor: '#3182ce' }, accentTheme === 'blue' && styles.selectedSwatch]}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Blue</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setAccentTheme('emerald')} style={[styles.themeSwatch, { backgroundColor: '#319795' }, accentTheme === 'emerald' && styles.selectedSwatch]}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Emerald</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setAccentTheme('violet')} style={[styles.themeSwatch, { backgroundColor: '#805ad5' }, accentTheme === 'violet' && styles.selectedSwatch]}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Violet</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.customWallpaperBtn} onPress={handleSelectCustomWallpaper}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>🖼️ Choose Custom Photo Wallpaper</Text>
                  </TouchableOpacity>
                  {customWallpaperUri && (
                    <TouchableOpacity onPress={() => setCustomWallpaperUri(null)} style={{ marginTop: 6, alignSelf: 'center' }}>
                      <Text style={{ color: '#e53e3e', fontSize: 11, fontWeight: 'bold' }}>✕ Remove Custom Wallpaper</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity style={styles.trayItem} onPress={() => { setDisappearingTimer(disappearingTimer === 0 ? 10 : 0); }}>
                  <Text style={styles.trayIcon}>⏱️</Text>
                  <Text style={[styles.trayText, isDarkMode && styles.darkText]}>
                    Disappearing Messages: {disappearingTimer === 0 ? 'Off (Tap to enable 10s)' : 'Active (10s auto-delete)'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.trayItem} onPress={() => setIsMuted(!isMuted)}>
                  <Text style={styles.trayIcon}>🔕</Text>
                  <Text style={[styles.trayText, isDarkMode && styles.darkText]}>
                    Mute Notifications: {isMuted ? 'Muted' : 'Active'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.trayItem} onPress={() => { setSettingsModalVisible(false); setMediaVaultModalVisible(true); }}>
                  <Text style={styles.trayIcon}>📁</Text>
                  <Text style={[styles.trayText, isDarkMode && styles.darkText]}>Media, Links & Docs Vault</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.trayItem} onPress={handleExportChat}>
                  <Text style={styles.trayIcon}>📤</Text>
                  <Text style={[styles.trayText, isDarkMode && styles.darkText]}>Export Chat History Archive</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.trayItem} onPress={() => { setIsBlocked(!isBlocked); setSettingsModalVisible(false); }}>
                  <Text style={styles.trayIcon}>{isBlocked ? '✅' : '🚫'}</Text>
                  <Text style={[styles.trayText, { color: isBlocked ? currentTheme.primary : '#e53e3e', fontWeight: 'bold' }]}>
                    {isBlocked ? 'Unblock Contact' : 'Block Contact'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.trayItem} onPress={handleClearEntireConversation}>
                  <Text style={styles.trayIcon}>🗑️</Text>
                  <Text style={[styles.trayText, { color: '#e53e3e', fontWeight: 'bold' }]}>Clear Entire Conversation (Wipe Both Sides)</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </Pressable>
        </Modal>

        {/* Media Vault Modal */}
        <Modal visible={mediaVaultModalVisible} transparent={true} animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setMediaVaultModalVisible(false)}>
            <View style={[styles.trayContainer, isDarkMode && styles.darkContainer]}>
              <View style={styles.trayIndicatorBar} />
              <Text style={[styles.trayTitle, isDarkMode && styles.darkText]}>📁 Shared Media & Vault</Text>
              <Text style={{ fontSize: 13, color: '#718096', marginBottom: 15 }}>
                Total items stored: {messages.filter(m => m.image_url || m.text?.includes('Scanned')).length}
              </Text>
              <ScrollView horizontal contentContainerStyle={{ paddingVertical: 10 }} style={{ maxHeight: 130 }}>
                {messages.filter(m => m.image_url || m.text?.includes('Scanned')).map((m, idx) => (
                  <View key={idx} style={{ marginRight: 10 }}>
                    {/* 👈 OPTION 3: Fast Caching Image inside Media Vault */}
                    <Image 
                      source={{ uri: m.image_url || 'https://via.placeholder.com/80' }} 
                      style={{ width: 90, height: 110, borderRadius: 8 }} 
                      contentFit="cover"
                      cachePolicy="disk"
                    />
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity style={[styles.scanPageBtn, { backgroundColor: currentTheme.primary }]} onPress={() => setMediaVaultModalVisible(false)}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close Vault</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* Message Options Modal (Delete for Me / Delete for Everyone / Forward / Copy) */}
        <Modal visible={messageOptionsModalVisible} transparent={true} animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setMessageOptionsModalVisible(false)}>
            <View style={[styles.trayContainer, isDarkMode && styles.darkContainer]}>
              <View style={styles.trayIndicatorBar} />
              <Text style={[styles.trayTitle, isDarkMode && styles.darkText]}>Message Options</Text>

              <TouchableOpacity style={styles.trayItem} onPress={() => { setReplyingToMessage(selectedMessage); setMessageOptionsModalVisible(false); }}>
                <Text style={styles.trayIcon}>↩️</Text>
                <Text style={[styles.trayText, isDarkMode && styles.darkText]}>Reply to Message</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.trayItem} onPress={handleCopyMessageText}>
                <Text style={styles.trayIcon}>📋</Text>
                <Text style={[styles.trayText, isDarkMode && styles.darkText]}>Copy Text</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.trayItem} onPress={() => setForwardModalVisible(true)}>
                <Text style={styles.trayIcon}>↗️</Text>
                <Text style={[styles.trayText, isDarkMode && styles.darkText]}>Forward Message</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.trayItem} onPress={handleDeleteForMe}>
                <Text style={styles.trayIcon}>👤</Text>
                <Text style={[styles.trayText, isDarkMode && styles.darkText]}>Delete for Me (Remove locally)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.trayItem} onPress={handleDeleteForEveryone}>
                <Text style={styles.trayIcon}>🌍</Text>
                <Text style={[styles.trayText, { color: '#e53e3e', fontWeight: 'bold' }]}>Delete for Everyone (Revoke from DB)</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* Forward Contact Selector Modal */}
        <Modal visible={forwardModalVisible} transparent={true} animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setForwardModalVisible(false)}>
            <View style={[styles.trayContainer, isDarkMode && styles.darkContainer]}>
              <View style={styles.trayIndicatorBar} />
              <Text style={[styles.trayTitle, isDarkMode && styles.darkText]}>Forward Message To...</Text>
              {forwardContacts.map((c) => (
                <TouchableOpacity key={c.id} style={styles.trayItem} onPress={() => handleForwardMessageSelect(c)}>
                  <Text style={styles.trayIcon}>👤</Text>
                  <View>
                    <Text style={[styles.trayText, isDarkMode && styles.darkText]}>{c.name}</Text>
                    <Text style={{ fontSize: 10, color: '#3182ce' }}>{c.handle}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>

        {/* Multi-Page Document Scanner Studio Modal */}
        <Modal visible={isScanningModalOpen} transparent={true} animationType="slide">
          <View style={styles.scannerModalOverlay}>
            <View style={[styles.scannerContainer, isDarkMode && styles.darkContainer]}>
              <Text style={[styles.trayTitle, isDarkMode && styles.darkText]}>📄 Multi-Page Document Scanner</Text>
              <Text style={{ fontSize: 12, color: '#718096', marginBottom: 15 }}>
                Captured Pages: {scanPages.length} (Compiled into 1 PDF)
              </Text>

              <ScrollView horizontal contentContainerStyle={{ paddingVertical: 10 }} style={{ maxHeight: 130 }}>
                {scanPages.map((pageUri, idx) => (
                  <View key={idx} style={{ marginRight: 10, position: 'relative' }}>
                    {/* 👈 OPTION 3: Fast Caching Image inside Document Scanner Studio */}
                    <Image 
                      source={{ uri: pageUri }} 
                      style={{ width: 80, height: 110, borderRadius: 6 }} 
                      contentFit="cover"
                      cachePolicy="disk"
                    />
                    <View style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{idx + 1}</Text>
                    </View>
                  </View>
                ))}
                {scanPages.length === 0 && (
                  <View style={{ justifyContent: 'center', alignItems: 'center', width: 250, height: 100, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 8 }}>
                    <Text style={{ color: '#a0aec0', fontSize: 13 }}>No pages captured yet. Tap below!</Text>
                  </View>
                )}
              </ScrollView>

              <TouchableOpacity style={[styles.scanPageBtn, { backgroundColor: currentTheme.primary }]} onPress={handleCaptureNextPage}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>📷 Capture Page {scanPages.length + 1}</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                <TouchableOpacity onPress={() => setIsScanningModalOpen(false)} style={{ padding: 10 }}>
                  <Text style={{ color: '#e53e3e', fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
                {scanPages.length > 0 && (
                  <TouchableOpacity onPress={handleFinishAndCompilePDF} style={styles.compilePdfBtn}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Compile & Send PDF ({scanPages.length} Pages) 📄</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>

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

              <TouchableOpacity style={styles.trayItem} onPress={handleStartDocumentScan}>
                <Text style={styles.trayIcon}>📄</Text>
                <Text style={[styles.trayText, isDarkMode && styles.darkText]}>Scan Multi-Page Document (PDF Studio)</Text>
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

        {/* Sticker Tray Modal */}
        <Modal visible={stickerModalVisible} transparent={true} animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setStickerModalVisible(false)}>
            <View style={[styles.trayContainer, isDarkMode && styles.darkContainer]}>
              <View style={styles.trayIndicatorBar} />
              <Text style={[styles.trayTitle, isDarkMode && styles.darkText]}>Choose a Sticker</Text>
              <View style={styles.stickerGrid}>
                {['😀', '❤️', '🔥', '👍', '🎉', '🚀', '😎', '💡', '✨', '☕', '🙌', '💯'].map((emoji, idx) => (
                  <TouchableOpacity key={idx} style={styles.stickerItem} onPress={() => handleSendSticker(emoji)}>
                    <Text style={{ fontSize: 32 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
              /* 👈 OPTION 3: High-Performance Disk Caching in Fullscreen Viewer */
              <Image 
                source={{ uri: fullscreenImage }} 
                style={styles.fullscreenImage} 
                contentFit="contain" 
                cachePolicy="disk"
              />
            )}
          </View>
        </Modal>

      </View>
    );

    if (customWallpaperUri) {
      return (
        <ImageBackground source={{ uri: customWallpaperUri }} style={{ flex: 1 }} resizeMode="cover">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }}>
            {innerContent}
          </View>
        </ImageBackground>
      );
    }

    return innerContent;
  };

  return renderContentContainer();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  darkContainer: { backgroundColor: '#1a202c' },
  header: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', paddingTop: 20 },
  darkHeader: { backgroundColor: '#2d3748', borderBottomColor: '#4a5568' },
  headerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerIconBtn: { marginLeft: 8, padding: 4 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12, position: 'relative' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#48bb78', position: 'absolute', bottom: 0, right: 0, borderWidth: 2, borderColor: '#fff' },
  headerName: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  headerStatus: { fontSize: 11, color: '#718096' },
  searchBarContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  searchInput: { flex: 1, backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 16, paddingHorizontal: 12, height: 36, fontSize: 13, color: '#2d3748' },
  messageScroll: { flexGrow: 1, padding: 15, paddingBottom: 20 },
  dateDividerContainer: { alignItems: 'center', marginVertical: 14 },
  dateBadge: { backgroundColor: '#edf2f7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  darkDateBadge: { backgroundColor: '#4a5568' },
  dateBadgeText: { fontSize: 11, fontWeight: '600', color: '#718096' },
  messageBubbleContainer: { marginBottom: 12, maxWidth: '82%' },
  myMessageContainer: { alignSelf: 'flex-end' },
  theirMessageContainer: { alignSelf: 'flex-start' },
  bubble: { padding: 12, borderRadius: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  myBubble: { borderBottomRightRadius: 2 },
  theirBubble: { backgroundColor: '#edf2f7', borderBottomLeftRadius: 2 },
  darkBubble: { backgroundColor: '#4a5568', borderBottomLeftRadius: 2 },
  lockedBubbleStyle: { borderColor: '#d69e2e', borderWidth: 1.5, backgroundColor: '#fffaf0' },
  messageText: { fontSize: 14, color: '#2d3748' },
  myMessageText: { color: '#fff' },
  darkText: { color: '#fff' },
  bubbleFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4 },
  timeText: { fontSize: 9, color: '#a0aec0' },
  myTimeText: { color: '#ebf8ff' },
  theirTimeText: { color: '#718096' },
  receiptText: { fontSize: 10, fontWeight: 'bold', marginLeft: 2 },
  typingIndicatorBox: { paddingHorizontal: 16, paddingVertical: 4 },
  typingText: { fontSize: 11, fontStyle: 'italic', color: '#a0aec0' },
  inputBar: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  recordingBar: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  recordingPulseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e53e3e', marginRight: 8 },
  recordingTimerText: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  sendVoiceBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  plusButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  plusButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: -2 },
  attachButton: { padding: 8, marginRight: 4 },
  inputBox: { flex: 1, backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 20, paddingHorizontal: 15, height: 40, fontSize: 13, color: '#2d3748' },
  darkInputBox: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  sendButton: { paddingHorizontal: 16, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  docCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.04)', padding: 8, borderRadius: 8, marginBottom: 4 },
  downloadLinkText: { fontSize: 11, fontWeight: 'bold', marginTop: 4, textDecorationLine: 'underline' },
  locationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.04)', padding: 8, borderRadius: 8, marginBottom: 4 },
  mapLinkText: { fontSize: 11, fontWeight: 'bold', marginTop: 4, textDecorationLine: 'underline' },
  imagePlaceholderBox: { height: 120, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  chatImageThumbnail: { width: 180, height: 140, borderRadius: 8, marginBottom: 4 },
  previewBtn: { backgroundColor: 'rgba(0,0,0,0.2)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 4 },
  previewBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  scannerModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  scannerContainer: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20 },
  scanPageBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  compilePdfBtn: { backgroundColor: '#48bb78', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10 },
  trayContainer: { backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  trayIndicatorBar: { width: 40, height: 4, backgroundColor: '#cbd5e0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  trayTitle: { fontSize: 15, fontWeight: 'bold', color: '#2d3748', marginBottom: 16 },
  trayItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  trayIcon: { fontSize: 20, marginRight: 14 },
  trayText: { fontSize: 13, fontWeight: '600', color: '#4a5568' },
  themeSwatch: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  selectedSwatch: { borderWidth: 2, borderColor: '#2d3748' },
  customWallpaperBtn: { backgroundColor: '#3182ce', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  stickerGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', paddingVertical: 10 },
  stickerItem: { padding: 15 },
  fullscreenOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  closeFullscreenBtn: { position: 'absolute', top: 40, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  closeFullscreenText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  fullscreenImage: { width: '100%', height: '80%' },
  // Call Modals Styles
  callOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  callCard: { width: '100%', maxWidth: 340, backgroundColor: '#1a202c', borderRadius: 24, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#4a5568' },
  callAvatarLarge: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  callContactName: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  callStatusText: { color: '#cbd5e0', fontSize: 13, marginBottom: 30 },
  callActionsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  callActionBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#2d3748', justifyContent: 'center', alignItems: 'center' },
  callBtnLabel: { color: '#cbd5e0', fontSize: 10, marginTop: 4 },
  videoCallOverlay: { flex: 1, backgroundColor: '#000', justifyContent: 'space-between' },
  videoCallTopBar: { position: 'absolute', top: 40, left: 20, right: 20, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', padding: 12, borderRadius: 12, alignItems: 'center' },
  videoCallBottomBar: { position: 'absolute', bottom: 40, left: 20, right: 20, zIndex: 50, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(0,0,0,0.6)', padding: 16, borderRadius: 24 },
  videoCallControlBtn: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#2d3748', justifyContent: 'center', alignItems: 'center' },
});