import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch } from 'react-native';

export default function SettingsTab({
  isDarkMode,
  encryptionProtocol,
  setShowEncryptionPicker,
  tipJarEnabled,
  setTipJarEnabled,
  aiAssistantAutoReply,
  setAiAssistantAutoReply,
  bluetoothBeaconActive,
  setBluetoothBeaconActive,
  messagePermission,
  setShowPermissionPicker,
  hidePhoneNumber,
  setHidePhoneNumber,
  hideDob,
  setHideDob,
  showOnlineStatus,
  setShowOnlineStatus,
  pushNotifications,
  setPushNotifications,
  onPressSecurity,
  onPressSeedPhrase,
  onPressForgot
}) {
  return (
    <View style={[styles.card, isDarkMode && styles.darkCard]}>
      <Text style={[styles.cardTitle, isDarkMode && styles.darkText, { marginBottom: 12 }]}>
        ⚙️ International Settings & Security Hub
      </Text>
      
      <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>
        Configure global privacy preferences and account recovery options.
      </Text>

      <View style={styles.settingRowColumn}>
        <View style={{ flex: 1, marginBottom: 8 }}>
          <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>🔐 P2P Encryption Protocol</Text>
          <Text style={styles.itemSubtitle}>Select cryptographic security standard for direct messages.</Text>
        </View>
        <TouchableOpacity style={styles.dropdownSelector} onPress={() => setShowEncryptionPicker(true)}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3182ce' }}>{encryptionProtocol} ▾</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>🪙 Creator Tip Jar Widget</Text>
          <Text style={styles.itemSubtitle}>Allow fans and viewers to send direct coin tips.</Text>
        </View>
        <Switch
          value={tipJarEnabled}
          onValueChange={setTipJarEnabled}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>🤖 AI Auto-Reply Assistant</Text>
          <Text style={styles.itemSubtitle}>Automatically respond to fan inquiries.</Text>
        </View>
        <Switch
          value={aiAssistantAutoReply}
          onValueChange={setAiAssistantAutoReply}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>📡 Bluetooth Mesh Beacon</Text>
          <Text style={styles.itemSubtitle}>Broadcast creator profile packets locally to nearby peers.</Text>
        </View>
        <Switch
          value={bluetoothBeaconActive}
          onValueChange={setBluetoothBeaconActive}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      <View style={styles.settingRowColumn}>
        <View style={{ flex: 1, marginBottom: 8 }}>
          <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Who Can Message You Directly</Text>
          <Text style={styles.itemSubtitle}>Messages from unfollowed users route to Message Requests.</Text>
        </View>
        <TouchableOpacity style={styles.dropdownSelector} onPress={() => setShowPermissionPicker(true)}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3182ce' }}>{messagePermission} ▾</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Hide Phone Number</Text>
          <Text style={styles.itemSubtitle}>Keep your number private from strangers and QR scans.</Text>
        </View>
        <Switch
          value={hidePhoneNumber}
          onValueChange={setHidePhoneNumber}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Hide Date of Birth</Text>
          <Text style={styles.itemSubtitle}>Keep your birthday private from public profile views.</Text>
        </View>
        <Switch
          value={hideDob}
          onValueChange={setHideDob}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Online Presence</Text>
          <Text style={styles.itemSubtitle}>Allow contacts to see when you are active.</Text>
        </View>
        <Switch
          value={showOnlineStatus}
          onValueChange={setShowOnlineStatus}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.itemTitle, isDarkMode && styles.darkText]}>Push Notifications</Text>
          <Text style={styles.itemSubtitle}>Receive instant alerts for chats and mentions.</Text>
        </View>
        <Switch
          value={pushNotifications}
          onValueChange={setPushNotifications}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      <TouchableOpacity style={[styles.secBtnOutline, { marginTop: 16 }]} onPress={onPressSecurity}>
        <Text style={styles.secBtnText}>🔒 Change Master Passcode & Recovery</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.secBtnOutline, { borderColor: '#38a169', backgroundColor: '#f0fff4', marginTop: 10 }]} onPress={onPressSeedPhrase}>
        <Text style={[styles.secBtnText, { color: '#38a169' }]}>🛡️ Backup Recovery Seed Phrase (Lost Phone)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop: 14, alignItems: 'center' }} onPress={onPressForgot}>
        <Text style={{ fontSize: 11, color: '#e53e3e', fontWeight: 'bold' }}>Lost Phone or SIM? 🔑 Recover Account via Seed Phrase</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  darkText: { color: '#fff' },
  itemTitle: { fontSize: 12, fontWeight: 'bold', color: '#2d3748' },
  itemSubtitle: { fontSize: 10, color: '#718096', marginTop: 2 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  settingRowColumn: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  dropdownSelector: { backgroundColor: '#edf2f7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#cbd5e0' },
  secBtnOutline: { borderWidth: 1, borderColor: '#3182ce', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 10, backgroundColor: '#ebf8ff' },
  secBtnText: { color: '#3182ce', fontSize: 12, fontWeight: 'bold' }
});