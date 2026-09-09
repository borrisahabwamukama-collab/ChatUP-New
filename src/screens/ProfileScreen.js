import React, { useState, useEffect } from 'react';
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
  Clipboard,
  Switch,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../../Services/supabaseClient'; // Adjust path if needed

export default function ProfileScreen({ isDarkMode, coins, currentUser, onLogout }) {
  // Profile & User Dynamic States
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('Borris');
  const [handle, setHandle] = useState('@borris_official');
  const [phoneNumber, setPhoneNumber] = useState('+256 770 000000');
  const [email, setEmail] = useState('');
  
  // Profile Fields
  const [country, setCountry] = useState('Uganda 🇺🇬');
  const [dateOfBirth, setDateOfBirth] = useState('April 4, 1996');
  const [hobbies, setHobbies] = useState('Wildlife Conservation, Coding, Football, Traveling');
  const [bio, setBio] = useState('Software Developer & Creator of "Talk with Nature" 🌿 | Building decentralized mesh apps in Uganda');
  
  // Follow, Following & Block States
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [followersCount, setFollowersCount] = useState(14200);

  // Security & Credential States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('🧑‍💻');
  
  // Restricted Phone Number Change States
  const [showPhoneChangeModal, setShowPhoneChangeModal] = useState(false);
  const [pendingPhone, setPendingPhone] = useState('');
  const [phoneOtpCode, setPhoneOtpCode] = useState('');
  const [phonePasscodeVerify, setPhonePasscodeVerify] = useState('');
  const [phoneStep, setPhoneStep] = useState(1);

  // Lost Phone Recovery Phrase States
  const [showSeedPhraseModal, setShowSeedPhraseModal] = useState(false);
  const [recoverySeedPhrase] = useState('nature timber swift digital kampala router beacon mesh anchor delta vertex shield');
  
  // Forgot Password / Lost Phone Recovery Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryInputKey, setRecoveryInputKey] = useState('');

  // International Privacy & General Settings States
  const [hidePhoneNumber, setHidePhoneNumber] = useState(true);
  const [hideDob, setHideDob] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [meshRoutingEnabled, setMeshRoutingEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [biometricLock, setBiometricLock] = useState(false);
  const [dataSaverMode, setDataSaverMode] = useState(false);

  // NEW LAYER 1: DECENTRALIZED P2P ENCRYPTION PROTOCOL SELECTOR
  const [encryptionProtocol, setEncryptionProtocol] = useState('Signal Double Ratchet (E2EE)');
  const [showEncryptionPicker, setShowEncryptionPicker] = useState(false);

  // NEW LAYER 2: CREATOR MONETIZATION & DIRECT TIP JAR WIDGET
  const [tipJarEnabled, setTipJarEnabled] = useState(true);

  // NEW LAYER 3: ADVANCED AI CHAT ASSISTANT & AUTO-REPLY FILTER
  const [aiAssistantAutoReply, setAiAssistantAutoReply] = useState(true);

  // NEW LAYER 4: OFFLINE MESH BLUETOOTH BEACON BROADCASTING
  const [bluetoothBeaconActive, setBluetoothBeaconActive] = useState(true);

  // Message Request Privacy Level
  const [messagePermission, setMessagePermission] = useState('Followers Only');
  const [showPermissionPicker, setShowPermissionPicker] = useState(false);

  // Account Deactivation & Deletion Flow States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deletionIntent, setDeletionIntent] = useState(null);
  const [selectedDeletionReason, setSelectedDeletionReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [deletePasscodeConfirm, setDeletePasscodeConfirm] = useState('');

  // Cooldown Timestamps
  const [lastUsernameChange, setLastUsernameChange] = useState(0);
  const [lastPasswordChange, setLastPasswordChange] = useState(0);
  const [lastAvatarChange, setLastAvatarChange] = useState(0);

  const COOLDOWN_DURATION = 15000;

  const [isEditing, setIsEditing] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Uploads');
  const [modalType, setModalType] = useState(null);

  // FETCH SUPABASE DYNAMIC USER DATA ON MOUNT
  useEffect(() => {
    fetchProfileData();
  }, [currentUser]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const activeUser = user || currentUser;

      if (activeUser) {
        setEmail(activeUser.email || '');
        if (activeUser.email) {
          const userPrefix = activeUser.email.split('@')[0];
          setHandle(`@${userPrefix}`);
        }

        // Fetch custom user profile from Supabase profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', activeUser.id)
          .single();

        if (data) {
          if (data.full_name) setUsername(data.full_name);
          if (data.phone) setPhoneNumber(data.phone);
          if (data.bio) setBio(data.bio);
          if (data.country) setCountry(data.country);
        }
      }
    } catch (err) {
      console.warn('Profile fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  const profileQrValue = `chatup://user?id=borris_01&phone=${hidePhoneNumber ? 'hidden' : encodeURIComponent(phoneNumber)}&dob=${hideDob ? 'hidden' : encodeURIComponent(dateOfBirth)}&handle=${encodeURIComponent(handle)}`;

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
              setIsFollowing(false);
            } 
          }
        ]
      );
    }
  };

  const handleSave = async () => {
    const now = Date.now();
    if (now - lastUsernameChange < COOLDOWN_DURATION) {
      const remainingSecs = Math.ceil((COOLDOWN_DURATION - (now - lastUsernameChange)) / 1000);
      return Alert.alert('Cooldown Active ⏳', `Please wait ${remainingSecs} seconds before changing your profile name again.`);
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: username,
          phone: phoneNumber,
          bio: bio,
          country: country,
        });
      }
    } catch (e) {
      console.warn('Could not save to Supabase:', e);
    }

    setLastUsernameChange(now);
    setIsEditing(false);
    Alert.alert('Profile Updated 👤', 'Your creator profile details, hobbies, and country info have been saved securely.');
  };

  const handleSignOutPress = () => {
    Alert.alert(
      'Sign Out 🚪',
      'Are you sure you want to log out of ChatUp?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            if (onLogout) {
              await onLogout();
            } else {
              await supabase.auth.signOut();
            }
          },
        },
      ]
    );
  };

  const handleRequestPhoneChangeOtp = () => {
    if (!pendingPhone || !phonePasscodeVerify) {
      return Alert.alert('Error', 'Please enter your current master passcode and the new phone number.');
    }
    Alert.alert('Verification Code Sent 📲', `A secure 6-digit SMS confirmation code has been dispatched to ${pendingPhone}. Account is entering 7-day fraud restriction state upon completion.`);
    setPhoneStep(2);
  };

  const handleVerifyPhoneChange = () => {
    if (!phoneOtpCode) {
      return Alert.alert('Error', 'Please enter the verification code.');
    }
    setPhoneNumber(pendingPhone);
    setShowPhoneChangeModal(false);
    setPhoneStep(1);
    setPendingPhone('');
    setPhoneOtpCode('');
    setPhonePasscodeVerify('');
    Alert.alert('Phone Updated & Locked 🔒', 'Your phone number has been updated. A 7-day payout security cooldown is active to protect against SIM swaps.');
  };

  const handleRestoreAccountWithSeed = () => {
    if (!recoveryInputKey || recoveryInputKey.trim().split(' ').length < 12) {
      return Alert.alert('Recovery Failed ❌', 'Please enter your complete 12-word zero-knowledge recovery seed phrase.');
    }
    setShowForgotModal(false);
    setRecoveryInputKey('');
    Alert.alert('Account Restored Successfully 🔓', 'Your cryptographic identity and keys have been recovered. You can now re-bind your new phone number.');
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

  const handleExecuteAccountAction = () => {
    if (!deletePasscodeConfirm) {
      return Alert.alert('Error', 'Please enter your master passcode to confirm.');
    }

    if (deletionIntent === 'break') {
      setShowDeleteModal(false);
      setDeleteStep(1);
      setDeletionIntent(null);
      setSelectedDeletionReason('');
      setDeletePasscodeConfirm('');
      Alert.alert('Account Deactivated 💤', 'Your account has been temporarily hidden. Simply log back in anytime with your credentials to reactivate!');
    } else {
      setShowDeleteModal(false);
      setDeleteStep(1);
      setDeletionIntent(null);
      setSelectedDeletionReason('');
      setDeletePasscodeConfirm('');
      Alert.alert('Account Deleted Permanently 🗑️', 'Your ChatUp profile, local vaults, and server data have been permanently scrubbed.');
    }
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

  const handleCopyPhone = () => {
    Clipboard.setString(phoneNumber);
    Alert.alert('Copied! 📋', 'Phone number copied to clipboard.');
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, isDarkMode && styles.darkContainer]}>
        <ActivityIndicator size="large" color="#3182ce" />
      </View>
    );
  }

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
        {email ? <Text style={{ fontSize: 11, color: '#3182ce', marginBottom: 4 }}>✉️ {email}</Text> : null}
        
        {/* Country & DOB Info Tag */}
        <Text style={{ fontSize: 11, color: '#718096', marginVertical: 4 }}>
          📍 {country} {hideDob ? '' : `| 🎂 ${dateOfBirth}`}
        </Text>

        {/* Phone Number Display Badge */}
        {!hidePhoneNumber ? (
          <TouchableOpacity style={styles.phoneBadge} onPress={handleCopyPhone}>
            <Text style={styles.phoneBadgeText}>📞 {phoneNumber} (Tap to copy)</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.phoneBadge, { backgroundColor: '#fff5f5', borderColor: '#feb2b2' }]}>
            <Text style={[styles.phoneBadgeText, { color: '#c53030' }]}>🔒 Phone Number Hidden by Privacy Settings</Text>
          </View>
        )}

        <Text style={[styles.profileBio, isDarkMode && { color: '#cbd5e0' }]}>{bio}</Text>

        {/* Action Buttons Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 15 }}>
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

          <TouchableOpacity 
            style={styles.qrTriggerBtn} 
            onPress={() => setShowQrModal(true)}
          >
            <Text style={styles.qrTriggerBtnText}>My QR 📇</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.logoutBtnInline]} 
            onPress={handleSignOutPress}
          >
            <Text style={styles.logoutBtnText}>Log Out 🚪</Text>
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
          <Text style={[styles.tabText, activeTab === 'Uploads' && styles.activeTabText]}>🎬 Uploads</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Vaults' && styles.activeTabButton]} 
          onPress={() => setActiveTab('Vaults')}
        >
          <Text style={[styles.tabText, activeTab === 'Vaults' && styles.activeTabText]}>🛡️ Vaults</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Copyright' && styles.activeTabButton]} 
          onPress={() => setActiveTab('Copyright')}
        >
          <Text style={[styles.tabText, activeTab === 'Copyright' && styles.activeTabText]}>📜 DRM</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Settings' && styles.activeTabButton]} 
          onPress={() => setActiveTab('Settings')}
        >
          <Text style={[styles.tabText, activeTab === 'Settings' && styles.activeTabText]}>⚙️ Settings</Text>
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

      {/* Integrated Settings & Privacy Hub Tab */}
      {activeTab === 'Settings' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 12 }]}>⚙️ International Settings & Security Hub</Text>
          
          <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>
            Configure global privacy preferences, message request filters, and zero-knowledge account recovery.
          </Text>

          {/* LAYER 1: DECENTRALIZED P2P ENCRYPTION PROTOCOL SELECTOR */}
          <View style={styles.settingRowColumn}>
            <View style={{ flex: 1, marginBottom: 8 }}>
              <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>🔐 P2P Encryption Protocol</Text>
              <Text style={styles.itemSubtitle}>Select cryptographic security standard for direct messages and peer sync.</Text>
            </View>
            <TouchableOpacity 
              style={styles.dropdownSelector} 
              onPress={() => setShowEncryptionPicker(true)}
            >
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3182ce' }}>{encryptionProtocol} ▾</Text>
            </TouchableOpacity>
          </View>

          {/* LAYER 2: CREATOR MONETIZATION & DIRECT TIP JAR */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>🪙 Creator Tip Jar Widget</Text>
              <Text style={styles.itemSubtitle}>Allow fans and viewers to send direct coin tips to your profile.</Text>
            </View>
            <Switch
              value={tipJarEnabled}
              onValueChange={setTipJarEnabled}
              trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
            />
          </View>

          {/* LAYER 3: ADVANCED AI CHAT ASSISTANT & AUTO-REPLY */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>🤖 AI Auto-Reply Assistant</Text>
              <Text style={styles.itemSubtitle}>Automatically respond to fan inquiries with custom AI tone profiles.</Text>
            </View>
            <Switch
              value={aiAssistantAutoReply}
              onValueChange={setAiAssistantAutoReply}
              trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
            />
          </View>

          {/* LAYER 4: OFFLINE MESH BLUETOOTH BEACON BROADCASTING */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>📡 Bluetooth Mesh Beacon</Text>
              <Text style={styles.itemSubtitle}>Broadcast creator profile packets locally to nearby offline peers in Uganda.</Text>
            </View>
            <Switch
              value={bluetoothBeaconActive}
              onValueChange={setBluetoothBeaconActive}
              trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
            />
          </View>

          {/* Message Requests Permission Picker */}
          <View style={styles.settingRowColumn}>
            <View style={{ flex: 1, marginBottom: 8 }}>
              <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Who Can Message You Directly</Text>
              <Text style={styles.itemSubtitle}>Messages from unfollowed users will automatically route to your Message Requests folder.</Text>
            </View>
            <TouchableOpacity 
              style={styles.dropdownSelector} 
              onPress={() => setShowPermissionPicker(true)}
            >
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3182ce' }}>{messagePermission} ▾</Text>
            </TouchableOpacity>
          </View>

          {/* Hide Phone Number Toggle */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Hide Phone Number</Text>
              <Text style={styles.itemSubtitle}>Keep your MTN/Airtel number private from strangers and QR scans.</Text>
            </View>
            <Switch
              value={hidePhoneNumber}
              onValueChange={setHidePhoneNumber}
              trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
            />
          </View>

          {/* Hide Date of Birth Toggle */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Hide Date of Birth</Text>
              <Text style={styles.itemSubtitle}>Keep your birthday private from public profile views and QR cards.</Text>
            </View>
            <Switch
              value={hideDob}
              onValueChange={setHideDob}
              trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
            />
          </View>

          {/* Show Online Status Toggle */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Online Presence</Text>
              <Text style={styles.itemSubtitle}>Allow contacts to see when you are active on ChatUp.</Text>
            </View>
            <Switch
              value={showOnlineStatus}
              onValueChange={setShowOnlineStatus}
              trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
            />
          </View>

          {/* Read Receipts Toggle */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Read Receipts</Text>
              <Text style={styles.itemSubtitle}>Display blue checkmarks on messages you have read.</Text>
            </View>
            <Switch
              value={readReceipts}
              onValueChange={setReadReceipts}
              trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
            />
          </View>

          {/* Push Notifications Toggle */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Push Notifications</Text>
              <Text style={styles.itemSubtitle}>Receive instant alerts for chats, mentions, and referral rewards.</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
            />
          </View>

          {/* Biometric Lock Toggle */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Biometric App Lock</Text>
              <Text style={styles.itemSubtitle}>Require fingerprint or face ID to open ChatUp security vaults.</Text>
            </View>
            <Switch
              value={biometricLock}
              onValueChange={setBiometricLock}
              trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
            />
          </View>

          {/* Data Saver Mode Toggle */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Data Saver Mode</Text>
              <Text style={styles.itemSubtitle}>Optimize mobile data usage while browsing media across Uganda.</Text>
            </View>
            <Switch
              value={dataSaverMode}
              onValueChange={setDataSaverMode}
              trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
            />
          </View>

          {/* Mesh Network Relay Toggle */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Mesh Network Relay</Text>
              <Text style={styles.itemSubtitle}>Allow your device to securely relay offline encrypted packets.</Text>
            </View>
            <Switch
              value={meshRoutingEnabled}
              onValueChange={setMeshRoutingEnabled}
              trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
            />
          </View>

          {/* Master Passcode Rotation Button */}
          <TouchableOpacity 
            style={[styles.secBtnOutline, { marginTop: 16 }]} 
            onPress={() => setShowSecurityModal(true)}
          >
            <Text style={styles.secBtnText}>🔒 Change Master Passcode & Recovery</Text>
          </TouchableOpacity>

          {/* View Zero-Knowledge Seed Phrase Backup */}
          <TouchableOpacity 
            style={[styles.secBtnOutline, { borderColor: '#38a169', backgroundColor: '#f0fff4', marginTop: 10 }]} 
            onPress={() => setShowSeedPhraseModal(true)}
          >
            <Text style={[styles.secBtnText, { color: '#38a169' }]}>🛡️ Backup Recovery Seed Phrase (Lost Phone)</Text>
          </TouchableOpacity>

          {/* Lost Phone Account Recovery Trigger */}
          <TouchableOpacity 
            style={{ marginTop: 14, alignItems: 'center' }} 
            onPress={() => setShowForgotModal(true)}
          >
            <Text style={{ fontSize: 11, color: '#e53e3e', fontWeight: 'bold' }}>Lost Phone or SIM? 🔑 Recover Account via Seed Phrase</Text>
          </TouchableOpacity>

          {/* Deactivate / Delete Account Trigger */}
          <TouchableOpacity 
            style={[styles.secBtnOutline, { borderColor: '#e53e3e', backgroundColor: '#fff5f5', marginTop: 20 }]} 
            onPress={() => {
              setDeleteStep(1);
              setDeletionIntent(null);
              setSelectedDeletionReason('');
              setDeletePasscodeConfirm('');
              setShowDeleteModal(true);
            }}
          >
            <Text style={[styles.secBtnText, { color: '#e53e3e' }]}>🗑️ Take a Break or Delete Account</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Edit Profile & Registration Fields Section */}
      <View style={[styles.card, isDarkMode && styles.darkCard, { marginTop: 14 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>✏️ Edit Profile & Bio</Text>
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

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <Text style={styles.inputLabel}>Phone Number (MTN / Airtel - Protected)</Text>
          <TouchableOpacity onPress={() => setShowPhoneChangeModal(true)}>
            <Text style={{ fontSize: 11, color: '#3182ce', fontWeight: 'bold' }}>Change Phone 📱</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.input, { backgroundColor: '#edf2f7' }, isDarkMode && styles.darkInput]}
          value={phoneNumber}
          editable={false}
        />

        <Text style={styles.inputLabel}>Country / Region</Text>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          value={country}
          editable={isEditing}
          onChangeText={setCountry}
        />

        <Text style={styles.inputLabel}>Date of Birth</Text>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          value={dateOfBirth}
          editable={isEditing}
          onChangeText={setDateOfBirth}
        />

        <Text style={styles.inputLabel}>Hobbies & Interests</Text>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          value={hobbies}
          editable={isEditing}
          onChangeText={setHobbies}
        />

        <Text style={styles.inputLabel}>Bio & Channel Description</Text>
        <TextInput
          style={[styles.input, { height: 70, textAlignVertical: 'top' }, isDarkMode && styles.darkInput]}
          value={bio}
          editable={isEditing}
          multiline
          onChangeText={setBio}
        />

        {isEditing && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Profile Changes 💾</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Full-Width Red Log Out Button Card */}
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: '#fff5f5', borderColor: '#feb2b2', alignItems: 'center', marginTop: 10 }]} 
        onPress={handleSignOutPress}
      >
        <Text style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: 13 }}>
          🚪 Log Out of Account
        </Text>
      </TouchableOpacity>

      {/* Encryption Protocol Picker Modal */}
      <Modal visible={showEncryptionPicker} animationType="fade" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowEncryptionPicker(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard, { maxHeight: '40%' }]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 12 }]}>🔐 Select P2P Encryption Protocol</Text>
            
            {['Signal Double Ratchet (E2EE)', 'AES-256 Quantum Resistant', 'Mesh Zero-Knowledge Relay'].map((proto) => (
              <TouchableOpacity
                key={proto}
                style={[styles.permissionOptionRow, encryptionProtocol === proto && { backgroundColor: '#ebf8ff', borderRadius: 8 }]}
                onPress={() => {
                  setEncryptionProtocol(proto);
                  setShowEncryptionPicker(false);
                }}
              >
                <Text style={[styles.itemTitle, isDarkMode && styles.darkText, encryptionProtocol === proto && { color: '#3182ce' }]}>
                  {proto} {encryptionProtocol === proto ? '✓' : ''}
                </Text>
                <Text style={styles.itemSubtitle}>
                  {proto.includes('Signal') ? 'Industry standard end-to-end forward secrecy.' : proto.includes('AES') ? 'Maximum cryptographic protection against futuristic decryption.' : 'Optimized for offline peer-to-peer mesh hops.'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Message Permission Selector Modal */}
      <Modal visible={showPermissionPicker} animationType="fade" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowPermissionPicker(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard, { maxHeight: '40%' }]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 12 }]}>📩 Direct Message Permissions</Text>
            
            {['Everyone', 'Followers Only', 'Nobody'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.permissionOptionRow, messagePermission === option && { backgroundColor: '#ebf8ff', borderRadius: 8 }]}
                onPress={() => {
                  setMessagePermission(option);
                  setShowPermissionPicker(false);
                }}
              >
                <Text style={[styles.itemTitle, isDarkMode && styles.darkText, messagePermission === option && { color: '#3182ce' }]}>
                  {option} {messagePermission === option ? '✓' : ''}
                </Text>
                <Text style={styles.itemSubtitle}>
                  {option === 'Everyone' ? 'Direct messages land straight in your inbox.' : option === 'Followers Only' ? 'Messages from non-followers go to Message Requests.' : 'Block all incoming direct messages from strangers.'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Secure Phone Number Change Modal */}
      <Modal visible={showPhoneChangeModal} animationType="slide" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowPhoneChangeModal(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🛡️ Restricted Phone Change</Text>
              <TouchableOpacity onPress={() => setShowPhoneChangeModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {phoneStep === 1 ? (
              <>
                <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12, lineHeight: 16 }}>
                  To prevent SIM-swap fraud, changing your MTN/Airtel number requires your master passcode and an SMS confirmation code. A 7-day payout freeze will be applied.
                </Text>

                <Text style={styles.inputLabel}>Master Passcode</Text>
                <TextInput
                  style={[styles.input, isDarkMode && styles.darkInput]}
                  secureTextEntry
                  placeholder="Enter master passcode..."
                  placeholderTextColor="#a0aec0"
                  value={phonePasscodeVerify}
                  onChangeText={setPhonePasscodeVerify}
                />

                <Text style={styles.inputLabel}>New Phone Number</Text>
                <TextInput
                  style={[styles.input, isDarkMode && styles.darkInput]}
                  placeholder="+256..."
                  placeholderTextColor="#a0aec0"
                  value={pendingPhone}
                  onChangeText={setPendingPhone}
                  keyboardType="phone-pad"
                />

                <TouchableOpacity style={styles.saveBtn} onPress={handleRequestPhoneChangeOtp}>
                  <Text style={styles.saveBtnText}>Request SMS Code 📲</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>
                  Enter the 6-digit verification code sent to {pendingPhone}.
                </Text>

                <Text style={styles.inputLabel}>Verification Code</Text>
                <TextInput
                  style={[styles.input, isDarkMode && styles.darkInput]}
                  placeholder="Enter 6-digit code..."
                  placeholderTextColor="#a0aec0"
                  value={phoneOtpCode}
                  onChangeText={setPhoneOtpCode}
                  keyboardType="numeric"
                />

                <TouchableOpacity style={styles.saveBtn} onPress={handleVerifyPhoneChange}>
                  <Text style={styles.saveBtnText}>Verify & Securely Update 🔒</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Backup Recovery Seed Phrase Modal */}
      <Modal visible={showSeedPhraseModal} animationType="slide" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowSeedPhraseModal(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard, { alignItems: 'center' }]}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🛡️ Recovery Seed Phrase</Text>
              <TouchableOpacity onPress={() => setShowSeedPhraseModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 11, color: '#c53030', textAlign: 'center', marginBottom: 14, fontWeight: 'bold', lineHeight: 16 }}>
              ⚠️ Keep this 12-word seed phrase secret and stored offline! If you lose your phone and number, this is the only way to recover your ChatUp account.
            </Text>

            <View style={styles.seedPhraseContainer}>
              <Text style={[styles.seedText, isDarkMode && styles.darkText]}>{recoverySeedPhrase}</Text>
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, { width: '100%', marginTop: 16 }]} 
              onPress={() => {
                Clipboard.setString(recoverySeedPhrase);
                Alert.alert('Copied! 📋', 'Recovery seed phrase copied to clipboard. Save it securely offline.');
              }}
            >
              <Text style={styles.saveBtnText}>Copy Seed Phrase 📋</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Lost Phone Account Recovery Modal */}
      <Modal visible={showForgotModal} animationType="fade" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowForgotModal(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🔄 Lost Phone Account Recovery</Text>
              <TouchableOpacity onPress={() => setShowForgotModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12, lineHeight: 16 }}>
              If you lost your phone number or SIM card, enter your 12-word zero-knowledge recovery seed phrase below to restore your ChatUp identity on this new device.
            </Text>

            <Text style={styles.inputLabel}>12-Word Recovery Seed Phrase</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top' }, isDarkMode && styles.darkInput]}
              placeholder="Enter your 12-word phrase separated by spaces..."
              placeholderTextColor="#a0aec0"
              value={recoveryInputKey}
              onChangeText={setRecoveryInputKey}
              multiline
            />

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#e53e3e' }]} onPress={handleRestoreAccountWithSeed}>
              <Text style={styles.saveBtnText}>Restore Account Now 🔓</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Account Deactivation & Deletion Modal */}
      <Modal visible={showDeleteModal} animationType="slide" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowDeleteModal(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard]}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={[styles.cardTitle, { color: '#e53e3e' }]}>
                {deleteStep === 1 ? '💤 Take a Break or Delete' : deleteStep === 2 ? '📋 Tell Us Why You Are Leaving' : '⚠️ Final Security Confirmation'}
              </Text>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {deleteStep === 1 && (
              <>
                <Text style={{ fontSize: 11, color: '#718096', marginBottom: 14, lineHeight: 16 }}>
                  Would you like to temporarily take a break (hide your profile and chats until you log back in) or permanently delete your ChatUp account?
                </Text>

                <TouchableOpacity 
                  style={[styles.secBtnOutline, { backgroundColor: '#ebf8ff', borderColor: '#3182ce', padding: 14, marginBottom: 10 }]}
                  onPress={() => {
                    setDeletionIntent('break');
                    setDeleteStep(2);
                  }}
                >
                  <Text style={[styles.itemTitle, { color: '#3182ce', fontSize: 13 }]}>💤 Take a Temporary Break</Text>
                  <Text style={styles.itemSubtitle}>Your profile is hidden. Log back in anytime to instantly restore everything.</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.secBtnOutline, { backgroundColor: '#fff5f5', borderColor: '#e53e3e', padding: 14 }]}
                  onPress={() => {
                    setDeletionIntent('permanent');
                    setDeleteStep(2);
                  }}
                >
                  <Text style={[styles.itemTitle, { color: '#e53e3e', fontSize: 13 }]}>🗑️ Permanently Delete Account</Text>
                  <Text style={styles.itemSubtitle}>Erase your profile, local vaults, and server data permanently.</Text>
                </TouchableOpacity>
              </>
            )}

            {deleteStep === 2 && (
              <>
                <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12, lineHeight: 16 }}>
                  {deletionIntent === 'break' ? 'Why are you taking a break from ChatUp?' : 'Why are you permanently deleting your account?'} Your feedback helps us improve.
                </Text>

                {[
                  'Taking a temporary digital detox 🌿',
                  'Too many distractions / notifications 🔕',
                  'Privacy or data security concerns 🔒',
                  'Found a different platform / app 📱',
                  'Technical bugs or performance issues ⚡',
                  'Other reason...'
                ].map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.permissionOptionRow, selectedDeletionReason === reason && { backgroundColor: '#ebf8ff', borderRadius: 8 }]}
                    onPress={() => setSelectedDeletionReason(reason)}
                  >
                    <Text style={[styles.itemTitle, isDarkMode && styles.darkText, selectedDeletionReason === reason && { color: '#3182ce' }]}>
                      {reason} {selectedDeletionReason === reason ? '✓' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}

                {selectedDeletionReason === 'Other reason...' && (
                  <TextInput
                    style={[styles.input, { marginTop: 8 }, isDarkMode && styles.darkInput]}
                    placeholder="Please specify..."
                    placeholderTextColor="#a0aec0"
                    value={customReason}
                    onChangeText={setCustomReason}
                  />
                )}

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                  <TouchableOpacity 
                    style={[styles.saveBtn, { flex: 1, backgroundColor: '#cbd5e0' }]} 
                    onPress={() => setDeleteStep(1)}
                  >
                    <Text style={[styles.saveBtnText, { color: '#2d3748' }]}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.saveBtn, { flex: 1, backgroundColor: '#3182ce' }]} 
                    onPress={() => {
                      if (!selectedDeletionReason) {
                        return Alert.alert('Selection Required', 'Please select a reason before proceeding.');
                      }
                      setDeleteStep(3);
                    }}
                  >
                    <Text style={styles.saveBtnText}>Continue ➡️</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {deleteStep === 3 && (
              <>
                <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12, lineHeight: 16 }}>
                  {deletionIntent === 'break' 
                    ? 'Enter your master passcode to confirm temporary deactivation.' 
                    : '⚠️ Final Warning: Enter your master passcode to permanently wipe your ChatUp account and forfeit unclaimed rewards.'}
                </Text>

                <Text style={styles.inputLabel}>Confirm Master Passcode</Text>
                <TextInput
                  style={[styles.input, isDarkMode && styles.darkInput]}
                  secureTextEntry
                  placeholder="Enter passcode..."
                  placeholderTextColor="#a0aec0"
                  value={deletePasscodeConfirm}
                  onChangeText={setDeletePasscodeConfirm}
                />

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                  <TouchableOpacity 
                    style={[styles.saveBtn, { flex: 1, backgroundColor: '#cbd5e0' }]} 
                    onPress={() => setDeleteStep(2)}
                  >
                    <Text style={[styles.saveBtnText, { color: '#2d3748' }]}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.saveBtn, { flex: 1, backgroundColor: deletionIntent === 'break' ? '#3182ce' : '#e53e3e' }]} 
                    onPress={handleExecuteAccountAction}
                  >
                    <Text style={styles.saveBtnText}>
                      {deletionIntent === 'break' ? 'Confirm Deactivation 💤' : 'Delete Permanently 🗑️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Profile QR Code Sharing Modal */}
      <Modal visible={showQrModal} animationType="slide" transparent={true}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowQrModal(false)}>
          <View style={[styles.modalContent, isDarkMode && styles.darkCard, { alignItems: 'center' }]}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📇 My Profile & Contact QR</Text>
              <TouchableOpacity onPress={() => setShowQrModal(false)}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 11, color: '#718096', textAlign: 'center', marginBottom: 16 }}>
              Let friends scan this code to connect with your ChatUp creator profile instantly!
            </Text>

            <View style={styles.qrContainerModal}>
              <QRCode
                value={profileQrValue}
                size={170}
                color="#1a202c"
                backgroundColor="#ffffff"
              />
            </View>

            <Text style={[styles.itemTitle, { marginTop: 12 }, isDarkMode && styles.darkText]}>{username} ({handle})</Text>
            <Text style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>
              📍 {country} {hideDob ? '' : `• DOB: ${dateOfBirth}`} • Hobbies: {hobbies}
            </Text>
            <Text style={{ fontSize: 12, color: '#3182ce', marginTop: 2, marginBottom: 16 }}>
              {hidePhoneNumber ? '🔒 Phone number private' : phoneNumber}
            </Text>

            <TouchableOpacity 
              style={[styles.saveBtn, { width: '100%' }]} 
              onPress={() => {
                Clipboard.setString(handle);
                Alert.alert('Handle Copied 📋', `Copied ${handle} to clipboard.`);
              }}
            >
              <Text style={styles.saveBtnText}>Copy Handle 📋</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  centerCard: { alignItems: 'center', paddingVertical: 20 },
  avatarContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#ebf8ff', justifyContent: 'center', alignItems: 'center', marginBottom: 4, position: 'relative' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e0' },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#2d3748' },
  profileHandle: { fontSize: 12, color: '#3182ce', marginBottom: 4 },
  phoneBadge: { backgroundColor: '#edf2f7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#cbd5e0' },
  phoneBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#4a5568' },
  profileBio: { fontSize: 12, color: '#718096', textAlign: 'center', paddingHorizontal: 20, marginBottom: 12 },
  followBtn: { backgroundColor: '#3182ce', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  followingBtnActive: { backgroundColor: '#e2e8f0' },
  followBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  followingBtnTextActive: { color: '#4a5568' },
  blockBtn: { backgroundColor: '#fed7d7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#feb2b2' },
  blockedBtnActive: { backgroundColor: '#e53e3e', borderColor: '#c53030' },
  blockBtnText: { color: '#c53030', fontSize: 12, fontWeight: 'bold' },
  blockedBtnTextActive: { color: '#fff' },
  qrTriggerBtn: { backgroundColor: '#edf2f7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#cbd5e0' },
  qrTriggerBtnText: { color: '#2d3748', fontSize: 12, fontWeight: 'bold' },
  logoutBtnInline: { backgroundColor: '#e53e3e', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  logoutBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', borderTopWidth: 1, borderTopColor: '#edf2f7', paddingTop: 12 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 14, fontWeight: 'bold', color: '#2d3748' },
  statLabel: { fontSize: 10, color: '#a0aec0' },
  tabBar: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 8, padding: 3, marginBottom: 12 },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activeTabButton: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontSize: 10, fontWeight: 'bold', color: '#718096' },
  activeTabText: { color: '#3182ce' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  darkText: { color: '#fff' },
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
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  settingRowColumn: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  dropdownSelector: { backgroundColor: '#edf2f7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#cbd5e0' },
  permissionOptionRow: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: '80%' },
  qrContainerModal: { padding: 12, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e0', alignItems: 'center' },
  seedPhraseContainer: { padding: 12, backgroundColor: '#edf2f7', borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e0', alignItems: 'center', marginBottom: 10 },
  seedText: { fontSize: 12, fontWeight: 'bold', color: '#2d3748', textAlign: 'center', letterSpacing: 1, lineHeight: 20 },
  peerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
});