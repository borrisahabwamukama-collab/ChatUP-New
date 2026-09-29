import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
  TextInput
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../Services/supabaseClient';

// Import Modular Components & Modals
import ProfileHeader from './ProfileHeader';
import SettingsTab from './SettingsTab';
import EditProfileSection from './EditProfileSection';
import ProfileTabs from './ProfileTabs';
import QrModal from './QrModal';
import SecurityModal from './SecurityModal';

// Optional helper for binary decoding if needed for storage uploads
const decode = (base64) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Number Formatting Helper for Cleaner UI (e.g., 10.5k, 1.2m)
const formatCount = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num?.toLocaleString() || '0';
};

export default function ProfileScreen({ isDarkMode, currentUser, onLogout, navigation }) {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('Borris');
  const [handle, setHandle] = useState('@Borris');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  
  const [country, setCountry] = useState('Uganda');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [bio, setBio] = useState('Creator on ChatUp');
  
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [totalLikesReceived, setTotalLikesReceived] = useState(0);
  const [userReels, setUserReels] = useState([]);

  // Lists for Followers & Following Modals
  const [followersUsersList, setFollowersUsersList] = useState([]);
  const [followingUsersList, setFollowingUsersList] = useState([]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [avatarUri, setAvatarUri] = useState(null);
  const [avatarEmoji, setAvatarEmoji] = useState('🧑‍💻');
  
  const [showAvatarPreviewModal, setShowAvatarPreviewModal] = useState(false);
  const [showPhoneChangeModal, setShowPhoneChangeModal] = useState(false);
  const [showSeedPhraseModal, setShowSeedPhraseModal] = useState(false);
  const [recoverySeedPhrase] = useState('nature timber swift digital kampala router beacon mesh anchor delta vertex shield');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryInputKey, setRecoveryInputKey] = useState('');

  const [hidePhoneNumber, setHidePhoneNumber] = useState(true);
  const [hideDob, setHideDob] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [encryptionProtocol, setEncryptionProtocol] = useState('Signal Double Ratchet (E2EE)');
  const [showEncryptionPicker, setShowEncryptionPicker] = useState(false);
  const [tipJarEnabled, setTipJarEnabled] = useState(true);
  const [aiAssistantAutoReply, setAiAssistantAutoReply] = useState(true);
  const [bluetoothBeaconActive, setBluetoothBeaconActive] = useState(true);
  const [messagePermission, setMessagePermission] = useState('Followers Only');
  const [showPermissionPicker, setShowPermissionPicker] = useState(false);

  const [lastUsernameChange, setLastUsernameChange] = useState(0);
  const COOLDOWN_DURATION = 15000;

  // Strict local locking states to completely prevent multiple liking spam
  const [isLiking, setIsLiking] = useState(false);
  const lastLikeTimeRef = useRef(0);

  const [isEditing, setIsEditing] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Uploads');
  const [modalType, setModalType] = useState(null); // 'followers' or 'following'

  useEffect(() => {
    fetchProfileData();

    if (supabase) {
      const activeId = currentUser?.id;
      if (activeId) {
        const profileSubscription = supabase
          .channel(`public:profiles:id=eq.${activeId}`)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${activeId}` },
            (payload) => {
              if (payload.new && typeof payload.new.total_likes === 'number') {
                setTotalLikesReceived(payload.new.total_likes);
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(profileSubscription);
        };
      }
    }
  }, [currentUser]);

  const fetchFollowerStats = async (targetId) => {
    try {
      if (!targetId) return;
      const { count: followersCnt } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', targetId);

      const { count: followingCnt } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', targetId);

      setFollowersCount(followersCnt || 0);
      setFollowingCount(followingCnt || 0);

      await fetchFollowersAndFollowingUsers(targetId);
    } catch (e) {
      console.warn('Follower stats fetch error:', e.message);
    }
  };

  const fetchFollowersAndFollowingUsers = async (targetId) => {
    try {
      if (!targetId) return;
      const { data: followerData, error: fError } = await supabase
        .from('followers')
        .select('follower_id')
        .eq('following_id', targetId);

      if (!fError && followerData && followerData.length > 0) {
        const followerIds = followerData.map(item => item.follower_id).filter(Boolean);
        if (followerIds.length > 0) {
          const { data: profiles, error: pErr } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, country')
            .in('id', followerIds);

          if (!pErr && profiles && profiles.length > 0) {
            setFollowersUsersList(profiles.map(p => ({ ...p, id: p.id })));
          } else {
            setFollowersUsersList([]);
          }
        }
      } else {
        setFollowersUsersList([]);
      }

      const { data: followingData, error: fgError } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', targetId);

      if (!fgError && followingData && followingData.length > 0) {
        const followingIds = followingData.map(item => item.following_id).filter(Boolean);
        if (followingIds.length > 0) {
          const { data: profiles, error: pErr } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, country')
            .in('id', followingIds);

          if (!pErr && profiles && profiles.length > 0) {
            setFollowingUsersList(profiles.map(p => ({ ...p, id: p.id })));
          } else {
            setFollowingUsersList([]);
          }
        }
      } else {
        setFollowingUsersList([]);
      }
    } catch (e) {
      console.warn('Error fetching peer lists:', e.message);
    }
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const activeUser = user || currentUser;

      if (activeUser?.id) {
        const activeUserId = activeUser.id;
        setUserId(activeUserId);
        
        const userEmail = activeUser.email || '';
        setEmail(userEmail);
        const userPrefix = userEmail ? userEmail.split('@')[0] : 'Borris';
        setHandle(`@${userPrefix}`);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', activeUserId)
          .maybeSingle();

        if (data && (data.full_name || data.username)) {
          setUsername(data.full_name || data.username);
          setPhoneNumber(data.phone || '');
          setBio(data.bio || 'Creator on ChatUp');
          setCountry(data.country || 'Uganda');
          setDateOfBirth(data.date_of_birth || '');
          setHobbies(data.hobbies || '');
          setAvatarUri(data.avatar_url || null);
        } else {
          setUsername(userPrefix);
          await supabase.from('profiles').upsert({
            id: activeUserId,
            full_name: userPrefix,
            username: `@${userPrefix}`,
            bio: 'Creator on ChatUp',
            country: 'Uganda',
            total_likes: 0
          }, { onConflict: 'id' });
        }

        let totalAggregatedLikes = data?.total_likes || 0;

        try {
          const { data: contentRows } = await supabase
            .from('reels')
            .select('*')
            .eq('user_id', activeUserId);

          if (contentRows && contentRows.length > 0) {
            const contentLikes = contentRows.reduce((sum, row) => sum + (row.likes || 0), 0);
            totalAggregatedLikes += contentLikes;
            setUserReels(contentRows);
          }
        } catch (e) {}

        setTotalLikesReceived(totalAggregatedLikes);
        await fetchFollowerStats(activeUserId);
      }
    } catch (err) {
      console.warn('Profile fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePickAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      return Alert.alert('Permission Denied', 'Camera roll permissions are required to change your avatar.');
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      const selectedUri = pickerResult.assets[0].uri;
      setAvatarUri(selectedUri);
      setShowAvatarPreviewModal(false);

      try {
        setLoading(true);
        const fileExt = selectedUri.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const base64 = await FileSystem.readAsStringAsync(selectedUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, decode(base64), { contentType: `image/${fileExt}` });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        const publicUrl = publicUrlData.publicUrl;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', userId);

        if (updateError) throw updateError;
        setAvatarUri(publicUrl);
        Alert.alert('Success', 'Profile picture updated successfully!');
      } catch (uploadErr) {
        console.warn('Avatar uploading error:', uploadErr.message);
        Alert.alert('Upload Failed', 'Could not save your new image profile asset.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLikeProfile = async () => {
    if (!userId || isLiking) return;

    const now = Date.now();
    if (now - lastLikeTimeRef.current < 2000) return;
    lastLikeTimeRef.current = now;
    setIsLiking(true);

    setTotalLikesReceived(prev => prev + 1);

    try {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('total_likes')
        .eq('id', userId)
        .maybeSingle();

      const newLikes = (currentProfile?.total_likes || 0) + 1;

      const { error } = await supabase
        .from('profiles')
        .update({ total_likes: newLikes })
        .eq('id', userId);

      if (error) {
        setTotalLikesReceived(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setTotalLikesReceived(prev => Math.max(0, prev - 1));
    } finally {
      setIsLiking(false);
    }
  };

  const handleSaveProfile = async () => {
    const now = Date.now();
    if (now - lastUsernameChange < COOLDOWN_DURATION) {
      const remainingSecs = Math.ceil((COOLDOWN_DURATION - (now - lastUsernameChange)) / 1000);
      return Alert.alert('Cooldown Active ⏳', `Please wait ${remainingSecs} seconds.`);
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: username,
          phone: phoneNumber,
          bio: bio,
          country: country,
          date_of_birth: dateOfBirth,
          hobbies: hobbies,
        })
        .eq('id', userId);

      if (error) throw error;
      setLastUsernameChange(now);
      setIsEditing(false);
      Alert.alert('Profile Saved 💾', 'Changes saved successfully.');
    } catch (e) {
      return Alert.alert('Save Failed ❌', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutPress = () => {
    Alert.alert('Sign Out 🚪', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          if (onLogout) await onLogout();
          else await supabase.auth.signOut();
        },
      },
    ]);
  };

  const profileQrValue = `chatup://user?id=${userId || 'unknown'}&phone=${hidePhoneNumber ? 'hidden' : encodeURIComponent(phoneNumber)}&dob=${hideDob ? 'hidden' : encodeURIComponent(dateOfBirth)}&handle=${encodeURIComponent(handle)}`;

  if (loading && !userId) {
    return (
      <View style={[styles.loadingContainer, isDarkMode && styles.darkContainer]}>
        <ActivityIndicator size="large" color="#3182ce" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      
      {/* Profile Header Component */}
      <ProfileHeader
        isDarkMode={isDarkMode}
        avatarUri={avatarUri}
        avatarEmoji={avatarEmoji}
        username={username}
        handle={handle}
        email={email}
        country={country}
        dateOfBirth={dateOfBirth}
        hideDob={hideDob}
        phoneNumber={phoneNumber}
        hidePhoneNumber={hidePhoneNumber}
        bio={bio}
        showOnlineStatus={showOnlineStatus}
        followersCount={followersCount}
        followingCount={followingCount}
        totalLikesReceived={formatCount(totalLikesReceived)}
        onPressAvatar={() => setShowAvatarPreviewModal(true)}
        onPressQr={() => setShowQrModal(true)}
        onPressLogout={handleSignOutPress}
        onPressStat={(type) => setModalType(type)}
        onCopyPhone={async () => {
          await Clipboard.setStringAsync(phoneNumber);
          Alert.alert('Copied 📋', 'Phone copied.');
        }}
      />

      {/* Interactive Like Profile Button */}
      <TouchableOpacity 
        style={[styles.likeButton, isDarkMode && styles.darkCard, isLiking && { opacity: 0.6 }]} 
        onPress={handleLikeProfile}
        disabled={isLiking}
      >
        <Text style={[styles.likeButtonText, isDarkMode && styles.darkText]}>❤️ Give Profile a Like (+1)</Text>
      </TouchableOpacity>

      {/* Tabs Component */}
      <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 🌟 TIKTOK-STYLE CREATOR REELS GRID WITH LIVE VIDEO THUMBNAILS */}
      {activeTab === 'Uploads' && (
        <View style={styles.gridContainer}>
          {/* Create Reel Button Card */}
          <TouchableOpacity 
            style={[styles.createReelCard, isDarkMode && styles.darkCard]}
            onPress={() => {
              if (navigation && navigation.navigate) {
                navigation.navigate('Reels');
              } else {
                Alert.alert('Create Reel', 'Open your Reels or Camera Hub to publish new content!');
              }
            }}
          >
            <View style={styles.createReelIconCircle}>
              <Ionicons name="add" size={28} color="#fff" />
            </View>
            <Text style={[styles.createReelText, isDarkMode && styles.darkText]}>Create reel</Text>
          </TouchableOpacity>

          {/* Dynamic Video Uploads Grid with Live Video Previews */}
          {userReels.map((reel, index) => (
            <TouchableOpacity 
              key={reel.id || index} 
              style={styles.reelGridItem}
              onPress={() => {
                if (navigation && navigation.navigate) {
                  navigation.navigate('Reels', { initialReelId: reel.id });
                }
              }}
            >
              <Video
                source={{ uri: reel.video_url }}
                style={StyleSheet.absoluteFillObject}
                resizeMode={ResizeMode.COVER}
                shouldPlay={false}
                isMuted={true}
              />
              <View style={styles.thumbnailOverlayDim} />
              <View style={styles.playIconBadge}>
                <Ionicons name="play" size={14} color="#fff" />
              </View>
              <View style={styles.gridOverlayFooter}>
                <Ionicons name="eye-outline" size={11} color="#fff" />
                <Text style={styles.gridViewsCount}>{formatCount(reel.views || 0)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {activeTab === 'Vaults' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🔒 Active Local Ghost Vaults</Text>
          <Text style={styles.itemSubtitle}>Encrypted locally • Zero cloud footprint.</Text>
        </View>
      )}

      {activeTab === 'Copyright' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📜 Verified Copyright Hashes</Text>
          <Text style={styles.itemSubtitle}>Protect your digital creations.</Text>
        </View>
      )}

      {activeTab === 'Settings' && (
        <View>
          <SettingsTab
            isDarkMode={isDarkMode}
            encryptionProtocol={encryptionProtocol}
            setShowEncryptionPicker={setShowEncryptionPicker}
            tipJarEnabled={tipJarEnabled}
            setTipJarEnabled={setTipJarEnabled}
            aiAssistantAutoReply={aiAssistantAutoReply}
            setAiAssistantAutoReply={setAiAssistantAutoReply}
            bluetoothBeaconActive={bluetoothBeaconActive}
            setBluetoothBeaconActive={setBluetoothBeaconActive}
            messagePermission={messagePermission}
            setShowPermissionPicker={setShowPermissionPicker}
            hidePhoneNumber={hidePhoneNumber}
            setHidePhoneNumber={setHidePhoneNumber}
            hideDob={hideDob}
            setHideDob={setHideDob}
            showOnlineStatus={showOnlineStatus}
            setShowOnlineStatus={setShowOnlineStatus}
            pushNotifications={pushNotifications}
            setPushNotifications={setPushNotifications}
            onPressSecurity={() => setShowSecurityModal(true)}
            onPressSeedPhrase={() => setShowSeedPhraseModal(true)}
            onPressForgot={() => setShowForgotModal(true)}
          />

          {/* Edit Profile Section cleanly housed inside Settings Tab */}
          <View style={{ marginTop: 12 }}>
            <EditProfileSection
              isDarkMode={isDarkMode}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              username={username}
              setUsername={setUsername}
              handle={handle}
              setHandle={setHandle}
              phoneNumber={phoneNumber}
              country={country}
              setCountry={setCountry}
              dateOfBirth={dateOfBirth}
              setDateOfBirth={setDateOfBirth}
              hobbies={hobbies}
              setHobbies={setHobbies}
              bio={bio}
              setBio={setBio}
              onPressChangePhone={() => setShowPhoneChangeModal(true)}
              onSave={handleSaveProfile}
            />
          </View>
        </View>
      )}

      {/* Avatar Preview & Change Modal */}
      <Modal visible={showAvatarPreviewModal} animationType="fade" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAvatarPreviewModal(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard, { alignItems: 'center' }]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 16 }]}>🖼️ Profile Picture</Text>
            
            <View style={styles.largeAvatarContainer}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={{ width: 140, height: 140, borderRadius: 70 }} />
              ) : (
                <Text style={{ fontSize: 60 }}>{avatarEmoji}</Text>
              )}
            </View>

            <TouchableOpacity style={[styles.saveBtn, { width: '100%', marginTop: 20 }]} onPress={handlePickAvatar}>
              <Text style={styles.saveBtnText}>Choose New Photo from Gallery 📁</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.saveBtn, { width: '100%', backgroundColor: '#718096', marginTop: 10 }]} onPress={() => setShowAvatarPreviewModal(false)}>
              <Text style={styles.saveBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Followers & Following List Viewer Modal */}
      <Modal visible={modalType !== null} animationType="slide" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalType(null)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard, { maxHeight: '60%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>
                {modalType === 'followers' ? '👥 Followers & Subscribers' : '🛰️ Following Peers'}
              </Text>
              <TouchableOpacity onPress={() => setModalType(null)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {(modalType === 'followers' ? followersUsersList : followingUsersList).length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#718096', paddingVertical: 20, fontSize: 12 }}>
                  No users found in this list yet.
                </Text>
              ) : (
                (modalType === 'followers' ? followersUsersList : followingUsersList).map(user => (
                  <View key={user.id || Math.random()} style={[styles.peerRow, isDarkMode && { borderBottomColor: '#4a5568' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={styles.smallAvatar}>
                        {user.avatar_url ? (
                          <Image source={{ uri: user.avatar_url }} style={{ width: 36, height: 36, borderRadius: 18 }} />
                        ) : (
                          <Text style={{ fontSize: 16 }}>🧑‍💻</Text>
                        )}
                      </View>
                      <View style={{ marginLeft: 10 }}>
                        <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>{user.full_name || 'ChatUp User'}</Text>
                        <Text style={{ fontSize: 10, color: '#718096' }}>📍 {user.country || 'Global'}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* QR Modal Component */}
      <QrModal
        visible={showQrModal}
        onClose={() => setShowQrModal(false)}
        isDarkMode={isDarkMode}
        profileQrValue={profileQrValue}
        username={username}
        handle={handle}
        country={country}
        dateOfBirth={dateOfBirth}
        hideDob={hideDob}
        phoneNumber={phoneNumber}
        hidePhoneNumber={hidePhoneNumber}
      />

      {/* Security Modals Component */}
      <SecurityModal
        showSecurityModal={showSecurityModal}
        setShowSecurityModal={setShowSecurityModal}
        showSeedPhraseModal={showSeedPhraseModal}
        setShowSeedPhraseModal={setShowSeedPhraseModal}
        showForgotModal={showForgotModal}
        setShowForgotModal={setShowForgotModal}
        isDarkMode={isDarkMode}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        handlePasswordUpdate={() => {}}
        recoverySeedPhrase={recoverySeedPhrase}
        copySeedPhrase={async () => {
          await Clipboard.setStringAsync(recoverySeedPhrase);
          Alert.alert('Copied! 📋', 'Recovery seed phrase copied to clipboard.');
        }}
        recoveryInputKey={recoveryInputKey}
        setRecoveryInputKey={setRecoveryInputKey}
        handleRestoreAccountWithSeed={() => {}}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  darkText: { color: '#fff' },
  itemSubtitle: { fontSize: 10, color: '#718096', marginTop: 2 },
  likeButton: { backgroundColor: '#fff2f2', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#feb2b2', alignItems: 'center' },
  likeButtonText: { fontSize: 13, fontWeight: 'bold', color: '#e53e3e' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: '80%' },
  largeAvatarContainer: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#ebf8ff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#3182ce', overflow: 'hidden' },
  smallAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ebf8ff', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  itemTitle: { fontSize: 12, fontWeight: 'bold', color: '#2d3748' },
  peerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  saveBtn: { backgroundColor: '#3182ce', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  // TikTok-Style Grid Styles
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  createReelCard: { width: '31%', aspectRatio: 0.75, backgroundColor: '#edf2f7', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#cbd5e0', borderStyle: 'dashed' },
  createReelIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3182ce', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  createReelText: { fontSize: 11, fontWeight: 'bold', color: '#2d3748' },
  reelGridItem: { width: '31%', aspectRatio: 0.75, backgroundColor: '#111827', borderRadius: 10, overflow: 'hidden', marginBottom: 8, position: 'relative', justifyContent: 'flex-end' },
  thumbnailOverlayDim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },
  playIconBadge: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  gridOverlayFooter: { position: 'absolute', bottom: 4, left: 6, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 },
  gridViewsCount: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 3 }
});