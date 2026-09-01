import React, { useState } from 'react';
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
} from 'react-native';

export default function ProfileScreen({ isDarkMode, coins }) {
  const [username, setUsername] = useState('Borris');
  const [handle, setHandle] = useState('@borris_official');
  const [bio, setBio] = useState('Software Developer & Creator of "Talk with Nature" 🌿 | Building decentralized mesh apps in Uganda 🇺🇬');
  
  // Follow, Following & Block States
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [followersCount, setFollowersCount] = useState(14200);

  // Security & Credential States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('🧑‍💻');
  
  // Cooldown Timestamps (Stored in milliseconds)
  const [lastUsernameChange, setLastUsernameChange] = useState(0);
  const [lastPasswordChange, setLastPasswordChange] = useState(0);
  const [lastAvatarChange, setLastAvatarChange] = useState(0);

  const COOLDOWN_DURATION = 15000; // 15 seconds cooldown for testing

  const [isEditing, setIsEditing] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Uploads');
  const [modalType, setModalType] = useState(null);

  const followersList = [
    { id: '1', name: 'Nimusiima Asifa', handle: '@asifa_n', status: 'Connected via Mesh' },
    { id: '2', name: 'Node_Kampala_02', handle: '@kampala_node', status: 'Active Peer' },
    { id: '3', name: 'Bwindi Ranger Unit', handle: '@bwindi_1', status: 'Verified Creator' },
  ];

  const followingList = [
    { id: '1', name: 'Talk with Nature Official', handle: '@nature_ug', status: 'Primary Channel' },
    { id: '2', name: 'Supabase Devs', handle: '@supabase_hq', status: 'Database Peer' },
  ];

  const handleToggleFollow = () => {
    if (isBlocked) {
      return Alert.alert('Action Blocked', 'You cannot follow a user you have blocked.');
    }
    if (isFollowing) {
      setIsFollowing(false);
      setFollowersCount(prev => prev - 1);
      Alert.alert('Unfollowed', `You have unfollowed ${username}.`);
    } else {
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
      Alert.alert('Following 🔔', `You are now following ${username}! You will receive secure mesh broadcast updates.`);
    }
  };

  const handleToggleBlock = () => {
    if (isBlocked) {
      setIsBlocked(false);
      Alert.alert('Unblocked', `You have unblocked ${username}.`);
    } else {
      Alert.alert(
        'Block User 🚫',
        `Are you sure you want to block ${username}? They will no longer be able to message you or view your decentralized network traffic.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Block', 
            style: 'destructive', 
            onPress: () => {
              setIsBlocked(true);
              setIsFollowing(false); // Automatically unfollow on block
            } 
          }
        ]
      );
    }
  };

  const handleSave = () => {
    const now = Date.now();
    if (now - lastUsernameChange < COOLDOWN_DURATION) {
      const remainingSecs = Math.ceil((COOLDOWN_DURATION - (now - lastUsernameChange)) / 1000);
      return Alert.alert('Cooldown Active ⏳', `Please wait ${remainingSecs} seconds before changing your profile name again.`);
    }

    setLastUsernameChange(now);
    setIsEditing(false);
    Alert.alert('Profile Updated 👤', 'Your creator profile details have been saved securely.');
  };

  const handlePasswordUpdate = () => {
    const now = Date.now();
    if (now - lastPasswordChange < COOLDOWN_DURATION) {
      const remainingSecs = Math.ceil((COOLDOWN_DURATION - (now - lastPasswordChange)) / 1000);
      return Alert.alert('Security Cooldown ⏳', `Please wait ${remainingSecs} seconds before updating your passcode again.`);
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return Alert.alert('Error', 'Please fill in all passcode fields.');
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert('Error', 'New passcodes do not match.');
    }

    setLastPasswordChange(now);
    setShowSecurityModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    Alert.alert('Security Updated 🔒', 'Master passcode and signing keys have been successfully rotated.');
  };

  const cycleAvatar = () => {
    const now = Date.now();
    if (now - lastAvatarChange < 10000) {
      return Alert.alert('Avatar Cooldown ⏳', 'Please wait a moment before changing your avatar badge again.');
    }

    const emojis = ['🧑‍💻', '🦁', '🌿', '🛰️', '🛡️', '⚡'];
    const nextEmoji = emojis[(emojis.indexOf(avatarEmoji) + 1) % emojis.length];
    setAvatarEmoji(nextEmoji);
    setLastAvatarChange(now);
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      
      {/* Profile Header Card */}
      <View style={[styles.card, isDarkMode && styles.darkCard, styles.centerCard]}>
        <TouchableOpacity style={styles.avatarContainer} onPress={cycleAvatar}>
          <Text style={{ fontSize: 32 }}>{avatarEmoji}</Text>
          <View style={styles.cameraBadge}>
            <Text style={{ fontSize: 10 }}>📷</Text>
          </View>
        </TouchableOpacity>
        <Text style={{ fontSize: 10, color: '#a0aec0', marginBottom: 4 }}>Tap to cycle avatar (Cooldown protected)</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[styles.profileName, isDarkMode && styles.darkText]}>{username}</Text>
          <Text style={{ fontSize: 14, marginLeft: 4 }}>✔️</Text>
        </View>
        <Text style={styles.profileHandle}>{handle}</Text>
        <Text style={[styles.profileBio, isDarkMode && { color: '#cbd5e0' }]}>{bio}</Text>

        {/* Follow / Sub & Block Action Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 15 }}>
          <TouchableOpacity 
            style={[styles.followBtn, isFollowing && styles.followingBtnActive, isBlocked && { opacity: 0.5 }]} 
            onPress={handleToggleFollow}
          >
            <Text style={[styles.followBtnText, isFollowing && styles.followingBtnTextActive]}>
              {isFollowing ? 'Following 🔔' : '+ Follow Creator'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.blockBtn, isBlocked && styles.blockedBtnActive]} 
            onPress={handleToggleBlock}
          >
            <Text style={[styles.blockBtnText, isBlocked && styles.blockedBtnTextActive]}>
              {isBlocked ? 'Blocked 🚫' : 'Block'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Interactive Stats Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statItem} onPress={() => setModalType('followers')}>
            <Text style={[styles.statNumber, isDarkMode && styles.darkText]}>
              {(followersCount / 1000).toFixed(1)}K
            </Text>
            <Text style={styles.statLabel}>Followers 👥</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statItem} onPress={() => setModalType('following')}>
            <Text style={[styles.statNumber, isDarkMode && styles.darkText]}>342</Text>
            <Text style={styles.statLabel}>Following 🛰️</Text>
          </TouchableOpacity>

          <View style={styles.statItem}>
            <Text style={[styles.statNumber, isDarkMode && styles.darkText]}>🪙 {coins}</Text>
            <Text style={styles.statLabel}>Wallet Coins</Text>
          </View>
        </View>
      </View>

      {/* Profile Content Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Uploads' && styles.activeTabButton]} 
          onPress={() => setActiveTab('Uploads')}
        >
          <Text style={[styles.tabText, activeTab === 'Uploads' && styles.activeTabText]}>🎬 Uploads (48)</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Vaults' && styles.activeTabButton]} 
          onPress={() => setActiveTab('Vaults')}
        >
          <Text style={[styles.tabText, activeTab === 'Vaults' && styles.activeTabText]}>🛡️ Ghost Vaults</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Copyright' && styles.activeTabButton]} 
          onPress={() => setActiveTab('Copyright')}
        >
          <Text style={[styles.tabText, activeTab === 'Copyright' && styles.activeTabText]}>📜 DRM Assets</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Dynamic Content */}
      {activeTab === 'Uploads' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🎥 Recent Creator Uploads</Text>
          <View style={styles.contentItem}>
            <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Bwindi Mountain Gorillas - 4K Expedition</Text>
            <Text style={styles.itemSubtitle}>12.4K views • Synced via Mesh Network</Text>
          </View>
          <View style={[styles.contentItem, { borderBottomWidth: 0 }]}>
            <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Queen Elizabeth National Park Wildlife Trailer</Text>
            <Text style={styles.itemSubtitle}>8.1K views • Protected by DRM</Text>
          </View>
        </View>
      )}

      {activeTab === 'Vaults' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🔒 Active Local Ghost Vaults</Text>
          <View style={styles.contentItem}>
            <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Master App Secrets & API Keys</Text>
            <Text style={styles.itemSubtitle}>Encrypted locally • Zero cloud footprint</Text>
          </View>
        </View>
      )}

      {activeTab === 'Copyright' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📜 Verified Copyright Hashes</Text>
          <View style={styles.contentItem}>
            <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Talk_with_Nature_Master_v2.mp4</Text>
            <Text style={{ fontSize: 10, color: '#3182ce' }}>sha256_8f9b2c44e3b0c442...</Text>
          </View>
        </View>
      )}

      {/* Edit Profile & Account Security Section */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>✏️ Edit Creator Credentials</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Text style={{ color: '#3182ce', fontWeight: 'bold', fontSize: 12 }}>{isEditing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>Display Name (Rate Limited)</Text>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          value={username}
          editable={isEditing}
          onChangeText={setUsername}
        />

        <Text style={styles.inputLabel}>Handle</Text>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          value={handle}
          editable={isEditing}
          onChangeText={setHandle}
        />

        <Text style={styles.inputLabel}>Bio & Channel Description</Text>
        <TextInput
          style={[styles.input, { height: 70, textAlignVertical: 'top' }, isDarkMode && styles.darkInput]}
          value={bio}
          editable={isEditing}
          multiline
          onChangeText={setBio}
        />

        {/* Change Password / Passcode Trigger Button */}
        <TouchableOpacity 
          style={styles.secBtnOutline} 
          onPress={() => setShowSecurityModal(true)}
        >
          <Text style={styles.secBtnText}>🔒 Change Master Passcode (Rate Limited)</Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Changes 💾</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Followers / Following Modal Viewer */}
      <Modal visible={modalType !== null} animationType="slide" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalType(null)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>
                {modalType === 'followers' ? '👥 Followers & Subscribers' : '🛰️ Following Peers'}
              </Text>
              <TouchableOpacity onPress={() => setModalType(null)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {(modalType === 'followers' ? followersList : followingList).map(item => (
                <View key={item.id} style={[styles.peerRow, isDarkMode && { borderBottomColor: '#4a5568' }]}>
                  <View>
                    <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>{item.name}</Text>
                    <Text style={{ fontSize: 10, color: '#3182ce' }}>{item.handle}</Text>
                  </View>
                  <Text style={{ fontSize: 10, color: '#48bb78', fontWeight: 'bold' }}>{item.status}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={showSecurityModal} animationType="fade" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowSecurityModal(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🔐 Update Master Passcode</Text>
              <TouchableOpacity onPress={() => setShowSecurityModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Current Passcode</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              secureTextEntry
              placeholder="Enter current password..."
              placeholderTextColor="#a0aec0"
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <Text style={styles.inputLabel}>New Passcode</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              secureTextEntry
              placeholder="Enter new password..."
              placeholderTextColor="#a0aec0"
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <Text style={styles.inputLabel}>Confirm New Passcode</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              secureTextEntry
              placeholder="Confirm new password..."
              placeholderTextColor="#a0aec0"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handlePasswordUpdate}>
              <Text style={styles.saveBtnText}>Update Passcode 🛡️</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  centerCard: { alignItems: 'center', paddingVertical: 20 },
  avatarContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#ebf8ff', justifyContent: 'center', alignItems: 'center', marginBottom: 4, position: 'relative' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e0' },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#2d3748' },
  profileHandle: { fontSize: 12, color: '#3182ce', marginBottom: 8 },
  profileBio: { fontSize: 12, color: '#718096', textAlign: 'center', paddingHorizontal: 20, marginBottom: 12 },
  followBtn: { backgroundColor: '#3182ce', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  followingBtnActive: { backgroundColor: '#e2e8f0' },
  followBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  followingBtnTextActive: { color: '#4a5568' },
  blockBtn: { backgroundColor: '#fed7d7', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#feb2b2' },
  blockedBtnActive: { backgroundColor: '#e53e3e', borderColor: '#c53030' },
  blockBtnText: { color: '#c53030', fontSize: 12, fontWeight: 'bold' },
  blockedBtnTextActive: { color: '#fff' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', borderTopWidth: 1, borderTopColor: '#edf2f7', paddingTop: 12 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 14, fontWeight: 'bold', color: '#2d3748' },
  statLabel: { fontSize: 10, color: '#a0aec0' },
  tabBar: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 8, padding: 3, marginBottom: 12 },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activeTabButton: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontSize: 11, fontWeight: 'bold', color: '#718096' },
  activeTabText: { color: '#3182ce' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  contentItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  itemTitle: { fontSize: 12, fontWeight: 'bold', color: '#2d3748' },
  itemSubtitle: { fontSize: 10, color: '#718096', marginTop: 2 },
  inputLabel: { fontSize: 10, fontWeight: 'bold', color: '#a0aec0', marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 10, height: 38, backgroundColor: '#f7fafc', color: '#2d3748', fontSize: 12, marginBottom: 4 },
  darkInput: { backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' },
  saveBtn: { backgroundColor: '#3182ce', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  secBtnOutline: { borderWidth: 1, borderColor: '#3182ce', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 10, backgroundColor: '#ebf8ff' },
  secBtnText: { color: '#3182ce', fontSize: 12, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: '60%' },
  peerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
});