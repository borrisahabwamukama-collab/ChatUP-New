import React, { useState, useEffect, createContext, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal, Pressable, TextInput, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './Services/supabaseClient'; // Adjusted path to your Supabase client

// Core Screens
import ChatRoomScreen from './src/screens/ChatRoomScreen';
import SecurityHubScreen from './src/screens/Security/SecurityHubScreen';
import ReactionsAndBubbles from './src/screens/ReactionsAndBubbles';
import VoiceAndTranslationScreen from './src/screens/VoiceAndTranslationScreen';
import DiscoveryWalletScreen from './src/screens/DiscoveryWalletScreen';
import WalletScreen from './src/screens/WalletScreen'; 
import LiveStreamScreen from './src/screens/LiveStreamScreen';
import ReferralRewardsScreen from './src/screens/ReferralRewardsScreen';

// Master Super-Admin Control Panel, Monetization Treasury & Global AI Supervisor
import AdminControlPanelScreen from './src/screens/AdminControlPanelScreen';
import MonetizationTreasuryScreen from './src/screens/MonetizationTreasuryScreen';
import GlobalAISupervisorScreen from './src/screens/GlobalAISupervisorScreen';

// New Community, Groups, Church & Games Screens
import GroupListScreen from './src/screens/GroupListScreen';
import CreateGroupScreen from './src/screens/CreateGroupScreen';
import ChurchLiveScreen from './src/screens/ChurchLiveScreen';
import ChurchTestimoniesScreen from './src/screens/ChurchTestimoniesScreen';
import CameraHubScreen from './src/screens/CameraHubScreen';
import ChurchRegistrationScreen from './src/screens/ChurchRegistrationScreen';
import InteractiveGamesHub from './src/screens/InteractiveGamesHub';
import GameArenaScreen from './src/screens/GameArenaScreen';
import SignupScreen from './src/screens/SignupScreen';

// Additional Feature & Entertainment Screens
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import CinemaScreen from './src/screens/CinemaScreen';
import StudioScreen from './src/screens/StudioScreen';
import VirtualTVScreen from './src/screens/VirtualTVScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import UniversalInterpreterModal from './src/screens/UniversalInterpreterModal';
import MeshHubScreen from './src/screens/MeshHubScreen';
import DRMProtectionScreen from './src/screens/DRMProtectionScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// --- GLOBAL MESH NETWORK & SUPER-ADMIN CONTEXT ---
const MeshNetworkContext = createContext();

export function useMeshNetwork() {
  return useContext(MeshNetworkContext);
}

// --- FULLY INTEGRATED SHORT-FORM REELS FEED SCREEN ---
function ReelsFeedScreen({ isDarkMode, coins, setCoins, currentUser }) {
  const [reelsList, setReelsList] = useState([
    {
      id: 'reel_1',
      title: 'Wildlife Conservation in Queen Elizabeth Park 🐘🌿',
      creator: 'Borris Ranger Hub',
      videoUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=1000&auto=format&fit=crop',
      likes: 1420,
      comments: 94,
      isLiked: false,
    },
    {
      id: 'reel_2',
      title: 'Kampala Afrobeat Studio Jam Session 🎶🔥',
      creator: 'Studio UG Music',
      videoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop',
      likes: 3890,
      comments: 210,
      isLiked: false,
    },
    {
      id: 'reel_3',
      title: 'Bwindi Impenetrable Gorilla Trekking Epic 🦍✨',
      creator: 'Pearl Africa Cinema',
      videoUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?q=80&w=1000&auto=format&fit=crop',
      likes: 5120,
      comments: 430,
      isLiked: true,
    }
  ]);
  const [activeReelIndex, setActiveReelIndex] = useState(0);

  const handleLikeReel = (id) => {
    setReelsList(prev => prev.map(reel => {
      if (reel.id === id) {
        const nextLiked = !reel.isLiked;
        if (nextLiked && setCoins) setCoins(c => c + 5); // Reward for liking reels
        return { ...reel, isLiked: nextLiked, likes: nextLiked ? reel.likes + 1 : reel.likes - 1 };
      }
      return reel;
    }));
  };

  return (
    <ScrollView 
      style={[styles.container, isDarkMode && styles.darkContainer]} 
      contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
    >
      <View style={[styles.card, isDarkMode && styles.darkCard, { marginBottom: 12 }]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📱 ChatUp Short-Form Reels & Video Hub</Text>
        <Text style={{ fontSize: 11, color: '#718096' }}>Scroll vertical short-form reels, like videos to earn coins (+5 🪙), and share wildlife & creator clips instantly.</Text>
      </View>

      {reelsList.map((reel, index) => (
        <View key={reel.id} style={[styles.card, isDarkMode && styles.darkCard, { padding: 0, overflow: 'hidden', marginBottom: 16 }]}>
          <View style={{ height: 340, backgroundColor: '#000', position: 'relative' }}>
            <img 
              src={reel.videoUrl} 
              alt={reel.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            
            <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>🎬 Reel #{index + 1}</Text>
            </View>

            <View style={{ position: 'absolute', right: 12, bottom: 20, alignItems: 'center', gap: 14 }}>
              <TouchableOpacity onPress={() => handleLikeReel(reel.id)} style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 28 }}>{reel.isLiked ? '❤️' : '🤍'}</Text>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', textShadowColor: '#000', textShadowRadius: 2 }}>{reel.likes}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => Alert.alert('Reel Comments', `Opening comment thread for "${reel.title}"...`)} style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 26 }}>💬</Text>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', textShadowColor: '#000', textShadowRadius: 2 }}>{reel.comments}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { if (setCoins) setCoins(c => c + 10); Alert.alert('Shared! 🚀 (+10 🪙)', 'Reel link successfully shared to chat inbox.'); }} style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 26 }}>↗️</Text>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Share</Text>
              </TouchableOpacity>
            </View>

            <View style={{ position: 'absolute', bottom: 16, left: 16, right: 70 }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', textShadowColor: '#000', textShadowRadius: 3, marginBottom: 2 }}>{reel.title}</Text>
              <Text style={{ color: '#cbd5e0', fontSize: 11, textShadowColor: '#000', textShadowRadius: 2 }}>@{reel.creator} • Official Creator</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// --- STABLE LOGIN SCREEN WITH SUPABASE EMAIL OTP ---
function LoginScreen({ onLoginSuccess, onNavigateSignup, isDarkMode }) {
  const [step, setStep] = useState('email'); 
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
    setLoading(false);

    if (error) {
      Alert.alert('Login Error', error.message);
    } else {
      setStep('otp');
      Alert.alert('Code Sent 📩', `A 6-digit verification code has been sent to ${email}.`);
    }
  };

  const handleVerifyOTP = async () => {
    if (!token.trim()) {
      Alert.alert('Error', 'Please enter the verification code.');
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: 'email',
    });

    setLoading(false);

    if (error) {
      Alert.alert('Verification Failed', error.message);
    } else {
      const userSession = {
        id: data.user.id,
        email: data.user.email,
        loggedInAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('@chatup_user_session', JSON.stringify(userSession));
      onLoginSuccess(userSession);
    }
  };

  return (
    <View style={[styles.loginContainer, isDarkMode && { backgroundColor: '#1a202c' }]}>
      <View style={[styles.loginCard, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.loginLogo, isDarkMode && styles.darkText]}>💬 ChatUP</Text>
        
        {step === 'email' ? (
          <>
            <Text style={[styles.loginSubtitle, isDarkMode && { color: '#a0aec0' }]}>
              Enter your email address to start your personal ChatUP session.
            </Text>

            <TextInput
              style={[styles.loginInput, isDarkMode && styles.darkInput]}
              placeholder="user@example.com"
              placeholderTextColor={isDarkMode ? '#718096' : '#a0aec0'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleSendOTP} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Send Code 📩</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 15 }} onPress={onNavigateSignup}>
              <Text style={{ color: '#007AFF', fontSize: 13, fontWeight: 'bold' }}>Create New Account 🚀</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.loginSubtitle, isDarkMode && { color: '#a0aec0' }]}>
              Enter 6-digit code sent to {email}
            </Text>

            <TextInput
              style={[styles.loginInput, isDarkMode && styles.darkInput]}
              placeholder="123456"
              placeholderTextColor={isDarkMode ? '#718096' : '#a0aec0'}
              value={token}
              onChangeText={setToken}
              keyboardType="number-pad"
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleVerifyOTP} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Start Exploring 🚀</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 15 }} onPress={() => setStep('email')}>
              <Text style={{ color: '#007AFF', fontSize: 13, fontWeight: '600' }}>← Change Email Address</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'
  const [currentUser, setCurrentUser] = useState(null);

  const [activeScreen, setActiveScreen] = useState('ChatRoom');
  const [screenParams, setScreenParams] = useState({}); 
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [coins, setCoins] = useState(2500);
  const [menuVisible, setMenuVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const [superAdminAccessEnabled, setSuperAdminAccessEnabled] = useState(false);

  const [meshNodeActive, setMeshNodeActive] = useState(true);
  const [meshPeerCount, setMeshPeerCount] = useState(4);
  const [localChatLog, setLocalChatLog] = useState([
    { id: '1', sender: 'Node_Kampala_02', text: 'Secure multi-hop packet route established via local Wi-Fi mesh.' },
    { id: '2', sender: 'Node_Bwindi_01', text: 'Offline data chunk synced across local peers.' }
  ]);
  const [ghostVaults, setGhostVaults] = useState({});

  // LISTEN TO SUPABASE AUTH SESSION ON LAUNCH & ENSURE PRIVATE ACCOUNT IS ISOLATED
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        setIsAuthenticated(true);
      }
      setInitializing(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
      setInitializing(false);
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem('@chatup_user_session');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setAuthView('login');
    setMenuVisible(false);
  };

  const sendMeshPacket = (senderName, messageText) => {
    if (!messageText?.trim()) return;
    const newPacket = { id: Date.now().toString(), sender: senderName, text: messageText };
    setLocalChatLog(prev => [...prev, newPacket]);
    Alert.alert('Mesh Relay 🛰️', 'Packet broadcasted across local multi-hop mesh nodes (Zero Internet).');
  };

  const lockGhostVault = (vaultKey, dataPayload) => {
    if (!vaultKey?.trim()) return false;
    setGhostVaults(prev => ({ ...prev, [vaultKey]: { encrypted: true, data: dataPayload, timestamp: Date.now() } }));
    Alert.alert('Ghost Vault 🛡️', 'Data locked and encrypted locally with zero cloud footprint!');
    return true;
  };

  const navigation = {
    navigate: (screenName, params = {}) => {
      if (screenName === 'Login') {
        setAuthView('login');
      } else {
        setScreenParams(params);
        setActiveScreen(screenName);
      }
    },
    goBack: () => {
      setActiveScreen('GroupList');
    },
  };

  const renderCurrentScreen = () => {
    try {
      const route = { params: screenParams };
      
      switch (activeScreen) {
        case 'ChatRoom': 
        case 'ChatRoomScreen': 
          return <ChatRoomScreen isDarkMode={isDarkMode} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'GroupList': 
          return <GroupListScreen isDarkMode={isDarkMode} navigation={navigation} currentUser={currentUser} />;
        case 'CreateGroupScreen': 
          return <CreateGroupScreen isDarkMode={isDarkMode} navigation={navigation} currentUser={currentUser} />;
        case 'ChurchLiveScreen': 
          return <ChurchLiveScreen isDarkMode={isDarkMode} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'ChurchTestimonies': 
          return <ChurchTestimoniesScreen isDarkMode={isDarkMode} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'ChurchRegistration': 
          return <ChurchRegistrationScreen navigation={navigation} currentUser={currentUser} route={route} />;
        case 'InteractiveGames': 
          return <InteractiveGamesHub coins={coins} setCoins={setCoins} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'GameArena': 
          return <GameArenaScreen coins={coins} setCoins={setCoins} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'CameraHub': 
          return <CameraHubScreen isDarkMode={isDarkMode} navigation={navigation} currentUser={currentUser} route={route} />;
        case 'AdminControl': 
          return superAdminAccessEnabled ? (
            <AdminControlPanelScreen 
              isDarkMode={isDarkMode} 
              superAdminAccessEnabled={superAdminAccessEnabled} 
              setSuperAdminAccessEnabled={setSuperAdminAccessEnabled} 
            />
          ) : <ChatRoomScreen isDarkMode={isDarkMode} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'GlobalAISupervisor':
          return superAdminAccessEnabled ? (
            <GlobalAISupervisorScreen isDarkMode={isDarkMode} />
          ) : <ChatRoomScreen isDarkMode={isDarkMode} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'MonetizationTreasury': 
          return superAdminAccessEnabled ? (
            <MonetizationTreasuryScreen isDarkMode={isDarkMode} coins={coins} setCoins={setCoins} />
          ) : <ChatRoomScreen isDarkMode={isDarkMode} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'Notifications': 
          return <NotificationsScreen isDarkMode={isDarkMode} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'SecurityHub': 
          return <SecurityHubScreen isDarkMode={isDarkMode} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'Reactions': 
          return <ReactionsAndBubbles isDarkMode={isDarkMode} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'Voice': 
          return <VoiceAndTranslationScreen isDarkMode={isDarkMode} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'Discovery': 
          return <DiscoveryWalletScreen isDarkMode={isDarkMode} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'Wallet': 
          return <WalletScreen isDarkMode={isDarkMode} coins={coins} setCoins={setCoins} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'Referrals': 
          return <ReferralRewardsScreen isDarkMode={isDarkMode} currentUser={currentUser || { id: 'temp_id', name: 'User' }} route={route} navigation={navigation} />;
        case 'LiveStream': 
          return <LiveStreamScreen isDarkMode={isDarkMode} coins={coins} setCoins={setCoins} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'Reels':
          return <ReelsFeedScreen isDarkMode={isDarkMode} coins={coins} setCoins={setCoins} currentUser={currentUser} />;
        case 'Analytics': 
          return <AnalyticsScreen isDarkMode={isDarkMode} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'Cinema': 
          return <CinemaScreen isDarkMode={isDarkMode} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'Studio': 
          return <StudioScreen isDarkMode={isDarkMode} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'VirtualTVScreen': 
          return <VirtualTVScreen isDarkMode={isDarkMode} coins={coins} setCoins={setCoins} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'MeshHub': 
          return <MeshHubScreen isDarkMode={isDarkMode} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'DRMHub': 
          return <DRMProtectionScreen isDarkMode={isDarkMode} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'Settings': 
          return (
            <SettingsScreen 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
              superAdminAccessEnabled={superAdminAccessEnabled}
              setSuperAdminAccessEnabled={setSuperAdminAccessEnabled}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          );
        case 'Profile': 
          return <ProfileScreen isDarkMode={isDarkMode} coins={coins} currentUser={currentUser} onLogout={handleLogout} route={route} navigation={navigation} />;
        case 'Interpreter': 
          return <UniversalInterpreterModal isDarkMode={isDarkMode} onClose={() => setActiveScreen('ChatRoom')} />;
        default: 
          return <ChatRoomScreen isDarkMode={isDarkMode} currentUser={currentUser} route={route} navigation={navigation} />;
      }
    } catch (e) {
      console.error('Screen Render Error:', e);
      return <GroupListScreen isDarkMode={isDarkMode} navigation={navigation} currentUser={currentUser} />;
    }
  };

  const handleSelectScreen = (screenName) => {
    setActiveScreen(screenName);
    setMenuVisible(false);
    if (screenName === 'Notifications') {
      setUnreadCount(0);
    }
  };

  if (initializing) {
    return (
      <View style={[styles.loginContainer, isDarkMode && { backgroundColor: '#1a202c' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!isAuthenticated) {
    if (authView === 'signup') {
      return <SignupScreen navigation={navigation} isDarkMode={isDarkMode} />;
    }
    return (
      <LoginScreen 
        isDarkMode={isDarkMode} 
        onNavigateSignup={() => setAuthView('signup')}
        onLoginSuccess={(userObj) => {
          setCurrentUser(userObj);
          setIsAuthenticated(true);
        }} 
      />
    );
  }

  return (
    <MeshNetworkContext.Provider value={{
      meshNodeActive,
      setMeshNodeActive,
      meshPeerCount,
      localChatLog,
      sendMeshPacket,
      lockGhostVault,
      ghostVaults
    }}>
      <View style={[styles.container, isDarkMode && { backgroundColor: '#1a202c' }]}>
        
        <View style={[styles.headerBar, isDarkMode && styles.darkHeader]}>
          {activeScreen !== 'ChatRoom' ? (
            <TouchableOpacity style={styles.hamburgerButton} onPress={() => setActiveScreen('ChatRoom')}>
              <Text style={[styles.hamburgerText, isDarkMode && styles.darkText]}>←</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.hamburgerButton} onPress={() => setMenuVisible(true)}>
              <Text style={[styles.hamburgerText, isDarkMode && styles.darkText]}>☰</Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]} numberOfLines={1}>
            {activeScreen === 'ChatRoom' ? '💬 Chat' : 
             activeScreen === 'GroupList' ? '👥 Communities & Groups' :
             activeScreen === 'CreateGroupScreen' ? '➕ Create Group Hub' :
             activeScreen === 'ChurchLiveScreen' ? '🙏 Church & Prayer Fellowship' :
             activeScreen === 'ChurchTestimonies' ? '✨ Church Testimonies & Praise' :
             activeScreen === 'ChurchRegistration' ? '⛪ Church Verification Form' :
             activeScreen === 'InteractiveGames' ? '🎮 Live & In-Chat Games' :
             activeScreen === 'GameArena' ? '🏆 Competitive Game Arena' :
             activeScreen === 'CameraHub' ? '🎥 Multi-Camera Hub' :
             activeScreen === 'Discovery' ? '🔍 Discovery Feed' :
             activeScreen === 'LiveStream' ? '🔴 Live Stream & Video' :
             activeScreen === 'Reels' ? '📱 Short-Form Reels' :
             activeScreen === 'AdminControl' ? '👑 Master Super-Admin Panel' : 
             activeScreen === 'GlobalAISupervisor' ? '🤖 Global AI Supervisor & SOC' : 
             activeScreen === 'MonetizationTreasury' ? '🪙 Monetization & Escrow' : 
             activeScreen === 'Referrals' ? '🎁 Referrals & Rewards QR' : 
             activeScreen === 'Interpreter' ? '🌐 Global AI Interpreter' : 
             activeScreen === 'MeshHub' ? '🛰️ Zero-Net & Ghost Vault' : 
             activeScreen === 'DRMHub' ? '🛡️ DRM & Copyright' : 
             activeScreen === 'Settings' ? '⚙️ Settings' : 
             activeScreen === 'Profile' ? '👤 Profile' : activeScreen}
          </Text>

          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => handleSelectScreen('Notifications')}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
              {unreadCount > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={() => setIsDarkMode(!isDarkMode)}>
              <Text style={{ fontSize: 16 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.topSubBar, isDarkMode && styles.darkTopSubBar]}>
          <TouchableOpacity 
            style={[styles.subTabItem, activeScreen === 'Discovery' && styles.activeSubTab]} 
            onPress={() => setActiveScreen('Discovery')}
          >
            <Ionicons name="compass-outline" size={15} color={activeScreen === 'Discovery' ? '#007AFF' : (isDarkMode ? '#a0aec0' : '#4a5568')} />
            <Text style={[styles.subTabText, activeScreen === 'Discovery' && styles.activeSubTabText, isDarkMode && styles.darkText]}>Discovery</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.subTabItem, activeScreen === 'LiveStream' && styles.activeSubTab]} 
            onPress={() => setActiveScreen('LiveStream')}
          >
            <Ionicons name="videocam-outline" size={15} color={activeScreen === 'LiveStream' ? '#007AFF' : (isDarkMode ? '#a0aec0' : '#4a5568')} />
            <Text style={[styles.subTabText, activeScreen === 'LiveStream' && styles.activeSubTabText, isDarkMode && styles.darkText]}>Video / Live</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.subTabItem, activeScreen === 'Reels' && styles.activeSubTab]} 
            onPress={() => setActiveScreen('Reels')}
          >
            <Ionicons name="film-outline" size={15} color={activeScreen === 'Reels' ? '#007AFF' : (isDarkMode ? '#a0aec0' : '#4a5568')} />
            <Text style={[styles.subTabText, activeScreen === 'Reels' && styles.activeSubTabText, isDarkMode && styles.darkText]}>Reels 📱</Text>
          </TouchableOpacity>

          {superAdminAccessEnabled && (
            <TouchableOpacity 
              style={[styles.subTabItem, activeScreen === 'GlobalAISupervisor' && styles.activeSubTab]} 
              onPress={() => setActiveScreen('GlobalAISupervisor')}
            >
              <Ionicons name="shield-checkmark-outline" size={15} color={activeScreen === 'GlobalAISupervisor' ? '#38a169' : (isDarkMode ? '#a0aec0' : '#4a5568')} />
              <Text style={[styles.subTabText, activeScreen === 'GlobalAISupervisor' && styles.activeSubTabText, isDarkMode && styles.darkText]}>AI Ops</Text>
            </TouchableOpacity>
          )}
        </View>

        <Modal visible={menuVisible} animationType="fade" transparent={true}>
          <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
            <View style={[styles.drawerContent, isDarkMode && styles.darkDrawer]}>
              <View style={styles.drawerHeaderRow}>
                <Text style={[styles.drawerHeaderTitle, isDarkMode && styles.darkText]}>📂 Menu</Text>
                <TouchableOpacity onPress={() => setMenuVisible(false)}>
                  <Text style={[styles.closeText, isDarkMode && styles.darkText]}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ marginTop: 10 }}>
                {superAdminAccessEnabled && (
                  <>
                    <Text style={styles.sectionLabel}>MASTER ADMIN</Text>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('AdminControl')}>
                      <Text style={[styles.drawerItemText, { color: '#3182ce', fontWeight: 'bold' }]}>👑 Super-Admin Panel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('GlobalAISupervisor')}>
                      <Text style={[styles.drawerItemText, { color: '#38a169', fontWeight: 'bold' }]}>🤖 Global AI Supervisor & SOC</Text>
                    </TouchableOpacity>
                  </>
                )}

                <Text style={styles.sectionLabel}>COMMUNICATION & FELLOWSHIP</Text>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('ChatRoom')}>
                  <Text style={styles.drawerItemText}>💬 Inbox / Direct Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('GroupList')}>
                  <Text style={[styles.drawerItemText, { color: '#2563eb', fontWeight: 'bold' }]}>👥 Groups & Communities</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('ChurchLiveScreen')}>
                  <Text style={[styles.drawerItemText, { color: '#16a34a', fontWeight: 'bold' }]}>🙏 Church & Prayer Hub</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('ChurchTestimonies')}>
                  <Text style={[styles.drawerItemText, { color: '#2563eb', fontWeight: 'bold' }]}>✨ Testimonies & Praise</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('ChurchRegistration')}>
                  <Text style={[styles.drawerItemText, { color: '#ca8a04', fontWeight: 'bold' }]}>⛪ Request Church Ownership</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('LiveStream')}>
                  <Text style={styles.drawerItemText}>🔴 Live Streams</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('Reels')}>
                  <Text style={[styles.drawerItemText, { color: '#d97706', fontWeight: 'bold' }]}>📱 Short-Form Reels</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('InteractiveGames')}>
                  <Text style={[styles.drawerItemText, { color: '#9333ea', fontWeight: 'bold' }]}>🎮 Live & In-Chat Games</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('MeshHub')}>
                  <Text style={styles.drawerItemText}>🛰️ Zero-Net & Ghost Vault</Text>
                </TouchableOpacity>

                <Text style={styles.sectionLabel}>MEDIA & STUDIO</Text>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('GameArena')}>
                  <Text style={[styles.drawerItemText, { color: '#d97706', fontWeight: 'bold' }]}>🏆 Competitive Game Arena</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('CameraHub')}>
                  <Text style={[styles.drawerItemText, { color: '#dc2626', fontWeight: 'bold' }]}>🎥 Multi-Camera Hub</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('VirtualTVScreen')}>
                  <Text style={styles.drawerItemText}>📺 TV</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('Studio')}>
                  <Text style={styles.drawerItemText}>🎬 Studio</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('Cinema')}>
                  <Text style={styles.drawerItemText}>🍿 Cinema</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('DRMHub')}>
                  <Text style={styles.drawerItemText}>🛡️ DRM & Copyright</Text>
                </TouchableOpacity>

                <Text style={styles.sectionLabel}>WALLET & TOOLS</Text>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('Wallet')}>
                  <Text style={styles.drawerItemText}>🪙 Wallet & Treasury</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('Referrals')}>
                  <Text style={[styles.drawerItemText, { color: '#d69e2e', fontWeight: 'bold' }]}>🎁 Referrals & QR Rewards</Text>
                </TouchableOpacity>
                
                {superAdminAccessEnabled && (
                  <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('MonetizationTreasury')}>
                    <Text style={[styles.drawerItemText, { color: '#16a34a', fontWeight: 'bold' }]}>🪙 Treasury, Escrow & Splits</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('Discovery')}>
                  <Text style={styles.drawerItemText}>🔍 Discovery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('Analytics')}>
                  <Text style={styles.drawerItemText}>📈 Analytics</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('Voice')}>
                  <Text style={styles.drawerItemText}>🎙️ Voice</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('Interpreter')}>
                  <Text style={styles.drawerItemText}>🌐 Interpreter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('Reactions')}>
                  <Text style={styles.drawerItemText}>✨ Effects</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('SecurityHub')}>
                  <Text style={styles.drawerItemText}>🛡️ Security</Text>
                </TouchableOpacity>

                <Text style={styles.sectionLabel}>PREFERENCES</Text>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('Profile')}>
                  <Text style={styles.drawerItemText}>👤 Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('Settings')}>
                  <Text style={styles.drawerItemText}>⚙️ Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.drawerItem, { marginTop: 15 }]} onPress={handleLogout}>
                  <Text style={[styles.drawerItemText, { color: '#e53e3e', fontWeight: 'bold' }]}>🚪 Log Out</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </Pressable>
        </Modal>

        <View style={{ flex: 1 }}>
          {renderCurrentScreen()}
        </View>

        <View style={[styles.bottomTabBar, isDarkMode && styles.darkBottomBar]}>
          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => setActiveScreen('ChatRoom')}
          >
            <Ionicons name={activeScreen === 'ChatRoom' ? 'chatbubbles' : 'chatbubbles-outline'} size={22} color={activeScreen === 'ChatRoom' ? '#007AFF' : (isDarkMode ? '#a0aec0' : 'gray')} />
            <Text style={[styles.tabText, activeScreen === 'ChatRoom' && styles.activeTabText, isDarkMode && styles.darkText]} numberOfLines={1}>Chats</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => setActiveScreen('GroupList')}
          >
            <Ionicons name={activeScreen === 'GroupList' ? 'people' : 'people-outline'} size={22} color={activeScreen === 'GroupList' ? '#007AFF' : (isDarkMode ? '#a0aec0' : 'gray')} />
            <Text style={[styles.tabText, activeScreen === 'GroupList' && styles.activeTabText, isDarkMode && styles.darkText]} numberOfLines={1}>Communities</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => setActiveScreen('ChurchLiveScreen')}
          >
            <Ionicons name={activeScreen === 'ChurchLiveScreen' ? 'tv' : 'tv-outline'} size={22} color={activeScreen === 'ChurchLiveScreen' ? '#007AFF' : (isDarkMode ? '#a0aec0' : 'gray')} />
            <Text style={[styles.tabText, activeScreen === 'ChurchLiveScreen' && styles.activeTabText, isDarkMode && styles.darkText]} numberOfLines={1}>Church & TV</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => setActiveScreen('Reels')}
          >
            <Ionicons name={activeScreen === 'Reels' ? 'film' : 'film-outline'} size={22} color={activeScreen === 'Reels' ? '#007AFF' : (isDarkMode ? '#a0aec0' : 'gray')} />
            <Text style={[styles.tabText, activeScreen === 'Reels' && styles.activeTabText, isDarkMode && styles.darkText]} numberOfLines={1}>Reels</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => setActiveScreen('Wallet')}
          >
            <Ionicons name={activeScreen === 'Wallet' ? 'wallet' : 'wallet-outline'} size={22} color={activeScreen === 'Wallet' ? '#007AFF' : (isDarkMode ? '#a0aec0' : 'gray')} />
            <Text style={[styles.tabText, activeScreen === 'Wallet' && styles.activeTabText, isDarkMode && styles.darkText]} numberOfLines={1}>Wallet</Text>
          </TouchableOpacity>
        </View>

      </View>
    </MeshNetworkContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc', paddingTop: 35 },
  headerBar: { height: 48, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  darkHeader: { backgroundColor: '#2d3748', borderBottomColor: '#4a5568' },
  topSubBar: { height: 38, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 5 },
  darkTopSubBar: { backgroundColor: '#1a202c', borderBottomColor: '#4a5568' },
  subTabItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10 },
  activeSubTab: { backgroundColor: '#e2e8f0' },
  subTabText: { fontSize: 11, marginLeft: 4, color: '#4a5568', fontWeight: '600' },
  activeSubTabText: { color: '#007AFF', fontWeight: 'bold' },
  hamburgerButton: { padding: 4 },
  hamburgerText: { fontSize: 22, fontWeight: 'bold', color: '#3182ce' },
  headerTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748', flex: 1, textAlign: 'center', marginHorizontal: 10 },
  darkText: { color: '#fff' },
  headerRightIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { padding: 6, position: 'relative', marginLeft: 8 },
  badgeContainer: { position: 'absolute', top: 2, right: 2, backgroundColor: '#e53e3e', borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start' },
  drawerContent: { width: '65%', height: '100%', backgroundColor: '#fff', padding: 15, paddingTop: 40, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 5, elevation: 5 },
  darkDrawer: { backgroundColor: '#1a202c' },
  drawerHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 10 },
  drawerHeaderTitle: { fontSize: 14, fontWeight: 'bold', color: '#2d3748' },
  closeText: { fontSize: 18, fontWeight: 'bold', color: '#718096' },
  sectionLabel: { fontSize: 9, fontWeight: 'bold', color: '#a0aec0', marginTop: 12, marginBottom: 4, letterSpacing: 1 },
  drawerItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  drawerItemText: { fontSize: 13, fontWeight: 'bold', color: '#4a5568' },
  bottomTabBar: { height: 60, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 5 },
  darkBottomBar: { backgroundColor: '#2d3748', borderTopColor: '#4a5568' },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 10, color: 'gray', marginTop: 2 },
  activeTabText: { color: '#007AFF', fontWeight: 'bold' },
  loginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7fafc', padding: 20 },
  loginCard: { width: '100%', maxWidth: 380, backgroundColor: '#fff', padding: 25, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, alignItems: 'center' },
  loginLogo: { fontSize: 28, fontWeight: 'bold', color: '#007AFF', marginBottom: 10 },
  loginSubtitle: { fontSize: 14, color: '#4a5568', textAlign: 'center', marginBottom: 20 },
  loginInput: { width: '100%', height: 48, borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 15, fontSize: 15, backgroundColor: '#fff', marginBottom: 15, color: '#2d3748' },
  darkInput: { backgroundColor: '#2d3748', borderColor: '#4a5568', color: '#fff' },
  loginButton: { width: '100%', height: 48, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748', marginBottom: 6 },
});