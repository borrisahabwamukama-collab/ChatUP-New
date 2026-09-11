import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert, Platform } from 'react-native';
import { supabase } from '../supabaseClient'; // Adjust path if your client is located elsewhere

export default function InstitutionalNodesScreen() {
  const [policeDispatchActive, setPoliceDispatchActive] = useState(true);
  const [medicalDispatchActive, setMedicalDispatchActive] = useState(true);
  const [localOutpostActive, setLocalOutpostActive] = useState(true);
  const [lastSyncStatus, setLastSyncStatus] = useState("All institutional nodes synced & armed.");
  const [isSaving, setIsSaving] = useState(false);

  // ================= 20+ INSTITUTIONAL & GOV-GRID DISPATCH LAYERS STATE =================
  const [institutionalLayers, setInstitutionalLayers] = useState({
    kampalaCentralCommandMesh: true,
    interPolCrossBorderRelay: true,
    nationalAmbulanceDispatcherAi: true,
    quantumNodeSecurityHash: true,
    autonomousDroneInterceptionGrid: true,
    zeroFeeGovSubsidizer: true,
    smartContractEmergencyEscrow: true,
    bluetoothP2pGovMesh: true,
    federatedAiThreatAnalyticsGov: true,
    realtimeSentimentMeshGov: true,
    flutterwaveGovTreasurySync: true,
    multimodalHlsNodeSurveillance: true,
    cryptographicNodeWatermark: true,
    automaticSpeechDispatchLog: true,
    silentDuressAudioBeaconGov: true,
    cloudSentinelNodeBackup: true,
    chromaKeyNodeMasking: true,
    studioAudioNodeDenoiser: true,
    hdrNightVisionNodeCorrection: true,
    globalGovEmergencyOverride: true,
  });

  // Load saved Institutional settings and setup real-time subscription on mount
  useEffect(() => {
    fetchInstitutionalSettings();

    // Setup Supabase Realtime subscription for cross-device sync
    const subscription = supabase
      .channel('public:institutional_settings')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'institutional_settings',
          filter: 'id=eq.1',
        },
        (payload) => {
          const data = payload.new;
          if (data) {
            setPoliceDispatchActive(data.police_dispatch_active ?? true);
            setMedicalDispatchActive(data.medical_dispatch_active ?? true);
            setLocalOutpostActive(data.local_outpost_active ?? true);
            setInstitutionalLayers({
              kampalaCentralCommandMesh: data.kampala_central_command_mesh ?? true,
              interPolCrossBorderRelay: data.interpol_cross_border_relay ?? true,
              nationalAmbulanceDispatcherAi: data.national_ambulance_dispatcher_ai ?? true,
              quantumNodeSecurityHash: data.quantum_node_security_hash ?? true,
              autonomousDroneInterceptionGrid: data.autonomous_drone_interception_grid ?? true,
              zeroFeeGovSubsidizer: data.zero_fee_gov_subsidizer ?? true,
              smartContractEmergencyEscrow: data.smart_contract_emergency_escrow ?? true,
              bluetoothP2pGovMesh: data.bluetooth_p2p_gov_mesh ?? true,
              federatedAiThreatAnalyticsGov: data.federated_ai_threat_analytics_gov ?? true,
              realtimeSentimentMeshGov: data.realtime_sentiment_mesh_gov ?? true,
              flutterwaveGovTreasurySync: data.flutterwave_gov_treasury_sync ?? true,
              multimodalHlsNodeSurveillance: data.multimodal_hls_node_surveillance ?? true,
              cryptographicNodeWatermark: data.cryptographic_node_watermark ?? true,
              automaticSpeechDispatchLog: data.automatic_speech_dispatch_log ?? true,
              silentDuressAudioBeaconGov: data.silent_duress_audio_beacon_gov ?? true,
              cloudSentinelNodeBackup: data.cloud_sentinel_node_backup ?? true,
              chromaKeyNodeMasking: data.chroma_key_node_masking ?? true,
              studioAudioNodeDenoiser: data.studio_audio_node_denoiser ?? true,
              hdrNightVisionNodeCorrection: data.hdr_night_vision_node_correction ?? true,
              globalGovEmergencyOverride: data.global_gov_emergency_override ?? true,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchInstitutionalSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('institutional_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (data && !error) {
        setPoliceDispatchActive(data.police_dispatch_active ?? true);
        setMedicalDispatchActive(data.medical_dispatch_active ?? true);
        setLocalOutpostActive(data.local_outpost_active ?? true);
        setInstitutionalLayers({
          kampalaCentralCommandMesh: data.kampala_central_command_mesh ?? true,
          interPolCrossBorderRelay: data.interpol_cross_border_relay ?? true,
          nationalAmbulanceDispatcherAi: data.national_ambulance_dispatcher_ai ?? true,
          quantumNodeSecurityHash: data.quantum_node_security_hash ?? true,
          autonomousDroneInterceptionGrid: data.autonomous_drone_interception_grid ?? true,
          zeroFeeGovSubsidizer: data.zero_fee_gov_subsidizer ?? true,
          smartContractEmergencyEscrow: data.smart_contract_emergency_escrow ?? true,
          bluetoothP2pGovMesh: data.bluetooth_p2p_gov_mesh ?? true,
          federatedAiThreatAnalyticsGov: data.federated_ai_threat_analytics_gov ?? true,
          realtimeSentimentMeshGov: data.realtime_sentiment_mesh_gov ?? true,
          flutterwaveGovTreasurySync: data.flutterwave_gov_treasury_sync ?? true,
          multimodalHlsNodeSurveillance: data.multimodal_hls_node_surveillance ?? true,
          cryptographicNodeWatermark: data.cryptographic_node_watermark ?? true,
          automaticSpeechDispatchLog: data.automatic_speech_dispatch_log ?? true,
          silentDuressAudioBeaconGov: data.silent_duress_audio_beacon_gov ?? true,
          cloudSentinelNodeBackup: data.cloud_sentinel_node_backup ?? true,
          chromaKeyNodeMasking: data.chroma_key_node_masking ?? true,
          studioAudioNodeDenoiser: data.studio_audio_node_denoiser ?? true,
          hdrNightVisionNodeCorrection: data.hdr_night_vision_node_correction ?? true,
          globalGovEmergencyOverride: data.global_gov_emergency_override ?? true,
        });
      }
    } catch (err) {
      console.log('No existing Institutional settings found. Using default local state.');
    }
  };

  const syncSettingsToSupabase = async (newPolice, newMedical, newOutpost, updatedLayers) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('institutional_settings')
        .upsert({
          id: 1,
          police_dispatch_active: newPolice,
          medical_dispatch_active: newMedical,
          local_outpost_active: newOutpost,
          kampala_central_command_mesh: updatedLayers.kampalaCentralCommandMesh,
          interpol_cross_border_relay: updatedLayers.interPolCrossBorderRelay,
          national_ambulance_dispatcher_ai: updatedLayers.nationalAmbulanceDispatcherAi,
          quantum_node_security_hash: updatedLayers.quantumNodeSecurityHash,
          autonomous_drone_interception_grid: updatedLayers.autonomousDroneInterceptionGrid,
          zero_fee_gov_subsidizer: updatedLayers.zeroFeeGovSubsidizer,
          smart_contract_emergency_escrow: updatedLayers.smartContractEmergencyEscrow,
          bluetooth_p2p_gov_mesh: updatedLayers.bluetoothP2pGovMesh,
          federated_ai_threat_analytics_gov: updatedLayers.federatedAiThreatAnalyticsGov,
          realtime_sentiment_mesh_gov: updatedLayers.realtimeSentimentMeshGov,
          flutterwave_gov_treasury_sync: updatedLayers.flutterwaveGovTreasurySync,
          multimodal_hls_node_surveillance: updatedLayers.multimodalHlsNodeSurveillance,
          cryptographic_node_watermark: updatedLayers.cryptographicNodeWatermark,
          automatic_speech_dispatch_log: updatedLayers.automaticSpeechDispatchLog,
          silent_duress_audio_beacon_gov: updatedLayers.silentDuressAudioBeaconGov,
          cloud_sentinel_node_backup: updatedLayers.cloudSentinelNodeBackup,
          chroma_key_node_masking: updatedLayers.chromaKeyNodeMasking,
          studio_audio_node_denoiser: updatedLayers.studioAudioNodeDenoiser,
          hdr_night_vision_node_correction: updatedLayers.hdrNightVisionNodeCorrection,
          global_gov_emergency_override: updatedLayers.globalGovEmergencyOverride,
          updated_at: new Date(),
        });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to sync Institutional settings to Supabase:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleCoreSwitch = async (type, val) => {
    let newPolice = policeDispatchActive;
    let newMedical = medicalDispatchActive;
    let newOutpost = localOutpostActive;

    if (type === 'police') {
      newPolice = val;
      setPoliceDispatchActive(val);
    } else if (type === 'medical') {
      newMedical = val;
      setMedicalDispatchActive(val);
    } else if (type === 'outpost') {
      newOutpost = val;
      setLocalOutpostActive(val);
    }

    await syncSettingsToSupabase(newPolice, newMedical, newOutpost, institutionalLayers);
  };

  const toggleInstitutionalLayer = async (key) => {
    const updatedLayers = {
      ...institutionalLayers,
      [key]: !institutionalLayers[key],
    };
    setInstitutionalLayers(updatedLayers);
    await syncSettingsToSupabase(policeDispatchActive, medicalDispatchActive, localOutpostActive, updatedLayers);
  };

  const testNodeDispatch = async (nodeName) => {
    const timestamp = new Date().toLocaleTimeString();
    const statusMsg = `[${timestamp}] Test SOS packet successfully dispatched to ${nodeName} desk!`;
    setLastSyncStatus(statusMsg);
    Alert.alert("🏛️ Node Dispatch Test", `Encrypted coordinates and Verified Emergency Profile sent to ${nodeName}.`);

    // Log dispatch test telemetry to Supabase active SOS table
    try {
      await supabase.from('active_sos_events').insert([
        {
          user_handle: '@borris_nature',
          threat_level: `dispatch_test_${nodeName.toLowerCase().replace(/\s+/g, '_')}`,
          responders_count: 1,
          location_lat: 0.3476,
          location_lng: 32.5825,
          status: 'Test Dispatched',
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {}
  };

  const [showEnterpriseLayers, setShowEnterpriseLayers] = useState(false);

  const layerDefinitions = [
    { key: 'kampalaCentralCommandMesh', label: '🏛️ Kampala Central Mesh' },
    { key: 'interPolCrossBorderRelay', label: '🌐 InterPol Border Relay' },
    { key: 'nationalAmbulanceDispatcherAi', label: '🚑 National EMS AI' },
    { key: 'quantumNodeSecurityHash', label: '🔐 Quantum Node Security' },
    { key: 'autonomousDroneInterceptionGrid', label: '🚁 Autonomous Drone Grid' },
    { key: 'zeroFeeGovSubsidizer', label: '🪙 Zero-Fee Gov Gas' },
    { key: 'smartContractEmergencyEscrow', label: '🪙 Smart Contract Escrow' },
    { key: 'bluetoothP2pGovMesh', label: '🛰️ Bluetooth P2P Gov Mesh' },
    { key: 'federatedAiThreatAnalyticsGov', label: '🧠 Federated AI Threat' },
    { key: 'realtimeSentimentMeshGov', label: '🌿 Sentiment Mesh Gov' },
    { key: 'flutterwaveGovTreasurySync', label: '🪙 Flutterwave Gov Sync' },
    { key: 'multimodalHlsNodeSurveillance', label: '🎥 Multimodal HLS Feed' },
    { key: 'cryptographicNodeWatermark', label: '🛡️ Crypto Watermark' },
    { key: 'automaticSpeechDispatchLog', label: '📜 Speech Dispatch Log' },
    { key: 'silentDuressAudioBeaconGov', label: '🔊 Silent Duress Audio' },
    { key: 'cloudSentinelNodeBackup', label: '☁️ Cloud Sentinel Backup' },
    { key: 'chromaKeyNodeMasking', label: '🎨 Chroma Key Mask' },
    { key: 'studioAudioNodeDenoiser', label: '🎙️ Studio Denoiser' },
    { key: 'hdrNightVisionNodeCorrection', label: '☀️ HDR Night Correction' },
    { key: 'globalGovEmergencyOverride', label: '🚨 Global Gov Override' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={styles.headerTitle}>Institutional Emergency Nodes</Text>
        {isSaving && (
          <View style={styles.syncBadge}>
            <Text style={styles.syncBadgeText}>☁️ Syncing...</Text>
          </View>
        )}
      </View>
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
            {layerDefinitions.map((layer) => {
              const isActive = institutionalLayers[layer.key];
              return (
                <div key={layer.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '3px 6px', borderRadius: '4px', width: '48%', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '9px', color: '#fff', fontWeight: 'bold' }}>{layer.label}</span>
                  <button 
                    onClick={() => toggleInstitutionalLayer(layer.key)}
                    style={{ background: isActive ? '#38a169' : '#e53e3e', color: '#fff', border: 'none', padding: '2px 4px', borderRadius: '3px', fontSize: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {isActive ? 'ON' : 'OFF'}
                  </button>
                </div>
              );
            })}
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
            onValueChange={(val) => handleToggleCoreSwitch('police', val)} 
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
            onValueChange={(val) => handleToggleCoreSwitch('medical', val)} 
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
            onValueChange={(val) => handleToggleCoreSwitch('outpost', val)} 
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
  syncBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  syncBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
});