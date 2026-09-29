import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

export default function AdminSwitchesModule({ switchesState, superAdminAccessEnabled, handleToggleSwitch, isDarkMode }) {
  return (
    <View style={[styles.card, isDarkMode && styles.darkCard]}>
      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>🔌 Master Architectural Global Switches (22 Enterprise Controls)</Text>
      <Text style={{ fontSize: 11, color: '#718096', marginBottom: 10 }}>Supreme overrides to instantly control core transmission, treasury, and security layers.</Text>
      
      {/* 1. Master Super-Admin Panel Access Switch */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText, { fontWeight: 'bold', color: '#2563eb' }]}>👑 1. Master Super-Admin Panel Access Switch</Text>
          <Text style={{ fontSize: 10, color: '#718096' }}>Toggle ON to show Admin & Treasury in menu.</Text>
          <Text style={styles.statusText}>{superAdminAccessEnabled ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={superAdminAccessEnabled}
          onValueChange={(val) => handleToggleSwitch('master_admin', val, 'Master Super-Admin Panel Access')}
          trackColor={{ false: '#cbd5e0', true: '#2563eb' }}
        />
      </View>

      {/* 2. Master Offline Mesh Transmission Switch */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>🛰️ 2. Master Offline Mesh Transmission Switch</Text>
          <Text style={styles.statusText}>{switchesState.meshTransmission ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={switchesState.meshTransmission}
          onValueChange={(val) => handleToggleSwitch('meshTransmission', val, 'Master Offline Mesh Transmission')}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* 3. Master AI Voice-Translation Feature Switch */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>🤖 3. Master AI Voice-Translation Feature Switch</Text>
          <Text style={styles.statusText}>{switchesState.aiVoiceTranslation ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={switchesState.aiVoiceTranslation}
          onValueChange={(val) => handleToggleSwitch('aiVoiceTranslation', val, 'Master AI Voice-Translation')}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* 4. God-Mode Messaging Visibility Policy */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>🔓 4. God-Mode Messaging Visibility Policy</Text>
          <Text style={styles.statusText}>{switchesState.godModeVisibility ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={switchesState.godModeVisibility}
          onValueChange={(val) => handleToggleSwitch('godModeVisibility', val, 'God-Mode Messaging Visibility')}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* 5. In-App Advertising Suite Master Switch */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>📢 5. In-App Advertising Suite Master Switch</Text>
          <Text style={styles.statusText}>{switchesState.adNetworkGlobal ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={switchesState.adNetworkGlobal}
          onValueChange={(val) => handleToggleSwitch('adNetworkGlobal', val, 'In-App Advertising Suite')}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* 6. Med-SOS & Neighborhood Watch Relay */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>🚨 6. Med-SOS & Neighborhood Watch Relay</Text>
          <Text style={styles.statusText}>{switchesState.emergencySosGlobal ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={switchesState.emergencySosGlobal}
          onValueChange={(val) => handleToggleSwitch('emergencySosGlobal', val, 'Med-SOS Relay')}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* 7. Anti-Piracy Cryptographic Watermarking */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>🛡️ 7. Anti-Piracy Cryptographic Watermarking</Text>
          <Text style={styles.statusText}>{switchesState.drmWatermarkGlobal ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={switchesState.drmWatermarkGlobal}
          onValueChange={(val) => handleToggleSwitch('drmWatermarkGlobal', val, 'Anti-Piracy Watermarking')}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* 8. New User Registration Portal */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>👤 8. New User Registration Portal</Text>
          <Text style={styles.statusText}>{switchesState.newRegistrations ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={switchesState.newRegistrations}
          onValueChange={(val) => handleToggleSwitch('newRegistrations', val, 'New User Registration Portal')}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* 9. Flutterwave Payout Gateway */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>🪙 9. Flutterwave Payout Gateway</Text>
          <Text style={styles.statusText}>{switchesState.payoutGatewayActive ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={switchesState.payoutGatewayActive}
          onValueChange={(val) => handleToggleSwitch('payoutGatewayActive', val, 'Flutterwave Payout Gateway')}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* 10. Live Streaming & Church Broadcast Suite */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>📹 10. Live Streaming & Church Broadcast Suite</Text>
          <Text style={styles.statusText}>{switchesState.liveStreamingGlobal ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={switchesState.liveStreamingGlobal}
          onValueChange={(val) => handleToggleSwitch('liveStreamingGlobal', val, 'Live Streaming Suite')}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* 11. Chat Media Vault Uploads (Images/Files) */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>🖼️ 11. Chat Media Vault Uploads (Images/Files)</Text>
          <Text style={styles.statusText}>{switchesState.chatMediaUploads ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={switchesState.chatMediaUploads}
          onValueChange={(val) => handleToggleSwitch('chatMediaUploads', val, 'Chat Media Vault Uploads')}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* 12. Quantum Lattice Security Layer */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>🔐 12. Quantum Lattice Security Layer</Text>
          <Text style={styles.statusText}>{switchesState.quantumEncryptionLayer ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={switchesState.quantumEncryptionLayer}
          onValueChange={(val) => handleToggleSwitch('quantumEncryptionLayer', val, 'Quantum Lattice Security')}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* 13. Kampala Edge Relay Sync */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>🇺🇬 13. Kampala Edge Relay Sync</Text>
          <Text style={styles.statusText}>{switchesState.kampalaEdgeRelaySync ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={switchesState.kampalaEdgeRelaySync}
          onValueChange={(val) => handleToggleSwitch('kampalaEdgeRelaySync', val, 'Kampala Edge Relay Sync')}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* 14. Biometric Sender Watermark Core */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>✍️ 14. Biometric Sender Watermark Core</Text>
          <Text style={styles.statusText}>{switchesState.biometricWatermarkCore ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={switchesState.biometricWatermarkCore}
          onValueChange={(val) => handleToggleSwitch('biometricWatermarkCore', val, 'Biometric Sender Watermark')}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* 15. Federated On-Device AI Engine */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>🧠 15. Federated On-Device AI Engine</Text>
          <Text style={styles.statusText}>{switchesState.federatedOnDeviceAiEngine ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={switchesState.federatedOnDeviceAiEngine}
          onValueChange={(val) => handleToggleSwitch('federatedOnDeviceAiEngine', val, 'Federated On-Device AI Engine')}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* 16. Bluetooth P2P Mesh Relay */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>🛰️ 16. Bluetooth P2P Mesh Relay</Text>
          <Text style={styles.statusText}>{switchesState.bluetoothP2pMeshRelay ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={switchesState.bluetoothP2pMeshRelay}
          onValueChange={(val) => handleToggleSwitch('bluetoothP2pMeshRelay', val, 'Bluetooth P2P Mesh Relay')}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* 17. Autonomous Message Escrow */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>🪙 17. Autonomous Message Escrow</Text>
          <Text style={styles.statusText}>{switchesState.autonomousMessageEscrow ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={switchesState.autonomousMessageEscrow}
          onValueChange={(val) => handleToggleSwitch('autonomousMessageEscrow', val, 'Autonomous Message Escrow')}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* 18. Zero-Fee Gas Subsidizer */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>🪙 18. Zero-Fee Gas Subsidizer</Text>
          <Text style={styles.statusText}>{switchesState.zeroFeeGasSubsidizer ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={switchesState.zeroFeeGasSubsidizer}
          onValueChange={(val) => handleToggleSwitch('zeroFeeGasSubsidizer', val, 'Zero-Fee Gas Subsidizer')}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* 19. AI Autonomous Toxicity Guard */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>🛡️ 19. AI Autonomous Toxicity Guard</Text>
          <Text style={styles.statusText}>{switchesState.aiAutonomousToxicityGuard ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={switchesState.aiAutonomousToxicityGuard}
          onValueChange={(val) => handleToggleSwitch('aiAutonomousToxicityGuard', val, 'AI Autonomous Toxicity Guard')}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* 20. Real-Time Sentiment Mesh */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>🌿 20. Real-Time Sentiment Mesh</Text>
          <Text style={styles.statusText}>{switchesState.realtimeSentimentMesh ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={switchesState.realtimeSentimentMesh}
          onValueChange={(val) => handleToggleSwitch('realtimeSentimentMesh', val, 'Real-Time Sentiment Mesh')}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* 21. Multimodal HLS Adaptive Streaming */}
      <View style={styles.switchRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText]}>🎥 21. Multimodal HLS Adaptive Streaming</Text>
          <Text style={styles.statusText}>{switchesState.multimodalHlsAdaptive ? 'ACTIVE 🟢' : 'DISABLED 🔴'}</Text>
        </View>
        <Switch
          value={switchesState.multimodalHlsAdaptive}
          onValueChange={(val) => handleToggleSwitch('multimodalHlsAdaptive', val, 'Multimodal HLS Adaptive')}
          trackColor={{ false: '#cbd5e0', true: '#3182ce' }}
        />
      </View>

      {/* 22. Global Emergency Maintenance Lockdown */}
      <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.rowLabel, isDarkMode && styles.darkText, { color: '#e53e3e', fontWeight: 'bold' }]}>🚨 22. Global Emergency Maintenance Lockdown</Text>
          <Text style={styles.statusText}>{switchesState.maintenanceMode ? 'ACTIVE (LOCKDOWN) 🔴' : 'NORMAL (INACTIVE) 🟢'}</Text>
        </View>
        <Switch
          value={switchesState.maintenanceMode}
          onValueChange={(val) => handleToggleSwitch('maintenanceMode', val, 'Global Emergency Maintenance Lockdown')}
          trackColor={{ false: '#cbd5e0', true: '#e53e3e' }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  darkCard: { backgroundColor: '#1e293b', borderColor: '#334155' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  darkText: { color: '#f8fafc' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rowLabel: { fontSize: 12, color: '#0f172a', fontWeight: '600' },
  statusText: { fontSize: 9, fontWeight: 'bold', marginTop: 3, color: '#16a34a' }
});