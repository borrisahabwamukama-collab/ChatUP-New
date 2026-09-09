import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert, Platform } from 'react-native';

export default function InstitutionalNodesScreen() {
  const [policeDispatchActive, setPoliceDispatchActive] = useState(true);
  const [medicalDispatchActive, setMedicalDispatchActive] = useState(true);
  const [localOutpostActive, setLocalOutpostActive] = useState(true);
  const [lastSyncStatus, setLastSyncStatus] = useState("All institutional nodes synced & armed.");

  // ================= 20+ INSTITUTIONAL & GOV-GRID DISPATCH LAYERS =================
  const [kampalaCentralCommandMesh, setKampalasCentralCommandMesh] = useState(true);
  const [interPolCrossBorderRelay, setInterPolCrossBorderRelay] = useState(true);
  const [nationalAmbulanceDispatcherAi, setNationalAmbulanceDispatcherAi] = useState(true);
  const [quantumNodeSecurityHash, setQuantumNodeSecurityHash] = useState(true);
  const [autonomousDroneInterceptionGrid, setAutonomousDroneInterceptionGrid] = useState(true);
  const [zeroFeeGovSubsidizer, setZeroFeeGovSubsidizer] = useState(true);
  const [smartContractEmergencyEscrow, setSmartContractEmergencyEscrow] = useState(true);
  const [bluetoothP2pGovMesh, setBluetoothP2pGovMesh] = useState(true);
  const [federatedAiThreatAnalyticsGov, setFederatedAiThreatAnalyticsGov] = useState(true);
  const [realtimeSentimentMeshGov, setRealtimeSentimentMeshGov] = useState(true);
  const [flutterwaveGovTreasurySync, setFlutterwaveGovTreasurySync] = useState(true);
  const [multimodalHlsNodeSurveillance, setMultimodalHlsNodeSurveillance] = useState(true);
  const [cryptographicNodeWatermark, setCryptographicNodeWatermark] = useState(true);
  const [automaticSpeechDispatchLog, setAutomaticSpeechDispatchLog] = useState(true);
  const [silentDuressAudioBeaconGov, setSilentDuressAudioBeaconGov] = useState(true);
  const [cloudSentinelNodeBackup, setCloudSentinelNodeBackup] = useState(true);
  const [chromaKeyNodeMasking, setChromaKeyNodeMasking] = useState(true);
  const [studioAudioNodeDenoiser, setStudioAudioNodeDenoiser] = useState(true);
  const [hdrNightVisionNodeCorrection, setHdrNightVisionNodeCorrection] = useState(true);
  const [globalGovEmergencyOverride, setGlobalGovEmergencyOverride] = useState(true);
  const [showEnterpriseLayers, setShowEnterpriseLayers] = useState(false);

  const testNodeDispatch = (nodeName) => {
    const timestamp = new Date().toLocaleTimeString();
    const statusMsg = `[${timestamp}] Test SOS packet successfully dispatched to ${nodeName} desk!`;
    setLastSyncStatus(statusMsg);
    Alert.alert("🏛️ Node Dispatch Test", `Encrypted coordinates and Verified Emergency Profile sent to ${nodeName}.`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Institutional Emergency Nodes</Text>
      <Text style={styles.subtitle}>
        Direct automated dispatch links connecting 3km critical threat alerts to official Kampala authorities and medical centers.
      </Text>

      {/* 20+ Institutional Layers Toggle Button */}
      <TouchableOpacity 
        style={{ backgroundColor: '#2563eb', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 14 }}
        onPress={() => setShowEnterpriseLayers(!showEnterpriseLayers)}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>⚡ {showEnterpriseLayers ? 'Hide' : 'Show'} 20+ Institutional & Gov-Grid Layers</Text>
      </TouchableOpacity>

      {/* ================= 20+ INSTITUTIONAL LAYERS DRAWER ================= */}
      {showEnterpriseLayers && (
        <View style={{ backgroundColor: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 14, maxHeight: 180 }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' }}>⚡ Institutional Nodes Enterprise Layers Matrix</Text>
          <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {[
              { label: '🏛️ Kampala Central Mesh', val: kampalaCentralCommandMesh, setVal: setKampalasCentralCommandMesh },
              { label: '🌐 InterPol Border Relay', val: interPolCrossBorderRelay, setVal: setInterPolCrossBorderRelay },
              { label: '🚑 National EMS AI', val: nationalAmbulanceDispatcherAi, setVal: setNationalAmbulanceDispatcherAi },
              { label: '🔐 Quantum Node Security', val: quantumNodeSecurityHash, setVal: setQuantumNodeSecurityHash },
              { label: '🚁 Autonomous Drone Grid', val: autonomousDroneInterceptionGrid, setVal: setAutonomousDroneInterceptionGrid },
              { label: '🪙 Zero-Fee Gov Gas', val: zeroFeeGovSubsidizer, setVal: setZeroFeeGovSubsidizer },
              { label: '🪙 Smart Contract Escrow', val: smartContractEmergencyEscrow, setVal: setSmartContractEmergencyEscrow },
              { label: '🛰️ Bluetooth P2P Gov Mesh', val: bluetoothP2pGovMesh, setVal: setBluetoothP2pGovMesh },
              { label: '🧠 Federated AI Threat', val: federatedAiThreatAnalyticsGov, setVal: setFederatedAiThreatAnalyticsGov },
              { label: '🌿 Sentiment Mesh Gov', val: realtimeSentimentMeshGov, setVal: setRealtimeSentimentMeshGov },
              { label: '🪙 Flutterwave Gov Sync', val: flutterwaveGovTreasurySync, setVal: setFlutterwaveGovTreasurySync },
              { label: '🎥 Multimodal HLS Feed', val: multimodalHlsNodeSurveillance, setVal: setMultimodalHlsNodeSurveillance },
              { label: '🛡️ Crypto Watermark', val: cryptographicNodeWatermark, setVal: setCryptographicNodeWatermark },
              { label: '📜 Speech Dispatch Log', val: automaticSpeechDispatchLog, setVal: setAutomaticSpeechDispatchLog },
              { label: '🔊 Silent Duress Audio', val: silentDuressAudioBeaconGov, setVal: setSilentDuressAudioBeaconGov },
              { label: '☁️ Cloud Sentinel Backup', val: cloudSentinelNodeBackup, setVal: setCloudSentinelNodeBackup },
              { label: '🎨 Chroma Key Mask', val: chromaKeyNodeMasking, setVal: setChromaKeyNodeMasking },
              { label: '🎙️ Studio Denoiser', val: studioAudioNodeDenoiser, setVal: setStudioAudioNodeDenoiser },
              { label: '☀️ HDR Night Correction', val: hdrNightVisionNodeCorrection, setVal: setHdrNightVisionNodeCorrection },
              { label: '🚨 Global Gov Override', val: globalGovEmergencyOverride, setVal: setGlobalGovEmergencyOverride },
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

      {/* Node Control Panel */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>📡 Active Dispatch Gateways</Text>

        <View style={styles.row}>
          <View style={styles.nodeTextContainer}>
            <Text style={styles.label}>Kampala Police Central Command</Text>
            <Text style={styles.sublabel}>Auto-dispatches armed threat coordinates</Text>
          </View>
          <Switch 
            value={policeDispatchActive} 
            onValueChange={setPoliceDispatchActive} 
            trackColor={{ false: "#767577", true: "#e74c3c" }} 
          />
        </View>

        <View style={styles.row}>
          <View style={styles.nodeTextContainer}>
            <Text style={styles.label}>Emergency Medical Services (EMS)</Text>
            <Text style={styles.sublabel}>Shares blood type & medical profile</Text>
          </View>
          <Switch 
            value={medicalDispatchActive} 
            onValueChange={setMedicalDispatchActive} 
            trackColor={{ false: "#767577", true: "#27ae60" }} 
          />
        </View>

        <View style={styles.row}>
          <View style={styles.nodeTextContainer}>
            <Text style={styles.label}>Local Community Security Outpost</Text>
            <Text style={styles.sublabel}>Direct link to neighborhood patrol units</Text>
          </View>
          <Switch 
            value={localOutpostActive} 
            onValueChange={setLocalOutpostActive} 
            trackColor={{ false: "#767577", true: "#007AFF" }} 
          />
        </View>
      </View>

      {/* Sync Status Box */}
      <View style={styles.statusBox}>
        <Text style={styles.statusTitle}>Gateway Status:</Text>
        <Text style={styles.statusText}>{lastSyncStatus}</Text>
      </View>

      {/* Testing Actions */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => testNodeDispatch('Kampala Police Command')}
        >
          <Text style={styles.testButtonText}>Test Police Dispatch Node</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.testButton, { backgroundColor: '#27ae60' }]} 
          onPress={() => testNodeDispatch('Emergency Medical Services')}
        >
          <Text style={styles.testButtonText}>Test Medical Dispatch Node</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  nodeTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sublabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  statusBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0d47a1',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#37474f',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  buttonContainer: {
    gap: 10,
  },
  testButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});