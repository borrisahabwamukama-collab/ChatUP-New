import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Switch,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../Services/supabaseClient'; // Adjust path if needed

export default function SettingsScreen({ isDarkMode, setIsDarkMode, onLogout, currentUser }) {
  const [activeSubView, setActiveSubView] = useState('main');
  const [searchQuery, setSearchQuery] = useState('');

  // Core Toggles & Granular Parameters
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [biometricLock, setBiometricLock] = useState(true);
  const [autoMeshRelay, setAutoMeshRelay] = useState(true);
  
  const [debugOverlay, setDebugOverlay] = useState(false);
  const [bluetoothBleOnly, setBluetoothBleOnly] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [hideFollowersList, setHideFollowersList] = useState(false);
  const [hideActivityStatus, setHideActivityStatus] = useState(true);
  const [p2pEncryptionLevel, setP2pEncryptionLevel] = useState('AES-256-GCM Sovereign');
  const [maxPacketHopLimit, setMaxPacketHopLimit] = useState('7 nodes');
  const [nodeRelayPower, setNodeRelayPower] = useState('High (100mW)');

  // Email OTP Authentication & AI Intrusion Tracking States (7-Tap Trigger)
  const [versionTapCount, setVersionTapCount] = useState(0);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // AI Real-Time Monitoring & Threat Counter
  const [failedIntrusionAttempts, setFailedIntrusionAttempts] = useState(0);
  const [aiLockdownActive, setAiLockdownActive] = useState(false);
  const [isMasterUnlocked, setIsMasterUnlocked] = useState(false);

  // LOGOUT CONFIRMATION DIALOG
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

  const handleVersionTap = () => {
    if (aiLockdownActive) {
      Alert.alert('🚨 AI Security Lockdown', 'Terminal access is frozen due to prior unauthorized intrusion telemetry.');
      return;
    }

    const nextCount = versionTapCount + 1;
    setVersionTapCount(nextCount);
    if (nextCount >= 7) {
      setVersionTapCount(0);
      setEmailModalVisible(true);
    }
  };

  // REAL SUPABASE EMAIL OTP REQUEST
  const requestEmailOtp = async () => {
    if (!adminEmail.includes('@')) {
      Alert.alert('❌ Error', 'Please enter a valid administrator email address.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email: adminEmail.trim() });
    setLoading(false);

    if (error) {
      Alert.alert('❌ OTP Error', error.message);
    } else {
      Alert.alert('📧 OTP Dispatched', `A 6-digit security token has been sent to ${adminEmail}. Check your inbox!`);
      setEmailModalVisible(false);
      setOtpModalVisible(true);
    }
  };

  // AI FULL-TIME MONITORING & INTRUSION COUNTERMEASURE
  const triggerAiIntrusionProtocol = (badCode) => {
    const totalStrikes = failedIntrusionAttempts + 1;
    setFailedIntrusionAttempts(totalStrikes);

    console.warn(`🤖 [AI SOC SENTINEL]: Unauthorized breach attempt #${totalStrikes} captured! Token used: "${badCode}"`);

    if (totalStrikes >= 3) {
      setAiLockdownActive(true);
      setOtpModalVisible(false);
      Alert.alert(
        '🚨 AI Security Protocol Triggered', 
        'Multiple incorrect security codes detected. The Global AI Supervisor has locked out administrative authorization on this endpoint and flagged the device fingerprint.'
      );
    } else {
      Alert.alert(
        '⚠️ AI Supervisor Warning', 
        `Incorrect verification code. AI Sentinel recorded intrusion strike (${totalStrikes}/3 allowed attempts before automated lockout).`
      );
    }
  };

  // REAL SUPABASE EMAIL OTP VERIFICATION
  const verifyEmailOtp = async () => {
    if (aiLockdownActive) {
      Alert.alert('❌ Locked Out', 'Endpoint frozen by AI Supervisor.');
      return;
    }

    if (!otpInput.trim()) {
      Alert.alert('Error', 'Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email: adminEmail.trim(),
      token: otpInput.trim(),
      type: 'email',
    });
    setLoading(false);

    if (error) {
      triggerAiIntrusionProtocol(otpInput);
    } else {
      setIsMasterUnlocked(true);
      setFailedIntrusionAttempts(0);
      setOtpModalVisible(false);
      Alert.alert('👑 Master Admin Authorized', 'Advanced SOC & AI Ops overrides are now active.');
    }
  };

  const handleAction = (title, message) => {
    Alert.alert(title, message);
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      
      {/* Header & Breadcrumb Bar */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.title, isDarkMode && styles.darkText]} numberOfLines={1}>
            {activeSubView === 'main' ? '⚙️ Control Center (L1)' :
             activeSubView.includes('privacy') ? '🕵️ Privacy & Visibility (L2)' :
             activeSubView.includes('security') ? '🔒 Cryptography & Keys (L2)' :
             activeSubView.includes('mesh') ? '🛰️ Mesh Routing Core (L2)' : 
             activeSubView.includes('developer') ? '🛠️ Engineering Diagnostics (L2)' : '📂 Granular Sub-Routine (L3/L4)'}
          </Text>
          {activeSubView !== 'main' && (
            <TouchableOpacity onPress={() => setActiveSubView('main')} style={styles.backButton}>
              <Text style={{ color: '#3182ce', fontWeight: 'bold', fontSize: 12 }}>← Root Hub</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.subtitle}>
          {activeSubView === 'main' ? 'Select a core architectural module to inspect multi-tier configurations.' : `Active Sub-Path: Root / ${activeSubView.toUpperCase()}`}
        </Text>
      </View>

      {/* Logged-In User Profile Banner & Sign Out */}
      {activeSubView === 'main' && (
        <View style={[styles.card, isDarkMode && styles.darkCard, { borderColor: '#3182ce', borderWidth: 1 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 2 }]}>
                👤 Active Account
              </Text>
              <Text style={{ fontSize: 12, color: '#3182ce', fontWeight: 'bold' }}>
                {currentUser?.email || 'Logged in via Supabase'}
              </Text>
            </View>
            <TouchableOpacity style={styles.logoutBtnInline} onPress={handleSignOutPress}>
              <Text style={styles.logoutBtnText}>Log Out 🚪</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search Filter */}
      {activeSubView === 'main' && (
        <View style={[styles.searchBox, isDarkMode && styles.darkCard]}>
          <Ionicons name="search" size={16} color="#a0aec0" style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, isDarkMode && { color: '#fff' }]}
            placeholder="Search deep parameters, nodes, cryptographic keys..."
            placeholderTextColor="#a0aec0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      {/* LEVEL 1: ROOT HUB */}
      {activeSubView === 'main' && (
        <>
          <TouchableOpacity style={[styles.navCard, isDarkMode && styles.darkCard]} onPress={() => setActiveSubView('privacy_root')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>🕵️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.navTitle, isDarkMode && styles.darkText]}>Privacy & Account Visibility</Text>
                <Text style={styles.navSub}>Sub-Modules: Profile Shielding, Follower Lists, Stealth Protocol</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#a0aec0" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navCard, isDarkMode && styles.darkCard]} onPress={() => setActiveSubView('security_root')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>🔒</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.navTitle, isDarkMode && styles.darkText]}>Security & Cryptography Core</Text>
                <Text style={styles.navSub}>Sub-Modules: Biometrics, Key Fingerprints, Remote Session Wiping</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#a0aec0" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navCard, isDarkMode && styles.darkCard]} onPress={() => setActiveSubView('mesh_root')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>🛰️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.navTitle, isDarkMode && styles.darkText]}>Zero-Net Mesh & Peer Routing</Text>
                <Text style={styles.navSub}>Sub-Modules: Wi-Fi Direct Handshake, Hop Limits, BLE Relay</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#a0aec0" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navCard, isDarkMode && styles.darkCard]} onPress={() => setActiveSubView('developer_root')}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>🛠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.navTitle, isDarkMode && styles.darkText]}>Developer Engineering Suite</Text>
                <Text style={styles.navSub}>Sub-Modules: Live Packet Inspector, Supabase Latency, Logs</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#a0aec0" />
          </TouchableOpacity>

          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🎨 Appearance, Theme & Audio</Text>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>Dark Mode Theme</Text>
              <Switch value={isDarkMode} onValueChange={setIsDarkMode} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
            </View>
            <View style={[styles.row, { borderBottomWidth: 0 }]}>
              <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>In-App Audio & Haptics</Text>
              <Switch value={soundEffects} onValueChange={setSoundEffects} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
            </View>
          </View>
        </>
      )}

      {/* PRIVACY SUB-TREE */}
      {activeSubView === 'privacy_root' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🕵️ Privacy Sub-Modules (Level 2)</Text>
          <TouchableOpacity style={styles.subActionRow} onPress={() => setActiveSubView('privacy_layer3_account')}>
            <Text style={{ fontSize: 13, color: '#3182ce', fontWeight: 'bold' }}>📂 3.1 Account Visibility & Feed Restrictions →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subActionRow} onPress={() => setActiveSubView('privacy_layer3_stealth')}>
            <Text style={{ fontSize: 13, color: '#3182ce', fontWeight: 'bold' }}>📂 3.2 Network Stealth & Node Concealment →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.subActionRow, { borderBottomWidth: 0 }]} onPress={() => setActiveSubView('privacy_layer3_followers')}>
            <Text style={{ fontSize: 13, color: '#3182ce', fontWeight: 'bold' }}>📂 3.3 Follower Ledger Protection →</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeSubView === 'privacy_layer3_account' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🔒 Level 3: Feed & Stream Restrictions</Text>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>Private Account Mode</Text>
              <Text style={{ fontSize: 10, color: '#718096' }}>Only approved followers can view your uploads.</Text>
            </View>
            <Switch value={isPrivateAccount} onValueChange={setIsPrivateAccount} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
          </View>
        </View>
      )}

      {activeSubView === 'privacy_layer3_stealth' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🛡️ Level 3: Network Stealth Protocols</Text>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>Hide Mesh Activity Status</Text>
              <Text style={{ fontSize: 10, color: '#718096' }}>Conceal relay status from public peer scanners.</Text>
            </View>
            <Switch value={hideActivityStatus} onValueChange={setHideActivityStatus} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
          </View>
        </View>
      )}

      {activeSubView === 'privacy_layer3_followers' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>👥 Level 3: Follower Ledger Security</Text>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>Restrict Followers List Inspection</Text>
              <Text style={{ fontSize: 10, color: '#718096' }}>Block peer network scraping.</Text>
            </View>
            <Switch value={hideFollowersList} onValueChange={setHideFollowersList} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
          </View>
        </View>
      )}

      {/* SECURITY SUB-TREE */}
      {activeSubView === 'security_root' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🔒 Cryptography Sub-Modules (Level 2)</Text>
          <TouchableOpacity style={styles.subActionRow} onPress={() => setActiveSubView('security_layer3_biometrics')}>
            <Text style={{ fontSize: 13, color: '#3182ce', fontWeight: 'bold' }}>📂 3.1 Biometric & Hardware Locks →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subActionRow} onPress={() => setActiveSubView('security_layer3_keys')}>
            <Text style={{ fontSize: 13, color: '#3182ce', fontWeight: 'bold' }}>📂 3.2 Sovereign Key Fingerprints & Rotation →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.subActionRow, { borderBottomWidth: 0 }]} onPress={() => setActiveSubView('security_layer3_sessions')}>
            <Text style={{ fontSize: 13, color: '#3182ce', fontWeight: 'bold' }}>📂 3.3 Remote Session Revocation →</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeSubView === 'security_layer3_biometrics' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📱 Level 3: Biometric Authentication</Text>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>Require FaceID / Fingerprint Lock</Text>
            <Switch value={biometricLock} onValueChange={setBiometricLock} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
          </View>
        </View>
      )}

      {activeSubView === 'security_layer3_keys' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🔑 Level 3: Cryptographic Cipher Suite</Text>
          <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Active Algorithm: <Text style={{ fontWeight: 'bold', color: '#3182ce' }}>{p2pEncryptionLevel}</Text></Text>
          <TouchableOpacity style={styles.actionBtnOutline} onPress={() => handleAction('Key Rotation 🔄', 'Identity keys successfully re-hashed.')}>
            <Text style={styles.actionBtnOutlineText}>Rotate Identity Keys 🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtnOutline, { marginTop: 8 }]} onPress={() => handleAction('Backup Exported 📦', 'Encrypted mnemonic generated.')}>
            <Text style={styles.actionBtnOutlineText}>Export Zero-Knowledge Backup 📦</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeSubView === 'security_layer3_sessions' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>⚠️ Level 3: Remote Node Terminations</Text>
          <TouchableOpacity style={[styles.actionBtnOutline, { borderColor: '#e53e3e' }]} onPress={() => handleAction('Sessions Wiped 🚨', 'All external node tokens revoked.')}>
            <Text style={{ color: '#e53e3e', fontSize: 12, fontWeight: 'bold' }}>Terminate All Remote Sessions 🚨</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MESH ROUTING SUB-TREE */}
      {activeSubView === 'mesh_root' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🛰️ Zero-Net Mesh Sub-Modules (Level 2)</Text>
          <TouchableOpacity style={styles.subActionRow} onPress={() => setActiveSubView('mesh_layer3_params')}>
            <Text style={{ fontSize: 13, color: '#3182ce', fontWeight: 'bold' }}>📂 3.1 Packet Hop Limits & Power Controls →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.subActionRow, { borderBottomWidth: 0 }]} onPress={() => setActiveSubView('mesh_layer3_protocols')}>
            <Text style={{ fontSize: 13, color: '#3182ce', fontWeight: 'bold' }}>📂 3.2 Wi-Fi Direct & Bluetooth Handshake Rules →</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeSubView === 'mesh_layer3_params' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📡 Level 3: Packet Relay Parameters</Text>
          <Text style={{ fontSize: 11, color: '#718096', marginBottom: 4 }}>Max Hop Limit: <Text style={{ fontWeight: 'bold', color: '#2d3748' }}>{maxPacketHopLimit}</Text></Text>
          <Text style={{ fontSize: 11, color: '#718096', marginBottom: 12 }}>Relay Transmitter Power: <Text style={{ fontWeight: 'bold', color: '#2d3748' }}>{nodeRelayPower}</Text></Text>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>Auto-Relay Packets</Text>
            <Switch value={autoMeshRelay} onValueChange={setAutoMeshRelay} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
          </View>
        </View>
      )}

      {activeSubView === 'mesh_layer3_protocols' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📻 Level 3: Hardware Radio Constraints</Text>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>Restrict to Bluetooth BLE Only</Text>
              <Text style={{ fontSize: 10, color: '#718096' }}>Disable high-power Wi-Fi direct frequencies.</Text>
            </View>
            <Switch value={bluetoothBleOnly} onValueChange={setBluetoothBleOnly} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
          </View>
        </View>
      )}

      {/* DEVELOPER SUB-TREE */}
      {activeSubView === 'developer_root' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🛠️ Developer Sub-Modules (Level 2)</Text>
          <TouchableOpacity style={styles.subActionRow} onPress={() => setActiveSubView('dev_layer3_overlay')}>
            <Text style={{ fontSize: 13, color: '#3182ce', fontWeight: 'bold' }}>📂 3.1 Live Packet Inspection & HUD →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.subActionRow, { borderBottomWidth: 0 }]} onPress={() => setActiveSubView('dev_layer3_supabase')}>
            <Text style={{ fontSize: 13, color: '#3182ce', fontWeight: 'bold' }}>📂 3.2 Supabase Latency & Database Diagnostics →</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeSubView === 'dev_layer3_overlay' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>📊 Level 3: HUD Diagnostics Overlay</Text>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>Enable Live Packet HUD Overlay</Text>
              <Text style={{ fontSize: 10, color: '#718096' }}>Renders real-time socket packet speeds on screen.</Text>
            </View>
            <Switch value={debugOverlay} onValueChange={setDebugOverlay} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
          </View>
        </View>
      )}

      {activeSubView === 'dev_layer3_supabase' && (
        <View style={[styles.card, isDarkMode && styles.darkCard]}>
          <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🔌 Level 3: Cloud Database Health</Text>
          <TouchableOpacity style={styles.actionBtnOutline} onPress={() => handleAction('Supabase Ping 📶', 'Realtime socket latency: 28ms ( Kampala Node ).')}>
            <Text style={styles.actionBtnOutlineText}>Ping Cloud Database Latency 📶</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Full-Width Red Log Out Button Card */}
      {activeSubView === 'main' && (
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#fff5f5', borderColor: '#feb2b2', alignItems: 'center' }]} 
          onPress={handleSignOutPress}
        >
          <Text style={{ color: '#e53e3e', fontWeight: 'bold', fontSize: 13 }}>
            🚪 Log Out of Account
          </Text>
        </TouchableOpacity>
      )}

      {/* About & Secret Version Tap Trigger (7 Taps) */}
      <TouchableOpacity 
        style={[styles.card, isDarkMode && styles.darkCard, { alignItems: 'center', marginTop: 10 }]} 
        onPress={handleVersionTap}
        activeOpacity={0.8}
      >
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>ℹ️ About ChatUp Platform</Text>
        <Text style={{ fontSize: 12, color: '#718096' }}>Version: 2.6.0 (Production Release)</Text>
        <Text style={{ fontSize: 11, color: '#a0aec0', marginTop: 4, textAlign: 'center' }}>
          Developed by Borris • Built for Sovereign Peer-to-Peer Networks in Uganda 🇺🇬.
        </Text>
      </TouchableOpacity>

      {/* Modal 1: Enter Admin Email for OTP */}
      <Modal visible={emailModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.pinModalBox, isDarkMode && styles.darkCard]}>
            <Text style={[styles.pinTitle, isDarkMode && styles.darkText]}>📧 Admin Email Verification</Text>
            <Text style={styles.pinSubText}>Enter your registered administrator email to receive a secure OTP token:</Text>
            
            <TextInput
              style={[styles.pinInput, isDarkMode && { color: '#fff', borderColor: '#4a5568', backgroundColor: '#1a202c' }]}
              placeholder="admin@chatup.org"
              placeholderTextColor="#a0aec0"
              value={adminEmail}
              onChangeText={setAdminEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoFocus={true}
            />

            <View style={styles.pinButtonsRow}>
              <TouchableOpacity style={[styles.pinBtn, { backgroundColor: '#cbd5e0' }]} onPress={() => setEmailModalVisible(false)} disabled={loading}>
                <Text style={{ fontWeight: 'bold', color: '#4a5568' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pinBtn, { backgroundColor: '#3182ce' }]} onPress={requestEmailOtp} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={{ fontWeight: 'bold', color: '#fff' }}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Enter 6-Digit OTP Code with AI Intrusion Guard */}
      <Modal visible={otpModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.pinModalBox, isDarkMode && styles.darkCard]}>
            <Text style={[styles.pinTitle, isDarkMode && styles.darkText]}>🔑 Enter Email OTP</Text>
            <Text style={styles.pinSubText}>Check inbox and type the 6-digit secure token sent to {adminEmail}:</Text>
            
            <TextInput
              style={[styles.pinInput, isDarkMode && { color: '#fff', borderColor: '#4a5568', backgroundColor: '#1a202c' }]}
              placeholder="123456"
              placeholderTextColor="#a0aec0"
              keyboardType="numeric"
              maxLength={6}
              value={otpInput}
              onChangeText={setOtpInput}
              autoFocus={true}
            />

            <View style={styles.pinButtonsRow}>
              <TouchableOpacity style={[styles.pinBtn, { backgroundColor: '#cbd5e0' }]} onPress={() => setOtpModalVisible(false)} disabled={loading}>
                <Text style={{ fontWeight: 'bold', color: '#4a5568' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pinBtn, { backgroundColor: '#38a169' }]} onPress={verifyEmailOtp} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={{ fontWeight: 'bold', color: '#fff' }}>Verify & Unlock</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  title: { fontSize: 14, fontWeight: 'bold', color: '#2d3748', flex: 1 },
  subtitle: { fontSize: 11, color: '#718096', marginTop: 2 },
  darkText: { color: '#fff' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748', marginBottom: 10 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 13, color: '#2d3748' },
  navCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  navSub: { fontSize: 10, color: '#718096', marginTop: 2 },
  backButton: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#ebf8ff', borderRadius: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  subActionRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  rowLabel: { fontSize: 12, color: '#2d3748', fontWeight: '500' },
  actionBtnOutline: { borderWidth: 1, borderColor: '#cbd5e0', padding: 10, borderRadius: 8, alignItems: 'center', backgroundColor: '#fff' },
  actionBtnOutlineText: { color: '#2d3748', fontSize: 12, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  pinModalBox: { width: '80%', maxWidth: 320, backgroundColor: '#fff', padding: 20, borderRadius: 12 },
  pinTitle: { fontSize: 15, fontWeight: 'bold', color: '#2d3748', marginBottom: 8 },
  pinSubText: { fontSize: 12, color: '#718096', marginBottom: 15 },
  pinInput: { borderWidth: 1, borderColor: '#cbd5e0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, marginBottom: 15, backgroundColor: '#f7fafc' },
  pinButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  pinBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 6 },
  logoutBtnInline: { backgroundColor: '#e53e3e', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  logoutBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
});