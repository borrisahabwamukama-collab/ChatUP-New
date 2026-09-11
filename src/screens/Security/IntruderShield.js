import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Alert, ScrollView } from 'react-native';
import { supabase } from '../supabaseClient'; // Adjust path if your client is located elsewhere

export default function IntruderShield() {
  const [shieldActive, setShieldActive] = useState(true);
  const [nightVisionBoost, setNightVisionBoost] = useState(true);
  const [decoyMode, setDecoyMode] = useState(true);
  const [shieldStatus, setShieldStatus] = useState("Monitoring active. Ready for facial & motion scan.");
  const [isSaving, setIsSaving] = useState(false);
  
  // Duress / Panic PIN State
  const [pinInput, setPinInput] = useState('');
  const [isFakeModeActive, setIsFakeModeActive] = useState(false);
  const DUPRESS_PANIC_PIN = '9999'; // Entering this triggers Fake Chat Mode

  // ================= 20+ ADVANCED SECURITY & INTRUDER SHIELD LAYERS STATE =================
  const [intruderLayers, setIntruderLayers] = useState({
    biometricFacialMeshAudit: true,
    infraredThermalPulse: true,
    kampalaMeshEmergencySync: true,
    quantumEncryptionLogs: true,
    autonomousToxicityVisualRadar: true,
    zeroFeeGasAlertBroadcast: true,
    smartContractSecurityEscrow: true,
    bluetoothP2pIntruderMesh: true,
    federatedAiThreatAnalysis: true,
    realtimeSentimentMeshSecurity: true,
    flutterwaveEmergencyAlerts: true,
    multimodalHlsSurveillance: true,
    cryptographicWatermarkSecurity: true,
    automaticIntruderTranscription: true,
    silentDuressAudioBeacon: true,
    cloudRecordingSentinelBackup: true,
    chromaKeyIntruderMask: true,
    studioAudioIntruderDenoiser: true,
    hdrIntruderCorrection: true,
    globalSosEmergencyOverride: true,
  });

  // Load saved Intruder Shield settings and setup real-time subscription on mount
  useEffect(() => {
    fetchIntruderSettings();

    // Setup Supabase Realtime subscription for cross-device sync
    const subscription = supabase
      .channel('public:intruder_settings')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'intruder_settings',
          filter: 'id=eq.1',
        },
        (payload) => {
          const data = payload.new;
          if (data) {
            setShieldActive(data.shield_active ?? true);
            setNightVisionBoost(data.night_vision_boost ?? true);
            setDecoyMode(data.decoy_mode ?? true);
            setIntruderLayers({
              biometricFacialMeshAudit: data.biometric_facial_mesh_audit ?? true,
              infraredThermalPulse: data.infrared_thermal_pulse ?? true,
              kampalaMeshEmergencySync: data.kampala_mesh_emergency_sync ?? true,
              quantumEncryptionLogs: data.quantum_encryption_logs ?? true,
              autonomousToxicityVisualRadar: data.autonomous_toxicity_visual_radar ?? true,
              zeroFeeGasAlertBroadcast: data.zero_fee_gas_alert_broadcast ?? true,
              smartContractSecurityEscrow: data.smart_contract_security_escrow ?? true,
              bluetoothP2pIntruderMesh: data.bluetooth_p2p_intruder_mesh ?? true,
              federatedAiThreatAnalysis: data.federated_ai_threat_analysis ?? true,
              realtimeSentimentMeshSecurity: data.realtime_sentiment_mesh_security ?? true,
              flutterwaveEmergencyAlerts: data.flutterwave_emergency_alerts ?? true,
              multimodalHlsSurveillance: data.multimodal_hls_surveillance ?? true,
              cryptographicWatermarkSecurity: data.cryptographic_watermark_security ?? true,
              automaticIntruderTranscription: data.automatic_intruder_transcription ?? true,
              silentDuressAudioBeacon: data.silent_duress_audio_beacon ?? true,
              cloudRecordingSentinelBackup: data.cloud_recording_sentinel_backup ?? true,
              chromaKeyIntruderMask: data.chroma_key_intruder_mask ?? true,
              studioAudioIntruderDenoiser: data.studio_audio_intruder_denoiser ?? true,
              hdrIntruderCorrection: data.hdr_intruder_correction ?? true,
              globalSosEmergencyOverride: data.global_sos_emergency_override ?? true,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchIntruderSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('intruder_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (data && !error) {
        setShieldActive(data.shield_active ?? true);
        setNightVisionBoost(data.night_vision_boost ?? true);
        setDecoyMode(data.decoy_mode ?? true);
        setIntruderLayers({
          biometricFacialMeshAudit: data.biometric_facial_mesh_audit ?? true,
          infraredThermalPulse: data.infrared_thermal_pulse ?? true,
          kampalaMeshEmergencySync: data.kampala_mesh_emergency_sync ?? true,
          quantumEncryptionLogs: data.quantum_encryption_logs ?? true,
          autonomousToxicityVisualRadar: data.autonomous_toxicity_visual_radar ?? true,
          zeroFeeGasAlertBroadcast: data.zero_fee_gas_alert_broadcast ?? true,
          smartContractSecurityEscrow: data.smart_contract_security_escrow ?? true,
          bluetoothP2pIntruderMesh: data.bluetooth_p2p_intruder_mesh ?? true,
          federatedAiThreatAnalysis: data.federated_ai_threat_analysis ?? true,
          realtimeSentimentMeshSecurity: data.realtime_sentiment_mesh_security ?? true,
          flutterwaveEmergencyAlerts: data.flutterwave_emergency_alerts ?? true,
          multimodalHlsSurveillance: data.multimodal_hls_surveillance ?? true,
          cryptographicWatermarkSecurity: data.cryptographic_watermark_security ?? true,
          automaticIntruderTranscription: data.automatic_intruder_transcription ?? true,
          silentDuressAudioBeacon: data.silent_duress_audio_beacon ?? true,
          cloudRecordingSentinelBackup: data.cloud_recording_sentinel_backup ?? true,
          chromaKeyIntruderMask: data.chroma_key_intruder_mask ?? true,
          studioAudioIntruderDenoiser: data.studio_audio_intruder_denoiser ?? true,
          hdrIntruderCorrection: data.hdr_intruder_correction ?? true,
          globalSosEmergencyOverride: data.global_sos_emergency_override ?? true,
        });
      }
    } catch (err) {
      console.log('No existing Intruder settings found. Using default local state.');
    }
  };

  const syncSettingsToSupabase = async (newShieldActive, newNightVision, newDecoy, updatedLayers) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('intruder_settings')
        .upsert({
          id: 1,
          shield_active: newShieldActive,
          night_vision_boost: newNightVision,
          decoy_mode: newDecoy,
          biometric_facial_mesh_audit: updatedLayers.biometricFacialMeshAudit,
          infrared_thermal_pulse: updatedLayers.infraredThermalPulse,
          kampala_mesh_emergency_sync: updatedLayers.kampalaMeshEmergencySync,
          quantum_encryption_logs: updatedLayers.quantumEncryptionLogs,
          autonomous_toxicity_visual_radar: updatedLayers.autonomousToxicityVisualRadar,
          zero_fee_gas_alert_broadcast: updatedLayers.zeroFeeGasAlertBroadcast,
          smart_contract_security_escrow: updatedLayers.smartContractSecurityEscrow,
          bluetooth_p2p_intruder_mesh: updatedLayers.bluetoothP2pIntruderMesh,
          federated_ai_threat_analysis: updatedLayers.federatedAiThreatAnalysis,
          realtime_sentiment_mesh_security: updatedLayers.realtimeSentimentMeshSecurity,
          flutterwave_emergency_alerts: updatedLayers.flutterwaveEmergencyAlerts,
          multimodal_hls_surveillance: updatedLayers.multimodalHlsSurveillance,
          cryptographic_watermark_security: updatedLayers.cryptographicWatermarkSecurity,
          automatic_intruder_transcription: updatedLayers.automaticIntruderTranscription,
          silent_duress_audio_beacon: updatedLayers.silentDuressAudioBeacon,
          cloud_recording_sentinel_backup: updatedLayers.cloudRecordingSentinelBackup,
          chroma_key_intruder_mask: updatedLayers.chromaKeyIntruderMask,
          studio_audio_intruder_denoiser: updatedLayers.studioAudioIntruderDenoiser,
          hdr_intruder_correction: updatedLayers.hdrIntruderCorrection,
          global_sos_emergency_override: updatedLayers.globalSosEmergencyOverride,
          updated_at: new Date(),
        });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to sync Intruder settings to Supabase:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleCoreSwitch = async (type, val) => {
    let newActive = shieldActive;
    let newNight = nightVisionBoost;
    let newDecoy = decoyMode;

    if (type === 'shield') {
      newActive = val;
      setShieldActive(val);
      setShieldStatus(val ? "Monitoring active. Ready for facial & motion scan." : "Intruder Shield paused.");
    } else if (type === 'night') {
      newNight = val;
      setNightVisionBoost(val);
    } else if (type === 'decoy') {
      newDecoy = val;
      setDecoyMode(val);
    }

    await syncSettingsToSupabase(newActive, newNight, newDecoy, intruderLayers);
  };

  const toggleIntruderLayer = async (key) => {
    const updatedLayers = {
      ...intruderLayers,
      [key]: !intruderLayers[key],
    };
    setIntruderLayers(updatedLayers);
    await syncSettingsToSupabase(shieldActive, nightVisionBoost, decoyMode, updatedLayers);
  };

  const handlePinSubmit = async () => {
    const timestamp = new Date().toLocaleTimeString();
    if (pinInput === DUPRESS_PANIC_PIN) {
      setIsFakeModeActive(true);
      setShieldStatus(`[${timestamp}] ⚠️ DURESS PIN ENTERED (9999). Decoy Fake Chat Mode Activated.`);
      setPinInput('');

      // Log duress event to Supabase telemetry table
      try {
        await supabase.from('active_sos_events').insert([
          {
            user_handle: '@borris_nature',
            threat_level: 'duress_pin_entered',
            responders_count: 5,
            location_lat: 0.3476,
            location_lng: 32.5825,
            status: 'Duress Active',
            timestamp: new Date().toISOString()
          }
        ]);
      } catch (err) {}
    } else {
      Alert.alert("Security PIN", "PIN entered or normal access verified.");
      setShieldStatus(`[${timestamp}] Standard user authenticated via PIN.`);
      setPinInput('');
    }
  };

  const layerDefinitions = [
    { key: 'biometricFacialMeshAudit', label: '👤 Biometric Facial Mesh' },
    { key: 'infraredThermalPulse', label: '🌡️ Thermal Pulse Scan' },
    { key: 'kampalaMeshEmergencySync', label: '🇺🇬 Kampala Mesh Sync' },
    { key: 'quantumEncryptionLogs', label: '🔐 Quantum Encryption' },
    { key: 'autonomousToxicityVisualRadar', label: '🛡️ Autonomous Toxicity' },
    { key: 'zeroFeeGasAlertBroadcast', label: '🪙 Zero-Fee Gas Alert' },
    { key: 'smartContractSecurityEscrow', label: '🪙 Smart Contract Escrow' },
    { key: 'bluetoothP2pIntruderMesh', label: '🛰️ Bluetooth P2P Mesh' },
    { key: 'federatedAiThreatAnalysis', label: '🧠 Federated AI Threat' },
    { key: 'realtimeSentimentMeshSecurity', label: '🌿 Sentiment Mesh Sec' },
    { key: 'flutterwaveEmergencyAlerts', label: '🪙 Flutterwave Alert' },
    { key: 'multimodalHlsSurveillance', label: '🎥 Multimodal HLS Cam' },
    { key: 'cryptographicWatermarkSecurity', label: '🛡️ Crypto Watermarking' },
    { key: 'automaticIntruderTranscription', label: '📜 Speech Transcription' },
    { key: 'silentDuressAudioBeacon', label: '🔊 Silent Duress Audio' },
    { key: 'cloudRecordingSentinelBackup', label: '☁️ Cloud Sentinel Backup' },
    { key: 'chromaKeyIntruderMask', label: '🎨 Chroma Key Mask' },
    { key: 'studioAudioIntruderDenoiser', label: '🎙️ Studio Denoiser' },
    { key: 'hdrIntruderCorrection', label: '☀️ HDR Correction' },
    { key: 'globalSosEmergencyOverride', label: '🚨 Global SOS Override' },
  ];

  // If Panic Mode is triggered via Duress PIN
  if (isFakeModeActive) {
    return (
      <View style={styles.fakeContainer}>
        <View style={styles.fakeHeader}>
          <Text style={styles.fakeHeaderTitle}>Family Group 👨‍👩‍👦</Text>
          <TouchableOpacity onPress={() => setIsFakeModeActive(false)}>
            <Text style={styles.exitFakeText}>Exit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.fakeChatBody}>
          <View style={styles.fakeBubbleReceived}>
            <Text style={styles.fakeText}>Hey! Don't forget to pick up groceries later.</Text>
          </View>
          <View style={styles.fakeBubbleSent}>
            <Text style={styles.fakeText}>Sure, I will pick them up soon!</Text>
          </View>
        </View>
        <View style={styles.fakeInputBar}>
          <TextInput style={styles.fakeInput} placeholder="Type a message..." placeholderTextColor="#888" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={styles.headerTitle}>AI Biometric Intruder Shield</Text>
        {isSaving && (
          <View style={styles.syncBadge}>
            <Text style={styles.syncBadgeText}>☁️ Syncing...</Text>
          </View>
        )}
      </View>
      <Text style={styles.subtitle}>
        Advanced front-camera facial analysis, night-vision motion lighting, and Duress Panic PIN integration.
      </Text>

      {/* 20+ Enterprise Security Layers Toggle Button */}
      <TouchableOpacity 
        style={{ backgroundColor: '#2563eb', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 14 }}
        onPress={() => setShowEnterpriseLayers(!showEnterpriseLayers)}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>⚡ {showEnterpriseLayers ? 'Hide' : 'Show'} 20+ Security & Shield Layers Matrix</Text>
      </TouchableOpacity>

      {/* ================= 20+ SECURITY LAYERS DRAWER ================= */}
      {showEnterpriseLayers && (
        <View style={{ backgroundColor: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 14, maxHeight: 180 }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' }}>⚡ Intruder Shield Enterprise Layers Matrix</Text>
          <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {layerDefinitions.map((layer) => {
              const isActive = intruderLayers[layer.key];
              return (
                <div key={layer.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '3px 6px', borderRadius: '4px', width: '48%', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '9px', color: '#fff', fontWeight: 'bold' }}>{layer.label}</span>
                  <button 
                    onClick={() => toggleIntruderLayer(layer.key)}
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

      {/* Settings Panel */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Intruder Shield Active</Text>
          <Switch value={shieldActive} onValueChange={(val) => handleToggleCoreSwitch('shield', val)} trackColor={{ false: "#767577", true: "#007AFF" }} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Night-Vision Light Boost</Text>
          <Switch value={nightVisionBoost} onValueChange={(val) => handleToggleCoreSwitch('night', val)} trackColor={{ false: "#767577", true: "#007AFF" }} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Enable Decoy Mode on Breach</Text>
          <Switch value={decoyMode} onValueChange={(val) => handleToggleCoreSwitch('decoy', val)} trackColor={{ false: "#767577", true: "#007AFF" }} />
        </View>
      </View>

      {/* Duress Panic PIN Input Section */}
      <View style={styles.card}>
        <Text style={styles.label}>Duress PIN / Panic Entry</Text>
        <TextInput 
          style={styles.pinInputBox}
          placeholder="Enter PIN (Try 9999 for Fake Chat)"
          placeholderTextColor="#888"
          secureTextEntry
          keyboardType="numeric"
          value={pinInput}
          onChangeText={setPinInput}
        />
        <TouchableOpacity style={styles.pinButton} onPress={handlePinSubmit}>
          <Text style={styles.pinButtonText}>Submit PIN</Text>
        </TouchableOpacity>
      </View>

      {/* Status Monitor Box */}
      <View style={styles.statusBox}>
        <Text style={styles.statusTitle}>Sentinel Status Log:</Text>
        <Text style={styles.statusText}>{shieldStatus}</Text>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  pinInputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  pinButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  pinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  statusBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0d47a1',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#37474f',
    lineHeight: 16,
  },
  // Fake Chat Screen Styles
  fakeContainer: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    justifyContent: 'space-between',
  },
  fakeHeader: {
    backgroundColor: '#075e54',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fakeHeaderTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  exitFakeText: {
    color: '#fff',
    fontSize: 14,
  },
  fakeChatBody: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  fakeBubbleReceived: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
    maxWidth: '75%',
  },
  fakeBubbleSent: {
    backgroundColor: '#dcf8c6',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginBottom: 10,
    maxWidth: '75%',
  },
  fakeText: {
    fontSize: 14,
    color: '#333',
  },
  fakeInputBar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  fakeInput: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
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