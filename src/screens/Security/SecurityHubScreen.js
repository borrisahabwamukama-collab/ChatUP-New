import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { supabase } from '../../supabaseClient';
import IntruderShield from './IntruderShield';
import NeighborhoodSOSScreen from './NeighborhoodSOSScreen';
import InstitutionalNodeScreen from './InstitutionalNodeScreen';

export default function SecurityHubScreen({ isDarkMode }) {
  const [activeSubScreen, setActiveSubScreen] = useState(null);
  const [showEnterpriseLayers, setShowEnterpriseLayers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ================= 20+ SECURITY HUB & ARCHITECTURE LAYERS STATE =================
  const [securityLayers, setSecurityLayers] = useState({
    globalSentinelMeshActive: true,
    biometricZeroTrustAudit: true,
    kampalaRegionalSecuritySync: true,
    quantumEncryptionShieldHub: true,
    autonomousToxicityDefenseGrid: true,
    zeroFeeGasSecurityRelay: true,
    smartContractAuditEscrow: true,
    bluetoothP2pSecurityMesh: true,
    federatedAiThreatModel: true,
    realtimeSentimentMeshSecurityHub: true,
    flutterwaveSecurityTreasury: true,
    multimodalHlsSecurityStream: true,
    cryptographicSecurityWatermark: true,
    automaticSecurityTranscription: true,
    silentDuressAudioBeaconHub: true,
    cloudSentinelHubBackup: true,
    chromaKeySecurityMask: true,
    studioAudioSecurityDenoiser: true,
    hdrSecurityNightCorrection: true,
    globalSecurityEmergencyOverride: true,
  });

  // Load saved security layer settings and setup real-time subscription on mount
  useEffect(() => {
    fetchSecuritySettings();

    // Setup Supabase Realtime subscription for cross-device sync
    const subscription = supabase
      .channel('public:security_settings')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'security_settings',
          filter: 'id=eq.1',
        },
        (payload) => {
          const data = payload.new;
          if (data) {
            setSecurityLayers({
              globalSentinelMeshActive: data.global_sentinel_mesh_active ?? true,
              biometricZeroTrustAudit: data.biometric_zero_trust_audit ?? true,
              kampalaRegionalSecuritySync: data.kampala_regional_security_sync ?? true,
              quantumEncryptionShieldHub: data.quantum_encryption_shield_hub ?? true,
              autonomousToxicityDefenseGrid: data.autonomous_toxicity_defense_grid ?? true,
              zeroFeeGasSecurityRelay: data.zero_fee_gas_security_relay ?? true,
              smartContractAuditEscrow: data.smart_contract_audit_escrow ?? true,
              bluetoothP2pSecurityMesh: data.bluetooth_p2p_security_mesh ?? true,
              federatedAiThreatModel: data.federated_ai_threat_model ?? true,
              realtimeSentimentMeshSecurityHub: data.realtime_sentiment_mesh_security_hub ?? true,
              flutterwaveSecurityTreasury: data.flutterwave_security_treasury ?? true,
              multimodalHlsSecurityStream: data.multimodal_hls_security_stream ?? true,
              cryptographicSecurityWatermark: data.cryptographic_security_watermark ?? true,
              automaticSecurityTranscription: data.automatic_security_transcription ?? true,
              silentDuressAudioBeaconHub: data.silent_duress_audio_beacon_hub ?? true,
              cloudSentinelHubBackup: data.cloud_sentinel_hub_backup ?? true,
              chromaKeySecurityMask: data.chroma_key_security_mask ?? true,
              studioAudioSecurityDenoiser: data.studio_audio_security_denoiser ?? true,
              hdrSecurityNightCorrection: data.hdr_security_night_correction ?? true,
              globalSecurityEmergencyOverride: data.global_security_emergency_override ?? true,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchSecuritySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (data && !error) {
        setSecurityLayers({
          globalSentinelMeshActive: data.global_sentinel_mesh_active ?? true,
          biometricZeroTrustAudit: data.biometric_zero_trust_audit ?? true,
          kampalaRegionalSecuritySync: data.kampala_regional_security_sync ?? true,
          quantumEncryptionShieldHub: data.quantum_encryption_shield_hub ?? true,
          autonomousToxicityDefenseGrid: data.autonomous_toxicity_defense_grid ?? true,
          zeroFeeGasSecurityRelay: data.zero_fee_gas_security_relay ?? true,
          smartContractAuditEscrow: data.smart_contract_audit_escrow ?? true,
          bluetoothP2pSecurityMesh: data.bluetooth_p2p_security_mesh ?? true,
          federatedAiThreatModel: data.federated_ai_threat_model ?? true,
          realtimeSentimentMeshSecurityHub: data.realtime_sentiment_mesh_security_hub ?? true,
          flutterwaveSecurityTreasury: data.flutterwave_security_treasury ?? true,
          multimodalHlsSecurityStream: data.multimodal_hls_security_stream ?? true,
          cryptographicSecurityWatermark: data.cryptographic_security_watermark ?? true,
          automaticSecurityTranscription: data.automatic_security_transcription ?? true,
          silentDuressAudioBeaconHub: data.silent_duress_audio_beacon_hub ?? true,
          cloudSentinelHubBackup: data.cloud_sentinel_hub_backup ?? true,
          chromaKeySecurityMask: data.chroma_key_security_mask ?? true,
          studioAudioSecurityDenoiser: data.studio_audio_security_denoiser ?? true,
          hdrSecurityNightCorrection: data.hdr_security_night_correction ?? true,
          globalSecurityEmergencyOverride: data.global_security_emergency_override ?? true,
        });
      }
    } catch (err) {
      console.log('No existing security settings found. Using default local state.');
    }
  };

  const toggleSecurityLayer = async (key) => {
    const updatedLayers = {
      ...securityLayers,
      [key]: !securityLayers[key],
    };
    setSecurityLayers(updatedLayers);

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('security_settings')
        .upsert({
          id: 1,
          global_sentinel_mesh_active: updatedLayers.globalSentinelMeshActive,
          biometric_zero_trust_audit: updatedLayers.biometricZeroTrustAudit,
          kampala_regional_security_sync: updatedLayers.kampalaRegionalSecuritySync,
          quantum_encryption_shield_hub: updatedLayers.quantumEncryptionShieldHub,
          autonomous_toxicity_defense_grid: updatedLayers.autonomousToxicityDefenseGrid,
          zero_fee_gas_security_relay: updatedLayers.zeroFeeGasSecurityRelay,
          smart_contract_audit_escrow: updatedLayers.smartContractAuditEscrow,
          bluetooth_p2p_security_mesh: updatedLayers.bluetoothP2pSecurityMesh,
          federated_ai_threat_model: updatedLayers.federatedAiThreatModel,
          realtime_sentiment_mesh_security_hub: updatedLayers.realtimeSentimentMeshSecurityHub,
          flutterwave_security_treasury: updatedLayers.flutterwaveSecurityTreasury,
          multimodal_hls_security_stream: updatedLayers.multimodalHlsSecurityStream,
          cryptographic_security_watermark: updatedLayers.cryptographicSecurityWatermark,
          automatic_security_transcription: updatedLayers.automaticSecurityTranscription,
          silent_duress_audio_beacon_hub: updatedLayers.silentDuressAudioBeaconHub,
          cloud_sentinel_hub_backup: updatedLayers.cloudSentinelHubBackup,
          chroma_key_security_mask: updatedLayers.chromaKeySecurityMask,
          studio_audio_security_denoiser: updatedLayers.studioAudioSecurityDenoiser,
          hdr_security_night_correction: updatedLayers.hdrSecurityNightCorrection,
          global_security_emergency_override: updatedLayers.globalSecurityEmergencyOverride,
          updated_at: new Date(),
        });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to sync security layer update to Supabase:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

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

  const layerDefinitions = [
    { key: 'globalSentinelMeshActive', label: '🛡️ Global Sentinel Mesh' },
    { key: 'biometricZeroTrustAudit', label: '👤 Biometric Zero-Trust' },
    { key: 'kampalaRegionalSecuritySync', label: '🇺🇬 Kampala Regional Sync' },
    { key: 'quantumEncryptionShieldHub', label: '🔐 Quantum Encryption' },
    { key: 'autonomousToxicityDefenseGrid', label: '🤖 Autonomous Defense' },
    { key: 'zeroFeeGasSecurityRelay', label: '🪙 Zero-Fee Gas Relay' },
    { key: 'smartContractAuditEscrow', label: '🪙 Smart Contract Escrow' },
    { key: 'bluetoothP2pSecurityMesh', label: '🛰️ Bluetooth P2P Mesh' },
    { key: 'federatedAiThreatModel', label: '🧠 Federated AI Threat' },
    { key: 'realtimeSentimentMeshSecurityHub', label: '🌿 Sentiment Mesh Hub' },
    { key: 'flutterwaveSecurityTreasury', label: '🪙 Flutterwave Treasury' },
    { key: 'multimodalHlsSecurityStream', label: '🎥 Multimodal HLS Stream' },
    { key: 'cryptographicSecurityWatermark', label: '🛡️ Crypto Watermarking' },
    { key: 'automaticSecurityTranscription', label: '📜 Speech Transcription' },
    { key: 'silentDuressAudioBeaconHub', label: '🔊 Silent Duress Audio' },
    { key: 'cloudSentinelHubBackup', label: '☁️ Cloud Sentinel Backup' },
    { key: 'chromaKeySecurityMask', label: '🎨 Chroma Key Mask' },
    { key: 'studioAudioSecurityDenoiser', label: '🎙️ Studio Denoiser' },
    { key: 'hdrSecurityNightCorrection', label: '☀️ HDR Night Correction' },
    { key: 'globalSecurityEmergencyOverride', label: '🚨 Global SOS Override' },
  ];

  return (
    <ScrollView contentContainerStyle={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>🛡️ ChatUP Security Center</Text>
        {isSaving && (
          <View style={styles.syncBadge}>
            <Text style={styles.syncBadgeText}>☁️ Syncing...</Text>
          </View>
        )}
      </View>
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
        <View style={{ backgroundColor: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 16 }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>⚡ Security Hub Enterprise Layers Matrix</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {layerDefinitions.map((layer) => {
              const isActive = securityLayers[layer.key];
              return (
                <View key={layer.key} style={styles.layerItem}>
                  <Text style={styles.layerLabel} numberOfLines={1}>{layer.label}</Text>
                  <Switch
                    value={isActive}
                    onValueChange={() => toggleSecurityLayer(layer.key)}
                    trackColor={{ false: '#e53e3e', true: '#38a169' }}
                    thumbColor="#fff"
                    style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                  />
                </View>
              );
            })}
          </View>
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
  layerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    width: '48%',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  layerLabel: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
    marginRight: 4,
  },
});