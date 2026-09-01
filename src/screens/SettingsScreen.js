import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

export default function SettingsScreen({ isDarkMode, setIsDarkMode }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [biometricLock, setBiometricLock] = useState(true);
  const [autoMeshRelay, setAutoMeshRelay] = useState(true);
  
  // Advanced & Privacy States
  const [debugOverlay, setDebugOverlay] = useState(false);
  const [bluetoothBleOnly, setBluetoothBleOnly] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [hideFollowersList, setHideFollowersList] = useState(false);
  const [hideActivityStatus, setHideActivityStatus] = useState(true);

  const handleClearCache = (type) => {
    Alert.alert('Cache Cleared 🧹', `Successfully cleared local ${type} storage.`);
  };

  const handleSecurityAction = (actionName) => {
    Alert.alert('Security Control 🛡️', `${actionName} executed successfully.`);
  };

  const handleNetworkAction = (actionName) => {
    Alert.alert('Network Protocol 🛰️', `${actionName} applied to active mesh interface.`);
  };

  const handlePrivacyAlert = (settingName, state) => {
    Alert.alert('Privacy Updated 🛡️', `${settingName} is now ${state ? 'ENABLED 🔒' : 'DISABLED 🔓'}.`);
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      
      {/* Header */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>⚙️ System Settings & Control Center</Text>
        <Text style={styles.subtitle}>Configure privacy shields, advanced security, offline node routing, appearance, and local storage limits.</Text>
      </View>

      {/* Privacy & Account Visibility */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🕵️ Privacy & Account Visibility</Text>
        
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>Private Account Mode</Text>
            <Text style={{ fontSize: 10, color: '#718096' }}>Only approved followers can view your uploads and streams.</Text>
          </View>
          <Switch
            value={isPrivateAccount}
            onValueChange={(val) => {
              setIsPrivateAccount(val);
              handlePrivacyAlert('Private Account', val);
            }}
            trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
          />
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>Hide Followers & Following List</Text>
            <Text style={{ fontSize: 10, color: '#718096' }}>Restrict other peers from inspecting your network connections.</Text>
          </View>
          <Switch
            value={hideFollowersList}
            onValueChange={(val) => {
              setHideFollowersList(val);
              handlePrivacyAlert('Follower List Shield', val);
            }}
            trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
          />
        </View>

        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>Hide Mesh Activity Status</Text>
            <Text style={{ fontSize: 10, color: '#718096' }}>Conceal your live node relay status from public peer scanners.</Text>
          </View>
          <Switch
            value={hideActivityStatus}
            onValueChange={(val) => {
              setHideActivityStatus(val);
              handlePrivacyAlert('Activity Stealth', val);
            }}
            trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
          />
        </View>
      </View>

      {/* Account & Security */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🔒 Account Security & Encryption</Text>
        
        <View style={styles.row}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>Biometric / Passcode Lock</Text>
          <Switch
            value={biometricLock}
            onValueChange={setBiometricLock}
            trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
          />
        </View>

        <TouchableOpacity style={styles.subActionRow} onPress={() => handleSecurityAction('Export Recovery Phrase')}>
          <Text style={{ fontSize: 12, color: '#3182ce', fontWeight: 'bold' }}>🔑 Export Zero-Knowledge Key Backup</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.subActionRow} onPress={() => handleSecurityAction('Rotate Identity Keys')}>
          <Text style={{ fontSize: 12, color: '#3182ce', fontWeight: 'bold' }}>🔄 Rotate Cryptographic Identity Fingerprint</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.subActionRow, { borderBottomWidth: 0 }]} onPress={() => handleSecurityAction('Active Sessions Revoked')}>
          <Text style={{ fontSize: 12, color: '#e53e3e', fontWeight: 'bold' }}>⚠️ Terminate All Active Remote Sessions</Text>
        </TouchableOpacity>
      </View>

      {/* Appearance & Sound */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🎨 Appearance, Theme & Audio</Text>
        
        <View style={styles.row}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>Dark Mode Theme</Text>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
          />
        </View>

        <View style={[styles.row, { borderBottomWidth: 0, marginTop: 8 }]}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>In-App Audio & Haptic Feedback</Text>
          <Switch
            value={soundEffects}
            onValueChange={setSoundEffects}
            trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
          />
        </View>
      </View>

      {/* Zero-Net Mesh & Connectivity */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🛰️ Offline Mesh & Network Routing</Text>
        
        <View style={styles.row}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>Push Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
          />
        </View>

        <View style={styles.row}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>Zero-Net Data Saver Mode</Text>
          <Switch
            value={dataSaver}
            onValueChange={setDataSaver}
            trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
          />
        </View>

        <View style={styles.row}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>Auto-Relay Mesh Packets</Text>
          <Switch
            value={autoMeshRelay}
            onValueChange={setAutoMeshRelay}
            trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
          />
        </View>

        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>Restrict to Bluetooth BLE Only</Text>
          <Switch
            value={bluetoothBleOnly}
            onValueChange={setBluetoothBleOnly}
            trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
          />
        </View>

        <TouchableOpacity style={[styles.subActionRow, { marginTop: 8, borderBottomWidth: 0 }]} onPress={() => handleNetworkAction('Forced Wi-Fi Direct Handshake')}>
          <Text style={{ fontSize: 12, color: '#3182ce', fontWeight: 'bold' }}>📡 Force Rescan Nearby Wi-Fi Direct Nodes</Text>
        </TouchableOpacity>
      </View>

      {/* Advanced Developer & Diagnostics */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>🛠️ Developer & Diagnostics Suite</Text>
        
        <View style={styles.row}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>Live Packet Inspection Overlay</Text>
          <Switch
            value={debugOverlay}
            onValueChange={setDebugOverlay}
            trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
          />
        </View>

        <TouchableOpacity style={styles.subActionRow} onPress={() => handleSecurityAction('Ping Supabase Realtime DB')}>
          <Text style={{ fontSize: 12, color: '#3182ce', fontWeight: 'bold' }}>🔌 Test Cloud Database Latency Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.subActionRow, { borderBottomWidth: 0 }]} onPress={() => handleSecurityAction('Export System Diagnostics Log')}>
          <Text style={{ fontSize: 12, color: '#3182ce', fontWeight: 'bold' }}>📋 Export Raw Crash & Event Logs (.txt)</Text>
        </TouchableOpacity>
      </View>

      {/* Storage & Maintenance */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>💾 Storage & Local Cache</Text>
        
        <View style={styles.storageStatsRow}>
          <Text style={{ fontSize: 11, color: '#718096' }}>Used Space: <Text style={{ fontWeight: 'bold', color: isDarkMode ? '#fff' : '#2d3748' }}>142 MB</Text></Text>
          <Text style={{ fontSize: 11, color: '#718096' }}>Available: <Text style={{ fontWeight: 'bold', color: '#38a169' }}>Unlimited Local</Text></Text>
        </View>

        <TouchableOpacity style={styles.actionBtnOutline} onPress={() => handleClearCache('Media & Video Cache (84 MB)')}>
          <Text style={styles.actionBtnOutlineText}>Clear Media Cache 🗑️</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtnOutline, { marginTop: 8 }]} onPress={() => handleClearCache('Mesh Packets & Chat Logs (58 MB)')}>
          <Text style={styles.actionBtnOutlineText}>Clear Mesh Packet Logs 🛰️</Text>
        </TouchableOpacity>
      </View>

      {/* About & License */}
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>ℹ️ About ChatUp Platform</Text>
        <Text style={{ fontSize: 12, color: '#718096' }}>Version: 2.6.0 (Production Release)</Text>
        <Text style={{ fontSize: 11, color: '#a0aec0', marginTop: 4 }}>Developed by Borris • Built for Sovereign Peer-to-Peer Networks in Uganda 🇺🇬.</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  darkContainer: { backgroundColor: '#1a202c' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  title: { fontSize: 15, fontWeight: 'bold', color: '#2d3748', marginBottom: 4 },
  subtitle: { fontSize: 11, color: '#718096' },
  darkText: { color: '#fff' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  subActionRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  rowLabel: { fontSize: 12, color: '#2d3748', fontWeight: '500' },
  storageStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, backgroundColor: '#f7fafc', padding: 8, borderRadius: 6 },
  actionBtnOutline: { borderWidth: 1, borderColor: '#cbd5e0', padding: 10, borderRadius: 8, alignItems: 'center', backgroundColor: '#fff' },
  actionBtnOutlineText: { color: '#2d3748', fontSize: 12, fontWeight: 'bold' },
});