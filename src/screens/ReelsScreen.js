import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  Modal,
  TextInput,
  ScrollView,
  Share,
  Alert,
  RefreshControl
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../Services/supabaseClient';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ReelsScreen({ isDarkMode, coins, setCoins, currentUser, setNotifications }) {
  const [reels, setReels] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [activeReelId, setActiveReelId] = useState(null);
  
  const [commentsMap, setCommentsMap] = useState({});
  const [newCommentText, setNewCommentText] = useState('');
  const [heartAnimActive, setHeartAnimActive] = useState(false);

  // VIEWER TRACKER MODAL STATES
  const [showViewersModal, setShowViewersModal] = useState(false);
  const [currentViewersList, setCurrentViewersList] = useState([]);

  // CREATION & EDITOR STATES
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showRemixModal, setShowRemixModal] = useState(false);
  const [activeRemixReel, setActiveRemixReel] = useState(null);

  // Global Music Search Modal States
  const [showMusicPickerModal, setShowMusicPickerModal] = useState(false);
  const [musicSearchQuery, setMusicSearchQuery] = useState('');
  const [searchedMusicResults, setSearchedMusicResults] = useState([]);
  const [isSearchingMusic, setIsSearchingMusic] = useState(false);

  // Editor states
  const [newReelTitle, setNewReelTitle] = useState('');
  const [newReelVideoUri, setNewReelVideoUri] = useState('');
  const [overlayText, setOverlayText] = useState('');
  const [selectedSound, setSelectedSound] = useState('Original Creator Audio 🎵');
  const [audioMode, setAudioMode] = useState('Keep Original');
  const [selectedFilter, setSelectedFilter] = useState('Normal');
  const [uploading, setUploading] = useState(false);

  const myUsername = currentUser?.email ? currentUser.email.split('@')[0] : 'Borris';
  const myUserId = currentUser?.id || currentUser?.user?.id || null;

  useEffect(() => {
    fetchPersistentReels();
    fetchPersistentComments();
  }, []);

  const fetchPersistentReels = async () => {
    try {
      const { data } = await supabase
        .from('reels')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        const formatted = data.map(item => ({
          id: item.id.toString(),
          title: item.title,
          video_url: item.video_url,
          author: item.author || 'Creator',
          user_id: item.user_id,
          avatar: item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          likes: item.likes || 0,
          commentsCount: item.comments_count || 0,
          sharesCount: item.shares_count || 0,
          isLiked: false,
          isFavorite: false,
          soundName: item.sound_name || 'Original Creator Audio 🎵',
          overlayText: item.overlay_text || '',
          filter: item.filter || 'Normal',
          views: item.views || 0,
          viewers: item.viewers || [myUsername]
        }));
        setReels(formatted);
      } else {
        setReels([]);
      }
    } catch (err) {
      console.log('Error fetching reels:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPersistentReels();
    await fetchPersistentComments();
    setRefreshing(false);
  };

  const fetchPersistentComments = async () => {
    try {
      const { data } = await supabase.from('reel_comments').select('*');
      if (data && data.length > 0) {
        const map = {};
        data.forEach(c => {
          const rId = c.reel_id.toString();
          if (!map[rId]) map[rId] = [];
          map[rId].push({ id: c.id.toString(), user: c.user_name, text: c.comment_text });
        });
        setCommentsMap(prev => ({ ...prev, ...map }));
      }
    } catch (err) {
      console.log('Error fetching comments:', err);
    }
  };

  // Global iTunes Music Search API Integration
  useEffect(() => {
    const searchITunesMusic = async () => {
      if (!musicSearchQuery || musicSearchQuery.trim().length < 2) {
        setSearchedMusicResults([]);
        return;
      }

      setIsSearchingMusic(true);
      try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(musicSearchQuery)}&entity=song&limit=15`);
        const json = await response.json();
        if (json && json.results) {
          const formattedTracks = json.results.map((song, idx) => ({
            id: song.trackId?.toString() || idx.toString(),
            title: song.trackName,
            artist: song.artistName
          }));
          setSearchedMusicResults(formattedTracks);
        }
      } catch (err) {
        console.warn('Music search error:', err);
      } finally {
        setIsSearchingMusic(false);
      }
    };

    const timer = setTimeout(searchITunesMusic, 400);
    return () => clearTimeout(timer);
  }, [musicSearchQuery]);

  // View count tracker per active reel scroll (Ignores your own views on your own reels)
  useEffect(() => {
    const currentReel = reels[activeIndex];
    if (currentReel && myUsername) {
      if (currentReel.author === myUsername) return;

      if (!currentReel.viewers?.includes(myUsername)) {
        const updatedViewers = [...(currentReel.viewers || []), myUsername];
        const newViewsCount = (currentReel.views || 0) + 1;
        
        setReels(prev => prev.map((r, idx) => idx === activeIndex ? { ...r, viewers: updatedViewers, views: newViewsCount } : r));
        
        supabase
          .from('reels')
          .update({ views: newViewsCount, viewers: updatedViewers })
          .eq('id', currentReel.id)
          .then();

        if (currentReel.user_id) {
          supabase
            .from('profiles')
            .select('total_views')
            .eq('id', currentReel.user_id)
            .maybeSingle()
            .then(({ data: profileData }) => {
              const currentTotalViews = profileData?.total_views || 0;
              supabase
                .from('profiles')
                .update({ total_views: currentTotalViews + 1 })
                .eq('id', currentReel.user_id)
                .then();
            });
        }
      }
    }
  }, [activeIndex]);

  const lastTapRef = useRef(0);
  const activeReelIdRef = useRef(null);
  activeReelIdRef.current = reels[activeIndex]?.id;

  const handleVideoPress = () => {
    const now = Date.now();
    const currentId = activeReelIdRef.current;
    
    if (now - lastTapRef.current < 300) {
      if (currentId) {
        handleLikeToggle(currentId);
        setHeartAnimActive(true);
        setTimeout(() => setHeartAnimActive(false), 800);
      }
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      setTimeout(() => {
        if (lastTapRef.current === now) {
          setIsPlaying(prev => !prev);
        }
      }, 300);
    }
  };

  const triggerNotification = async (recipientAuthor, title, message) => {
    if (!recipientAuthor || recipientAuthor === myUsername || !setNotifications) return;

    const notificationPayload = {
      id: Date.now().toString(),
      title,
      message,
      time: 'Just now',
      read: false,
      recipient: recipientAuthor
    };

    setNotifications(prev => [notificationPayload, ...prev]);

    try {
      await supabase.from('notifications').insert([{
        recipient_username: recipientAuthor,
        sender_username: myUsername,
        title,
        message,
        created_at: new Date().toISOString()
      }]);
    } catch (notifErr) {
      console.log('Notification table sync note:', notifErr);
    }
  };

  const handleLikeToggle = async (id) => {
    let updatedLikesValue = 0;
    let targetAuthor = '';
    let targetUserId = '';
    let reelTitle = '';
    let isNowLiked = false;
    
    setReels(prev => prev.map(reel => {
      if (reel.id === id) {
        isNowLiked = !reel.isLiked;
        updatedLikesValue = isNowLiked ? reel.likes + 1 : Math.max(0, reel.likes - 1);
        targetAuthor = reel.author;
        targetUserId = reel.user_id;
        reelTitle = reel.title;
        return { ...reel, isLiked: isNowLiked, likes: updatedLikesValue };
      }
      return reel;
    }));

    if (isNowLiked && targetAuthor) {
      await triggerNotification(
        targetAuthor,
        'New Reel Like ❤️',
        `@${myUsername} liked your reel: "${reelTitle?.slice(0, 25) || 'video'}..."`
      );
    }

    try {
      const { data: dbReel } = await supabase.from('reels').select('likes').eq('id', id).maybeSingle();
      const currentDbLikes = dbReel?.likes || 0;
      const finalDbLikes = isNowLiked ? currentDbLikes + 1 : Math.max(0, currentDbLikes - 1);

      await supabase
        .from('reels')
        .update({ likes: finalDbLikes })
        .eq('id', id);

      if (targetUserId) {
        const { data: creatorProfile } = await supabase
          .from('profiles')
          .select('total_likes')
          .eq('id', targetUserId)
          .maybeSingle();

        const currentProfileLikes = creatorProfile?.total_likes || 0;
        const newProfileLikes = isNowLiked ? currentProfileLikes + 1 : Math.max(0, currentProfileLikes - 1);

        await supabase
          .from('profiles')
          .update({ total_likes: newProfileLikes })
          .eq('id', targetUserId);
      }
    } catch (err) {
      console.log('Like toggle sync error:', err);
    }
  };

  const handleFavoriteToggle = async (id) => {
    let targetAuthor = '';
    let newFavState = false;

    setReels(prev => prev.map(reel => {
      if (reel.id === id) {
        newFavState = !reel.isFavorite;
        targetAuthor = reel.author;
        Alert.alert(
          newFavState ? 'Saved to Favorites ⭐' : 'Removed from Favorites', 
          newFavState ? 'Reel added to your collection.' : 'Reel removed from saved.'
        );
        return { ...reel, isFavorite: newFavState };
      }
      return reel;
    }));

    if (newFavState && targetAuthor) {
      await triggerNotification(
        targetAuthor,
        'Reel Favorited ⭐',
        `@${myUsername} saved your reel to their favorites!`
      );
    }
  };

  // 🌟 Fully Robust Downloader supporting both remote web URLs and local file URIs
  const handleDownloadReel = async (reel) => {
    if (!reel || !reel.video_url) return;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== 'granted') {
        return Alert.alert('Permission Required ⚠️', 'Storage write access is needed to save reels to your photo gallery.');
      }

      Alert.alert('Saving 📥', 'Saving video to your device gallery...');

      let fileUri = reel.video_url;

      // If it's a remote URL (http/https), download it locally first
      if (reel.video_url.startsWith('http://') || reel.video_url.startsWith('https://')) {
        const filename = `reel_${Date.now()}.mp4`;
        const localUri = `${FileSystem.documentDirectory}${filename}`;
        const downloadResult = await FileSystem.downloadAsync(reel.video_url, localUri);
        
        if (downloadResult && downloadResult.uri) {
          fileUri = downloadResult.uri;
        }
      }

      const asset = await MediaLibrary.createAssetAsync(fileUri);
      
      try {
        await MediaLibrary.createAlbumAsync('ChatUp Reels', asset, false);
      } catch (albumErr) {
        console.log('Album creation note:', albumErr);
      }

      Alert.alert('Saved Successfully! 🎉', 'Video has been permanently saved to your device gallery.');
    } catch (error) {
      console.log('Download error:', error);
      Alert.alert('Download Failed ❌', 'Could not save the video file to your gallery.');
    }
  };

  const handleShare = async (reel) => {
    if (!reel) return;
    try {
      if (Platform.OS === 'web') {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(reel.video_url);
          Alert.alert('Link Copied! 🔗', 'Reel link copied to clipboard.');
        } else {
          Alert.alert('Share Link', reel.video_url);
        }
      } else {
        await Share.share({
          message: `Check out this reel by @${reel.author}: ${reel.title} - ${reel.video_url}`,
          url: reel.video_url,
          title: reel.title
        });
      }

      const updatedShares = (reel.sharesCount || 0) + 1;
      setReels(prev => prev.map(r => r.id === reel.id ? { ...r, sharesCount: updatedShares } : r));
      
      await triggerNotification(
        reel.author,
        'Reel Shared ↗️',
        `@${myUsername} shared your reel with others!`
      );

      await supabase
        .from('reels')
        .update({ shares_count: updatedShares })
        .eq('id', reel.id);
    } catch {
      Alert.alert('Error', 'Could not share reel.');
    }
  };

  const handleOpenComments = (reelId) => {
    setActiveReelId(reelId);
    setShowCommentsModal(true);
  };

  const handleOpenViewers = (viewersArray) => {
    setCurrentViewersList(viewersArray || []);
    setShowViewersModal(true);
  };

  const handleSendComment = async () => {
    if (!newCommentText.trim() || !activeReelId) return;

    try {
      await supabase.from('reel_comments').insert([{
        reel_id: activeReelId,
        user_name: myUsername,
        user_id: myUserId,
        comment_text: newCommentText.trim()
      }]);

      const currentReel = reels.find(r => r.id === activeReelId);
      const newCommentCount = (currentReel?.commentsCount || 0) + 1;

      const newComment = {
        id: Date.now().toString(),
        user: myUsername,
        text: newCommentText.trim()
      };

      setCommentsMap(prev => ({
        ...prev,
        [activeReelId]: [...(prev[activeReelId] || []), newComment]
      }));

      setReels(prev => prev.map(r => r.id === activeReelId ? { ...r, commentsCount: newCommentCount } : r));
      
      if (currentReel) {
        await triggerNotification(
          currentReel.author,
          'New Comment 💬',
          `@${myUsername} commented: "${newCommentText.trim().slice(0, 25)}..."`
        );
      }

      await supabase
        .from('reels')
        .update({ comments_count: newCommentCount })
        .eq('id', activeReelId);

      setNewCommentText('');
    } catch (err) {
      Alert.alert('Error', 'Could not post comment.');
    }
  };

  const handlePickVideo = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        return Alert.alert('Permission Required ⚠️', 'Camera roll access permission is required.');
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        setNewReelVideoUri(pickerResult.assets[0].uri);
        setShowCreateModal(false);
        setShowEditorModal(true);
      }
    } catch (err) {
      console.warn('Video picker error:', err);
    }
  };

  const handlePublishReel = async () => {
    if (!newReelTitle.trim()) {
      return Alert.alert('Error', 'Please enter a caption or hashtag description.');
    }

    if (!newReelVideoUri) {
      return Alert.alert('Error', 'Please select a video file first.');
    }

    setUploading(true);
    
    const finalVideoUrl = newReelVideoUri;

    let finalSoundName = selectedSound;
    if (audioMode === 'Mute Audio' || selectedSound.includes('Muted') || selectedSound.includes('Mute')) {
      finalSoundName = 'Muted (Original Removed) 🔇';
    }

    const payload = {
      title: newReelTitle.trim(),
      video_url: finalVideoUrl,
      author: myUsername,
      user_id: myUserId,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      likes: 0,
      comments_count: 0,
      shares_count: 0,
      sound_name: finalSoundName,
      overlay_text: overlayText.trim(),
      filter: selectedFilter,
      views: 0,
      viewers: [myUsername],
      created_at: new Date().toISOString()
    };

    try {
      const { error: insertError } = await supabase.from('reels').insert([payload]);

      if (insertError) throw insertError;

      await fetchPersistentReels();

      setUploading(false);
      setShowEditorModal(false);
      setNewReelTitle('');
      setNewReelVideoUri('');
      setOverlayText('');
      setSelectedSound('Original Creator Audio 🎵');
      setAudioMode('Keep Original');
      setActiveIndex(0);

      Alert.alert('Reel Published Live! 🚀', 'Your reel is now streaming live!');
    } catch (err) {
      console.log('Publish error:', err);
      setUploading(false);
      Alert.alert('Upload Error', 'Could not save reel to Supabase.');
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
      setIsPlaying(true);
    }
  }).current;

  const getFilterStyle = (filterName) => {
    switch (filterName) {
      case 'Cinematic Warm': return { tintColor: '#ffd700' };
      case 'Cyberpunk Neon': return { tintColor: '#ff00ff' };
      case 'Matrix Green': return { tintColor: '#00ff66' };
      case 'Vintage Sepia': return { tintColor: '#cc9966' };
      case 'Cool Vibe': return { tintColor: '#00ccff' };
      case 'B&W': return { opacity: 0.9 };
      default: return {};
    }
  };

  const renderReelItem = ({ item, index }) => {
    const isCurrentActive = index === activeIndex;
    const isMutedVideo = item.soundName?.includes('Muted') || item.soundName?.includes('Mute');

    return (
      <TouchableWithoutFeedback onPress={handleVideoPress}>
        <View style={styles.reelContainer}>
          {Platform.OS === 'web' ? (
            <video
              src={item.video_url}
              style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', backgroundColor: '#000' }}
              loop
              autoPlay={isCurrentActive && isPlaying}
              playsInline
              muted={!isCurrentActive || isMutedVideo}
            />
          ) : (
            <Video
              source={{ uri: item.video_url }}
              style={[StyleSheet.absoluteFillObject, getFilterStyle(item.filter)]}
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              shouldPlay={isCurrentActive && isPlaying}
              isMuted={!isCurrentActive || isMutedVideo}
            />
          )}

          <View style={styles.darkGradientOverlay} pointerEvents="none" />

          {!isPlaying && isCurrentActive && (
            <View style={styles.floatingPauseCenter}>
              <Text style={{ fontSize: 45, color: 'rgba(255,255,255,0.85)' }}>▶</Text>
            </View>
          )}

          {item.overlayText ? (
            <View style={styles.floatingTextBadge}>
              <Text style={styles.floatingTextContent}>{item.overlayText}</Text>
            </View>
          ) : null}

          {heartAnimActive && (
            <View style={styles.floatingHeartCenter}>
              <Text style={{ fontSize: 90 }}>❤️</Text>
            </View>
          )}

          <View style={styles.overlayContainer} pointerEvents="box-none">
            <View style={styles.leftInfoBox}>
              <View style={styles.authorRow}>
                <View style={styles.avatarCircle}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 10 }}>@{item.author[0]}</Text>
                </View>
                <Text style={styles.authorText}>@{item.author}</Text>
                
                {item.author !== myUsername && (
                  <TouchableOpacity style={styles.followBadge} onPress={() => Alert.alert('Following 🔔', `Following @${item.author}`)}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Follow</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.titleText} numberOfLines={3}>{item.title}</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                <Text style={{ fontSize: 11 }}>🎵</Text>
                <Text style={styles.soundText} numberOfLines={1}>{item.soundName}</Text>
              </View>
            </View>

            <View style={styles.rightSidebar} pointerEvents="box-none">
              <TouchableOpacity style={styles.actionIconButton} onPress={() => handleLikeToggle(item.id)}>
                <Text style={{ fontSize: 24 }}>{item.isLiked ? '❤️' : '🤍'}</Text>
                <Text style={styles.actionCountText}>{item.likes}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionIconButton} onPress={() => handleOpenComments(item.id)}>
                <Text style={{ fontSize: 22 }}>💬</Text>
                <Text style={styles.actionCountText}>{item.commentsCount}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionIconButton} onPress={() => handleOpenViewers(item.viewers)}>
                <Text style={{ fontSize: 20 }}>👁️</Text>
                <Text style={styles.actionCountText}>{item.views || (item.viewers ? item.viewers.length : 0)}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionIconButton} onPress={() => handleShare(item)}>
                <Text style={{ fontSize: 22 }}>↗️</Text>
                <Text style={styles.actionCountText}>{item.sharesCount}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionIconButton} onPress={() => handleDownloadReel(item)}>
                <Text style={{ fontSize: 22 }}>📥</Text>
                <Text style={styles.actionCountText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionIconButton} onPress={() => handleFavoriteToggle(item.id)}>
                <Text style={{ fontSize: 22 }}>{item.isFavorite ? '⭐' : '🔖'}</Text>
                <Text style={styles.actionCountText}>Fav</Text>
              </TouchableOpacity>

              {item.author === myUsername && (
                <TouchableOpacity 
                  style={[styles.actionIconButton, { marginTop: 4, backgroundColor: 'rgba(49, 130, 206, 0.85)', padding: 6, borderRadius: 14 }]} 
                  onPress={() => {
                    setActiveRemixReel(item);
                    setShowRemixModal(true);
                  }}
                >
                  <Text style={{ fontSize: 18 }}>🎛️</Text>
                  <Text style={styles.actionCountText}>Remix</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.topHeaderBar}>
        <Text style={styles.topHeaderTitle}>🔥 Reels Feed (Wallet: {coins || 0} 🪙)</Text>
        <TouchableOpacity style={styles.createReelNavBtn} onPress={() => setShowCreateModal(true)}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>+ Create Reel</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reels}
        renderItem={renderReelItem}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={Platform.OS !== 'web'}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#3182ce" 
          />
        }
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: SCREEN_HEIGHT }}>
            <Text style={{ color: '#fff', fontSize: 16 }}>No reels available. Tap + Create Reel to start!</Text>
          </View>
        }
      />

      {/* VIEWERS MODAL */}
      <Modal visible={showViewersModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.commentDrawer, { height: '40%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#edf2f7', paddingBottom: 8 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#2d3748' }}>
                👁️ Viewed By ({currentViewersList.length})
              </Text>
              <TouchableOpacity onPress={() => setShowViewersModal(false)}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#e53e3e', paddingHorizontal: 6 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }}>
              {currentViewersList.map((viewer, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                  <View style={[styles.avatarCircle, { width: 30, height: 30, borderRadius: 15 }]}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>@{viewer[0]}</Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#2d3748', marginLeft: 10 }}>@{viewer}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* COMMENTS MODAL */}
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
              {activeReelId && (commentsMap[activeReelId] || []).map((c, index) => (
                <View key={`${c.id}_${index}`} style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>@{c.user}</Text>
                  <Text style={[{ fontSize: 12, color: '#2d3748' }, isDarkMode && styles.darkText]}>{c.text}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 6, borderTopWidth: 1, borderTopColor: '#edf2f7' }}>
              <TextInput
                style={[styles.commentInput, isDarkMode && { backgroundColor: '#1a202c', color: '#fff', borderColor: '#4a5568' }]}
                placeholder="Add a comment..."
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

      {/* CREATE MODAL */}
      <Modal visible={showCreateModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.commentDrawer, { height: '30%' }, isDarkMode && { backgroundColor: '#2d3748' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#edf2f7', paddingBottom: 8 }}>
              <Text style={[{ fontWeight: 'bold', fontSize: 14, color: '#2d3748' }, isDarkMode && styles.darkText]}>🎬 Create New Reel</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={{ backgroundColor: '#3182ce', padding: 16, borderRadius: 10, alignItems: 'center' }} onPress={handlePickVideo}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#fff' }}>📂 Choose Video from Gallery & Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* EDITOR SUITE MODAL */}
      <Modal visible={showEditorModal} animationType="slide" transparent={false}>
        <View style={styles.editorModalContainer}>
          
          <View style={styles.editorPreviewArea}>
            <Video
              source={{ uri: newReelVideoUri }}
              style={[StyleSheet.absoluteFillObject, getFilterStyle(selectedFilter)]}
              resizeMode={ResizeMode.COVER}
              isLooping
              shouldPlay
              isMuted={audioMode === 'Mute Audio' || selectedSound.includes('Muted') || selectedSound.includes('Mute')}
            />

            <View style={styles.editorTopBar}>
              <TouchableOpacity onPress={() => setShowEditorModal(false)} style={styles.editorCloseBtn}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>✕ Close</Text>
              </TouchableOpacity>
            </View>

            {overlayText ? (
              <View style={styles.floatingTextBadge}>
                <Text style={styles.floatingTextContent}>{overlayText}</Text>
              </View>
            ) : null}

            <View style={styles.editorToolbar}>
              <TouchableOpacity style={styles.editorToolBtn} onPress={() => setShowMusicPickerModal(true)}>
                <Ionicons name="musical-notes" size={20} color="#fff" />
                <Text style={styles.editorToolTxt}>Audio</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.editorToolBtn} onPress={() => Alert.alert('Stickers', 'Add interactive stickers and emojis.')}>
                <Ionicons name="happy-outline" size={20} color="#fff" />
                <Text style={styles.editorToolTxt}>Stickers</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.editorToolBtn} onPress={() => Alert.alert('Text Overlay', 'Type custom on-screen typography.')}>
                <Ionicons name="text-outline" size={20} color="#fff" />
                <Text style={styles.editorToolTxt}>Text</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.editorToolBtn} onPress={() => Alert.alert('Auto Captions', 'Generate synchronized speech captions.')}>
                <Ionicons name="chatbox-ellipses-outline" size={20} color="#fff" />
                <Text style={styles.editorToolTxt}>Captions</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.editorConfigPanel} contentContainerStyle={{ padding: 16 }}>
            <Text style={styles.inputLabel}>🎵 Selected Sound Track</Text>
            <TouchableOpacity 
              style={[styles.editorInputBox, { justifyContent: 'center' }]}
              onPress={() => setShowMusicPickerModal(true)}
            >
              <Text style={{ color: '#fff', fontSize: 12 }}>🎵 {selectedSound}</Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>🎨 Video Color Filter</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {['Normal', 'Cinematic Warm', 'Cyberpunk Neon', 'Matrix Green', 'Vintage Sepia', 'Cool Vibe', 'B&W'].map(filter => (
                <TouchableOpacity 
                  key={filter}
                  style={[styles.chipOption, selectedFilter === filter && styles.chipOptionSelected]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text style={[styles.chipText, selectedFilter === filter && { color: '#fff' }]}>{filter}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>💬 On-Screen Text Overlay</Text>
            <TextInput
              style={styles.editorInputBox}
              placeholder="Type text to display on video..."
              placeholderTextColor="#a0aec0"
              value={overlayText}
              onChangeText={setOverlayText}
            />

            <Text style={styles.inputLabel}>🏷️ Feed Caption & Tags</Text>
            <TextInput
              style={[styles.editorInputBox, { height: 60, textAlignVertical: 'top' }]}
              placeholder="Describe your video..."
              placeholderTextColor="#a0aec0"
              value={newReelTitle}
              onChangeText={setNewReelTitle}
              multiline
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, marginBottom: 30 }}>
              <TouchableOpacity 
                style={[styles.commentSendBtn, { backgroundColor: '#718096', flex: 1, marginRight: 8, paddingVertical: 14 }]}
                onPress={() => setShowEditorModal(false)}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Edit More</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.commentSendBtn, { backgroundColor: '#3182ce', flex: 1, marginLeft: 8, paddingVertical: 14 }]}
                onPress={handlePublishReel}
                disabled={uploading}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  {uploading ? 'Publishing...' : 'Next 🚀'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

        </View>
      </Modal>

      {/* 🌟 GLOBAL MUSIC SEARCH MODAL */}
      <Modal visible={showMusicPickerModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.commentDrawer, { height: '70%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#edf2f7', paddingBottom: 8 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#2d3748' }}>🎵 Search Global Music Library</Text>
              <TouchableOpacity onPress={() => setShowMusicPickerModal(false)}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#e53e3e', paddingHorizontal: 6 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.commentInput, { height: 42, borderRadius: 8, paddingHorizontal: 12, width: '100%', marginBottom: 12 }]}
              placeholder="Type any song or artist worldwide (e.g. Eddy Kenzo, Drake)..."
              placeholderTextColor="#a0aec0"
              value={musicSearchQuery}
              onChangeText={setMusicSearchQuery}
              autoFocus={true}
            />

            <ScrollView style={{ flex: 1 }}>
              <TouchableOpacity 
                style={styles.musicRowItem}
                onPress={() => {
                  setSelectedSound('Original Creator Audio 🎵');
                  setAudioMode('Keep Original');
                  setShowMusicPickerModal(false);
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#3182ce' }}>🎙️ Keep Original Video Audio</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.musicRowItem}
                onPress={() => {
                  setSelectedSound('Muted (No Audio) 🔇');
                  setAudioMode('Mute Audio');
                  setShowMusicPickerModal(false);
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#e53e3e' }}>🔇 Mute Original Audio</Text>
              </TouchableOpacity>

              {isSearchingMusic && (
                <Text style={{ textAlign: 'center', color: '#718096', paddingVertical: 15, fontSize: 12 }}>
                  Searching global music database... 🔍
                </Text>
              )}

              {!isSearchingMusic && searchedMusicResults.map((track) => (
                <TouchableOpacity 
                  key={track.id}
                  style={styles.musicRowItem}
                  onPress={() => {
                    setSelectedSound(`${track.title} - ${track.artist} 🎵`);
                    setAudioMode('Keep Original');
                    setShowMusicPickerModal(false);
                  }}
                >
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#2d3748' }} numberOfLines={1}>🎵 {track.title}</Text>
                    <Text style={{ fontSize: 10, color: '#718096' }} numberOfLines={1}>Artist: {track.artist}</Text>
                  </View>
                  <Ionicons name="add-circle" size={24} color="#3182ce" />
                </TouchableOpacity>
              ))}

              {!isSearchingMusic && searchedMusicResults.length === 0 && musicSearchQuery.trim().length > 0 && (
                <Text style={{ textAlign: 'center', color: '#718096', paddingVertical: 20, fontSize: 12 }}>
                  No songs found for "{musicSearchQuery}". Try another artist or title!
                </Text>
              )}
            </ScrollView>
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
  reelContainer: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, backgroundColor: '#000', position: 'relative', justifyContent: 'center', alignItems: 'center' },
  darkGradientOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 260, backgroundColor: 'rgba(0,0,0,0.25)', zIndex: 10 },
  floatingHeartCenter: { position: 'absolute', top: '45%', left: '42%', zIndex: 100, pointerEvents: 'none' },
  floatingPauseCenter: { position: 'absolute', top: '45%', left: '44%', zIndex: 100, pointerEvents: 'none', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 35, width: 65, height: 65, justifyContent: 'center', alignItems: 'center' },
  floatingTextBadge: { position: 'absolute', top: '22%', alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, zIndex: 25 },
  floatingTextContent: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', textShadowColor: '#000', textShadowRadius: 3 },
  overlayContainer: { position: 'absolute', bottom: 120, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 20 },
  leftInfoBox: { flex: 1, marginRight: 15 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  avatarCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  authorText: { color: '#fff', fontWeight: 'bold', fontSize: 13, marginRight: 10, textShadowColor: '#000', textShadowRadius: 2 },
  followBadge: { borderWidth: 1, borderColor: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)' },
  titleText: { color: '#fff', fontSize: 12, lineHeight: 16, textShadowColor: '#000', textShadowRadius: 2 },
  soundText: { color: '#fff', fontSize: 11, marginLeft: 6, textShadowColor: '#000', textShadowRadius: 2 },
  rightSidebar: { alignItems: 'center', gap: 10, marginBottom: 15 },
  actionIconButton: { alignItems: 'center', paddingVertical: 1 },
  actionCountText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginTop: 1, textShadowColor: '#000', textShadowRadius: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  commentDrawer: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, height: '55%', padding: 16 },
  commentInput: { flex: 1, backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 20, paddingHorizontal: 15, height: 38, fontSize: 12, color: '#2d3748', marginRight: 8 },
  commentSendBtn: { backgroundColor: '#3182ce', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  darkText: { color: '#fff' },
  inputLabel: { fontSize: 11, fontWeight: 'bold', color: '#718096', marginBottom: 6, marginTop: 10 },
  chipOption: { backgroundColor: '#edf2f7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginRight: 6, borderWidth: 1, borderColor: '#cbd5e0' },
  chipOptionSelected: { backgroundColor: '#3182ce', borderColor: '#3182ce' },
  chipText: { fontSize: 10, fontWeight: 'bold', color: '#4a5568' },
  editorModalContainer: { flex: 1, backgroundColor: '#0f172a' },
  editorPreviewArea: { flex: 1.2, backgroundColor: '#000', position: 'relative', overflow: 'hidden' },
  editorTopBar: { position: 'absolute', top: 40, left: 16, zIndex: 30 },
  editorCloseBtn: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  editorToolbar: { position: 'absolute', right: 12, top: 80, gap: 14, zIndex: 30 },
  editorToolBtn: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', width: 44, height: 44, borderRadius: 22, justifyContent: 'center' },
  editorToolTxt: { color: '#fff', fontSize: 9, fontWeight: 'bold', marginTop: 2 },
  editorConfigPanel: { flex: 1, backgroundColor: '#1e293b', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  editorInputBox: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingHorizontal: 12, height: 40, fontSize: 12, color: '#fff', marginBottom: 10, justifyContent: 'center' },
  musicRowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#edf2f7' }
});