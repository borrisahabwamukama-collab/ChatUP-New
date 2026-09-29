import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Video } from 'expo-av';
import { supabase } from '../../Services/supabaseClient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PeerProfileModal({ visible, onClose, peerUserId, currentUserId, isDarkMode }) {
  const [loading, setLoading] = useState(true);
  const [peerData, setPeerData] = useState(null);
  const [peerUploads, setPeerUploads] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('All'); // 'All', 'Reels', 'Photos'
  const [likedUploadIds, setLikedUploadIds] = useState(new Set());
  const [profileLikes, setProfileLikes] = useState(0);

  // Video playback refs mapping
  const videoRefs = useRef({});

  useEffect(() => {
    if (visible && peerUserId) {
      fetchPeerProfile();
    }
  }, [visible, peerUserId]);

  const fetchPeerProfile = async () => {
    try {
      setLoading(true);

      // 1. Fetch peer's public profile info (checking both total_likes and likes_received)
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', peerUserId)
        .maybeSingle();

      if (profileErr) throw profileErr;
      setPeerData(profile || {});
      setProfileLikes(profile?.total_likes || profile?.likes_received || 0);

      // 2. Fetch accurate follower & following counts
      const { count: fCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', peerUserId);

      const { count: fgCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', peerUserId);

      setFollowersCount(fCount || 0);
      setFollowingCount(fgCount || 0);

      if (currentUserId) {
        const { data: followCheck } = await supabase
          .from('followers')
          .select('*')
          .eq('follower_id', currentUserId)
          .eq('following_id', peerUserId)
          .maybeSingle();

        setIsFollowing(!!followCheck);
      }

      // 3. Fetch peer's public video uploads from discovery_feed_items
      const { data: postsData, error: postsErr } = await supabase
        .from('discovery_feed_items')
        .select('*')
        .eq('user_id', peerUserId)
        .order('created_at', { ascending: false });

      if (!postsErr && postsData) {
        setPeerUploads(postsData);
      } else {
        setPeerUploads([]);
      }

    } catch (err) {
      console.warn('Error fetching peer profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🌟 DYNAMICALLY CALCULATE TOTAL LIKES ACROSS ALL TIMELINE PUBLICATIONS
  const calculatedTotalLikes = peerUploads.reduce((sum, post) => sum + (post.likes || 0), 0) + profileLikes;

  const handleToggleFollow = async () => {
    if (!currentUserId || !peerUserId) return;
    try {
      if (isFollowing) {
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', peerUserId);
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await supabase
          .from('followers')
          .insert([{ follower_id: currentUserId, following_id: peerUserId }]);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not update follow status.');
    }
  };

  // 🌟 FIXED: Direct robust profile like increment handling Supabase update seamlessly
  const handleLikePeerProfile = async () => {
    if (!peerUserId || isLiking) return;
    setIsLiking(true);

    try {
      const newLikesCount = profileLikes + 1;
      setProfileLikes(newLikesCount);

      // Attempt updating Supabase table directly
      const { error } = await supabase
        .from('profiles')
        .update({ total_likes: newLikesCount })
        .eq('user_id', peerUserId);

      if (error) {
        // Fallback try updating using 'likes_received' column if total_likes failed
        await supabase
          .from('profiles')
          .update({ likes_received: newLikesCount })
          .eq('user_id', peerUserId);
      }

      // Trigger notification to profile owner
      if (currentUserId && currentUserId !== peerUserId) {
        const { data: { session } } = await supabase.auth.getSession();
        const likerName = session?.user?.user_metadata?.full_name || 'Someone';
        await supabase.from('notifications').insert([
          {
            user_id: peerUserId,
            title: 'Profile Liked ❤️',
            body: `${likerName} liked your creator profile!`,
            type: 'like',
            created_at: new Date().toISOString()
          }
        ]);
      }

      Alert.alert('Profile Liked ❤️', 'You have successfully supported this creator profile.');
    } catch (err) {
      console.log('Profile like error:', err.message);
    } finally {
      setIsLiking(false);
    }
  };

  const handleLikeUpload = async (uploadItem) => {
    if (likedUploadIds.has(uploadItem.id)) {
      Alert.alert('Notice', 'You already liked this post.');
      return;
    }
    const updatedLikes = (uploadItem.likes || 0) + 1;
    setLikedUploadIds(prev => new Set(prev).add(uploadItem.id));
    setPeerUploads(prev => prev.map(item => item.id === uploadItem.id ? { ...item, likes: updatedLikes } : item));
    
    try {
      await supabase.from('discovery_feed_items').update({ likes: updatedLikes }).eq('id', uploadItem.id);
    } catch (err) {}
  };

  const filteredUploads = peerUploads.filter(item => {
    const isVideo = item.videoUrl?.endsWith('.mp4') || item.videoUrl?.includes('mov_bbb');
    const isPhoto = !isVideo;
    if (activeProfileTab === 'Reels') return isVideo;
    if (activeProfileTab === 'Photos') return isPhoto;
    return true; // 'All'
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalContent, isDarkMode && styles.darkCard]} onPress={(e) => e.stopPropagation()}>
          
          {/* Modal Header Bar */}
          <View style={styles.headerRow}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>Public Profile</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#3182ce" />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              
              {/* Avatar & Names */}
              <View style={styles.profileHeaderCenter}>
                <View style={styles.avatarContainer}>
                  {peerData?.avatar_url ? (
                    <Image source={{ uri: peerData.avatar_url }} style={styles.avatarImage} />
                  ) : (
                    <Text style={{ fontSize: 45 }}>🧑‍💻</Text>
                  )}
                </View>
                <Text style={[styles.userName, isDarkMode && styles.darkText]}>
                  {peerData?.full_name || peerData?.username || 'ChatUp User'}
                </Text>
                <Text style={styles.userHandle}>
                  @{peerData?.username || peerData?.full_name?.toLowerCase().replace(/\s+/g, '') || 'user'}
                </Text>
                <Text style={styles.userCountry}>📍 {peerData?.country || 'Uganda'}</Text>
              </View>

              {/* Public Stats Bar (Followers, Following, Dynamic Total Likes, Uploads) */}
              <View style={[styles.statsContainer, isDarkMode && styles.darkStatsContainer]}>
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, isDarkMode && styles.darkText]}>{followersCount}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, isDarkMode && styles.darkText]}>{followingCount}</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, isDarkMode && styles.darkText]}>{calculatedTotalLikes}</Text>
                  <Text style={styles.statLabel}>Total Likes</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, isDarkMode && styles.darkText]}>{peerUploads.length}</Text>
                  <Text style={styles.statLabel}>Uploads</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonRow}>
                {currentUserId && peerUserId === currentUserId ? (
                  <TouchableOpacity 
                    style={[styles.followBtn, { backgroundColor: '#4a5568' }]} 
                    onPress={() => {
                      Alert.alert('Edit Profile ✏️', 'Profile settings and bio updates.');
                    }}
                  >
                    <Text style={styles.followBtnText}>✏️ Edit Profile</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.followBtn, isFollowing && styles.followingBtn]} 
                    onPress={handleToggleFollow}
                  >
                    <Text style={styles.followBtnText}>{isFollowing ? 'Following ✓' : 'Follow +'} </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={[styles.likeProfileBtn, isLiking && { opacity: 0.6 }]} 
                  onPress={handleLikePeerProfile}
                  disabled={isLiking}
                >
                  <Text style={styles.likeProfileBtnText}>❤️ Like Profile</Text>
                </TouchableOpacity>
              </View>

              {/* Bio & Hobbies Card */}
              <View style={[styles.sectionCard, isDarkMode && styles.darkSectionCard]}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Bio & Description</Text>
                <Text style={styles.sectionBody}>{peerData?.bio || 'No bio provided yet.'}</Text>

                <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginTop: 10 }]}>Hobbies & Interests</Text>
                <Text style={styles.sectionBody}>{peerData?.hobbies || 'Adventure, Tech & Media.'}</Text>
              </View>

              {/* Facebook-style Content Sub-Tabs (All / Reels / Photos) */}
              <View style={styles.profileTabsRow}>
                {['All', 'Reels', 'Photos'].map(tab => (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.profileTabBtn, activeProfileTab === tab && styles.activeProfileTabBtn]}
                    onPress={() => setActiveProfileTab(tab)}
                  >
                    <Text style={[styles.profileTabBtnText, activeProfileTab === tab && styles.activeProfileTabBtnText]}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Peer's Interactive Timeline Uploads & Feed Posts */}
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.darkText, { marginBottom: 10 }]}>
                  🎥 Timeline Publications ({filteredUploads.length})
                </Text>

                {filteredUploads.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyUploadsText}>No publications found under "{activeProfileTab}".</Text>
                  </View>
                ) : (
                  filteredUploads.map((upload) => {
                    const isVideo = upload.videoUrl?.endsWith('.mp4') || upload.videoUrl?.includes('mov_bbb');
                    return (
                      <View key={upload.id} style={[styles.postCard, isDarkMode && styles.darkSectionCard]}>
                        
                        {/* Post Author Header */}
                        <View style={styles.postHeader}>
                          <Image source={{ uri: peerData?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }} style={styles.postAvatar} />
                          <View>
                            <Text style={[styles.postAuthorName, isDarkMode && styles.darkText]}>{peerData?.full_name || 'Creator'}</Text>
                            <Text style={styles.postTimeText}>{new Date(upload.created_at).toLocaleDateString()} • 📍 {upload.location || 'Kampala, UG'}</Text>
                          </View>
                        </View>

                        {/* Caption */}
                        <Text style={[styles.postCaption, isDarkMode && styles.darkText]}>{upload.caption}</Text>

                        {/* Media Container */}
                        <View style={styles.mediaContainer}>
                          {isVideo ? (
                            <Video
                              ref={ref => (videoRefs.current[upload.id] = ref)}
                              source={{ uri: upload.videoUrl }}
                              style={styles.mediaPlayer}
                              resizeMode="cover"
                              isLooping
                              shouldPlay={false}
                              useNativeControls
                            />
                          ) : (
                            <Image source={{ uri: upload.videoUrl }} style={styles.mediaPlayer} resizeMode="cover" />
                          )}
                        </View>

                        {/* Post Engagement Footer */}
                        <View style={styles.postFooterBar}>
                          <TouchableOpacity 
                            style={styles.engagementBtn} 
                            onPress={() => handleLikeUpload(upload)}
                          >
                            <Text style={styles.engagementText}>❤️ {upload.likes || 0} Likes</Text>
                          </TouchableOpacity>
                          <Text style={styles.engagementText}>💬 {upload.comments?.length || 0} Comments</Text>
                          <Text style={styles.engagementText}>🔄 {upload.shares || 0} Shares</Text>
                        </View>

                      </View>
                    );
                  })
                )}
              </View>

            </ScrollView>
          )}

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: '90%' },
  darkCard: { backgroundColor: '#1a202c' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 14, fontWeight: 'bold', color: '#2d3748' },
  darkText: { color: '#fff' },
  closeText: { fontSize: 18, fontWeight: 'bold', color: '#718096' },
  loaderContainer: { paddingVertical: 50, alignItems: 'center' },
  profileHeaderCenter: { alignItems: 'center', marginBottom: 12 },
  avatarContainer: { width: 85, height: 85, borderRadius: 42.5, backgroundColor: '#ebf8ff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#3182ce', overflow: 'hidden', marginBottom: 8 },
  avatarImage: { width: 85, height: 85, borderRadius: 42.5 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  userHandle: { fontSize: 12, color: '#718096', marginTop: 2 },
  userCountry: { fontSize: 11, color: '#4a5568', marginTop: 3 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#f7fafc', borderRadius: 12, paddingVertical: 10, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  darkStatsContainer: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  statBox: { alignItems: 'center' },
  statNum: { fontSize: 14, fontWeight: 'bold', color: '#2d3748' },
  statLabel: { fontSize: 10, color: '#718096', marginTop: 2 },
  actionButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  followBtn: { flex: 1, backgroundColor: '#3182ce', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginRight: 6 },
  followingBtn: { backgroundColor: '#718096' },
  followBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  likeProfileBtn: { flex: 1, backgroundColor: '#fff5f5', borderWidth: 1, borderColor: '#feb2b2', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginLeft: 6 },
  likeProfileBtnText: { color: '#e53e3e', fontSize: 12, fontWeight: 'bold' },
  sectionCard: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  darkSectionCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#2d3748', marginBottom: 4 },
  sectionBody: { fontSize: 11, color: '#4a5568', lineHeight: 16 },
  profileTabsRow: { flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 8, marginBottom: 12 },
  profileTabBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16 },
  activeProfileTabBtn: { backgroundColor: '#ebf8ff' },
  profileTabBtnText: { fontSize: 12, fontWeight: 'bold', color: '#718096' },
  activeProfileTabBtnText: { color: '#3182ce' },
  emptyContainer: { padding: 20, alignItems: 'center' },
  emptyUploadsText: { fontSize: 11, color: '#718096', fontStyle: 'italic' },
  postCard: { backgroundColor: '#fdfdfe', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12, padding: 10, overflow: 'hidden' },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  postAvatar: { width: 34, height: 34, borderRadius: 17, marginRight: 8 },
  postAuthorName: { fontSize: 12, fontWeight: 'bold', color: '#2d3748' },
  postTimeText: { fontSize: 10, color: '#718096' },
  postCaption: { fontSize: 12, color: '#2d3748', marginBottom: 8, lineHeight: 16 },
  mediaContainer: { width: '100%', height: 260, backgroundColor: '#000', borderRadius: 8, overflow: 'hidden', marginBottom: 8 },
  mediaPlayer: { width: '100%', height: '100%' },
  postFooterBar: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 6, borderTopWidth: 1, borderTopColor: '#edf2f7' },
  engagementBtn: { flexDirection: 'row', alignItems: 'center' },
  engagementText: { fontSize: 11, color: '#4a5568', fontWeight: '600' }
});