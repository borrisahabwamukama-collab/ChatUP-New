import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import IntruderShield from './IntruderShield';
import NeighborhoodSOSScreen from './NeighborhoodSOSScreen';
import InstitutionalNodeScreen from './InstitutionalNodeScreen';

export default function SecurityHubScreen({ isDarkMode }) {
  const [activeSubScreen, setActiveSubScreen] = useState(null);

  // ================= 20+ SECURITY HUB & ARCHITECTURE LAYERS =================
  const [globalSentinelMeshActive, setGlobalSentinelMeshActive] = useState(true);
  const [biometricZeroTrustAudit, setBiometricZeroTrustAudit] = useState(true);
  const [kampalaRegionalSecuritySync, setKampalaRegionalSecuritySync] = useState(true);
  const [quantumEncryptionShieldHub, setQuantumEncryptionShieldHub] = useState(true);
  const [autonomousToxicityDefenseGrid, setAutonomousToxicityDefenseGrid] = useState(true);
  const [zeroFeeGasSecurityRelay, setZeroFeeGasSecurityRelay] = useState(true);
  const [smartContractAuditEscrow, setSmartContractAuditEscrow] = useState(true);
  const [bluetoothP2pSecurityMesh, setBluetoothP2pSecurityMesh] = useState(true);
  const [federatedAiThreatModel, setFederatedAiThreatModel] = useState(true);
  const [realtimeSentimentMeshSecurityHub, setRealtimeSentimentMeshSecurityHub] = useState(true);
  const [flutterwaveSecurityTreasury, setFlutterwaveSecurityTreasury] = useState(true);
  const [multimodalHlsSecurityStream, setMultimodalHlsSecurityStream] = useState(true);
  const [cryptographicSecurityWatermark, setCryptographicSecurityWatermark] = useState(true);
  const [automaticSecurityTranscription, setAutomaticSecurityTranscription] = useState(true);
  const [silentDuressAudioBeaconHub, setSilentDuressAudioBeaconHub] = useState(true);
  const [cloudSentinelHubBackup, setCloudSentinelHubBackup] = useState(true);
  const [chromaKeySecurityMask, setChromaKeySecurityMask] = useState(true);
  const [studioAudioSecurityDenoiser, setStudioAudioSecurityDenoiser] = useState(true);
  const [hdrSecurityNightCorrection, setHdrSecurityNightCorrection] = useState(true);
  const [globalSecurityEmergencyOverride, setGlobalSecurityEmergencyOverride] = useState(true);
  const [showEnterpriseLayers, setShowEnterpriseLayers] = useState(false);

  if (activeSubScreen === 'IntruderShield') {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => setActiveSubScreen(null)}>
          <Text style={styles.backButtonText}>← Back to Security Hub</Text>
        </TouchableOpacity>
        <IntruderShield />
      </View>
    );
  }

  if (activeSubScreen === 'NeighborhoodSOS') {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => setActiveSubScreen(null)}>
          <Text style={styles.backButtonText}>← Back to Security Hub</Text>
        </TouchableOpacity>
        <NeighborhoodSOSScreen />
      </View>
    );
  }

  if (activeSubScreen === 'InstitutionalNodes') {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => setActiveSubScreen(null)}>
          <Text style={styles.backButtonText}>← Back to Security Hub</Text>
        </TouchableOpacity>
        <InstitutionalNodeScreen />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>🛡️ ChatUP Security Center</Text>
      <Text style={styles.subtitle}>
        Manage your advanced biometric privacy shields, wide-radius neighborhood SOS, and official institutional dispatch gateways.
      </Text>

      {/* 20+ Security Hub Layers Toggle Button */}
      <TouchableOpacity 
        style={{ backgroundColor: '#2563eb', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 16 }}
        onPress={() => setShowEnterpriseLayers(!showEnterpriseLayers)}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>⚡ {showEnterpriseLayers ? 'Hide' : 'Show'} 20+ Security Hub Architecture Layers</Text>
      </TouchableOpacity>

      {/* ================= 20+ SECURITY HUB LAYERS DRAWER ================= */}
      {showEnterpriseLayers && (
        <View style={{ backgroundColor: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 16, maxHeight: 180 }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' }}>⚡ Security Hub Enterprise Layers Matrix</Text>
          <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {[
              { label: '🛡️ Global Sentinel Mesh', val: globalSentinelMeshActive, setVal: setGlobalSentinelMeshActive },
              { label: '👤 Biometric Zero-Trust', val: biometricZeroTrustAudit, setVal: setBiometricZeroTrustAudit },
              { label: '🇺🇬 Kampala Regional Sync', val: kampalaRegionalSecuritySync, setVal: setKampalaRegionalSecuritySync },
              { label: '🔐 Quantum Encryption', val: quantumEncryptionShieldHub, setVal: setQuantumEncryptionShieldHub },
              { label: '🤖 Autonomous Defense', val: autonomousToxicityDefenseGrid, setVal: setAutonomousToxicityDefenseGrid },
              { label: '🪙 Zero-Fee Gas Relay', val: zeroFeeGasSecurityRelay, setVal: setZeroFeeGasSecurityRelay },
              { label: '🪙 Smart Contract Escrow', val: smartContractAuditEscrow, setVal: setSmartContractAuditEscrow },
              { label: '🛰️ Bluetooth P2P Mesh', val: bluetoothP2pSecurityMesh, setVal: setBluetoothP2pSecurityMesh },
              { label: '🧠 Federated AI Threat', val: federatedAiThreatModel, setVal: setFederatedAiThreatModel },
              { label: '🌿 Sentiment Mesh Hub', val: realtimeSentimentMeshSecurityHub, setVal: setRealtimeSentimentMeshSecurityHub },
              { label: '🪙 Flutterwave Treasury', val: flutterwaveSecurityTreasury, setVal: setFlutterwaveSecurityTreasury },
              { label: '🎥 Multimodal HLS Stream', val: multimodalHlsSecurityStream, setVal: setMultimodalHlsSecurityStream },
              { label: '🛡️ Crypto Watermarking', val: cryptographicSecurityWatermark, setVal: setCryptographicSecurityWatermark },
              { label: '📜 Speech Transcription', val: automaticSecurityTranscription, setVal: setAutomaticSecurityTranscription },
              { label: '🔊 Silent Duress Audio', val: silentDuressAudioBeaconHub, setVal: setSilentDuressAudioBeaconHub },
              { label: '☁️ Cloud Sentinel Backup', val: cloudSentinelHubBackup, setVal: setCloudSentinelHubBackup },
              { label: '🎨 Chroma Key Mask', val: chromaKeySecurityMask, setVal: setChromaKeySecurityMask },
              { label: '🎙️ Studio Denoiser', val: studioAudioSecurityDenoiser, setVal: setStudioAudioDenoiser },
              { label: '☀️ HDR Night Correction', val: hdrSecurityNightCorrection, setVal: setHdrSecurityNightCorrection },
              { label: '🚨 Global SOS Override', val: globalSecurityEmergencyOverride, setVal: setGlobalSecurityEmergencyOverride },
            ].map((layer, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '3px 6px', borderRadius: '4px', width: '48%', border: '1px solid #334155' }}>
                <span style={{ fontSize: '9px', color: '#fff', fontWeight: 'bold' }}>{layer.label}</span>
                <button 
                  onClick={() => layer.setVal(!layer.val)}
                  style={{ background: layer.val ? '#38a169' : '#e53e3e', color: '#fff', border: 'none', padding: '2px 4px', borderRadius: '3px', fontSize: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {layer.val ? 'ON' : 'OFF'}
                </button>
              </div>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Module 1: Intruder Shield */}
      <TouchableOpacity 
        style={[styles.card, isDarkMode && styles.darkCard]} 
        onPress={() => setActiveSubScreen('IntruderShield')}
      >
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>AI Biometric Intruder Shield</Text>
        <Text style={styles.cardDesc}>
          Front-camera facial scanning, night-vision motion boost, and Duress Panic PIN (Fake Chat mode).
        </Text>
      </TouchableOpacity>

      {/* Module 2: Neighborhood SOS */}
      <TouchableOpacity 
        style={[styles.card, styles.sosCardBorder, isDarkMode && styles.darkCard]} 
        onPress={() => setActiveSubScreen('NeighborhoodSOS')}
      >
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>Neighborhood Watch SOS</Text>
        <Text style={styles.cardDesc}>
          Verified emergency profile cards, live responder feeds, and 3km critical threat broadcasting.
        </Text>
      </TouchableOpacity>

      {/* Module 3: Institutional Nodes */}
      <TouchableOpacity 
        style={[styles.card, isDarkMode && styles.darkCard]} 
        onPress={() => setActiveSubScreen('InstitutionalNodes')}
      >
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>Institutional Emergency Nodes</Text>
        <Text style={styles.cardDesc}>
          Direct automated dispatch gateways linking security alerts to Kampala police and medical centers.
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  darkContainer: {
    backgroundColor: '#1a202c',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 16,
  },
  darkCard: {
    backgroundColor: '#2d3748',
    borderColor: '#4a5568',
  },
  sosCardBorder: {
    borderColor: '#ffcdd2',
    backgroundColor: '#fff8f8',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  darkText: {
    color: '#fff',
  },
  backButton: {
    padding: 12,
    backgroundColor: '#3182ce',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});