import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from '../../Services/supabaseClient';

export default function CameraHubScreen({ navigation }) {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [activeSource, setActiveSource] = useState('Device Primary');

  // ================= FULLY DYNAMIC BROADCAST LAYERS STATE =================
  const [broadcastLayers, setBroadcastLayers] = useState({
    ultraLowLatencyHls: true,
    aiAutoFramingActive: true,
    multicamSwitchingBuffer: true,
    adaptiveBitrateStream: true,
    quantumEncryptionStream: true,
    kampalaEdgeRelaySync: true,
    biometricWatermarkVideo: true,
    federatedAiEnhancement: true,
    bluetoothP2pVideoRelay: true,
    smartContractStreamEscrow: true,
    zeroFeeGasBroadcast: true,
    autonomousToxicityVisualGuard: true,
    realtimeSentimentOverlay: true,
    cloudRecordingBackup: true,
    chromaKeyBackgroundMask: true,
    studioAudioDenoiser: true,
    hdrColorCorrection: true,
    ptzCameraRemoteControl: true,
    teleprompterSync: true,
    globalEmergencyBroadcastOverride: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load saved layer configurations and setup real-time listener on mount
  useEffect(() => {
    fetchStreamSettings();

    // Setup Supabase Realtime subscription for cross-device sync
    const subscription = supabase
      .channel('public:stream_settings')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stream_settings',
          filter: 'id=eq.1',
        },
        (payload) => {
          const data = payload.new;
          if (data) {
            setBroadcastLayers({
              ultraLowLatencyHls: data.ultra_low_latency_hls ?? true,
              aiAutoFramingActive: data.ai_auto_framing_active ?? true,
              multicamSwitchingBuffer: data.multicam_switching_buffer ?? true,
              adaptiveBitrateStream: data.adaptive_bitrate_stream ?? true,
              quantumEncryptionStream: data.quantum_encryption_stream ?? true,
              kampalaEdgeRelaySync: data.kampala_edge_relay_sync ?? true,
              biometricWatermarkVideo: data.biometric_watermark_video ?? true,
              federatedAiEnhancement: data.federated_ai_enhancement ?? true,
              bluetoothP2pVideoRelay: data.bluetooth_p2p_video_relay ?? true,
              smartContractStreamEscrow: data.smart_contract_stream_escrow ?? true,
              zeroFeeGasBroadcast: data.zero_fee_gas_broadcast ?? true,
              autonomousToxicityVisualGuard: data.autonomous_toxicity_visual_guard ?? true,
              realtimeSentimentOverlay: data.realtime_sentiment_overlay ?? true,
              cloudRecordingBackup: data.cloud_recording_backup ?? true,
              chromaKeyBackgroundMask: data.chroma_key_background_mask ?? true,
              studioAudioDenoiser: data.studio_audio_denoiser ?? true,
              hdrColorCorrection: data.hdr_color_correction ?? true,
              ptzCameraRemoteControl: data.ptz_camera_remote_control ?? true,
              teleprompterSync: data.teleprompter_sync ?? true,
              globalEmergencyBroadcastOverride: data.global_emergency_broadcast_override ?? true,
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchStreamSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('stream_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (data && !error) {
        setBroadcastLayers({
          ultraLowLatencyHls: data.ultra_low_latency_hls ?? true,
          aiAutoFramingActive: data.ai_auto_framing_active ?? true,
          multicamSwitchingBuffer: data.multicam_switching_buffer ?? true,
          adaptiveBitrateStream: data.adaptive_bitrate_stream ?? true,
          quantumEncryptionStream: data.quantum_encryption_stream ?? true,
          kampalaEdgeRelaySync: data.kampala_edge_relay_sync ?? true,
          biometricWatermarkVideo: data.biometric_watermark_video ?? true,
          federatedAiEnhancement: data.federated_ai_enhancement ?? true,
          bluetoothP2pVideoRelay: data.bluetooth_p2p_video_relay ?? true,
          smartContractStreamEscrow: data.smart_contract_stream_escrow ?? true,
          zeroFeeGasBroadcast: data.zero_fee_gas_broadcast ?? true,
          autonomousToxicityVisualGuard: data.autonomous_toxicity_visual_guard ?? true,
          realtimeSentimentOverlay: data.realtime_sentiment_overlay ?? true,
          cloudRecordingBackup: data.cloud_recording_backup ?? true,
          chromaKeyBackgroundMask: data.chroma_key_background_mask ?? true,
          studioAudioDenoiser: data.studio_audio_denoiser ?? true,
          hdrColorCorrection: data.hdr_color_correction ?? true,
          ptzCameraRemoteControl: data.ptz_camera_remote_control ?? true,
          teleprompterSync: data.teleprompter_sync ?? true,
          globalEmergencyBroadcastOverride: data.global_emergency_broadcast_override ?? true,
        });
      }
    } catch (err) {
      console.log('No existing remote settings found or table offline. Using default local state.');
    }
  };

  const toggleLayer = async (key) => {
    const updatedLayers = {
      ...broadcastLayers,
      [key]: !broadcastLayers[key],
    };
    setBroadcastLayers(updatedLayers);

    // Dynamically sync changes back to Supabase in the background
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('stream_settings')
        .upsert({
          id: 1,
          ultra_low_latency_hls: updatedLayers.ultraLowLatencyHls,
          ai_auto_framing_active: updatedLayers.aiAutoFramingActive,
          multicam_switching_buffer: updatedLayers.multicamSwitchingBuffer,
          adaptive_bitrate_stream: updatedLayers.adaptiveBitrateStream,
          quantum_encryption_stream: updatedLayers.quantumEncryptionStream,
          kampala_edge_relay_sync: updatedLayers.kampalaEdgeRelaySync,
          biometric_watermark_video: updatedLayers.biometricWatermarkVideo,
          federated_ai_enhancement: updatedLayers.federatedAiEnhancement,
          bluetooth_p2p_video_relay: updatedLayers.bluetoothP2pVideoRelay,
          smart_contract_stream_escrow: updatedLayers.smartContractStreamEscrow,
          zero_fee_gas_broadcast: updatedLayers.zeroFeeGasBroadcast,
          autonomous_toxicity_visual_guard: updatedLayers.autonomousToxicityVisualGuard,
          realtime_sentiment_overlay: updatedLayers.realtimeSentimentOverlay,
          cloud_recording_backup: updatedLayers.cloudRecordingBackup,
          chroma_key_background_mask: updatedLayers.chromaKeyBackgroundMask,
          studio_audio_denoiser: updatedLayers.studioAudioDenoiser,
          hdr_color_correction: updatedLayers.hdrColorCorrection,
          ptz_camera_remote_control: updatedLayers.ptzCameraRemoteControl,
          teleprompter_sync: updatedLayers.teleprompterSync,
          global_emergency_broadcast_override: updatedLayers.globalEmergencyBroadcastOverride,
          updated_at: new Date(),
        });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to sync layer update to Supabase:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!permission) {
    return <View style={styles.container}><Text style={styles.text}>Loading camera permissions...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to access the camera for live streaming and fellowship recording.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const handleSelectExternalCamera = (sourceName) => {
    setActiveSource(sourceName);
    Alert.alert('Camera Source Switched 🎥', `Now routing feed from: ${sourceName}`);
  };

  const layerDefinitions = [
    { key: 'ultraLowLatencyHls', label: '📡 Ultra-Low HLS' },
    { key: 'aiAutoFramingActive', label: '🤖 AI Auto-Framing' },
    { key: 'multicamSwitchingBuffer', label: '🔄 Buffer Sync' },
    { key: 'adaptiveBitrateStream', label: '⚡ Adaptive Bitrate' },
    { key: 'quantumEncryptionStream', label: '🔐 Quantum Stream' },
    { key: 'kampalaEdgeRelaySync', label: '🇺🇬 Kampala Edge' },
    { key: 'biometricWatermarkVideo', label: '✍️ Biometric WM' },
    { key: 'federatedAiEnhancement', label: '🧠 Federated AI' },
    { key: 'bluetoothP2pVideoRelay', label: '🛰️ Bluetooth P2P' },
    { key: 'smartContractStreamEscrow', label: '🪙 Stream Escrow' },
    { key: 'zeroFeeGasBroadcast', label: '🪙 Zero-Fee Gas' },
    { key: 'autonomousToxicityVisualGuard', label: '🛡️ Toxicity Guard' },
    { key: 'realtimeSentimentOverlay', label: '🌿 Sentiment Mesh' },
    { key: 'cloudRecordingBackup', label: '☁️ Cloud Backup' },
    { key: 'chromaKeyBackgroundMask', label: '🎨 Chroma Key' },
    { key: 'studioAudioDenoiser', label: '🎙️ Audio Denoiser' },
    { key: 'hdrColorCorrection', label: '☀️ HDR Correction' },
    { key: 'ptzCameraRemoteControl', label: '🎛️ PTZ Remote' },
    { key: 'teleprompterSync', label: '📜 Teleprompter' },
    { key: 'globalEmergencyBroadcastOverride', label: '🚨 SOS Override' },
  ];

  return (
    <View style={styles.container}>
      {/* Live Camera Feed Container */}
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.overlayTop}>
          <View style={styles.sourceBadge}>
            <Text style={styles.sourceBadgeText}>🔴 ACTIVE: {activeSource}</Text>
          </View>
          {isSaving && (
            <View style={styles.syncBadge}>
              <Text style={styles.syncBadgeText}>☁️ Syncing...</Text>
            </View>
          )}
        </View>

        {/* ================= DYNAMIC REACT NATIVE BROADCAST MATRIX ================= */}
        <View style={styles.matrixContainer}>
          <Text style={styles.matrixTitle}>⚡ 20+ Broadcast & Camera Enterprise Layers Matrix</Text>
          <ScrollView contentContainerStyle={styles.matrixGrid} nestedScrollEnabled={true}>
            {layerDefinitions.map((item) => {
              const isActive = broadcastLayers[item.key];
              return (
                <View key={item.key} style={styles.matrixCard}>
                  <Text style={styles.matrixLabel}>{item.label}</Text>
                  <TouchableOpacity 
                    style={[styles.matrixButton, isActive ? styles.btnActive : styles.btnInactive]}
                    onPress={() => toggleLayer(item.key)}
                  >
                    <Text style={styles.matrixButtonText}>{isActive ? 'ON' : 'OFF'}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.overlayBottom}>
          {/* Switch Device Camera (Front/Back) */}
          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
            <Text style={styles.controlText}>🔄 Flip Camera</Text>
          </TouchableOpacity>

          {/* External / Multi-Camera Switcher Options */}
          <View style={styles.multiCamRow}>
            <TouchableOpacity 
              style={[styles.miniCamBtn, activeSource === 'Device Primary' && styles.activeMiniBtn]}
              onPress={() => handleSelectExternalCamera('Device Primary')}
            >
              <Text style={styles.miniCamText}>Phone Cam</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.miniCamBtn, activeSource === 'Sanctuary Main HD' && styles.activeMiniBtn]}
              onPress={() => handleSelectExternalCamera('Sanctuary Main HD')}
            >
              <Text style={styles.miniCamText}>Alt Feed 1</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.miniCamBtn, activeSource === 'Choir Stage Cam' && styles.activeMiniBtn]}
              onPress={() => handleSelectExternalCamera('Choir Stage Cam')}
            >
              <Text style={styles.miniCamText}>Alt Feed 2</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 16,
    color: '#ffffff',
    fontSize: 14,
    paddingHorizontal: 20,
  },
  btn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  text: {
    color: '#ffffff',
  },
  overlayTop: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  sourceBadge: {
    backgroundColor: 'rgba(220, 38, 38, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sourceBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
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
  matrixContainer: {
    position: 'absolute',
    top: 80,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 8,
    padding: 8,
    zIndex: 100,
    borderWidth: 1,
    borderColor: '#4a5568',
    maxHeight: 190,
  },
  matrixTitle: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  matrixGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  matrixCard: {
    width: '31%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  matrixLabel: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
    marginRight: 2,
  },
  matrixButton: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  btnActive: {
    backgroundColor: '#38a169',
  },
  btnInactive: {
    backgroundColor: '#e53e3e',
  },
  matrixButtonText: {
    color: '#fff',
    fontSize: 7,
    fontWeight: 'bold',
  },
  overlayBottom: {
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  controlText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  multiCamRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  miniCamBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  activeMiniBtn: {
    backgroundColor: '#16a34a',
  },
  miniCamText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
});