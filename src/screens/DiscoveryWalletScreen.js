import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Animated,
  Platform,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from '../../Services/supabaseClient';

// IMPORT MODULAR COMPONENTS & LIVE STREAM SCREEN
import DiscoveryFeedList from './DiscoveryFeedList';
import DiscoveryWatchPartyModule from './DiscoveryWatchPartyModule';
import DiscoveryCreatorStudioModal from './DiscoveryCreatorStudioModal';
import DiscoveryCommentsModal from './DiscoveryCommentsModal';
import DiscoverySecurityMatrixModal from './DiscoverySecurityMatrixModal';
import DiscoveryQuickActionsModal from './DiscoveryQuickActionsModal';
import PeerProfileModal from './PeerProfileModal';
import LiveStreamScreen from './LiveStreamScreen';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DiscoveryWalletScreen({ isDarkMode, navigation }) {
  // Navigation & Sub-Tabs State
  const [discoveryTab, setDiscoveryTab] = useState('Feed'); // 'Feed', 'Tours', 'Vault', 'WatchParty', 'Radar', 'Channels', 'LiveMap'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Live Stream Studio State & Coin Balance
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [coins, setCoins] = useState(1500);

  // Pull-to-Refresh State
  const [refreshing, setRefreshing] = useState(false);

  // Active Video Viewport Index State (for auto-stop on scroll)
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  // Liked posts tracking set to prevent double liking
  const [likedPostIds, setLikedPostIds] = useState(new Set());

  // AI Smart Interest Learning State
  const [userInterests, setUserInterests] = useState({ Tours: 5, Wildlife: 4, Music: 2, Football: 1, Tech: 1 });

  // Geofenced Radius State
  const [geofenceRadius, setGeofenceRadius] = useState(10); // in km

  // Overlays & Modal Controls
  const [matrixMenuVisible, setMatrixMenuVisible] = useState(false);
  const [forwardModalVisible, setForwardModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [fullScreenModalVisible, setFullScreenModalVisible] = useState(false);
  const [activeMediaItem, setActiveMediaItem] = useState(null);
  const [longPressModalVisible, setLongPressModalVisible] = useState(false);
  const [postSettingsModalVisible, setPostSettingsModalVisible] = useState(false);
  const [boostModalVisible, setBoostModalVisible] = useState(false);

  // Peer Public Profile Modal States
  const [selectedPeerId, setSelectedPeerId] = useState(null);
  const [peerModalVisible, setPeerModalVisible] = useState(false);
  const [currentLoggedInUserId, setCurrentLoggedInUserId] = useState(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100');
  const [currentUserName, setCurrentUserName] = useState('Borris');

  // Fetch current session user id & profile info on mount
  useEffect(() => {
    async function getSessionUser() {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          setCurrentLoggedInUserId(session.user.id);
          const rawName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Borris';
          setCurrentUserName(rawName);

          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (profile?.avatar_url) {
            setCurrentUserAvatar(profile.avatar_url);
          }
        }
      }
    }
    getSessionUser();
  }, []);

  const handleOpenCreatorProfile = (authorName, authorAvatar, postItem) => {
    const targetUserId = (postItem && postItem.user_id) ? postItem.user_id : currentLoggedInUserId;
    if (targetUserId) {
      setSelectedPeerId(targetUserId);
      setPeerModalVisible(true);
    } else {
      setSelectedPeerId(currentLoggedInUserId || 'd37f5eca-0ce9-4b97-9a9d-1944d48bf001');
      setPeerModalVisible(true);
    }
  };

  // Creator Upload & Studio Modal State
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [creatorStudioModalVisible, setCreatorStudioModalVisible] = useState(false);
  const [mediaSourceType, setMediaSourceType] = useState('camera');
  const [facing, setFacing] = useState('back');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [capturedMediaUri, setCapturedMediaUri] = useState(null);

  // Studio Editing Settings
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Tours');
  const [selectedFilter, setSelectedFilter] = useState('Cinematic 🎬');
  const [audioTrack, setAudioTrack] = useState('Original Field Audio 🎵');

  // Camera permissions and ref
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  // Comment Modal States & Professional Threaded Replies
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [currentPostComments, setCurrentPostComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);

  // Working Creator Wallet Tip State & Modal
  const [tipModalVisible, setTipModalVisible] = useState(false);
  const [selectedTipAmount, setSelectedTipAmount] = useState(5000);
  const [creatorWalletBalance, setCreatorWalletBalance] = useState(45000); // UGX

  // AI Caption Generator Modal State
  const [aiCaptionModalVisible, setAiCaptionModalVisible] = useState(false);
  const [rawCreatorInput, setRawCreatorInput] = useState('');
  const [generatedAiCaption, setGeneratedAiCaption] = useState('');

  // Watch Party State
  const [watchPartyActive, setWatchPartyActive] = useState(true);
  const [watchPartyPeers, setWatchPartyPeers] = useState(6);
  const [isPlayingWatchParty, setIsPlayingWatchParty] = useState(true);
  const [watchPartyPlaylist] = useState([
    { id: 'wp_1', title: 'Source of the Nile - Sunset Live Stream', url: 'https://www.w3schools.com/html/mov_bbb.mp4', host: 'Borris Ranger Hub' },
    { id: 'wp_2', title: 'Bwindi Mountain Gorillas Conservation Walk', url: 'https://www.w3schools.com/html/mov_bbb.mp4', host: 'Talk with Nature HD' },
    { id: 'wp_3', title: 'Queen Elizabeth Park Wildlife Expedition', url: 'https://www.w3schools.com/html/mov_bbb.mp4', host: 'Pearl Safaris UG' },
  ]);
  const [currentWatchPartyIndex, setCurrentWatchPartyIndex] = useState(0);
  const [watchPartyChat, setWatchPartyChat] = useState([
    { id: '1', user: 'Stella', text: 'This Jinja boat cruise looks exceptionally peaceful and well-managed.' },
    { id: '2', user: 'Borris', text: 'Indeed, we plan to schedule our next conservation expedition here.' }
  ]);
  const [newWatchChatText, setNewWatchChatText] = useState('');

  // Saved Collections / Bookmarks Vault State
  const [savedVaultItems, setSavedVaultItems] = useState([]);

  // 10 Super-Layers Architecture State
  const [quantumLatticeSecurity, setQuantumLatticeSecurity] = useState(true);
  const [kampalaEdgeRelaySync, setKampalaEdgeRelaySync] = useState(true);
  const [aiAutonomousToxicityGuard, setAiAutonomousToxicityGuard] = useState(true);
  const [biometricCreatorWatermark, setBiometricCreatorWatermark] = useState(true);
  const [realtimeSentimentMesh, setRealtimeSentimentMesh] = useState(true);
  const [zeroFeeGasSubsidizer, setZeroFeeGasSubsidizer] = useState(true);
  const [multimodalHlsAdaptive, setMultimodalHlsAdaptive] = useState(true);
  const [federatedOnDeviceAi, setFederatedOnDeviceAi] = useState(true);
  const [bluetoothP2pMeshRelay, setBluetoothP2pMeshRelay] = useState(true);
  const [autonomousCreatorEscrow, setAutonomousCreatorEscrow] = useState(true);

  const heartScale = useRef(new Animated.Value(0)).current;

  // Recording Timer Effect
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Fetch Feed Items from Supabase
  const [feedItems, setFeedItems] = useState([]);

  useEffect(() => {
    fetchDiscoveryFeed();

    if (supabase) {
      const channel = supabase
        .channel('public:discovery_feed_items')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'discovery_feed_items' }, () => {
          fetchDiscoveryFeed();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const fetchDiscoveryFeed = async () => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('discovery_feed_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setFeedItems(data);
      } else if (!data || data.length === 0) {
        setFeedItems([
          {
            id: '1',
            user_id: 'default_user_01',
            author: 'Borris Ahabwamukama',
            author_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
            caption: '🐘 #BwindiGorillas Mountain Gorilla Expedition & Guided Forest Walk. Experience the raw beauty of #Uganda conservation zones!',
            created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
            likes: 840,
            downloads: 12,
            distanceKm: 2.1,
            allowDownloads: true,
            isPinned: true,
            isBoosted: false,
            comments: [
              {
                id: 'c_101',
                user: 'Dr. Evelyn Namubiru',
                text: 'Commendable initiative regarding regional habitat preservation and sustainable ecotourism.',
                time: '14:30',
                likes: 12,
                replies: [
                  { id: 'r_201', user: 'Borris', text: 'Thank you for your expert insights on biodiversity.', time: '14:45', likes: 5 }
                ]
              }
            ],
            shares: 31,
            vibe: 'Wildlife Tour 🌿',
            category: 'Wildlife',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            location: 'Bwindi Impenetrable National Park, Uganda',
            duration: '4:20 Min Tour'
          }
        ]);
      }
    } catch (err) {
      console.log('Supabase fetch error:', err.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDiscoveryFeed();
    setRefreshing(false);
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / (SCREEN_HEIGHT * 0.65));
    if (index !== activeVideoIndex && index >= 0) {
      setActiveVideoIndex(index);
    }
  };

  const [stories] = useState([
    { id: '1', name: 'Nimusiima', location: 'Queen Elizabeth Park', distanceKm: 1.5, mediaType: 'Elephant Herd Clip' },
    { id: '2', name: 'Stella', location: 'Kampala Central', distanceKm: 4.2, mediaType: 'Acoustic Studio Jam' },
    { id: '3', name: 'Borris', location: 'Bwindi Impenetrable', distanceKm: 2.1, mediaType: 'Gorilla Trekking Tour' },
  ]);

  const [officialChannels] = useState([
    { id: 'ch_1', name: 'Talk with Nature HD', owner: 'Borris Ranger Hub', category: 'Wildlife', followers: '14.2K', badge: 'Official Broadcaster 🛡️' },
    { id: 'ch_2', name: 'Kampala Sports TV', owner: 'Sports Hub UG', category: 'Sports', followers: '22.5K', badge: 'Official Broadcaster 🛡️' },
    { id: 'ch_3', name: 'Pearl Safaris Tour Channel', owner: 'Uganda Tourism Board', category: 'Tours', followers: '35.1K', badge: 'Verified Tour Partner 🌟' },
  ]);

  const [radarNodes] = useState([
    { id: 'node_1', name: 'Ranger Brian', distance: '1.2 km away', status: 'Broadcasting Field Tour', signal: 'Strong (Mesh Node)' },
    { id: 'node_2', name: 'Kampala Mesh Relay 04', distance: '3.1 km away', status: 'Active RTMP Relay Station', signal: 'High Bandwidth 🟢' },
  ]);

  const trackUserInterest = (category) => {
    setUserInterests(prev => ({ ...prev, [category]: (prev[category] || 0) + 2 }));
  };

  // 🌟 HELPER TO TRIGGER INSTANT SUPABASE NOTIFICATIONS TO CREATORS
  const sendDiscoveryNotification = async (recipientUserId, title, body, relatedItemId) => {
    if (!supabase || !recipientUserId || recipientUserId === currentLoggedInUserId) return;
    try {
      await supabase.from('notifications').insert([
        {
          user_id: recipientUserId,
          title,
          body,
          type: 'discovery_interaction',
          related_item_id: relatedItemId,
          created_at: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.log('Error triggering discovery notification:', err.message);
    }
  };

  // 🌟 FIXED: Robustly updates post likes, accumulates total creator profile likes, and notifies owner
  const handleLikePost = async (item) => {
    if (likedPostIds.has(item.id)) {
      Alert.alert('Notice', 'You have already liked this publication.');
      return;
    }
    trackUserInterest(item.category);
    const updatedLikes = (item.likes || 0) + 1;
    setLikedPostIds(prev => new Set(prev).add(item.id));
    setFeedItems(prev => prev.map(p => p.id === item.id ? { ...p, likes: updatedLikes } : p));
    
    try {
      if (supabase && item.id) {
        await supabase
          .from('discovery_feed_items')
          .update({ likes: updatedLikes })
          .eq('id', item.id);

        if (item.user_id && item.user_id !== currentLoggedInUserId) {
          // 1. Send notification to author
          await sendDiscoveryNotification(
            item.user_id,
            'New Like ❤️',
            `@${currentUserName} liked your publication "${(item.caption || '').slice(0, 30)}..."`,
            item.id
          );

          // 2. Accumulate creator's total profile likes
          const { data: creatorProfile } = await supabase
            .from('profiles')
            .select('total_likes, likes_received')
            .eq('user_id', item.user_id)
            .maybeSingle();

          const currentTotalLikes = creatorProfile?.total_likes || creatorProfile?.likes_received || 0;
          const newTotalLikes = currentTotalLikes + 1;

          const { error: updateErr } = await supabase
            .from('profiles')
            .update({ total_likes: newTotalLikes })
            .eq('user_id', item.user_id);

          if (updateErr) {
            await supabase
              .from('profiles')
              .update({ likes_received: newTotalLikes })
              .eq('user_id', item.user_id);
          }
        }
      }
    } catch (err) {
      console.log('Error processing like & profile accumulation:', err.message);
    }
  };

  let lastTap = null;
  const handleDoubleTapLike = (item) => {
    const now = Date.now();
    if (lastTap && (now - lastTap) < 300) {
      if (!likedPostIds.has(item.id)) {
        handleLikePost(item);
        heartScale.setValue(0);
        Animated.sequence([
          Animated.spring(heartScale, { toValue: 1, friction: 3, useNativeDriver: true }),
          Animated.timing(heartScale, { toValue: 0, duration: 200, delay: 300, useNativeDriver: true })
        ]).start();
      }
    } else {
      lastTap = now;
    }
  };

  const handleDeletePost = async (postId) => {
    Alert.alert(
      'Delete Post 🗑️',
      'Are you sure you want to permanently remove this post from your feed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          pressOn: async () => {
            setFeedItems(prev => prev.filter(p => p.id !== postId));
            setPostSettingsModalVisible(false);
            try {
              if (supabase && postId) await supabase.from('discovery_feed_items').delete().eq('id', postId);
            } catch (err) {}
            Alert.alert('Deleted', 'Post removed successfully.');
          },
          onPress: async () => {
            setFeedItems(prev => prev.filter(p => p.id !== postId));
            setPostSettingsModalVisible(false);
            try {
              if (supabase && postId) await supabase.from('discovery_feed_items').delete().eq('id', postId);
            } catch (err) {}
            Alert.alert('Deleted', 'Post removed successfully.');
          }
        }
      ]
    );
  };

  const handleRepostVideo = async (item) => {
    setPostSettingsModalVisible(false);

    const repostItem = {
      user_id: currentLoggedInUserId || 'anonymous_user',
      author: currentUserName,
      author_avatar: currentUserAvatar,
      caption: item.caption,
      created_at: new Date().toISOString(),
      likes: 1,
      downloads: 0,
      distanceKm: item.distanceKm,
      allowDownloads: item.allowDownloads,
      isPinned: false,
      isBoosted: false,
      comments: [],
      shares: (item.shares || 0) + 1,
      vibe: item.vibe,
      category: item.category,
      videoUrl: item.videoUrl,
      location: item.location,
      duration: item.duration
    };

    try {
      if (supabase) {
        const { data, error } = await supabase.from('discovery_feed_items').insert([repostItem]).select();
        if (!error && data && data.length > 0) setFeedItems(prev => [data[0], ...prev]);
        else setFeedItems(prev => [repostItem, ...prev]);
      } else {
        setFeedItems(prev => [repostItem, ...prev]);
      }

      if (item.user_id && item.user_id !== currentLoggedInUserId) {
        await sendDiscoveryNotification(
          item.user_id,
          'Reel Reposted 🔄',
          `@${currentUserName} reposted your video!`,
          item.id
        );
      }
    } catch (err) {
      setFeedItems(prev => [repostItem, ...prev]);
    }
    Alert.alert('Repost Successful 🔄', 'Video has been published under your creator account.');
  };

  const handleExecuteBoostPost = async () => {
    setBoostModalVisible(false);
    setPostSettingsModalVisible(false);
    if (!selectedPost) return;
    setFeedItems(prev => prev.map(p => p.id === selectedPost.id ? { ...p, isBoosted: true } : p));
    try {
      if (supabase && selectedPost.id) await supabase.from('discovery_feed_items').update({ isBoosted: true }).eq('id', selectedPost.id);
    } catch (err) {}
    Alert.alert('Boost Active 🚀', 'Payment verified! Your video is now promoted across regional mesh nodes for 24 hours.');
  };

  const toggleCameraFacing = () => setFacing(current => (current === 'back' ? 'front' : 'back'));

  const handleStartRecording = async () => {
    if (!cameraRef.current) return;
    try {
      setIsRecording(true);
      const data = await cameraRef.current.recordAsync({ maxDuration: 180 });
      if (data && data.uri) {
        setCapturedMediaUri(data.uri);
        setCreatorStudioModalVisible(true);
      }
    } catch (error) {
      Alert.alert('Recording Error', 'Could not complete video recording.');
    } finally {
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  const handlePickFileFromDevice = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCapturedMediaUri(result.assets[0].uri);
        if (result.assets[0].duration) {
          setRecordingSeconds(Math.floor(result.assets[0].duration / 1000));
        }
        setCreatorStudioModalVisible(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open device library.');
    }
  };

  const handleOpenRecorder = async () => {
    if (Platform.OS === 'web') {
      handlePickFileFromDevice();
      return;
    }
    if (!cameraPermission || !cameraPermission.granted) {
      const permissionResult = await requestCameraPermission();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Camera access is required to record video.');
        return;
      }
    }
    setCameraModalVisible(true);
  };

  const handleOpenCreatorStudio = () => {
    Alert.alert(
      'Upload or Record Media 🎥',
      'Choose how you want to add your media tour:',
      [
        { text: 'Record with Camera 🔴', onPress: () => { setMediaSourceType('camera'); handleOpenRecorder(); } },
        { text: 'Upload from Files 📁', onPress: () => { setMediaSourceType('upload'); handlePickFileFromDevice(); } },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handlePublishCreatorVideo = async () => {
    if (!newPostCaption.trim()) {
      Alert.alert('Caption Required', 'Please add a brief caption or title for your media.');
      return;
    }

    const videoSourceUrl = capturedMediaUri || 'https://www.w3schools.com/html/mov_bbb.mp4';
    
    const calculatedMinutes = Math.floor(recordingSeconds / 60);
    const calculatedSeconds = recordingSeconds % 60;
    const dynamicDurationStr = recordingSeconds > 0 
      ? `${calculatedMinutes}:${calculatedSeconds < 10 ? '0' : ''}${calculatedSeconds} Min Tour` 
      : '0:45 Min Tour';

    const newVideoItem = {
      user_id: currentLoggedInUserId || 'anonymous_user',
      author: currentUserName,
      author_avatar: currentUserAvatar,
      created_at: new Date().toISOString(),
      caption: newPostCaption.trim(),
      likes: 1,
      downloads: 0,
      distanceKm: 0.1,
      allowDownloads: true,
      isPinned: false,
      isBoosted: false,
      comments: [],
      shares: 0,
      vibe: `${selectedFilter.split(' ')[0]} Vibe ✨`,
      category: newPostCategory,
      videoUrl: videoSourceUrl,
      location: 'Kampala, Uganda',
      duration: dynamicDurationStr
    };

    try {
      if (supabase) {
        const { data, error } = await supabase.from('discovery_feed_items').insert([newVideoItem]).select();
        
        if (error) {
          Alert.alert('Supabase Insert Failed ❌', error.message);
          return;
        }

        if (data && data.length > 0) {
          setFeedItems(prev => [data[0], ...prev]);
        }
      } else {
        setFeedItems(prev => [newVideoItem, ...prev]);
      }
    } catch (err) {
      Alert.alert('Upload Error ❌', err.message);
      return;
    }

    setCreatorStudioModalVisible(false);
    setCapturedMediaUri(null);
    setNewPostCaption('');
    setRecordingSeconds(0);
    Alert.alert('Published Successfully 🚀', `Your media is live under creator profile: ${currentUserName}!`);
  };

  const handleSendWatchChat = () => {
    if (!newWatchChatText.trim()) return;
    setWatchPartyChat(prev => [...prev, { id: Date.now().toString(), user: 'You', text: newWatchChatText.trim() }]);
    setNewWatchChatText('');
  };

  const sortCommentsByPopularity = (commentsArray) => {
    return [...commentsArray].sort((a, b) => {
      const scoreA = a.likes + (a.replies ? a.replies.length * 2 : 0);
      const scoreB = b.likes + (b.replies ? b.replies.length * 2 : 0);
      return scoreB - scoreA;
    });
  };

  const handleOpenComments = (item) => {
    trackUserInterest(item.category);
    setActiveCommentPost(item);
    setCurrentPostComments(sortCommentsByPopularity(item.comments || []));
    setReplyingToCommentId(null);
    setCommentsModalVisible(true);
  };

  const handleAddComment = async (textToAdd = newCommentText) => {
    if (!textToAdd || !textToAdd.trim()) return;
    const sanitizedText = textToAdd.trim();
    const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let updatedComments = [...currentPostComments];

    if (replyingToCommentId) {
      updatedComments = updatedComments.map(c => {
        if (c.id === replyingToCommentId) {
          const newReply = { 
            id: 'r_' + Date.now(), 
            user: currentUserName, 
            text: sanitizedText, 
            time: currentTimeStr, 
            likes: 0 
          };
          return { ...c, replies: [...(c.replies || []), newReply] };
        }
        return c;
      });
    } else {
      const newParent = { 
        id: 'c_' + Date.now(), 
        user: currentUserName, 
        text: sanitizedText, 
        time: currentTimeStr, 
        likes: 0, 
        replies: [] 
      };
      updatedComments.push(newParent);
    }

    const sorted = sortCommentsByPopularity(updatedComments);
    setCurrentPostComments(sorted);
    setFeedItems(prev => prev.map(p => p.id === activeCommentPost.id ? { ...p, comments: sorted } : p));
    setNewCommentText('');
    setReplyingToCommentId(null);

    try {
      if (supabase && activeCommentPost && activeCommentPost.id) {
        await supabase.from('discovery_feed_items').update({ comments: sorted }).eq('id', activeCommentPost.id);

        if (activeCommentPost.user_id && activeCommentPost.user_id !== currentLoggedInUserId) {
          await sendDiscoveryNotification(
            activeCommentPost.user_id,
            'New Comment 💬',
            `@${currentUserName} commented: "${sanitizedText.slice(0, 25)}..."`,
            activeCommentPost.id
          );
        }
      }
    } catch (err) {}
  };

  const handleLikeComment = async (commentId) => {
    const updated = currentPostComments.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c);
    const sorted = sortCommentsByPopularity(updated);
    setCurrentPostComments(sorted);
    setFeedItems(prev => prev.map(p => p.id === activeCommentPost.id ? { ...p, comments: sorted } : p));
    try {
      if (supabase && activeCommentPost && activeCommentPost.id) {
        await supabase.from('discovery_feed_items').update({ comments: sorted }).eq('id', activeCommentPost.id);
      }
    } catch (err) {}
  };

  const handleLikeReply = async (commentId, replyId) => {
    const updated = currentPostComments.map(c => {
      if (c.id === commentId) {
        const updatedReplies = c.replies.map(r => r.id === replyId ? { ...r, likes: r.likes + 1 } : r);
        return { ...c, replies: updatedReplies };
      }
      return c;
    });
    const sorted = sortCommentsByPopularity(updated);
    setCurrentPostComments(sorted);
    setFeedItems(prev => prev.map(p => p.id === activeCommentPost.id ? { ...p, comments: sorted } : p));
    try {
      if (supabase && activeCommentPost && activeCommentPost.id) {
        await supabase.from('discovery_feed_items').update({ comments: sorted }).eq('id', activeCommentPost.id);
      }
    } catch (err) {}
  };

  const handleInsertFormatting = (formatType) => {
    if (formatType === 'newline') setNewCommentText(prev => prev + '\n');
    else if (formatType === 'bullet') setNewCommentText(prev => prev + (prev.endsWith('\n') || prev === '' ? '• ' : '\n• '));
    else if (formatType === 'list') setNewCommentText(prev => prev + (prev.endsWith('\n') || prev === '' ? '1. ' : '\n1. '));
  };

  const handleOpenForwardModal = (item) => {
    setSelectedPost(item);
    setForwardModalVisible(true);
  };

  const handleExecuteForward = async (destination) => {
    setForwardModalVisible(false);
    if (destination === 'Virtual TV Watch Party') {
      setWatchPartyActive(true);
      Alert.alert('Watch Party Active 📺', 'Synchronized stream room online with peers.');
    } else {
      Alert.alert('International Share 🚀', `Successfully broadcasted to ${destination}.`);
    }
    const updatedShares = (selectedPost.shares || 0) + 1;
    setFeedItems(prev => prev.map(item => item.id === selectedPost.id ? { ...item, shares: updatedShares } : item));
    
    try {
      if (supabase && selectedPost && selectedPost.id) {
        await supabase.from('discovery_feed_items').update({ shares: updatedShares }).eq('id', selectedPost.id);

        if (selectedPost.user_id && selectedPost.user_id !== currentLoggedInUserId) {
          await sendDiscoveryNotification(
            selectedPost.user_id,
            'Video Shared ↗️',
            `@${currentUserName} shared your video to ${destination}!`,
            selectedPost.id
          );
        }
      }
    } catch (err) {}
  };

  const handleOpenTipModal = (item) => {
    setSelectedPost(item);
    setTipModalVisible(true);
  };

  const handleExecuteTip = async () => {
    if (creatorWalletBalance < selectedTipAmount) {
      Alert.alert('Insufficient Balance 💳', 'Your creator wallet balance is too low for this tip amount.');
      setTipModalVisible(false);
      return;
    }
    setCreatorWalletBalance(prev => prev - selectedTipAmount);
    setTipModalVisible(false);
    Alert.alert('Tip Sent Successfully! 🎁☕', `You successfully tipped UGX ${selectedTipAmount.toLocaleString()} to ${selectedPost?.author || 'Creator'}.`);

    try {
      if (supabase && selectedPost?.user_id && selectedPost.user_id !== currentLoggedInUserId) {
        await sendDiscoveryNotification(
          selectedPost.user_id,
          'Coffee Tip Received ☕💰',
          `@${currentUserName} tipped UGX ${selectedTipAmount.toLocaleString()} on your video!`,
          selectedPost.id
        );
      }
    } catch (err) {}
  };

  const handleLongPressMedia = (item) => {
    setSelectedPost(item);
    setLongPressModalVisible(true);
  };

  const handleDownloadMedia = async () => {
    setLongPressModalVisible(false);

    if (selectedPost && selectedPost.allowDownloads === false) {
      Alert.alert('Download Restricted 🛡️', 'Creator disabled downloads for this video.');
      return;
    }

    const videoUri = selectedPost?.videoUrl;
    if (!videoUri) {
      Alert.alert('Download Error ❌', 'Missing video source URI.');
      return;
    }

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied ⚠️', 'Storage permission is required to save videos to your device gallery.');
        return;
      }

      if (videoUri.startsWith('file://') || videoUri.startsWith('content://')) {
        Alert.alert('Saving 📥', 'Saving video to your device gallery...');
        await MediaLibrary.createAssetAsync(videoUri);
      } else if (videoUri.startsWith('http')) {
        Alert.alert('Downloading 📥', 'Downloading video to your device...');
        const filename = `DiscoveryVideo_${Date.now()}.mp4`;
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;

        const downloadRes = await FileSystem.downloadAsync(videoUri, fileUri);

        if (downloadRes.status === 200) {
          await MediaLibrary.createAssetAsync(downloadRes.uri);
        } else {
          throw new Error(`Download failed with status code ${downloadRes.status}`);
        }
      } else {
        Alert.alert('Download Error ❌', 'Invalid video source format.');
        return;
      }

      const updatedDownloads = (selectedPost.downloads || 0) + 1;
      setFeedItems(prev => prev.map(item => item.id === selectedPost.id ? { ...item, downloads: updatedDownloads } : item));
      
      if (supabase && selectedPost?.id) {
        await supabase.from('discovery_feed_items').update({ downloads: updatedDownloads }).eq('id', selectedPost.id);
      }

      Alert.alert('Download Successful! 📥✨', 'Video has been saved to your device gallery and logged.');
    } catch (error) {
      console.warn('Video download error:', error);
      Alert.alert('Download Failed ❌', 'Could not complete the video download. Please check your network connection.');
    }
  };

  const handleSaveToVault = async (item) => {
    setLongPressModalVisible(false);
    if (!savedVaultItems.some(i => i.id === item.id)) {
      setSavedVaultItems(prev => [...prev, item]);
      Alert.alert('Saved to Vault ⭐', 'Post added to offline collections vault.');

      try {
        if (supabase && item.user_id && item.user_id !== currentLoggedInUserId) {
          await sendDiscoveryNotification(
            item.user_id,
            'Video Favorited ⭐',
            `@${currentUserName} saved your video to their collections vault!`,
            item.id
          );
        }
      } catch (err) {}
    } else {
      Alert.alert('Already Saved', 'This item is already in your offline vault.');
    }
  };

  const handleWindVideo = (dir) => {
    setLongPressModalVisible(false);
    Alert.alert('Video Scrubbing ⏩', dir === 'forward' ? 'Winding forward 10s...' : 'Winding backward 10s...');
  };

  const handleCopyLink = () => {
    setLongPressModalVisible(false);
    const linkToCopy = selectedPost?.videoUrl || `https://chatup.ug/discovery/post/${selectedPost?.id || Date.now()}`;
    Alert.alert('Link Copied 📋', `Secure media link copied to clipboard:\n${linkToCopy}`);
  };

  const handleOpenFullScreen = (item) => {
    setActiveMediaItem(item);
    setFullScreenModalVisible(true);
  };

  const handleGenerateAiCaption = () => {
    if (!rawCreatorInput.trim()) return;
    const smartTags = rawCreatorInput.toLowerCase().includes('foot') ? ' #Arsenal #ManCity #PremierLeague' : ' #BwindiGorillas #UgandaTours #ExploreKampala';
    setGeneratedAiCaption(`🔥 [AI Optimized]: ${rawCreatorInput.trim()} ✨ Check out live mesh updates!${smartTags}`);
  };

  const categories = ['All', 'Tours', 'Wildlife', 'Football', 'Music', 'Tech'];

  const sortedFeed = [...feedItems].sort((a, b) => {
    const weightA = userInterests[a.category] || 0;
    const weightB = userInterests[b.category] || 0;
    if (a.isPinned) return -1;
    if (b.isPinned) return 1;
    return weightB - weightA;
  });

  const filteredFeed = sortedFeed.filter(item => {
    const matchesSearch = item.caption.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.vibe.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesRadius = item.distanceKm <= geofenceRadius;
    return matchesSearch && matchesCategory && matchesRadius;
  });

  if (isLiveActive) {
    return (
      <LiveStreamScreen
        isDarkMode={isDarkMode}
        coins={coins}
        setCoins={setCoins}
        onBack={() => setIsLiveActive(false)}
        userRole="creator"
        streamId={1}
      />
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      
      {/* Top Header & Search Navigation */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <View style={styles.headerInner}>
          
          <TouchableOpacity 
            style={styles.headerAccountShortcut} 
            onPress={() => {
              setSelectedPeerId(currentLoggedInUserId || 'd37f5eca-0ce9-4b97-9a9d-1944d48bf001');
              setPeerModalVisible(true);
            }}
          >
            <Image source={{ uri: currentUserAvatar }} style={styles.headerAvatarImg} />
            <View style={styles.onlineStatusDot} />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
            
            <TouchableOpacity 
              style={styles.goLiveHeaderBtn} 
              onPress={() => setIsLiveActive(true)}
            >
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>🔴 Go Live</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.postVideoHeaderBtn} onPress={handleOpenCreatorStudio}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>+ 🎥 Studio</Text>
            </TouchableOpacity>

            <View style={[styles.searchBox, isDarkMode && styles.darkSearchBox]}>
              <Text style={{ fontSize: 13, marginRight: 4 }}>🔍</Text>
              <TextInput
                style={[styles.searchInput, isDarkMode && styles.darkText]}
                placeholder="Search feed..."
                placeholderTextColor="#a0aec0"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={{ color: '#718096', fontWeight: 'bold' }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={styles.matrixMenuBtn} onPress={() => setMatrixMenuVisible(true)}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>•••</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sub Navigation Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabsRow}>
          {[
            { key: 'Feed', label: '🔥 Smart Feed' },
            { key: 'Tours', label: '🦁 African Tours' },
            { key: 'WatchParty', label: watchPartyActive ? '📺 Watch Party (Live)' : '📺 Watch Party' },
            { key: 'Vault', label: `⭐ Saved Vault (${savedVaultItems.length})` },
            { key: 'Radar', label: '📡 Vibe Radar' },
            { key: 'Channels', label: '🛡️ Channels' },
            { key: 'LiveMap', label: '🗺️ Map' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.subTabBtn, discoveryTab === tab.key && styles.activeSubTabBtn]}
              onPress={() => setDiscoveryTab(tab.key)}
            >
              <Text style={[styles.subTabBtnText, discoveryTab === tab.key && styles.activeSubTabBtnText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Responsive Feed Layout */}
      <ScrollView 
        contentContainerStyle={styles.mainLayout} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3182ce" />}
      >
        {discoveryTab === 'WatchParty' ? (
          <DiscoveryWatchPartyModule
            isDarkMode={isDarkMode}
            watchPartyActive={watchPartyActive}
            watchPartyPeers={watchPartyPeers}
            setWatchPartyPeers={setWatchPartyPeers}
            isPlayingWatchParty={isPlayingWatchParty}
            setIsPlayingWatchParty={setIsPlayingWatchParty}
            watchPartyPlaylist={watchPartyPlaylist}
            currentWatchPartyIndex={currentWatchPartyIndex}
            setCurrentWatchPartyIndex={setCurrentWatchPartyIndex}
            watchPartyChat={watchPartyChat}
            newWatchChatText={newWatchChatText}
            setNewWatchChatText={setNewWatchChatText}
            handleSendWatchChat={handleSendWatchChat}
          />
        ) : (
          <DiscoveryFeedList
            isDarkMode={isDarkMode}
            discoveryTab={discoveryTab}
            filteredFeed={filteredFeed}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            geofenceRadius={geofenceRadius}
            setGeofenceRadius={setGeofenceRadius}
            stories={stories}
            radarNodes={radarNodes}
            officialChannels={officialChannels}
            savedVaultItems={savedVaultItems}
            activeVideoIndex={activeVideoIndex}
            likedPostIds={likedPostIds}
            handleLikePost={handleLikePost}
            handleDoubleTapLike={handleDoubleTapLike}
            handleLongPressMedia={handleLongPressMedia}
            handleOpenFullScreen={handleOpenFullScreen}
            handleOpenComments={handleOpenComments}
            handleOpenForwardModal={handleOpenForwardModal}
            handleOpenTipModal={handleOpenTipModal}
            setPostSettingsModalVisible={setPostSettingsModalVisible}
            setSelectedPost={setSelectedPost}
            heartScale={heartScale}
            setSearchQuery={setSearchQuery}
            onPressCreator={(name, avatar, item) => handleOpenCreatorProfile(name, avatar, item)}
            currentLoggedInUserId={currentLoggedInUserId}
          />
        )}
      </ScrollView>

      {/* ================= MODAL: PEER PUBLIC PROFILE ================= */}
      <PeerProfileModal
        visible={peerModalVisible}
        onClose={() => {
          setPeerModalVisible(false);
          setSelectedPeerId(null);
        }}
        peerUserId={selectedPeerId}
        currentUserId={currentLoggedInUserId}
        isDarkMode={isDarkMode}
      />

      {/* ================= MODAL 1: SUPER-ADVANCED CAMERA RECORDING ================= */}
      <Modal visible={cameraModalVisible} animationType="slide" presentationStyle="fullScreen">
        <View style={{ flex: 1, backgroundColor: '#000', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}>
          {cameraPermission?.granted ? (
            <CameraView style={StyleSheet.absoluteFillObject} facing={facing} ref={cameraRef} mode="video">
              
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <View style={{ flex: 1, flexDirection: 'row' }}>
                  <View style={{ flex: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }} />
                  <View style={{ flex: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }} />
                  <View style={{ flex: 1 }} />
                </View>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                  <View style={{ flex: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }} />
                  <View style={{ flex: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }} />
                  <View style={{ flex: 1 }} />
                </View>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                  <View style={{ flex: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }} />
                  <View style={{ flex: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }} />
                  <View style={{ flex: 1 }} />
                </View>
              </View>

              <View style={styles.cameraOverlayControls}>
                <View style={styles.cameraTopRow}>
                  <TouchableOpacity 
                    style={styles.closeCameraBtn} 
                    onPress={() => setCameraModalVisible(false)}
                  >
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>✕ Close Camera</Text>
                  </TouchableOpacity>

                  {isRecording && (
                    <View style={styles.recordingTimerBadge}>
                      <View style={styles.recordingDot} />
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                        00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity style={styles.camIconBtn} onPress={toggleCameraFacing}>
                    <Text style={{ color: '#fff', fontSize: 18 }}>🔄</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.cameraBottomRow}>
                  {!isRecording ? (
                    <TouchableOpacity style={styles.startRecordBtn} onPress={handleStartRecording}>
                      <View style={styles.innerRecordDot} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.stopRecordBtn} onPress={handleStopRecording}>
                      <View style={styles.innerStopSquare} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </CameraView>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#fff', marginBottom: 12 }}>Camera Permission Required</Text>
              <TouchableOpacity style={styles.postVideoHeaderBtn} onPress={requestCameraPermission}>
                <Text style={{ color: '#fff' }}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* ================= MODAL 2: CREATOR STUDIO ================= */}
      <DiscoveryCreatorStudioModal
        visible={creatorStudioModalVisible}
        onClose={() => setCreatorStudioModalVisible(false)}
        isDarkMode={isDarkMode}
        mediaSourceType={mediaSourceType}
        setMediaSourceType={setMediaSourceType}
        handleOpenRecorder={handleOpenRecorder}
        handlePickFileFromDevice={handlePickFileFromDevice}
        capturedMediaUri={capturedMediaUri}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        audioTrack={audioTrack}
        setAudioTrack={setAudioTrack}
        newPostCategory={newPostCategory}
        setNewPostCategory={setNewPostCategory}
        newPostCaption={newPostCaption}
        setNewPostCaption={setNewPostCaption}
        handlePublishCreatorVideo={handlePublishCreatorVideo}
      />

      {/* ================= MODAL 3: SECURITY MATRIX ================= */}
      <DiscoverySecurityMatrixModal
        visible={matrixMenuVisible}
        onClose={() => setMatrixMenuVisible(false)}
        isDarkMode={isDarkMode}
        quantumLatticeSecurity={quantumLatticeSecurity}
        setQuantumLatticeSecurity={setQuantumLatticeSecurity}
        kampalaEdgeRelaySync={kampalaEdgeRelaySync}
        setKampalaEdgeRelaySync={setKampalaEdgeRelaySync}
        aiAutonomousToxicityGuard={aiAutonomousToxicityGuard}
        setAiAutonomousToxicityGuard={setAiAutonomousToxicityGuard}
        biometricCreatorWatermark={biometricCreatorWatermark}
        setBiometricCreatorWatermark={setBiometricCreatorWatermark}
        realtimeSentimentMesh={realtimeSentimentMesh}
        setRealtimeSentimentMesh={setRealtimeSentimentMesh}
        zeroFeeGasSubsidizer={zeroFeeGasSubsidizer}
        setZeroFeeGasSubsidizer={setZeroFeeGasSubsidizer}
        multimodalHlsAdaptive={multimodalHlsAdaptive}
        setMultimodalHlsAdaptive={setMultimodalHlsAdaptive}
        federatedOnDeviceAi={federatedOnDeviceAi}
        setFederatedOnDeviceAi={setFederatedOnDeviceAi}
        bluetoothP2pMeshRelay={bluetoothP2pMeshRelay}
        setBluetoothP2pMeshRelay={setBluetoothP2pMeshRelay}
        autonomousCreatorEscrow={autonomousCreatorEscrow}
        setAutonomousCreatorEscrow={setAutonomousCreatorEscrow}
      />

      {/* ================= MODALS 4 TO 11: QUICK ACTIONS & SUITE ================= */}
      <DiscoveryQuickActionsModal
        isDarkMode={isDarkMode}
        postSettingsVisible={postSettingsModalVisible}
        setPostSettingsVisible={setPostSettingsModalVisible}
        selectedPost={selectedPost}
        handleRepostVideo={handleRepostVideo}
        handleOpenBoostModal={() => setBoostModalVisible(true)}
        handleSaveToVault={handleSaveToVault}
        handleDeletePost={handleDeletePost}
        boostModalVisible={boostModalVisible}
        setBoostModalVisible={setBoostModalVisible}
        handleExecuteBoostPost={handleExecuteBoostPost}
        aiCaptionModalVisible={aiCaptionModalVisible}
        setAiCaptionModalVisible={setAiCaptionModalVisible}
        rawCreatorInput={rawCreatorInput}
        setRawCreatorInput={setRawCreatorInput}
        handleGenerateAiCaption={handleGenerateAiCaption}
        generatedAiCaption={generatedAiCaption}
        tipModalVisible={tipModalVisible}
        setTipModalVisible={setTipModalVisible}
        creatorWalletBalance={creatorWalletBalance}
        selectedTipAmount={selectedTipAmount}
        setSelectedTipAmount={setSelectedTipAmount}
        handleExecuteTip={handleExecuteTip}
        longPressModalVisible={longPressModalVisible}
        setLongPressModalVisible={setLongPressModalVisible}
        handleDownloadMedia={handleDownloadMedia}
        handleWindVideo={handleWindVideo}
        handleCopyLink={handleCopyLink}
        forwardModalVisible={forwardModalVisible}
        setForwardModalVisible={setForwardModalVisible}
        handleExecuteForward={handleExecuteForward}
      />

      {/* ================= MODAL: COMMENTS ================= */}
      <DiscoveryCommentsModal
        visible={commentsModalVisible}
        onClose={() => setCommentsModalVisible(false)}
        isDarkMode={isDarkMode}
        currentPostComments={currentPostComments}
        newCommentText={newCommentText}
        setNewCommentText={setNewCommentText}
        handleAddComment={handleAddComment}
        handleLikeComment={handleLikeComment}
        handleLikeReply={handleLikeReply}
        replyingToCommentId={replyingToCommentId}
        setReplyingToCommentId={setReplyingToCommentId}
        handleInsertFormatting={handleInsertFormatting}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  darkContainer: { backgroundColor: '#1a202c' },
  header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingTop: 8 },
  darkHeader: { backgroundColor: '#2d3748', borderBottomColor: '#4a5568' },
  headerInner: { maxWidth: 800, width: '100%', alignSelf: 'center', paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerAccountShortcut: { position: 'relative', marginRight: 8 },
  headerAvatarImg: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: '#3182ce' },
  onlineStatusDot: { position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#38a169', borderWidth: 1.5, borderColor: '#fff' },
  headerTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  darkText: { color: '#fff' },
  goLiveHeaderBtn: { backgroundColor: '#e53e3e', paddingHorizontal: 10, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  postVideoHeaderBtn: { backgroundColor: '#3182ce', paddingHorizontal: 8, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, paddingHorizontal: 6, height: 32, width: 130 },
  darkSearchBox: { backgroundColor: '#1a202c', borderColor: '#4a5568' },
  searchInput: { flex: 1, fontSize: 10 },
  matrixMenuBtn: { paddingHorizontal: 8, height: 32, justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  subTabsRow: { maxWidth: 800, width: '100%', alignSelf: 'center', paddingHorizontal: 12, maxHeight: 36, marginTop: 6, marginBottom: 6 },
  subTabBtn: { backgroundColor: '#edf2f7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 6, height: 30, justifyContent: 'center' },
  activeSubTabBtn: { backgroundColor: '#3182ce' },
  subTabBtnText: { fontSize: 11, fontWeight: 'bold', color: '#4a5568' },
  activeSubTabBtnText: { color: '#fff' },
  mainLayout: { padding: 12, maxWidth: 650, width: '100%', alignSelf: 'center' },
  cameraOverlayControls: { flex: 1, justifyContent: 'space-between', padding: 20 },
  cameraTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  closeCameraBtn: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  camIconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  recordingTimerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(229, 62, 62, 0.8)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  recordingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff', marginRight: 6 },
  cameraBottomRow: { alignItems: 'center', marginBottom: 20 },
  startRecordBtn: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  innerRecordDot: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e53e3e' },
  stopRecordBtn: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  innerStopSquare: { width: 36, height: 36, borderRadius: 6, backgroundColor: '#e53e3e' },
});