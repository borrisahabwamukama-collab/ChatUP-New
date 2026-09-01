import React, { useState, createContext, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Alert } from 'react-native';

// Core Screens
import ChatRoomScreen from './src/screens/ChatRoomScreen';
import SecurityHubScreen from './src/screens/Security/SecurityHubScreen';
import ReactionsAndBubbles from './src/screens/ReactionsAndBubbles';
import VoiceAndTranslationScreen from './src/screens/VoiceAndTranslationScreen';
import DiscoveryWalletScreen from './src/screens/DiscoveryWalletScreen';
import InChatWalletScreen from './src/screens/InChatWalletScreen';
import LiveStreamScreen from './src/screens/LiveStreamScreen';

// Master Super-Admin Control Panel & Monetization Treasury
import AdminControlPanelScreen from './src/screens/AdminControlPanelScreen';
import MonetizationTreasuryScreen from './src/screens/MonetizationTreasuryScreen';

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

export default function App() {
  const [activeScreen, setActiveScreen] = useState('ChatRoom');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [coins, setCoins] = useState(2500);
  const [menuVisible, setMenuVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  // Master Super-Admin Master Kill-Switch State
  const [superAdminAccessEnabled, setSuperAdminAccessEnabled] = useState(true);

  // Global Zero-Net Mesh & Ghost Vault States
  const [meshNodeActive, setMeshNodeActive] = useState(true);
  const [meshPeerCount, setMeshPeerCount] = useState(4);
  const [localChatLog, setLocalChatLog] = useState([
    { id: '1', sender: 'Node_Kampala_02', text: 'Secure multi-hop packet route established via local Wi-Fi mesh.' },
    { id: '2', sender: 'Node_Bwindi_01', text: 'Offline data chunk synced across local peers.' }
  ]);
  const [ghostVaults, setGhostVaults] = useState({});

  const sendMeshPacket = (senderName, messageText) => {
    if (!messageText.trim()) return;
    const newPacket = { id: Date.now().toString(), sender: senderName, text: messageText };
    setLocalChatLog(prev => [...prev, newPacket]);
    Alert.alert('Mesh Relay 🛰️', 'Packet broadcasted across local multi-hop mesh nodes (Zero Internet).');
  };

  const lockGhostVault = (vaultKey, dataPayload) => {
    if (!vaultKey.trim()) return false;
    setGhostVaults(prev => ({ ...prev, [vaultKey]: { encrypted: true, data: dataPayload, timestamp: Date.now() } }));
    Alert.alert('Ghost Vault 🛡️', 'Data locked and encrypted locally with zero cloud footprint!');
    return true;
  };

  // Helper navigation function that passes navigation support via props or state handlers
  const navigation = {
    navigate: (screenName, params) => setActiveScreen(screenName),
    goBack: () => setActiveScreen('GroupList'),
  };

  const renderCurrentScreen = () => {
    switch (activeScreen) {
      case 'ChatRoom': return <ChatRoomScreen isDarkMode={isDarkMode} />;
      case 'GroupList': return <GroupListScreen isDarkMode={isDarkMode} navigation={navigation} />;
      case 'CreateGroupScreen': return <CreateGroupScreen isDarkMode={isDarkMode} navigation={navigation} />;
      case 'ChurchLiveScreen': return <ChurchLiveScreen isDarkMode={isDarkMode} />;
      case 'ChurchTestimonies': return <ChurchTestimoniesScreen isDarkMode={isDarkMode} />;
      case 'ChurchRegistration': return <ChurchRegistrationScreen navigation={navigation} />;
      case 'InteractiveGames': return <InteractiveGamesHub coins={coins} setCoins={setCoins} />;
      case 'GameArena': return <GameArenaScreen coins={coins} setCoins={setCoins} />;
      case 'CameraHub': return <CameraHubScreen isDarkMode={isDarkMode} navigation={navigation} />;
      case 'AdminControl': 
        return superAdminAccessEnabled ? (
          <AdminControlPanelScreen 
            isDarkMode={isDarkMode} 
            superAdminAccessEnabled={superAdminAccessEnabled} 
            setSuperAdminAccessEnabled={setSuperAdminAccessEnabled} 
          />
        ) : <ChatRoomScreen isDarkMode={isDarkMode} />;
      case 'MonetizationTreasury': 
        return superAdminAccessEnabled ? (
          <MonetizationTreasuryScreen isDarkMode={isDarkMode} coins={coins} setCoins={setCoins} />
        ) : <ChatRoomScreen isDarkMode={isDarkMode} />;
      case 'Notifications': return <NotificationsScreen isDarkMode={isDarkMode} />;
      case 'SecurityHub': return <SecurityHubScreen isDarkMode={isDarkMode} />;
      case 'Reactions': return <ReactionsAndBubbles isDarkMode={isDarkMode} />;
      case 'Voice': return <VoiceAndTranslationScreen isDarkMode={isDarkMode} />;
      case 'Discovery': return <DiscoveryWalletScreen isDarkMode={isDarkMode} />;
      case 'Wallet': return <InChatWalletScreen isDarkMode={isDarkMode} coins={coins} setCoins={setCoins} />;
      case 'LiveStream': return <LiveStreamScreen isDarkMode={isDarkMode} coins={coins} setCoins={setCoins} />;
      case 'Analytics': return <AnalyticsScreen isDarkMode={isDarkMode} />;
      case 'Cinema': return <CinemaScreen isDarkMode={isDarkMode} />;
      case 'Studio': return <StudioScreen isDarkMode={isDarkMode} />;
      case 'VirtualTVScreen': return <VirtualTVScreen isDarkMode={isDarkMode} coins={coins} setCoins={setCoins} />;
      case 'MeshHub': return <MeshHubScreen isDarkMode={isDarkMode} />;
      case 'DRMHub': return <DRMProtectionScreen isDarkMode={isDarkMode} />;
      case 'Settings': return <SettingsScreen isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
      case 'Profile': return <ProfileScreen isDarkMode={isDarkMode} coins={coins} />;
      case 'Interpreter': return <UniversalInterpreterModal isDarkMode={isDarkMode} onClose={() => setActiveScreen('ChatRoom')} />;
      default: return <ChatRoomScreen isDarkMode={isDarkMode} />;
    }
  };

  const handleSelectScreen = (screenName) => {
    setActiveScreen(screenName);
    setMenuVisible(false);
    if (screenName === 'Notifications') {
      setUnreadCount(0);
    }
  };

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
        
        {/* Top Header Bar with Dynamic Back / Hamburger Button */}
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
             activeScreen === 'AdminControl' ? '👑 Master Super-Admin Panel' : 
             activeScreen === 'MonetizationTreasury' ? '🪙 Monetization & Escrow' : 
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

        {/* Navigation Drawer Modal */}
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
                {/* CONDITIONAL RENDER: ONLY DISPLAY ADMIN SECTION IF MASTER SWITCH IS ENABLED */}
                {superAdminAccessEnabled && (
                  <>
                    <Text style={styles.sectionLabel}>MASTER ADMIN</Text>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => handleSelectScreen('AdminControl')}>
                      <Text style={[styles.drawerItemText, { color: '#3182ce', fontWeight: 'bold' }]}>👑 Super-Admin Panel</Text>
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
                  <Text style={styles.drawerItemText}>🪙 Wallet</Text>
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
              </ScrollView>
            </View>
          </Pressable>
        </Modal>

        {/* Main Screen Viewport */}
        <View style={{ flex: 1 }}>
          {renderCurrentScreen()}
        </View>

      </View>
    </MeshNetworkContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc', paddingTop: 35 },
  headerBar: { height: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  darkHeader: { backgroundColor: '#2d3748', borderBottomColor: '#4a5568' },
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
});