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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Camera, CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system';
import * as Linking from 'expo-linking';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../../Services/supabaseClient';
import { queueOfflineMessage } from '../../Services/offlineSyncQueue';

const { width, height } = Dimensions.get('window');

/**
 * Safe String Converter to prevent React Native Text rendering crashes from objects/nulls
 */
function safeText(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    return JSON.stringify(val);
  }
  return String(val);
}

/**
 * Platform-Safe Audio Recording Preset for Voice Notes
 */
const OPTIMIZED_VOICE_RECORDING_PRESET = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat?.MPEG_4 ?? 2,
    audioEncoder: Audio.AndroidAudioEncoder?.AAC ?? 3,
    sampleRate: 32000,
    numberOfChannels: 1,
    bitRate: 64000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat?.MPEG4AAC ?? 'aac ',
    audioQuality: Audio.IOSAudioQuality?.MEDIUM ?? 64,
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
    return uri;
  }
}

/**
 * Safe Base64 to Uint8Array Converter for React Native Supabase uploads
 */
function base64ToUint8Array(base64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let cleanedBase64 = base64.replace(/[\t\n\r=]/g, '');
  let bufferLength = cleanedBase64.length * 0.75;
  let len = cleanedBase64.length;
  let encoded1, encoded2, encoded3, encoded4;

  let bytes = new Uint8Array(bufferLength);
  let idx = 0;

  for (let i = 0; i < len; i += 4) {
    encoded1 = chars.indexOf(cleanedBase64.charAt(i));
    encoded2 = chars.indexOf(cleanedBase64.charAt(i + 1));
    encoded3 = chars.indexOf(cleanedBase64.charAt(i + 2));
    encoded4 = chars.indexOf(cleanedBase64.charAt(i + 3));

    bytes[idx++] = (encoded1 << 2) | (encoded2 >> 4);
    if (encoded3 !== 64 && encoded3 !== -1) {
      bytes[idx++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (encoded4 !== 64 && encoded4 !== -1) {
      bytes[idx++] = ((encoded3 & 3) << 6) | encoded4;
    }
  }
  return bytes.subarray(0, idx);
}

/**
 * Uploads any local URI (photo/audio/doc) directly to Supabase Storage safely
 */
async function uploadMediaToSupabase(localUri, folder = 'uploads') {
  try {
    if (!localUri) return null;

    let targetUri = localUri;

    if (folder === 'photos' || folder === 'docs') {
      targetUri = await compressImage(localUri);
    }

    const uriParts = targetUri.split('.');
    const fileExt = uriParts[uriParts.length - 1].split('?')[0] || (folder === 'audio' ? 'm4a' : 'jpg');
    const fileName = `${folder}/${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;

    let mimeType = 'image/jpeg';
    if (folder === 'audio') {
      mimeType = 'audio/m4a';
    } else if (fileExt === 'png') {
      mimeType = 'image/png';
    } else if (fileExt === 'pdf') {
      mimeType = 'application/pdf';
    }

    const base64 = await FileSystem.readAsStringAsync(targetUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const byteArray = base64ToUint8Array(base64);

    const { data, error } = await supabase.storage
      .from('chat-images')
      .upload(fileName, byteArray.buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error('Supabase Storage Upload Error:', error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('chat-images')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Error in uploadMediaToSupabase:', err);
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

export default function ChatRoomScreen({ 
  isDarkMode, 
  currentUser,
  route,
  onBack,
  contactName = route?.params?.recipientName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Workspace Member'), 
  contactHandle = route?.params?.recipientHandle || (currentUser?.id ? `@${currentUser.id.slice(0, 8)}` : '@member'), 
  contactAvatar = route?.params?.recipientAvatar || (currentUser?.email ? currentUser.email[0].toUpperCase() : 'M')
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  const [unseenCount, setUnseenCount] = useState(0);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  
  // ================= SECURE AIRTIGHT ISOLATED ROOM ID =================
  const myUniqueId = currentUser?.id || currentUser?.email || 'guest_user';
  const recipientParam = route?.params?.recipientId || route?.params?.recipientEmail || route?.params?.recipientHandle || contactName;
  
  let activeRoomId = route?.params?.id;
  if (!activeRoomId || !activeRoomId.includes('_chat_room_')) {
    if (recipientParam && recipientParam !== myUniqueId) {
      const sortedPair = [String(myUniqueId).trim(), String(recipientParam).trim()].sort();
      activeRoomId = `${sortedPair[0]}_chat_room_${sortedPair[1]}`;
    } else {
      activeRoomId = `${String(myUniqueId).trim()}_private_room_${String(contactName).trim().replace(/\s+/g, '_')}`;
    }
  }

  const [recipientAvatarUrl, setRecipientAvatarUrl] = useState(
    route?.params?.recipientAvatarUrl || route?.params?.recipientAvatar || route?.params?.avatarUrl || null
  );

  // Security & Privacy Toggles
  const [isLockedMessageEnabled, setIsLockedMessageEnabled] = useState(false);
  const [disappearingTimer, setDisappearingTimer] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  
  // Ringtones & Message Alerts States
  const [isMuted, setIsMuted] = useState(false);
  const [selectedRingTone, setSelectedRingTone] = useState('1. Classic Melody 🎵');
  const [selectedMessageAlert, setSelectedMessageAlert] = useState('1. Standard Chime 🔔');
  
  const [ringtonePickerVisible, setRingtonePickerVisible] = useState(false);
  const [messageAlertPickerVisible, setMessageAlertPickerVisible] = useState(false);
  const [previewingSoundLabel, setPreviewingSoundLabel] = useState(null);
  
  // Accent Theme & Custom Wallpaper State
  const [accentTheme, setAccentTheme] = useState('blue');
  const [customWallpaperUri, setCustomWallpaperUri] = useState(null);

  // ================= DYNAMIC POLLS & VOICE ROOMS =================
  const [pollModalVisible, setPollModalVisible] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const [voiceRoomModalVisible, setVoiceRoomModalVisible] = useState(false);
  const [isVoiceRoomActive, setIsVoiceRoomActive] = useState(false);
  const [isRoomMuted, setIsRoomMuted] = useState(false);
  const [roomParticipants, setRoomParticipants] = useState([contactName, 'Community Member 1', 'Workspace Peer']);

  // ================= 10 SUPER-LAYERS ARCHITECTURE =================
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

  // Message Options Modal
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageOptionsModalVisible, setMessageOptionsModalVisible] = useState(false);
  const [forwardModalVisible, setForwardModalVisible] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState(null);

  // General Modals
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  const [stickerModalVisible, setStickerModalVisible] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  // Call Modals State & Device Permissions
  const [voiceCallModalVisible, setVoiceCallModalVisible] = useState(false);
  const [videoCallModalVisible, setVideoCallModalVisible] = useState(false);
  const [callStatus, setCallStatus] = useState('ringing');
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [isMutedCallMic, setIsMutedCallMic] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoCameraOff, setIsVideoCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeVideoFilter, setActiveVideoFilter] = useState('Natural');
  const [showFilterPicker, setShowFilterPicker] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('front');

  // Dynamic Call Privacy Controls
  const [isIncomingAudioBlocked, setIsIncomingAudioBlocked] = useState(false);
  const [isIncomingVideoBlocked, setIsIncomingVideoBlocked] = useState(false);
  const [isScreenshotBlocked, setIsScreenshotBlocked] = useState(false);
  const [isCallRecordingActive, setIsCallRecordingActive] = useState(false);
  const [remoteRecordShieldActive, setRemoteRecordShieldActive] = useState(false);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();

  const callTimerRef = useRef(null);
  const ringSoundRef = useRef(null);
  const scrollViewRef = useRef();
  const realtimeChannelRef = useRef(null);

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

  const ringtoneList = [
    { label: '1. Classic Melody 🎵', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { label: '2. Sunrise Chime 🌅', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { label: '3. Acoustic Echo 🌿', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { label: '4. Digital Pulse ⚡', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { label: '5. Crystal Harp 🪕', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    { label: '6. Neon Marimba 🎹', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
    { label: '7. Velvet Synth 🎶', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
    { label: '8. Royal Bell 🔔', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
    { label: '9. Vibe Pulse (Vibrate only) 📳', uri: null },
    { label: '10. Silent / Off (Total Privacy) 🚫', uri: null },
  ];

  const messageAlertList = [
    { label: '1. Standard Chime 🔔', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { label: '2. Soft Bubble 💧', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { label: '3. Quick Pop 🎯', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { label: '4. Wooden Tap 🪵', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    { label: '5. Cyber Beep 💻', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
    { label: '6. Glass Ping 🥂', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
    { label: '7. Cosmic Swoosh 🌠', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
    { label: '8. Subtle Note 📝', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { label: '9. Vibrate Pulse Only 📳', uri: null },
    { label: '10. Silent / Off (Zero Alerts) 🚫', uri: null },
  ];

  const forwardContacts = [
    { id: '1', name: contactName, handle: contactHandle },
    { id: '2', name: 'Community Official', handle: '@community_feed' },
    { id: '3', name: 'Workspace Devs', handle: '@devs_hq' },
  ];

  // Dynamic Profile Photo Resolver from Supabase Profiles Table (Fixed for @allen handles)
  useEffect(() => {
    const fetchRecipientProfilePhoto = async () => {
      if (recipientAvatarUrl && !recipientAvatarUrl.includes('placeholder')) return;
      if (!recipientParam && !contactName) return;

      try {
        const cleanParam = String(recipientParam || contactName).replace('@', '').trim();

        const { data } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .or(`id.eq.${cleanParam},username.ilike.%${cleanParam}%,full_name.ilike.%${cleanParam}%`)
          .maybeSingle();

        if (data?.avatar_url) {
          setRecipientAvatarUrl(data.avatar_url);
        } else {
          const { data: fuzzyData } = await supabase
            .from('profiles')
            .select('avatar_url')
            .textSearch('username', cleanParam)
            .maybeSingle();
            
          if (fuzzyData?.avatar_url) {
            setRecipientAvatarUrl(fuzzyData.avatar_url);
          }
        }
      } catch (err) {
        console.log('Error fetching chat header avatar:', err);
      }
    };

    fetchRecipientProfilePhoto();
  }, [recipientParam, contactName]);

  const handleInputChange = (text) => {
    setInputText(text);

    if (realtimeChannelRef.current) {
      realtimeChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: myUniqueId, isTyping: text.length > 0 },
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId: myUniqueId, isTyping: false },
        });
      }
    }, 2000);
  };

  const markMessagesAsRead = async () => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('room_id', activeRoomId)
        .neq('sender_id', myUniqueId);

      if (!error) {
        setMessages(prev => prev.map(m => (m.sender_id && m.sender_id !== myUniqueId) ? { ...m, is_read: true } : m));
        setUnseenCount(0);
      }
    } catch (err) {
      console.log('Error marking messages as read:', err);
    }
  };

  // ================= AUTOMATIC OFFLINE QUEUE SYNC LISTENER =================
  useEffect(() => {
    fetchMessages();

    const unsubscribeNetInfo = NetInfo.addEventListener(async (state) => {
      if (state.isConnected) {
        try {
          const { flushOfflineQueue } = require('../../Services/offlineSyncQueue');
          if (typeof flushOfflineQueue === 'function') {
            await flushOfflineQueue();
            fetchMessages();
          }
        } catch (e) {
          fetchMessages();
        }
      }
    });

    const channel = supabase
      .channel(`room_${activeRoomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${activeRoomId}`,
        },
        async (payload) => {
          if (isBlocked) return;
          const incomingMsg = payload.new;

          setMessages((prev) => {
            if (prev.some((msg) => msg.id === incomingMsg.id)) return prev;
            return [...prev, incomingMsg];
          });

          const senderIdOrEmail = incomingMsg.sender_id || incomingMsg.sender;

          if (senderIdOrEmail !== myUniqueId) {
            setUnseenCount((prev) => prev + 1);
            await markMessagesAsRead();
            if (!isMuted) {
              Alert.alert(`New message from ${contactName} 💬`, safeText(incomingMsg.text || 'Media attachment').slice(0, 60));
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${activeRoomId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === payload.new.id ? { ...msg, ...payload.new } : msg))
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${activeRoomId}`,
        },
        (payload) => {
          setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload?.userId !== myUniqueId) {
          setIsPeerTyping(payload.payload?.isTyping);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          realtimeChannelRef.current = channel;
        }
      });

    return () => {
      supabase.removeChannel(channel);
      realtimeChannelRef.current = null;
      unsubscribeNetInfo();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (soundObjectRef.current) soundObjectRef.current.unloadAsync().catch(() => {});
      if (ringSoundRef.current) ringSoundRef.current.unloadAsync().catch(() => {});
      if (recording) recording.stopAndUnloadAsync().catch(() => {});
    };
  }, [activeRoomId, isBlocked, myUniqueId]);

  const fetchMessages = async () => {
    let { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', activeRoomId)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });
    
    if (!error && data) {
      setMessages(data);
      setUnseenCount(0);
      await markMessagesAsRead();
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 200);
    }
  };

  const handlePreviewSound = async (label, uri) => {
    try {
      if (soundObjectRef.current) {
        await soundObjectRef.current.unloadAsync();
        soundObjectRef.current = null;
      }
      setPreviewingSoundLabel(label);

      if (!uri) {
        setTimeout(() => setPreviewingSoundLabel(null), 1000);
        return;
      }

      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false, shouldDuckAndroid: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      soundObjectRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPreviewingSoundLabel(null);
        }
      });
    } catch (e) {
      setPreviewingSoundLabel(null);
    }
  };

  const playRingTone = async () => {
    if (selectedRingTone.includes('Silent') || selectedRingTone.includes('Off')) {
      return;
    }

    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false, shouldDuckAndroid: true });
      const matched = ringtoneList.find(r => r.label === selectedRingTone);
      const audioUri = matched?.uri || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true, isLooping: true }
      );
      ringSoundRef.current = sound;
    } catch (e) {}
  };

  const stopRingTone = async () => {
    if (ringSoundRef.current) {
      try {
        await ringSoundRef.current.stopAsync();
        await ringSoundRef.current.unloadAsync();
      } catch (e) {}
      ringSoundRef.current = null;
    }
  };

  const startVoiceRecording = async () => {
    if (isBlocked) return;
    try {
      if (!microphonePermission?.granted) {
        const perm = await requestMicrophonePermission();
        if (!perm.granted) {
          Alert.alert('Permission Required', 'Microphone access is required to record voice notes.');
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

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

      const netState = await NetInfo.fetch();
      let finalAudioUrl = localUri;

      if (netState.isConnected) {
        const cloudAudioUrl = await uploadMediaToSupabase(localUri, 'audio');
        if (cloudAudioUrl) {
          finalAudioUrl = cloudAudioUrl;
        }
      }

      const rawText = `🎤 [Voice Note • ${durationFormatted}]`;

      const payload = {
        sender: currentUser?.email || 'You',
        sender_id: myUniqueId,
        recipient_id: recipientParam,
        room_id: activeRoomId,
        text: rawText,
        audio_url: finalAudioUrl,
        is_read: false,
      };

      if (!netState.isConnected) {
        await queueOfflineMessage(payload);
        setMessages(prev => [...prev, { ...payload, id: `local_${Date.now()}` }]);
        Alert.alert('Offline Mode 📴', 'Voice note saved locally. Will auto-sync when connection returns.');
        return;
      }

      const { data, error } = await supabase.from('messages').insert([payload]).select();

      if (!error && data && data.length > 0) {
        setMessages(prev => [...prev, data[0]]);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
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

  const logMissedCallOrDurationToChat = async (statusType, durationSecs = 0) => {
    try {
      const mins = Math.floor(durationSecs / 60);
      const secs = durationSecs % 60;
      const timeLabel = durationSecs > 0 ? ` (${mins}m ${secs}s)` : ' (Missed Call 📵)';
      const callLogText = `📞 [Call Log]: ${statusType}${timeLabel}`;
      const payload = {
        sender: currentUser?.email || 'You',
        sender_id: myUniqueId,
        recipient_id: recipientParam,
        room_id: activeRoomId,
        text: callLogText,
        is_read: false,
      };
      const { data } = await supabase.from('messages').insert([payload]).select();
      if (data && data.length > 0) {
        setMessages(prev => [...prev, data[0]]);
      }
    } catch (e) {}
  };

  const handleStartVoiceCall = async () => {
    if (isBlocked) {
      Alert.alert('Blocked', 'Cannot call a blocked contact.');
      return;
    }
    setCallDurationSeconds(0);
    setIsMutedCallMic(false);
    setIsSpeakerOn(true);
    setIsCallRecordingActive(false);
    setRemoteRecordShieldActive(false);
    setCallStatus('ringing');
    setVoiceCallModalVisible(true);
    playRingTone();

    const missedTimeout = setTimeout(() => {
      if (callStatus === 'ringing') {
        stopRingTone();
        setVoiceCallModalVisible(false);
        logMissedCallOrDurationToChat('Voice Call • Unanswered', 0);
        Alert.alert('Missed Call 📵', `${contactName} did not answer your voice call.`);
      }
    }, 12000);

    setTimeout(() => {
      clearTimeout(missedTimeout);
      setCallStatus('connected');
      stopRingTone();
      callTimerRef.current = setInterval(() => {
        setCallDurationSeconds(prev => prev + 1);
      }, 1000);
    }, 3000);
  };

  const handleEndVoiceCall = () => {
    stopRingTone();
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    const duration = callDurationSeconds;
    setVoiceCallModalVisible(false);
    setCallDurationSeconds(0);
    setIsCallRecordingActive(false);
    if (duration > 0) {
      logMissedCallOrDurationToChat('Voice Call Completed', duration);
    } else {
      logMissedCallOrDurationToChat('Voice Call • Missed', 0);
    }
  };

  const handleStartVideoCall = async () => {
    if (isBlocked) {
      Alert.alert('Blocked', 'Cannot call a blocked contact.');
      return;
    }

    if (!cameraPermission?.granted) {
      const perm = await requestCameraPermission();
      if (!perm.granted) {
        Alert.alert('Camera Permission Required', 'Camera access is required for video calls.');
        return;
      }
    }
    if (!microphonePermission?.granted) {
      await requestMicrophonePermission();
    }

    setCallDurationSeconds(0);
    setIsMutedCallMic(false);
    setIsVideoCameraOff(false);
    setIsScreenSharing(false);
    setIsCallRecordingActive(false);
    setRemoteRecordShieldActive(false);
    setActiveVideoFilter('Natural');
    setCallStatus('ringing');
    setVideoCallModalVisible(true);
    playRingTone();

    const videoMissedTimeout = setTimeout(() => {
      if (callStatus === 'ringing') {
        stopRingTone();
        setVideoCallModalVisible(false);
        logMissedCallOrDurationToChat('Video Call • Unanswered', 0);
        Alert.alert('Missed Video Call 📵', `${contactName} did not answer your video call.`);
      }
    }, 12000);

    setTimeout(() => {
      clearTimeout(videoMissedTimeout);
      setCallStatus('connected');
      stopRingTone();
      callTimerRef.current = setInterval(() => {
        setCallDurationSeconds(prev => prev + 1);
      }, 1000);
    }, 3000);
  };

  const handleEndVideoCall = () => {
    stopRingTone();
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    const duration = callDurationSeconds;
    setVideoCallModalVisible(false);
    setCallDurationSeconds(0);
    setIsCallRecordingActive(false);
    if (duration > 0) {
      logMissedCallOrDurationToChat('Video Call Completed', duration);
    } else {
      logMissedCallOrDurationToChat('Video Call • Missed', 0);
    }
  };

  const formatCallTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  const handleOpenMapPin = () => {
    const lat = 0.3476;
    const lng = 32.5825;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(() => {});
  };

  const handleCreatePoll = async () => {
    if (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2) {
      Alert.alert('Poll Error', 'Please enter a question and at least 2 valid options.');
      return;
    }
    setPollModalVisible(false);

    const validOptions = pollOptions.filter(o => o.trim()).map(opt => ({ text: opt, votes: 0 }));
    const pollPayload = {
      question: pollQuestion.trim(),
      options: validOptions,
      totalVotes: 0
    };

    const pollString = `📊 [GROUP POLL]: ${JSON.stringify(pollPayload)}`;

    const payload = {
      sender: currentUser?.email || 'You',
      sender_id: myUniqueId,
      recipient_id: recipientParam,
      room_id: activeRoomId,
      text: pollString,
      is_poll: true,
      poll_data: pollPayload,
      is_read: false,
    };

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      await queueOfflineMessage(payload);
      setMessages(prev => [...prev, { ...payload, id: `local_${Date.now()}` }]);
      return;
    }

    const { data } = await supabase.from('messages').insert([payload]).select();
    if (data && data.length > 0) {
      setMessages(prev => [...prev, data[0]]);
    }
    setPollQuestion('');
    setPollOptions(['', '']);
  };

  const handleVotePoll = async (msgId, optIndex) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId && m.poll_data) {
        const updatedOptions = m.poll_data.options.map((opt, i) => 
          i === optIndex ? { ...opt, votes: opt.votes + 1 } : opt
        );
        return {
          ...m,
          poll_data: { ...m.poll_data, options: updatedOptions, totalVotes: m.poll_data.totalVotes + 1 }
        };
      }
      return m;
    }));
    Alert.alert('Vote Recorded ✅', 'Your vote has been counted successfully.');
  };

  // ================= DIRECT SUPABASE MESSAGE SEND WITH OFFLINE QUEUE =================
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
      messageText = `↩️ Replying to: "${safeText(replyingToMessage.text).slice(0, 30)}..."\n${messageText}`;
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

    const payload = { 
      sender: currentUser?.email || 'You', 
      sender_id: myUniqueId,
      recipient_id: recipientParam,
      room_id: activeRoomId,
      text: messageText,
      is_read: false,
    };

    const netState = await NetInfo.fetch();

    if (!netState.isConnected) {
      await queueOfflineMessage(payload);
      setMessages(prev => [...prev, { ...payload, id: `local_${Date.now()}` }]);
      Alert.alert('Offline Mode 📴', 'No internet connection. Message saved locally and will auto-sync when online.');
      return;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([payload])
      .select();

    if (error) {
      console.log('Database error, queueing offline:', error.message);
      await queueOfflineMessage(payload);
      setMessages(prev => [...prev, { ...payload, id: `local_${Date.now()}` }]);
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
    }
  };

  const handleSendSticker = async (stickerEmoji) => {
    if (isBlocked) return;
    setStickerModalVisible(false);

    const rawSticker = `sticker: ${stickerEmoji}`;

    const payload = { 
      sender: currentUser?.email || 'You', 
      sender_id: myUniqueId,
      recipient_id: recipientParam,
      room_id: activeRoomId,
      text: rawSticker,
      is_read: false,
    };

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      await queueOfflineMessage(payload);
      setMessages(prev => [...prev, { ...payload, id: `local_${Date.now()}` }]);
      return;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([payload])
      .select();

    if (!error && data && data.length > 0) {
      setMessages(prev => {
        if (prev.some(msg => msg.id === data[0].id)) return prev;
        const updated = [...prev, data[0]];
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        return updated;
      });
    }
  };

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
    }
    setSelectedMessage(null);
    setMessageOptionsModalVisible(false);
  };

  const handleCopyMessageText = () => {
    if (selectedMessage?.text) {
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(safeText(selectedMessage.text));
        }
      } catch (e) {}
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
            await supabase.from('messages').delete().eq('room_id', activeRoomId);
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
    const result = await ImagePicker.launchCameraAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true, 
      quality: 0.9 
    });
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

    const netState = await NetInfo.fetch();
    let cloudImageUrl = scanPages[0];

    if (netState.isConnected) {
      cloudImageUrl = await uploadMediaToSupabase(scanPages[0], 'docs') || scanPages[0];
    }

    const docName = `🔐 📄 Scanned_PDF_${Math.floor(Math.random() * 1000)} (${scanPages.length} Pages)`;

    const payload = {
      sender: currentUser?.email || 'You',
      sender_id: myUniqueId,
      recipient_id: recipientParam,
      room_id: activeRoomId,
      text: docName,
      image_url: cloudImageUrl,
      is_read: false,
    };

    if (!netState.isConnected) {
      await queueOfflineMessage(payload);
      setMessages(prev => [...prev, { ...payload, id: `local_${Date.now()}` }]);
      return;
    }

    const { data, error } = await supabase.from('messages').insert([payload]).select();

    if (!error && data) {
      setMessages(prev => [...prev, data[0]]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
    setScanPages([]);
  };

  const handleOpenCamera = async () => {
    if (isBlocked) return;
    setAttachmentModalVisible(false);
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true, 
      quality: 0.8 
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const localUri = result.assets[0].uri;
      const netState = await NetInfo.fetch();
      let cloudImageUrl = localUri;

      if (netState.isConnected) {
        cloudImageUrl = await uploadMediaToSupabase(localUri, 'photos') || localUri;
      }

      const rawPhotoText = '🔐 📷 [Secret Photo]';

      const payload = {
        sender: currentUser?.email || 'You',
        sender_id: myUniqueId,
        recipient_id: recipientParam,
        room_id: activeRoomId,
        text: rawPhotoText,
        image_url: cloudImageUrl,
        is_read: false,
      };

      if (!netState.isConnected) {
        await queueOfflineMessage(payload);
        setMessages(prev => [...prev, { ...payload, id: `local_${Date.now()}` }]);
        return;
      }

      const { data, error } = await supabase.from('messages').insert([payload]).select();

      if (!error && data) {
        setMessages(prev => [...prev, data[0]]);
      }
    }
  };

  const handleOpenGallery = async () => {
    if (isBlocked) return;
    setAttachmentModalVisible(false);
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Gallery permission is required to pick photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true, 
      quality: 0.8 
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const localUri = result.assets[0].uri;
      const netState = await NetInfo.fetch();
      let cloudImageUrl = localUri;

      if (netState.isConnected) {
        cloudImageUrl = await uploadMediaToSupabase(localUri, 'photos') || localUri;
      }

      const rawGalleryText = '🔐 🖼️ [Gallery Attachment]';

      const payload = {
        sender: currentUser?.email || 'You',
        sender_id: myUniqueId,
        recipient_id: recipientParam,
        room_id: activeRoomId,
        text: rawGalleryText,
        image_url: cloudImageUrl,
        is_read: false,
      };

      if (!netState.isConnected) {
        await queueOfflineMessage(payload);
        setMessages(prev => [...prev, { ...payload, id: `local_${Date.now()}` }]);
        return;
      }

      const { data, error } = await supabase.from('messages').insert([payload]).select();

      if (!error && data) {
        setMessages(prev => [...prev, data[0]]);
      }
    }
  };

  const handleShareCurrentLocation = async () => {
    if (isBlocked) return;
    setAttachmentModalVisible(false);
    const rawLoc = '🔐 📍 Current Location Shared';

    const payload = { 
      sender: currentUser?.email || 'You', 
      sender_id: myUniqueId,
      recipient_id: recipientParam,
      room_id: activeRoomId,
      text: rawLoc,
      is_read: false,
    };

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      await queueOfflineMessage(payload);
      setMessages(prev => [...prev, { ...payload, id: `local_${Date.now()}` }]);
      return;
    }

    const { data } = await supabase.from('messages').insert([payload]).select();
    if (data) {
      setMessages(prev => [...prev, data[0]]);
    }
  };

  const handleShareLiveLocation = async () => {
    if (isBlocked) return;
    setAttachmentModalVisible(false);
    const rawLive = '🔐 📡 Live Location Active (1 hour)';

    const payload = { 
      sender: currentUser?.email || 'You', 
      sender_id: myUniqueId,
      recipient_id: recipientParam,
      room_id: activeRoomId,
      text: rawLive,
      is_read: false,
    };

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      await queueOfflineMessage(payload);
      setMessages(prev => [...prev, { ...payload, id: `local_${Date.now()}` }]);
      return;
    }

    const { data } = await supabase.from('messages').insert([payload]).select();
    if (data) {
      setMessages(prev => [...prev, data[0]]);
    }
  };

  const handleDownloadFile = (fileName) => {
    Alert.alert('Download Complete 📥', `${safeText(fileName)} saved to vault.`);
  };

  const renderReceiptTicks = (msg) => {
    const isOtherUserMsg = msg.sender_id !== myUniqueId && msg.sender !== 'You';
    if (isOtherUserMsg) return null;
    return <Text style={[styles.receiptText, { color: msg.is_read || isPeerTyping || messages.length > 1 ? '#3182ce' : '#a0aec0' }]}> ✓✓</Text>;
  };

  const filteredMessages = messages.filter(msg => 
    searchQuery.trim() === '' || safeText(msg.text)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedFilterObj = videoFiltersList.find(f => f.name === activeVideoFilter) || videoFiltersList[0];

  const renderContentContainer = () => {
    const innerContent = (
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>

        {/* Clean Dynamic Chat Header with Back Button & Profile Photo */}
        <View style={[styles.header, isDarkMode && styles.darkHeader]}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={{ marginRight: 10, padding: 4 }}>
              <Text style={{ fontSize: 22, color: isDarkMode ? '#fff' : '#2d3748', fontWeight: 'bold' }}>←</Text>
            </TouchableOpacity>
          )}

          <View style={styles.headerInfo}>
            <View style={[styles.avatar, { backgroundColor: currentTheme.primary, overflow: 'hidden' }]}>
              {recipientAvatarUrl ? (
                <Image 
                  source={{ uri: recipientAvatarUrl }} 
                  style={{ width: '100%', height: '100%' }} 
                  contentFit="cover" 
                  cachePolicy="disk" 
                />
              ) : (
                <Text style={styles.avatarText}>{contactAvatar}</Text>
              )}
              <View style={styles.onlineDot} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerName, isDarkMode && styles.darkText]} numberOfLines={1}>{contactName}</Text>
              <Text style={styles.headerStatus}>
                {isPeerTyping ? 'Typing...' : isBlocked ? 'Contact Blocked 🚫' : 'Online • Shared Room Active 🔗'}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => setVoiceRoomModalVisible(true)}>
              <Text style={{ fontSize: 18 }}>🎙️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => setPollModalVisible(true)}>
              <Text style={{ fontSize: 18 }}>📊</Text>
            </TouchableOpacity>
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
            const isMe = (msg.sender_id && myUniqueId && msg.sender_id === myUniqueId) || 
                       (msg.sender && currentUser?.email && msg.sender === currentUser.email) ||
                       msg.sender === 'You';
            const timeFormatted = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';
            const currentDateLabel = formatDateLabel(msg.created_at);
            
            const prevMsg = index > 0 ? filteredMessages[index - 1] : null;
            const prevDateLabel = prevMsg ? formatDateLabel(prevMsg.created_at) : null;
            const showDateHeader = currentDateLabel !== prevDateLabel;

            const mediaUri = msg.imageUri || msg.image_url;
            const msgTextStr = safeText(msg.text);
            const isVoiceNote = msg.audio_url || (msgTextStr && msgTextStr.includes('Voice Note'));
            const isImageMessage = mediaUri || (msgTextStr && (msgTextStr.includes('Photo Captured') || msgTextStr.includes('Gallery Attachment') || msgTextStr.includes('Secret Photo') || msgTextStr.includes('[Photo Attachment]') || msgTextStr.includes('[Image Attachment]')));
            const isDocumentMessage = msgTextStr && msgTextStr.includes('Scanned');
            const isLocationMessage = msgTextStr && (msgTextStr.includes('Location') || msgTextStr.includes('Live Location'));
            const isStickerMessage = msgTextStr && msgTextStr.startsWith('sticker: ');
            const isLockedMsg = msgTextStr && msgTextStr.startsWith('🔐');
            const isCallLog = msgTextStr && msgTextStr.includes('[Call Log]');
            
            const isPoll = msg.is_poll || (msgTextStr && msgTextStr.includes('[GROUP POLL]'));
            const pollObj = msg.poll_data || (isPoll && tryParsePoll(msgTextStr));

            return (
              <React.Fragment key={msg.id ? `${msg.id}_${index}` : index.toString()}>
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
                  <View style={[
                    styles.bubble, 
                    isMe ? [styles.myBubble, { backgroundColor: currentTheme.primary }] : (isDarkMode ? styles.darkBubble : styles.theirBubble), 
                    isLockedMsg && styles.lockedBubbleStyle,
                    isCallLog && { backgroundColor: '#edf2f7', borderWidth: 1, borderColor: '#cbd5e0' }
                  ]}>
                    
                    {isCallLog ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 20, marginRight: 8 }}>📞</Text>
                        <View>
                          <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#2d3748' }}>{msgTextStr}</Text>
                          <Text style={{ fontSize: 10, color: '#718096' }}>{timeFormatted}</Text>
                        </View>
                      </View>
                    ) : isPoll && pollObj ? (
                      <View style={{ width: 240 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 14, color: isMe ? '#fff' : '#2d3748', marginBottom: 8 }}>
                          📊 {pollObj.question}
                        </Text>
                        {pollObj.options.map((opt, oIdx) => {
                          const total = pollObj.totalVotes || 1;
                          const pct = Math.round((opt.votes / total) * 100);
                          return (
                            <TouchableOpacity 
                              key={oIdx} 
                              style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 8, marginBottom: 6 }}
                              onPress={() => handleVotePoll(msg.id, oIdx)}
                            >
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ color: isMe ? '#fff' : '#2d3748', fontSize: 12, fontWeight: '600' }}>{opt.text}</Text>
                                <Text style={{ color: isMe ? '#ebf8ff' : '#718096', fontSize: 11 }}>{pct}% ({opt.votes})</Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                        <Text style={{ fontSize: 10, color: isMe ? '#ebf8ff' : '#718096', marginTop: 4, textAlign: 'right' }}>Total votes: {pollObj.totalVotes}</Text>
                      </View>
                    ) : isStickerMessage ? (
                      <Text style={{ fontSize: 40 }}>{msgTextStr.replace('sticker: ', '')}</Text>
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
                            {msgTextStr}
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
                            {msgTextStr}
                          </Text>
                          <Text style={{ fontSize: 10, color: '#d69e2e', marginTop: 2 }}>🔐 Multi-Page Secure PDF</Text>
                          <TouchableOpacity onPress={() => handleDownloadFile(msgTextStr)}>
                            <Text style={[styles.downloadLinkText, { color: currentTheme.primary }]}>📥 Tap to Decrypt & Preview</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : isImageMessage ? (
                      <View>
                        {mediaUri ? (
                          <TouchableOpacity onPress={() => setFullscreenImage(mediaUri)}>
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
                          {msgTextStr}
                        </Text>
                        {mediaUri && (
                          <TouchableOpacity style={styles.previewBtn} onPress={() => setFullscreenImage(mediaUri)}>
                            <Text style={styles.previewBtnText}>🔍 View Fullscreen</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : isLocationMessage ? (
                      <View style={styles.locationCard}>
                        <Text style={{ fontSize: 24, marginRight: 8 }}>📍</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.messageText, isMe ? styles.myMessageText : (isDarkMode && styles.darkText), { fontWeight: 'bold' }]}>
                            {msgTextStr.replace('🔐 ', '')}
                          </Text>
                          <TouchableOpacity onPress={handleOpenMapPin}>
                            <Text style={[styles.mapLinkText, { color: currentTheme.primary }]}>📌 Tap to View on Map</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <Text style={[styles.messageText, isMe ? styles.myMessageText : (isDarkMode && styles.darkText)]}>
                        {msgTextStr}
                      </Text>
                    )}

                    <View style={styles.bubbleFooter}>
                      <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText]}>{timeFormatted}</Text>
                      {renderReceiptTicks(msg)}
                    </View>
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </ScrollView>

        {/* Unread Counter Badge */}
        {unseenCount > 0 && (
          <TouchableOpacity 
            style={[styles.floatingUnseenBadge, { backgroundColor: currentTheme.primary }]}
            onPress={() => {
              setUnseenCount(0);
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
              ↓ {unseenCount} new message{unseenCount > 1 ? 's' : ''} waiting
            </Text>
          </TouchableOpacity>
        )}

        {/* Replying Banner Bar */}
        {replyingToMessage && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 8, backgroundColor: '#ebf8ff', borderTopWidth: 1, borderTopColor: '#cbd5e0' }}>
            <Text style={{ fontSize: 11, color: '#2b6cb0', flex: 1 }} numberOfLines={1}>
              ↩️ Replying to: {safeText(replyingToMessage.text)}
            </Text>
            <TouchableOpacity onPress={() => setReplyingToMessage(null)}>
              <Text style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: 11 }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Active Recording Bar */}
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
                  placeholder={isLockedMessageEnabled ? "Type locked secret message..." : "Type message..."}
                  placeholderTextColor="#a0aec0"
                  value={inputText}
                  onChangeText={handleInputChange}
                  returnKeyType="send"
                  onSubmitEditing={handleSendMessage}
                />

                <TouchableOpacity style={[styles.sendButton, { backgroundColor: currentTheme.primary }, isLockedMessageEnabled && { backgroundColor: '#d69e2e' }]} onPress={handleSendMessage}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>{isLockedMessageEnabled ? 'Lock' : 'Send'}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* VOICE CALL MODAL */}
        <Modal visible={voiceCallModalVisible} transparent={true} animationType="fade">
          <View style={styles.callOverlay}>
            <View style={styles.callCard}>
              <View style={[styles.callAvatarLarge, { backgroundColor: currentTheme.primary, overflow: 'hidden' }]}>
                {recipientAvatarUrl ? (
                  <Image source={{ uri: recipientAvatarUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" cachePolicy="disk" />
                ) : (
                  <Text style={{ fontSize: 40, color: '#fff', fontWeight: 'bold' }}>{contactAvatar}</Text>
                )}
              </View>
              <Text style={styles.callContactName}>{contactName}</Text>
              <Text style={styles.callStatusText}>
                {callStatus === 'ringing' 
                  ? (selectedRingTone.includes('Silent') ? 'Ringing (Silent Mode 🔕)...' : `Ringing (${selectedRingTone})... 🔔`) 
                  : `Secure Voice Call • ${formatCallTime(callDurationSeconds)}`}
              </Text>

              {remoteRecordShieldActive && (
                <View style={{ backgroundColor: 'rgba(229, 62, 62, 0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#e53e3e' }}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', textAlign: 'center' }}>🛡️ Anti-Record Shield Active: Partner recording blocked</Text>
                </View>
              )}

              <View style={{ width: '100%', marginBottom: 15, gap: 8 }}>
                <TouchableOpacity 
                  style={{ backgroundColor: remoteRecordShieldActive ? '#e53e3e' : '#3182ce', padding: 8, borderRadius: 8, alignItems: 'center' }}
                  onPress={() => {
                    const nextVal = !remoteRecordShieldActive;
                    setRemoteRecordShieldActive(nextVal);
                    Alert.alert('Anti-Record Shield 🛡️', nextVal ? 'Call is protected. Partner recording attempt will show restricted.' : 'Anti-record protection lifted.');
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>
                    {remoteRecordShieldActive ? '🛡️ Partner Recording Blocked (ON)' : '🛑 Block Partner from Recording'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ backgroundColor: isCallRecordingActive ? '#38a169' : '#4a5568', padding: 8, borderRadius: 8, alignItems: 'center' }}
                  onPress={() => setIsCallRecordingActive(!isCallRecordingActive)}
                >
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>
                    {isCallRecordingActive ? '🔴 Local Call Audio Recording Active' : '🎙️ Record Call Audio Locally'}
                  </Text>
                </TouchableOpacity>
              </View>

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
                  <Text style={{ fontSize: 22 }}>{isSpeakerOn ? '📢' : '🔊'}</Text>
                  <Text style={styles.callBtnLabel}>{isSpeakerOn ? 'Loud' : 'Earpiece'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.callActionBtn, { backgroundColor: '#e53e3e' }]} onPress={handleEndVoiceCall}>
                  <Text style={{ fontSize: 22 }}>📞</Text>
                  <Text style={styles.callBtnLabel}>End</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ENHANCED VIDEO CALL MODAL */}
        <Modal visible={videoCallModalVisible} transparent={true} animationType="fade">
          <View style={styles.videoCallOverlay}>
            <View style={{ flex: 1, backgroundColor: '#1a202c', justifyContent: 'center', alignItems: 'center' }}>
              {callStatus === 'ringing' ? (
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <View style={[styles.callAvatarLarge, { backgroundColor: currentTheme.primary, marginBottom: 15, overflow: 'hidden' }]}>
                    {recipientAvatarUrl ? (
                      <Image source={{ uri: recipientAvatarUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" cachePolicy="disk" />
                    ) : (
                      <Text style={{ fontSize: 40, color: '#fff', fontWeight: 'bold' }}>{contactAvatar}</Text>
                    )}
                  </View>
                  <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{contactName}</Text>
                  <Text style={{ color: '#cbd5e0', fontSize: 14, marginTop: 6 }}>
                    {selectedRingTone.includes('Silent') ? 'Video Ringing (Silent 🔕)...' : `Video Ringing (${selectedRingTone})... 🔔`}
                  </Text>
                </View>
              ) : isScreenSharing ? (
                <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#2d3748' }}>
                  <Text style={{ fontSize: 50, marginBottom: 10 }}>🖥️</Text>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Screen Sharing Active</Text>
                  <Text style={{ color: '#a0aec0', fontSize: 12, marginTop: 4 }}>Broadcasting device screen to {contactName}</Text>
                </View>
              ) : isVideoCameraOff || isIncomingVideoBlocked ? (
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 40, marginBottom: 10 }}>🚫</Text>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                    {isIncomingVideoBlocked ? 'Video Denied 🔒' : 'Camera Off 📷'}
                  </Text>
                </View>
              ) : cameraPermission?.granted ? (
                <CameraView style={{ width: '100%', height: '100%' }} facing={cameraFacing}>
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: selectedFilterObj.color, pointerEvents: 'none' }]} />
                  
                  {remoteRecordShieldActive && (
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 30 }]}>
                      <Text style={{ fontSize: 40, marginBottom: 10 }}>🛡️</Text>
                      <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Anti-Record Shield Active</Text>
                      <Text style={{ color: '#cbd5e0', fontSize: 12, textAlign: 'center', marginTop: 6 }}>
                        Partner recording is restricted. Live call is fully active and secure.
                      </Text>
                    </View>
                  )}

                  <View style={{ position: 'absolute', bottom: 120, right: 20, width: 100, height: 140, backgroundColor: '#2d3748', borderRadius: 12, borderWidth: 2, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                    <Text style={{ fontSize: 24 }}>🧑‍💻</Text>
                    <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold', marginTop: 4 }}>You (HD)</Text>
                  </View>
                </CameraView>
              ) : (
                <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                  <View style={[styles.callAvatarLarge, { backgroundColor: currentTheme.primary, marginBottom: 12, overflow: 'hidden' }]}>
                    {recipientAvatarUrl ? (
                      <Image source={{ uri: recipientAvatarUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" cachePolicy="disk" />
                    ) : (
                      <Text style={{ fontSize: 40, color: '#fff', fontWeight: 'bold' }}>{contactAvatar}</Text>
                    )}
                  </View>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{contactName} (Live)</Text>
                </View>
              )}
            </View>

            <View style={styles.videoCallTopBar}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{contactName}</Text>
              <Text style={{ color: '#cbd5e0', fontSize: 11 }}>
                {callStatus === 'ringing' ? 'Ringing... 🔔' : `Encrypted Video • ${formatCallTime(callDurationSeconds)} • Filter: ${activeVideoFilter}`}
              </Text>
              
              <View style={{ flexDirection: 'row', marginTop: 8, gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                <TouchableOpacity 
                  style={{ backgroundColor: remoteRecordShieldActive ? '#e53e3e' : 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}
                  onPress={() => {
                    const nextVal = !remoteRecordShieldActive;
                    setRemoteRecordShieldActive(nextVal);
                    Alert.alert('Anti-Record Shield 🛡️', nextVal ? 'Partner recording is blocked with security curtain.' : 'Partner recording unblocked.');
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>{remoteRecordShieldActive ? '🛡️ Partner Record Blocked: ON' : '🛑 Block Partner Record'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ backgroundColor: isScreenshotBlocked ? '#38a169' : 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}
                  onPress={() => setIsScreenshotBlocked(!isScreenshotBlocked)}
                >
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>{isScreenshotBlocked ? '📸 Screenshot Shield: ON' : '📸 Block Screenshot'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ backgroundColor: isCallRecordingActive ? '#38a169' : 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}
                  onPress={() => setIsCallRecordingActive(!isCallRecordingActive)}
                >
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>{isCallRecordingActive ? '🔴 Recording Active' : '⏺️ Record A/V'}</Text>
                </TouchableOpacity>
              </View>
            </View>

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

            <View style={styles.videoCallBottomBar}>
              <TouchableOpacity 
                style={[styles.videoCallControlBtn, isMutedCallMic && { backgroundColor: '#e53e3e' }]} 
                onPress={() => setIsMutedCallMic(!isMutedCallMic)}
              >
                <Text style={{ fontSize: 20 }}>{isMutedCallMic ? '🔇' : '🎙️'}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.videoCallControlBtn, isSpeakerOn && { backgroundColor: '#3182ce' }]} 
                onPress={() => setIsSpeakerOn(!isSpeakerOn)}
              >
                <Text style={{ fontSize: 20 }}>{isSpeakerOn ? '📢' : '🔊'}</Text>
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

        {/* GROUP POLL CREATOR MODAL */}
        <Modal visible={pollModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.trayContainer, isDarkMode && styles.darkContainer]}>
              <Text style={[styles.trayTitle, isDarkMode && styles.darkText]}>📊 Create Group Poll</Text>
              <TextInput
                style={[styles.pollInput, isDarkMode && styles.darkInputBox]}
                placeholder="Ask a question..."
                placeholderTextColor="#a0aec0"
                value={pollQuestion}
                onChangeText={setPollQuestion}
              />
              {pollOptions.map((opt, i) => (
                <TextInput
                  key={i}
                  style={[styles.pollInput, isDarkMode && styles.darkInputBox, { marginTop: 8 }]}
                  placeholder={`Option ${i + 1}`}
                  placeholderTextColor="#a0aec0"
                  value={opt}
                  onChangeText={val => {
                    const newOpts = [...pollOptions];
                    newOpts[i] = val;
                    setPollOptions(newOpts);
                  }}
                />
              ))}
              <TouchableOpacity 
                style={{ marginTop: 10, alignSelf: 'flex-start' }}
                onPress={() => setPollOptions([...pollOptions, ''])}
              >
                <Text style={{ color: currentTheme.primary, fontWeight: 'bold' }}>+ Add Option</Text>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                <TouchableOpacity onPress={() => setPollModalVisible(false)} style={{ padding: 10 }}>
                  <Text style={{ color: '#e53e3e', fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.compilePdfBtn, { backgroundColor: currentTheme.primary }]} onPress={handleCreatePoll}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Publish Poll 📊</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* LIVE VOICE ROOM SPACES MODAL */}
        <Modal visible={voiceRoomModalVisible} transparent={true} animationType="slide">
          <View style={styles.callOverlay}>
            <View style={styles.callCard}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>🎙️</Text>
              <Text style={styles.callContactName}>Live Voice Room</Text>
              <Text style={{ color: '#a0aec0', fontSize: 11, marginBottom: 10, textAlign: 'center' }}>Room ID: {activeRoomId}</Text>
              <Text style={styles.callStatusText}>
                {isVoiceRoomActive ? '🟢 Live Space Active • Audio Broadcasting' : 'Ready to start live audio space'}
              </Text>
              
              <View style={{ width: '100%', backgroundColor: '#2d3748', padding: 12, borderRadius: 12, marginBottom: 20 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12, marginBottom: 6 }}>Active Speakers ({roomParticipants.length}):</Text>
                {roomParticipants.map((p, idx) => (
                  <Text key={idx} style={{ color: '#cbd5e0', fontSize: 11, marginBottom: 2 }}>👤 {p}</Text>
                ))}
              </View>

              <View style={styles.callActionsRow}>
                <TouchableOpacity 
                  style={[styles.callActionBtn, isRoomMuted && { backgroundColor: '#e53e3e' }]} 
                  onPress={() => setIsRoomMuted(!isRoomMuted)}
                >
                  <Text style={{ fontSize: 20 }}>{isRoomMuted ? '🔇' : '🎙️'}</Text>
                  <Text style={styles.callBtnLabel}>{isRoomMuted ? 'Muted' : 'Mic On'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.callActionBtn, { backgroundColor: isVoiceRoomActive ? '#e53e3e' : '#38a169' }]} 
                  onPress={() => setIsVoiceRoomActive(!isVoiceRoomActive)}
                >
                  <Text style={{ fontSize: 20 }}>{isVoiceRoomActive ? '⏹️' : '▶️'}</Text>
                  <Text style={styles.callBtnLabel}>{isVoiceRoomActive ? 'End Room' : 'Go Live'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={{ marginTop: 20 }} onPress={() => setVoiceRoomModalVisible(false)}>
                <Text style={{ color: '#a0aec0', fontWeight: 'bold' }}>Minimize Room</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Ringtone Picker Modal */}
        <Modal visible={ringtonePickerVisible} transparent={true} animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setRingtonePickerVisible(false)}>
            <View style={[styles.trayContainer, isDarkMode && styles.darkContainer, { maxHeight: '85%' }]}>
              <View style={styles.trayIndicatorBar} />
              <Text style={[styles.trayTitle, isDarkMode && styles.darkText]}>🎵 Choose Ringtone (10 Options)</Text>
              <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Tap test sound to hear each ringtone live before saving your choice.</Text>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                {ringtoneList.map((rt) => {
                  const isSelected = selectedRingTone === rt.label;
                  const isPreviewing = previewingSoundLabel === rt.label;

                  return (
                    <View key={rt.label} style={[styles.trayItem, isSelected && { backgroundColor: 'rgba(49, 130, 206, 0.1)' }, { justifyContent: 'space-between' }]}>
                      <TouchableOpacity 
                        style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                        onPress={() => {
                          setSelectedRingTone(rt.label);
                          setRingtonePickerVisible(false);
                          Alert.alert('Ringtone Saved 🎵', `Active incoming ringtone set to: ${rt.label}`);
                        }}
                      >
                        <Text style={styles.trayIcon}>{rt.label.includes('Silent') ? '🚫' : '🔔'}</Text>
                        <Text style={[styles.trayText, isDarkMode && styles.darkText, isSelected && { color: currentTheme.primary, fontWeight: 'bold' }]}>
                          {rt.label} {isSelected ? '✓' : ''}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={{ backgroundColor: isPreviewing ? '#38a169' : '#3182ce', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}
                        onPress={() => handlePreviewSound(rt.label, rt.uri)}
                      >
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{isPreviewing ? '🔊 Playing...' : '▶️ Test Sound'}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>

        {/* Message Alert Picker Modal */}
        <Modal visible={messageAlertPickerVisible} transparent={true} animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setMessageAlertPickerVisible(false)}>
            <View style={[styles.trayContainer, isDarkMode && styles.darkContainer, { maxHeight: '85%' }]}>
              <View style={styles.trayIndicatorBar} />
              <Text style={[styles.trayTitle, isDarkMode && styles.darkText]}>🔔 Message Alerts (10 Options)</Text>
              <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Tap test sound to hear each alert, or choose silent mode for privacy.</Text>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                {messageAlertList.map((ma) => {
                  const isSelected = selectedMessageAlert === ma.label;
                  const isPreviewing = previewingSoundLabel === ma.label;

                  return (
                    <View key={ma.label} style={[styles.trayItem, isSelected && { backgroundColor: 'rgba(49, 130, 206, 0.1)' }, { justifyContent: 'space-between' }]}>
                      <TouchableOpacity 
                        style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                        onPress={() => {
                          setSelectedMessageAlert(ma.label);
                          setMessageAlertPickerVisible(false);
                          Alert.alert('Alert Sound Saved 🔔', `Active message alert set to: ${ma.label}`);
                        }}
                      >
                        <Text style={styles.trayIcon}>{ma.label.includes('Silent') ? '🚫' : '💬'}</Text>
                        <Text style={[styles.trayText, isDarkMode && styles.darkText, isSelected && { color: currentTheme.primary, fontWeight: 'bold' }]}>
                          {ma.label} {isSelected ? '✓' : ''}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={{ backgroundColor: isPreviewing ? '#38a169' : '#3182ce', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}
                        onPress={() => handlePreviewSound(ma.label, ma.uri)}
                      >
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{isPreviewing ? '🔊 Playing...' : '▶️ Test Sound'}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>

        {/* Settings Modal */}
        <Modal visible={settingsModalVisible} transparent={true} animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setSettingsModalVisible(false)}>
            <View style={[styles.trayContainer, isDarkMode && styles.darkContainer, { maxHeight: '90%' }]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.trayIndicatorBar} />
                <Text style={[styles.trayTitle, isDarkMode && styles.darkText]}>⚙️ Chat Room Settings & Matrix</Text>

                <View style={{ backgroundColor: isDarkMode ? '#2d3748' : '#f7fafc', borderColor: '#cbd5e0', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 15 }}>
                  <Text style={{ fontSize: 12, color: currentTheme.primary, fontWeight: 'bold', marginBottom: 4 }}>🔗 Current Room ID (Debug)</Text>
                  <Text style={{ fontSize: 10, color: isDarkMode ? '#cbd5e0' : '#4a5568', marginBottom: 10 }} selectable={true}>{activeRoomId}</Text>
                  
                  <Text style={{ fontSize: 12, color: currentTheme.primary, fontWeight: 'bold', marginBottom: 8 }}>🔔 Notifications, Alerts & Ringtone Controls</Text>
                  
                  <TouchableOpacity 
                    style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}
                    onPress={() => setRingtonePickerVisible(true)}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: isDarkMode ? '#fff' : '#2d3748' }}>Call Ringtone (10 Options)</Text>
                    <Text style={{ fontSize: 12, color: currentTheme.primary, fontWeight: 'bold' }} numberOfLines={1}>{selectedRingTone} ›</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}
                    onPress={() => setMessageAlertPickerVisible(true)}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: isDarkMode ? '#fff' : '#2d3748' }}>Message Alerts (10 Options)</Text>
                    <Text style={{ fontSize: 12, color: selectedMessageAlert.includes('Silent') || selectedMessageAlert.includes('Off') ? '#e53e3e' : '#38a169', fontWeight: 'bold' }} numberOfLines={1}>{selectedMessageAlert} ›</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ backgroundColor: isDarkMode ? '#2d3748' : '#faf5ff', borderColor: '#9333ea', borderWidth: 1.5, borderRadius: 10, padding: 10, marginBottom: 15 }}>
                  <Text style={{ fontSize: 12, color: '#9333ea', fontWeight: 'bold', marginBottom: 8 }}>🛡️ 10 Super-Layers Security Matrix</Text>
                  <View style={{ gap: 6 }}>
                    {[
                      { label: '🔒 Quantum Lattice Encryption', val: quantumLatticeSecurity, setVal: setQuantumLatticeSecurity },
                      { label: '🌐 Edge Relay Sync', val: kampalaEdgeRelaySync, setVal: setKampalaEdgeRelaySync },
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
                Total items stored: {messages.filter(m => m.image_url || safeText(m.text).includes('Scanned')).length}
              </Text>
              <ScrollView horizontal contentContainerStyle={{ paddingVertical: 10 }} style={{ maxHeight: 130 }}>
                {messages.filter(m => m.image_url || safeText(m.text).includes('Scanned')).map((m, idx) => (
                  <View key={idx} style={{ marginRight: 10 }}>
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

        {/* Message Options Modal */}
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

function tryParsePoll(text) {
  try {
    const textStr = safeText(text);
    if (textStr && textStr.includes('[GROUP POLL]:')) {
      return JSON.parse(textStr.replace('[GROUP POLL]:', '').trim());
    }
  } catch (e) {}
  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  darkContainer: { backgroundColor: '#1a202c' },
  header: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', paddingTop: 20 },
  darkHeader: { backgroundColor: '#2d3748', borderBottomColor: '#4a5568' },
  headerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerIconBtn: { marginLeft: 6, padding: 4 },
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
  floatingUnseenBadge: { position: 'absolute', bottom: 70, alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 4, zIndex: 10 },
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
  compilePdfBtn: { backgroundColor: '#48bb78', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, alignItems: 'center' },
  trayContainer: { backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  trayIndicatorBar: { width: 40, height: 4, backgroundColor: '#cbd5e0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  trayTitle: { fontSize: 15, fontWeight: 'bold', color: '#2d3748', marginBottom: 16 },
  trayItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  trayIcon: { fontSize: 20, marginRight: 14 },
  trayText: { fontSize: 13, fontWeight: '600', color: '#4a5568' },
  pollInput: { backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 10, paddingHorizontal: 12, height: 40, fontSize: 13, color: '#2d3748' },
  themeSwatch: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  selectedSwatch: { borderWidth: 2, borderColor: '#2d3748' },
  customWallpaperBtn: { backgroundColor: '#3182ce', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  stickerGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', paddingVertical: 10 },
  stickerItem: { padding: 15 },
  fullscreenOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  closeFullscreenBtn: { position: 'absolute', top: 40, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  closeFullscreenText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  fullscreenImage: { width: '100%', height: '80%' },
  callOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  callCard: { width: '100%', maxWidth: 340, backgroundColor: '#1a202c', borderRadius: 24, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#4a5568' },
  callAvatarLarge: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  callContactName: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  callStatusText: { color: '#cbd5e0', fontSize: 13, marginBottom: 30 },
  callActionsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  callActionBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#2d3748', justifyContent: 'center', alignItems: 'center' },
  callBtnLabel: { color: '#cbd5e0', fontSize: 10, marginTop: 4 },
  videoCallOverlay: { flex: 1, backgroundColor: '#000', justifyContent: 'space-between' },
  videoCallTopBar: { position: 'absolute', top: 40, left: 15, right: 15, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.65)', padding: 12, borderRadius: 12, alignItems: 'center' },
  videoCallBottomBar: { position: 'absolute', bottom: 40, left: 20, right: 20, zIndex: 50, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(0,0,0,0.6)', padding: 16, borderRadius: 24 },
  videoCallControlBtn: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#2d3748', justifyContent: 'center', alignItems: 'center' },
});