import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Animated,
  Platform,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { supabase } from '../../Services/supabaseClient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Enhanced dynamic human-readable time formatting helper
function getTimeAgo(dateString) {
  if (!dateString) return 'Just now';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Just now';

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Smart dynamic duration fallback for hardcoded or missing entries
function getDisplayDuration(dur, id) {
  if (!dur || dur === '2:30') {
    const hash = (id || '').toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mins = hash % 3; 
    const secs = (hash * 7) % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return dur;
}

// Helper to check if a media URL is an image or video
function isImageUrl(url) {
  if (!url) return false;
  return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || url.startsWith('data:image') || (url.includes('image') && !url.includes('video'));
}

export default function DiscoveryFeedList({
  isDarkMode,
  discoveryTab,
  filteredFeed,
  categories,
  selectedCategory,
  setSelectedCategory,
  geofenceRadius,
  setGeofenceRadius,
  stories,
  radarNodes,
  officialChannels,
  savedVaultItems,
  activeVideoIndex,
  setActiveVideoIndex, // 🚀 Added to sync parent scroll state smoothly
  likedPostIds,
  handleLikePost,
  handleDoubleTapLike,
  handleLongPressMedia,
  handleOpenFullScreen,
  handleOpenComments,
  handleOpenForwardModal,
  handleOpenTipModal,
  setPostSettingsModalVisible,
  setSelectedPost,
  heartScale,
  setSearchQuery,
  onPressCreator,
  currentLoggedInUserId,
}) {
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [followedCreators, setFollowedCreators] = useState(new Set());
  const viewedItemsRef = useRef(new Set());

  // 🌟 Record and accumulate views when posts appear on screen with deep console debugging
  useEffect(() => {
    const currentActiveItem = filteredFeed[activeVideoIndex];
    if (currentActiveItem && currentActiveItem.id) {
      const viewKey = `${currentActiveItem.id}_${activeVideoIndex}`;
      if (!viewedItemsRef.current.has(viewKey)) {
        viewedItemsRef.current.add(viewKey);
        recordDiscoveryView(currentActiveItem);
      }
    }
  }, [activeVideoIndex, filteredFeed]);

  const recordDiscoveryView = async (item) => {
    try {
      if (!supabase || !item.id) return;
      const currentViews = parseInt(item.views, 10) || 0;
      const updatedViews = currentViews + 1;

      console.log(`📈 Attempting view increment for Post ID: ${item.id} | Current Views: ${currentViews} -> New: ${updatedViews}`);

      const { data, error } = await supabase
        .from('discovery_feed_items')
        .update({ views: updatedViews })
        .eq('id', item.id)
        .select();

      if (error) {
        console.log('❌ Supabase View Update Error:', error.message);
      } else {
        console.log('✅ Supabase View Successfully Updated!', data);
        item.views = updatedViews;
      }
    } catch (err) {
      console.log('Exception in recordDiscoveryView:', err.message);
    }
  };

  const triggerFloatingReaction = (emoji) => {
    const newReaction = { id: Date.now().toString() + Math.random(), emoji };
    setFloatingEmojis(prev => [...prev, newReaction]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(item => item.id !== newReaction.id));
    }, 1500);
  };

  const toggleFollowCreator = (authorKey) => {
    setFollowedCreators(prev => {
      const next = new Set(prev);
      if (next.has(authorKey)) {
        next.delete(authorKey);
      } else {
        next.add(authorKey);
      }
      return new Set(next);
    });
  };

  // 🚀 Facebook-grade viewability tracker for high-performance auto-play & view increments
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0 && setActiveVideoIndex) {
      const visibleIndex = viewableItems[0].index;
      if (visibleIndex !== null && visibleIndex !== undefined) {
        setActiveVideoIndex(visibleIndex);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  // 🚀 Render individual high-performance feed card item
  const renderFeedCard = useCallback(({ item, index }) => {
    const isCurrentVideoActive = activeVideoIndex === index;
    const hasImage = isImageUrl(item.videoUrl);
    const creatorKey = item.user_id || item.author;
    const isFollowing = followedCreators.has(creatorKey);
    const isMyPost = (item.user_id && currentLoggedInUserId && item.user_id === currentLoggedInUserId) || 
                     (item.author && item.author.toLowerCase().includes('borris'));

    return (
      <View style={[styles.postCard, isDarkMode && styles.darkCard]}>
        
        {/* Card Header & Banners */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
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
          </View>
          <TouchableOpacity 
            style={{ marginLeft: 'auto', padding: 4 }} 
            onPress={() => { setSelectedPost(item); setPostSettingsModalVisible(true); }}
          >
            <Text style={{ fontSize: 16 }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Interactive Creator Profile Header */}
        <View style={styles.postHeaderRow}>
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            onPress={() => onPressCreator && onPressCreator(item.author, item.author_avatar, item)}
          >
            <Image 
              source={{ uri: item.author_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }} 
              style={styles.creatorAvatarImage} 
            />
            
            <View style={{ marginLeft: 8, flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.postAuthor, { textDecorationLine: 'underline', marginRight: 8 }]}>{item.author || 'Creator'}</Text>
                
                {!isMyPost && (
                  <TouchableOpacity 
                    style={[styles.miniFollowBtn, isFollowing && styles.miniFollowingBtn]}
                    onPress={() => toggleFollowCreator(creatorKey)}
                  >
                    <Text style={[styles.miniFollowText, isFollowing && { color: '#3182ce' }]}>{isFollowing ? '✓ Following' : '+ Follow'}</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, flexWrap: 'wrap' }}>
                <Text style={{ fontSize: 9, color: '#a0aec0', marginRight: 6 }}>📍 {item.location} ({item.distanceKm} km away)</Text>
                <Text style={{ fontSize: 9, color: '#d69e2e', fontWeight: 'bold' }}>• ⏱️ {getTimeAgo(item.created_at || item.timestamp)}</Text>
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.vibeBadge}>[{item.vibe}]</Text>
        </View>

        {/* MEDIA CONTAINER */}
        <Pressable 
          style={styles.mediaContainerCenter}
          onPress={() => handleDoubleTapLike(item)}
          onLongPress={() => handleLongPressMedia(item)}
        >
          {hasImage ? (
            <Image 
              source={{ uri: item.videoUrl }} 
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }} 
            />
          ) : Platform.OS === 'web' ? (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <video 
                src={item.videoUrl} 
                controls 
                autoPlay={isCurrentVideoActive}
                muted={!isCurrentVideoActive}
                playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
          ) : (
            <Video
              source={{ uri: item.videoUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode={ResizeMode.COVER}
              isLooping
              useNativeControls
              shouldPlay={isCurrentVideoActive}
            />
          )}
          
          {/* Floating Reaction Emojis Burst */}
          {floatingEmojis.map(fe => (
            <View key={fe.id} style={styles.floatingEmojiItem}>
              <Text style={{ fontSize: 32 }}>{fe.emoji}</Text>
            </View>
          ))}

          <Animated.View style={[styles.heartPopContainer, { transform: [{ scale: heartScale }] }]}>
            <Text style={{ fontSize: 60 }}>❤️</Text>
          </Animated.View>

          <View style={styles.mediaOverlayTop}>
            <View style={styles.badgePill}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                {hasImage ? '📷 Photo Post' : `▶ ${getDisplayDuration(item.duration, item.id)}`}
              </Text>
            </View>
            <View style={[styles.badgePill, { backgroundColor: 'rgba(49,130,206,0.85)', marginLeft: 4 }]}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>👁️ {parseInt(item.views, 10) || 0}</Text>
            </View>
          </View>

          {/* Quick Floating Reaction Bar Inside Media */}
          <View style={styles.mediaQuickReactBar}>
            {['🔥', '🐘', '🚀', '💎'].map(emoji => (
              <TouchableOpacity key={emoji} style={styles.quickEmojiBtn} onPress={() => triggerFloatingReaction(emoji)}>
                <Text style={{ fontSize: 16 }}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.expandButton} onPress={() => handleOpenFullScreen(item)}>
            <Text style={{ fontSize: 11, color: '#fff', fontWeight: 'bold' }}>🔍 Theater View</Text>
          </TouchableOpacity>
        </Pressable>

        {/* Caption */}
        <View style={{ marginBottom: 10 }}>
          <View style={styles.aiMatchBadge}>
            <Text style={{ fontSize: 9, color: '#2b6cb0', fontWeight: 'bold' }}>✨ Optimized for your {item.category} & {geofenceRadius}km radius interest</Text>
          </View>
          <Text style={[styles.postCaption, isDarkMode && styles.darkText]} numberOfLines={3}>
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
        </View>

        {/* Footer */}
        <View style={styles.postFooter}>
          <TouchableOpacity style={styles.footerAction} onPress={() => handleLikePost(item)}>
            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>❤️ {item.likes} {likedPostIds.has(item.id) ? '(Liked)' : ''}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerAction} onPress={() => handleOpenComments(item)}>
            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>💬 {item.comments?.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0) || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerAction} onPress={() => handleOpenForwardModal(item)}>
            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>🔄 {item.shares}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.footerAction, { backgroundColor: '#ebf8ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }]} onPress={() => handleOpenTipModal(item)}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2b6cb0' }}>🎁 Tip Creator</Text>
          </TouchableOpacity>
        </View>

      </View>
    );
  }, [activeVideoIndex, isDarkMode, geofenceRadius, likedPostIds, followedCreators, floatingEmojis]);

  return (
    <View style={styles.centerFeed}>
      {/* Geofencing Radius Selector Bar */}
      <View style={[styles.geofenceControlBar, isDarkMode && styles.darkCard]}>
        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#3182ce' }}>📍 Geofence Radius Filter: {geofenceRadius} km</Text>
        <View style={{ flexDirection: 'row', marginTop: 6 }}>
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

      {discoveryTab === 'Vault' ? (
        <View>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>⭐ Your Saved Offline Collections Vault</Text>
          {savedVaultItems.length > 0 ? (
            savedVaultItems.map(item => (
              <View key={item.id} style={[styles.postCard, isDarkMode && styles.darkCard]}>
                <Text style={[styles.postAuthor, { fontSize: 13 }]}>{item.author}</Text>
                <Text style={[styles.postCaption, isDarkMode && styles.darkText]} numberOfLines={2}>{item.caption}</Text>
                {isImageUrl(item.videoUrl) ? (
                  <Image source={{ uri: item.videoUrl }} style={{ height: 420, width: '100%', borderRadius: 12, resizeMode: 'cover' }} />
                ) : Platform.OS === 'web' ? (
                  <div style={{ width: '100%', height: 420, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden' }}>
                    <video src={item.videoUrl} controls playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <Video
                    source={{ uri: item.videoUrl }}
                    style={{ height: 420, width: '100%', borderRadius: 12 }}
                    resizeMode={ResizeMode.COVER}
                    useNativeControls
                    shouldPlay={false}
                  />
                )}
              </View>
            ))
          ) : (
            <Text style={{ fontSize: 12, color: '#718096', textAlign: 'center', padding: 40 }}>Your vault is empty. Long-press any media and select "Save to Offline Vault".</Text>
          )}
        </View>
      ) : discoveryTab === 'Radar' ? (
        <View>
          <View style={styles.radarCardActive}>
            <Text style={styles.radarTitle}>📡 Discovery Vibe Radar Active (3km Radius)</Text>
            <Text style={styles.radarDesc}>Detecting nearby tour guides and peer mesh nodes.</Text>
          </View>
          {radarNodes.map(node => (
            <View key={node.id} style={[styles.postCard, isDarkMode && styles.darkCard]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={[styles.postAuthor, { fontSize: 13 }]}>{node.name}</Text>
                  <Text style={{ fontSize: 11, color: '#38a169', fontWeight: 'bold' }}>{node.status}</Text>
                  <Text style={{ fontSize: 10, color: '#718096' }}>{node.distance} • {node.signal}</Text>
                </View>
                <TouchableOpacity style={styles.connectRadarBtn} onPress={() => {}}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Connect 🤝</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : discoveryTab === 'Channels' ? (
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
                <TouchableOpacity style={styles.connectRadarBtn} onPress={() => {}}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Tune In 📺</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : discoveryTab === 'LiveMap' ? (
        <View style={[styles.postCard, isDarkMode && styles.darkCard, { alignItems: 'center', padding: 30 }]}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>🗺️🛰️</Text>
          <Text style={[styles.postAuthor, { fontSize: 16, marginBottom: 6 }]}>Uganda National Tour & Geofenced Map</Text>
          <Text style={{ fontSize: 12, color: '#718096', textAlign: 'center', marginBottom: 14 }}>
            Active conservation and tour tracking across Bwindi, Queen Elizabeth, and Kampala city nodes.
          </Text>
          <TouchableOpacity style={styles.connectRadarBtn} onPress={() => {}}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Refresh GPS Clusters 🔄</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {/* Stories */}
          <View style={[styles.storyCard, isDarkMode && styles.darkCard]}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>⚡ Geofenced Story Rings & Expeditions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storyScroll}>
              {stories.map(story => (
                <TouchableOpacity key={story.id} style={styles.storyRingContainer} onPress={() => {}}>
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
            {discoveryTab === 'Tours' ? '🦁 Featured African Wildlife & Cultural Tours' : '🔥 Smart Feed (Within Radius)'}
          </Text>

          {/* 🚀 HIGH-PERFORMANCE VIRTUALIZED FLATLIST FOR FACEBOOK-GRADE SMOOTHNESS */}
          <FlatList
            data={filteredFeed}
            renderItem={renderFeedCard}
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            windowSize={5}
            removeClippedSubviews={Platform.OS !== 'web'}
            updateCellsBatchingPeriod={50}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            scrollEnabled={false} // Managed by parent ScrollView in DiscoveryWalletScreen
            ListEmptyComponent={
              <Text style={{ fontSize: 12, color: '#718096', textAlign: 'center', padding: 30 }}>
                No tours or posts found within this {geofenceRadius}km radius.
              </Text>
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerFeed: { width: '100%' },
  geofenceControlBar: { backgroundColor: '#ebf8ff', borderWidth: 1, borderColor: '#bee3f8', borderRadius: 10, padding: 10, marginBottom: 14 },
  radiusPill: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 6, borderWidth: 1, borderColor: '#cbd5e0' },
  activeRadiusPill: { backgroundColor: '#3182ce', borderColor: '#3182ce' },
  radiusPillText: { fontSize: 10, fontWeight: 'bold', color: '#4a5568' },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#4a5568', marginBottom: 10 },
  darkText: { color: '#fff' },
  postCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  postAuthor: { fontSize: 13, fontWeight: 'bold', color: '#3182ce' },
  postCaption: { fontSize: 12, color: '#2d3748', lineHeight: 17 },
  radarCardActive: { backgroundColor: '#ebf8ff', borderWidth: 1, borderColor: '#bee3f8', borderRadius: 12, padding: 14, marginBottom: 12 },
  radarTitle: { fontSize: 12, fontWeight: 'bold', color: '#2b6cb0', marginBottom: 4 },
  radarDesc: { fontSize: 10, color: '#4a5568' },
  connectRadarBtn: { backgroundColor: '#3182ce', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginTop: 4 },
  storyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  storyScroll: { flexDirection: 'row' },
  storyRingContainer: { alignItems: 'center', marginRight: 12, width: 55 },
  storyRing: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#3182ce', justifyContent: 'center', alignItems: 'center' },
  storyAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#ebf8ff', justifyContent: 'center', alignItems: 'center' },
  storyAvatarText: { fontWeight: 'bold', color: '#2b6cb0', fontSize: 14 },
  storyName: { fontSize: 9, color: '#4a5568', marginTop: 3, textAlign: 'center' },
  filterPill: { backgroundColor: '#edf2f7', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginRight: 6 },
  activeFilterPill: { backgroundColor: '#3182ce' },
  filterPillText: { fontSize: 11, fontWeight: 'bold', color: '#4a5568' },
  pinnedBanner: { backgroundColor: '#fffaf0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1, borderColor: '#feebc8' },
  boostedBanner: { backgroundColor: '#ebf8ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1, borderColor: '#bee3f8' },
  postHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, marginTop: 4, alignItems: 'center' },
  vibeBadge: { fontSize: 10, fontStyle: 'italic', color: '#a0aec0', fontWeight: 'bold' },
  creatorAvatarImage: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#bee3f8', backgroundColor: '#edf2f7' },
  miniFollowBtn: { backgroundColor: '#3182ce', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  miniFollowingBtn: { backgroundColor: '#edf2f7', borderWidth: 1, borderColor: '#cbd5e0' },
  miniFollowText: { fontSize: 9, fontWeight: 'bold', color: '#fff' },
  mediaContainerCenter: { height: 440, width: '100%', backgroundColor: '#000', borderRadius: 12, overflow: 'hidden', position: 'relative', marginBottom: 8, justifyContent: 'center', alignItems: 'center' },
  heartPopContainer: { position: 'absolute', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  mediaOverlayTop: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgePill: { backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  mediaQuickReactBar: { position: 'absolute', right: 10, bottom: 50, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 4, gap: 6, alignItems: 'center', zIndex: 5 },
  quickEmojiBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  floatingEmojiItem: { position: 'absolute', bottom: 80, alignSelf: 'center', zIndex: 15 },
  aiMatchBadge: { backgroundColor: '#ebf8ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#bee3f8' },
  expandButton: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, zIndex: 5 },
  postFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#edf2f7', paddingTop: 10, alignItems: 'center' },
  footerAction: { flexDirection: 'row', alignItems: 'center' },
});