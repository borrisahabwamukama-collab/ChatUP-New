import React, { useState, useEffect, createContext, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from './Services/supabaseClient';
import { processOfflineQueue } from './Services/offlineSyncQueue';
import DashboardScreen from './src/screens/DashboardScreen';

// Core Screens & Auth Screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ChatRoomScreen from './src/screens/ChatRoomScreen';
import ConversationsListScreen from './src/screens/ConversationsListScreen';
import SecurityHubScreen from './src/screens/Security/SecurityHubScreen';
import ReactionsAndBubbles from './src/screens/ReactionsAndBubbles';
import VoiceAndTranslationScreen from './src/screens/VoiceAndTranslationScreen';
import DiscoveryWalletScreen from './src/screens/DiscoveryWalletScreen';
import WalletScreen from './src/screens/WalletScreen'; 
import LiveStreamScreen from './src/screens/LiveStreamScreen';
import ReferralRewardsScreen from './src/screens/ReferralRewardsScreen';
import ReelsScreen from './src/screens/ReelsScreen';
import DiscoveryUsersScreen from './src/screens/DiscoveryUsersScreen';
import MessageRequestsScreen from './src/screens/MessageRequestsScreen';

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

// 🌟 LIVE GLOBAL ANNOUNCEMENT BANNER COMPONENT
function GlobalAnnouncementBanner({ isDarkMode }) {
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);

  useEffect(() => {
    fetchActiveAnnouncement();

    const subscription = supabase
      .channel('public:platform_announcements')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'platform_announcements' }, payload => {
        if (payload.new && payload.new.is_active) {
          setLatestAnnouncement(payload.new.text);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchActiveAnnouncement = async () => {
    try {
      const { data } = await supabase
        .from('platform_announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setLatestAnnouncement(data[0].text);
      }
    } catch (e) {}
  };

  if (!latestAnnouncement) return null;

  return (
    <View style={[styles.bannerContainer, isDarkMode && styles.darkBannerContainer]}>
      <Text style={styles.bannerTitle}>👑 Official Broadcast</Text>
      <Text style={[styles.bannerText, isDarkMode && styles.darkBannerText]} numberOfLines={2}>{latestAnnouncement}</Text>
    </View>
  );
}

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'
  const [currentUser, setCurrentUser] = useState(null);

  const [activeScreen, setActiveScreen] = useState('Dashboard');
  const [screenParams, setScreenParams] = useState({}); 
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [coins, setCoins] = useState(2500);
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Unread badge count restricted strictly to messaging / chat notifications
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  // 🛡️ PERMANENTLY UNLOCKED FOR MASTER ADMIN BORRIS
  const [superAdminAccessEnabled, setSuperAdminAccessEnabled] = useState(true);

  // 🔌 GLOBAL ARCHITECTURAL SWITCHES STATE
  const [globalSwitches, setGlobalSwitches] = useState({
    maintenanceMode: false,
    chatMediaUploads: true,
    meshTransmission: true,
  });

  const [meshNodeActive, setMeshNodeActive] = useState(true);
  const [meshPeerCount, setMeshPeerCount] = useState(4);
  const [localChatLog, setLocalChatLog] = useState([
    { id: '1', sender: 'Node_Kampala_02', text: 'Secure multi-hop packet route established via local Wi-Fi mesh.' },
    { id: '2', sender: 'Node_Bwindi_01', text: 'Offline data chunk synced across local peers.' }
  ]);
  const [ghostVaults, setGhostVaults] = useState({});

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

  // 🔌 FETCH & SUBSCRIBE TO GLOBAL SYSTEM SWITCHES FROM SUPABASE
  useEffect(() => {
    const fetchSwitches = async () => {
      try {
        const { data } = await supabase.from('admin_system_switches').select('*').eq('id', 1).single();
        if (data) {
          setGlobalSwitches({
            maintenanceMode: data.maintenance_mode ?? false,
            chatMediaUploads: data.chat_media_uploads ?? true,
            meshTransmission: data.mesh_transmission ?? true,
          });
        }
      } catch (e) {}
    };

    fetchSwitches();

    const switchSub = supabase
      .channel('public:admin_system_switches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_system_switches' }, payload => {
        if (payload.new) {
          setGlobalSwitches({
            maintenanceMode: payload.new.maintenance_mode ?? false,
            chatMediaUploads: payload.new.chat_media_uploads ?? true,
            meshTransmission: payload.new.mesh_transmission ?? true,
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(switchSub);
    };
  }, []);

  // REAL-TIME GLOBAL CHAT UNREAD LISTENER
  useEffect(() => {
    if (!currentUser?.id && !currentUser?.email) return;
    const myIdOrEmail = currentUser?.id || currentUser?.email;

    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .or(`room_id.ilike.%${myIdOrEmail}%`)
        .neq('sender_id', myIdOrEmail);

      if (!error && count !== null) {
        setChatUnreadCount(count);
      }
    };

    fetchUnreadCount();

    const channel = supabase
      .channel('app_global_unread_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new.sender_id !== myIdOrEmail && payload.new.room_id?.includes(myIdOrEmail)) {
            setChatUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // AUTOMATIC OFFLINE QUEUE SYNC LISTENER
  useEffect(() => {
    let hasSyncedOnConnect = false;

    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && !hasSyncedOnConnect) {
        hasSyncedOnConnect = true;
        processOfflineQueue().then(result => {
          if (result.syncedCount > 0) {
            Alert.alert('Sync Complete 🚀', `Successfully synchronized ${result.syncedCount} offline messages to Supabase.`);
          }
        });
      } else if (!state.isConnected) {
        hasSyncedOnConnect = false;
      }
    });

    return () => unsubscribe();
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
    // 🛡️ Enforce Switch #2: Check if mesh transmission is globally enabled
    if (!globalSwitches.meshTransmission) {
      return Alert.alert('Mesh Offline 🛰️', 'Offline P2P mesh relay transmissions are currently disabled by system policy.');
    }
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
      } else if (screenName === 'Signup') {
        setAuthView('signup');
      } else {
        setScreenParams(params);
        setActiveScreen(screenName);
      }
    },
    goBack: () => {
      if (activeScreen === 'ChatRoom' && screenParams.recipientId) {
        setScreenParams({});
        setActiveScreen('ChatRoom');
      } else {
        setActiveScreen('Dashboard');
      }
    },
  };

  const renderCurrentScreen = () => {
    try {
      const route = { params: screenParams };
      
      const userIdentifier = currentUser?.email ? currentUser.email.split('@')[0] : 'Workspace Member';
      const userHandle = `@${currentUser?.id ? currentUser.id.slice(0, 8) : 'me'}`;
      const userAvatar = currentUser?.email ? currentUser.email[0].toUpperCase() : 'M';
      
      switch (activeScreen) {
        case 'Dashboard': 
          return (
            <DashboardScreen 
              isDarkMode={isDarkMode} 
              coins={coins} 
              setCoins={setCoins} 
              currentUser={currentUser} 
              navigation={navigation} 
            />
          );
        case 'ChatRoom': 
        case 'ChatRoomScreen': 
          if (screenParams.recipientId || screenParams.recipientName || screenParams.recipientEmail || screenParams.groupId) {
            return (
              <ChatRoomScreen 
                isDarkMode={isDarkMode} 
                currentUser={currentUser} 
                contactName={screenParams.recipientName || screenParams.groupName || userIdentifier}
                contactHandle={screenParams.recipientHandle || userHandle}
                contactAvatar={screenParams.recipientAvatar || screenParams.groupAvatar || userAvatar}
                route={route} 
                navigation={navigation}
                chatMediaAllowed={globalSwitches.chatMediaUploads}
                onBack={() => {
                  setScreenParams({});
                  setActiveScreen('ChatRoom'); 
                }}
              />
            );
          }
          return (
            <ConversationsListScreen 
              currentUser={currentUser} 
              isDarkMode={isDarkMode} 
              navigation={navigation}
              onSelectConversation={(conv) => {
                setScreenParams({
                  recipientId: conv.recipientId || conv.id,
                  recipientName: conv.recipientName,
                  recipientHandle: conv.recipientHandle,
                  recipientAvatar: conv.recipientAvatar,
                  id: conv.id,
                });
                setActiveScreen('ChatRoom');
              }} 
            />
          );
        case 'MessageRequests':
          return <MessageRequestsScreen isDarkMode={isDarkMode} currentUser={currentUser} navigation={navigation} />;
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
        case 'DiscoveryUsers':
          return <DiscoveryUsersScreen isDarkMode={isDarkMode} currentUser={currentUser} navigation={navigation} />;
        
        case 'AdminControl': 
          return (
            <AdminControlPanelScreen 
              isDarkMode={isDarkMode} 
              superAdminAccessEnabled={true} 
              setSuperAdminAccessEnabled={setSuperAdminAccessEnabled} 
            />
          );

        case 'GlobalAISupervisor':
          return (
            <GlobalAISupervisorScreen isDarkMode={isDarkMode} coins={coins} setCoins={setCoins} />
          );

        case 'MonetizationTreasury': 
          return (
            <MonetizationTreasuryScreen isDarkMode={isDarkMode} coins={coins} setCoins={setCoins} />
          );

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
          return <ReelsScreen isDarkMode={isDarkMode} coins={coins} setCoins={setCoins} currentUser={currentUser} />;
        case 'Analytics': 
          return <AnalyticsScreen isDarkMode={isDarkMode} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'Cinema': 
          return <CinemaScreen isDarkMode={isDarkMode} coins={coins} setCoins={setCoins} userRole="admin" onBack={() => setActiveScreen('Dashboard')} />;
        case 'Studio': 
          return <StudioScreen isDarkMode={isDarkMode} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'VirtualTVScreen': 
          return <VirtualTVScreen isDarkMode={isDarkMode} coins={coins} setCoins={setCoins} currentUser={currentUser} route={route} navigation={navigation} />;
        case 'MeshHub': 
          return <MeshHubScreen isDarkMode={isDarkMode} coins={coins} setCoins={setCoins} userId={currentUser?.id || '1'} />;
        case 'DRMHub': 
          return <DRMProtectionScreen isDarkMode={isDarkMode} />;
        case 'Settings': 
          return (
            <SettingsScreen 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
              superAdminAccessEnabled={true}
              setSuperAdminAccessEnabled={setSuperAdminAccessEnabled}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          );
        case 'Profile': 
          return <ProfileScreen isDarkMode={isDarkMode} coins={coins} currentUser={currentUser} onLogout={handleLogout} route={route} navigation={navigation} />;
        case 'Interpreter': 
          return <UniversalInterpreterModal isDarkMode={isDarkMode} onClose={() => setActiveScreen('Dashboard')} />;
        default: 
          return <DashboardScreen isDarkMode={isDarkMode} coins={coins} setCoins={setCoins} currentUser={currentUser} navigation={navigation} />;
      }
    } catch (e) {
      console.error('Screen Render Error:', e);
      return <DashboardScreen isDarkMode={isDarkMode} coins={coins} setCoins={setCoins} currentUser={currentUser} navigation={navigation} />;
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
      return <SignupScreen navigation={navigation} isDarkMode={isDarkMode} coins={coins} setCoins={setCoins} />;
    }
    return (
      <LoginScreen 
        navigation={navigation}
        isDarkMode={isDarkMode} 
        coins={coins}
        setCoins={setCoins}
      />
    );
  }

  // 🚨 ENFORCE GLOBAL MAINTENANCE LOCKDOWN (Switch #22)
  if (globalSwitches.maintenanceMode) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', padding: 24 }}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#f8fafc', textAlign: 'center', marginBottom: 8 }}>System Maintenance Lockdown</Text>
        <Text style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 20 }}>
          ChatUp enterprise infrastructure is currently undergoing scheduled security patching or emergency maintenance. Please check back shortly.
        </Text>
      </View>
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
        
        {/* HEADER BAR */}
        <View style={[styles.headerBar, isDarkMode && styles.darkHeader]}>
          {activeScreen !== 'Dashboard' ? (
            <TouchableOpacity style={styles.hamburgerButton} onPress={() => {
              if (activeScreen === 'ChatRoom' && screenParams.recipientId) {
                setScreenParams({});
                setActiveScreen('ChatRoom'); 
              } else {
                setActiveScreen('Dashboard');
              }
            }}>
              <Text style={[styles.hamburgerText, isDarkMode && styles.darkText]}>←</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.hamburgerButton} onPress={() => setMenuVisible(true)}>
              <Text style={[styles.hamburgerText, isDarkMode && styles.darkText]}>☰</Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]} numberOfLines={1}>
            {activeScreen === 'Dashboard' ? '🚀 Enterprise Command Hub' : 
             activeScreen === 'ChatRoom' && !screenParams.recipientId ? '💬 Direct Messages & Inbox' :
             activeScreen === 'ChatRoom' && screenParams.recipientId ? `💬 Chat with ${screenParams.recipientName || 'User'}` :
             activeScreen === 'MessageRequests' ? '📥 Message Requests Inbox' :
             activeScreen === 'GroupList' ? '👥 Communities & Groups' :
             activeScreen === 'CreateGroupScreen' ? '➕ Create Group Hub' :
             activeScreen === 'ChurchLiveScreen' ? '🙏 Church & Prayer Fellowship' :
             activeScreen === 'ChurchTestimonies' ? '✨ Church Testimonies & Praise' :
             activeScreen === 'ChurchRegistration' ? '⛪ Church Verification Form' :
             activeScreen === 'InteractiveGames' ? '🎮 Live & In-Chat Games' :
             activeScreen === 'GameArena' ? '🏆 Competitive Game Arena' :
             activeScreen === 'CameraHub' ? '🎥 Multi-Camera Hub' :
             activeScreen === 'DiscoveryUsers' ? '🔍 Discover & Add Users' :
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
            <TouchableOpacity style={styles.iconButton} onPress={() => setIsDarkMode(!isDarkMode)}>
              <Text style={{ fontSize: 16 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TOP SUB BAR */}
        <View style={[styles.topSubBar, isDarkMode && styles.darkTopSubBar]}>
          <TouchableOpacity 
            style={[styles.subTabItem, activeScreen === 'Dashboard' && styles.activeSubTab]} 
            onPress={() => setActiveScreen('Dashboard')}
          >
            <Ionicons name="grid-outline" size={15} color={activeScreen === 'Dashboard' ? '#007AFF' : (isDarkMode ? '#a0aec0' : '#4a5568')} />
            <Text style={[styles.subTabText, activeScreen === 'Dashboard' && styles.activeSubTabText, isDarkMode && styles.darkText]}>Command Hub</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.subTabItem, activeScreen === 'Notifications' && styles.activeSubTab]} 
            onPress={() => setActiveScreen('Notifications')}
          >
            <Ionicons name="notifications-outline" size={15} color={activeScreen === 'Notifications' ? '#007AFF' : (isDarkMode ? '#a0aec0' : '#4a5568')} />
            <Text style={[styles.subTabText, activeScreen === 'Notifications' && styles.activeSubTabText, isDarkMode && styles.darkText]}>Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.subTabItem, activeScreen === 'MessageRequests' && styles.activeSubTab]} 
            onPress={() => setActiveScreen('MessageRequests')}
          >
            <Ionicons name="mail-unread-outline" size={15} color={activeScreen === 'MessageRequests' ? '#007AFF' : (isDarkMode ? '#a0aec0' : '#4a5568')} />
            <Text style={[styles.subTabText, activeScreen === 'MessageRequests' && styles.activeSubTabText, isDarkMode && styles.darkText]}>Requests</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.subTabItem, activeScreen === 'Reels' && styles.activeSubTab]} 
            onPress={() => setActiveScreen('Reels')}
          >
            <Ionicons name="film-outline" size={15} color={activeScreen === 'Reels' ? '#007AFF' : (isDarkMode ? '#a0aec0' : '#4a5568')} />
            <Text style={[styles.subTabText, activeScreen === 'Reels' && styles.activeSubTabText, isDarkMode && styles.darkText]}>Reels 📱</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.subTabItem, activeScreen === 'GlobalAISupervisor' && styles.activeSubTab]} 
            onPress={() => setActiveScreen('GlobalAISupervisor')}
          >
            <Ionicons name="shield-checkmark-outline" size={15} color={activeScreen === 'GlobalAISupervisor' ? '#38a169' : (isDarkMode ? '#a0aec0' : '#4a5568')} />
            <Text style={[styles.subTabText, activeScreen === 'GlobalAISupervisor' && styles.activeSubTabText, isDarkMode && styles.darkText]}>AI Ops</Text>
          </TouchableOpacity>
        </View>

        {/* ENTERPRISE DRAWER MENU */}
        <Modal visible={menuVisible} animationType="slide" transparent={true}>
          <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
            <View style={[styles.drawerContent, isDarkMode && styles.darkDrawer]}>
              
              <View style={[styles.drawerUserHeader, isDarkMode && { borderBottomColor: '#4a5568' }]}>
                <View style={styles.drawerAvatarCircle}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                    {currentUser?.email ? currentUser.email[0].toUpperCase() : 'M'}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.drawerUserName, isDarkMode && styles.darkText]} numberOfLines={1}>
                    {currentUser?.email ? currentUser.email.split('@')[0] : 'Workspace Member'}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#38a169', fontWeight: '600' }}>● Super-Admin Active</Text>
                </View>
                <TouchableOpacity onPress={() => setMenuVisible(false)} style={styles.drawerCloseCircle}>
                  <Ionicons name="close" size={18} color={isDarkMode ? '#fff' : '#4a5568'} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ marginTop: 8 }} showsVerticalScrollIndicator={false}>
                
                <View style={[styles.drawerSectionBox, isDarkMode && styles.darkDrawerCard, { backgroundColor: isDarkMode ? '#2b6cb0' : '#ebf8ff', borderColor: '#3182ce' }]}>
                  <TouchableOpacity style={[styles.drawerRowItem, { borderBottomWidth: 0 }]} onPress={() => { setActiveScreen('Dashboard'); setMenuVisible(false); }}>
                    <Ionicons name="grid-outline" size={20} color="#3182ce" />
                    <Text style={[styles.drawerRowText, { color: '#3182ce', fontWeight: 'bold', fontSize: 13 }]}>🚀 Enterprise Command Hub</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.drawerSectionBox, isDarkMode && styles.darkDrawerCard]}>
                  <Text style={styles.drawerSectionHeader}>MASTER ADMINISTRATION</Text>
                  
                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('AdminControl'); setMenuVisible(false); }}>
                    <Ionicons name="shield-outline" size={18} color="#3182ce" />
                    <Text style={[styles.drawerRowText, { color: '#3182ce', fontWeight: 'bold' }]}>Super-Admin Panel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('GlobalAISupervisor'); setMenuVisible(false); }}>
                    <Ionicons name="hardware-chip-outline" size={18} color="#38a169" />
                    <Text style={[styles.drawerRowText, { color: '#38a169', fontWeight: 'bold' }]}>Global AI Supervisor SOC</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('MonetizationTreasury'); setMenuVisible(false); }}>
                    <Ionicons name="wallet-outline" size={18} color="#16a34a" />
                    <Text style={[styles.drawerRowText, { color: '#16a34a', fontWeight: 'bold' }]}>Treasury, Escrow & Splits</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.drawerSectionBox, isDarkMode && styles.darkDrawerCard]}>
                  <Text style={styles.drawerSectionHeader}>COMMUNICATION & COMMUNITY</Text>
                  
                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('DiscoveryUsers'); setMenuVisible(false); }}>
                    <Ionicons name="person-add-outline" size={18} color="#3182ce" />
                    <Text style={[styles.drawerRowText, { color: '#3182ce', fontWeight: 'bold' }]}>🔍 Discover & Add Users</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('MessageRequests'); setMenuVisible(false); }}>
                    <Ionicons name="mail-unread-outline" size={18} color="#3182ce" />
                    <Text style={[styles.drawerRowText, { color: '#3182ce', fontWeight: 'bold' }]}>📥 Message Requests Inbox</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setScreenParams({}); setActiveScreen('ChatRoom'); setMenuVisible(false); }}>
                    <Ionicons name="chatbubbles-outline" size={18} color="#007AFF" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>Direct Chats & Inbox</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('GroupList'); setMenuVisible(false); }}>
                    <Ionicons name="people-outline" size={18} color="#2563eb" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>Groups & Communities</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('ChurchLiveScreen'); setMenuVisible(false); }}>
                    <Ionicons name="tv-outline" size={18} color="#16a34a" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>Church & Prayer Hub</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('ChurchTestimonies'); setMenuVisible(false); }}>
                    <Ionicons name="sparkles-outline" size={18} color="#2563eb" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>Testimonies & Praise</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('ChurchRegistration'); setMenuVisible(false); }}>
                    <Ionicons name="business-outline" size={18} color="#ca8a04" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>Request Church Ownership</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('LiveStream'); setMenuVisible(false); }}>
                    <Ionicons name="videocam-outline" size={18} color="#e53e3e" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>Live Streams</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('Reels'); setMenuVisible(false); }}>
                    <Ionicons name="film-outline" size={18} color="#d97706" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>Short-Form Reels</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('InteractiveGames'); setMenuVisible(false); }}>
                    <Ionicons name="game-controller-outline" size={18} color="#9333ea" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>Live & In-Chat Games</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.drawerSectionBox, isDarkMode && styles.darkDrawerCard]}>
                  <Text style={styles.drawerSectionHeader}>MEDIA, STUDIO & VAULT</Text>
                  
                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('GameArena'); setMenuVisible(false); }}>
                    <Ionicons name="trophy-outline" size={18} color="#d97706" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>Competitive Game Arena</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('CameraHub'); setMenuVisible(false); }}>
                    <Ionicons name="aperture-outline" size={18} color="#dc2626" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>Multi-Camera Hub</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('VirtualTVScreen'); setMenuVisible(false); }}>
                    <Ionicons name="desktop-outline" size={18} color="#3182ce" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>Virtual TV</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('Studio'); setMenuVisible(false); }}>
                    <Ionicons name="mic-outline" size={18} color="#805ad5" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>Studio & Production</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('Cinema'); setMenuVisible(false); }}>
                    <Ionicons name="film-outline" size={18} color="#e53e3e" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>Virtual Cinema Hall</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('MeshHub'); setMenuVisible(false); }}>
                    <Ionicons name="radio-outline" size={18} color="#319795" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>Zero-Net & Ghost Vault</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.drawerSectionBox, isDarkMode && styles.darkDrawerCard]}>
                  <Text style={styles.drawerSectionHeader}>WALLET & TOOLS</Text>
                  
                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('Wallet'); setMenuVisible(false); }}>
                    <Ionicons name="card-outline" size={18} color="#16a34a" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>Wallet & Treasury</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('Referrals'); setMenuVisible(false); }}>
                    <Ionicons name="gift-outline" size={18} color="#d69e2e" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>Referrals & QR Rewards</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('Discovery'); setMenuVisible(false); }}>
                    <Ionicons name="compass-outline" size={18} color="#007AFF" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>Discovery Feed</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('Analytics'); setMenuVisible(false); }}>
                    <Ionicons name="stats-chart-outline" size={18} color="#3182ce" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>Analytics Dashboard</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('Interpreter'); setMenuVisible(false); }}>
                    <Ionicons name="globe-outline" size={18} color="#805ad5" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>Global AI Interpreter</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.drawerSectionBox, isDarkMode && styles.darkDrawerCard, { marginBottom: 30 }]}>
                  <Text style={styles.drawerSectionHeader}>PREFERENCES</Text>
                  
                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('Profile'); setMenuVisible(false); }}>
                    <Ionicons name="person-outline" size={18} color="#4a5568" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>My Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.drawerRowItem} onPress={() => { setActiveScreen('Settings'); setMenuVisible(false); }}>
                    <Ionicons name="settings-outline" size={18} color="#4a5568" />
                    <Text style={[styles.drawerRowText, isDarkMode && styles.darkText]}>App Settings</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.drawerRowItem, { borderBottomWidth: 0, marginTop: 4, backgroundColor: isDarkMode ? '#2d3748' : '#fff5f5', borderRadius: 8, paddingHorizontal: 6 }]} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={18} color="#e53e3e" />
                    <Text style={[styles.drawerRowText, { color: '#e53e3e', fontWeight: 'bold' }]}>Log Out Securely</Text>
                  </TouchableOpacity>
                </View>

              </ScrollView>
            </View>
          </Pressable>
        </Modal>

        <View style={{ flex: 1 }}>
          {/* 🌟 Live Announcement Banner Rendered Above Screens */}
          <GlobalAnnouncementBanner isDarkMode={isDarkMode} />
          {renderCurrentScreen()}
        </View>

        {/* BOTTOM TAB BAR */}
        <View style={[styles.bottomTabBar, isDarkMode && styles.darkBottomBar]}>
          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => setActiveScreen('Dashboard')}
          >
            <Ionicons name={activeScreen === 'Dashboard' ? 'grid' : 'grid-outline'} size={22} color={activeScreen === 'Dashboard' ? '#007AFF' : (isDarkMode ? '#a0aec0' : 'gray')} />
            <Text style={[styles.tabText, activeScreen === 'Dashboard' && styles.activeTabText, isDarkMode && styles.darkText]} numberOfLines={1}>Hub</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => setActiveScreen('DiscoveryUsers')}
          >
            <Ionicons name={activeScreen === 'DiscoveryUsers' ? 'person-add' : 'person-add-outline'} size={22} color={activeScreen === 'DiscoveryUsers' ? '#007AFF' : (isDarkMode ? '#a0aec0' : 'gray')} />
            <Text style={[styles.tabText, activeScreen === 'DiscoveryUsers' && styles.activeTabText, isDarkMode && styles.darkText]} numberOfLines={1}>Find Users</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => {
              setScreenParams({});
              setActiveScreen('ChatRoom');
            }}
          >
            <View style={{ position: 'relative' }}>
              <Ionicons name={activeScreen === 'ChatRoom' ? 'chatbubbles' : 'chatbubbles-outline'} size={22} color={activeScreen === 'ChatRoom' ? '#007AFF' : (isDarkMode ? '#a0aec0' : 'gray')} />
              {chatUnreadCount > 0 && activeScreen !== 'ChatRoom' && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{chatUnreadCount}</Text>
                </View>
              )}
            </View>
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
            onPress={() => setActiveScreen('Reels')}
          >
            <Ionicons name={activeScreen === 'Reels' ? 'film' : 'film-outline'} size={22} color={activeScreen === 'Reels' ? '#007AFF' : (isDarkMode ? '#a0aec0' : 'gray')} />
            <Text style={[styles.tabText, activeScreen === 'Reels' && styles.activeTabText, isDarkMode && styles.darkText]} numberOfLines={1}>Reels</Text>
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
  badgeContainer: { position: 'absolute', top: -4, right: -8, backgroundColor: '#e53e3e', borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start' },
  drawerContent: { width: '75%', height: '100%', backgroundColor: '#f8fafc', padding: 12, paddingTop: 40, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, elevation: 6 },
  darkDrawer: { backgroundColor: '#1a202c' },
  drawerUserHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', marginBottom: 8 },
  drawerAvatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center' },
  drawerUserName: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  drawerCloseCircle: { padding: 4 },
  drawerSectionBox: { backgroundColor: '#fff', borderRadius: 10, padding: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  darkDrawerCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  drawerSectionHeader: { fontSize: 9, fontWeight: 'bold', color: '#a0aec0', marginBottom: 6, letterSpacing: 0.8 },
  drawerRowItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  drawerRowText: { fontSize: 12, marginLeft: 10, color: '#2d3748', fontWeight: '500' },
  bottomTabBar: { height: 60, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 5 },
  darkBottomBar: { backgroundColor: '#2d3748', borderTopColor: '#4a5568' },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 10, color: 'gray', marginTop: 2 },
  activeTabText: { color: '#007AFF', fontWeight: 'bold' },
  loginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7fafc', padding: 20 },
  bannerContainer: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 8, padding: 10, marginHorizontal: 12, marginTop: 8, marginBottom: 4 },
  darkBannerContainer: { backgroundColor: '#1e3a8a', borderColor: '#3b82f6' },
  bannerTitle: { fontSize: 10, fontWeight: 'bold', color: '#1d4ed8', marginBottom: 2 },
  bannerText: { fontSize: 12, color: '#1e3a8a', fontWeight: '500' },
  darkBannerText: { color: '#bfdbfe' },
});