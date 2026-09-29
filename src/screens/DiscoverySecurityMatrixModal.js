import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Switch,
} from 'react-native';

export default function DiscoverySecurityMatrixModal({
  visible,
  onClose,
  isDarkMode,
  quantumLatticeSecurity,
  setQuantumLatticeSecurity,
  kampalaEdgeRelaySync,
  setKampalaEdgeRelaySync,
  aiAutonomousToxicityGuard,
  setAiAutonomousToxicityGuard,
  biometricCreatorWatermark,
  setBiometricCreatorWatermark,
  realtimeSentimentMesh,
  setRealtimeSentimentMesh,
  zeroFeeGasSubsidizer,
  setZeroFeeGasSubsidizer,
  multimodalHlsAdaptive,
  setMultimodalHlsAdaptive,
  federatedOnDeviceAi,
  setFederatedOnDeviceAi,
  bluetoothP2pMeshRelay,
  setBluetoothP2pMeshRelay,
  autonomousCreatorEscrow,
  setAutonomousCreatorEscrow,
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={[styles.modalContent, isDarkMode && styles.darkCard, { maxHeight: '80%' }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>🛡️ Security & Architecture Matrix</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#718096' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={true}>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🔒 Quantum Lattice Encryption</Text>
              <Switch value={quantumLatticeSecurity} onValueChange={setQuantumLatticeSecurity} trackColor={{ false: '#cbd5e0', true: '#9333ea' }} />
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🇺🇬 Kampala Telecom Edge Relay</Text>
              <Switch value={kampalaEdgeRelaySync} onValueChange={setKampalaEdgeRelaySync} trackColor={{ false: '#cbd5e0', true: '#3182ce' }} />
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🛡️ Autonomous Toxicity Guard</Text>
              <Switch value={aiAutonomousToxicityGuard} onValueChange={setAiAutonomousToxicityGuard} trackColor={{ false: '#cbd5e0', true: '#e53e3e' }} />
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>✍️ Creator Biometric Watermark</Text>
              <Switch value={biometricCreatorWatermark} onValueChange={setBiometricCreatorWatermark} trackColor={{ false: '#cbd5e0', true: '#38a169' }} />
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🌿 Real-Time Sentiment Mesh Index</Text>
              <Switch value={realtimeSentimentMesh} onValueChange={setRealtimeSentimentMesh} trackColor={{ false: '#cbd5e0', true: '#d69e2e' }} />
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🪙 Zero-Fee Creator Gas Subsidizer</Text>
              <Switch value={zeroFeeGasSubsidizer} onValueChange={setZeroFeeGasSubsidizer} trackColor={{ false: '#cbd5e0', true: '#319795' }} />
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🎥 Adaptive Multimodal HLS Streaming</Text>
              <Switch value={multimodalHlsAdaptive} onValueChange={setMultimodalHlsAdaptive} trackColor={{ false: '#cbd5e0', true: '#2563eb' }} />
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🧠 Federated On-Device AI Personalizer</Text>
              <Switch value={federatedOnDeviceAi} onValueChange={setFederatedOnDeviceAi} trackColor={{ false: '#cbd5e0', true: '#805ad5' }} />
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🛰️ Bluetooth P2P Offline Mesh Sync</Text>
              <Switch value={bluetoothP2pMeshRelay} onValueChange={setBluetoothP2pMeshRelay} trackColor={{ false: '#cbd5e0', true: '#48bb78' }} />
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>🪙 Autonomous Creator Tip Escrow</Text>
              <Switch value={autonomousCreatorEscrow} onValueChange={setAutonomousCreatorEscrow} trackColor={{ false: '#cbd5e0', true: '#b7791f' }} />
            </View>
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 14, width: '100%' },
  darkCard: { backgroundColor: '#2d3748', borderColor: '#4a5568' },
  modalTitle: { fontSize: 13, fontWeight: 'bold', color: '#2d3748' },
  darkText: { color: '#fff' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  settingLabel: { fontSize: 11, fontWeight: 'bold', color: '#2d3748' },
});