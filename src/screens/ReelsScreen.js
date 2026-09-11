import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Modal,
  TextInput,
  ScrollView,
  Share,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../Services/supabaseClient'; // Adjust path if needed

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ReelsScreen({ isDarkMode, coins, setCoins }) {
  const [reels, setReels] = useState([
    { 
      id: '1', 
      title: 'Mountain Gorilla baby playing in Bwindi 🦍🌿 #wildlife #uganda', 
      video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', 
      author: 'Borris', 
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
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
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
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
  const [activeReelId, setActiveReelId] = useState(null);
  
  // Comments mapping per reel id
  const [commentsMap, setCommentsMap] = useState({
    '1': [
      { id: 'c1', user: 'Stella', text: 'This view is absolutely breathtaking! 😍' },
      { id: 'c2', user: 'Viewer_Kampala', text: 'Clean cinematography right here 🔥' }
    ],
    '2': [
      { id: 'c3', user: 'Nimusiima Asifa', text: 'Love the Kampala evening skyline! 🌇' }
    ]
  });
  
  const [newCommentText, setNewCommentText] = useState('');
  const [heartAnimActive, setHeartAnimActive] = useState(false);

  // NEW LAYER: CREATE REEL MODAL & UPLOAD STATES
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReelTitle, setNewReelTitle] = useState('');
  const [newReelVideoUri, setNewReelVideoUri] = useState('');
  const [uploading, setUploading] = useState(false);

  // Track double taps for instant like
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
        const updatedLikes = newLikedState ? reel.likes + 1 : reel.likes - 1;
        
        // Reward user with coins for engagement
        if (newLikedState && setCoins) {
          setCoins(c => c + 5);
        }

        return {
          ...reel,
          isLiked: newLikedState,
          likes: updatedLikes
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
      if (setCoins) setCoins(c => c + 10); // Reward for sharing
    } catch {
      Alert.alert('Error', 'Could not share reel.');
    }
  };

  const handleOpenComments = (reelId) => {
    setActiveReelId(reelId);
    setShowCommentsModal(true);
  };

  const handleSendComment = () => {
    if (!newCommentText.trim() || !activeReelId) return;
    
    const newComment = {
      id: Date.now().toString(),
      user: 'Borris (You)',
      text: newCommentText
    };

    setCommentsMap(prev => ({
      ...prev,
      [activeReelId]: [...(prev[activeReelId] || []), newComment]
    }));

    // Update comment count on reel
    setReels(prev => prev.map(r => r.id === activeReelId ? { ...r, commentsCount: r.commentsCount + 1 } : r));
    setNewCommentText('');
    if (setCoins) setCoins(c => c + 5); // Reward for commenting
  };

  const handlePickVideo = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        return Alert.alert('Permission Required ⚠️', 'Camera roll access permission is required to upload a reel.');
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        setNewReelVideoUri(pickerResult.assets[0].uri);
        Alert.alert('Video Selected 🎬', 'Your video file is ready to publish.');
      }
    } catch (err) {
      console.warn('Video picker error:', err);
    }
  };

  const handlePublishReel = () => {
    if (!newReelTitle.trim()) {
      return Alert.alert('Error', 'Please enter a caption or title for your reel.');
    }

    setUploading(true);
    setTimeout(() => {
      const createdReel = {
        id: Date.now().toString(),
        title: newReelTitle,
        video_url: newReelVideoUri || 'https://www.w3schools.com/html/mov_bbb.mp4',
        author: 'Borris',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        likes: 1,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        soundName: 'Original Audio - Borris 🎵'
      };

      setReels(prev => [createdReel, ...prev]);
      setCommentsMap(prev => ({ ...prev, [createdReel.id]: [] }));
      setUploading(false);
      setShowCreateModal(false);
      setNewReelTitle('');
      setNewReelVideoUri('');
      if (setCoins) setCoins(c => c + 50); // Generous reward for creator upload
      Alert.alert('Reel Published! 🚀', 'Your reel is now live on ChatUp feeds and earned +50 coins!');
    }, 1000);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
      setIsPlaying(true);
    }
  }).current;

  const renderReelItem = ({ item, index }) => {
    const isCurrentActive = index === activeIndex;
    const currentReelComments = commentsMap[item.id] || [];

    return (
      <TouchableWithoutFeedback onPress={() => handleDoubleTap(item.id)}>
        <View style={styles.reelContainer}>
          {/* Video Player */}
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
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1a202c', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>🎬 Playing Reel: {item.title}</Text>
              <Text style={{ color: '#a0aec0', fontSize: 11, marginTop: 4 }}>Channel: @{item.author}</Text>
            </View>
          )}

          {/* Double Tap Flying Heart Animation Effect */}
          {heartAnimActive && (
            <View style={styles.floatingHeartCenter}>
              <Text style={{ fontSize: 90 }}>❤️</Text>
            </View>
          )}

          {/* TikTok Style Overlays */}
          <View style={styles.overlayContainer}>
            
            {/* Bottom Left: Author & Caption */}
            <View style={styles.leftInfoBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={styles.avatarCircle}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 10 }}>@{item.author[0]}</Text>
                </View>
                <Text style={styles.authorText}>@{item.author}</Text>
                <TouchableOpacity style={styles.followBadge} onPress={() => Alert.alert('Following 🔔', `You are now following @${item.author}`)}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Follow</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.titleText} numberOfLines={3}>{item.title}</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Text style={{ fontSize: 12 }}>🎵</Text>
                <Text style={styles.soundText} numberOfLines={1}>{item.soundName}</Text>
              </View>
            </View>

            {/* Right Side: Action Sidebar */}
            <View style={styles.rightSidebar}>
              
              {/* Creator Profile Avatar Pin */}
              <TouchableOpacity style={styles.sidebarAvatarWrapper}>
                <View style={styles.miniAvatar}>
                  <Text style={{ fontSize: 10, color: '#fff', fontWeight: 'bold' }}>🎬</Text>
                </View>
                <View style={styles.plusBadge}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>+</Text>
                </View>
              </TouchableOpacity>

              {/* Like Button */}
              <TouchableOpacity 
                style={styles.actionIconButton} 
                onPress={() => handleLikeToggle(item.id)}
              >
                <Text style={{ fontSize: 28 }}>{item.isLiked ? '❤️' : '🤍'}</Text>
                <Text style={styles.actionCountText}>{item.likes}</Text>
              </TouchableOpacity>

              {/* Comments Button */}
              <TouchableOpacity 
                style={styles.actionIconButton}
                onPress={() => handleOpenComments(item.id)}
              >
                <Text style={{ fontSize: 26 }}>💬</Text>
                <Text style={styles.actionCountText}>{item.commentsCount}</Text>
              </TouchableOpacity>

              {/* Share Button */}
              <TouchableOpacity 
                style={styles.actionIconButton}
                onPress={() => handleShare(item)}
              >
                <Text style={{ fontSize: 26 }}>↗️</Text>
                <Text style={styles.actionCountText}>{item.sharesCount}</Text>
              </TouchableOpacity>

              {/* Rotating Sound Disc */}
              <View style={styles.spinningDisc}>
                <Text style={{ fontSize: 16 }}>💿</Text>
              </View>

            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      
      {/* Top Floating Header & Create Reel Button */}
      <View style={styles.topHeaderBar}>
        <Text style={styles.topHeaderTitle}>🔥 ChatUp Reels (Wallet: {coins} 🪙)</Text>
        <TouchableOpacity style={styles.createReelNavBtn} onPress={() => setShowCreateModal(true)}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>+ Upload Reel</Text>
        </TouchableOpacity>
      </View>

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

      {/* COMMENTS MODAL DRAWER (TIKTOK STYLE) */}
      <Modal visible={showCommentsModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.commentDrawer, isDarkMode && { backgroundColor: '#2d3748' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#edf2f7', paddingBottom: 8 }}>
              <Text style={[{ fontWeight: 'bold', fontSize: 13, color: '#2d3748' }, isDarkMode && styles.darkText]}>
                Comments ({activeReelId ? (commentsMap[activeReelId] || []).length : 0})
              </Text>
              <TouchableOpacity onPress={() => setShowCommentsModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, marginBottom: 10 }}>
              {activeReelId && (commentsMap[activeReelId] || []).map(c => (
                <View key={c.id} style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>@{c.user}</Text>
                  <Text style={[{ fontSize: 12, color: '#2d3748' }, isDarkMode && styles.darkText]}>{c.text}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 6, borderTopWidth: 1, borderTopColor: '#edf2f7' }}>
              <TextInput
                style={[styles.commentInput, isDarkMode && { backgroundColor: '#1a202c', color: '#fff', borderColor: '#4a5568' }]}
                placeholder="Add a comment... (+5 🪙)"
                placeholderTextColor="#a0aec0"
                value={newCommentText}
                onChangeText={setNewCommentText}
              />
              <TouchableOpacity style={styles.commentSendBtn} onPress={handleSendComment}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* UPLOAD / CREATE REEL MODAL */}
      <Modal visible={showCreateModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.commentDrawer, { height: '60%' }, isDarkMode && { backgroundColor: '#2d3748' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#edf2f7', paddingBottom: 8 }}>
              <Text style={[{ fontWeight: 'bold', fontSize: 14, color: '#2d3748' }, isDarkMode && styles.darkText]}>🎬 Upload New Creator Reel</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Select Video File</Text>
            <TouchableOpacity style={styles.videoPickerBtn} onPress={handlePickVideo}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3182ce' }}>
                {newReelVideoUri ? '📁 Video Selected Successfully ✓' : '📂 Browse Gallery & Select Video'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Caption & Hashtags</Text>
            <TextInput
              style={[styles.commentInput, { height: 70, borderRadius: 8, padding: 10, textAlignVertical: 'top' }, isDarkMode && { backgroundColor: '#1a202c', color: '#fff', borderColor: '#4a5568' }]}
              placeholder="Describe your video with tags (e.g. #nature #uganda)..."
              placeholderTextColor="#a0aec0"
              value={newReelTitle}
              onChangeText={setNewReelTitle}
              multiline
            />

            <TouchableOpacity 
              style={[styles.commentSendBtn, { width: '100%', paddingVertical: 12, marginTop: 20, borderRadius: 8 }]} 
              onPress={handlePublishReel}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>
                {uploading ? 'Publishing Reel...' : 'Publish Reel (+50 🪙) 🚀'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  darkContainer: { backgroundColor: '#000' },
  topHeaderBar: { position: 'absolute', top: 10, left: 15, right: 15, zIndex: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topHeaderTitle: { color: '#fff', fontWeight: 'bold', fontSize: 13, textShadowColor: '#000', textShadowRadius: 2 },
  createReelNavBtn: { backgroundColor: '#3182ce', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
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
  commentSendBtn: { backgroundColor: '#3182ce', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  darkText: { color: '#fff' },
  inputLabel: { fontSize: 10, fontWeight: 'bold', color: '#a0aec0', marginBottom: 4, marginTop: 8 },
  videoPickerBtn: { backgroundColor: '#ebf8ff', borderWidth: 1, borderColor: '#bee3f8', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 10 }
});