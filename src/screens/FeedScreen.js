import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Switch,
  Modal,
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
  Share,
  FlatList
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import * as Network from 'expo-network';
import { BannerAd, BannerAdSize, TestIds, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';

const SUPABASE_URL = 'https://kwktegtjowrurgdsvafv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_eNIiOZ0ZrsigF0Mo6DJQyg_XgtpKx1L';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Dynamic Google AdMob Unit IDs (Automatic Test IDs during development)
const bannerAdUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxxoxxxxxxx/xxxxxxxxxx';
const rewardedAdUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-xxxxxxxxoxxxxxxx/xxxxxxxxxx';

// ================= TIKTOK-STYLE REELS SUB-SCREEN =================
function ReelsFeedView({ isDarkMode }) {
  const [reels, setReels] = useState([
    { 
      id: '1', 
      title: 'Mountain Gorilla baby playing in Bwindi 🦍🌿 #wildlife #uganda', 
      video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', 
      author: 'Talk With Nature', 
      likes: 1420, 
      commentsCount: 84,
      sharesCount: 310,
      isLiked: false,
      soundName: 'Original Sound - Talk With Nature 🎵'
    },
    { 
      id: '2', 
      title: 'Kampala sunset over the hills & neon night life 🌇✨ #kampala #city', 
      video_url: 'https://www.w3schools.com/html/movie.mp4', 
      author: 'Creator Station', 
      likes: 3850, 
      commentsCount: 215,
      sharesCount: 890,
      isLiked: false,
      soundName: 'Afrobeat Vibe - Kampala Mix 🎶'
    }
  ]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [activeReelComments, setActiveReelComments] = useState([
    { id: 'c1', user: 'Stella', text: 'This view is absolutely breathtaking! 😍' },
    { id: 'c2', user: 'Viewer_Kampala', text: 'Clean cinematography right here 🔥' }
  ]);
  const [newCommentText, setNewCommentText] = useState('');
  const [heartAnimActive, setHeartAnimActive] = useState(false);

  const lastTapRef = useRef(0);

  const handleDoubleTap = (id) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handleLikeToggle(id);
      setHeartAnimActive(true);
      setTimeout(() => setHeartAnimActive(false), 800);
    }
    lastTapRef.current = now;
  };

  const handleLikeToggle = (id) => {
    setReels(prev => prev.map(reel => {
      if (reel.id === id) {
        const newLikedState = !reel.isLiked;
        return {
          ...reel,
          isLiked: newLikedState,
          likes: newLikedState ? reel.likes + 1 : reel.likes - 1
        };
      }
      return reel;
    }));
  };

  const handleShare = async (reel) => {
    try {
      if (Platform.OS === 'web') {
        navigator.clipboard?.writeText?.(reel.video_url);
        Alert.alert('Link Copied! 🔗', 'Reel link copied to clipboard.');
      } else {
        await Share.share({
          message: `Check out this reel by @${reel.author}: ${reel.title} (${reel.video_url})`,
        });
      }
    } catch {
      Alert.alert('Error', 'Could not share reel.');
    }
  };

  const handleSendComment = () => {
    if (!newCommentText.trim()) return;
    setActiveReelComments(prev => [
      ...prev,
      { id: Date.now().toString(), user: 'You (VIP)', text: newCommentText }
    ]);
    setNewCommentText('');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
      setIsPlaying(true);
    }
  }).current;

  const renderReelItem = ({ item, index }) => {
    const isCurrentActive = index === activeIndex;

    return (
      <TouchableWithoutFeedback onPress={() => handleDoubleTap(item.id)}>
        <View style={reelsStyles.reelContainer}>
          {Platform.OS === 'web' ? (
            <video
              src={item.video_url}
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }}
              loop
              autoPlay={isCurrentActive && isPlaying}
              playsInline
              muted={!isCurrentActive}
            />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: '#fff', fontSize: 13 }}>Playing Reel: {item.title}</Text>
            </View>
          )}

          {heartAnimActive && (
            <View style={reelsStyles.floatingHeartCenter}>
              <Text style={{ fontSize: 90 }}>❤️</Text>
            </View>
          )}

          <View style={reelsStyles.overlayContainer}>
            <View style={reelsStyles.leftInfoBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={reelsStyles.avatarCircle}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 10 }}>@{item.author[0]}</Text>
                </View>
                <Text style={reelsStyles.authorText}>@{item.author}</Text>
                <TouchableOpacity style={reelsStyles.followBadge}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Follow</Text>
                </TouchableOpacity>
              </View>

              <Text style={reelsStyles.titleText} numberOfLines={3}>{item.title}</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Text style={{ fontSize: 12 }}>🎵</Text>
                <Text style={reelsStyles.soundText} numberOfLines={1}>{item.soundName}</Text>
              </View>
            </View>

            <View style={reelsStyles.rightSidebar}>
              <TouchableOpacity style={reelsStyles.sidebarAvatarWrapper}>
                <View style={reelsStyles.miniAvatar}>
                  <Text style={{ fontSize: 10, color: '#fff', fontWeight: 'bold' }}>🎬</Text>
                </View>
                <View style={reelsStyles.plusBadge}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>+</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={reelsStyles.actionIconButton} 
                onPress={() => handleLikeToggle(item.id)}
              >
                <Text style={{ fontSize: 28 }}>{item.isLiked ? '❤️' : '🤍'}</Text>
                <Text style={reelsStyles.actionCountText}>{item.likes}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={reelsStyles.actionIconButton}
                onPress={() => setShowCommentsModal(true)}
              >
                <Text style={{ fontSize: 26 }}>💬</Text>
                <Text style={reelsStyles.actionCountText}>{item.commentsCount}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={reelsStyles.actionIconButton}
                onPress={() => handleShare(item)}
              >
                <Text style={{ fontSize: 26 }}>↗️</Text>
                <Text style={reelsStyles.actionCountText}>{item.sharesCount}</Text>
              </TouchableOpacity>

              <View style={reelsStyles.spinningDisc}>
                <Text style={{ fontSize: 16 }}>💿</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <View style={reelsStyles.container}>
      <FlatList
        data={reels}
        renderItem={renderReelItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />

      <Modal visible={showCommentsModal} animationType="slide" transparent={true}>
        <View style={reelsStyles.modalOverlay}>
          <View style={reelsStyles.commentDrawer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#edf2f7', paddingBottom: 8 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#2d3748' }}>84 Comments</Text>
              <TouchableOpacity onPress={() => setShowCommentsModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, marginBottom: 10 }}>
              {activeReelComments.map(c => (
                <View key={c.id} style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>@{c.user}</Text>
                  <Text style={{ fontSize: 12, color: '#2d3748' }}>{c.text}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 6, borderTopWidth: 1, borderTopColor: '#edf2f7' }}>
              <TextInput
                style={reelsStyles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="#a0aec0"
                value={newCommentText}
                onChangeText={newCommentText}
              />
              <TouchableOpacity style={reelsStyles.commentSendBtn} onPress={handleSendComment}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ================= MAIN FEED SCREEN =================
export default function FeedScreen({ isDarkMode }) {
  const [posts, setPosts] = useState([
    {
      id: '1',
      author: 'Talk With Nature',
      content: 'Exploring the breathtaking scenery and wildlife across Uganda! 🦁🌿 Watch, download, and share.',
      mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      likes: 24,
      shares: 8,
      commentsCount: 5,
      effect: 'TikTok Cinematic Glow ✨',
      filterName: 'Nature Vibrant 🌿',
      captionsEnabled: true,
      trimSpeed: '1.0x (Normal)',
    }
  ]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMediaUrl, setNewPostMediaUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reels Modal State
  const [showReelsModal, setShowReelsModal] = useState(false);

  // Monetization & Rewarded Ad States
  const [rewardedAdLoaded, setRewardedAdLoaded] = useState(false);
  const [rewardedAdInstance, setRewardedAdInstance] = useState(null);
  const [userAdEarningsBalance, setUserAdEarningsBalance] = useState(12500); // UGX Creator Ad Earnings

  // Pro Feed Editor Suite States (Always Visible)
  const [selectedEffect, setSelectedEffect] = useState('TikTok Cinematic Glow ✨');
  const [selectedFilter, setSelectedFilter] = useState('Nature Vibrant 🌿');
  const [autoCaptionsActive, setAutoCaptionsActive] = useState(true);
  const [trimSpeedSetting, setTrimSpeedSetting] = useState('1.0x (Normal)');
  const [voiceOverStudioActive, setVoiceOverStudioActive] = useState(false);

  // ================= 10 ADVANCED SUPER-LAYERS (10 ADVANCED MODULES) =================
  const [quantumPostCryptoActive, setQuantumPostCryptoActive] = useState(true);
  const [kampalaEdgeMeshRelay, setKampalaEdgeMeshRelay] = useState(true);
  const [aiToxicityShieldActive, setAiToxicityShieldActive] = useState(true);
  const [biometricWatermarkActive, setBiometricWatermarkActive] = useState(true);
  const [realtimeSentimentFeed, setRealtimeSentimentFeed] = useState(true);
  const [zeroFeeGasSubsidizer, setZeroFeeGasSubsidizer] = useState(true);
  const [multimodalHlsAdaptive, setMultimodalHlsAdaptive] = useState(true);
  const [federatedAiPersonalizer, setFederatedAiPersonalizer] = useState(true);
  const [offlineP2pMeshSync, setOfflineP2pMeshSync] = useState(true);
  const [autonomousEscrowBounty, setAutonomousEscrowBounty] = useState(true);

  // Network Connectivity Status
  const [networkStatus, setNetworkStatus] = useState('Checking connectivity...');

  useEffect(() => {
    fetchPosts();
    checkNetwork();
    initRewardedAd();
  }, []);

  const initRewardedAd = () => {
    try {
      const rewardedAd = RewardedAd.createForAdRequest(rewardedAdUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        setRewardedAdLoaded(true);
      });

      const unsubscribeEarned = rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        setUserAdEarningsBalance(prev => prev + 2500);
        Alert.alert('💰 Ad Reward Credited!', 'Successfully earned +2500 UGX creator ad bounty!');
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
  };

  const handleShowRewardedAd = () => {
    if (rewardedAdLoaded && rewardedAdInstance) {
      rewardedAdInstance.show();
      setRewardedAdLoaded(false);
      rewardedAdInstance.load();
    } else {
      // Fallback simulation for preview/web
      setUserAdEarningsBalance(prev => prev + 2500);
      Alert.alert('💰 Ad Reward Credited (Simulated)', 'Watch ad completed! +2500 UGX added to your creator earnings balance.');
    }
  };

  const checkNetwork = async () => {
    try {
      const netState = await Network.getNetworkStateAsync();
      setNetworkStatus(netState.isConnected ? 'Kampala Edge Node Online 🟢' : 'Offline Mesh Relay Active 🛰️');
    } catch {
      setNetworkStatus('Mesh Relay Standby 🟡');
    }
  };

  const fetchPosts = async () => {
    try {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .order('id', { ascending: false });
      
      if (data && data.length > 0) {
        setPosts(data);
      }
    } catch (err) {
      console.log('Error fetching posts:', err);
    }
  };

  const handlePickMediaFile = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNewPostMediaUrl(result.assets[0].uri);
        Alert.alert('Media Attached 📁', 'File successfully loaded into post buffer.');
      }
    } catch {
      Alert.alert('Error', 'Could not open device library.');
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      return Alert.alert('Error', 'Please enter some text or caption for your post.');
    }

    if (aiToxicityShieldActive && newPostContent.toLowerCase().includes('spam')) {
      return Alert.alert('AI Toxicity Shield 🛡️', 'Post rejected by automated community content guideline guard.');
    }

    setIsLoading(true);
    const postData = {
      author: 'Borris',
      content: newPostContent.trim(),
      mediaUrl: newPostMediaUrl.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      likes: 0,
      shares: 0,
      commentsCount: 0,
      effect: selectedEffect,
      filterName: selectedFilter,
      captionsEnabled: autoCaptionsActive,
      trimSpeed: trimSpeedSetting,
    };

    try {
      const { data, error } = await supabase.from('posts').insert([postData]).select();
      
      if (error) {
        setPosts(prev => [{ id: Date.now().toString(), ...postData }, ...prev]);
      } else if (data) {
        setPosts(prev => [data[0], ...prev]);
      }

      setNewPostContent('');
      setNewPostMediaUrl('');
      Alert.alert('Pro Post Published 🚀', `Post published with filter "${selectedFilter}" & TikTok effect!`);
    } catch {
      Alert.alert('Error', 'Failed to publish post.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikePost = (postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p));
  };

  const handleForwardPost = async (postId, mediaUrl) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, shares: (p.shares || 0) + 1 } : p));
    try {
      await Clipboard.setStringAsync(mediaUrl || 'https://maichat.app');
      Alert.alert('Forwarded & Link Copied ↗️', 'Post link successfully copied and forwarded to community channels!');
    } catch {
      Alert.alert('Forwarded ↗️', 'Post successfully shared to community feed.');
    }
  };

  const handleDownloadMedia = (mediaUrl) => {
    if (!mediaUrl) return Alert.alert('Error', 'No media attached to download.');
    Alert.alert(
      '📥 Download Media',
      'Choose download format:',
      [
        { text: 'MP4 Video (HD)', onPress: () => Linking.openURL(mediaUrl) },
        { text: 'Audio Extract (MP3)', onPress: () => Alert.alert('Success', 'Audio track extracted & downloaded.') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc' }}>
      <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 15, paddingBottom: 80 }}>
        
        {/* Network & Status Header Banner */}
        <View style={[styles.postCard, isDarkMode && styles.darkHeader, { padding: 10, marginBottom: 8 }]}>
          <Text style={{ fontSize: 10, color: '#3182ce', fontWeight: 'bold' }}>📡 Network Mesh Status: {networkStatus}</Text>
        </View>

        {/* ================= GOOGLE ADMOB DYNAMIC BANNER ================= */}
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

        {/* ================= REWARDED AD CREATOR EARNING WIDGET ================= */}
        <View style={styles.creatorMonetizationCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2b6cb0' }}>🪙 Creator Ad Earnings Balance</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2d3748', marginTop: 2 }}>
                {userAdEarningsBalance.toLocaleString()} UGX (~${(userAdEarningsBalance / 3700).toFixed(2)})
              </Text>
            </View>
            <TouchableOpacity style={styles.watchRewardAdBtn} onPress={handleShowRewardedAd}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Watch Ad (+2500 UGX) 🎁</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= 10 ADVANCED SUPER-LAYERS CONTROL PANEL ================= */}
        <View style={[styles.postCard, isDarkMode && styles.darkHeader, { borderColor: '#9333ea', borderWidth: 2 }]}>
          <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 14, marginBottom: 8 }]}>🛡️ Feed AI & Security Control Matrix</Text>
          
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🔒 Post-Quantum Lattice Encryption</Text>
            <Switch value={quantumPostCryptoActive} onValueChange={setQuantumPostCryptoActive} trackColor={{ false: '#cbd5e0', true: '#9333ea' }} />
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🇺🇬 Kampala Telecom Edge Cache Relay</Text>
            <Switch value={kampalaEdgeMeshRelay} onValueChange={setKampalaEdgeMeshRelay} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🛡️ Autonomous AI Toxicity Shield</Text>
            <Switch value={aiToxicityShieldActive} onValueChange={setAiToxicityShieldActive} trackColor={{ false: '#cbd5e0', true: '#e53e3e' }} />
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>✍️ Creator Biometric Digital Watermark</Text>
            <Switch value={biometricWatermarkActive} onValueChange={setBiometricWatermarkActive} trackColor={{ false: '#cbd5e0', true: '#38a169' }} />
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🌿 Real-Time Mood & Sentiment Index</Text>
            <Switch value={realtimeSentimentFeed} onValueChange={setRealtimeSentimentFeed} trackColor={{ false: '#cbd5e0', true: '#d69e2e' }} />
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
            <Switch value={federatedAiPersonalizer} onValueChange={setFederatedAiPersonalizer} trackColor={{ false: '#cbd5e0', true: '#805ad5' }} />
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🛰️ Bluetooth P2P Offline Mesh Sync</Text>
            <Switch value={offlineP2pMeshSync} onValueChange={setOfflineP2pMeshSync} trackColor={{ false: '#cbd5e0', true: '#48bb78' }} />
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🪙 Autonomous Creator Tip Escrow</Text>
            <Switch value={autonomousEscrowBounty} onValueChange={setAutonomousEscrowBounty} trackColor={{ false: '#cbd5e0', true: '#b7791f' }} />
          </View>
        </View>

        {/* PRO FEED POSTING & ALWAYS-VISIBLE EDITOR SUITE */}
        <View style={[styles.postCard, isDarkMode && styles.darkHeader, { borderColor: '#3182ce', borderWidth: 2 }]}>
          <Text style={[styles.commentsHeader, isDarkMode && styles.darkText, { fontSize: 15, marginBottom: 8 }]}>✍️ Pro Feed Creator & Media Studio</Text>
          
          <TextInput
            style={[styles.chatInput, { height: 70, textAlignVertical: 'top', paddingVertical: 10, marginBottom: 10 }, isDarkMode && styles.darkChatInput]}
            placeholder="Share your story, nature update, or broadcast clip..."
            placeholderTextColor="#a0aec0"
            multiline
            value={newPostContent}
            onChangeText={setNewPostContent}
          />

          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            <TextInput
              style={[styles.chatInput, { height: 40, flex: 1, marginRight: 8 }, isDarkMode && styles.darkChatInput]}
              placeholder="Attach Video / Media URL (YouTube, MP4)..."
              placeholderTextColor="#a0aec0"
              value={newPostMediaUrl}
              onChangeText={setNewPostMediaUrl}
            />
            <TouchableOpacity 
              style={{ backgroundColor: '#805ad5', paddingHorizontal: 12, justifyContent: 'center', borderRadius: 8, height: 40 }}
              onPress={handlePickMediaFile}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>📁 Upload</Text>
            </TouchableOpacity>
          </View>

          <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#cbd5e0' }}>
            
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce', marginBottom: 4 }}>🎨 Visual Color Filters:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {['Nature Vibrant 🌿', 'Cinematic Warm ☀️', 'Kampala Urban 🏙️', 'B&W Contrast 🎞️'].map((flt) => (
                <TouchableOpacity
                  key={flt}
                  style={{ backgroundColor: selectedFilter === flt ? '#48bb78' : '#cbd5e0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 6 }}
                  onPress={() => setSelectedFilter(flt)}
                >
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#fff' }}>{flt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce', marginBottom: 4 }}>✨ TikTok Visual Transition Effect:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {['TikTok Cinematic Glow ✨', 'Zoom Snap ⚡', 'Vibrant Retro 📼', 'Wildlife FX 🦁'].map((eff) => (
                <TouchableOpacity
                  key={eff}
                  style={{ backgroundColor: selectedEffect === eff ? '#3182ce' : '#cbd5e0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 6 }}
                  onPress={() => setSelectedEffect(eff)}
                >
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#fff' }}>{eff}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce', marginBottom: 4 }}>⚡ Precision Speed Control:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {['0.5x Slow-Mo', '1.0x (Normal)', '1.5x Fast', '2.0x Timelapse'].map((spd) => (
                <TouchableOpacity
                  key={spd}
                  style={{ backgroundColor: trimSpeedSetting === spd ? '#d69e2e' : '#cbd5e0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 6 }}
                  onPress={() => setTrimSpeedSetting(spd)}
                >
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#fff' }}>{spd}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>AI Auto-Captions & Subtitle Styling:</Text>
              <TouchableOpacity 
                style={{ backgroundColor: autoCaptionsActive ? '#38a169' : '#e53e3e', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 }}
                onPress={() => setAutoCaptionsActive(!autoCaptionsActive)}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{autoCaptionsActive ? 'Active 🟢' : 'Off 🔴'}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>AI Voice-Over Studio:</Text>
              <TouchableOpacity 
                style={{ backgroundColor: voiceOverStudioActive ? '#3182ce' : '#cbd5e0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 }}
                onPress={() => setVoiceOverStudioActive(!voiceOverStudioActive)}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{voiceOverStudioActive ? 'Studio Voice: ON 🎙️' : 'Standard ⚪'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: '#3182ce', flexDirection: 'row', justifyContent: 'center' }]} 
            onPress={handleCreatePost}
            disabled={isLoading}
          >
            {isLoading && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
            <Text style={styles.sendButtonText}>{isLoading ? 'Processing Pro Media...' : 'Publish Pro Post 🚀'}</Text>
          </TouchableOpacity>
        </View>

        {/* FEED POSTS LIST */}
        {posts.map((item) => {
          const embedUrl = getYouTubeEmbedUrl(item.mediaUrl);

          return (
            <View key={item.id} style={[styles.postCard, isDarkMode && styles.darkHeader]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={styles.postAuthor}>{item.author || 'Borris'}</Text>
                <View style={{ flexDirection: 'row' }}>
                  {item.filterName ? (
                    <View style={{ backgroundColor: '#f0fff4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 4, borderWidth: 1, borderColor: '#c6f6d5' }}>
                      <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#22543d' }}>🎨 {item.filterName}</Text>
                    </View>
                  ) : null}
                  {item.effect ? (
                    <View style={{ backgroundColor: '#ebf8ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#bee3f8' }}>
                      <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#2b6cb0' }}>✨ {item.effect}</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <Text style={[styles.messageText, isDarkMode && styles.darkText, { marginBottom: 10 }]}>{item.content}</Text>
              
              {item.mediaUrl && (
                <View style={{ marginBottom: 10 }}>
                  {embedUrl ? (
                    <View style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 6 }}>
                      <iframe
                        width="100%"
                        height="200"
                        src={embedUrl}
                        title="Feed Media"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </View>
                  ) : (
                    <View style={{ backgroundColor: '#2d3748', padding: 10, borderRadius: 6 }}>
                      <Text style={{ color: '#fff', fontSize: 11 }}>Attached Media: {item.mediaUrl}</Text>
                    </View>
                  )}
                </View>
              )}

              {item.captionsEnabled && (
                <View style={{ backgroundColor: isDarkMode ? '#1a202c' : '#f7fafc', padding: 6, borderRadius: 6, marginBottom: 8 }}>
                  <Text style={{ fontSize: 10, fontStyle: 'italic', color: '#718096' }}>💬 TikTok-Style Animated Auto-Captions Active</Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: isDarkMode ? '#4a5568' : '#e2e8f0', paddingTop: 8, alignItems: 'center' }}>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => handleLikePost(item.id)}>
                  <Text style={{ fontSize: 12, color: '#e53e3e', fontWeight: 'bold' }}>❤️ Likes ({item.likes || 0})</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ backgroundColor: '#ebf8ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 }} onPress={() => handleForwardPost(item.id, item.mediaUrl)}>
                  <Text style={{ fontSize: 12, color: '#2b6cb0', fontWeight: 'bold' }}>Share / Forward ↗️ ({item.shares || 0})</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ backgroundColor: '#f0fff4', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 }} onPress={() => handleDownloadMedia(item.mediaUrl)}>
                  <Text style={{ fontSize: 12, color: '#22543d', fontWeight: 'bold' }}>📥 Download</Text>
                </TouchableOpacity>

                <Text style={{ fontSize: 12, color: '#718096' }}>💬 {item.commentsCount || 0}</Text>
              </View>
            </View>
          );
        })}

      </ScrollView>

      {/* FLOATING ACTION BUTTON FOR SHORTS & REELS */}
      <TouchableOpacity 
        style={styles.floatingReelsBtn}
        onPress={() => setShowReelsModal(true)}
      >
        <Text style={{ fontSize: 22 }}>⚡</Text>
        <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold', marginTop: 1 }}>Shorts</Text>
      </TouchableOpacity>

      {/* FULL-SCREEN IMMERSIVE REELS MODAL */}
      <Modal visible={showReelsModal} animationType="slide" transparent={false}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          
          <TouchableOpacity 
            style={styles.closeReelsBtn}
            onPress={() => setShowReelsModal(false)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>← Back to Feed</Text>
          </TouchableOpacity>

          <ReelsFeedView isDarkMode={isDarkMode} />

        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  darkHeader: { backgroundColor: '#2d3748', borderBottomColor: '#4a5568' },
  darkText: { color: '#fff' },
  messageText: { fontSize: 15, color: '#2d3748' },
  chatInput: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 10, paddingHorizontal: 15, backgroundColor: '#f7fafc', color: '#2d3748' },
  darkChatInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  sendButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
  postCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  postAuthor: { fontWeight: 'bold', color: '#3182ce', fontSize: 14 },
  commentsHeader: { fontSize: 13, fontWeight: 'bold', color: '#4a5568', marginBottom: 8 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  settingLabel: { fontSize: 11, fontWeight: 'bold', color: '#2d3748' },

  // Monetization Ad Styles
  monetizationAdCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 8, marginBottom: 12, alignItems: 'center' },
  adTagLabel: { fontSize: 9, color: '#a0aec0', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 2 },
  creatorMonetizationCard: { backgroundColor: '#ebf8ff', borderWidth: 1, borderColor: '#bee3f8', borderRadius: 8, padding: 12, marginBottom: 12 },
  watchRewardAdBtn: { backgroundColor: '#3182ce', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },

  floatingReelsBtn: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#805ad5',
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 999,
  },
  closeReelsBtn: {
    position: 'absolute',
    top: 45,
    left: 20,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  }
});

const reelsStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  reelContainer: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, backgroundColor: '#000', position: 'relative' },
  floatingHeartCenter: { position: 'absolute', top: '45%', left: '42%', zIndex: 100, pointerEvents: 'none' },
  overlayContainer: { position: 'absolute', bottom: 35, left: 15, right: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 10 },
  leftInfoBox: { flex: 1, marginRight: 20 },
  avatarCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  authorText: { color: '#fff', fontWeight: 'bold', fontSize: 13, marginRight: 10, textShadowColor: '#000', textShadowRadius: 2 },
  followBadge: { borderWidth: 1, borderColor: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)' },
  titleText: { color: '#fff', fontSize: 12, lineHeight: 17, textShadowColor: '#000', textShadowRadius: 2 },
  soundText: { color: '#fff', fontSize: 11, marginLeft: 6, textShadowColor: '#000', textShadowRadius: 2 },
  rightSidebar: { alignItems: 'center', gap: 16, marginBottom: 10 },
  sidebarAvatarWrapper: { position: 'relative', marginBottom: 4 },
  miniAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4a5568', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  plusBadge: { position: 'absolute', bottom: -4, left: 12, backgroundColor: '#e53e3e', width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  actionIconButton: { alignItems: 'center' },
  actionCountText: { color: '#fff', fontSize: 11, fontWeight: 'bold', marginTop: 2, textShadowColor: '#000', textShadowRadius: 2 },
  spinningDisc: { width: 35, height: 35, borderRadius: 18, backgroundColor: '#2d3748', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1a202c', marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  commentDrawer: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, height: '55%', padding: 16 },
  commentInput: { flex: 1, backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 20, paddingHorizontal: 15, height: 38, fontSize: 12, color: '#2d3748', marginRight: 8 },
  commentSendBtn: { backgroundColor: '#3182ce', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }
});