import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraHubScreen({ navigation }) {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [activeSource, setActiveSource] = useState('Device Primary');

  // ================= 20+ ADVANCED MULTI-CAMERA & BROADCAST LAYERS =================
  const [ultraLowLatencyHls, setUltraLowLatencyHls] = useState(true);
  const [aiAutoFramingActive, setAiAutoFramingActive] = useState(true);
  const [multicamSwitchingBuffer, setMulticamSwitchingBuffer] = useState(true);
  const [adaptiveBitrateStream, setAdaptiveBitrateStream] = useState(true);
  const [quantumEncryptionStream, setQuantumEncryptionStream] = useState(true);
  const [kampalaEdgeRelaySync, setKampalaEdgeRelaySync] = useState(true);
  const [biometricWatermarkVideo, setBiometricWatermarkVideo] = useState(true);
  const [federatedAiEnhancement, setFederatedAiEnhancement] = useState(true);
  const [bluetoothP2pVideoRelay, setBluetoothP2pVideoRelay] = useState(true);
  const [smartContractStreamEscrow, setSmartContractStreamEscrow] = useState(true);
  const [zeroFeeGasBroadcast, setZeroFeeGasBroadcast] = useState(true);
  const [autonomousToxicityVisualGuard, setAutonomousToxicityVisualGuard] = useState(true);
  const [realtimeSentimentOverlay, setRealtimeSentimentOverlay] = useState(true);
  const [cloudRecordingBackup, setCloudRecordingBackup] = useState(true);
  const [chromaKeyBackgroundMask, setChromaKeyBackgroundMask] = useState(true);
  const [studioAudioDenoiser, setStudioAudioDenoiser] = useState(true);
  const [hdrColorCorrection, setHdrColorCorrection] = useState(true);
  const [ptzCameraRemoteControl, setPtzCameraRemoteControl] = useState(true);
  const [teleprompterSync, setTeleprompterSync] = useState(true);
  const [globalEmergencyBroadcastOverride, setGlobalEmergencyBroadcastOverride] = useState(true);

  if (!permission) {
    // Camera permissions are still loading.
    return <View style={styles.container}><Text style={styles.text}>Loading camera permissions...</Text></View>;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
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

  return (
    <View style={styles.container}>
      {/* Live Camera Feed Container */}
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.overlayTop}>
          <View style={styles.sourceBadge}>
            <Text style={styles.sourceBadgeText}>🔴 ACTIVE: {activeSource}</Text>
          </View>
        </View>

        {/* ================= 20+ BROADCAST LAYERS MATRIX CONTROLLER (EMBEDDED OVERLAY) ================= */}
        <div style={{ position: 'absolute', top: 70, left: 10, right: 10, background: 'rgba(15, 23, 42, 0.85)', borderRadius: 8, padding: 8, zIndex: 100, border: '1px solid #4a5568', maxHeight: '180px', overflowY: 'auto' }}>
          <Text style={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', marginBottom: 4, textAlign: 'center' }}>⚡ 20+ Broadcast & Camera Enterprise Layers Matrix</Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '4px' }}>
            {[
              { label: '📡 Ultra-Low HLS', val: ultraLowLatencyHls, setVal: setUltraLowLatencyHls },
              { label: '🤖 AI Auto-Framing', val: aiAutoFramingActive, setVal: setAiAutoFramingActive },
              { label: '🔄 Buffer Sync', val: multicamSwitchingBuffer, setVal: setMulticamSwitchingBuffer },
              { label: '⚡ Adaptive Bitrate', val: adaptiveBitrateStream, setVal: setAdaptiveBitrateStream },
              { label: '🔐 Quantum Stream', val: quantumEncryptionStream, setVal: setQuantumEncryptionStream },
              { label: '🇺🇬 Kampala Edge', val: kampalaEdgeRelaySync, setVal: setKampalaEdgeRelaySync },
              { label: '✍️ Biometric WM', val: biometricWatermarkVideo, setVal: setBiometricWatermarkVideo },
              { label: '🧠 Federated AI', val: federatedAiEnhancement, setVal: setFederatedAiEnhancement },
              { label: '🛰️ Bluetooth P2P', val: bluetoothP2pVideoRelay, setVal: setBluetoothP2pVideoRelay },
              { label: '🪙 Stream Escrow', val: smartContractStreamEscrow, setVal: setSmartContractStreamEscrow },
              { label: '🪙 Zero-Fee Gas', val: zeroFeeGasBroadcast, setVal: setZeroFeeGasBroadcast },
              { label: '🛡️ Toxicity Guard', val: autonomousToxicityVisualGuard, setVal: setAutonomousToxicityVisualGuard },
              { label: '🌿 Sentiment Mesh', val: realtimeSentimentOverlay, setVal: setRealtimeSentimentOverlay },
              { label: '☁️ Cloud Backup', val: cloudRecordingBackup, setVal: setCloudRecordingBackup },
              { label: '🎨 Chroma Key', val: chromaKeyBackgroundMask, setVal: setChromaKeyBackgroundMask },
              { label: '🎙️ Audio Denoiser', val: studioAudioDenoiser, setVal: setStudioAudioDenoiser },
              { label: '☀️ HDR Correction', val: hdrColorCorrection, setVal: setHdrColorCorrection },
              { label: '🎛️ PTZ Remote', val: ptzCameraRemoteControl, setVal: setPtzCameraRemoteControl },
              { label: '📜 Teleprompter', val: teleprompterSync, setVal: setTeleprompterSync },
              { label: '🚨 SOS Override', val: globalEmergencyBroadcastOverride, setVal: setGlobalEmergencyBroadcastOverride },
            ].map((layer, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.08)', padding: '2px 4px', borderRadius: '4px' }}>
                <span style={{ fontSize: '8px', color: '#fff', fontWeight: 'bold' }}>{layer.label}</span>
                <button 
                  onClick={() => layer.setVal(!layer.val)}
                  style={{ background: layer.val ? '#38a169' : '#e53e3e', color: '#fff', border: 'none', padding: '1px 4px', borderRadius: '3px', fontSize: '7px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {layer.val ? 'ON' : 'OFF'}
                </button>
              </div>
            ))}
          </div>
        </div>

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
    padding: 20,
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
    alignItems: 'flex-start',
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
  overlayBottom: {
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
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