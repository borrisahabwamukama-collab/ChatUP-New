import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
  Modal,
  Pressable,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BannerAd, BannerAdSize, TestIds, RewardedAd, RewardedAdEventType, AdEventType } from 'react-native-google-mobile-ads';

// Dynamic ad unit IDs (automatically uses Google Test IDs during development)
const bannerAdUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxxoxxxxxxx/xxxxxxxxxx';
const rewardedAdUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-xxxxxxxxoxxxxxxx/xxxxxxxxxx';

export default function DiscoveryWalletScreen({ isDarkMode }) {
  // Navigation & Sub-Tabs State
  const [discoveryTab, setDiscoveryTab] = useState('Feed'); // 'Feed', 'Tours', 'Vault', 'WatchParty', 'Radar', 'Channels', 'LiveMap'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // AI Smart Interest Learning State
  const [userInterests, setUserInterests] = useState({ Tours: 5, Wildlife: 4, Music: 2, Football: 1, Tech: 1 });
  const [aiRecommendedBanner, setAiRecommendedBanner] = useState('Personalized AI Feed Active ✨');

  // Geofenced Radius State (e.g., 3km, 10km, 50km, Global)
  const [geofenceRadius, setGeofenceRadius] = useState(10); // in km

  // Monetization & Rewarded Ad States
  const [rewardedAdLoaded, setRewardedAdLoaded] = useState(false);
  const [rewardedAdInstance, setRewardedAdInstance] = useState(null);
  const [userAdEarningsBalance, setUserAdEarningsBalance] = useState(12500); // UGX Creator Ad Earnings

  // Overlays & Modal Controls
  const [matrixMenuVisible, setMatrixMenuVisible] = useState(false);
  const [forwardModalVisible, setForwardModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [fullScreenModalVisible, setFullScreenModalVisible] = useState(false);
  const [activeMediaItem, setActiveMediaItem] = useState(null);
  const [longPressModalVisible, setLongPressModalVisible] = useState(false);
  const [postSettingsModalVisible, setPostSettingsModalVisible] = useState(false);
  const [boostModalVisible, setBoostModalVisible] = useState(false);

  // Creator Upload & Studio Modal State
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [creatorStudioModalVisible, setCreatorStudioModalVisible] = useState(false);
  const [mediaSourceType, setMediaSourceType] = useState('camera'); // 'camera' or 'upload'
  const [facing, setFacing] = useState('back');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [capturedMediaUri, setCapturedMediaUri] = useState(null);

  // Studio Editing Settings
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Tours');
  const [selectedFilter, setSelectedFilter] = useState('Cinematic 🎬');
  const [trimDuration, setTrimDuration] = useState('0:00 - 0:30 (Max 3m)');
  const [audioTrack, setAudioTrack] = useState('Original Field Audio 🎵');

  // Camera permissions and ref
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  // Comment Modal States & Threaded Replies
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [currentPostComments, setCurrentPostComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);

  // AI Caption Generator Modal State
  const [aiCaptionModalVisible, setAiCaptionModalVisible] = useState(false);
  const [rawCreatorInput, setRawCreatorInput] = useState('');
  const [generatedAiCaption, setGeneratedAiCaption] = useState('');

  // Watch Party Sync & Live Chat State
  const [watchPartyActive, setWatchPartyActive] = useState(true);
  const [watchPartyPeers, setWatchPartyPeers] = useState(6);
  const [watchPartyChat, setWatchPartyChat] = useState([
    { id: '1', user: 'Stella', text: 'This Jinja boat cruise look so peaceful! 🔥' },
    { id: '2', user: 'Borris', text: 'Yeah! We are visiting again next month.' }
  ]);
  const [newWatchChatText, setNewWatchChatText] = useState('');

  // Saved Collections / Bookmarks Vault State
  const [savedVaultItems, setSavedVaultItems] = useState([]);

  // ================= 10 SUPER-LAYERS ARCHITECTURE (DISCOVERY & WALLET) =================
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

  // Double-tap animation scale ref
  const heartScale = useRef(new Animated.Value(0)).current;

  // Initialize Dynamic Rewarded Ad Loader
  useEffect(() => {
    try {
      const rewardedAd = RewardedAd.createForAdRequest(rewardedAdUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        setRewardedAdLoaded(true);
      });

      const unsubscribeEarned = rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
        setUserAdEarningsBalance(prev => prev + 2500);
        Alert.alert('💰 Ad Reward Credited!', `Successfully earned +2500 UGX creator ad bounty! Total balance: ${userAdEarningsBalance + 2500} UGX`);
      });

      rewardedAd.load();
      setRewardedAdInstance(rewardedAd);

      return () => {
        unsubscribeLoaded();
        unsubscribeEarned();
      };
    } catch (e) {
      console.log('Rewarded Ad initialization notice:', e);
    }
  }, []);

  const handleShowRewardedAd = () => {
    if (rewardedAdLoaded && rewardedAdInstance) {
      rewardedAdInstance.show();
      setRewardedAdLoaded(false);
      // Reload next ad
      rewardedAdInstance.load();
    } else {
      // Fallback simulation if native ad network is loading or running in web preview
      setUserAdEarningsBalance(prev => prev + 2500);
      Alert.alert('💰 Ad Reward Credited (Simulated)', 'Watch ad completed! +2500 UGX added to your creator earnings balance.');
    }
  };

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

  // Ephemeral Stories
  const [stories] = useState([
    { id: '1', name: 'Nimusiima', location: 'Queen Elizabeth Park', distanceKm: 1.5, mediaType: 'Elephant Herd Clip' },
    { id: '2', name: 'Stella', location: 'Kampala Central', distanceKm: 4.2, mediaType: 'Acoustic Studio Jam' },
    { id: '3', name: 'Borris', location: 'Bwindi Impenetrable', distanceKm: 2.1, mediaType: 'Gorilla Trekking Tour' },
  ]);

  // Feed Items Database
  const [feedItems, setFeedItems] = useState([
    {
      id: '1',
      author: 'Borris (Talk With Nature)',
      caption: '🐘 #BwindiGorillas Mountain Gorilla Expedition & Guided Forest Walk. Experience the raw beauty of #Uganda conservation zones!',
      timestamp: '2 hours ago',
      likes: 840,
      distanceKm: 2.1,
      allowDownloads: true,
      isPinned: true,
      isBoosted: false,
      comments: [
        {
          id: 'c1',
          user: 'Stella',
          text: 'Can we book a guided tour for this weekend?',
          time: '1:00 PM',
          likes: 14,
          replies: [
            { id: 'r1', user: 'Borris', text: 'Yes Stella! Slots are open.', time: '1:15 PM', likes: 5 }
          ]
        }
      ],
      shares: 31,
      vibe: 'Wildlife Tour 🌿',
      category: 'Wildlife',
      videoUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=1000&auto=format&fit=crop',
      location: 'Bwindi Impenetrable National Park, Uganda',
      duration: '4:20 Min Tour'
    },
    {
      id: '2',
      author: 'Kampala Sports TV',
      caption: '⚽ #Arsenal vs #ManCity Premier League tactical breakdown & local fan watch party highlights in Kampala!',
      timestamp: '3 hours ago',
      likes: 1250,
      distanceKm: 0.8,
      allowDownloads: true,
      isPinned: false,
      isBoosted: true,
      comments: [],
      shares: 89,
      vibe: 'Football Match 🔥',
      category: 'Football',
      videoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000&auto=format&fit=crop',
      location: 'Kampala, Uganda',
      duration: '3:10 Min Highlights'
    },
    {
      id: '3',
      author: 'Pearl Safaris UG',
      caption: '🌅 #SourceOfTheNile Sunset Boat Cruise in Jinja. Audio tour guide active on mesh network.',
      timestamp: '5 hours ago',
      likes: 610,
      distanceKm: 14.5,
      allowDownloads: false,
      isPinned: false,
      isBoosted: false,
      comments: [],
      shares: 18,
      vibe: 'Water Expedition 🌊',
      category: 'Tours',
      videoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
      location: 'Jinja, Uganda',
      duration: '2:45 Min Tour'
    },
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

  const handleLikePost = (item) => {
    trackUserInterest(item.category);
    setFeedItems(prev => prev.map(p => p.id === item.id ? { ...p, likes: p.likes + 1 } : p));
  };

  let lastTap = null;
  const handleDoubleTapLike = (item) => {
    const now = Date.now();
    if (lastTap && (now - lastTap) < 300) {
      handleLikePost(item);
      heartScale.setValue(0);
      Animated.sequence([
        Animated.spring(heartScale, { toValue: 1, friction: 3, useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 0, duration: 200, delay: 300, useNativeDriver: true })
      ]).start();
    } else {
      lastTap = now;
    }
  };

  const handleDeletePost = (postId) => {
    Alert.alert(
      'Delete Post 🗑️',
      'Are you sure you want to permanently remove this post from your feed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setFeedItems(prev => prev.filter(p => p.id !== postId));
            setPostSettingsModalVisible(false);
            Alert.alert('Deleted', 'Post removed successfully.');
          }
        }
      ]
    );
  };

  const handleRepostVideo = (item) => {
    setPostSettingsModalVisible(false);
    const repostItem = {
      ...item,
      id: 'repost_' + Date.now(),
      author: `You (Reposted from ${item.author})`,
      timestamp: 'Just now',
      shares: item.shares + 1
    };
    setFeedItems(prev => [repostItem, ...prev]);
    Alert.alert('Repost Successful 🔄', 'Video has been published to your timeline feed.');
  };

  const handleExecuteBoostPost = () => {
    setBoostModalVisible(false);
    setPostSettingsModalVisible(false);
    if (!selectedPost) return;
    setFeedItems(prev => prev.map(p => p.id === selectedPost.id ? { ...p, isBoosted: true } : p));
    Alert.alert('Boost Active 🚀', 'Payment verified! Your video is now promoted across regional mesh nodes for 24 hours.');
  };

  // Fully dynamic camera & video recording handlers using Expo Camera
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleStartRecording = async () => {
    if (!cameraRef.current) return;
    try {
      setIsRecording(true);
      const videoRecordPromise = cameraRef.current.recordAsync({ maxDuration: 180 });
      const data = await videoRecordPromise;
      if (data && data.uri) {
        setCapturedMediaUri(data.uri);
        setCreatorStudioModalVisible(true);
      }
    } catch (error) {
      console.log('Recording error:', error);
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
        { 
          text: 'Record with Camera 🔴', 
          onPress: () => {
            setMediaSourceType('camera');
            handleOpenRecorder();
          } 
        },
        { 
          text: 'Upload from Files 📁', 
          onPress: () => {
            setMediaSourceType('upload');
            handlePickFileFromDevice();
          } 
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handlePublishCreatorVideo = () => {
    if (!newPostCaption.trim()) {
      Alert.alert('Caption Required', 'Please add a brief caption or title for your video.');
      return;
    }
    const newVideoItem = {
      id: 'creator_' + Date.now(),
      author: 'You (Creator Studio)',
      caption: newPostCaption.trim(),
      timestamp: 'Just now',
      likes: 1,
      distanceKm: 0.1,
      allowDownloads: true,
      isPinned: false,
      isBoosted: false,
      comments: [],
      shares: 0,
      vibe: `${selectedFilter.split(' ')[0]} Vibe ✨`,
      category: newPostCategory,
      videoUrl: capturedMediaUri || 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1000&auto=format&fit=crop',
      location: 'Kampala, Uganda',
      duration: '2:30 Min Tour'
    };

    setFeedItems(prev => [newVideoItem, ...prev]);
    setCreatorStudioModalVisible(false);
    setCapturedMediaUri(null);
    setNewPostCaption('');
    Alert.alert('Published Successfully 🚀', 'Your edited video tour with background audio & filters is now live on the feed.');
  };

  // Watch Party Chat Handler
  const handleSendWatchChat = () => {
    if (!newWatchChatText.trim()) return;
    setWatchPartyChat(prev => [...prev, { id: Date.now().toString(), user: 'You', text: newWatchChatText.trim() }]);
    setNewWatchChatText('');
  };

  // Comment Handlers
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

  const handleAddComment = (textToAdd = newCommentText) => {
    if (!textToAdd || !textToAdd.trim()) return;
    const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let updatedComments = [...currentPostComments];

    if (replyingToCommentId) {
      updatedComments = updatedComments.map(c => {
        if (c.id === replyingToCommentId) {
          const newReply = { id: 'r_' + Date.now(), user: 'You', text: textToAdd.trim(), time: currentTimeStr, likes: 0 };
          return { ...c, replies: [...(c.replies || []), newReply] };
        }
        return c;
      });
    } else {
      const newParent = { id: 'c_' + Date.now(), user: 'You', text: textToAdd.trim(), time: currentTimeStr, likes: 0, replies: [] };
      updatedComments.push(newParent);
    }

    const sorted = sortCommentsByPopularity(updatedComments);
    setCurrentPostComments(sorted);
    setFeedItems(prev => prev.map(p => p.id === activeCommentPost.id ? { ...p, comments: sorted } : p));
    setNewCommentText('');
    setReplyingToCommentId(null);
  };

  const handleLikeComment = (commentId) => {
    const updated = currentPostComments.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c);
    setCurrentPostComments(sortCommentsByPopularity(updated));
  };

  const handleLikeReply = (commentId, replyId) => {
    const updated = currentPostComments.map(c => {
      if (c.id === commentId) {
        const updatedReplies = c.replies.map(r => r.id === replyId ? { ...r, likes: r.likes + 1 } : r);
        return { ...c, replies: updatedReplies };
      }
      return c;
    });
    setCurrentPostComments(sortCommentsByPopularity(updated));
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

  const handleExecuteForward = (destination) => {
    setForwardModalVisible(false);
    if (destination === 'Virtual TV Watch Party') {
      setWatchPartyActive(true);
      Alert.alert('Watch Party Active 📺', 'Synchronized stream room online with peers.');
    } else {
      Alert.alert('International Share 🚀', `Successfully broadcasted to ${destination}.`);
    }
    setFeedItems(prev => prev.map(item => item.id === selectedPost.id ? { ...item, shares: item.shares + 1 } : item));
  };

  const handleLongPressMedia = (item) => {
    setSelectedPost(item);
    setLongPressModalVisible(true);
  };

  const handleDownloadMedia = () => {
    setLongPressModalVisible(false);
    if (selectedPost && selectedPost.allowDownloads === false) {
      Alert.alert('Download Restricted 🛡️', 'Creator disabled downloads for this video.');
      return;
    }
    Alert.alert('Download Started 📥', `Downloading "${selectedPost?.author}'s media".`);
  };

  const handleSaveToVault = (item) => {
    setLongPressModalVisible(false);
    if (!savedVaultItems.some(i => i.id === item.id)) {
      setSavedVaultItems(prev => [...prev, item]);
      Alert.alert('Saved to Vault ⭐', 'Post added to offline collections vault.');
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
    Alert.alert('Link Copied 📋', 'Secure media link copied to clipboard.');
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

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      
      {/* Top Header & Search Navigation */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <View style={styles.headerInner}>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>🌍 Discovery & Feed</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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

            {/* Matrix Options Menu Button (•••) */}
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
      <ScrollView contentContainerStyle={styles.mainLayout} showsVerticalScrollIndicator={false}>
        <View style={styles.centerFeed}>

          {/* Dynamic Google AdMob Banner Integration */}
          <View style={styles.monetizationAdCard}>
            <Text style={styles.adTagLabel}>Sponsored Ad 📢 • AdMob Dynamic Banner</Text>
            <View style={{ alignItems: 'center', marginVertical: 4 }}>
              <BannerAd
                unitId={bannerAdUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{
                  requestNonPersonalizedAdsOnly: true,
                }}
                onAdLoaded={() => console.log('AdMob Banner loaded successfully')}
                onAdFailedToLoad={(error) => console.log('AdMob Banner load error: ', error)}
              />
            </View>
          </View>

          {/* Rewarded Ad Creator Earning Widget */}
          <View style={styles.creatorMonetizationCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2b6cb0' }}>🪙 Creator Ad Earnings Balance</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2d3748', marginTop: 2 }}>{userAdEarningsBalance.toLocaleString()} UGX (~${(userAdEarningsBalance / 3700).toFixed(2)})</Text>
              </View>
              <TouchableOpacity style={styles.watchRewardAdBtn} onPress={handleShowRewardedAd}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Watch Ad (+2500 UGX) 🎁</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Geofencing Radius Selector Bar */}
          <View style={styles.geofenceControlBar}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2b6cb0' }}>📍 Geofence Radius Filter: {geofenceRadius} km</Text>
            <View style={{ flexDirection: 'row', marginTop: 4 }}>
              {[3, 10, 50, 500].map(km => (
                <TouchableOpacity
                  key={km}
                  style={[styles.radiusPill, geofenceRadius === km && styles.activeRadiusPill]}
                  onPress={() => setGeofenceRadius(km)}
                >
                  <Text style={[styles.radiusPillText, geofenceRadius === km && { color: '#fff' }]}>{km === 500 ? 'Global' : `${km} km`}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* AI Interest Banner */}
          <View style={styles.aiBannerCard}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2b6cb0' }}>✨ {aiRecommendedBanner}</Text>
            <Text style={{ fontSize: 9, color: '#4a5568', marginTop: 2 }}>AI Feed tuned to your habits (Top Interest: {Object.keys(userInterests).reduce((a, b) => userInterests[a] > userInterests[b] ? a : b)})</Text>
          </View>

          {/* Quick AI Caption Assistant Trigger */}
          <TouchableOpacity style={styles.creatorStudioBtn} onPress={() => setAiCaptionModalVisible(true)}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>✨ Open AI Caption & Tag Assistant</Text>
          </TouchableOpacity>

          {/* SUB-TAB 1: SAVED OFFLINE VAULT */}
          {discoveryTab === 'Vault' ? (
            <View>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>⭐ Your Saved Offline Collections Vault</Text>
              {savedVaultItems.length > 0 ? (
                savedVaultItems.map(item => (
                  <View key={item.id} style={[styles.postCard, isDarkMode && styles.darkCard]}>
                    <Text style={[styles.postAuthor, { fontSize: 13 }]}>{item.author}</Text>
                    <Text style={[styles.postCaption, isDarkMode && styles.darkText]} numberOfLines={2}>{item.caption}</Text>
                    <Image source={{ uri: item.videoUrl }} style={{ height: 140, width: '100%', borderRadius: 6 }} />
                  </View>
                ))
              ) : (
                <Text style={{ fontSize: 12, color: '#718096', textAlign: 'center', padding: 40 }}>Your vault is empty. Long-press any video and select "Save to Offline Vault".</Text>
              )}
            </View>
          ) : discoveryTab === 'WatchParty' ? (
            /* SUB-TAB 2: INTERACTIVE WATCH PARTY ROOM */
            <View style={[styles.postCard, isDarkMode && styles.darkCard, { padding: 0, overflow: 'hidden' }]}>
              <View style={styles.watchPartyVideoFrame}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop' }} style={styles.watchVideoImage} />
                <View style={styles.liveBadgeOverlay}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🔴 LIVE WATCH PARTY</Text>
                  <Text style={{ color: '#fff', fontSize: 10, marginLeft: 8 }}>👥 {watchPartyPeers} Viewers</Text>
                </View>
              </View>

              <View style={{ padding: 12 }}>
                <Text style={[styles.postAuthor, { fontSize: 14, marginBottom: 8 }]}>Source of the Nile - Sunset Live Stream</Text>
                
                <View style={styles.watchChatBox}>
                  <ScrollView style={{ height: 120 }}>
                    {watchPartyChat.map(msg => (
                      <Text key={msg.id} style={{ fontSize: 11, marginBottom: 4 }}>
                        <Text style={{ fontWeight: 'bold', color: '#3182ce' }}>{msg.user}: </Text>
                        <Text style={{ color: isDarkMode ? '#e2e8f0' : '#2d3748' }}>{msg.text}</Text>
                      </Text>
                    ))}
                  </ScrollView>

                  <View style={{ flexDirection: 'row', marginTop: 8 }}>
                    <TextInput
                      style={[styles.chatInput, isDarkMode && styles.darkInput]}
                      placeholder="Type in Watch Party chat..."
                      placeholderTextColor="#a0aec0"
                      value={newWatchChatText}
                      onChangeText={setNewWatchChatText}
                    />
                    <TouchableOpacity style={styles.sendChatBtn} onPress={handleSendWatchChat}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Send</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ) : discoveryTab === 'Radar' ? (
            /* SUB-TAB 3: VIBE RADAR */
            <View>
              <TouchableOpacity style={styles.radarCardActive} onPress={() => Alert.alert('Vibe Radar', 'Scanning 3km radius...')}>
                <Text style={styles.radarTitle}>📡 Discovery Vibe Radar Active (3km Radius)</Text>
                <Text style={styles.radarDesc}>Detecting nearby tour guides and peer mesh nodes.</Text>
              </TouchableOpacity>
              {radarNodes.map(node => (
                <View key={node.id} style={[styles.postCard, isDarkMode && styles.darkCard]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={[styles.postAuthor, { fontSize: 13 }]}>{node.name}</Text>
                      <Text style={{ fontSize: 11, color: '#38a169', fontWeight: 'bold' }}>{node.status}</Text>
                      <Text style={{ fontSize: 10, color: '#718096' }}>{node.distance} • {node.signal}</Text>
                    </View>
                    <TouchableOpacity style={styles.connectRadarBtn} onPress={() => Alert.alert('Radar', `Connected with ${node.name}`)}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Connect 🤝</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : discoveryTab === 'Channels' ? (
            /* SUB-TAB 4: CERTIFIED CHANNELS */
            <View>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🛡️ Certified Broadcasters & Tour Partners</Text>
              {officialChannels.map(ch => (
                <View key={ch.id} style={[styles.postCard, isDarkMode && styles.darkCard]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.postAuthor, { fontSize: 13 }]}>{ch.name}</Text>
                      <Text style={{ fontSize: 11, color: '#3182ce' }}>{ch.owner} • {ch.category}</Text>
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#d69e2e', marginTop: 2 }}>{ch.badge} • {ch.followers} Followers</Text>
                    </View>
                    <TouchableOpacity style={styles.connectRadarBtn} onPress={() => Alert.alert('Channel', `Opening stream for ${ch.name}`)}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Tune In 📺</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : discoveryTab === 'LiveMap' ? (
            /* SUB-TAB 5: LIVE GEOFENCED MAP */
            <View style={[styles.postCard, isDarkMode && styles.darkCard, { alignItems: 'center', padding: 30 }]}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>🗺️🛰️</Text>
              <Text style={[styles.postAuthor, { fontSize: 16, marginBottom: 6 }]}>Uganda National Tour & Geofenced Map</Text>
              <Text style={{ fontSize: 12, color: '#718096', textAlign: 'center', marginBottom: 14 }}>
                Active conservation and tour tracking across Bwindi, Queen Elizabeth, and Kampala city nodes.
              </Text>
              <TouchableOpacity style={styles.connectRadarBtn} onPress={() => Alert.alert('Map', 'Refreshed node coordinates.')}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Refresh GPS Clusters 🔄</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* SUB-TAB 6: MAIN SMART FEED & TOURS */
            <View>
              {/* Ephemeral Stories */}
              <View style={[styles.storyCard, isDarkMode && styles.darkCard]}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>⚡ Geofenced Story Rings & Expeditions</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storyScroll}>
                  {stories.map(story => (
                    <TouchableOpacity 
                      key={story.id} 
                      style={styles.storyRingContainer}
                      onPress={() => Alert.alert('Story Ring', `Viewing live tour clip: ${story.mediaType}`)}
                    >
                      <View style={styles.storyRing}>
                        <View style={styles.storyAvatar}>
                          <Text style={styles.storyAvatarText}>{story.name[0]}</Text>
                        </View>
                      </View>
                      <Text style={[styles.storyName, isDarkMode && styles.darkText]} numberOfLines={1}>{story.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Category Pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.filterPill, selectedCategory === cat && styles.activeFilterPill]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text style={[styles.filterPillText, selectedCategory === cat && { color: '#fff' }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
                {discoveryTab === 'Tours' ? '🦁 Featured African Wildlife & Cultural Tours' : '🔥 Smart AI Feed (Within Radius)'}
              </Text>

              {filteredFeed.length > 0 ? (
                filteredFeed.map(item => (
                  <View key={item.id} style={[styles.postCard, isDarkMode && styles.darkCard]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      {item.isPinned && (
                        <View style={styles.pinnedBanner}>
                          <Text style={{ fontSize: 9, color: '#d69e2e', fontWeight: 'bold' }}>📌 Pinned Creator Announcement</Text>
                        </View>
                      )}
                      {item.isBoosted && (
                        <View style={styles.boostedBanner}>
                          <Text style={{ fontSize: 9, color: '#3182ce', fontWeight: 'bold' }}>🚀 Promoted / Boosted</Text>
                        </View>
                      )}
                      <TouchableOpacity 
                        style={{ marginLeft: 'auto', padding: 4 }} 
                        onPress={() => { setSelectedPost(item); setPostSettingsModalVisible(true); }}
                      >
                        <Text style={{ fontSize: 16 }}>⚙️</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.postHeaderRow}>
                      <View>
                        <Text style={styles.postAuthor}>{item.author}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                          <Text style={{ fontSize: 9, color: '#a0aec0', marginRight: 6 }}>📍 {item.location} ({item.distanceKm} km away)</Text>
                          <Text style={{ fontSize: 9, color: '#d69e2e', fontWeight: 'bold' }}>• ⏱️ {item.timestamp}</Text>
                          {!item.allowDownloads && <Text style={{ fontSize: 9, color: '#e53e3e', fontWeight: 'bold', marginLeft: 6 }}>• 🔒 No-Download</Text>}
                        </View>
                      </View>
                      <Text style={styles.vibeBadge}>[{item.vibe}]</Text>
                    </View>

                    <Pressable 
                      style={styles.mediaContainerCenter}
                      onPress={() => handleDoubleTapLike(item)}
                      onLongPress={() => handleLongPressMedia(item)}
                    >
                      <Image source={{ uri: item.videoUrl }} style={styles.postImageMedia} resizeMode="cover" />
                      
                      <Animated.View style={[styles.heartPopContainer, { transform: [{ scale: heartScale }] }]}>
                        <Text style={{ fontSize: 50 }}>❤️</Text>
                      </Animated.View>

                      <View style={styles.mediaOverlayTop}>
                        <View style={styles.badgePill}>
                          <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>▶ {item.duration}</Text>
                        </View>
                      </View>

                      <TouchableOpacity style={styles.expandButton} onPress={() => handleOpenFullScreen(item)}>
                        <Text style={{ fontSize: 11, color: '#fff' }}>🔍 Full Screen</Text>
                      </TouchableOpacity>
                    </Pressable>

                    <Text style={[styles.postCaption, isDarkMode && styles.darkText]}>
                      {item.caption.split(' ').map((word, idx) => 
                        word.startsWith('#') ? (
                          <Text key={idx} style={{ color: '#3182ce', fontWeight: 'bold' }} onPress={() => setSearchQuery(word)}>
                            {word}{' '}
                          </Text>
                        ) : (
                          <Text key={idx}>{word} </Text>
                        )
                      )}
                    </Text>

                    <View style={styles.postFooter}>
                      <TouchableOpacity style={styles.footerAction} onPress={() => handleLikePost(item)}>
                        <Text style={{ fontSize: 12 }}>❤️ {item.likes}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.footerAction} onPress={() => handleOpenComments(item)}>
                        <Text style={{ fontSize: 12 }}>💬 {item.comments?.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0) || 0}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.footerAction} onPress={() => handleOpenForwardModal(item)}>
                        <Text style={{ fontSize: 12 }}>🔄 {item.shares}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.footerAction} onPress={() => Alert.alert('Tip Creator ☕', `Send support tip to ${item.author}?`)}>
                        <Text style={{ fontSize: 12 }}>🎁 Tip</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ fontSize: 12, color: '#718096', textAlign: 'center', padding: 30 }}>No tours or posts found within this {geofenceRadius}km radius.</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ================= MODAL 1: FULLY FUNCTIONAL CAMERA RECORDING SCREEN ================= */}
      <Modal visible={cameraModalVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          {cameraPermission?.granted ? (
            <CameraView style={{ flex: 1 }} facing={facing} ref={cameraRef} mode="video">
              <View style={styles.cameraOverlayControls}>
                <View style={styles.cameraTopRow}>
                  <TouchableOpacity style={styles.camIconBtn} onPress={() => setCameraModalVisible(false)}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>✕</Text>
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

      {/* ================= MODAL 2: SCROLLABLE CREATOR STUDIO ================= */}
      <Modal visible={creatorStudioModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingContainer}>
          <Pressable style={styles.modalOverlay} onPress={() => setCreatorStudioModalVisible(false)}>
            <Pressable style={[styles.modalContent, isDarkMode && styles.darkCard, { height: '85%' }]} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeaderRow}>
                <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>🎬 Creator Studio & Editing Suite</Text>
                <TouchableOpacity onPress={() => setCreatorStudioModalVisible(false)}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={true} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 30 }}>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <TouchableOpacity 
                    style={[styles.sourceTabBtn, mediaSourceType === 'camera' && styles.activeSourceTab]}
                    onPress={() => {
                      setMediaSourceType('camera');
                      handleOpenRecorder();
                    }}
                  >
                    <Text style={[styles.sourceTabText, mediaSourceType === 'camera' && { color: '#fff' }]}>🔴 Record Video</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.sourceTabBtn, mediaSourceType === 'upload' && styles.activeSourceTab]}
                    onPress={() => {
                      setMediaSourceType('upload');
                      handlePickFileFromDevice();
                    }}
                  >
                    <Text style={[styles.sourceTabText, mediaSourceType === 'upload' && { color: '#fff' }]}>📁 Upload File</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.studioViewfinder}>
                  <Image source={{ uri: capturedMediaUri || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23' }} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
                </View>

                <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginTop: 10 }]}>🎨 Filters & Color Grading</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                  {['Cinematic 🎬', 'Wildlife Nature 🌿', 'Vibrant Sunset 🌅', 'High Contrast 🔥', 'B&W Vintage 🎞️'].map(filter => (
                    <TouchableOpacity 
                      key={filter}
                      style={[styles.editPill, selectedFilter === filter && styles.activeEditPill]}
                      onPress={() => setSelectedFilter(filter)}
                    >
                      <Text style={[styles.editPillText, selectedFilter === filter && { color: '#fff' }]}>{filter}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginTop: 10 }]}>🎵 Sound FX & Audio Tracks</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  {['Original Field Audio 🎵', 'Ambient Forest Sound 🌳', 'Acoustic Guitar Jam 🎸', 'Kampala Beats 🥁'].map(audio => (
                    <TouchableOpacity 
                      key={audio}
                      style={[styles.editPill, audioTrack === audio && styles.activeEditPill]}
                      onPress={() => setAudioTrack(audio)}
                    >
                      <Text style={[styles.editPillText, audioTrack === audio && { color: '#fff' }]}>{audio}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#4a5568', marginBottom: 4 }}>Select Feed Category:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  {['Tours', 'Wildlife', 'Football', 'Music', 'Tech'].map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.filterPill, newPostCategory === cat && styles.activeFilterPill]}
                      onPress={() => setNewPostCategory(cat)}
                    >
                      <Text style={[styles.filterPillText, newPostCategory === cat && { color: '#fff' }]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TextInput
                  style={[styles.commentInputBox, isDarkMode && styles.darkText, { height: 65, marginBottom: 14, width: '100%', paddingTop: 8 }]}
                  placeholder="Add caption & hashtags (e.g., #BwindiGorillas #Uganda)..."
                  placeholderTextColor="#a0aec0"
                  value={newPostCaption}
                  onChangeText={setNewPostCaption}
                  multiline={true}
                />

                <TouchableOpacity style={[styles.connectRadarBtn, { padding: 12, marginBottom: 20 }]} onPress={handlePublishCreatorVideo}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>🚀 Publish Video Tour to Feed</Text>
                </TouchableOpacity>

              </ScrollView>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================= MODAL 3: SECURITY MATRIX MENU (•••) ================= */}
      <Modal visible={matrixMenuVisible} animationType="slide" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setMatrixMenuVisible(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard, { maxHeight: '80%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>🛡️ Security & Architecture Matrix</Text>
              <TouchableOpacity onPress={() => setMatrixMenuVisible(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={true}>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🔒 Quantum Lattice Encryption</Text>
                <Switch value={quantumLatticeSecurity} onValueChange={setQuantumLatticeSecurity} trackColor={{ false: '#cbd5e0', true: '#9333ea' }} />
              </View>

              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🇺🇬 Kampala Telecom Edge Relay</Text>
                <Switch value={kampalaEdgeRelaySync} onValueChange={setKampalaEdgeRelaySync} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
              </View>

              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🛡️ Autonomous Toxicity Guard</Text>
                <Switch value={aiAutonomousToxicityGuard} onValueChange={setAiAutonomousToxicityGuard} trackColor={{ false: '#cbd5e0', true: '#e53e3e' }} />
              </View>

              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>✍️ Creator Biometric Watermark</Text>
                <Switch value={biometricCreatorWatermark} onValueChange={setBiometricCreatorWatermark} trackColor={{ false: '#cbd5e0', true: '#38a169' }} />
              </View>

              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🌿 Real-Time Sentiment Mesh Index</Text>
                <Switch value={realtimeSentimentMesh} onValueChange={setRealtimeSentimentMesh} trackColor={{ false: '#cbd5e0', true: '#d69e2e' }} />
              </View>

              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🪙 Zero-Fee Creator Gas Subsidizer</Text>
                <Switch value={zeroFeeGasSubsidizer} onValueChange={setZeroFeeGasSubsidizer} trackColor={{ false: '#cbd5e0', true: '#319795' }} />
              </View>

              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🎥 Adaptive Multimodal HLS Streaming</Text>
                <Switch value={multimodalHlsAdaptive} onValueChange={setMultimodalHlsAdaptive} trackColor={{ false: '#cbd5e0', true: '#2563eb' }} />
              </View>

              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🧠 Federated On-Device AI Personalizer</Text>
                <Switch value={federatedOnDeviceAi} onValueChange={setFederatedOnDeviceAi} trackColor={{ false: '#cbd5e0', true: '#805ad5' }} />
              </View>

              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🛰️ Bluetooth P2P Offline Mesh Sync</Text>
                <Switch value={bluetoothP2pMeshRelay} onValueChange={setBluetoothP2pMeshRelay} trackColor={{ false: '#cbd5e0', true: '#48bb78' }} />
              </View>

              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🪙 Autonomous Creator Tip Escrow</Text>
                <Switch value={autonomousCreatorEscrow} onValueChange={setAutonomousCreatorEscrow} trackColor={{ false: '#cbd5e0', true: '#b7791f' }} />
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* ================= MODAL 4: POST SETTINGS ================= */}
      <Modal visible={postSettingsModalVisible} animationType="slide" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setPostSettingsModalVisible(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>⚙️ Post Settings & Creator Actions</Text>
              <TouchableOpacity onPress={() => setPostSettingsModalVisible(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forwardOptionRow} onPress={() => handleRepostVideo(selectedPost)}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>🔄 Repost Video to Timeline</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forwardOptionRow} onPress={() => { setPostSettingsModalVisible(false); setBoostModalVisible(true); }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3182ce' }}>🚀 Boost / Promote Post</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forwardOptionRow} onPress={() => { setPostSettingsModalVisible(false); handleSaveToVault(selectedPost); }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>⭐ Save to Offline Vault</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.forwardOptionRow, { borderBottomWidth: 0 }]} onPress={() => handleDeletePost(selectedPost?.id)}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#e53e3e' }}>🗑️ Delete Post Permanently</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ================= MODAL 5: BOOST PAYMENT SIMULATION ================= */}
      <Modal visible={boostModalVisible} animationType="fade" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setBoostModalVisible(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard, { maxWidth: 360, alignSelf: 'center' }]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText, { marginBottom: 8 }]}>🚀 Boost Post Promotion</Text>
            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 14 }}>
              Promote "{selectedPost?.author}'s video" across local Kampala mesh relay stations and global feeds.
            </Text>
            <View style={{ backgroundColor: '#f7fafc', padding: 10, borderRadius: 8, marginBottom: 14 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2d3748' }}>📦 Boost Tier: Regional Mesh (24 Hours)</Text>
              <Text style={{ fontSize: 11, color: '#3182ce', fontWeight: 'bold', marginTop: 4 }}>Price: UGX 10,000 (~$2.70)</Text>
            </View>
            <TouchableOpacity style={styles.connectRadarBtn} onPress={handleExecuteBoostPost}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>Confirm & Pay Boost Fee 💳</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ================= MODAL 6: AI CAPTION ASSISTANT ================= */}
      <Modal visible={aiCaptionModalVisible} animationType="slide" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setAiCaptionModalVisible(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>✨ AI Caption & Smart Hashtag Generator</Text>
            <TextInput
              style={[styles.commentInputBox, isDarkMode && styles.darkText, { height: 60, marginBottom: 10, width: '100%' }]}
              placeholder="What is your video about? (e.g. Arsenal game highlight or Bwindi gorillas)"
              placeholderTextColor="#a0aec0"
              value={rawCreatorInput}
              onChangeText={setRawCreatorInput}
              multiline={true}
            />
            <TouchableOpacity style={styles.connectRadarBtn} onPress={handleGenerateAiCaption}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', textAlign: 'center' }}>Generate AI Caption 🚀</Text>
            </TouchableOpacity>
            {generatedAiCaption ? (
              <View style={{ marginTop: 12, backgroundColor: '#ebf8ff', padding: 8, borderRadius: 6 }}>
                <Text style={{ fontSize: 11, color: '#2b6cb0', fontWeight: 'bold' }}>Result:</Text>
                <Text style={{ fontSize: 11, color: '#2d3748', marginTop: 2 }}>{generatedAiCaption}</Text>
              </View>
            ) : null}
          </View>
        </Pressable>
      </Modal>

      {/* ================= MODAL 7: THREADED COMMENTS ================= */}
      <Modal visible={commentsModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingContainer}>
          <Pressable style={styles.modalOverlay} onPress={() => setCommentsModalVisible(false)}>
            <Pressable style={[styles.modalContent, isDarkMode && styles.darkCard, { height: '75%' }]} onPress={(e) => e.stopPropagation()}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7', paddingBottom: 8 }}>
                <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>💬 Comments (Most Popular First)</Text>
                <TouchableOpacity onPress={() => setCommentsModalVisible(false)}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1, marginBottom: 8 }} showsVerticalScrollIndicator={true}>
                {currentPostComments.length > 0 ? (
                  currentPostComments.map(comment => (
                    <View key={comment.id} style={styles.commentThreadBlock}>
                      <View style={[styles.parentCommentCard, isDarkMode && { backgroundColor: '#1a202c', borderColor: '#4a5568' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>{comment.user}</Text>
                          <Text style={{ fontSize: 9, color: '#a0aec0' }}>{comment.time}</Text>
                        </View>
                        <Text style={{ fontSize: 11, color: isDarkMode ? '#fff' : '#2d3748', marginTop: 3 }}>{comment.text}</Text>
                        
                        <View style={styles.commentActionFooter}>
                          <TouchableOpacity onPress={() => handleLikeComment(comment.id)} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
                            <Text style={{ fontSize: 11, marginRight: 3 }}>❤️</Text>
                            <Text style={{ fontSize: 10, color: '#718096', fontWeight: 'bold' }}>{comment.likes}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setReplyingToCommentId(comment.id)}>
                            <Text style={{ fontSize: 10, color: '#3182ce', fontWeight: 'bold' }}>Reply ({comment.replies?.length || 0})</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {comment.replies && comment.replies.length > 0 && (
                        <View style={styles.nestedRepliesContainer}>
                          {comment.replies.map(reply => (
                            <View key={reply.id} style={[styles.replyCard, isDarkMode && { backgroundColor: '#2d3748', borderColor: '#4a5568' }]}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#3182ce' }}>↳ {reply.user}</Text>
                                <Text style={{ fontSize: 8, color: '#a0aec0' }}>{reply.time}</Text>
                              </View>
                              <Text style={{ fontSize: 10, color: isDarkMode ? '#fff' : '#2d3748', marginTop: 2 }}>{reply.text}</Text>
                              <TouchableOpacity onPress={() => handleLikeReply(comment.id, reply.id)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <Text style={{ fontSize: 10, marginRight: 2 }}>❤️</Text>
                                <Text style={{ fontSize: 9, color: '#718096' }}>{reply.likes}</Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={{ fontSize: 11, color: '#718096', textAlign: 'center', marginTop: 20 }}>No comments yet. Start the conversation!</Text>
                )}
              </ScrollView>

              {replyingToCommentId && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ebf8ff', padding: 6, borderRadius: 6, marginBottom: 6 }}>
                  <Text style={{ fontSize: 10, color: '#2b6cb0', fontWeight: 'bold' }}>Replying inside thread...</Text>
                  <TouchableOpacity onPress={() => setReplyingToCommentId(null)}>
                    <Text style={{ fontSize: 10, color: '#e53e3e', fontWeight: 'bold' }}>Cancel Reply</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ flexDirection: 'row', backgroundColor: isDarkMode ? '#1a202c' : '#edf2f7', padding: 4, borderRadius: 6, marginBottom: 6, justifyContent: 'space-around' }}>
                <TouchableOpacity onPress={() => handleInsertFormatting('newline')} style={styles.formatBtn}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#4a5568' }}>↩️ Enter Line</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleInsertFormatting('bullet')} style={styles.formatBtn}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#4a5568' }}>• Bullet List</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleInsertFormatting('list')} style={styles.formatBtn}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#4a5568' }}>1. Number List</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 6, alignItems: 'center' }}>
                {['❤️', '🔥', '👏', '🚀', '🐘', '✨', '⚽', '💯', '🦁', '🎉'].map(emoji => (
                  <TouchableOpacity key={emoji} style={{ marginRight: 12 }} onPress={() => handleAddComment(emoji)}>
                    <Text style={{ fontSize: 22 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={{ flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#edf2f7', paddingTop: 8 }}>
                <TextInput
                  style={[styles.commentInputBox, isDarkMode && styles.darkText]}
                  placeholder={replyingToCommentId ? "Write a reply in thread..." : "Write a comment or build a list..."}
                  placeholderTextColor="#a0aec0"
                  value={newCommentText}
                  onChangeText={setNewCommentText}
                  multiline={true}
                />
                <TouchableOpacity style={styles.sendCommentBtn} onPress={() => handleAddComment(newCommentText)}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Post</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================= MODAL 8: FORWARD / SHARE ================= */}
      <Modal visible={forwardModalVisible} animationType="slide" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setForwardModalVisible(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>🌐 International Forward & Share</Text>
              <TouchableOpacity onPress={() => setForwardModalVisible(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.forwardOptionRow} onPress={() => handleExecuteForward('Global Chat Inbox')}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>💬 Forward to Active Chat Inbox</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.forwardOptionRow} onPress={() => handleExecuteForward('International Mesh Relay')}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>🛰️ Broadcast to International Mesh Network</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.forwardOptionRow} onPress={() => handleExecuteForward('Virtual TV Watch Party')}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>📺 Stream in Virtual TV Watch Party</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.forwardOptionRow, { borderBottomWidth: 0 }]} onPress={() => handleExecuteForward('Secure External Clipboard Link')}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3182ce' }}>📋 Copy International Secure Link</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ================= MODAL 9: FULL-SCREEN THEATER VIEWER ================= */}
      <Modal visible={fullScreenModalVisible} animationType="fade" transparent={true}>
        <View style={styles.fullScreenOverlay}>
          <TouchableOpacity style={styles.closeFullScreenBtn} onPress={() => setFullScreenModalVisible(false)}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>✕ Close Theater Mode</Text>
          </TouchableOpacity>
          {activeMediaItem && (
            <View style={styles.fullScreenContent}>
              <Image source={{ uri: activeMediaItem.videoUrl }} style={styles.fullScreenImage} resizeMode="contain" />
              <Text style={styles.fullScreenCaption}>{activeMediaItem.caption}</Text>
            </View>
          )}
        </View>
      </Modal>

      {/* ================= MODAL 10: LONG-PRESS QUICK ACTIONS ================= */}
      <Modal visible={longPressModalVisible} animationType="fade" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setLongPressModalVisible(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard, { maxWidth: 350, alignSelf: 'center' }]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText, { marginBottom: 12 }]}>⚙️ Media Quick Actions</Text>
            
            <TouchableOpacity style={styles.forwardOptionRow} onPress={handleDownloadMedia}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: selectedPost?.allowDownloads === false ? '#a0aec0' : '#3182ce' }}>
                {selectedPost?.allowDownloads === false ? '🛡️ Download Disabled by Creator' : '📥 Download Media to Device'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forwardOptionRow} onPress={() => handleSaveToVault(selectedPost)}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#3182ce' }}>⭐ Save to Offline Vault</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forwardOptionRow} onPress={() => handleWindVideo('forward')}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>⏩ Wind Video Forward (+10s)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forwardOptionRow} onPress={() => handleWindVideo('backward')}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>⏪ Wind Video Backward (-10s)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forwardOptionRow} onPress={handleCopyLink}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#3182ce' }}>📋 Copy Secure Media Link</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.forwardOptionRow, { borderBottomWidth: 0 }]} onPress={() => { setLongPressModalVisible(false); Alert.alert('Report', 'Content flagged.'); }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#e53e3e' }}>⚠️ Report Content</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  darkContainer: { backgroundColor: '#1a202c' },
  header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingTop: 8 },
  darkHeader: { backgroundColor: '#2d3748', borderBottomColor: '#4a5568' },
  headerInner: { maxWidth: 800, width: '100%', alignSelf: 'center', paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  darkText: { color: '#fff' },
  
  postVideoHeaderBtn: { backgroundColor: '#e53e3e', paddingHorizontal: 8, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
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
  centerFeed: { width: '100%' },

  // Monetization Ad Styles
  monetizationAdCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 8, marginBottom: 10, alignItems: 'center' },
  adTagLabel: { fontSize: 9, color: '#a0aec0', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 2 },
  creatorMonetizationCard: { backgroundColor: '#ebf8ff', borderWidth: 1, borderColor: '#bee3f8', borderRadius: 8, padding: 10, marginBottom: 10 },
  watchRewardAdBtn: { backgroundColor: '#3182ce', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },

  geofenceControlBar: { backgroundColor: '#ebf8ff', borderWidth: 1, borderColor: '#bee3f8', borderRadius: 8, padding: 8, marginBottom: 10 },
  radiusPill: { backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginRight: 6, borderWidth: 1, borderColor: '#cbd5e0' },
  activeRadiusPill: { backgroundColor: '#3182ce', borderColor: '#3182ce' },
  radiusPillText: { fontSize: 10, fontWeight: 'bold', color: '#4a5568' },

  aiBannerCard: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 8, padding: 8, marginBottom: 10 },
  creatorStudioBtn: { backgroundColor: '#805ad5', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  pinnedBanner: { backgroundColor: '#fffaf0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1, borderColor: '#feebc8', alignSelf: 'flex-start' },
  boostedBanner: { backgroundColor: '#ebf8ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1, borderColor: '#bee3f8', alignSelf: 'flex-start', marginLeft: 6 },

  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  settingLabel: { fontSize: 11, fontWeight: 'bold', color: '#2d3748' },

  storyCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#4a5568', marginBottom: 8 },
  storyScroll: { flexDirection: 'row' },
  storyRingContainer: { alignItems: 'center', marginRight: 12, width: 55 },
  storyRing: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#3182ce', justifyContent: 'center', alignItems: 'center' },
  storyAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#ebf8ff', justifyContent: 'center', alignItems: 'center' },
  storyAvatarText: { fontWeight: 'bold', color: '#2b6cb0', fontSize: 14 },
  storyName: { fontSize: 9, color: '#4a5568', marginTop: 3, textAlign: 'center' },

  filterPill: { backgroundColor: '#edf2f7', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, marginRight: 6 },
  activeFilterPill: { backgroundColor: '#3182ce' },
  filterPillText: { fontSize: 11, fontWeight: 'bold', color: '#4a5568' },

  postCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', width: '100%' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  postHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, marginTop: 4 },
  postAuthor: { fontSize: 12, fontWeight: 'bold', color: '#3182ce' },
  vibeBadge: { fontSize: 10, fontStyle: 'italic', color: '#a0aec0' },

  mediaContainerCenter: { height: 260, width: '100%', backgroundColor: '#000', borderRadius: 8, overflow: 'hidden', position: 'relative', marginBottom: 8, justifyContent: 'center', alignItems: 'center' },
  postImageMedia: { width: '100%', height: '100%' },
  heartPopContainer: { position: 'absolute', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  mediaOverlayTop: { position: 'absolute', top: 8, left: 8 },
  badgePill: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  expandButton: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },

  postCaption: { fontSize: 11, color: '#2d3748', marginBottom: 8, lineHeight: 15 },
  postFooter: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#edf2f7', paddingTop: 6 },
  footerAction: { flexDirection: 'row', alignItems: 'center' },

  radarCardActive: { backgroundColor: '#ebf8ff', borderWidth: 1, borderColor: '#bee3f8', borderRadius: 10, padding: 12, marginBottom: 12 },
  radarTitle: { fontSize: 12, fontWeight: 'bold', color: '#2b6cb0', marginBottom: 4 },
  radarDesc: { fontSize: 10, color: '#4a5568' },
  connectRadarBtn: { backgroundColor: '#3182ce', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginTop: 4 },

  // Watch Party Controls
  watchPartyVideoFrame: { height: 200, backgroundColor: '#000', position: 'relative' },
  watchVideoImage: { width: '100%', height: '100%' },
  liveBadgeOverlay: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(229, 62, 62, 0.85)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, flexDirection: 'row' },
  watchChatBox: { backgroundColor: '#f7fafc', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  chatInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 6, paddingHorizontal: 8, height: 32, fontSize: 11 },
  darkInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  sendChatBtn: { backgroundColor: '#3182ce', paddingHorizontal: 12, height: 32, borderRadius: 6, justifyContent: 'center', marginLeft: 6 },

  // Camera Overlay
  cameraOverlayControls: { flex: 1, justifyContent: 'space-between', padding: 20 },
  cameraTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  camIconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  recordingTimerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(229, 62, 62, 0.8)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  recordingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff', marginRight: 6 },
  cameraBottomRow: { alignItems: 'center', marginBottom: 20 },
  startRecordBtn: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  innerRecordDot: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#e53e3e' },
  stopRecordBtn: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  innerStopSquare: { width: 36, height: 36, borderRadius: 6, backgroundColor: '#e53e3e' },

  // Modals & Sheets
  keyboardAvoidingContainer: { flex: 1, justifyContent: 'flex-end' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 14, width: '100%' },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7', paddingBottom: 8 },
  modalTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  forwardOptionRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },

  commentThreadBlock: { marginBottom: 12 },
  parentCommentCard: { backgroundColor: '#f7fafc', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  nestedRepliesContainer: { marginLeft: 16, marginTop: 6, borderLeftWidth: 2, borderLeftColor: '#3182ce', paddingLeft: 8 },
  replyCard: { backgroundColor: '#edf2f7', padding: 8, borderRadius: 6, marginBottom: 6, borderWidth: 1, borderColor: '#cbd5e0' },
  commentActionFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },

  commentInputBox: { flex: 1, backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 10, minHeight: 34, maxHeight: 80, fontSize: 11, paddingTop: 8 },
  sendCommentBtn: { backgroundColor: '#3182ce', paddingHorizontal: 12, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  formatBtn: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 4 },

  fullScreenOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  closeFullScreenBtn: { position: 'absolute', top: 30, right: 30, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  fullScreenContent: { width: '100%', height: '80%', justifyContent: 'center', alignItems: 'center' },
  fullScreenImage: { width: '100%', height: '85%' },
  fullScreenCaption: { color: '#fff', fontSize: 14, textAlign: 'center', marginTop: 15 },

  // Scrollable Creator Studio
  sourceTabBtn: { flex: 1, paddingVertical: 8, backgroundColor: '#edf2f7', alignItems: 'center', borderRadius: 6, marginRight: 6 },
  activeSourceTab: { backgroundColor: '#3182ce' },
  sourceTabText: { fontSize: 11, fontWeight: 'bold', color: '#4a5568' },
  studioViewfinder: { height: 160, backgroundColor: '#000', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 10, overflow: 'hidden' },
  editPill: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginRight: 6, borderWidth: 1, borderColor: '#cbd5e0' },
  activeEditPill: { backgroundColor: '#3182ce', borderColor: '#3182ce' },
  editPillText: { fontSize: 10, fontWeight: 'bold', color: '#4a5568' },
});